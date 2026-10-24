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
| **Tocar el TIPO DE IM o el CARPENTIER de la mitral, o el STRAIN DE PARED LIBRE DEL VD**: la fila de tres campos y su ancho derivado del botón, la sincronía con el ETE y su guarda asimétrica, las tres voces del Carpentier, el paréntesis del informe o los cortes del strain | `docs/mapa/aj5-mitral-tipoim-carpentier.md` |
| **Tocar la PANTALLA de las dos lesiones MITRALES**: las tres columnas de la insuficiencia, las casillas automáticas, el cuadro de referencias en tres bloques, la columna 2 de la estenosis, el mecanismo de los globos ⓘ o **el aviso de fibrilación auricular de la continuidad** | `docs/mapa/valvulas-mitral-pantalla.md` |
| **Tocar la PANTALLA de las insuficiencias AÓRTICA o TRICUSPÍDEA**: sus columnas, las cinco casillas automáticas, las once tarjetas ⓘ, el rótulo THP o el color de los avisos | `docs/mapa/valvulas-ia-it-pantalla.md` |
| **Tocar un criterio de PRÓTESIS mitral o aórtica**: la Tabla 11, el AEO en tres tramos, el THP directo, el PPM de la Tabla 7, el badge del AVA aórtico, las tarjetas nativa-prótesis o el rótulo AEO | `docs/mapa/protesis-valvular.md` |
| **Tocar el PPM aórtico del informe, el voto de los cuatro criterios de obstrucción de la prótesis mitral o los dos retiros del gradiente medio** (tandas Z, Z5 y Z6) | `docs/mapa/protesis-z-z5-z6.md` |
| **Tocar la FUGA PARAVALVULAR de una prótesis QUIRÚRGICA**, aórtica o mitral: el motor único, los tres campos nuevos, la marca de origen o por qué la mitral no ofrece extensión circunferencial | `docs/mapa/protesis-fuga-pvl.md` |
| **Buscar un CORTE o una BANDA de plausibilidad** de cualquier válvula, con su fuente | `docs/mapa/valvulas-constantes.md` |
| **Tocar la MARCA DE MANUAL de una pastilla, el selector binario de la estenosis mitral, el VIOLETA de «Significativa», el VTI de entrada tricuspídeo, la CASILLA DE PISA de «Incluir en el informe» o lo que «Nuevo estudio» deja vivo** | `docs/mapa/valvulas-manual-binario.md` |
| **Tocar el CRITERIO DE DILATACIÓN DE LA RAÍZ AÓRTICA** —el corte por sexo, el índice de dimensión aórtica, el dueño `aoSegRef`/`aoSegIda`/`aoSegDil`, el globo ⓘ, el cruce entre las pantallas de BICÚSPIDE y de COARTACIÓN, o lo que la tanda AJ4 tocó de la Evidencia de la VAB | `docs/mapa/aj4-raiz-aortica.md` |
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
| **Tocar el REGISTRO DE CITAS del panel**: `IND_REFS`, el marcador `ecosmart`, el allowlist `IND_REF_IDX` o la numeración por sección | `docs/mapa/panel-evidencia-citas.md` |
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
| **Tocar el BLOQUE del ETT avanzado**: el barrido que lo mantiene al día, la marca de «editado a mano» y su campo persistido, el aviso ámbar, la confirmación al reintegrar o **la pregunta del RESULTADO del paso 3 del HFA-PEFF** | `docs/mapa/aj3-ett-avanzado.md` |
| **Tocar algo que la tanda AJ6 movió** (24/10): el cuerpo del informe de la Fallot reparada —el esquema, la fila vacía y la conducta retirada—, su Evidencia compacta con la prosa en el ⓘ, la ecografía pulmonar en cuatro columnas, o Referencias y Calculadoras dejando de ser módulos opcionales con el buscador que tapa las fichas | `docs/mapa/aj6-fallot-pulmon-refs.md` |
| **Agregar o correr un caso de prueba; A/B; mutación** | `docs/mapa/tests.md` · fichas en `docs/mapa/tests-fichas-532.md` (TC-532), `docs/mapa/tests-fichas.md` (TC-499 en adelante), `docs/mapa/tests-fichas-496-498.md`, `docs/mapa/tests-fichas-491-495.md` y `docs/mapa/tests-fichas-481-490.md` |
| **Tocar el DIBUJO ESTÁTICO de la mitral en ETE**: la tabla única de festones por ángulo, la geometría, la línea del plano, el giro, las tres vistas con sus LETRAS DE FESTÓN, **la ORIENTACIÓN de la TRANSGÁSTRICA**, el PDF, los CUATRO DIBUJOS DE MEDIDAS TEER, **los CRITERIOS TEER y sus cortes** o **el ESPEJO de la FEVI y el DSFVI del TEER** | `docs/mapa/mitral-dibujo-estatico.md` |
| **Tocar algo que la tanda R2 corrigió** (21/10): las cinco opciones del derrame y la traducción del token viejo, el repintado de la VAB con el gesto de la pastilla, los seis puntos de la probabilidad de HTP, el e′ medial en tres tramos, el espesor relativo y el criterio por eco de la amiloidosis, el SGL y la calculadora de cardio-oncología, el síndrome intersticial difuso por zonas, el índice cardiaco y la RVS, o la orejuela | `docs/mapa/tanda-r2-correcciones.md` |
| **Tocar algo que la tanda R movió**: la lesión presente sin grado de la VAB, los cortes del TEER, la severidad de la disfunción del VD, el área de la AI, los grados del derrame, el taponamiento que ya no concluye, el VD/VI del TEP o los criterios declarados de Referencias | `docs/mapa/tanda-r-referencias.md` |
| **Tocar la sección de la VÁLVULA AÓRTICA BICÚSPIDE**: la disposición en tres columnas, las seis tarjetas ⓘ, los factores de riesgo con casilla, el DIBUJO y sus puntos sensibles, **la SIMETRÍA DE LAS CÚSPIDES y el ÁNGULO con que se dibuja**, **los SEIS dibujos por tipo y la ANIMACIÓN de la apertura**, **la FUNCIÓN VALVULAR derivada**, **el RESUMEN esquemático y su texto en Evidencia**, la morfología que sigue al tipo de fusión, la descripción del informe, el PDF o el recordatorio de la coartación | `docs/mapa/vab-bicuspide.md` |
| **Visor de cineloop, medición, calibración, IndexedDB** | `docs/mapa/imagenes-visor.md` |
| **Tocar algo que la tanda AJ2 corrigió** (23/10): la VRT «sin datos» frente a «no medible», el tipo de IM vacío, la coartación sin gradiente, la aorta que ya no gradúa, el ateroma sin riesgo embólico con el grosor completando el grado, el HF-PEFF sin FEVI y la negrita de su hoja, el eco pulmonar «bilateral», el score de TEP con un solo vocabulario y su maqueta en tres grupos, el EN SUMA que ya no niega lo que el informe describe, los dos buscadores o las tildes | `docs/mapa/aj2-correcciones.md` |
| **Tocar algo de la tanda I**: el TRAMO del score de Wilkins, la orejuela y sus dispositivos, la reparabilidad mitral con el rango de tenting, las DOS escalas de ateroma, las tres secciones de Evidencia de la ETE, las notas al pie de la estenosis tricuspídea o la INSUFICIENCIA PULMONAR en Fallot reparada con sus dos guías | `docs/mapa/tanda-i-ete.md` |
| **Tocar la ESTENOSIS MITRAL en el LABORATORIO**: las seis categorías, las dos casillas del filtro, el gráfico de distribución, el PDF de auditoría o el PPT | `docs/mapa/laboratorio-estenosis-mitral.md` |
| **Tocar la VISTA 2D de las válvulas**: el lector único del estado, las tarjetas, la tabla de cavidades, el dibujo, los chorros o el «por qué» | `docs/mapa/vista-2d-valvulas.md` |
| **Tocar el PANEL EN LÍNEA de la vista 2D**: el botón que prende y apaga, el apagado automático, la sincronía en vivo, el alto del dibujo o la línea de fase | `docs/mapa/vista-2d-en-linea.md` |
| **Orientarse en otro módulo** (Congénitas, Laboratorio, PPT, Cardio-Onco, Pericardio) | `docs/mapa/congenitas-otros.md` |
| **Tocar la HEMODINÁMICA, la CARDIO-ONCOLOGÍA, el SCORE DE AMILOIDOSIS o la ficha de ECO PULMONAR**: los tres ⓘ del índice cardíaco, la RVS y el Forrester; las dos ramas de RVS baja; el seguimiento tras radioterapia; las etiquetas del score que salieron; las TRES Evidencias nuevas o la ficha `ref-pulmon` | `docs/mapa/j2-hemo-onco-amiloide-pulmon.md` |
| **Tocar el DERRAME y el TAPONAMIENTO, la CONSTRICCIÓN vs RESTRICCIÓN o VEXUS**: la fase y la duración del colapso de la aurícula derecha, los DOS cortes de plétora de VCI de la app, el aviso invasivo retirado, el cociente de la vena suprahepática, los dos operadores de VCI de VExUS o las tres Evidencias nuevas | `docs/mapa/j-pericardio-constriccion-vexus.md` |
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
  sin frameworks. Hoy **9,59 MB / 135.540 líneas**, medido con `wc -c` y `wc -l` el 2026-10-24 al
  cierre de la tanda **J2**, sobre el árbol ya sellado (`v20261024-1714`, `md5` `1ecdba10…`).
  ⚠️ **Y ESTE RENGLÓN SE QUEDÓ DOS TANDAS ATRÁS OTRA VEZ**: decía «9,46 MB / 134.230 líneas», que
  es el cierre del AJ6, mientras la J y la J2 escribían su delta en su propia sección sin tocar
  éste, que es el que se lee para presupuestar contexto. **1.310 líneas de diferencia.**
  ⚠️ **Y SE VOLVIÓ A ESCRIBIR MAL EL 23/10, POR CONFUNDIR MB CON MiB:** `ls -l` da bytes y
  dividirlos por 1.048.576 da **8,91**, que es MiB; este renglón cuenta en MB de 10⁶, así que la
  cifra es **9,34**. Medir con `wc -c` y dividir por 1e6.
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
### Hemodinámica, cardio-oncología, amiloidosis y eco pulmonar — «J2» (2026-10-24)

- **Son OCHO commits, en el orden del encabezado, y los siete ítems de código se completaron
  enteros.** `071c816` (E1) · `ca67b14` (E2) · `e117e82` (E3) · `2f1e721` (E4) · `4a29caa` (E5) ·
  `56046fe` (E6) · `5a8f04c` (E7) · el de cobertura y documentación. Sello **`v20261024-1714`**.
  Al **empezar**, `origin/main` estaba en **`2b9f3ef`** con **56** commits locales sin pushear;
  al cerrar hay ****64****, medidos con `git rev-list --count origin/main..HEAD` y no
  contados a mano. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LAS SIETE FUENTES SE LEYERON EN EL PDF ORIGINAL, Y CUATRO EN IMAGEN.** Consenso SAC 2024 de
  shock cardiogénico (Tabla 1, folio 2); ESC/ERS 2022 de HP (folio 30); **Grossman y Baim Tomo I,
  Tabla 11.2, folio 260**; **Braunwald 10.ª española, Tabla 19-3 folio 375 y Tabla 52-9 folio
  1125**; ASE 2025 de corazón derecho (folios 162 y 167); ESC 2022 de cardio-oncología (Tablas 3,
  4, 5 y 12, Figuras 10 y 11, y las Recomendaciones-tabla 26 y 41); García-Pavía 2021 (Tabla 2
  folio 1558, texto 1556, escenarios 1558-1559); Boldrini 2020 (Tabla 4, pág. 30); ESC 2023 de
  miocardiopatías (folio 27, **cotejada contra el original inglés**); y Volpicelli 2026
  (enunciados D2_2.1, D2_2.2, D3_1.1, D3_1.3, D3_1.4 y D6_11).
  **LOS DOS LIBROS DEL ESCRITORIO SE RE-VERIFICARON, no quedaron en «visto por Cowork»**: son
  escaneos sin capa de texto y se leyeron renderizando la página.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el score de amiloidosis llamaba «BAJO» a un
  puntaje que no descarta nada.** Con el corte de 8 la sensibilidad del score es del **46 %**
  (Boldrini 2020, Tabla 4), así que un puntaje por debajo deja fuera a más de la mitad de los
  enfermos — y la palabra «bajo» se lee como si lo descartara. Salieron las dos etiquetas sin
  fuente, «INTERMEDIO» (5-7) y «BAJO» (<5), y lo que queda es el puntaje con su **rendimiento en
  ese corte**, transcrito de la tabla.

- **TRES PUNTEROS DE LA ORDEN ESTABAN CORRIDOS, Y LA FUENTE LOS CORRIGE.** La Tabla 52-9 de
  Braunwald está en el **folio 1125**, no en el 1120. El síndrome intersticial difuso es el pie de
  la **Figura 3, panel C** (hoja 8), no de la Figura 4 —la 4C, hoja 9, es la semicuantificación
  del neumotórax—, y el comentario de `pulAvPatron` lo decía mal desde el R2. Y el enunciado que
  dice que el punto pulmón **confirma** el neumotórax es el **D2_2.1**, no el D2_2.2.
  **Ningún corte se movió por ninguno de los tres.**

- **UNA RAMA QUE NO SE PODÍA BORRAR.** El perfil «GC bajo con RVS baja — considerar shock
  mixto/distributivo» salió, pero la RAMA quedó: sin ella, un índice cardíaco bajo con RVS baja
  cae en el `else` final y la app dice **«Perfil hemodinámico normal»** sobre un paciente
  hipoperfundido. Lo que publica hoy son los DOS NÚMEROS, en gris, sin interpretación.

- **TRES EVIDENCIAS NUEVAS Y NINGUNA CLASE INVENTADA.** `IND_SECS` pasa de 27 a **30**. La de
  hemodinámica no tiene **una sola** fila graduada, y lo declara: la ASE 2025 no usa esa escala,
  Grossman y Braunwald son libros de texto, y el «2,2 o menos» del consenso argentino vive en una
  columna COMPARATIVA de su Tabla 1. La de cardio-oncología tiene **dos** (IIa · C las dos) y la
  de amiloidosis **dos** (I · B y IIa · C).

- **NO SE CREÓ LA EVIDENCIA DE ECO PULMONAR, Y LA FICHA DICE POR QUÉ**: ese consenso publica
  **grado de acuerdo entre panelistas**, no clase ni nivel. Una sección sin enunciados graduados
  sería una sección vacía, o peor, una con clases inventadas.

- **ESTUDIOS GUARDADOS: NO HUBO NADA QUE MAPEAR, Y ESTÁ MEDIDO.** La etiqueta del score nunca se
  persistió —se calcula de los campos—, el Excel guarda «Score amiloidosis ETT» como NÚMERO, las
  **440 columnas** salen idénticas clave por clave y el censo de **1038 campos** da el MISMO hash.
  Un estudio viejo con la cadena «INTERMEDIO» guardada en ese campo tampoco rompe la fila.

- ⚠️ **CUATRO TRAMPAS DE INSTRUMENTACIÓN, LAS CUATRO CON EL MISMO SÍNTOMA: un verde sobre cero
  elementos, o un rojo que nace en la sonda.**
  1. **`\s` dentro de un template literal se come la barra** y el regex borra las **eses**: el
     título volvía «Perfil hemodinámico — pre ione y re i tencia». Va `/\\s+/g`.
  2. **`style.display = ''` BORRA el inline** y devuelve el elemento a su CLASE — y las
     subpestañas de Referencias se ocultan por clase. El barrido medía **cero nodos**. Va `'block'`.
  3. **`calentar()` PONE EN CERO el score de amiloidosis**: corre todas las `calc*`, y las del
     propio score llaman a `amCalcSinDato` con los campos de medición vacíos. La captura mostraba
     «Completá los parámetros» sobre una escena de 6 puntos.
  4. **`indicAbrir()` BORRA las respuestas del panel**, al abrir Y al cerrar. Leerlo después de
     contestar devolvía la sección sin contestar; y abrir antes de CADA respuesta dejaba viva sólo
     la ÚLTIMA. El panel se abre **una vez por escena**.
  Y dos más en el caso de la suite: **el barrido del AJ3 está debounced a 220 ms**, y **el bloque
  de hemodinámica NO va al cuerpo del informe** sino a la hoja del PDF.

- **SIETE CASOS ADAPTADOS, CADA UNO CON EL MOTIVO ESCRITO**, y todos son DENOMINADORES que esta
  tanda movió de verdad: **TC-99** (exigía «Eco a los 5 anos post-RT», el seguimiento tras
  radioterapia de antes de alinearlo), **TC-322** (su denominador exige escenario para TODA
  sección de `IND_SECS`, y entraron tres), **TC-471** y **TC-500** (el registro de globos, 52 →
  56), **TC-502** (el censo de Referencias, 33 → 34, y la lista de tarjetas sin botón, que pierde
  `pul-balik` y gana cuatro), **TC-507** (los chips «Criterio de EcoSmart», 10 → 11) y **TC-509**
  (el mismo censo, por la ficha de eco pulmonar).

- **Cobertura: TC-533**, con **64 condiciones**, teclas reales y midiendo lo renderizado.
  **Sabe fallar por los dos caminos**: contra el HEAD de la tanda en un worktree aparte,
  **43 condiciones en rojo** y **ninguna por excepción**; y por mutación dirigida,
  ****17/17** muertas** (`scripts/_mut_j2.py`, una mutación por cada cosa que la tanda cambió).

- **Línea base al cierre: suite **544/548**** con el pendrive `DISK_IMG` ****MONTADO** —verificado al abrir y al cerrar, con un `ls` de nombres reales—**, Semgrep
  **127 WARNING / 0 ERROR en 1 app** —la MISMA línea base que dejó la tanda J—, Excel en **440**
  columnas y celular en ****64 a 360 px y 73 a 390 px, con 18 ALTA cada uno****. Los rojos son ****TC-223, TC-376, TC-390 y TC-406**, los MISMOS CUATRO de la línea base; **TC-223 es el documentado****. **El denominador sube a
  **548****: esta tanda agregó **TC-533**. TC-318 sigue excluido.
- **CHROME Y WEBKIT COINCIDEN**, en los dos temas y en 1440 y 390 px, sobre las cuatro pantallas
  que la tanda toca y las tres Evidencias nuevas. Cero errores de consola y de página en los dos motores, cero recortes, sin scroll horizontal y 17 de 17 pestañas con caja. La única diferencia es **un píxel** en el ancho del glifo ⓘ (13×13 contra 12×13), que es rasterización de fuente.
- **`index.html` pasó de 9,52 MB / 134.867 líneas a 9,59 MB / 135.540 líneas** — medido con `wc -c` y `wc -l`
  DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **Dónde está todo:** `docs/mapa/j2-hemo-onco-amiloide-pulmon.md` (**mapa NUEVO**, 15,4 KB),
  **siete mapas con un puntero cada uno** —`congenitas-otros` 33,0 KB · `panel-evidencia`
  32,5 KB · `tests` 31,0 KB · `referencias-subpestanas` 24,9 KB · `tanda-r2-correcciones`
  23,2 KB · `aj3-ett-avanzado` 16,6 KB · `otros-pericardio-pulmon` 14,2 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda J2» con la tabla **«Cambios de evidencia»** de dieciséis
  filas, y `docs/PENDIENTES.md` → **CINCO** cosas declaradas (**J2-a** a **J2-e**).

### Pericardio y taponamiento, constricción y VEXUS — «J» (2026-10-24)

- **Son SIETE commits, en el orden del encabezado, y los seis ítems se completaron enteros.**
  `87a17f9` (J-1) · `f883476` (J-2) · `4f081cd` (J-3) · `c7d07b2` (J-4) · `b4ff8ec` (J-5) ·
  `4326c2e` (J-6) · el de cobertura y documentación. Sello **`v20261024-1502`**.
  Al **empezar**, `origin/main` estaba en **`2b9f3ef`** con **49** commits locales sin pushear;
  al cerrar hay **56**, medidos con `git rev-list --count origin/main..HEAD` y no contados a mano.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LAS TRES FUENTES SE LEYERON EN IMAGEN, no en texto extraído.** ESC 2025 de miocarditis y
  pericarditis (ehaf192): Tabla 17 folio 62, Recommendation Table 12 folio 43, Recommendation
  Table 24 folio 64, apartados 11.9.2 y 11.9.3 folio 63, y la Figura S1 del suplemento en la
  hoja 6; la traducción de la SEC se cotejó en su folio impreso 70. Beaubien-Souligny 2020:
  Figura 1 página 3 y el resumen de la página 1. Pieske 2019: folio 3303.
  **El `Vexus.pdf` de la carpeta 22 SÍ es el artículo original** —Cowork no lo había podido
  confirmar—, así que los commits 5 y 6 siguieron.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el colapso de la aurícula derecha estaba en
  la FASE EQUIVOCADA.** La app decía «sistólico (≥1/3 del ciclo)» en el rótulo, en la frase del
  informe y en la hoja del PDF; la Tabla 17 publica «Diastolic collapse of the RA». Y la fila de
  **mayor especificidad de esa tabla** —la duración del colapso por encima de 0,34 del ciclo,
  especificidad 100 %— **no tenía dónde cargarse**.

- **DOS CORTES DE VCI EN LA MISMA APP, Y ES DELIBERADO.** El del pericardio bajó a **>20 mm** y
  el del HTP sigue en 21, porque lo publica otra guía que esta orden excluía. El comentario que
  decía «el MISMO criterio que la categoría C» era justo lo que hacía marcar plétora un
  milímetro tarde. Medido en los cuatro bordes con teclas reales: 19 no, 20 no, 21 SÍ, 22 sí.

- **VEXUS USABA UN SOLO OPERADOR DONDE EL ARTÍCULO USA DOS.** La Figura 1 pide «≥ 2 cm» para el
  grado 1 y «> 2 cm» para el 2 y el 3; la app usaba `>= 20` para los cuatro, así que una vena
  cava de 20,0 mm exactos con un vaso severo daba VEXUS 2 donde la figura **no tiene fila**. Se
  elige el grado MENOR, que es el lado que no afirma de más. Medido en nueve combinaciones.

- **TRES CONJUNTOS DE FRASES SALIERON DEL PAPEL FIRMADO**, y ninguno se borró de la app: el
  aviso de confirmación invasiva de constricción (que se publicaba **siempre**, y la guía lo
  condiciona a que la imagen no sea concluyente, Clase IIa · Nivel C), la recomendación de
  cateterismo de la rama de criterios mixtos, y las tres conductas por grado de VEXUS. Las tres
  viven hoy en Evidencia; las de VEXUS con el chip «Criterio de EcoSmart», porque **el artículo
  no da pasos por grado** y no se cita ninguna otra fuente para ellos.

- **ENTRARON DOS CAMPOS NUEVOS Y NINGUNA COLUMNA DE EXCEL**: `dpt_col_ad_dur` y `cvr_hep_coc`.
  Campos del estudio 1053 → 1055, Excel en **440 columnas** con las mismas claves en las diez
  escenas del A/B. El cociente hepático **no vota**: las reglas de conteo no tienen fuente y la
  orden las excluía, así que mover `nC`/`nR` habría sido tocar contenido clínico sin permiso.
  Medido: 0,77 / 0,78 / 0,79 dan 6/6/6 de conteo.

- ⚠️ **UN DEFECTO PROPIO QUE LA SUITE CAZÓ: la ficha nueva de Referencias quedaba FUERA de las
  seis subpestañas.** Existía, se abría desde su encabezado y el buscador la indexaba, pero no
  estaba en `REF_SUBTAB`, así que `refSubInit` no la reubicaba y el médico que navegara por las
  solapas no la encontraba nunca. Lo destaparon TC-502 y TC-520, que censan las entradas y
  exigen que ninguna quede sin panel. **Arreglado en el código, no adaptado en el caso.**

- ⚠️ **Y UNA MUTACIÓN SOBREVIVIÓ, Y TENÍA RAZÓN.** Sacarle el `onclick` al encabezado de la
  ficha dejaba TC-532 entero en verde: el caso leía el contenido abriendo el cuerpo por su id,
  así que no medía la única puerta que el médico tiene. **Una ficha que existe y no se puede
  abrir es, para quien usa la app, una ficha que no existe.** Se agregó la condición (G0), que
  aprieta el encabezado de verdad, y la mutación pasó a morir: **12/12**.

- ⚠️ **DOS TRAMPAS DE INSTRUMENTACIÓN, LAS DOS CON EL MISMO SÍNTOMA: un rojo que parece verde.**
  1. **`\s` dentro de un template literal se come la barra** y el regex pasa a borrar las
     **eses**: «Constricción» se vuelve «Con tricción» y una búsqueda por prefijo informa «NO HAY
     SECCIÓN» sobre secciones que existen. Va `/\\s+/g`.
  2. **El panel de Evidencia hay que ABRIRLO antes de contestar.** Quien engancha el oyente de
     los botones es `_indClinCablear()`, y a esa la llama `indicAbrir()`, **no** `indicRender()`.
     Sin abrir, un `click()` no escribe nada y los bloques salen vacíos — que es exactamente el
     mismo texto que da una Evidencia sana sin contestar.
  3. Y una tercera, de medición: **la bibliografía de la sección imprime el texto completo de la
     referencia**, que nombra las filas con su clase y su nivel, así que buscar «Clase I · Nivel
     C» da positivo sobre la bibliografía aunque no se haya emitido una sola recomendación.

- **Cobertura: TC-532**, con teclas reales y midiendo lo renderizado. **Sabe fallar por los dos
  caminos**: contra el HEAD de la tanda en un worktree aparte, **61 condiciones en rojo** y
  ninguna por excepción; y por mutación dirigida, **12/12 muertas** (`scripts/_mut_j.py`).
  **CINCO casos adaptados con el motivo escrito**: TC-322 (el denominador que exige escenario
  para TODA sección de `IND_SECS`), TC-502 y TC-509 (el censo de entradas de Referencias),
  TC-507 (el chip del módulo, que cambió de contenido, y el conteo de chips) y TC-520.

- **Línea base al cierre: suite 543/547** con el pendrive `DISK_IMG` **MONTADO** —verificado al
  abrir y al cerrar, con un `ls` de nombres reales—, Excel en **440** columnas y celular en
  **63 a 360 px y 72 a 390 px con 17 ALTA cada uno**: el MISMO par que dejaron AJ5 y AJ6, sin un
  hallazgo nuevo. Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los MISMOS CUATRO de la
  línea base; **TC-223 es el documentado**. **El denominador sube a 547**: esta tanda agregó
  **TC-532**. TC-318 sigue excluido.
  La suite se corrió **en diez tandas de 55 casos en primer plano**, por lo que ya documenta la
  AJ6: acá los procesos en segundo plano se mueren sin escribir una línea. Se pierde el efecto de
  ORDEN entre tandas, y eso tiene un caso conocido: **TC-507 tiene un `(DENOM D)` que se pone
  rojo cuando corre junto a otros casos y verde aislado y dentro de su lote**. Medido las dos
  veces; no es de esta tanda.
- **CHROME Y WEBKIT COINCIDEN**, en los dos temas y en 1440 y 390 px, sobre las tres pantallas y
  las tres Evidencias: el rótulo diastólico, la plétora en los cuatro bordes, el chip sin el 21 y
  con los dos colapsos, la constricción sin aviso invasivo con el cociente en 0,79, los seis
  grados de VExUS y cero frases de conducta. **Cero errores de consola y de página en los dos
  motores**, y sin scroll horizontal ni un solo texto recortado.
  ⚠️ **Y LA PRIMERA VERSIÓN DE ESA SONDA MEDÍA SIN DENOMINADOR**: abría la pestaña «Pericardio y
  pulmón» a mano y las tres secciones viven en otra, así que los **valores** salían bien —se leen
  del DOM, que existe igual— pero la captura mostraba una pantalla vacía y el chequeo de recorte
  corría sobre nodos de ancho 0, que descarta. **Un verde sobre cero elementos.** Hoy la pestaña
  se deduce del propio elemento y cada escena reporta su denominador.
- ⚠️ **SEMGREP PASA DE 124 A 127 WARNING, 0 ERROR, y los TRES son míos y están explicados.** Son
  la misma regla —`ceibo-xss-innerhtml-concat`— sobre las tres ramas del aviso de la VCI de
  `calcVEXUS`, que antes tenían el número escrito a mano y hoy interpolan la constante
  `VEXUS_VCI_MM`. **No entra un solo dato del usuario**: es un entero definido en el archivo. Se
  deja así a propósito, porque la alternativa es un rótulo fijo que miente el día que se mueva el
  corte, que es justo lo que este archivo prohíbe.
- **`index.html` pasó de 9,46 MB / 134.230 líneas a 9,52 MB / 134.867 líneas** — medido con
  `wc -c` y `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)
  ⚠️ **SE SELLÓ DOS VECES, y la segunda es la que vale.** El primer sello salió ANTES del arreglo
  de `REF_SUBTAB`, así que quedaba describiendo un árbol que ya no era el del commit. El sello
  bueno es **`v20261024-1502`**, y TC-126 —el caso que valida el formato del sello— se volvió a
  correr después.

- **Dónde está todo:** `docs/mapa/j-pericardio-constriccion-vexus.md` (**mapa NUEVO**, 11,2 KB),
  la ficha del caso en `docs/mapa/tests-fichas-532.md` (**archivo propio**, porque
  `tests-fichas.md` está a 800 bytes del techo), **seis mapas con un puntero cada uno**
  —`congenitas-otros` 31,7 KB · `panel-evidencia` 31,0 KB · `referencias-subpestanas` 23,9 KB ·
  `tanda-r2-correcciones` 21,9 KB · `otros-pericardio-pulmon` 13,2 KB · `tests` 29,7 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda J» con la tabla **«Cambios de evidencia»**, y
  `docs/PENDIENTES.md` → **SIETE** cosas declaradas (**J-a** a **J-g**).

### Fallot, el eco pulmonar en columnas, Config y el buscador — «AJ6» (2026-10-24)

- **Son OCHO commits y los cuatro ítems se completaron enteros, con SIETE cosas declaradas y no
  tocadas.** `fc7ce7f` (AJ6-1) · `70d5623` (AJ6-3) · `840d9b2` (AJ6-4a y AJ6-4b) · `558c125`
  (AJ6-2) · `4b946d5` (AJ6-5, los tres hallazgos de releer el propio diff) · `221a193` (los cinco
  casos y el arnés de mutaciones) · `36a25b9` (los cuatro casos que destapó la suite completa) ·
  `fa85cc7` (la documentación). Sello **`v20261024-1037`**.
  Al **empezar**, `origin/main` estaba en **`2b9f3ef`** con **40** commits locales sin pushear;
  al cerrar hay **49** —los ocho de la tanda más este renglón, que es su propio commit—, medidos
  con `git rev-list --count origin/main..HEAD` y no contados a mano.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- ⚠️ **EL PENDRIVE SE DESENCHUFÓ Y LA MÁQUINA SE CERRÓ A MITAD DE LA SUITE, Y LA CORRIDA QUEDÓ
  COLGADA EN TC-151 SIN MORIR.** No dio un error: dejó de avanzar y el proceso siguió vivo 81
  minutos. Es el modo de falla que `CLAUDE.md` ya documenta para `DISK_IMG` —«`readdir` sigue
  contestando de caché y `readFile` revienta»— con la vuelta de tuerca de que acá **ni reventó**.
  Se mató el árbol de Chrome, se verificó que el pendrive estuviera montado **y legible de verdad**
  (un `ls` con nombres reales, no un montaje vacío) y **la suite se corrió entera de nuevo sobre el
  árbol ya sellado**. La lección vieja se amplía: **una corrida que no avanza no es una corrida
  lenta**; antes de creerle a un total hay que mirar si el último caso cambió.

- ⚠️ **Y LA SUITE COMPLETA DESTAPÓ CUATRO CASOS MÁS SOBRE EL CONTRATO VIEJO**, que las corridas
  por grupo no podían ver: TC-121 (exigía la frase del criterio volumétrico en el cuerpo del
  informe), TC-144 (el `data-mod` de Calculadoras y las siete claves de `EE_MODULES`), TC-268 (un
  denominador de ocho `[data-mod]`; quedan seis) y TC-293 (exigía que TODO bloque plegado se
  llamara «Si fuera reumática» —una lista escrita a mano— y contaba los plegados de todo el panel
  en su control negativo). Los cuatro reescritos donde la cosa vive hoy. **Son SEIS casos
  adaptados en total**, contando TC-502 y TC-509.

- ⚠️ **EN ESTE ENTORNO LOS PROCESOS EN SEGUNDO PLANO SE MUEREN SIN ESCRIBIR UNA LÍNEA.** La suite
  completa murió **tres veces** así —una con el pendrive afuera, otra colgada en TC-151 durante 81
  minutos sin avanzar y sin error— y el barrido de mutaciones **dos**, dejando su directorio de
  trabajo sin borrar. Sin la línea `RESULTADO` el veredicto es **NO CORRIÓ**, así que no se puntuó
  nada de esas corridas. Las dos cosas se corrieron en **tandas cortas en primer plano**: la suite
  en **seis tandas de 91 casos**, cada una con su `RESULTADO`, y las mutaciones en cinco grupos
  —para eso el arnés ganó un `--solo`—. Lo que se pierde es el efecto de ORDEN entre tandas, que es
  justo lo que el AJ5 neutralizó reponiendo la sesión y el visor ANTES de cada caso.

- **Línea base al cierre: suite **542/546** con el pendrive `DISK_IMG` **MONTADO** —verificado al
  abrir y al cerrar—, Semgrep **124 / 0 ERROR en 1 app**, Excel en **440** columnas y celular en
  **63 a 360 px y 72 a 390 px con 17 ALTA cada uno**: el MISMO par que dejó AJ5, sin un hallazgo
  nuevo. Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los MISMOS CUATRO de la línea base;
  **TC-223 es el documentado**. **El denominador sube a 546**: esta tanda agregó **TC-527, TC-528,
  TC-529, TC-530 y TC-531**. TC-318 sigue excluido.
- **`index.html` pasó de 9,44 MB / 133.914 líneas a 9,46 MB / 134.230 líneas** — medido con `wc -c`
  y `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **EL DEFECTO QUE CERRÓ, EN UNA LÍNEA: el informe firmado de la tetralogía de Fallot reparada
  terminaba con una CONDUCTA** —«reemplazo valvular pulmonar indicado (ESC 2020, Clase I)», «sin
  síntomas ni otros criterios de reintervención — seguimiento»— **y la Evidencia de Referencias
  afirmaba, desde que nació, que eso no pasaba**: «El informe y la conclusión de la aplicación son
  DESCRIPTIVOS: estas recomendaciones se publican acá y no en el papel firmado». El comentario de
  `_indTdFIP` declaraba la mentira y mandaba el pendiente a PENDIENTES.md. Hoy el cuerpo sale en
  esquema —una fila vacía, el título y renglones con guion— y describe; la indicación, el
  seguimiento y la clase viven sólo en la Evidencia.

- **LO QUE NO SE MOVIÓ, Y ESTÁ MEDIDO CAMPO POR CAMPO.** `conducta` sigue armándose y sigue
  viajando en `resumen`, que es lo que consume la **diapositiva del PPT** —su único consumidor— y
  donde la conducta SÍ va por decisión escrita; `clave` no cambia, que es lo que clasifica el
  **Laboratorio**; `ccHoja` sigue recibiendo `c.parrafos`, que en Fallot es `[]`, así que la hoja
  del PDF sale igual. Y el **EN SUMA nunca tuvo conducta**: medido en HEAD, los tres marcadores en
  `false`, así que no se le tocó una letra.

- **TRES RENGLONES Y NO DOS, y se reporta.** La orden describe dos porque su ejemplo sólo carga
  esos datos. La CIV residual y la taquicardia ventricular no pertenecen ni al tracto de salida ni
  al ventrículo derecho, así que salen en un tercer renglón con el mismo formato en vez de colgarse
  del vecino, que diría de la válvula pulmonar algo que no es cierto.

- ⚠️ **LA FILA VACÍA DE SEPARACIÓN NO PUEDE SER LA CADENA VACÍA.** `_infEscribir` recibe
  `inf.filter(Boolean)`: un `''` se descarta en el borde y la separación no llega nunca al papel.
  El archivo ya lo tenía escrito **dos veces** —para `etePars` y para la hoja de
  cardio-oncología—, las dos como «ese separador es código muerto», y las dos veces nadie lo usó
  para nada. Va una línea con **un espacio**, que es *truthy*, y el PDF la imprime porque
  `amiloSanPDFml` conserva la sangría de cada línea.

- ⚠️ **`lista.map(_indFilaHTML)` LE PASABA EL ÍNDICE COMO SEGUNDO PARÁMETRO.** Los tres llamadores
  del renderizador de filas del panel eran `map(_indFilaHTML)`, que entrega `(fila, índice,
  array)`. El día que esa función tuviera un segundo parámetro, **la fila 0 se pintaría de un modo
  y las otras quince de otro**, sin un error y sin que nada lo delate. Ese día era hoy. Los tres
  pasan por una lambda explícita.

- ⚠️ **CON LA PROSA PLEGADA, EL ALTO NO BAJABA — Y LA CAUSA ERA EL REPARTO DE LA TABLA.** La celda
  de estado baja de **322 px a 30** y el reparto automático le daba esos 290 al **valor**, dejando
  el rótulo en **90 px**: las preguntas pasaban de 53 a **109** y el total quedaba igual. Con el
  rótulo como celda golosa (`width:100%`) y un piso de 170 px para las botoneras de más de dos
  opciones, la sección pasó de **1562 a 1256 px** sin maximizar (−19,6 %), de 1514 a **1114**
  maximizada (−26 %) y de 2430 a **1917** a 390 px (−21 %), con las dieciséis filas de dato en
  **43 px** —una línea—.

- ⚠️ **EL TÍTULO DE UN BLOQUE PLEGABLE NO PUEDE LLEVAR UN CONTADOR.**
  `_indRepintarConservando` indexa cada `<details>` por «summary del padre ▸ summary», así que
  «Lo que falta contestar (2)» **cambia de clave** en cuanto el médico contesta: el bloque se
  cerraba solo en el repintado, que es exactamente el salto que esa función existe para evitar.

- ⚠️ **TRES HALLAZGOS DEL PROPIO DIFF EN CONFIG, Y UNO DEJABA A REFERENCIAS SIN PUERTA EN EL
  CELULAR.** (1) Las dos líneas que escondían `.tabs-tools` **no hacían nada visible**:
  `.subtabs-wrap .tabs-tools{display:flex !important}` le gana a un `style.display` inline, así que
  lo único que escondía al botón era su `data-mod`. (2) En Avanzado, esa misma fila entraba en un
  recálculo que, sin un solo `[data-mod]` que contar, le escribía `display:none` **al botón que no
  se puede ocultar**. (3) `ecoAdvBuild` salía por `return` para **todos** los botones en Modo
  Básico, así que el desplegable de móvil quedaba **vacío** — y por debajo de 768 px las dos filas
  están en `display:none !important` y la navegación va por ahí. Medido después: en Básico el
  desplegable ofrece exactamente `refs`.

- ⚠️ **EL `blur` SE DISPARA ANTES DEL `click`, Y `activeElement` NO ALCANZA EN WEBKIT.** Vaciar el
  buscador en el `blur` borraba los botones de resultado y **el resultado se volvía intocable**; y
  mirar `document.activeElement` no distingue un clic adentro de uno afuera, porque en WebKit un
  `<button>` **no recibe el foco** al hacerle clic. Se resolvió con una marca de `pointerdown` en
  el host y un retardo de 120 ms. Medido en los dos motores.

- **A/B DE CONTROL contra el HEAD inicial: CERO diferencias** en informe (tres estilos), EN SUMA
  (tres), **PDF generado de verdad** (65 textos y 26 figuras, idénticos) y **Excel en 440
  columnas**, sobre un estudio sin ninguno de estos módulos. El censo de campos guardados da el
  **mismo hash** (1036 campos). Y con el pulmón **integrado** —sin ese clic no publica nada y medir
  sin integrar da cero líneas y parece que nada cambió— el párrafo y la línea del EN SUMA salen
  byte por byte como los dejó el AJ2, en 1440 y en 390 px.

- **Cobertura: cinco casos nuevos (TC-527 a TC-531) y DOS reescritos al contrato nuevo** —TC-502
  (A1b) y TC-509 (F1) exigían `data-mod="calculadoras"` en la sub-pestaña y hoy exigen lo
  contrario—. ⚠️ **La geometría de las media queries NO se mide en el arnés**: su ventana abre por
  debajo de 1100 px, así que ni las cuatro columnas del pulmón ni las dos de la Evidencia se
  aplican mientras el caso corre. Las dos condiciones **leen la regla** de `document.styleSheets` y
  la exigen por su forma, que es la lección de TC-522 (A4c) del AJ5, y TC-529 lo declara en una
  condición propia (`innerWidth < 1100`).

- **Dónde está todo:** `docs/mapa/aj6-fallot-pulmon-refs.md` (**mapa NUEVO**, 20,8 KB, con la ficha
  de los cinco casos); **cuatro mapas con un puntero cada uno** (`congenitas-otros` 31,0 KB ·
  `referencias-subpestanas` 23,1 KB · `otros-pericardio-pulmon` 12,4 KB · `panel-evidencia`
  30,2 KB); `docs/fuentes/FUENTES.md` → «La tanda AJ6», que existe **para decir que no se verificó
  ni se citó una fuente nueva**, con la tabla de dónde venía cada cosa que se movió; y
  `docs/PENDIENTES.md` → **SIETE** cosas declaradas (**AJ6-a** a **AJ6-g**).
  ⚠️ **Y `panel-evidencia.md` SE PARTIÓ, que era la deuda que esperaba desde el 2026-10-12**: su
  mecanismo de citación salió a `docs/mapa/panel-evidencia-citas.md` (7,0 KB) sin cambiar una
  palabra, y el mapa bajó de **35,3 a 29,5 KB** antes de recibir su puntero. Medido con `wc -c`
  **antes** de escribir, no después.

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
