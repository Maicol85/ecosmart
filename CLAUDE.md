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
| **Tocar la GRILLA del Doppler mitral**: el orden de los 16 campos —**las columnas 2 y 3 están intercambiadas desde el Y3f2**—, el Tab por columnas, los puntos de corte o el selector del S/D | `docs/mapa/doppler-mitral-grilla.md` |
| **Tocar el BORRADO de una lesión valvular**: el retiro del grado, quién prendió una pastilla, los dos métodos de la IM, la continuidad de la IT, el grado de cada fila o **la salida temprana de `calcTHP`** | `docs/mapa/valvulas-borrado.md` |
| **Tocar la PANTALLA de las dos lesiones MITRALES**: las tres columnas de la insuficiencia, las casillas automáticas, el cuadro de referencias en tres bloques, la columna 2 de la estenosis, el mecanismo de los globos ⓘ o **el aviso de fibrilación auricular de la continuidad** | `docs/mapa/valvulas-mitral-pantalla.md` |
| **Tocar la PANTALLA de las insuficiencias AÓRTICA o TRICUSPÍDEA**: sus columnas, las cinco casillas automáticas, las once tarjetas ⓘ, el rótulo THP o el color de los avisos | `docs/mapa/valvulas-ia-it-pantalla.md` |
| **Tocar un criterio de PRÓTESIS mitral o aórtica**: la Tabla 11, el AEO en tres tramos, el THP directo, el PPM de la Tabla 7, el badge del AVA aórtico, las tarjetas nativa-prótesis o el rótulo AEO | `docs/mapa/protesis-valvular.md` |
| **Tocar el PPM aórtico del informe, el voto de los cuatro criterios de obstrucción de la prótesis mitral o los dos retiros del gradiente medio** (tandas Z, Z5 y Z6) | `docs/mapa/protesis-z-z5-z6.md` |
| **Tocar la FUGA PARAVALVULAR de una prótesis QUIRÚRGICA**, aórtica o mitral: el motor único, los tres campos nuevos, la marca de origen o por qué la mitral no ofrece extensión circunferencial | `docs/mapa/protesis-fuga-pvl.md` |
| **Buscar un CORTE o una BANDA de plausibilidad** de cualquier válvula, con su fuente | `docs/mapa/valvulas-constantes.md` |
| **Tocar la MARCA DE MANUAL de una pastilla, el selector binario de la estenosis mitral, el VIOLETA de «Significativa», el VTI de entrada tricuspídeo, la CASILLA DE PISA de «Incluir en el informe» o lo que «Nuevo estudio» deja vivo** | `docs/mapa/valvulas-manual-binario.md` |
| **Tocar una AORTOPATÍA —Marfan, Loeys-Dietz, Turner, ACTA2, Ehlers-Danlos vascular—, la COARTACIÓN, el texto de la VAB o el MOTOR DE EVIDENCIA DE AORTA**: la tabla y el folio de cada síndrome, el corte de dilatación con su dueño, el cuestionario o las recomendaciones por debajo de 45 mm | `docs/mapa/aorta-aortopatias-evidencia.md` |
| **Tocar un CORTE o un OPERADOR del VD, de la AD, de la VCI o de la RAÍZ AÓRTICA**: la Tabla 1 de la ASE 2025, su evaluador, los cuatro grados de cada parámetro o el «40 mm o más» del seno | `docs/mapa/corazon-derecho-ase2025.md` |
| **Tocar algo de la tanda AJ1**: los cortes del VD de la versión de MAYO, el strain de pared libre sin sexo, la coartación reparada, el índice de dimensión aórtica, el Ehlers-Danlos del EN SUMA, el corte alternativo de la IM secundaria o el flujo reverso de la aorta descendente | `docs/mapa/aj1-ajustes.md` |
| **Tocar el VENTRÍCULO DERECHO**: sus TRES columnas de campos, el orden del cuadro de referencias, la disfunción sistólica, la pared graduada, el Tei, la FEVD, la relación VD/VI o el Qp | `docs/mapa/vd-derecho.md` |
| **Tocar la casilla de la FAC, la mudanza del DIÁMETRO DE LA ARTERIA PULMONAR o el selector de VD/VI** (la tanda G3, partida a archivo propio) | `docs/mapa/vd-g3-campos.md` |
| **Tocar una TARJETA ⓘ de AD/VCI, del VD o de la AORTA, el NOMOGRAMA de los senos de Valsalva, o sus entradas de Referencias** | `docs/mapa/evidencia-derecho-aorta.md` |
| **Tocar el cociente TAPSE/PSAP o el color del aviso del Tei** (el DIÁMETRO DE LA ARTERIA PULMONAR se mudó al VD en el G3) | `docs/mapa/tapse-psap-ap.md` |
| **Tocar la RELACIÓN VD/VI**: el campo numérico, el selector de tramo, las cuatro reglas que los sincronizan, la función dueña o cualquiera de sus CUATRO lectores | `docs/mapa/vd-vi-selector.md` |
| **Tocar la pestaña REFERENCIAS**: las cinco subpestañas y su reparto, el buscador, el botón «Ver referencia» de las tarjetas ⓘ o la TABLA DE CIRUGÍA AÓRTICA | `docs/mapa/referencias-subpestanas.md` |
| **Tocar el panel de Evidencia: agregar una cita, una sección o un sub-bloque** | `docs/mapa/panel-evidencia.md` |
| **Agregar un TÉRMINO al glosario del panel (el ⓘ con tarjeta)** | `docs/mapa/panel-evidencia-terminos.md` |
| **Tocar la TABLA DE SIGNOS de HTP, la compuerta del informe con la VRT «no medible», las dos hojas del PDF de HTP y HF-PEFF, el cálculo de «provisoria» o sus dos secciones de Evidencia** | `docs/mapa/htp-hfapeff.md` |
| **Tocar el CARTEL DE PÉPTIDOS del HFA-PEFF, su puntaje o el plan Básico/Avanzado**: el espejo del péptido, el ritmo que se lee, los cortes por tipo o por qué `showTab` no chequea el plan | `docs/mapa/hfapeff-peptidos.md` |
| **Tocar un CRITERIO o un CORTE del puntaje HFA-PEFF**: la tabla contra el original, las tres contradicciones del artículo, la PSAP o el operador del IMVI | `docs/mapa/hfapeff-criterios.md` |
| **Tocar los VOLÚMENES del VI en AI/VI**: el VSFVI automático, el volumen latido automático, quién lee el VSFVI, o el GASTO CARDÍACO del PDF y su frecuencia cardíaca | `docs/mapa/vi-volumenes-automaticos.md` |
| **Ver por dónde sale un dato** (informe narrativo, EN SUMA, PDF, Excel) | `docs/mapa/informe-pdf-excel.md` |
| **Tocar la IMPORTACIÓN del Excel**: el guardián de columnas, las listas de valores, los rangos, el mensaje de las columnas calculadas o la exportación JSON | `docs/mapa/importacion-excel.md` |
| **Tocar CONTRACTILIDAD**: el botón «Incluir bull's eye en PDF» y de qué depende que el bull's eye entre al papel, la fila de tres bloques, la tabla de colores o el interior del 3D del VENTRÍCULO | `docs/mapa/contractilidad-3d-vi.md` |
| **Tocar una TARJETA ⓘ de AI/VI, el REGISTRO DE EVIDENCIA o una entrada de Referencias**: las fichas, los estados, el sondeo del dueño, el gráfico de geometría | `docs/mapa/registro-evidencia.md` |
| **Tocar un CORTE POR SEXO de la AI o del VI**: el diámetro AP, el DDVI en cuatro categorías, el DSVI, los espesores, la masa, los volúmenes, la FEVI en cuatro, el dueño del sexo efectivo o el AVISO de que falta el sexo | `docs/mapa/ai-vi-por-sexo.md` |
| **Tocar la AURÍCULA IZQUIERDA**: el dueño de su clasificación por volumen indexado, qué superficie clasifica y cuál sólo publica el valor; o **el COLAPSO de la VCI y el SÍMBOLO DEL SEXO en el PDF** | `docs/mapa/auricula-izquierda-pdf.md` |
| **Tocar una COLUMNA del Excel, el criterio de «derivada», la IDA Y VUELTA de un dato calculado o el mensaje del importador** | `docs/mapa/excel-origen-ida-vuelta.md` |
| **Tocar las ASOCIACIONES del Laboratorio o la TABLA DE LAS OCHO VÁLVULAS**: el cociente TAPSE/PSAP en el bloque A, el aviso de par acoplado, las dos estenosis BINARIAS y sus dos denominadores | `docs/mapa/laboratorio-asociaciones-valvulas.md` |
| **Tocar una TARJETA ⓘ de VÁLVULA o de la FUNCIÓN DIASTÓLICA**: el mecanismo, los dos dueños, `QV_BARRA` y la constante dueña de cada corte, la cosecha de fuentes o la frase de integración | `docs/mapa/valvulas-tarjetas-info.md` |
| **Tocar la FIBRILACIÓN AURICULAR de la función diastólica**: los tres dueños, sus cortes lado a lado, las tres reglas de conteo o el aviso de frecuencia cardíaca | `docs/mapa/diastolica-fa.md` |
| **Entender por qué una REFERENCIA conservaba el resultado del valor viejo al borrar el dato**: el dueño común, las DOS causas y los once campos | `docs/mapa/borrado-referencias.md` |
| **Tocar el FOP, el test de burbuja o el aneurisma del septum**: la escala unificada, el espejo entre Otros y el módulo FOP, el informe esquemático o el aviso de la edad | `docs/mapa/fop-burbuja-unificado.md` |
| **Tocar la EXCURSIÓN del aneurisma o su frase**: sus DOS controles —`fop_asa_mm` en el FOP y su espejo en «Otros»—, el dueño del espejo o el enganche de la nota | `docs/mapa/d2-correcciones.md` §9 |
| **Tocar la REGLA del aneurisma del septum, el selector de LATIDOS, la compuerta de la EVIDENCIA de la VAB o las barras de C. CONGÉNITAS**: el operador estricto, el lado como condición, la frase de un solo dueño, el «No» que vacía el lado, `_indVABEsBicuspide` o la caja de Conclusión apilada | `docs/mapa/d2-correcciones.md` |
| **Agregar o correr un caso de prueba; A/B; mutación** | `docs/mapa/tests.md` · fichas en `docs/mapa/tests-fichas.md` (TC-499 en adelante), `docs/mapa/tests-fichas-496-498.md`, `docs/mapa/tests-fichas-491-495.md` y `docs/mapa/tests-fichas-481-490.md` |
| **Tocar el DIBUJO ESTÁTICO de la mitral en ETE**: la tabla única de festones por ángulo, la geometría, la línea del plano, el giro, las tres vistas con sus LETRAS DE FESTÓN, **la ORIENTACIÓN de la TRANSGÁSTRICA**, el PDF, los CUATRO DIBUJOS DE MEDIDAS TEER, **los CRITERIOS TEER y sus cortes** o **el ESPEJO de la FEVI y el DSFVI del TEER** | `docs/mapa/mitral-dibujo-estatico.md` |
| **Tocar algo que la tanda R2 corrigió** (21/10): las cinco opciones del derrame y la traducción del token viejo, el repintado de la VAB con el gesto de la pastilla, los seis puntos de la probabilidad de HTP, el e′ medial en tres tramos, el espesor relativo y el criterio por eco de la amiloidosis, el SGL y la calculadora de cardio-oncología, el síndrome intersticial difuso por zonas, el índice cardiaco y la RVS, o la orejuela | `docs/mapa/tanda-r2-correcciones.md` |
| **Tocar algo que la tanda R movió**: la lesión presente sin grado de la VAB, los cortes del TEER, la severidad de la disfunción del VD, el área de la AI, los grados del derrame, el taponamiento que ya no concluye, el VD/VI del TEP o los criterios declarados de Referencias | `docs/mapa/tanda-r-referencias.md` |
| **Tocar la sección de la VÁLVULA AÓRTICA BICÚSPIDE**: la disposición en tres columnas, las seis tarjetas ⓘ, los factores de riesgo con casilla, el DIBUJO y sus puntos sensibles, **la SIMETRÍA DE LAS CÚSPIDES y el ÁNGULO con que se dibuja**, **los SEIS dibujos por tipo y la ANIMACIÓN de la apertura**, **la FUNCIÓN VALVULAR derivada**, **el RESUMEN esquemático y su texto en Evidencia**, la morfología que sigue al tipo de fusión, la descripción del informe, el PDF o el recordatorio de la coartación | `docs/mapa/vab-bicuspide.md` |
| **Visor de cineloop, medición, calibración, IndexedDB** | `docs/mapa/imagenes-visor.md` |
| **Tocar algo de la tanda I**: el TRAMO del score de Wilkins, la orejuela y sus dispositivos, la reparabilidad mitral con el rango de tenting, las DOS escalas de ateroma, las tres secciones de Evidencia de la ETE, las notas al pie de la estenosis tricuspídea o la INSUFICIENCIA PULMONAR en Fallot reparada con sus dos guías | `docs/mapa/tanda-i-ete.md` |
| **Tocar la ESTENOSIS MITRAL en el LABORATORIO**: las seis categorías, las dos casillas del filtro, el gráfico de distribución, el PDF de auditoría o el PPT | `docs/mapa/laboratorio-estenosis-mitral.md` |
| **Tocar la VISTA 2D de las válvulas**: el lector único del estado, las tarjetas, la tabla de cavidades, el dibujo, los chorros o el «por qué» | `docs/mapa/vista-2d-valvulas.md` |
| **Tocar el PANEL EN LÍNEA de la vista 2D**: el botón que prende y apaga, el apagado automático, la sincronía en vivo, el alto del dibujo o la línea de fase | `docs/mapa/vista-2d-en-linea.md` |
| **Orientarse en otro módulo** (Congénitas, Laboratorio, PPT, Cardio-Onco, Pericardio) | `docs/mapa/congenitas-otros.md` |
| **Saber DÓNDE ESTÁ una pantalla**: la columna izquierda y la fila de arriba, Pericardio y masas, las dos sub-pestañas de Otros, el eco pulmonar unificado, Calculadoras dentro de Referencias, C. Congénitas, el Fonocardiograma retirado o la frase de Balik | `docs/mapa/pestanas-reorganizacion.md` |
| **Citar un dato de una guía** (documento, folio, frase verificada) | `docs/fuentes/FUENTES.md` |
| **Tocar la POSICIÓN del selector de origen mitral o de los dos campos de la prótesis TRICÚSPIDE, la regla de DOS O MÁS de su obstrucción, la onda E en cm/s, el Ar−A suplementario, la FEVI del Laboratorio o los dos toggles de PDF** | `docs/mapa/cortos-arreglos.md` |
| **Tocar el SCORE de TEP, su ficha de Referencias o su Evidencia**: los seis criterios con su corte, el TAPSE que NO es el de la pestaña VD, el cociente sin corte, el dueño del VD/VI o las siete ramas de la Tabla 8 | `docs/mapa/tep-score.md` |
| **Tocar un HALLAZGO de la pestaña OTROS**: ASIA, las seis variantes anatómicas, la circunfleja retroaórtica, el test de burbuja, el derrame pericárdico del papel o la separación de las líneas B | `docs/mapa/otros-hallazgos.md` |
| **Tocar la OBSTRUCCIÓN de una prótesis TRICÚSPIDE o PULMONAR**: las Tablas 19 y 15 de la ASE 2024, los tres campos del PRO-C1, el DVI retirado con regurgitación o los tres estados pulmonares que no gradúan | `docs/mapa/protesis-tri-pulm.md` |
| **Tocar un CORTE de PRÓTESIS de la tanda PRO**: el cociente VTI mitral por régimen, el jet/TSVI y la FR de la IAo protésica, o el reverso diastólico de la TAVI | `docs/mapa/protesis-pro.md` |
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
  sin frameworks. Hoy **9,21 MB / 131.103 líneas**, medido con `wc -l` y `wc -c` el 2026-10-22 al
  cierre de la tanda **E**, sobre el árbol ya sellado (`v20261022-0942`, `md5` `f5919381…`).
  ⚠️ **Y ESTE RENGLÓN DECÍA «8,53 MB / 128.236 líneas» —el cierre del trabajo B— DURANTE CINCO
  TANDAS**: el B fue la primera en muchas que lo dejó más CHICO (por las 431 líneas del
  Fonocardiograma retirado) y desde entonces cada tanda escribió su delta en su propia sección sin
  actualizar éste, que es el que se lee para presupuestar contexto. **1.632 líneas de diferencia.**
  ⚠️ Y el renglón del R2 decía «128.264 líneas» y eran **128.278**, medido con `wc -l`
  sobre el mismo `md5` de ese sello: **medirlo antes de presupuestar contexto**, no leer esto.
  ⚠️ Y esta cifra también se escribió mal una vez —128.226— por medirla **antes** del segundo
  sello: hay que medirla **al final**, cuando `index.html` ya no se toca más.
  Las únicas dependencias son jsPDF, XLSX y
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

> **La bitácora de las tandas anteriores vive en `docs/HISTORIAL_CLAUDE.md`** (72 secciones,
> de «La HTP y el HF-PEFF — «E»» hacia atrás). Acá queda **la última tanda cerrada**, que es la
> que trae la línea base, el estado del remoto y los commits sin pushear — lo que la próxima
> sesión necesita para medir. Lo de más atrás se busca con `grep -n` por título de encabezado
> en ese archivo y se lee con `sed -n 'a,bp'`: son ~1,0 MB y leerlo entero desborda la ventana,
> igual que `docs/historial/`.
>
> ⚠️ **NINGUNA REGLA SE MOVIÓ.** Lo que salió son las **secciones de tanda** de «Estado
> vigente» —el relato de qué se hizo, qué se midió y qué trampa se pagó en cada una—; las ocho
> secciones de REGLAS (la regla de oro con su tabla de mapas, «Qué es EcoSmart», el panel de
> Evidencia, el protocolo de verificación, las trampas conocidas, el flujo de trabajo,
> SEGURIDAD y la tabla de Procedencia) siguen enteras y en su lugar, verificado byte por byte.


### La ETE, la estenosis tricuspídea y la IP en Fallot reparada — «I» (2026-10-22)

- **Son CINCO commits, y son los cinco que la orden pedía.** Al **empezar**, `main` estaba en
  **`fd563e1`** —el cierre de la tanda E, con su sello `v20261022-0942`— y `origin/main` en
  **`53ddd7a`**, o sea que los veintidós commits del D2, el D3, el AJ1 y el E seguían locales, que
  es lo que la orden preveía. Los **cinco** de esta tanda quedan locales; el push lo corre Maicol.
  **El orden de revertido seguro es el inverso del de aplicación: 5 → 4 → 3 → 2 → 1.**
  ⚠️ **EL 2 CUELGA DEL 1 POR UNA PIEZA Y NO POR SU TEXTO**: el globo `wilk-score` que el 1 crea en
  `VINFO` apunta a `ref-em`, y lo que el 2 escribe dentro de esa ficha es lo que ese globo manda a
  leer. ⚠️ **EL 3 CUELGA DEL 2 POR LAS CLAVES DE BIBLIOGRAFÍA**: `aseEte2013`, `aseEte2020`,
  `tamburino2010` y `guiaRegurgNativa` nacen en el 2 y las tres secciones del 3 las citan;
  revertir el 2 sin revertir antes el 3 deja tres secciones citando claves que `IND_REF_IDX` no
  conoce. ⚠️ **EL 4 NO CUELGA DE NINGUNO** y toca dos zonas que los tres anteriores no tocan.
  **El 5 es TC-518, la adaptación de TC-322, la documentación y el sello**, y afirma el
  comportamiento de los cuatro: revertir cualquiera sin el 5 lo deja en rojo.
  ⚠️ **EL COMMIT 2 SE AMENDÓ, Y HAY QUE DECIR POR QUÉ: UN `<div>` SIN CERRAR EN LA FICHA `ref-em`
  ROMPÍA LA MAQUETA DE TODA LA APP.** Un tag sin cerrar **no lanza**: el parser re-anida todo lo
  que viene después, y **tres casos de zonas completamente ajenas** informaron geometría 0×0
  —**TC-254** (el área táctil de una casilla de estadística descriptiva), **TC-259** (los gráficos
  y los acordeones del Laboratorio) y **TC-274** (el botón de Evidencia)—. ⚠️ **NINGÚN A/B DE
  TEXTO LO VE**: el informe, el EN SUMA, las 440 columnas del Excel y las seis plantillas del PDF
  salían **IDÉNTICAS**, y el grupo `ctrl` de la sonda informó «cuatro diferencias, todas del
  commit 1». **Un A/B de texto no mide estructura.** Se bisecó en worktrees.

- **Línea base al cierre: suite **528/532** con el pendrive `DISK_IMG` **MONTADO** —verificado al
  abrir Y al cerrar—, Semgrep **124 / 0 ERROR en 1 app**, Excel en **440** columnas y celular **63 a
  360 px y 72 a 390 px con 17 ALTA cada uno**: el MISMO par que dejó la tanda E. CERO
  REGRESIONES.** Los rojos son exactamente los **cuatro** de ENTRADA —**TC-223** (el documentado,
  falla por la fecha), **TC-376**, **TC-390** y **TC-406**— y no apareció ninguno fuera de esa
  lista. **El denominador sube a 533**: esta tanda agregó **TC-518**, así que la comparación es
  **527/531 → 528/532**. Los **diecisiete** de **TC-181…TC-197** salieron **VERDES**, que es la
  prueba del pendrive, y el `md5` no se movió durante la corrida (`f7118c2e…`, el del sello).
  ⚠️ **LA SUITE SE CORRIÓ DOS VECES Y LA PRIMERA NO ES LA LÍNEA BASE.** Dio **527/532** con
  **cinco** rojos, y el de más lo destapó la suite completa: **TC-322**, cuyo denominador exige que
  **TODAS** las secciones de `IND_SECS` tengan escenario — una sección nueva sin SEED lo pone en
  rojo, y ninguna corrida de zona podía verlo. Se adaptó y la segunda es la que vale.
  ⚠️ **TC-318 SIGUE EXCLUIDO y se excluye así:** se arma la lista con
  `grep -o "^caso('TC-[^']*'" scripts/test_clinico.mjs`, se le saca `TC-318` y se pasa entera a
  `--solo`, **separada por COMAS**. La lista tiene **532 ids** sobre los 533 casos del archivo.
- **`index.html` pasó de 9,21 MB / 131.103 líneas a **9,30 MB / 132.176 líneas** — medido con
  `wc -c` y `wc -l` DESPUÉS de sellar (`v20261022-1638`).

- **I-E1 · LO QUE SE RETIRA SON AFIRMACIONES DE RESULTADO Y DE CONDUCTA, Y SU CONTENIDO PASA A
  EVIDENCIA EN EL COMMIT 3.** El score de **Wilkins** publica su **TRAMO** y nada más
  —`WILK_TRAMO`, congelado, leído por las **cuatro** superficies que publicaban el veredicto: el
  badge de ETE, el de Calculadoras, la hoja del PDF y las tres barras del Laboratorio, cuyo gráfico
  pasa de «Candidatos a valvuloplastia» a «Distribución del score de Wilkins»—. **Las claves de
  banda y el `dataset.banda` NO cambian.** La **salvedad anatómica se mantiene** y gana su fuente
  (EAE/ASE 2009, apartado B.2.1, folio 14).
  El **trombo de la orejuela** pasa de «Hallazgo que contraindica cardioversión eléctrica» a
  **«Confirmado»**, y los **dispositivos** pasan al dato del fabricante con su fecha de consulta: la
  línea de elegibilidad dejó de fusionar dos dispositivos en un rango que **no es de ninguno** y
  hoy nombra la zona de anclaje del Amulet (11 a 31 mm).
  La **reparabilidad mitral** lista **factores DESFAVORABLES** y sólo con IM **secundaria**; el
  área de tenting **entra al conteo**, que antes no votaba.
  El **ateroma** alinea su borde de 5 mm con la escala que la app ya citaba, y `ao_grosor_placa`
  —que era una **lectura muerta**— gana su fila.

- **I-E2 · LAS CUATRO FICHAS, CADA DATO CON SU FOLIO VISTO EN IMAGEN.** `ref-em`, `ref-im`,
  `ref-oai` y `ref-ao`. **Ningún corte se movió**: lo que cambia es que cada número diga de dónde
  sale y que lo que no tiene fuente lleve el chip **CRITERIO DE ECOSMART**.
  ⚠️ **«EVEREST II» ERA UNA ATRIBUCIÓN EQUIVOCADA Y DEJABA UN CRITERIO SIN CITAR.** El registro de
  *Eur Heart J* 2010;31:1382-1389 es de **Tamburino y cols.** —un registro italiano de práctica real
  con MitraClip—, **está en la biblioteca**, y su Tabla 1 (folio 1386) se verificó en imagen. El
  comentario que afirmaba lo contrario se escribió sobre un censo que buscó **el nombre del
  ensayo**, y ese PDF no lo lleva en el título. **El corte no se movió: hoy se cita.**
  ⚠️ **EL ÁREA DE TENTING LA TABLA LA ESCRIBE COMO UN RANGO** —«> 2,5-3 cm²»— y la app aplica su
  extremo **BAJO**, que es el lado que no deja de marcar. **Un corte único donde la fuente da un
  rango es una DECISIÓN y no una lectura**: declarado en la ficha, en el pie de la pantalla, en el
  rótulo del campo y en `PENDIENTES.md` → I-1.
  ⚠️ **LAS DOS ESCALAS DE ATEROMA NO CORTAN EN EL MISMO SITIO**: la de la ASE (Nicoara, folio 716)
  en 5 mm y la de la ESC 2024 (Tabla 14, folio 71) en 4. **Un ateroma de 4,5 mm es grado 3 por una
  y grado 4 por la otra.** La app aplica la de la ASE y publica la otra al lado.

- **I-E3 · LAS TRES SECCIONES DE EVIDENCIA DE LA ETE.** `IND_SECS` pasa de 20 a 23 y `IND_REFS`
  gana cinco entradas. **Las recomendaciones van en el bloque VISIBLE y no en `notas`**, que el
  marco pinta dentro del «Ver detalle», que nace plegado —medido: cero bloques plegados en las seis
  escenas—.
  ⚠️ **DOS PREMISAS DE LA ORDEN ERAN FALSAS.** La anticoagulación de al menos cuatro semanas tras
  la cardioversión **sí** lleva **Clase I · Nivel B** en la Recommendation Table 15 (la orden la
  daba como «texto de la guía sin clase»), y la Tabla 7 escribe el tenting como un rango.
  ⚠️ **LAS DOS GUÍAS DEL ATEROMA COINCIDEN EN QUÉ HACER Y NO EN EL NÚMERO**: LDL por debajo de
  **55 mg/dL** la europea y de **70 mg/dL** la estadounidense. Las dos se publican con su fuente y
  **no se promedian**.
  ⚠️ **«SEVERA O COMPLEJA» SE PREGUNTA Y NO SE DERIVA DEL GRADO**: la app gradúa con la escala de
  la ASE y la guía que publica las recomendaciones usa la suya, que corta en 4 mm; derivarla sería
  aplicarle a una escala el corte de la otra.
  ⚠️ **Y SER CANDIDATO A COMISUROTOMÍA SE PREGUNTA POR DOS MOTIVOS**: es una decisión clínica, y
  **`_indFilaOrigen` NO dibuja los botones cuando el valor viene del estudio**, así que una
  propuesta derivada no se podría corregir.
  ⚠️ **LA MARCA ROJA SÓLO SI LA TABLA APLICA, Y LO CAZÓ MIRAR LA SALIDA**: con IM primaria las tres
  medidas salían en rojo al lado de una línea que dice que esa tabla no aplica — el panel
  contradiciéndose en la misma sección.

- **I-E4 · LAS TRES NOTAS AL PIE DE LA ESTENOSIS TRICUSPÍDEA, CON LA FILA QUE LAS USA.**
  ESC/EACTS 2025, **Recommendation Table 10, folio 4688**, leída EN IMAGEN. Las dos filas siguen en
  **Clase I · Nivel C**: ningún corte, ninguna clase y ningún nivel se movieron. La nota ᶜ —esa
  cirugía es, habitualmente, el **REEMPLAZO** de la válvula tricúspide— **no estaba en ningún lado
  de la app**; las ᵈ y ᵉ son una por fila.
  ⚠️ **EL RENGLÓN GENÉRICO DE `notas` SE COMPONE DESDE LAS MISMAS TRES CONSTANTES**: decía lo mismo
  con otras palabras, y **dos redacciones de la misma afirmación en la misma sección son dos cosas
  que se separan en la primera edición**.

- **I-E4 · LA INSUFICIENCIA PULMONAR EN FALLOT REPARADA: DOS GUÍAS QUE NO PIDEN LO MISMO, EN DOS
  BLOQUES SEPARADOS.** `_indTdFIP`, sección 24, compuerta `tdfConclusion()` —el dueño de «el módulo
  de Fallot tiene datos»—. Fuente principal **ACC/AHA 2025 (Gurvitz), folio e182** comprobado en el
  pie impreso; segunda **ESC 2020 de congénitas, folio e50** comprobado en el encabezado. **Las
  tres diferencias:** qué es «disfunción valvular pulmonar» —fracción regurgitante por resonancia
  **> 25 %** o PSVD > 2/3 de la sistémica, contra IP **GRAVE** «> 30-40 %» u obstrucción con
  velocidad pico > 3 m/s—; **cuántos criterios** —DOS de cinco contra UNO de cuatro—; y **cuáles**
  —FEVD ≤ 46 %, FEVI ≤ 50 % y VTDVD ≥ 2× VTDVI son sólo de la estadounidense; PSVD > 80 mmHg sólo
  de la europea—.
  ⚠️ **EL 80 ml/m² APARECE EN LAS DOS Y NO ES EL MISMO CRITERIO**: la estadounidense pide **POR
  ENCIMA** de 80 y la europea lo **INCLUYE**. Por eso el criterio americano lleva **constante
  propia** y no reusa `TDF_VTSVDI_MIN`. **Medido con método resonancia: con 80,0 exactos la
  estadounidense cuenta 2 de cinco y la europea 2 de cuatro; con 81 la estadounidense pasa a 3 y la
  europea sigue en 2; con 81 por ecocardiografía 3D el volumen se declara y NO vota, y vuelven a 2
  y 1.** Y con la fracción regurgitante **entre 26 y 40 %** la fila 9 de la estadounidense aplica y
  **ninguna** de la europea — que es la diferencia que estas dos guías tienen.
  ⚠️ **LA PROGRESIÓN SE PREGUNTA Y NO SE DERIVA, Y SON DOS PREGUNTAS VENTRICULARES Y NO UNA**: la
  europea pide el deterioro del ventrículo **DERECHO** y la estadounidense dice «ventricular», que
  incluye los dos. Con una sola, un deterioro aislado del VI haría votar a la europea un criterio
  que su tabla no escribe. **Las cinco respuestas no viajan con el estudio.**
  ⚠️ **LO QUE NO SE PUEDE EVALUAR SE DECLARA Y NO SE INVENTA**: «RV end-diastolic volume ≥ 2× LV
  end-diastolic volume», porque el volumen del VD se **transcribe** de la resonancia y está
  **indexado** mientras el del VI lo mide este ecocardiograma y está en mililitros. **La sección
  dice cuántos criterios pudo evaluar**, así que el conteo nunca se presenta como completo.
  ⚠️ **`TDF_VTDVDI_MIN` Y `TDF_VTSVDI_MIN` SE EXPORTAN A `window`**: la regla 4 del panel es leer
  los umbrales con `_indUmb` y **sin literal de respaldo**; sin el export el criterio volumétrico
  europeo **deja de votar en silencio**.

- **A/B DE CONTROL del commit 4 contra el commit 3: 0 diferencias en 2040 claves** del grupo de
  superficies firmadas —informe en los tres estilos, EN SUMA, Excel clave por clave, campos del
  estudio y el **PDF GENERADO DE VERDAD en sus SEIS plantillas**— y **0 en 1878 claves** del grupo
  de controles. Esta parte es de panel: nada firmado se mueve. **Consola limpia.**
  **ACUMULADO contra el inicio de la tanda**, en los commits 1 a 3: el grupo `ctrl` da **CUATRO**
  diferencias y son las **filas de pantalla** del commit 1 (`.calc-row` 298 → 303 y sueltos 93 →
  94); el grupo `sup`, **22**, y son las tres escenas autorizadas (la conducta del trombo y el
  rótulo del ateroma en el informe en tres estilos, la celda del Excel y las seis plantillas del
  PDF). **La escena del Wilkins sale en CERO.**
  ⚠️ **Y EL GRUPO `ctrl` HUBO QUE CORRERLO SOLO PARA QUE FUERA COMPARABLE**: corrido junto con
  `sup` informa una clave de `localStorage` de más (`ett_pdf_plantilla`), que la deja el PDF del
  otro grupo. **Remedir con los MISMOS grupos antes de sospechar.**

- **CUATRO CAPTURAS PNG con cuatro `md5` distintos**, a 1200 y 360 px por los dos temas, y **DOS
  MIRADAS**: la sección nueva con sus quince filas y sus dos bloques a 1200 px, y la misma a 360 px
  en una columna con los acentos completos.

- **Cobertura: TC-518**, **33 condiciones** en diez grupos, con tres denominadores y cinco
  controles negativos. **Verificado que sabe fallar contra el inicio de la tanda en un worktree
  aparte: 30 de las 33 en rojo, y NINGUNA por excepción** — las tres que pasan son exactamente las
  que afirman lo que esta tanda **no** mueve.
- ⚠️ **CASOS ADAPTADOS: CUATRO.** **TC-330** (su condición pasa de prohibir «resultado suboptimo» a
  prohibir el rótulo COMPLETO, porque desde el commit 2 la ficha **CITA** lo que halló la serie y
  esa cita lo dice; **gana** una condición que exige la serie, la escala y la salvedad con sus seis
  folios), **TC-507** (el conteo de chips «Criterio de EcoSmart» de SEIS a OCHO) y **TC-322**, que
  se adaptó **dos veces** —las tres secciones del commit 3 y la del 4—, y la segunda la destapó la
  **suite completa**.

- ⚠️ **DIEZ TRAMPAS, Y CINCO DABAN MEDICIONES FALSAS.**
  1. **UN `<div>` SIN CERRAR ROMPE LA MAQUETA DE TODA LA APP Y NINGÚN A/B DE TEXTO LO VE** (arriba).
  2. **`indicAbrir` LIMPIA LAS RESPUESTAS CLÍNICAS ANTES DE PINTAR**, así que contestar tres
     preguntas con tres llamadas sueltas deja viva **sólo la última**: la primera medición informó
     el bloque de cardioversión **VACÍO** con las tres contestadas. Era la sonda, no la app.
  3. **Y POR LO MISMO, LEER EL OBJETO DESPUÉS DE CERRAR EL PANEL PIERDE LA RESPUESTA**: las escenas
     del borde de 80 ml/m² salieron las dos guías en «Lo que falta», que se lee igual que «el
     criterio no cuenta» sobre un borde que **sí** separa.
  4. **`ip_grado` NACE EN «Sin insuficiencia»**, así que ese token no distingue «no hay» de «nadie
     la evaluó» —la trampa de `it_grado`—. **Lo cazó MIRAR la captura.**
  5. **Y EL PRIMER PREDICADO QUE LO CORRIGE ESTABA MAL POR EL OTRO LADO**: incluía `ip_reversion`,
     que es un **CHECKBOX**, y `sv()` devuelve su `.value`, que vale **«on» SIEMPRE**.
  6. **EL TEXTO EXTRAÍDO DE LA ACC/AHA 2025 DESALINEA LAS CELDAS DE CLASE RESPECTO DE SU FILA**:
     leída así, la recomendación 13 sale como Clase **2b** y es **2a**. Las cuatro se leyeron en
     imagen a 600 ppp.
  7. **`ET_REC_2025` ES UN `const` DE MÓDULO Y NO UNA PROPIEDAD DE `window`** —la trampa de
     `ECO_AYUDA`—: siete condiciones de TC-518 en rojo sobre un árbol perfecto.
  8. **Y EL CENTINELA TIENE QUE SER SOBRE EL TIPO Y NO SOBRE LA VERDAD**: contra el árbol anterior
     `ET_REC_2025` **sí existe** —lo que no existen son sus tres notas—, así que un guardia por
     `!!ER` deja pasar un `undefined.indexOf` que **mata la corrida entera**.
  9. **`sel()` DEVUELVE `{err:'NO EXISTE'}` SIN LANZAR**: con los ids del Wilkins equivocados
     (`wilk_*` contra `wilkins_*`) la escena medía un formulario **VACÍO** y el A/B informaba «0
     diferencias» — un falso con pinta de medición buena.
  10. **ME COMÍ EL ACENTO GRAVE SIETE VECES**, todas en comentarios míos dentro del cuerpo de un
      caso o del template de la sonda. `scripts/check_backticks.py` da la línea exacta en el cuerpo
      de un `caso(...)`; **no alcanza el template inyectado de una sonda**, y ésos los dio
      `node --check`. **Correr los dos.**

- **Dónde está todo:** `docs/mapa/tanda-i-ete.md` (**mapa NUEVO**, 19,8 KB: los cinco commits con su
  dependencia, el Wilkins, la orejuela, la reparabilidad, las dos escalas de ateroma, las tres
  secciones de Evidencia, las notas de la ET, la IP en Fallot con su tabla de bordes medidos, las
  diez trampas y la ficha de **TC-518**); **cinco mapas con un puntero cada uno**
  (`wilkins-unificado` 9,2 KB · `referencias-subpestanas` 21,4 · `valvulas-mitral-pantalla` 25,2 ·
  `aorta-aortopatias-evidencia` 24,4 · `congenitas-otros` 29,7); `docs/fuentes/FUENTES.md` → «La
  tanda I», con las **once reglas de folio comprobadas en el pie impreso**, lo verificado dato por
  dato, lo que **no se pudo leer**, las dos premisas falsas y la tabla de **Cambios de evidencia**; y
  `docs/PENDIENTES.md` → **once** cosas declaradas (**I-1** a **I-11**).
  ⚠️ **TRES MAPAS NO SE TOCARON, medido con `wc -c` ANTES de escribir:** `panel-evidencia.md`
  (35,3 KB, **ya cruzado**), `tests-fichas.md` (34,2) y `vista-2d-valvulas.md` (34,0). Por eso la
  documentación salió a un mapa propio y la ficha de TC-518 vive adentro. **Ningún mapa cruzó el
  techo.**

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
