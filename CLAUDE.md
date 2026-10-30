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
| **Tocar un CORTE DE SEGMENTO AÓRTICO de la Figura 5** —la unión sinotubular o la aorta ascendente por sexo, la frase «por encima del límite superior de lo normal», el chip del cayado y la descendente con su globo, la coartación en el EN SUMA, los tres textos de su pantalla, o los cinco umbrales de la Tabla 68 con sus nueve factores en tres estados | `docs/mapa/ao2-segmentos-bicuspide.md` |
| **Tocar las CÚSPIDES de la bicúspide, sus SEIS dibujos o la animación de la apertura** | `docs/mapa/vab-cuspides-dibujos.md` |
| **Tocar el CRITERIO DE DILATACIÓN DE LA RAÍZ AÓRTICA** —el corte por sexo, el índice de dimensión aórtica, el dueño `aoSegRef`/`aoSegIda`/`aoSegDil`, el globo ⓘ, el cruce entre las pantallas de BICÚSPIDE y de COARTACIÓN, o lo que la tanda AJ4 tocó de la Evidencia de la VAB | `docs/mapa/aj4-raiz-aortica.md` |
| **Tocar la SINCRONIZACIÓN de los dos campos de la raíz aórtica, el grado «sin sexo cargado», el voto del índice en el papel, las dos líneas nuevas del ⓘ de la raíz, los tres arreglos de pantalla de la tanda G o su sonda sistemática** | `docs/mapa/g-raiz-aortica.md` |
| **Tocar una AORTOPATÍA —Marfan, Loeys-Dietz, Turner, ACTA2, Ehlers-Danlos vascular—, la COARTACIÓN, el texto de la VAB o el MOTOR DE EVIDENCIA DE AORTA**: la tabla y el folio de cada síndrome, el corte de dilatación con su dueño, el cuestionario o las recomendaciones por debajo de 45 mm | `docs/mapa/aorta-aortopatias-evidencia.md` |
| **Tocar un CORTE o un OPERADOR del VD, de la AD, de la VCI o de la RAÍZ AÓRTICA**: la Tabla 1 de la ASE 2025, su evaluador, los cuatro grados de cada parámetro o el «40 mm o más» del seno | `docs/mapa/corazon-derecho-ase2025.md` |
| **Tocar algo que la TANDA AJUSTES-1 movió** (30/10): el rótulo del cactus, la nota de complejidad retirada del papel, la pastilla de la orejuela sin veredicto, el recuadro del Doppler que no se dibuja sin velocidad; el dibujo de la orejuela JUNTO a su tabla en el PDF o con su resumen al lado; la VAB con su resumen al costado; el EN SUMA nombrando la bicúspide; la cita de la ASE 2025 de la frase del gradiente; o la FILA DE MINIATURAS de lo que va al PDF | `docs/mapa/aj1-orejuela-pdf-ensuma.md` |
| **Tocar algo de la tanda AJ1**: los cortes del VD de la versión de MAYO, el strain de pared libre sin sexo, la coartación reparada, el índice de dimensión aórtica, el Ehlers-Danlos del EN SUMA, el corte alternativo de la IM secundaria o el flujo reverso de la aorta descendente | `docs/mapa/aj1-ajustes.md` |
| **Tocar el VENTRÍCULO DERECHO**: sus TRES columnas de campos, el orden del cuadro de referencias, la disfunción sistólica, la pared graduada, el Tei, la FEVD, la relación VD/VI o el Qp | `docs/mapa/vd-derecho.md` · la tanda G1 en `docs/mapa/vd-g1-columnas.md` |
| **Tocar algo que la TANDA CORRECCIONES movió** (30/10): el informe de la orejuela sin veredicto de aptitud, el corte ÚNICO de 75 ms del TRIV con las tres formas de la frase de elementos a favor de HTP, la grilla de VD/AD en tres columnas de SEIS, la raíz leída en Marfan, «Incluir en el PDF» independiente de Config, o el dibujo de la orejuela portado de la demo | `docs/mapa/cor-correcciones.md` |
| **Tocar el RESULTADO del strain del VD en Referencias, el TRIV tricuspídeo por sus dos puertas, el recálculo al cargar el SEXO, o la raíz aórtica sin sexo en el papel y el valor del índice en su pastilla** | `docs/mapa/y-vd-sexo-aorta.md` |
| **Tocar la casilla de la FAC, la mudanza del DIÁMETRO DE LA ARTERIA PULMONAR o el selector de VD/VI** (la tanda G3, partida a archivo propio) | `docs/mapa/vd-g3-campos.md` |
| **Tocar una TARJETA ⓘ de AD/VCI, del VD o de la AORTA, el NOMOGRAMA de los senos de Valsalva, o sus entradas de Referencias** | `docs/mapa/evidencia-derecho-aorta.md` |
| **Tocar el cociente TAPSE/PSAP o el color del aviso del Tei** (el DIÁMETRO DE LA ARTERIA PULMONAR se mudó al VD en el G3) | `docs/mapa/tapse-psap-ap.md` |
| **Tocar la RELACIÓN VD/VI**: el campo numérico, el selector de tramo, las cuatro reglas que los sincronizan, la función dueña o cualquiera de sus CUATRO lectores | `docs/mapa/vd-vi-selector.md` |
| **Tocar la pestaña REFERENCIAS**: las cinco subpestañas y su reparto, el buscador, el botón «Ver referencia» de las tarjetas ⓘ o la TABLA DE CIRUGÍA AÓRTICA | `docs/mapa/referencias-subpestanas.md` |
| **Tocar el panel de Evidencia: agregar una cita, una sección o un sub-bloque** | `docs/mapa/panel-evidencia.md` |
| **Tocar un TEXTO de la pantalla de Evidencia o de una ficha de Referencias**: las OCHO secciones compactas y su orden, qué nota va al ⓘ y qué va a `FUENTES.md`, la cita única al final del bloque, `_popNotas`, el mensaje del Forrester y su frontera con el informe, o las tres fichas tocadas | `docs/mapa/a-evidencia-textos.md` |
| **Tocar el REGISTRO DE CITAS del panel**: `IND_REFS`, el marcador `ecosmart`, el allowlist `IND_REF_IDX` o la numeración por sección | `docs/mapa/panel-evidencia-citas.md` |
| **Agregar un TÉRMINO al glosario del panel (el ⓘ con tarjeta)** | `docs/mapa/panel-evidencia-terminos.md` |
| **Tocar la TABLA DE SIGNOS de HTP, la compuerta del informe con la VRT «no medible», las dos hojas del PDF de HTP y HF-PEFF, el cálculo de «provisoria» o sus dos secciones de Evidencia** | `docs/mapa/htp-hfapeff.md` |
| **Tocar el CARTEL DE PÉPTIDOS del HFA-PEFF, su puntaje o el plan Básico/Avanzado**: el espejo del péptido, el ritmo que se lee, los cortes por tipo o por qué `showTab` no chequea el plan | `docs/mapa/hfapeff-peptidos.md` |
| **Tocar un CRITERIO o un CORTE del puntaje HFA-PEFF**: la tabla contra el original, las tres contradicciones del artículo, la PSAP o el operador del IMVI | `docs/mapa/hfapeff-criterios.md` |
| **Tocar los VOLÚMENES del VI en AI/VI**: el VSFVI automático, el volumen latido automático, quién lee el VSFVI, o el GASTO CARDÍACO del PDF y su frecuencia cardíaca | `docs/mapa/vi-volumenes-automaticos.md` |
| **Ver por dónde sale un dato** (informe narrativo, EN SUMA, PDF, PPT) | `docs/mapa/informe-pdf-excel.md` |
| **Tocar una COLUMNA del EXCEL del Laboratorio**: `LAB_XLS_MAP`, las 440 claves, los tipos, los alias de cabecera del importador o las dos columnas del G2 | `docs/mapa/excel-laboratorio.md` |
| **Tocar la IMPORTACIÓN del Excel**: el guardián de columnas, las listas de valores, los rangos, el mensaje de las columnas calculadas o la exportación JSON | `docs/mapa/importacion-excel.md` |
| **Tocar un CORTE del SGL, el SIGNO del strain en el papel, el RÓTULO de pantalla, los TERRITORIOS coronarios con su aviso, los PATRONES del ojo de buey o el 2,9 del score de amiloidosis** | `docs/mapa/aj9-sgl-patrones.md` |
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
| **Tocar CUÁNDO se actualiza un campo ESPEJO —los 28 `*_ro`, los `data-espejo` y los textos calculados que leen otra pestaña— o DE QUIÉN sale la PAM**: el registro `ESPEJOS_VIVOS`, el barrido colgado del debounce de 220 ms, las seis exclusiones con su motivo, `pamEfectiva()` y su aviso de discrepancia | `docs/mapa/b-espejos-pam.md` |
| **Tocar el POSOPERATORIO de cirugía cardíaca**: la grilla de drogas, el acordeón de monitoreo, el lactato, el esquema animado con sus cavidades y sus caños, la vasoplejia con la PAM, los grados del derrame pleural, lo que sale al informe y lo que se queda en la pantalla, su ficha de Referencias o su Evidencia | `docs/mapa/g-posoperatorio.md` |
| **Tocar algo que la tanda POP-V2 movió del POSOPERATORIO** (29/10): el orden de la pestaña y el desplegable de fármacos, la dosis que se calcula sola con sus dos marcas, la PAM por línea arterial, el Impella, el ECMO venovenoso o el timing del balón, las cuatro señales sueltas de la conclusión, o el patrón fuera del PPT | `docs/mapa/pop-v2-posoperatorio.md` |
| **Tocar algo que la tanda AJ6 movió** (24/10): el cuerpo del informe de la Fallot reparada —el esquema, la fila vacía y la conducta retirada—, su Evidencia compacta con la prosa en el ⓘ, la ecografía pulmonar en cuatro columnas, o Referencias y Calculadoras dejando de ser módulos opcionales con el buscador que tapa las fichas | `docs/mapa/aj6-fallot-pulmon-refs.md` |
| **Tocar algo que la tanda AJ7 movió** (24/10): la línea de Fallot del EN SUMA y su `resumen`, la línea de presión de llenado del HF-PEFF, la fila «Descripción» del ateroma, el retiro automático del bloque integrado y el aviso al exportar, el VOTO del strain del VD y su banda en Referencias, el bloqueo del Tipo de IM y el Carpentier con prótesis, el rótulo que se achica, las dos conductas de constricción, la compuerta de su Evidencia, el aviso de VExUS armado con `join`, o el dueño único del corte de HTP | `docs/mapa/aj7-correcciones.md` |
| **Tocar el CARPENTIER de la mitral —quién es su dueño y dónde se dice—, el AVISO de la Evidencia de la TRICÚSPIDE, el strain del VD por debajo de 15 %, o las dos TABLAS de la OREJUELA** | `docs/mapa/e-carpentier-tricuspide-orejuela.md` |
| **Tocar algo de ECO ESTRÉS, o entender por qué su código sigue en el archivo sin interfaz**: las cinco piezas (A), las compartidas (B), las que tocan algo guardado (C), las TRES compuertas, las CUATRO familias «ee» —tres vivas— o la calculadora de probabilidad pre-test de la ESC 2019 que vive adentro | `docs/mapa/eco-estres-inventario.md` |
| **Montar un A/B o un barrido de MUTACIÓN, o leer una trampa de instrumentación** | `docs/mapa/arneses-ab-mutacion.md` |
| **Agregar o correr un caso de prueba** | `docs/mapa/tests.md` · fichas en `docs/mapa/tests-fichas-550.md` (TC-550), `docs/mapa/tests-fichas-538.md` (TC-538), `docs/mapa/tests-fichas-537.md` (TC-537), `docs/mapa/tests-fichas-536.md` (TC-536), `docs/mapa/tests-fichas-535.md` (TC-535), `docs/mapa/tests-fichas-532.md` (TC-532), `docs/mapa/tests-fichas.md` (TC-499 en adelante), `docs/mapa/tests-fichas-496-498.md`, `docs/mapa/tests-fichas-491-495.md` y `docs/mapa/tests-fichas-481-490.md` |
| **Tocar el DIBUJO ESTÁTICO de la mitral en ETE**: la tabla única de festones por ángulo, la geometría, la línea del plano, el giro, las tres vistas con sus LETRAS DE FESTÓN, **la ORIENTACIÓN de la TRANSGÁSTRICA**, el PDF, los CUATRO DIBUJOS DE MEDIDAS TEER, **los CRITERIOS TEER y sus cortes** o **el ESPEJO de la FEVI y el DSFVI del TEER** | `docs/mapa/mitral-dibujo-estatico.md` |
| **Tocar algo que la tanda R2 corrigió** (21/10): las cinco opciones del derrame y la traducción del token viejo, el repintado de la VAB con el gesto de la pastilla, los seis puntos de la probabilidad de HTP, el e′ medial en tres tramos, el espesor relativo y el criterio por eco de la amiloidosis, el SGL y la calculadora de cardio-oncología, el síndrome intersticial difuso por zonas, el índice cardiaco y la RVS, o la orejuela | `docs/mapa/tanda-r2-correcciones.md` |
| **Tocar algo que la tanda R movió**: la lesión presente sin grado de la VAB, los cortes del TEER, la severidad de la disfunción del VD, el área de la AI, los grados del derrame, el taponamiento que ya no concluye, el VD/VI del TEP o los criterios declarados de Referencias | `docs/mapa/tanda-r-referencias.md` |
| **Tocar la sección de la VÁLVULA AÓRTICA BICÚSPIDE**: la disposición en tres columnas, las seis tarjetas ⓘ, los factores de riesgo con casilla, el DIBUJO y sus puntos sensibles, **la SIMETRÍA DE LAS CÚSPIDES y el ÁNGULO con que se dibuja**, **los SEIS dibujos por tipo y la ANIMACIÓN de la apertura**, **la FUNCIÓN VALVULAR derivada**, **el RESUMEN esquemático y su texto en Evidencia**, la morfología que sigue al tipo de fusión, la descripción del informe, el PDF o el recordatorio de la coartación | `docs/mapa/vab-bicuspide.md` |
| **Visor de cineloop, medición, calibración, IndexedDB** | `docs/mapa/imagenes-visor.md` |
| **Tocar el TRIV del VD en las referencias de VD/AD o de Doppler tricúspide, el ÍNDICE DE TAMAÑO AÓRTICO del síndrome de Turner, el iDA de la raíz con su decimal, o lo que la AORTOPATÍA HEREDITARIA publica en el informe y en el EN SUMA** | `docs/mapa/noc-b-aorta.md` |
| **Tocar el ESQUEMA DE LA OREJUELA del ETE —su lugar al lado de los campos, los rótulos que se pisaban, el movimiento del latido, el chorro leído de Válvulas, el contraste espontáneo o los tres controles—, el ⓘ de «Orejuela izquierda», o el BORRADO de los videos y cineloops de un estudio** | `docs/mapa/noc-a-orejuela.md` |
| **Tocar la pantalla «IMÁGENES GUARDADAS» de Guardados, la ESTRELLA DE IMAGEN con su nota, el PPT armado desde ahí o la FUNCIÓN COMÚN que guarda un esquema de la app como imagen —con su primer uso en la orejuela—**: los dos botones, los meses plegados, el índice sin `dataURL`, las dos listas del registro (`imgs` y `esqs`), el límite de 24, el cuadrado de tapar datos o por qué pintar y guardar son dos funciones | `docs/mapa/img-guardadas.md` |
| **Tocar algo que la tanda AJ2 corrigió** (23/10): la VRT «sin datos» frente a «no medible», el tipo de IM vacío, la coartación sin gradiente, la aorta que ya no gradúa, el ateroma sin riesgo embólico con el grosor completando el grado, el HF-PEFF sin FEVI y la negrita de su hoja, el eco pulmonar «bilateral», el score de TEP con un solo vocabulario y su maqueta en tres grupos, el EN SUMA que ya no niega lo que el informe describe, los dos buscadores o las tildes | `docs/mapa/aj2-correcciones.md` |
| **Tocar algo de la tanda I**: el TRAMO del score de Wilkins, la orejuela y sus dispositivos, la reparabilidad mitral con el rango de tenting, las DOS escalas de ateroma, las tres secciones de Evidencia de la ETE, las notas al pie de la estenosis tricuspídea o la INSUFICIENCIA PULMONAR en Fallot reparada con sus dos guías | `docs/mapa/tanda-i-ete.md` |
| **Tocar la ESTENOSIS MITRAL en el LABORATORIO**: las seis categorías, las dos casillas del filtro, el gráfico de distribución, el PDF de auditoría o el PPT | `docs/mapa/laboratorio-estenosis-mitral.md` |
| **Tocar la VISTA 2D de las válvulas**: el lector único del estado, las tarjetas, la tabla de cavidades, el dibujo, los chorros o el «por qué» | `docs/mapa/vista-2d-valvulas.md` |
| **Tocar el PANEL EN LÍNEA de la vista 2D**: el botón que prende y apaga, el apagado automático, la sincronía en vivo, el alto del dibujo o la línea de fase | `docs/mapa/vista-2d-en-linea.md` |
| **Orientarse en otro módulo** (Congénitas, Laboratorio, PPT, Cardio-Onco, Pericardio) | `docs/mapa/congenitas-otros.md` |
| **Tocar algo que la tanda C1 movió** (28/10): los cuatro rótulos de VExUS contra la Figura 7 de Rola 2021 y su Evidencia sin conducta por grado, la casilla de HTP que dice «sin evaluar», los tres mensajes del Forrester con su dueño único, la RVS leyendo `pamEfectiva` con el origen de sus insumos, el POCUS del posoperatorio viendo el `vd_vi` de VD/AD, o el DIAGRAMA DE FORRESTER de la pestaña de Hemodinámica con sus dos cortes | `docs/mapa/c1-hemodinamica.md` |
| **Tocar la HEMODINÁMICA, la CARDIO-ONCOLOGÍA, el SCORE DE AMILOIDOSIS o la ficha de ECO PULMONAR**: los tres ⓘ del índice cardíaco, la RVS y el Forrester; las dos ramas de RVS baja; el seguimiento tras radioterapia; las etiquetas del score que salieron; las TRES Evidencias nuevas o la ficha `ref-pulmon` | `docs/mapa/j2-hemo-onco-amiloide-pulmon.md` |
| **Tocar el DERRAME y el TAPONAMIENTO, la CONSTRICCIÓN vs RESTRICCIÓN o VEXUS**: la fase y la duración del colapso de la aurícula derecha, los DOS cortes de plétora de VCI de la app, el aviso invasivo retirado, el cociente de la vena suprahepática, los dos operadores de VCI de VExUS o las tres Evidencias nuevas | `docs/mapa/j-pericardio-constriccion-vexus.md` |
| **Saber DÓNDE ESTÁ una pantalla**: la columna izquierda y la fila de arriba, Pericardio y masas, las dos sub-pestañas de Otros, el eco pulmonar unificado, Calculadoras dentro de Referencias, C. Congénitas, el Fonocardiograma retirado o la frase de Balik | `docs/mapa/pestanas-reorganizacion.md` |
| **Citar un dato de una guía** (documento, folio, frase verificada) | `docs/fuentes/FUENTES.md` |
| **Tocar la POSICIÓN del selector de origen mitral o de los dos campos de la prótesis TRICÚSPIDE, la regla de DOS O MÁS de su obstrucción, la onda E en cm/s, el Ar−A suplementario, la FEVI del Laboratorio o los dos toggles de PDF** | `docs/mapa/cortos-arreglos.md` |
| **Tocar el SCORE de TEP, su ficha de Referencias o su Evidencia**: los seis criterios con su corte, el TAPSE que NO es el de la pestaña VD, el cociente sin corte, el dueño del VD/VI o las siete ramas de la Tabla 8 | `docs/mapa/tep-score.md` |
| **Tocar un CORTE del VD para EMBOLIA PULMONAR —el TAPSE de 17 mm o el VD/VI de 0,9—, su cita, el dueño del predicado, el signo de McConnell o la línea de que el eco orienta** | `docs/mapa/tep-aha2026.md` |
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

⚠️ **Al 2026-10-24, tras la tanda G, el mapa nuevo nació chico** —`g-posoperatorio.md`, **16,5 KB**—
y los seis que recibieron un puntero quedaron medidos ANTES de escribirlo, que es la regla:
`informe-pdf-excel.md` **34,4 KB**, `congenitas-otros.md` 33,3, `panel-evidencia.md` 33,1,
`tests.md` 31,4, `referencias-subpestanas.md` 25,3 y `j2-hemo-onco-amiloide-pulmon.md` 15,7.
**`informe-pdf-excel.md` queda a 600 bytes del techo: la próxima tanda que lo toque tiene que
partirlo.**

⚠️ **Al 2026-10-29, tras la tanda IMÁGENES, el mapa nuevo nació chico** —`img-guardadas.md`,
**17,3 KB**— y los cuatro que recibieron un puntero quedaron medidos ANTES de escribirlo, que es
la regla: `tests.md` **27,7 KB**, `informe-pdf-excel.md` 27,2 (no se tocó),
`imagenes-visor.md` **20,8 KB**, `e-carpentier-tricuspide-orejuela.md` **19,8 KB** y
`arneses-ab-mutacion.md` **15,0 KB**. La ficha del caso salió a archivo propio
(`tests-fichas-550.md`, 6,2 KB) en vez de engordar `tests.md`.

Sin importaciones automáticas (`@archivo`): un `@` acá vuelve a desbordar la ventana.

---

## Qué es EcoSmart y cómo se trabaja

- App clínica de ecocardiografía en **un solo `index.html`**: HTML + CSS + JS inline, sin build,
  sin frameworks. Hoy **10,32 MB / 145.243 líneas**, medido con `wc -c` y `wc -l` el 2026-10-30 al
  cierre de la tanda **AORTA-2**, sobre el árbol ya sellado (`v20261030-1830`, md5 `5ddfacc3`).
  (Antes: 10,14 MB / 142.743 al cierre de IMÁGENES, sello `v20261029-2127`, md5 `ca2c048e`.)
  (Antes: 10,04 MB / 140.965 al cierre de la Y, Parte 1, sello `v20261029-1647`, md5 `7ef7a5de`.)
  (Antes: 10,02 MB / 140.761 al cierre de POP-V2, sello `v20261029-1425`, md5 `f72a928c`.)
  ⚠️ **Y ESTE RENGLÓN SE HABÍA QUEDADO SIETE TANDAS ATRÁS**: decía «9,79 MB / 138.038 líneas»,
  que es el cierre de la tanda **E** del 27/10, mientras la D, el D-9, el D-10, el D-11, la C1,
  la C2, la TEP y la G escribían su delta en su propia sección sin tocar éste, que es el que se
  lee para presupuestar contexto. **2.151 líneas de diferencia.**
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
### Los pendientes de AJ3, AJ5, AJ6, J y J2, y el G-a — «AJ7» (2026-10-25)

- **Son NUEVE commits** —los siete de la orden más el **commit 8** del agregado y el de
  documentación— y **los seis ítems de código se completaron enteros**. `41ab435` (1) ·
  `dc1f238` (2) · `d3586bc` (3) · `aee9e93` (4) · `2517d55` (5) · `d8bc0e2` (6) · `354d9a4` (8a)
  · el de cobertura y documentación. Sello **`v20261025-0117`**.
  Al **empezar**, `origin/main` estaba en **`2b9f3ef`** con **72** commits locales sin pushear.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- ⚠️ **ESTA TANDA NO ABRIÓ UN SOLO PDF, Y SE DECLARA.** Su orden prohíbe leer archivos fuera del
  proyecto y la biblioteca de guías vive fuera. Todo lo que se cita sale del **registro
  verificado de `docs/fuentes/FUENTES.md`**, escrito por las tandas que sí leyeron el original.
  Lo que el registro no cubría **no se escribió**: «un solo centro» de VExUS → **AJ7-d**.

- **TRES PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **La línea base del celular NO era 63/72 con 17 ALTA**: era **65/74 con 19**, medido al
     abrir. Esa cifra es la de la tanda J, dos tandas atrás; la J2 y la G sumaron un globo cada
     una. El agregado lo corrigió a mitad de la tanda y autorizó los dos.
  2. **El denominador de la suite NO era 534**: son **549** —`TC-1` a `TC-534` más quince
     `TC-GR-01` a `TC-GR-15`—, así que **los lotes de la tanda G dejaron quince casos sin
     ejecutar**. → **AJ7-f**.
  3. **La ASE 2025 de corazón derecho no publica cortes de moderada ni de severa del strain**,
     así que no hubo nada que «reportar sin aplicar»: censado por tercera vez.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el mismo PDF describía en el cuerpo y
  recomendaba en la hoja.** `tdfConclusion().resumen` tiene **dos** consumidores —la hoja de
  congénitas del PDF y la diapositiva del PPT— y la AJ6 lo había dejado con la conducta adentro
  creyendo que el único era el PPT. Medido sobre el PDF generado de verdad: «reemplazo valvular
  pulmonar», «Clase I», «Clase IIa» y «medidas seriadas» pasan de **1 aparición a 0**.

- ⚠️ **LAS DOS CONDUCTAS DE CONSTRICCIÓN NO TUVIERON EL MISMO DESTINO, Y ESO ES EL PUNTO.**
  «requiere correlación clínica e imagenológica» la respalda la Recommendation Table 24 (folio 64,
  **I · C**) y la Evidencia **ya la publicaba**: salió del papel y no hubo nada que mover.
  «Considerar RMC con gadolinio» vive en la rama **RESTRICTIVA**, que esa tabla no cubre:
  **se retira y NO va a Evidencia**. Medido: 1 → 0 y **2 → 0** en el PDF generado.

- ⚠️ **LO QUE LA COMPUERTA NUEVA DE LA EVIDENCIA DE CONSTRICCIÓN CUESTA, MEDIDO Y DECLARADO.**
  Cierra J-b —un estudio de solo taponamiento ya no la despierta— pero la orden pone `e′` entre
  los datos propios, y `e′` está cargado en casi todos los estudios: **un perfil diastólico de
  rutina ahora SÍ la abre**, con las filas del pericardio en «—». No cambia el papel. → **AJ7-c**.

- **EL STRAIN DEL VD VOTA, Y NO PUEDE PASAR DE LEVE.** 15 a 20 % leve; por debajo de 15, «leve
  como mínimo»; por encima de 20 no vota. Si `vdDisfGrado(tapse, sp)` dio un grado, **ese manda**.
  Su banda se declara en Referencias con ficha propia `FUN-VD-008` y **sin corchete**.

- ⚠️ **EL `opacity` EXPLÍCITO DE LA MITRAL PROTÉSICA NO ERA REDUNDANTE, Y LO DESTAPÓ UNA MUTACIÓN
  QUE SOBREVIVIÓ.** Sacándolo, un `<select>` deshabilitado **igual** queda en 0,7: lo pone la
  hoja de estilos **del navegador** (`select:disabled`), no la app. El 0,5 lo fija y lo hace
  comparable entre motores, y la condición pasó a exigirlo **exacto**.

- **CINCO MUTACIONES SOBREVIVIERON AL PRIMER BARRIDO, Y LAS CINCO ERAN COBERTURA QUE FALTABA.**
  Tres por **frenos que tapan al que se muta** —la marca de «editado a mano» la tapa la
  comparación con `_amiloUltimo`, salvo **después de guardar y reabrir**; el piso del achique sólo
  se ejercita con un rótulo que **no entra ni al mínimo**; y el strain sólo puede pisar un grado
  si **vota**, o sea con TAPSE y S′ anormales *y* el strain en la banda leve—. Una por una
  **mutación mal escrita** (claves de objeto agregadas **antes** del `estado`, que gana el de
  abajo). Y una por el `opacity` de arriba. **34/34 muertas** tras cerrarlas.

- **CELULAR: de 65 y 74 con 19 ALTA a 63 y 72 con 17**, que es la línea base original. Los dos
  globos que la J2 y la G sumaron llevan `.vinfo-btn-44`, **sin márgenes negativos**: un área de
  44×44 encajada con `margin:-16px` taparía 16 px del campo de abajo. Verificado con
  `elementFromPoint` sobre las cuatro esquinas y el centro — **los cinco puntos dan el botón**.

- **ESCRIBIR NO SE SIENTE LENTO, Y ESTÁ MEDIDO.** Con **ocho** bloques integrados, doce teclas
  reales cuestan entre **0,10 y 0,30 ms** cada una (media 0,18), y el barrido de los 17 módulos
  corre **UNA** vez, 220 ms después de la última tecla, y tarda **2,1 ms**.

- **Línea base al cierre: suite 545/550** en diez lotes de 55 **cubriendo los 550**, con el
  pendrive `DISK_IMG` **MONTADO** —verificado al abrir y al cerrar con un `ls` de nombres
  reales—. Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los MISMOS CUATRO de la línea base,
  más **TC-507**, que **vuelve verde solo y en su propio lote** (el `(DENOM D)` que la tanda J ya
  documenta, y que **falla igual contra el HEAD de esta tanda**, verificado en un worktree).
  Semgrep **124 WARNING / 0 ERROR**, que es lo que la orden pedía. Excel en **440** columnas con
  las mismas claves y los mismos valores. Censo de campos **1039**, con el **mismo hash**.
- **CINCO CASOS ADAPTADOS, cada uno con el motivo escrito**: **TC-60** (la frase de la RMC),
  **TC-121** (el criterio volumétrico, que la AJ6 había dejado en `resumen`), **TC-526** (el
  strain que no votaba), **TC-527** (el `resumen` que «seguía llevando la conducta») y **TC-507**
  (el conteo de chips, 15 → 16).
  ⚠️ **Y TC-507 ERA DEPENDIENTE DEL ORDEN POR MI CULPA**: el chip nuevo lo pinta
  `evRefPintar('vd2')`, que corre cuando alguien abre esa ficha, así que el caso daba 15 solo y
  16 después de un caso que abriera Referencias. **Se pinta dentro del caso antes de contar.**
- **CHROME Y WEBKIT COINCIDEN**, en los dos temas y en 1440 y 390 px, sobre las ocho zonas que la
  tanda toca: **cero errores de consola y de página en los dos motores**, 17 de 17 pestañas con
  caja, **cero scroll horizontal** y **cero texto recortado**. La única diferencia son **10 px**
  en el ancho útil del `<select>` de la morfología (128 contra 138 a 1440 px), que es el ancho de
  la flecha del control: en los dos el rótulo **entra**.
- **`index.html` pasó de 9,68 MB / 136.700 líneas a 9,72 MB / 137.115** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **Dónde está todo:** `docs/mapa/aj7-correcciones.md` (**mapa NUEVO**, 14,0 KB), la ficha del
  caso en `docs/mapa/tests-fichas-535.md` (**archivo propio**, porque `tests-fichas.md` estaba en
  34,2 KB), **diez mapas con un puntero cada uno** —medidos ANTES de escribir—,
  `docs/fuentes/FUENTES.md` → «La tanda AJ7» con la tabla **«Cambios de evidencia»** de doce
  filas, y `docs/PENDIENTES.md` → **DIEZ** cosas declaradas (**AJ7-a** a **AJ7-j**).

### Blindaje del código de Eco Estrés — «AJ10-B» (2026-10-26)

- **DOS commits, y el comportamiento de la app NO cambia.** Uno con **TC-536** y otro con los
  comentarios, el sello **`v20261026-2221`** y la documentación. Al empezar, `origin/main` =
  `HEAD` = **`95184ae`**: los 80 commits del AJ7 **ya están publicados**, verificado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
- **CERO código borrado y cero líneas ejecutables tocadas.** El diff de `index.html` son **10
  líneas de comentario reemplazadas y 73 agregadas**, verificado línea por línea, con los 17
  bloques de JS inline parseando.

- **DOS PREMISAS DEL INVENTARIO AJ10-A ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **Las piezas (A) no son «unas 738 líneas, 0,5 %»: son 832 líneas y 56.747 bytes**, medido
     pieza por pieza. La diferencia es del tamaño de la sección del PDF, que esa cuenta parece
     no haber incluido.
  2. **Los cortes de SGL de −16 y −20 NO «viven sólo en ese código».** El **−16** es además el
     criterio `hfaicos_gls_alt` del HFA-ICOS de cardio-oncología; el **−20** es la referencia
     `sgl:{ref:-20}` del Laboratorio y los textos del 3D del VI. Lo exclusivo de `eeEvalGLS` es
     la **clasificación en tres bandas con el rótulo «borderline»**.

- ⚠️ **TC-536 DESTAPÓ UNA CALCULADORA CLÍNICA AJENA ESCONDIDA DENTRO DEL BLOQUE.** `ptpCad()`
  —**probabilidad pre-test de enfermedad coronaria, ESC 2019**, con su tabla por grupo etario y
  sexo y las cuatro recomendaciones, 25 líneas— vive en el `<script>` de Eco Estrés. Está tan
  muerta como el resto (nadie la llama, sus cinco campos `ee-ptp-*` no existen) **pero no es
  maquinaria de Eco Estrés: borrar la pieza A1 la borra.** → **AJ10-C**.

- **NADA DE ECO ESTRÉS LLEGA HOY A UNA SUPERFICIE FIRMADA, y el único «hallazgo» fue MÍO.** El
  PDF salió con «eco estr» adentro y era **el nombre del paciente de prueba** —«Prueba Eco
  Estres»—, que el PDF imprime. El fixture envenenaba lo que el caso cuenta. Por eso el
  diagnóstico de cada marcador imprime ahora **55 caracteres de contexto a cada lado**.

- **TC-536: 24 condiciones, SEIS de ellas denominadores.** Fija las tres compuertas —el elemento
  `ee-incluir-pdf` en el DOM, `eeInformeLineas()` vacía y `eeHasData()` en falso— con el
  escenario **peligroso** incluido: la bandera encendida **a mitad de sesión** (la limpieza sólo
  corre al arrancar) más `eeHasData()` en `true` por `eeSetBullState`. Y con **cinco controles
  negativos** de lo que sigue vivo, porque el prefijo `ee` no identifica al módulo.
- **10/10 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, cada una matando
  exactamente lo que le toca. La que más dice es **M2**: sacar la condición del `getElementById`
  de la compuerta del PDF mata **sólo B3**, o sea que la presencia del toggle en el DOM es **lo
  único** que para la sección «ECO ESTRÉS» cuando la bandera está encendida y hay datos.

- **Línea base al cerrar, idéntica a la de abrir:** suite **546/550** en diez lotes de 55
  **cubriendo los 550 contados** (ejecutados 550 de 550), con el pendrive `DISK_IMG` **MONTADO**
  y listando nombres reales al abrir y al cerrar; los rojos son **TC-223, TC-376, TC-390 y
  TC-406**, los cuatro de siempre. Semgrep **124 WARNING / 0 ERROR**. Excel **440** columnas.
  Censo de campos **1039**, hash `1636376460`. Celular **63 a 360 px y 72 a 390, con 17 ALTA**.
  Sin huérfanos nuevos.

- **Dónde está todo:** `docs/mapa/eco-estres-inventario.md` (**mapa NUEVO**, 12,4 KB, con la
  tabla A/B/C), la ficha del caso en `docs/mapa/tests-fichas-536.md` (**archivo propio**),
  y `docs/PENDIENTES.md` → **AJ10-C**, con la medición que falta: cuántos estudios reales
  guardados llevan claves `ee-*` de Eco Estrés dentro de sus `campos`.

### Los textos de Evidencia y de Referencias — «A» (2026-10-27)

- **CINCO commits, y la app no cambió ningún dato clínico.** `c6e65d0` (A-1) · `8564981` (A-2) ·
  `c40df82` (A-3) · `4f17e36` (A-4) · el de cobertura y documentación. Sello **`v20261027-0155`**,
  md5 de `index.html` **`45d7e5ab`**. Al empezar, `origin/main` = `HEAD` = **`7d71583`**.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **NI UN CORTE, NI UN UMBRAL, NI UNA CLASE, NI UN NIVEL, NI UNA TABLA, NI UN FOLIO SE MOVIÓ, Y
  ESTÁ MEDIDO POR DOS CAMINOS.** El A/B de catorce escenas da **CERO diferencias** en informe
  (tres estilos), EN SUMA, las **440** columnas de Excel clave por clave, los 943/960 campos, el
  Laboratorio por sus ocho funciones dueñas, veinte cápsulas de pantalla, el PDF generado de
  verdad en sus **seis** plantillas y el PPT (23 textos). Y el guardián de la regla R7
  (`_ab_apanel.mjs`) no encontró **ninguna** cadena «Clase …», «folio N» o «Tabla N» que estuviera
  en HEAD y no esté hoy en alguna superficie medida.

- **LAS OCHO SECCIONES COMPACTAS YA ERAN OCHO ANTES DE ESTA TANDA, Y SU DOCUMENTACIÓN DECÍA UNA.**
  Medido en HEAD con la sonda de dos motores: ocho grillas `data-ind-compacta`, y **cero** con la
  grilla primero. Hoy son ocho de ocho. El comentario del AJ6-2 decía «es la única de las quince»
  —cierto cuando se escribió— y entre la J, la J2, la G y el AJ6 se sumaron siete sin que nadie lo
  tocara. **TC-528 (C1) medía «es la ÚNICA del panel» y pasaba en verde porque su escenario
  despierta una sola sección: un chequeo que no podía fallar.**

- ⚠️ **LA INVERSIÓN DEL AJ6-2 SE REVIRTIÓ, Y ES DECISIÓN DE MAICOL.** Las ocho vuelven al orden de
  las otras siete secciones del panel: datos → lo que falta contestar → recomendaciones con su
  clase y su nivel → teoría → bibliografía. Con **un solo lugar de llamada** para `_bloRec`, el
  riesgo de numeración de corchetes que el AJ6-2 documentó desaparece por construcción.

- ⚠️ **TRES PARTES DE LA ORDEN SE PARARON Y SE REPORTARON, NO SE APLICARON.**
  1. El punto **2d(iv)** en su origen: la cápsula de `calcHemo` publica «Requiere IC + PCP
     estimada» cuando falta uno solo de los dos, y su texto lo leen `amiloTextoHemo()` —que va al
     informe integrado y a la hoja de ETT Avanzado del PDF— y la diapositiva del PPT. Se arregló
     **en la fila de la Evidencia**; la cápsula no se tocó, y **TC-537 (N4)** lo fija como control
     de frontera. → `PENDIENTES.md` **A-d**.
  2. La **leyenda de los corchetes** del panel, que la regla R1 nombra: no es una nota de método,
     es el reparo de un número que cambió de significado. → **A-c**.
  3. La regla **R4 en `_indAo`**: vaciar su `notas` deja a esa sección **sin su «ⓘ Ver detalle»**,
     y TC-293 cuenta ese invariante —midió 13 secciones y 12 controles—. Revertido. → **A-g**.

- **TRES PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **La suite no tenía 550 casos ni 551: tenía 551** (TC-1 a TC-536 sin huecos más quince
     TC-GR), así que la bitácora del AJ10-B está **corrida en uno**. Y **TC-507 no es un rojo de
     la línea base**: salió verde en las dos corridas completas.
  2. **La tabla de la ficha del VD no tiene columna «Fuente»**: sus tres columnas son «Parámetro |
     Varón | Mujer», y la fila repetía el número en la de **Mujer**. → **A-a**.
  3. **La tabla «Monitoreo recomendado» no tiene cinco palabras mal escritas: tiene diez**, y dos
     son una eñe y no un acento («anos» por «años»). Y la sección tiene **siete** tablas, de las
     que **tres** publican el calendario de eco. → **A-b**.

- **LAS TRES MUTACIONES QUE SOBREVIVIERON AL PRIMER BARRIDO: DOS ESTABAN MAL ESCRITAS Y UNA ERA UN
  HUECO REAL.** M6 cambiaba el PREFIJO de la línea y dejaba intacto el localizador que la
  condición busca; M9 escondía el `<summary>` y dejaba el `<details>` en pie. **M15 sí era un
  hueco**: el bloque de hemodinámica llega a la hoja del PDF **sólo si el médico lo integra**, y
  medido además que **NO entra en `informe_texto`**, contra lo que dice su propio comentario.
  **15/15 muertas** tras cerrarlo, con md5-guard sobre el árbol vivo.

- ⚠️ **TC-537 DABA VERDE AISLADO Y ROJO EN LA CORRIDA COMPLETA**, y la causa es la de TC-507 en el
  AJ7: tomaba la **primera** `table.ev-tabla` del documento, y en el suite otra ficha ya la había
  pintado —`_evRefTabla` se usa en **cinco**—. Hoy la busca dentro de `#ref-vd2`.
  Y **TC-512 se me pasó del censo** porque grepeé «SIN SEXO CARGADO» **sólo en `index.html`** y no
  en la suite.

- **DIEZ CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: TC-99, TC-111, TC-512, TC-518,
  TC-521, TC-528, TC-532, TC-533, TC-534 y TC-535.

- **Línea base al cierre: suite 548/552** en diez lotes de 55 (el último de 57) **cubriendo los
  552**, con el pendrive `DISK_IMG` **montado y listando nombres reales** al abrir y al cerrar, y
  la guarda de md5 confirmando que el árbol no cambió durante la corrida. Los rojos son
  **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre. Semgrep **124 WARNING / 0 ERROR**.
  Excel **440** columnas. Censo **1023** campos, 0 huérfanos. Celular **63 hallazgos a 360 px y 72
  a 390, 17 ALTA en cada ancho** — idénticos a HEAD **uno por uno**.
- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES** (dos motores × 1440 y 390 px × dos temas):
  17/17 pestañas con caja, las ocho compactas con la grilla primero, 85 globos ⓘ todos cerrados,
  la ficha del posoperatorio con 16 filas / 16 globos / 4 chips, cero scroll horizontal y **cero
  errores de consola y de página**. Los **ocho textos recortados son los mismos que en HEAD**:
  preexistentes, y ninguno en una zona que esta tanda toque.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** El binario de chromium de Playwright no
  está instalado en esta máquina, así que ese motor va por el Chrome del sistema.
- **`index.html` pasó de 9,72 MB / 137.178 líneas a 9,74 MB / 137.373** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **Dónde está todo:** `docs/mapa/a-evidencia-textos.md` (**mapa NUEVO**, 10,1 KB), la ficha del
  caso en `docs/mapa/tests-fichas-537.md` (**archivo propio**, porque `tests-fichas.md` ya estaba
  en 34,2 KB), **ocho mapas con un puntero cada uno** —medidos ANTES de escribir—, el mapa del
  AJ6-2 con su párrafo vencido corregido, `docs/fuentes/FUENTES.md` → «La tanda A» con las notas
  movidas **textuales** y la tabla «Cambios de evidencia» de veintiuna filas, y
  `docs/PENDIENTES.md` → **SIETE** cosas declaradas (**A-a** a **A-g**).

### Los espejos en vivo y el dueño único de la PAM — «B» (2026-10-27)

- **TRES commits, y no se movió un corte, un umbral, un rótulo de grado ni una frase del
  informe.** `6302650` (B-1) · `eccb3ba` (B-2) · el de cobertura y documentación. Sello
  **`v20261027-1204`**. Al empezar, `origin/main` = `HEAD` = **`3d93858`**, el cierre de la
  tanda A, ya publicado. **El push lo corre Maicol: esta tanda tenía orden expresa de NO
  pushear.**

- **EL DEFECTO, MEDIDO ANTES DE ESCRIBIR UNA LÍNEA.** Las veinticuatro fuentes de otra pestaña
  cambiadas de a una, esperando 1.400 ms, y después preguntando a cada una de las 94 funciones
  del embudo si movía algo: **once pintores quedaban viejos** —`popSync` por catorce fuentes,
  `tvSync` por cinco, `dapSync` y `vapSync` por cuatro, `eteShuntSync` y `ebsSync` por tres,
  `dsavSync` por dos, y `calcVD`, `coaSync`, `tgaSync` y `cvpaSync` por una—. Tras la tanda la
  misma medición da **cero en las veinticuatro**.

- **UN MECANISMO, NO UN PARCHE POR CAMPO, Y SIN TEMPORIZADOR NUEVO.** `ESPEJOS_VIVOS()` declara
  dieciocho pintores y `_espejosBarrerTodos()` los recorre, igual que `RECALC_MODULOS` /
  `_recalcModulos`. Cuelga del **mismo** debounce de 220 ms que ya existía para los bloques
  integrados, y va **antes** de `amiloRefrescarTodos()`. Seis funciones quedan fuera con su
  motivo escrito en el código: `popSync` y `calcVD` **escriben campos del estudio**,
  `imEspejosRestaurar` y `sincronizarTEERDesdeGlobal` se pasan la marca `espejoVivo` y mueven en
  cada pasada con el dato quieto, y `v2dCerrar` y `m3dBotonSync` **cierran paneles abiertos**.

- ⚠️ **LA ÚNICA ESCRITURA DEL BARRIDO SOBRE UN CAMPO TIPEABLE, DECLARADA PORQUE ESCONDERLA SERÍA
  PEOR.** `tvSync` vacía `tv_tipo` y `tv_morfologia` cuando la TV no está documentada — y en el
  mismo gesto los **deshabilita**, que es por lo que una foto de campos editables no los ve. No
  es una pérdida nueva: ya corría en las cinco rutas de restauración. TC-538 **(d1b)** la fija.

- **LA PAM TIENE UN SOLO DUEÑO** —catéter › tipeada › calculada— y lo leen la fila «PAM» del
  Doppler aórtico, la vasoplejia del posoperatorio y su esquema. **Las NUEVE combinaciones**
  —las siete del pedido, la vacía y una novena que agregué, la calculada con `hemo_pam` borrado
  a mano— dan el papel **IDÉNTICO**: `popPatron()`, la hoja del posoperatorio, el informe y el
  EN SUMA. Lo único que cambia es la pantalla.
  ⚠️ **LA CALCULADA GANA CON EL VALOR REDONDEADO** que `aoPresionSync` materializa, no con el
  crudo de `aoPamCalc()`: lo destapó el A/B, y devolver el crudo movía 87 por 86,666… en el
  número que entra al corte de vasoplejia.

- **TRES PREMISAS DEL PEDIDO ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **S4 — la PAM tipeada SÍ se conserva al recargar.** Lo que no sobrevive es la marca
     `derivadoDe`. → **B-b**.
  2. **S5 — `vd_vi` SÍ llega al PDF**: la tabla del VD imprime `VD/VI: 1.30`. Lo que no lo lee
     es el POCUS del posoperatorio, y **el mismo PDF**, cinco páginas después, imprime
     `TAPSE 16 mm · VD/VI -`. → **B-d**.
  3. **S6 — la dosis SÍ llega** a la hoja del PDF y al PPT (`Noradrenalina 0.25 mcg/kg/min`); no
     al cuerpo del informe ni al EN SUMA, y eso es el diseño del módulo. → **B-e**.
  Y **S3 era falsa para los espejos de constricción/restricción**: ésos no estaban viejos.

- **LAS DIECISÉIS MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda
  de md5. ⚠️ **M14 sobrevivió al primer barrido y tenía razón**: el control (d1) sacaba la foto
  **después** de que el pintor ya hubiera pisado el campo, así que no podía fallar. Es el «freno
  que tapa al que se muta» que este archivo ya documenta. Se cerró con **tres centinelas**
  sembrados a mano, y al cerrarlo apareció la compuerta de `tvSync` de arriba.

- ⚠️ **EL ARNÉS DE A/B DE VARIAS TANDAS NO PASABA POR EL EMBUDO DE RESTAURACIÓN.** El montaje
  hacía `RECALC_MODULOS.forEach(...)` y `RECALC_MODULOS` es una **función**: tiraba `TypeError`,
  el `catch` lo tragaba y el embudo **nunca corría**. Viene desde `_probe_r2ab.mjs`. Lo destapó
  esta tanda al agregarle una entrada y ver que el A/B no la tocaba. Corregido en
  `_probe_bab.mjs`; **`_probe_aab.mjs` y `_probe_r2ab.mjs` siguen con el defecto**. → **B-g**.

- ⚠️ **Y LA SONDA DE DOS MOTORES SE COLGÓ UNA HORA Y CUARTO SIN ESCRIBIR UN BYTE.** `r.difieren.length`
  con `r = 'EXC'` —en HEAD `pamEfectiva` no existe— tiraba dentro del `setTimeout`, antes del
  `res(...)`: la Promise nunca se resolvía y `page.evaluate` de Playwright, **que no tiene
  timeout**, quedaba dormido a 0 % de CPU. Sólo podía colgarse del lado de HEAD: es una
  asimetría del A/B. Hoy cada escena resuelve siempre, cada `evaluate` va con reloj que nombra
  motor, ancho y escena, y cada paso escribe en stderr. Relanzada tarda **menos de 2 minutos**.

- **A/B contra HEAD en DIECIOCHO escenas: CERO diferencias** en informe (tres estilos), EN SUMA,
  las **440** columnas de Excel clave por clave, los 960 campos, el Laboratorio por sus ocho
  funciones dueñas, el **PDF generado de verdad** en sus seis plantillas y el PPT (23 textos).
  **21 diferencias de pantalla** como control positivo, todas en los tres nodos de la PAM.

- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES** (dos motores × 1440 y 390 px × dos temas):
  17/17 pestañas con caja, cero scroll horizontal, **cero errores de consola y de página** en
  los dos árboles, y la tabla de la PAM **idéntica** campo por campo. Los espejos siguen al dato
  en los ocho cruces del árbol nuevo y en **ninguno** del viejo.
  **Escribir no se volvió más lento**: tecla media 0,79–1,27 ms en HEAD contra 0,75–1,33 ms hoy,
  y el barrido de espejos corre **una** vez, 220 ms después de la última tecla, en 1,7 a 5 ms.

- **Línea base al cierre: suite 549/553** en once lotes de 55 **cubriendo los 553** (ejecutados
  553 de 553), con el pendrive `DISK_IMG` **montado y listando nombres reales** al abrir y al
  cerrar. Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre. Semgrep
  **124 WARNING / 0 ERROR**. Excel **440** columnas. Censo **1023** campos, 0 huérfanos. Celular
  **63 hallazgos a 360 px y 72 a 390, 17 ALTA en cada ancho** — idénticos a HEAD *uno por uno*.
- **UN CASO VIEJO ADAPTADO, con el motivo escrito: TC-424.** Medía `aviso === ''` sobre un
  escenario con **dos** fuentes de PAM que difieren, que es justo donde el dueño único avisa.
  Sigue exigiendo que lo tipeado no se pise y que no se marque «auto», y ahora además que el
  aviso nombre a las dos: así puede volver a fallar.
- **`index.html` pasó de 9,74 MB / 137.373 líneas a 9,76 MB / 137.611** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **Dónde está todo:** `docs/mapa/b-espejos-pam.md` (**mapa NUEVO**, 13,3 KB), la ficha del caso
  en `docs/mapa/tests-fichas-538.md` (**archivo propio**, porque `tests-fichas.md` ya estaba en
  34,2 KB), **cinco mapas con un puntero cada uno** —medidos ANTES de escribir—,
  `docs/fuentes/FUENTES.md` → «La tanda B» con su tabla de cambios de evidencia **vacía a
  propósito**, y `docs/PENDIENTES.md` → **SIETE** cosas declaradas (**B-a** a **B-g**).

### El Carpentier, la tricúspide, el strain del VD y la orejuela — «E» (2026-10-27)

- **CINCO commits.** `47dafe8` (E-1) · `93655d7` (E-2) · `9a8cb79` (E-3) · `f9ca06d` (E-4) · el de
  cobertura y documentación. Sello **`v20261027-1511`**, md5 de `index.html` **`db846ab9`**. Al
  empezar, `origin/main` = `HEAD` = **`ec0c327`**, el cierre de la tanda B, ya publicado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **CUATRO PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **La orejuela NO «seguía sin juzgar»**: juzgaba en `oai-notas`, en el badge
     `oai-elegibilidad` y —el hallazgo más grande— **en el emisor del INFORME**, que conservaba
     los dos rangos viejos escritos a mano (`>= 17 && <= 31` y `>= 11 && <= 32`). La I-E1 cambió
     las constantes de la pantalla en octubre y esa cascada se quedó atrás: **la pantalla ya no los
     usaba y el documento que se firma sí.**
  2. **La VÁLVULA AÓRTICA no tenía el problema de orden del 2b**: `bloque-prot-va` ya vive dentro
     de `#caja-esten-aortica`. Sólo la mitral estaba fuera de lugar.
  3. **La suite no tenía 553 casos al cerrar: tiene 554** (TC-1 a TC-539 sin huecos más quince
     TC-GR).
  4. **El aviso de la tricúspide del AJ2-4 no estaba «sin implementar»**: el texto y la compuerta
     estaban bien. Lo que faltaba era **el disparador**.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el Carpentier se decía hasta TRES veces en el
  mismo informe firmado, y con el tipo III con DOS VALORES DISTINTOS.** Medido en HEAD: dos
  apariciones en un transtorácico con prolapso, y tres en un ETE con la morfología integrada —el
  paréntesis «Carpentier **IIIb**», la frase de prolapso «Carpentier **III**» y la oración del ETE
  «Carpentier Tipo IIIb (tethering sistólico)»—, porque el vocabulario del cajón de legado no parte
  el tipo III. Hoy se dice **una sola vez**, con un dueño único de la pregunta
  (`vmCarpDichoEnMitral`).

- ⚠️ **POR QUÉ EL MÉDICO NO VEÍA EL AVISO DE LA TRICÚSPIDE, Y POR QUÉ NADIE LO NOTÓ.** El
  `onchange` de `#et_grado` es `valvSev.aplicar(...)`, que **no pasa por `calcET`** —el único lugar
  desde donde se llamaba al pintor—, y el oyente de documento sólo atrapaba `it_grado` e
  `ia_grado`. Medido: 0 × 0 con texto vacío al elegir la severidad, **28 × 545** al borrar el
  gradiente medio. Y **TC-519 pasaba EN VERDE sobre el defecto**, porque el caso llamaba a
  `calcET()` a mano justo después: **fabricaba el disparador que la app no tenía**. Es el «freno
  que tapa al que se muta» — un chequeo que no podía fallar.

- **LAS CATORCE FILAS DE LAS DOS TABLAS DE LA OREJUELA SE VERIFICARON CONTRA EL PDF ORIGINAL**, no
  contra un resumen, y **no hubo una sola discrepancia**. Amulet: Tabla 2 del IFU FDA P200049
  (2021), hoja 19, folio 15. WATCHMAN FLX Pro: Tabla 78 del IFU 52212467-01 rev. A (2025-09), hoja
  26 — **un documento más nuevo** que el que la reserva de la I-E1 nombraba, así que esa reserva
  **se retira porque dejó de ser cierta**.
  ⚠️ **El «mayor o igual» de la Tabla 2 es un glifo de la fuente Symbol (U+F0B3)**: la extracción
  de texto plano devuelve « 10» y « 12» **sin el signo**, así que un `pdftotext` habría publicado
  la distancia como un valor exacto. Verificado glifo por glifo.

- **EL STRAIN DEL VD POR DEBAJO DE 15 % YA NO GRADÚA.** «leve como mínimo» es una afirmación de
  severidad sobre una banda donde la fuente no publica ningún corte. −25, −20, −18 y −15 salen
  **idénticos a HEAD**; si `vdDisfGrado` dio un grado **ese manda**; y **el voto no se perdió en el
  Laboratorio**: `_labDisfSistVent` da `{vi:false, vd:true}` en los dos árboles, porque su regex
  busca «disfunción sistólica» y no el grado.

- ⚠️ **TRES PARTES SE PARARON Y SE REPORTARON, NO SE APLICARON.** El punto **3c** (la celda
  «Decisión de la aplicación» en la columna «Mujer»: **47 filas, 46 sin distinción de sexo, 1 celda
  que no es un valor, `colspan` sin usar** → E-c); la **rama del trombo** del informe, que sigue
  dando un veredicto de aptitud porque es una contraindicación y no un rango, y el párrafo de
  arriba depende de ese gate (→ E-d); y el **puntero en `informe-pdf-excel.md`**, que está a 600
  bytes del techo y partirlo es otra orden (→ E-f).

- **LAS DOCE MUTACIONES DIRIGIDAS, Y DOS SOBREVIVIERON AL PRIMER BARRIDO — LAS DOS ERAN COBERTURA
  QUE FALTABA.** **M1** (revertir la precedencia) no rompía nada porque en todas las escenas los
  dos nodos terminan con el **mismo** valor: el espejo del gesto copia ETE → Válvulas. **M7** (que
  la oración del ETE no se calle) tampoco, porque ninguna escena integraba la morfología del ETE.
  Cerradas con **A11** y **A12**, que son dos condiciones que nacieron del barrido. **13/13
  muertas** tras cerrarlas, en worktree y nunca sobre el vivo, con guarda de md5.

- ⚠️ **TC-539 FUE ROJO Y VERDE CON EL MISMO ÁRBOL, Y LA CAUSA SE ENCONTRÓ: eran CUATRO cosas del
  arnés, no de la app.** (1) el denominador probaba la palabra «insuficiencia», y «sin estenosis ni
  insuficiencia» la contiene; (2) `pillOn` devolvía `true` con el botón **apagado**, porque la clave
  de `localStorage` sobrevive entre corridas; (3) `limpiar()` no borra `esqSevManual`, así que
  `calcIM_ESC` salía por su guarda; (4) **`calcETE` deja agendado un repintado que PISA
  `im_grado`** — fijándolo antes del debounce, el informe salía «sin insuficiencia» en tres de
  cuatro corridas. Las cuatro están escritas en el caso.

- **Línea base al cierre: suite 549/554** en once lotes de 55 **cubriendo los 554**, con el
  pendrive `DISK_IMG` **montado y listando nombres reales** al abrir y al cerrar, y el md5 de
  `index.html` **idéntico** antes y después. Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los
  cuatro de siempre, más **TC-358**, que es el rojo por CDN que la orden anticipa.
  ⚠️ **Y TC-358 SE VERIFICÓ DE LA FORMA QUE NO DEJA DUDAS**: en el **mismo directorio**, con los
  **mismos scripts**, alternando sólo el `index.html` entre HEAD y el árbol nuevo, dos rondas
  dieron **rojo en los dos** y después **verde en los dos**. Su helper `pdfTxt` lee `window.jspdf`
  **sin esperar**, y medido con Playwright jsPDF llega **en menos de 1 segundo** en los dos árboles,
  sin un fallo de red ni de SRI. → **E-h**.
- **Semgrep 124 WARNING / 0 ERROR.** Excel **440** columnas. Censo **1023** campos, 0 huérfanos.
  17 bloques de JS inline parsean. Celular **34 hallazgos ALTA —17 a 360 px y 17 a 390—, idénticos
  a HEAD**.
- **A/B contra HEAD, uno por commit, y las diferencias de superficie firmada son SÓLO las
  autorizadas**: 30 en las dos escenas del Carpentier (E-1), **cero** en las cinco del E-2, 17 en
  `strE12` (E-3) y 12 en `orejE` (E-4). En todos, `vacio`, `ajeno` y los controles negativos dan
  **cero** en informe (tres estilos), EN SUMA, las 440 columnas de Excel clave por clave, los
  943/960 campos, el Laboratorio por sus ocho funciones dueñas, el PDF generado de verdad en sus
  seis plantillas y el PPT (23 textos).
  ⚠️ **LA ESCENA `tricE` DEL A/B NO PUEDE MOSTRAR LA DIFERENCIA DEL 2a, Y SE DECLARA EN EL CÓDIGO**:
  su montaje corre todos los `calc*` de `window`, así que fabrica el mismo disparador que TC-519
  fabricaba. Esa diferencia la mide `_probe_te.mjs --solo tric`, con gestos reales.
- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES** (dos motores × 1440 y 390 px × dos temas):
  17/17 pestañas con caja, cero scroll horizontal, **cero textos recortados**, **cero errores de
  consola y de página en los dos motores**, el Carpentier con una sola aparición y el campo
  bloqueado a opacidad 0,5, el aviso de la tricúspide con **565 × 28** a 1440 px, la frase del
  strain sin grado y las dos tablas de la orejuela con **cero** rangos viejos.
  **Escribir no se volvió más lento**: doce teclas en Chrome, media **0,16 a 0,21 ms**, máximo 0,5.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.**
- ⚠️ **EL ENLACE DEL CARPENTIER DABA 0 × 0 EN LOS TRES ARNESES Y SÍ SE VE: 156 × 44 px.** Lo que
  les falta es abrir la **TARJETA**, no la sección: con `showTab(...)` programático la `.card` de
  adentro queda sin caja y todo lo que hay dentro informa 0 × 0. Midiendo con la pestaña abierta
  por su **botón real** más `toggleEteSeccion`, aparece con su texto completo. → **E-b**.
- **`index.html` pasó de 9,76 MB / 137.611 líneas a 9,79 MB / 138.038** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **Dónde está todo:** `docs/mapa/e-carpentier-tricuspide-orejuela.md` (**mapa NUEVO**, 19,1 KB),
  la ficha del caso en `docs/mapa/tests-fichas-539.md` (**archivo propio**, porque
  `tests-fichas.md` ya estaba en 34,2 KB), **ocho mapas con un puntero cada uno** —medidos ANTES de
  escribir, todos por debajo de 35 KB—, `docs/fuentes/FUENTES.md` → «La tanda E» con las dos tablas
  transcriptas fila por fila y la tabla «Cambios de evidencia» de catorce filas, y
  `docs/PENDIENTES.md` → **OCHO** cosas declaradas (**E-a** a **E-h**).

### El eco pulmonar, la constricción, el botón de amiloidosis y el Forrester — «C2» (2026-10-28)

- **SEIS commits.** `9eefa81` (C2-1) · `5fc5078` (C2-2) · `3761bc4` (C2-3) · `f771c30` (C2-4) ·
  `c7fe199` (C2-5) · el de cobertura y documentación. Sello **`v20261028-2250`**, md5 de
  `index.html` **`7fef59e4`**. Al empezar, `origin/main` = `HEAD` = **`c53d350`**, el cierre del
  C1, ya publicado. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LA FUENTE DEL PULMÓN SE LEYÓ EN IMAGEN, A 400 ppp, Y DIO VUELTA UNA ATRIBUCIÓN.** El
  enunciado **D6_11** del consenso de Volpicelli (*Intensive Care Med* **2026**, hoja 19)
  publica la fórmula `V (ml) = D (mm) × 20` citando **[154–156] JUNTAS** —Balik 2006, Peris 2010
  y Remérand 2010— y **no se la atribuye a ninguna**. La app decía «según fórmula de Balik» en el
  informe firmado, en el EN SUMA, en el rótulo del campo y en la ficha de Referencias: afirmaba
  una autoría que su propia fuente no establece. **Se retiró de las cuatro superficies
  visibles.** La fórmula, sus números y su guarda de rango no se movieron.
  ⚠️ **Las tres referencias faltan en la biblioteca**, censado por nombre sobre las 28 carpetas.

- **EL ARTÍCULO ORIGINAL DE FORRESTER TAMPOCO ESTÁ, Y ESTA VEZ SE CENSÓ POR CONTENIDO.** Se
  abrieron todos los PDF buscando «Forrester»: **once lo contienen y ninguno es el artículo** —
  nueve son la regla de Diamond-Forrester y dos son listas de autores. El 18 y el 2,2 salen de la
  entrada que `FUENTES.md` ya tenía leída **en imagen**: Braunwald, Tabla 52-9, folio 1125, que
  reproduce a Forrester 1976. **No se citó ninguna fuente nueva en pantalla.**

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: la cápsula del Forrester era la TERCERA copia
  de la regla, y justo la que llega al papel.** Tenía su propia cascada con `ic < 2.2` escrito
  como **literal**, sin leer `FORR_IC_CORTE`. El C1-4a había extraído `forrCuadrante` para que el
  gráfico y el diagrama del Laboratorio no pudieran discrepar, y la cápsula se había quedado
  afuera: mover la constante cambiaba los dos diagramas y dejaba **la línea que viaja al informe
  integrado, a la hoja del PDF y al PPT** clasificando con el número viejo.

- ⚠️ **LOS DOS TEXTOS DEL FORRESTER NO HUBO QUE REESCRIBIRLOS: EL CÓDIGO SE MOVIÓ A ELLOS.** El ⓘ
  `hemo-forr` y la tercera línea de `forrLin` ya decían 18 y «2,2 o menos», y **eran falsos** —el
  código cortaba en 15 y en `< 2,2`—. Es la discrepancia que el C1 declaró en **C1-a** y **C1-b**.
  Lo único que se tocó son **dos mayúsculas de en medio** (regla R3).

- ⚠️ **RETIRAR EL BLOQUE DE ETT AVANZADO SIN TOCAR LA COMPUERTA HABRÍA DEJADO EL INFORME MUDO.**
  `pulAvanzadoIntegrado` preguntaba por `amiloEnInforme`, o sea por el registro: sin la entrada
  `pulm`, el predicado quedaba **falso para siempre**. La compuerta pasó a ser el **dato**.
  **El precio, declarado: el médico pierde el interruptor** —cargado es publicado—. → **C2-a**.

- ⚠️ **Y EL A/B DEL MISMO COMMIT DESTAPÓ UNA REGRESIÓN MÍA.** `_ccMods` contaba `pulm` como
  módulo integrado; retirado el bloque, un estudio cuyo **único** hallazgo es pulmonar y no sube
  al EN SUMA salía «Estudio sin alteraciones estructurales ni funcionales significativas»
  mientras el cuerpo decía «Deslizamiento pleural reducido en ambos hemitórax». Cerrada con
  `ccMarcarParrafo()`, que es el helper que existe para eso.

- **EL PPT IMPRIMÍA EL PULMÓN DOS VECES, Y ESO ES LO QUE EL 1h VENÍA A ARREGLAR.** Tenía una
  diapositiva «Ecografía Pulmonar» que leía `am-txt-pulm`, y las primeras diapositivas ya llevan
  `informe_texto`, que desde el B-E3 trae las frases del pulmón. **La hoja del PDF no existía**:
  `enCuerpo:true` ya la descartaba desde el AJ2-9, verificado antes de tocar nada.

- **EL BOTÓN «↓ Traer del formulario» SE RETIRÓ PORQUE NO HACÍA NADA Y AVISABA AL REVÉS**, medido
  en el D-11: `amAutoLlenar` devolvía `false` en los cuatro criterios y el aviso decía «No hay
  datos suficientes cargados» justo cuando estaban todos. Se fueron los cuatro botones, sus dos
  funciones y sus dos `window.X = X`. **Nada más del módulo se tocó.**

- ⚠️ **LA CONSTANTE DE CONGESTIÓN TIENE CUATRO LECTORES Y EL CUARTO NO ES EL FORRESTER.** Es la
  anotación «con congestión (PCP >N)» de la cápsula «Perfil hemodinámico». Se movió igual, a
  propósito —dos cortes de congestión en la misma pantalla se leen como un error—, y está
  **medido**: con PCP de 17, HEAD decía «Shock cardiogénico — GC bajo + RVS elevada con
  congestión (PCP >15)» y hoy dice «Shock cardiogénico — GC bajo + RVS elevada». → **C2-b**.
  Los tres `pcp <= 15` de la clasificación pre/poscapilar **no se movieron**: son la definición
  de HTP poscapilar de la ESC/ERS 2022, que coincide en el número y no en el criterio.

- **A/B CONTRA HEAD, UNO POR COMMIT, Y LAS DIFERENCIAS DE SUPERFICIE FIRMADA SON SÓLO LAS
  AUTORIZADAS.** Commit 1: 66 diferencias, **todas en las ocho escenas pulmonares** (en `ajeno`,
  la única es el textarea retirado). Commit 2: **CERO**. Commit 3: **CERO**. Commit 4: **CERO**
  sin el módulo integrado y **TRES** con él —`am-txt-hemo`, la hoja del PDF y el PPT—, que son
  las tres que la orden autoriza. Denominadores: 20 escenas, 21.223 claves, 8.800 celdas de Excel.
  ⚠️ **La escena con el bloque INTEGRADO hubo que agregarla**: sin ella, «cero en superficie
  firmada» no se distingue de «la sonda no mira una escena donde el cambio pueda actuar».

- ⚠️ **LAS ESCENAS DE BORDE NO CAEN EN EL BORDE, Y LA CÁPSULA LO ESCONDE.** El índice cardíaco
  sale de una cadena de cinco campos y la presión capilar de Nagueh, y la cápsula los imprime
  **redondeados**: una escena que muestra «18.0» puede valer 18,04. Los bordes se le preguntan al
  **dueño directo** con los números exactos, y la coincidencia cápsula↔dueño se monta aparte.

- **DIECISÉIS MUTACIONES DIRIGIDAS, 16/16 MUERTAS**, en worktree y nunca sobre el vivo, con
  guarda de md5. Dos no revierten un arreglo: lo **aplican de más**, porque las condiciones que
  las matan son controles negativos. ⚠️ **M12 sobrevivió al primer barrido y era un hueco real**:
  el control usaba `indexOf` y la clasificación pre/poscapilar escribe su 15 **tres** veces, así
  que mover **una sola** pasaba en verde.

- ⚠️ **DOS TRAMPAS DE MÉTODO NUEVAS, Y LAS DOS COSTARON UNA CORRIDA.** (1)
  `document.body.textContent` **trae el código fuente de los diecisiete `<script>` inline**: el
  censo de «Balik» daba positivo sobre los comentarios que explican por qué se retiró — el arnés
  se medía a sí mismo. (2) Una condición sobre un `toast` que el caso no dispara **pasa en los
  dos árboles**: no puede fallar.

- ⚠️ **EL LOTE 11 DE LA SUITE NO CORRIÓ EN LA PRIMERA PASADA, Y CASI NO SE NOTA.** El
  `while IFS= read -r` **saltea la última línea cuando no termina en salto**, así que los diez
  casos finales —`TC-536` a `TC-545`, o sea **el caso nuevo de esta tanda**— quedaron sin
  ejecutar y el log mostraba diez lotes de 55 como si fuera todo. Se corrió aparte: **10/10**.

- ⚠️ **Y TC-520 CAYÓ POR MI CAMBIO SIN QUE EL CENSO LO VIERA.** Afirma «amiloSecs publica
  **diecisiete** modulos» y no nombra `pulm` en ninguna parte, así que grepear por esa clave no
  lo encontró. **Lo destapó la corrida completa**, que es justo para lo que está. Adaptado a
  dieciséis, con la condición reforzada: hoy exige además que `pulm` no esté en el registro.

- **DIECIOCHO CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: TC-156, TC-157, TC-471,
  TC-488, TC-499, TC-500, TC-501, TC-502, TC-509, TC-511, TC-519, TC-520, TC-529, TC-532,
  TC-533, TC-535, TC-537 y TC-544.

- **Línea base al cierre: suite 555/560**, cubriendo los 560 casos en once lotes y en UNA SOLA
  PASADA sobre el árbol sellado, con el pendrive `DISK_IMG` **montado y listando nombres reales
  al abrir, entre lotes y al cerrar**, y el md5 de `index.html` **idéntico** antes y después.
  Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-358**, que
  es el **intermitente por el CDN de jsPDF** que la tanda E ya declara en **E-h**.
  **TC-507 salió VERDE.**
  ⚠️ **ESTA CIFRA DECÍA 556/560 CON TC-358 EN VERDE, Y ERA UN RECUENTO COMPUESTO.** Salía de
  sumar TRES corridas con DOS versiones distintas de `test_clinico.mjs` —los diez primeros lotes
  antes de adaptar TC-520, el lote 11 aparte y el lote 10 de nuevo después—, que no es una línea
  base: es un promedio de árboles que nunca existieron juntos. La corrida limpia, de una sola
  pasada y con el archivo de tests final, da **555/560**.
  ⚠️ **Y TC-358 ES INTERMITENTE DE VERDAD, MEDIDO LAS DOS VECES.** Salió verde en la primera
  pasada y **rojo** en la limpia; repetido su lote, **rojo otra vez**. Verificado como manda este
  archivo —mismo directorio, mismos scripts, alternando sólo `index.html`—: **cae idéntico contra
  `c53d350`**, con el mismo diagnóstico `antes=NO HAY jsPDF || despues=NO HAY jsPDF` en los dos
  árboles. No es de esta tanda. **El próximo que lo vea rojo no tiene que mirar la conexión:
  tiene que hacer esperar a `pdfTxt`**, que lee `window.jspdf` sin esperarlo.
  Semgrep **124 WARNING / 0 ERROR**. Excel **440** columnas. Censo **1025**, 0 huérfanos nuevos.
  Celular **63 hallazgos a 360 px y 72 a 390, 17 ALTA en cada ancho** — idénticos a la base.
- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES, y son idénticos a HEAD**: 21 de 22 pestañas con
  caja, cero scroll horizontal, **cero textos recortados** y **cero errores de consola y de
  página** en los dos motores. El rótulo nuevo entra entero (213 × 14 px en Chrome, 212 × 13 en
  WebKit) y los dos globos nuevos miden 44 × 44 con los **cinco puntos dando el propio botón**.
  **Escribir no se volvió más lento**: doce teclas, media **1,06 ms** contra 1,33 en HEAD, máximo
  2,0 contra 2,1, y el barrido 5,9 ms contra 7,0.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Y el binario de chromium de Playwright
  **sigue sin estar** en esta máquina (está el 1234 y el paquete pide el 1248), así que Chrome va
  por el del sistema: sin `channel: 'chrome'` la sonda devuelve los cuatro cruces **vacíos**, que
  en un volcado se lee igual que «no hubo diferencias».
- **`index.html` pasó de 9,89 MB / 139.274 líneas a 9,91 MB / 139.443** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **Dónde está todo:** `docs/mapa/c2-pulmon-constriccion-forrester.md` (**mapa NUEVO**, 12,2 KB),
  la ficha del caso en `docs/mapa/tests-fichas-545.md` (**archivo propio**), **siete mapas con un
  puntero cada uno** —medidos ANTES de escribir, todos por debajo de 35 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda C2» con el enunciado D6_11 transcripto, las tres notas
  que salieron de pantalla **textuales** y la tabla «Cambios de evidencia» de veintiuna filas, y
  `docs/PENDIENTES.md` → **NUEVE** cosas declaradas (**C2-a** a **C2-i**).
  ⚠️ **Y LOS DOS MAPAS QUE ESTABAN AL TECHO SE PARTIERON** (C2-5): `informe-pdf-excel.md` 34,4 →
  **25,8 KB**, con el Excel a `docs/mapa/excel-laboratorio.md` (10,5 KB); y `tests.md` 34,8 →
  **23,5 KB**, con los arneses de A/B y de mutación a `docs/mapa/arneses-ab-mutacion.md`
  (13,5 KB). **Cero líneas perdidas**, verificado una por una contra HEAD.

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

### La calculadora de riesgo CV y el score de amiloidosis — «D» (2026-10-27)

- **CINCO commits.** `2d82861` (D-1) · `6284aeb` (D-2) · `9b79262` (D-3) · `3fd2a39` (D-4) · el de
  cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`8fac09f`**, el cierre de la
  tanda E, ya publicado. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LA FUENTE SE LEYÓ EN IMAGEN, Y ES LO QUE SOSTIENE TODO.** La **Tabla 4** de la guía ESC 2022
  de cardio-oncología (folios 4246-4247) es una **matriz factor × clase de fármaco** con celdas
  VH/H/M2/M1/–, no un puntaje: la misma FA previa **no suma** con antraciclinas y vale **dos
  puntos** con un anti-HER2. Su regla de combinación se leyó **a siete aumentos** y se transcribe
  literal. El fármaco es una **columna**, nunca un piso.

- ⚠️ **CINCO PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **La Tabla 4 son DOS hojas, no ocho**; las ocho serán el anexo `Tables S2–S7`, que no se abrió.
  2. **El «rendimiento por corte» no difería de la Tabla 4 de Boldrini**: las once filas de
     `AMILO_IWT_BOLDRINI` coinciden una por una. No hubo nada que corregir.
  3. **Los cuatro botones del centellograma NO ocupan cuatro renglones**: medido en seis anchos,
     van en **una** fila desde 560 px y en **dos** por debajo de 500.
  4. **El globo ⓘ del score NO se cortaba** (647 px de contenido en 1002 de hueco). ⚠️ **Pero el
     texto nuevo del D-4 SÍ lo cortó**, y por eso la tarjeta pasó a tener ancho propio de 460 px.
  5. **El Excel no necesitaba tres columnas nuevas**: ninguna de las doce casillas `hfaicos_*` se
     exportaba. Censo **1023 → 1025**; Excel **sigue en 440**.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: un anti-HER2 sin ningún factor de riesgo salía
  «alto» o «muy alto», y la Tabla 4 lo da BAJO.** Lo causaba un piso por fármaco que es regla
  propia de la app y no está en la guía.

- ⚠️ **Y UN SEGUNDO, QUE SE ENCONTRÓ LEYENDO EL CÓDIGO: `calcHFAICOS` salía con `return` ANTES de
  publicar.** Al vaciar la calculadora, la pantalla decía «ingresar factores» mientras
  `co-riesgo-resultado` —lo que leen la hoja del PDF, el PPT y el módulo integrado— conservaba la
  banda del paciente **anterior**. Medido con su denominador contra HEAD.

- ⚠️ **MI PROPIA SONDA TAPABA ESE DEFECTO, DOS VECES.** `window.__Y.poner` y el helper `farmaco()`
  del caso llaman a `calcCardioOnco()`, que es **justo** el disparador que la app no tiene cuando
  el médico destilda una casilla. Con esa llamada, 1f «no pasa». Es el error de TC-519.

- **EL SCORE DE AMILOIDOSIS SE MARCA SOLO**, colgado del barrido de espejos de la tanda B —el
  mismo debounce de 220 ms, sin temporizador nuevo—, y para que «el médico puede desmarcarla y esa
  decisión se respeta» se pudiera cumplir hubo que agregar un **tercer estado** de origen:
  `'nomanual'`, «una persona lo SACÓ». Con dos estados, el barrido revivía lo destildado.

- ⚠️ **LOS ESPESORES DEL MÓDULO VIAJAN EN UN SOLO SENTIDO, Y ESTÁ MEDIDO POR QUÉ.** `_amHayDatos`
  —la línea de pendientes de la miocardiopatía hipertrófica— lee `ett-septo` y `ett-pp` como «el
  médico está evaluando amiloidosis acá»: autollenarlos desde `siv` habría puesto esa frase en el
  informe de **cualquier** estudio con el septo cargado. `calcETT` **lee** `siv` y `ppvi` en vez de
  escribirlos.

- **TRES PARTES SE PARARON Y SE REPORTARON, NO SE APLICARON**: las filas de ICI y anti-VEGF de
  «Monitoreo recomendado», que subestiman lo que la guía publica (→ **D-g**); las tres tablas de
  la sub-pestaña «HFA-ICOS», que publican el esquema retirado (→ **D-c**); y «la tabla del score
  se muestra en gris», que no dice qué elemento (→ **D-f**).

- **SON SIETE COMMITS**, no cinco: los dos últimos salieron de lo que la verificación encontró.
  El **D-6** adapta los CINCO casos que la suite COMPLETA destapó —y que la corrida de zona no
  podía ver—, y el **D-7** cierra el globo que los dos motores encontraron cortado.
- ⚠️ **EL GLOBO NUEVO DE LA CALCULADORA SE CORTABA, Y LO ENCONTRÓ LA SONDA DE DOS MOTORES**: 1140
  px de contenido en 648 de hueco con el ancho estándar. Con ancho propio de **640** entra entero
  en Chrome y en WebKit; **a 390 px no entra ni así** y se declara (**D-i**) en vez de esconderlo.
  El primer valor probado, 560, se quedó a **catorce píxeles**.
- **`index.html` pasó de 9,79 MB / 138.038 líneas a 9,84 MB / 138.691** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.) Sello **`v20261027-1903`**,
  md5 de `index.html` **`8d1dc802`**.
- **Línea base al cierre: suite 551/555**, cubriendo los 555 casos en once lotes, con el pendrive
  `DISK_IMG` montado y listando nombres reales. Los rojos son **TC-223, TC-376, TC-390 y
  TC-406**, los cuatro de siempre; **TC-358 salió verde al repetir su lote**, que es el
  intermitente por CDN que la orden anticipa. Semgrep **124 WARNING / 0 ERROR**. Excel **440**
  columnas. Censo **1025**, sin huérfanos. Celular **63 a 360 px y 72 a 390, 17 ALTA en cada
  ancho**, idénticos a la base.
- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES**: 17/17 pestañas con caja, cero scroll
  horizontal, **cero textos recortados** y **cero errores de consola y de página en los dos
  motores**, con la clasificación idéntica en las cuatro escenas de la Tabla 4, un solo selector
  y el score marcándose solo en 7/10. **Escribir no se volvió más lento**: doce teclas, media
  **0,13 a 0,15 ms**, máximo 0,4 — contra 0,16-0,21 de la tanda anterior.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.**

- **Dónde está todo:** `docs/mapa/d-cardioonco-amiloidosis.md` (**mapa NUEVO**, 14,6 KB), la ficha
  del caso en `docs/mapa/tests-fichas-540.md` (**archivo propio**), **tres mapas con un puntero
  cada uno** —medidos ANTES de escribir; ⚠️ `tests.md` quedó a **246 bytes** del techo y
  `informe-pdf-excel.md` **no se tocó**, que es lo que la orden pide—,
  `docs/fuentes/FUENTES.md` → «La tanda D» con las dos fuentes transcritas y la tabla «Cambios de
  evidencia» de **veinte filas**, y `docs/PENDIENTES.md` → **OCHO** cosas declaradas
  (**D-a** a **D-h**).

### No se podía borrar lo que el módulo de amiloidosis escribía — «D-9» (2026-10-27)

- **UN commit sobre el HEAD de la tanda D.** Sello **`v20261027-2030`**. Al empezar,
  `origin/main` = **`8fac09f`** con los 8 commits de la D sin pushear.
  **El push lo corre Maicol: esta corrección tenía orden expresa de NO pushear.**

- ⚠️ **EL DEFECTO LO ENCONTRÓ EL MÉDICO PROBANDO EL PASO 7 DE LA GUÍA, Y ERA DEL D-3.** Después de
  que el módulo escribía en el estudio, **seis de los ocho datos compartidos no se dejaban
  borrar**: volvían 220 ms después. Medido campo por campo y por etapa antes de tocar nada.
  El sentido app → módulo **no** era el culpable: lo reescribía la pasada de **marcado** del
  barrido, que llama a los `calc*` del módulo, y ésos escribían hacia el estudio.
  **El comentario del D-3 decía «cuelga del gesto del médico» y era una intención, no un
  mecanismo**: el barrido llama a esas mismas funciones.

- **EL ARREGLO EN UNA FRASE: el campo del ESTUDIO es el dueño.** Una sola puerta de escritura
  módulo → estudio, colgada del evento de entrada de cada insumo del módulo; y un solo dueño del
  sentido app → módulo, que deja cada insumo valiendo lo que dice su fuente. Borrar borra, el
  criterio se destilda solo y el cartel de HVI se va al vaciar los **dos** espesores.

- ⚠️ **CUATRO MUTACIONES SOBREVIVIERON AL PRIMER BARRIDO Y SÓLO DOS ERAN FALTA DE COBERTURA.** Las
  otras dos sobrevivían porque **el arreglo tenía dos mecanismos haciendo el mismo trabajo**, y
  una tercera sobrevivió a eso por el mismo motivo. Se retiró la redundancia; **10/10 muertas**.
  La condición que la cierra es la de la **fuente incompleta**: con dos de los tres insumos del
  espesor relativo, vaciar y repoblar NO equivale a seguir al dato.

- ⚠️ **EL EMPALME SE LLEVÓ UNA FUNCIÓN ENTERA Y NINGÚN ERROR LO DIJO.** Al quitar el recorrido
  redundante quedó la llamada sin la función: el score pasó a 0 y el marcado automático dejó de
  funcionar. Lo cazó el **denominador** del caso, no la consola —el barrido lo traga en su `try`—.

- **Línea base al cierre: suite 534/556 verdes, 5 rojos y 17 que no probaron nada**, en once
  lotes cubriendo los 556 (ejecutados 556 de 556). Rojos: **TC-223, TC-376, TC-390 y TC-406**, los
  cuatro de siempre, más **TC-358**, que es el rojo por CDN que la tanda E ya declara en **E-h** —
  su denominador dice «NO HAY jsPDF» en los dos lados— y que se verificó **en el mismo directorio
  y con los mismos scripts, alternando sólo `index.html`**: cae igual contra el HEAD de la tanda D.
  Repetir el lote **no lo movió: rojo tres veces**, dos en su lote y una aislado.
  ⚠️ **Y NO ES LA RED, MEDIDO**: `curl` al `jspdf.umd.min.js` de cdnjs que carga la app devuelve
  **200 con 364.463 bytes**. Es la carrera del helper del propio caso, que lee `window.jspdf` sin
  esperarlo. **El próximo que lo vea rojo no tiene que mirar la conexión: tiene que hacer esperar
  a `pdfTxt`.**
  ⚠️ **Y EL PENDRIVE SE DESMONTÓ A MITAD DE LA CORRIDA, ASÍ QUE LA CONDICIÓN DE LA ORDEN NO SE
  CUMPLIÓ AL CERRAR.** `TC-181` a `TC-197` fallaron los diecisiete por eso: **no son cobertura de
  esta pasada** y hay que volver a correr ese lote. → **D-k**.
  ⚠️ **Y AL VOLVER A PEDIRLO NO ESTABA MONTADO, MEDIDO POR TRES CAMINOS**: `/Volumes/` tiene sólo
  `Macintosh HD`, `diskutil list external` **no devuelve nada** y la tabla de `mount` tiene diez
  entradas, todas internas. **No hay copia local del árbol `GEMS_IMG`** en el home, así que
  tampoco se puede correr apuntando `ECO_PENDRIVE` a una carpeta. Los diecisiete siguen sin
  cobertura.
  ⚠️ **Y EL LOTE 10 SE COLGÓ EN TC-534**: 37 minutos a 0 % de CPU, dormido, que es la trampa de
  los procesos `cdp.mjs` que no salen. Matado por PID exacto; **TC-534 y TC-535 corridos aparte
  dan los dos verde**, así que ese lote es 55/55 y el cuelgue era del arnés.
  Semgrep **124/0**. Excel **440**. Censo **1025**, igual que la D. Celular **63 a 360 px y 72 a
  390, 17 ALTA**.
- **A/B contra el HEAD de la tanda D: CERO diferencias** en las siete escenas —informe en tres
  estilos, EN SUMA, las 440 columnas y el PDF del control—. El arreglo no movió ninguna superficie
  firmada.
- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES**, cero errores de consola, y **escribir no se
  volvió más lento**: media **0,13 a 0,16 ms** contra 0,13-0,15 de la tanda D.
- **`index.html` pasó de 9,84 MB / 138.691 líneas a 9,85 MB / 138.761.**
- **Dónde está todo:** `docs/mapa/d-cardioonco-amiloidosis.md` § 5 (18,0 KB), la ficha de TC-541
  en `docs/mapa/tests-fichas-540.md`, y `docs/PENDIENTES.md` → **D-j**, el inventario de
  direcciones de los dieciséis campos del módulo, que el punto 3 pedía **sólo reportar**.

### Lo que el médico encontró probando el D-9 — «D-10» (2026-10-28)

- **UN commit sobre el HEAD del D-9.** ⚠️ **Y ESE HEAD ES `4c4c919`, NO `26c5549`**: es el mismo
  D-9, amendado dos veces al cierre para meterle a la bitácora dos mediciones. Mismo `index.html`,
  mismo sello. Al empezar, `origin/main` = **`8fac09f`** con nueve commits locales sin pushear.
  **El push lo corre Maicol: esta corrección tenía orden expresa de NO pushear.**

- **DE LOS SEIS HALLAZGOS, TRES ERAN UN SOLO DEFECTO, DOS NO ERAN DEFECTOS Y UNO VENÍA DE LA TANDA
  D Y NO DEL D-9.** Todo medido antes de tocar nada, y las tres versiones comparadas
  (`8fac09f`, `195c87a`, HEAD).

- **H1, H2 y H4 son el mismo defecto: la marca de espejo no se persiste.** El reflejo app → módulo
  sólo tocaba un insumo que llevara `dataset.espejo`, y esa marca vive en el nodo. **El borrador
  del autoguardado, en cambio, SÍ se lleva el valor del campo del módulo** —medido, el blob trae
  `rwt-septo` junto con `siv`—, así que toda recarga repone el número **sin** su marca y desde ahí
  el módulo queda congelado. Medido: el estudio en **20** y el módulo clavado en **18**, con el
  espesor relativo publicando **0,67**, un número que ninguna medición sostiene, y el criterio
  marcado por ese número. **Viene del D-8, que tenía la MISMA guarda**, y el médico lo encontró
  porque el paso 1 de la guía es recargar para ver el sello.

- **H6 es de la tanda D, no del D-9, y está medido en las tres versiones.** El «1» tecleado se
  escribía en el estudio y al llegar el «15» la regla «no pisar un valor ya cargado» leía ese 1
  —puesto por la misma función medio segundo antes— como un valor del médico: **el estudio se
  quedaba con el primer dígito**. En `8fac09f` no pasaba porque el módulo no escribía nada.

- **H3 Y H5 NO SE TOCARON, Y LOS DOS ESTÁN BIEN.** El cartel de HVI es el **mayor** de los dos
  espesores, así que con la pared posterior en 12 sigue —y hoy dice **12,0 mm**, mientras el D-8
  decía 14,0 con el septo **ya borrado**: el D-9 lo arregló—. ⚠️ **La que estaba mal era la guía
  de prueba del D-9**, cuyo paso 3 pedía que el cartel se fuera: pedía un defecto. → **D-m**.
  Y «Nuevo estudio» deja los **mismos 84** campos en las tres versiones, ni uno de más ni uno de
  menos, todos valores por omisión: **ningún dato del paciente sobrevive en ninguna**.

- ⚠️ **EL BARRIDO DE MUTACIONES ENCONTRÓ CINCO REDUNDANCIAS MÍAS, UNA POR RONDA, Y HICIERON FALTA
  CINCO RONDAS.** Ninguna sobrevivencia era falta de cobertura: el arreglo nacía con dos
  mecanismos para cada trabajo. Una guarda de **foco** —la escritura corre en el `oninput`, antes
  de que el barrido pueda correr—; la limpieza del desacuerdo **en el gesto** —el cuerpo de la
  escritura ya la resuelve—; el **autollenado** dentro del barrido —el reflejo ya hace eso—; un
  requisito de **campo no vacío**; y la limpieza de marcas **desde el barrido**. **Las cinco se
  retiraron. 14/15 muertas**, y la quinceava **no es una inyección de defecto**: vuelve a poner el
  autollenado redundante, así que el comportamiento no cambia — su valor es ser la evidencia
  medida de que retirarlo no movió nada.

- ⚠️ **Y EL MISMO ERROR DE DENOMINADOR DOS VECES EN LA MISMA CORRECCIÓN.** Al septo del estudio lo
  espejan **DOS** campos del módulo: cuando uno escribe un valor indebido, **el otro lo vuelve a
  escribir bien en la misma pasada** y la condición pasa en verde sobre la mutación. Escribí dos
  controles negativos con el septo y los dos eran inútiles. Se cerraron con el **TAPSE**, que
  tiene un solo espejo. Es el «freno que tapa al que se muta» por una puerta nueva.

- ⚠️ **EL DEFECTO QUE DESTAPÓ TC-541 CORRIENDO DESPUÉS DE TC-542: las dos marcas nuevas sobrevivían
  a «Nuevo estudio» y mandaban sobre el paciente SIGUIENTE.** Verde aislado, rojo en el lote, y
  contra el árbol del D-9 el mismo lote **no** lo rompía. **Y este archivo ya tenía la lección
  escrita**, textual: «la lista es CERRADA: agregar una marca de `dataset` sin agregarla a este
  selector la hace sobrevivir a “Nuevo estudio”. Costó tres casos en rojo». Las dos entraron ahí,
  en el selector **y** en el cuerpo, que son dos listas.

- **A/B contra el HEAD del D-9: CERO diferencias** en 518 claves de control —informe en tres
  estilos, EN SUMA, las 440 columnas de Excel clave por clave, el PDF y los campos—, 24 del grupo
  de amiloidosis y 70 del bloque integrado. La única diferencia de los 703 valores comparados es
  el **identificador generado** del estudio de prueba, que es un contador y no un dato.

- **Línea base al cierre: suite 552/557** en once lotes cubriendo los 557 (ejecutados 557 de 557),
  con el pendrive `DISK_IMG` **montado y listando nombres reales al abrir, ENTRE LOTES y al
  cerrar** —el arnés para si falta— y el md5 de `index.html` idéntico antes y después. Los rojos
  son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-358**, el rojo por CDN
  de **E-h**: repetido su lote, sigue rojo. Semgrep **124 WARNING / 0 ERROR**. Censo **1025**, 0
  huérfanos. Celular **63 a 360 px y 72 a 390, 17 ALTA en cada ancho** — idénticos a la base.
- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES, valor por valor**: 17/17 pestañas con caja, cero
  scroll horizontal, cero textos recortados, **cero errores de consola y de página en los dos
  motores**, y la escena del D-10 **idéntica** en los ocho. Escribir no se volvió más lento: media
  **0,12 a 0,22 ms** contra 0,16 a 0,22 del D-9. ⚠️ **WebKit de Playwright no es Safari.**
- **`index.html` pasó de 9,85 MB / 138.761 líneas a 9,86 MB / 138.867.** Sello
  **`v20261028-0322`**, md5 **`103b7e0d`**.
- **Dónde está todo:** `docs/mapa/d-cardioonco-amiloidosis.md` § 6, la ficha de TC-542 en
  `docs/mapa/tests-fichas-540.md`, y `docs/PENDIENTES.md` → **D-l** y **D-m**.

### Un dato, dos puertas, gana la última edición — «D-11» (2026-10-28)

- **UN commit sobre el HEAD del D-10 (`954ee14`).** Al empezar, `origin/main` = `HEAD` =
  **`954ee14`**: los diez commits de la tanda D, el D-9 y el D-10 **ya están publicados**,
  verificado. **El push lo corre Maicol: esta corrección tenía orden expresa de NO pushear.**

- **DE LOS TRES HALLAZGOS NUEVOS, DOS ERAN LA MISMA REGLA Y EL TERCERO ES DE LA PANTALLA.** Medido
  tecla por tecla en los **ocho** datos compartidos antes de tocar nada.

- **EL MODELO CAMBIÓ, Y ES DECISIÓN DE MAICOL: revierte la regla del D-10.** Un dato vive en el
  campo del estudio, se edita por dos puertas y **gana la última edición**. Lo que el médico teclea
  o borra dentro de un campo del módulo va al estudio **tecla por tecla y completo, el vacío
  incluido**, aunque el estudio ya tuviera otro valor. Lo automático sigue sin escribir **nada**
  —eso es del D-9 y no se movió—, y está medido por cinco caminos: el barrido, el marcado del
  score, los recálculos, el cambio de pestaña y la carga de un estudio guardado.

- **LA CAUSA DE LOS DOS PRIMEROS: `if (va === null || nuestro)`.** Con el estudio ya cargado, nada
  de lo tecleado en el calculador llegaba. Y el borrado era peor que no llegar: al vaciar el campo
  del módulo la escritura salía temprano **y borraba la marca de desacuerdo**, con lo que el reflejo
  quedaba libre para repoblar el campo en la pasada siguiente. El médico lo describió exacto: «se
  borra sólo la primera cifra».

- ⚠️ **EL TERCERO ERA LA ETIQUETA DEL BOTÓN VIOLETA, Y LA PINTABA SÓLO EL CLIC.** Borrados los tres
  espesores en AI/VI, el espesor relativo se vaciaba, el criterio se destildaba, el cartel de HVI se
  iba y el score bajaba —todo correcto— y el botón seguía anunciando `0.58` en violeta. Hoy la
  repinta `amCalcLabelSync` en **cada** recálculo, y **antes de las salidas tempranas**, porque la
  etiqueta muestra el valor medido y no la marca.

- ⚠️ **EL `id` DEL CAMPO EDITADO NO ES DECORATIVO, Y SIN ÉL EL MODELO NUEVO SE DESHACE SOLO.** `siv`
  y `ppvi` tienen **DOS** campos de módulo cada uno, así que recorrer el registro entero escribiendo
  todo lo que tuviera valor deshacía el gesto en el acto: el 1 tecleado en el encabezado iba a `siv`
  y, dos entradas después, el 14 que el espesor relativo todavía mostraba lo volvía a pisar.

- **UN CAMPO A MEDIO ESCRIBIR NO SE PROPAGA NI SE VACÍA, Y LA REGLA ES LA MISMA DE LOS DOS LADOS.**
  Un «−» solo todavía no es un número. Medido: tecleando «−12» con una pausa después del guión, el
  barrido se lo llevaba 220 ms más tarde y había que empezar de nuevo.

- **TRES PARTES SE PARARON Y SE REPORTARON**: los tres campos del encabezado del módulo, que siguen
  en un solo sentido porque autollenarlos metería la frase de la miocardiopatía hipertrófica en el
  informe de cualquier estudio con el septo cargado (→ **D-p**); el `e′` promedio, único de los ocho
  sin camino de vuelta (→ **D-o**); y el botón «↓ Traer del formulario» (→ **D-q**).

- ⚠️ **EL BOTÓN «↓ TRAER DEL FORMULARIO» QUEDÓ SIN TRABAJO, Y ADEMÁS AVISA AL REVÉS.** Medido con
  los ocho datos cargados: `amAutoLlenar` devuelve **false** en los cuatro criterios que lo tienen
  —no hay nada vacío que llenar— y de **22** valores fotografiados **no cambia ninguno**. Y como
  devuelve false, el botón muestra «⚠️ No hay datos suficientes cargados» **justo cuando están todos
  cargados**. Es el punto 3 y no se tocó: retirar un control o reescribir su mensaje es decisión de
  Maicol.

- ⚠️ **TC-543 SE COLGÓ 27 MINUTOS A 0 % DE CPU, Y LA CAUSA ERA MÍA.** `guardarInforme` tiene una
  salida temprana: **sin nombre ni documento del paciente avisa por `toast` y hace `return` sin
  llamar al callback**, así que la promesa del helper de guardado no resuelve nunca. Mi escena no
  ponía nombre. Dos arreglos y los dos hacen falta: el nombre, y un **reloj** sobre esa promesa.
  Y ⚠️ **las marcas de progreso dentro de `ex` no sirven para diagnosticar un cuelgue**: el arnés
  sólo las imprime cuando el caso **devuelve**. Lo que sirvió fue bisecar con un `return` temprano.

- **TRES CONDICIONES NACIERON DE MUTACIONES QUE SOBREVIVIERON, y las tres por el mismo motivo —el
  control miraba un solo camino—:** la **flecha** del botón (las otras condiciones la recortaban),
  el control del **espesor relativo** (los de automatismo miraban sólo el TAPSE, así que
  reintroducir la escritura dentro de `calcRWT` —el defecto que cerró el D-9— no rompía nada) y la
  **marca de espejo** en «Nuevo estudio». **14/14 muertas** tras cerrarlas, en worktree y nunca
  sobre el vivo, con guarda de md5.

- **CINCO CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-540 (F5)**, **TC-541 (E2)**
  y **TC-542 (H6c)**, **(H6e)** y **(H6h)** —ésta además cambió de premisa, porque el desacuerdo que
  montaba ya no se puede montar—, y **(H6i) se retiró** junto con el permiso que medía.

- **A/B contra el HEAD del D-10: 703 claves comparadas y UNA diferencia**, el identificador generado
  del estudio de prueba. Informe en tres estilos, EN SUMA, las 440 columnas de Excel clave por
  clave, el PDF y los campos: **cero**.
- ⚠️ **EL LOTE QUE FALTABA TRAJO UNA REGRESIÓN MÍA, Y ES LO PRIMERO QUE HAY QUE SABER DE ESTA
  ENTRADA.** Maicol cortó la primera corrida con 9 de los 11 lotes —sin un rojo nuevo en 495
  casos—; al retomarla, el **lote 10** destapó **TC-514 en rojo**. Verificado en el mismo
  directorio alternando sólo `index.html`: **verde en `954ee14`, rojo en el D-11**, y rojo también
  aislado, así que no era dependencia de orden.
  **La causa: `data-espejo` se usa para DOS cosas y las traté como una.** Es la marca de runtime
  que el reflejo pone —valor `'1'`— **y** una **declaración estática** en el marcado, sin valor,
  que dice «este campo es un espejo y no un dato del estudio». La llevan **CATORCE** elementos:
  `im_espejos`, `im_pisa`, `vab_funcion`, `mch_tvns`, `tv_legacy_ev`, los tres `mca_v_*`,
  `tdf_tv`, `dsav_vi_ro` y los dos `cvpa_*_ro`, entre otros. Al agregarla a la lista cerrada de
  «Nuevo estudio» **les borraba la declaración a los catorce en cada estudio nuevo**.
  **El arreglo:** el selector pide `[data-espejo="1"]` —que la declaración sin valor nunca
  matchea— y el cuerpo comprueba el valor antes de borrar. ⚠️ **Es la tercera vez en esta tanda
  que ese bloque cobra su propia advertencia: el selector y el cuerpo son DOS listas.**
  ⚠️ **Y UNA MUTACIÓN SOLA NO ALCANZABA PARA FIJARLO.** Romper **una** de las dos mitades
  sobrevive, porque la otra la tapa: la protección está duplicada **a propósito**, siguiendo la
  convención que el archivo declara. **M15 rompe las dos a la vez**, y la mata exactamente la
  condición que encontró la regresión, `(F4)` de TC-514. Y el arnés de mutaciones pasó a correr
  **DOS casos**: TC-543 no puede ver esto —sus condiciones siguen verdes si se borra de más—.

- **Línea base al cierre, con el árbol ya corregido: suite 554/558** en once lotes, **558 de 558
  casos distintos ejecutados** —contado nombre por nombre, no por la suma de los lotes—, con el
  pendrive `DISK_IMG` **montado y listando nombres reales al abrir, ENTRE LOTES y al cerrar** y el
  md5 de `index.html` idéntico antes y después. Los rojos son **TC-223, TC-376, TC-390 y TC-406**,
  los cuatro de siempre, **y ninguno más**: **TC-358 salió VERDE** en esta corrida.
  **15/15 mutaciones muertas.** Semgrep **124 WARNING / 0 ERROR**. Censo **1025**, 0 huérfanos.
  Excel **440**. Celular **63 a 360 px y 72 a 390, 17 ALTA en cada ancho** — idénticos a la base.
- ⚠️ **LA SUITE COMPLETA TARDA 11 MIN 49 S, MEDIDO LOTE POR LOTE, Y YO VENÍA SUPONIENDO HORAS.**
  Con la máquina recién reiniciada y sin Chrome zombis compitiendo: el lote más lento es el 6 con
  **2 min 31 s** y el más rápido el 2 con **3 s**. El barrido de dieciséis mutaciones, **12 min
  29 s**. ⚠️ **Y los lotes de 3 y 7 segundos SÍ corrieron sus 55 casos** —verificado contando los
  nombres en la salida—: lo que los hacía lentos antes era la carga de la máquina, no el trabajo.
- ⚠️ **EL REINICIO SE LLEVÓ `/tmp`, Y CON ÉL PLAYWRIGHT.** La sonda de dos motores salió con
  «SIN PLAYWRIGHT». Los **binarios de los navegadores sobreviven** en
  `~/Library/Caches/ms-playwright/`, así que alcanza con `npm i playwright` en `/tmp`: no hay que
  volver a descargar WebKit.
- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES, valor por valor**: 17/17 pestañas con caja, cero
  scroll horizontal, cero textos recortados y **cero errores de consola y de página en los dos
  motores**. Escribir no se volvió más lento: media **0,14 a 0,19 ms** contra 0,12 a 0,22 del D-10.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.**
- **`index.html` pasó de 9,86 MB / 138.867 líneas a 9,86 MB / 138.899.** Sello
  **`v20261028-1407`**, md5 **`cf1481d5`**.

- **Dónde está todo:** `docs/mapa/d11-dos-puertas.md` (**mapa NUEVO**, 5,1 KB), el puntero en
  `docs/mapa/d-cardioonco-amiloidosis.md` § 7, la ficha de TC-543 en
  `docs/mapa/tests-fichas-540.md`, y `docs/PENDIENTES.md` → **D-o**, **D-p** y **D-q**.

### VExUS, la HTP, el Forrester, la RVS y el POCUS — «C1» (2026-10-28)

- **CINCO commits.** `30890df` (C1-1) · `1ca3035` (C1-2) · `b73218b` (C1-3) · `0ee1956` (C1-4) ·
  el de cobertura y documentación. Sello **`v20261028-2000`**, md5 de `index.html`
  **`2ad1c673`**. Al empezar, `origin/main` = `HEAD` = **`96379fc`**, el cierre del D-11, ya
  publicado. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LA FUENTE SE LEYÓ EN IMAGEN, Y ES LO QUE SOSTIENE EL COMMIT 1.** La **Figura 7 de Rola P y
  cols., *Ultrasound J* 2021;13:32**, renderizada a 600 ppp, rotula los cuatro grados y nada
  más: `<2 cm → No congestion`; `0/3 → At risk`; `1/3 → Moderate congestion`; `2-3/3 → Severe
  congestion`. No publica conducta por grado, no vincula el grado 2 con la injuria renal aguda y
  no dice que la presión venosa central sea normal en el grado 0.
  ⚠️ **El archivo de la biblioteca tiene la autora mal escrita** —«VEXUS Tola.pdf»— y es **Rola**.

- ⚠️ **EL TEXTO Y LA FIGURA DEL MISMO ARTÍCULO DISCREPAN EN EL GRADO 1, Y MANDA LA FIGURA.** El
  cuerpo de la página 8 dice «only mild congestive findings» y la Figura 7 dice «0/3 → At risk»,
  o sea CERO patrones severos. La figura es además la que concuerda con lo que `vexusGrado` ya
  implementa. **Antes de «corregir» el grado 1 a «leve», leer `docs/mapa/c1-hemodinamica.md` § 1.**

- ⚠️ **TRES PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **El corte de congestión del Forrester NO es 18: es 15.** `UMBRAL_PCP_HUMEDO` vale 15 y se
     aplica como `pcp > 15`, así que una presión capilar de **18 SÍ es congestión** en esta app.
     El 18 es el del Braunwald. Dos textos de pantalla —el `ojo` del globo `hemo-forr` y la
     tercera línea de `forrLin`— afirman lo contrario: **reportados y sin tocar** → **C1-a**.
  2. **Un índice cardíaco de 2,2 exactos NO es hipoperfusión en el Forrester** (`ic < 2.2`). El
     «2,2 o menos» es de `_icBanda`, que es otra cápsula. Los mismos dos textos lo atribuyen al
     Forrester → **C1-b**.
  3. **El Laboratorio YA tiene un diagrama de Forrester**, pero ubica **un punto por estudio
     GUARDADO del período**, no al paciente en curso → **C1-e**.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: la RVS ignoraba la PAM medida por catéter.**
  Con el catéter en 58 y el campo de Hemodinámica vacío la cápsula decía «—» sobre un paciente
  que SÍ tiene una presión medida, mientras la hoja del posoperatorio, en el mismo estudio, ya la
  usaba. Hoy pregunta a `pamEfectiva()` y cierra **B-a**. Con las dos cargadas, la del catéter
  gana: 1385 → 875.

- **TRES DUEÑOS ÚNICOS NUEVOS, Y NINGUNA REGLA DUPLICADA.** `forrFaltaTxt` —los tres mensajes de
  «falta…», que la cápsula y la fila del panel ahora comparten, cerrando **A-d**—;
  `RVS_PAM_ORIGEN`; y `forrCuadrante`, extraído de `_labICPCP` **antes** de escribir el segundo
  diagrama, porque con la regla copiada los dos dibujos de la misma app podrían clasificar
  distinto el día que un corte se mueva.

- ⚠️ **EL GRÁFICO NO TOCA UNA SOLA SUPERFICIE FIRMADA, Y ESTÁ MEDIDO AISLADO.** El A/B del
  commit 4 contra el árbol del commit 3 da **CERO diferencias** en informe (tres estilos), EN
  SUMA, las 440 columnas de Excel clave por clave, los 962 campos, el Laboratorio por sus ocho
  funciones dueñas, el PDF en sus seis plantillas y el PPT — con **40** diferencias de pantalla
  como control positivo. Sin ese control, un cero no se distingue de «la sonda no mira nada».

- ⚠️ **EL ESPÍA DEL PPT DE LA SONDA HEREDADA SÓLO MIRABA `addText`**, y la fila del Forrester de
  la diapositiva es una fila de **tabla**: el A/B daba cero sobre ella sin que eso probara nada.
  Extendido a `addTable`, el PPT pasó de 27 a 30 textos y la diferencia apareció. Las sondas de
  las tandas A y B **siguen con el defecto** → **C1-g**.

- **LAS CATORCE MUTACIONES DIRIGIDAS, MUERTAS EN 1 min 42 s**, en worktree y nunca sobre el
  vivo, con guarda de md5 antes y después. **Dos de las catorce no revierten un arreglo: lo
  aplican de más** —M3 saca la frase del grado 3 y M7 le pone «sin evaluar» también al signo
  automático medido—, porque las condiciones que las matan son controles negativos, y un control
  negativo que ninguna mutación puede romper no está probando nada.

- **SEIS CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-471**, **TC-500** y
  **TC-502** (conteos del registro de globos, por `vexus-lim`), **TC-532 (F3)** y **TC-537 (N4)**
  —los dos **invertidos**, porque medían exactamente lo que esta tanda vino a cambiar— y
  **TC-535 (K0-K2)** (tres globos de 44×44 → cuatro).
  ⚠️ **TC-532 (F3) necesitó un segundo arreglo**: buscaba «El artículo no da pasos por grado»,
  que era la **nota del bloque retirado** y se fue con él. La declaración vive ahora en la última
  línea del bloque del artículo original.

- ⚠️ **TC-535 (E) ESTÁ ROJO, Y NO ES DE ESTA TANDA.** Verificado en un worktree en HEAD
  (`96379fc`), con los mismos scripts y en el mismo lote: el denominador (E0) da **0/0/0/0/0/0**
  en los dos árboles. Es dependiente del orden, como TC-507 en el AJ7 y TC-537 en la tanda A.

- ⚠️ **HUBO UN SEXTO COMMIT, Y LO PIDIÓ UNA MEDICIÓN.** El gráfico se pintaba en la cola de
  `calcHemo`, que corre **una vez por tecla**, y eso volvió la escritura más lenta: media
  **0,74 a 0,92 ms** contra 0,53 a 0,58 en HEAD, con el máximo de 0,8 a **2,6**. Hoy `calcHemo`
  sólo **registra** los dos números y quien dibuja es `hemoForrGrafSync`, en las tres columnas
  de siempre —`ESPEJOS_VIVOS`, `RECALC_MODULOS` y el final de `limpiarCampos`—. Medido de nuevo:
  **0,56 a 0,58 ms**, por debajo del HEAD, con el punto dibujado. Es además el mecanismo que la
  orden pedía. TC-544 y la sonda de dos motores pasaron a correr el barrido.

- **`index.html` pasó de 9,86 MB / 138.899 líneas a 9,89 MB / 139.274** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **Dónde está todo:** `docs/mapa/c1-hemodinamica.md` (**mapa NUEVO**, 10,3 KB), la ficha del
  caso en `docs/mapa/tests-fichas-544.md` (**archivo propio**), **siete mapas con un puntero cada
  uno** —medidos ANTES de escribir, todos por debajo de 35 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda C1» con la Figura 7 transcripta, las tres frases
  retiradas y la tabla «Cambios de evidencia» de dieciséis filas, y `docs/PENDIENTES.md` →
  **NUEVE** cosas declaradas (**C1-a** a **C1-i**).
  ⚠️ **`docs/mapa/tests.md` (34,8 KB) y `docs/mapa/informe-pdf-excel.md` (34,4 KB) NO se
  tocaron**, y está declarado en **C1-h**: el primero está a **246 bytes** del techo y el segundo
  a 600. La próxima tanda que necesite escribir en cualquiera de los dos tiene que partirlo.

### Los cortes del VD por la AHA/ACC 2026 — «TEP» (2026-10-29)

- **CUATRO commits.** `8c979a8` (TEP-1) · `46429fa` (TEP-2) · `3ad213b` (TEP-3) · el de cobertura
  y documentación. Al empezar, `origin/main` = `HEAD` = **`d48bff4`**, el cierre del C2, ya
  publicado, con md5 de `index.html` **`7fef59e4`**.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LAS CINCO FUENTES SE LEYERON EN IMAGEN, Y LA REGLA DE FOLIO SE COMPROBÓ EN EL PIE IMPRESO.**
  AHA/ACC 2026 (Creager, *Circulation* 2026;153:e977-e1051): **Tabla 4 en la hoja 13, folio
  e989** —«RV/LV >0.9» y «TAPSE <1.7 cm is abnormal»—; **recomendación 12, Clase 1 · B-NR** y
  **recomendación 9, Clase 3 «No Benefit» · B-NR**, las dos en la hoja 10, folio **e986**; y la
  **especificidad del 64 %** en la hoja 12, folio **e988**. Hotelling 2024, hoja 8 (77 % / 94 %,
  «not pathognomonic»). ESC 2019, hoja 14, folio 497.e14. Folio = «e» + (hoja + 976), verificado.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: la ficha del posoperatorio citaba un corte que
  su fuente no publica, y además mentía sobre lo que la app aplicaba.** Decía «TAPSE <17 mm ·
  VD/VI ≥1,0 — **ESC 2019**, folio e17», y **censado el documento entero, sus 58 hojas no
  contienen un solo «17 mm»**: el folio 497.e17 dice 16. Su globo remataba afirmando que esos eran
  «los mismos dos cortes que aplica la cápsula de TEP», que cortaba en **16**.

- ⚠️ **ESTO REVIERTE EL R7 Y NO LO CONTRADICE.** El R7 subió el VD/VI de 0,9 a 1,0 argumentando
  que el 0,9 era un corte de **tomografía**; con la ESC 2019 sobre la mesa, tenía razón. Lo que
  cambió es la fuente: la Tabla 4 de la AHA/ACC 2026 se titula «…**on Echocardiogram**» y publica
  ahí el `>0.9`. **Antes de volver a subirlo, leer `docs/mapa/tep-aha2026.md` §1.**

- ⚠️ **EL DUEÑO ÚNICO ES DEL PREDICADO, NO DEL NÚMERO, Y ESA ES TODA LA DECISIÓN DE DISEÑO.** Los
  **seis** consumidores compartían la constante y cada uno escribía su propio `>=`. Con el
  operador movido a `>` estricto eso dejó de alcanzar: el que se quedara con `>=` graduaría el
  **0,90 exacto** al revés que la cápsula, sobre el mismo paciente. **La mutación M4 es
  exactamente eso, y la caza una sola condición.**

- ⚠️ **EL POSOPERATORIO SIGUE EL CORTE SIN QUE SE LE TOQUE UNA LÍNEA, Y SE PREGUNTÓ ANTES.**
  `popPatron()` alimenta la hoja PostCEC del PDF, el EN SUMA, el PPT y el Laboratorio. **Decisión
  de Maicol: que lo siga.** Medido, y es la única diferencia: «¿Falla del VD?» pasa de naranja a
  rojo con VD/VI entre 0,9 y 1,0, y **en el 0,90 exacto no cambia nada**.

- **DOS PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.** (1) **La sección de TEP no vive en
  «la pestaña de ventrículo derecho y TEP»**: vive en `tab-hemodinamica` → **TEP-c**. (2) **La
  suite no tiene 553 ni 555 casos: tiene 560** —TC-1 a TC-545 sin huecos ni duplicados, más
  quince TC-GR—, contado nombre por nombre.

- **3d, RESPONDIDO Y NO TOCADO: la app SÍ asigna categorías de riesgo de TEP, en el panel de
  Evidencia.** `_indTEP` publica cinco categorías de la Tabla 8 de la ESC 2019, decididas con las
  **cuatro respuestas del médico** y nunca con el conteo del eco. **No aparecen** en la cápsula,
  el informe, el EN SUMA, el PDF ni el PPT. → **TEP-d**.

- **3c, CONFIRMADO EN VEZ DE REHECHO: la «Salvedad» ya no salía en el PDF.** La retiró el C-E2 el
  21/10. Medido ausente en los dos árboles, con la hoja de TEP de 490 caracteres como denominador.

- **14/14 MUTACIONES MUERTAS EN EL PRIMER BARRIDO**, en worktree y nunca sobre el vivo, con guarda
  de md5 antes y después. **M12 no es una reversión: aplica el corte de más**, al VD/VI de la
  probabilidad de HTP, y existe porque las condiciones que la matan son controles negativos.

- ⚠️ **TRES TRAMPAS NUEVAS, Y LAS TRES COSTARON UNA MEDICIÓN.** (1) `generarInforme()` **cambia de
  pestaña**: medir la geometría de un globo después de llamarlo da **0×0** sobre un botón que sí
  se dibuja. (2) El informe de TEP tiene **dos ramas** y el filtro de la primera sonda buscaba la
  de «criterios incompletos»: la línea salía vacía en todas las escenas cargadas y **el único que
  la tenía era el control negativo**, así que el A/B decía «sin diferencias» sobre un denominador
  de cero. (3) El badge de la **categoría A** de la probabilidad de HTP **agrega varios signos**:
  dice «signo presente» en 1,00 y en 1,01 por igual, así que un control que le pregunte a él
  **pasa en verde sobre cualquier corte**. Hay que preguntarle a `vdViEstado`.

- ⚠️ **TC-546 CAÍA CONTRA HEAD POR EXCEPCIÓN, Y ESO NO ES CAER.** El ayudante del globo devolvía
  `{ERROR}` cuando el botón no existe —que es justo el árbol anterior— y la primera condición que
  leía `.t` mataba el caso con un `TypeError`, sin decir qué invariante se rompió. Devolviendo una
  forma completa cae por **20 condiciones y ninguna por excepción**.

- ⚠️ **TC-476 y TC-478 SON INTERMITENTES POR UNA CARRERA PROPIA, NO POR ESTA TANDA.** Miden que la
  maquinaria `numdec` haya tomado `vd_vi` y leen antes de que esa pasada termine. Medido: los dos
  árboles convierten **384** inputs idénticos con cero errores, y pasan **3 de 3** al repetirlos.
  → **TEP-f**.

- **DIEZ CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-168** (el badge del
  POCUS), **TC-507** (H1, H2 y H4, las tres invertidas), **TC-510** (el denominador de las dos
  constantes, A1-A3, C1-C2 y G1-G2), **TC-471**, **TC-500** y **TC-502** (los tres conteos del
  registro de globos: 60 → **62**), **TC-535** (K0-K2: seis globos de 44×44 → **ocho**),
  **TC-534** (D4 y L4), **TC-544** (E1, el badge del POCUS) y **TC-537**.
  ⚠️ **SIETE DE LOS DIEZ LOS DESTAPÓ LA CORRIDA COMPLETA, NO EL CENSO**, y seis de esos siete son
  **conteos de inventario** que los dos globos nuevos corren — la clase de afirmación que grepear
  por el nombre de lo que tocás **no encuentra**. Es el mismo modo de falla que el C2 documenta
  con TC-520.
  ⚠️ **Y TC-537 HIZO EXACTAMENTE SU TRABAJO: es el guardián de la regla R7** —que ninguna cadena
  «folio N» se pierda de una superficie— **y cazó que esta tanda sacó «folio e17» de la ficha del
  posoperatorio**. Sacarlo era lo correcto, porque esa cita era falsa; lo que se adaptó es el
  folio que vigila, y el guardián sigue en pie.
  ⚠️ **DOS DE ELLAS TUVIERON QUE CAMBIAR DE FORMA Y NO SÓLO DE NÚMERO:** el denominador de TC-510
  medía que las dos constantes de TAPSE fueran **distintas** (16 contra 17), y hoy valen las dos
  17 con fuentes distintas; y su (G2) medía que la ficha **no dijera «17 mm»**, que era el corte de
  la pestaña VD. Las dos dejaron de poder distinguir lo que fueron a distinguir.

- **Dónde está todo:** `docs/mapa/tep-aha2026.md` (**mapa NUEVO**, 10,8 KB), **seis mapas con un
  puntero cada uno** —medidos ANTES de escribir, todos por debajo de 27 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda TEP» con la Tabla 4 transcripta fila por fila, las tres
  frases literales y la tabla «Cambios de evidencia» de veintiuna filas, y `docs/PENDIENTES.md` →
  **SIETE** cosas declaradas (**TEP-a** a **TEP-g**).

### Las pantallas, los anchos y la raíz aórtica — «G» (2026-10-29)

- **CINCO commits, y la orden pedía nueve.** `4b9fde9` (G-1) · `8f920c2` (G-2) · `dfcae42` (G-3) ·
  `9b0e67f` (G-4) · `3d08988` (G-4c) · el de cobertura y documentación. Sello **`v20261029-0759`**.
  Al empezar, `origin/main` = `HEAD` = **`8ef908e`**, el cierre de la tanda TEP, ya publicado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  ⚠️ **LOS COMMITS 5, 6, 7 y 8 NO SE HICIERON, y no quedaron a medias: ninguna línea de la app se
  tocó por ellos.** Están declarados en `docs/PENDIENTES.md` → **G-b**, con las cuatro fuentes ya
  leídas en imagen y transcritas, que es la mitad del trabajo.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: una raíz de 43 mm cargada en la pantalla de
  aortopatía hereditaria no llegaba al informe firmado.** La cápsula decía «—», el informe no
  nombraba la aorta y el EN SUMA tampoco. El diámetro vivía en **dos campos guardados que no se
  hablaban** —`ao_sin` y `marfan_ao_seno`— y el único puente era `_indAo`, que toma el máximo de
  los dos: un arreglo que admite que pueden discrepar.

- ⚠️ **EL ESPEJO SIMÉTRICO HABRÍA ROTO EL LABORATORIO, Y POR ESO ES CONDICIONAL.** Medido: con
  `ao_sin` = 40 y nada más, `marfanEstado().hayDatos` pasaba de `false` a **`true`**, o sea que la
  tarjeta de aortopatía se encendía y el módulo concluía «Aortopatía hereditaria — falta declarar
  el síndrome» sobre un paciente que no tiene ninguna; el **Laboratorio** cuenta un estudio como
  «Marfan/EHAT» con `marfan_ao_seno !== ''`, así que su panel habría pasado a incluirlos todos; y
  la columna de Excel habría pasado a traer valor siempre. El papel firmado no corría riesgo
  —ese bloque está detrás de «Integrar al informe», verificado—, pero las otras tres sí.
  La regla que quedó: **módulo → estudio siempre; estudio → módulo sólo si el módulo está en uso.**

- **SIN SEXO CARGADO, LA RAÍZ ENTRE 36 Y 40 mm YA NO SE CLASIFICA.** Medido en HEAD: sin sexo,
  36 y 39 mm daban «Normal (<40mm)» en la cápsula y «Aorta torácica de calibre normal» en el
  informe **firmado**, sobre un dato que en la mitad de la población es un hallazgo. Y el cableado
  tenía **dos trampas** que habrían afirmado lo contrario: `dil: grado !== 'normal'` lo contaba
  como dilatado, y `aoM.filter(x => !x.dil)` lo metía entre los normales.

- **TRES PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **El punto 2a no se reproduce.** Cero hallazgos en los 12 cruces de «Pericardio y pulmón», y
     cero también con el derrame pleural presente medido a 1200, 1000, 900 y 768 px. **La pestaña
     no tiene ningún SVG** y su única tarjeta ⓘ entra entera en los cuatro anchos. → **F-e**.
  2. **El punto 2c no se puede resolver con el mecanismo de ancho por clave.** Medido con la clave
     en 300, 374, 560, 640, 900 y 2000: a 390 px el ancho se topa en **374** para todos y el
     contenido mide **950 px** en una caja de 520. El problema es de **alto**. → **F-f**.
  3. **El posoperatorio NO tiene un corte propio de índice cardíaco.** Usa `_icBanda` y
     `_rvsBanda`, las mismas de Hemodinámica, y su propio comentario lo dice desde POP-2. No había
     nada que excluir.
  Y una cuarta, de la PARTE AJ8: **la Tabla 38 no es «UNA sola recomendación IIb·B»**: tiene
  **ocho**, y la de los ocho factores es una de ellas (leída en imagen, folio 80).

- ⚠️ **EL CAMBIO DEL COMMIT 3 ES CORRECTO Y SU EFECTO OBSERVABLE HOY ES CERO, MEDIDO.** El índice
  cardíaco que llega a la cápsula del «Perfil hemodinámico» tiene una sola fuente y pasa por π.
  Barrido de **3.812.589 combinaciones**: **cero** dan 2,2 exactos; lo más cerca es
  **2,1999990587652083**. La diferencia entre `<` y `<=` no se puede observar ahí. → **G-a**.

- ⚠️ **TRES CALIBRACIONES DE LA SONDA DE PANTALLA, Y LAS TRES CAMBIARON EL NÚMERO FINAL.** Los
  globos se contaban **dos veces**; marcar ALTA los 55 globos sin la regla de 44 daba **1.068**
  ALTA en vez de 30; y **el área táctil no es el rect**: este archivo la extiende con un `::after`
  absoluto que `getBoundingClientRect` no ve — `#pac-id-mk-ci` informa 7×11 px de caja y su área
  real es **35×41**, medido con `elementFromPoint`. Eran 24 ALTA falsas.

- **LA MEDICIÓN DE PANTALLA, ANTES Y DESPUÉS** (324 cruces: 27 puertas × 3 anchos × 2 temas × 2
  escenas, con 618 tarjetas ⓘ abiertas):

  | | ALTA | MEDIA | BAJA | scroll del cuerpo | tablas sin scroll | superpuestos | errores de consola |
  |---|---|---|---|---|---|---|---|
  | **antes** | **30** | 36 | 738 | 0 | 0 | 0 | 0 |
  | **después** | **0** | 38 | 738 | 0 | 0 | 0 | 0 |

  Las 30 ALTA eran **una sola causa**: diez pastillas de Válvulas con el rótulo recortado a 390 px
  («Insuficienc»). Las dos MEDIA nuevas son tarjetas ⓘ que scrollean, en la pestaña cuya fila ahora
  apila.

- ⚠️ **MI ARREGLO DEL 2d BORRÓ UNA BANDA CLÍNICA Y LO CAZÓ UN CASO.** La primera versión de la
  celda combinada se quedó sólo con «Decisión de la aplicación» y **borró «de 15 a 20 %»** de la
  tabla del VD: una pérdida de contenido que ninguna sonda de geometría ve, porque la fila seguía
  existiendo. La encontró **TC-535 (F1)**. La celda lleva el valor **y** su origen.

- **A/B contra HEAD, uno por commit**: commit 2, **cero** diferencias en 62 escenas, 65.766 claves
  y 27.280 celdas de Excel; commit 3, **cero**; commit 4, **cero** en ese mismo arnés.
  ⚠️ **Ese cero del commit 4 es el CONTROL NEGATIVO, no la prueba**: ninguna de esas 62 escenas
  carga la raíz sin sexo ni con el índice votando. La prueba es la sonda dedicada
  `_probe_graiz.mjs`, con **22 escenas**, donde cambian **seis** y son las seis buscadas, con
  `ajeno` y las otras quince idénticas.

- **NUEVE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**, y siete de ellos por la misma
  causa —medían la raíz en escenas **sin sexo cargado**—: **TC-41**, **TC-494** (dos condiciones),
  **TC-501** (H0, al que le faltaba la edad), **TC-502** (D3), **TC-519** (J3 y J13), **TC-521**
  (B4, que ahora exige además que el informe nombre el índice) y **TC-537** (C4, que exigía que
  «Decisión de la aplicación» estuviera bajo la cabecera «Mujer» — justo el defecto que el 2d
  cierra).

- **Línea base al cierre: suite 557/561** en once lotes **cubriendo los 561 casos**, con el
  pendrive `DISK_IMG` **montado y listando nombres reales al abrir, entre lotes y al cerrar**, y
  el md5 de `index.html` **idéntico** antes y después (`534a375b`). Los rojos son **TC-223,
  TC-376, TC-390 y TC-406**, los cuatro de siempre, **y ninguno más**: **TC-358 salió VERDE**.
  Semgrep **124 WARNING / 0 ERROR**. Censo **sin huérfanos nuevos**. Excel **440** columnas.
  Celular **63 hallazgos a 360 px y 72 a 390, 17 ALTA en cada ancho** — idénticos a la base.
- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES** (dos motores × 1440, 1000, 768 y 390 px × dos
  temas): **cero** desplazamiento horizontal del cuerpo, **cero** textos recortados y **cero**
  errores de consola y de página en los dos motores; las **8/8 pastillas con caja y 0 recortadas**
  en los cuatro anchos; la raíz sin sexo diciendo «No se puede clasificar sin el sexo» y con sexo
  femenino «Dilatada (≥36mm)»; el globo de la raíz en **356×573** (Chrome) y **356×572** (WebKit),
  entrando entero, sin «En este paciente», con las dos líneas nuevas y «folio 71» **una sola vez**;
  el nomograma en **560×266** con su cita a 10 px; y la fila del VD con **dos celdas y colspan 2**.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Y el binario de chromium de Playwright
  **sigue sin estar** en esta máquina, así que Chrome va por el del sistema con
  `channel:'chrome'`: sin eso la sonda devuelve los cruces vacíos.
- **`index.html` pasó de 9,92 MB / 139.564 líneas a 9,94 MB / 139.828** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.) El diff son **306 líneas
  agregadas y 42 quitadas**.

- **Dónde está todo:** `docs/mapa/g-raiz-aortica.md` (**mapa NUEVO**, 8,7 KB), el puntero en
  `docs/mapa/aj4-raiz-aortica.md`, `docs/fuentes/FUENTES.md` → «La tanda G» con las **cuatro
  fuentes transcritas en imagen** —Figura 5 folio 28 con sus ocho segmentos por sexo, apartado
  9.2.1.1 folio 71 literal, Tabla 38 folio 80 con sus ocho recomendaciones y sus ocho factores, y
  Tabla 62 folio 114— y la tabla «Cambios de evidencia» de dieciséis filas, y
  `docs/PENDIENTES.md` → **F-a** a **F-f** y **G-a** a **G-f**.

### El SGL, los territorios, los patrones y el 2,9 del score — «AJ9» (2026-10-29)

- **SEIS commits.** `85be8fc` (AJ9-1) · `6293326` (AJ9-2) · `931f4a3` (AJ9-3) · `aa19998` (AJ9-4)
  · `5a1171d` (AJ9-5) · el de cobertura y documentación. Sello **`v20261029-1110`**, md5 de
  `index.html` **`fc77acb0`**. Al empezar, `origin/main` = `HEAD` = **`a973f81`**, el cierre de
  la tanda G, ya publicado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LAS SEIS FUENTES SE LEYERON EN IMAGEN, Y EN UNA DE ELLAS ESO DECIDÍA EL SIGNO.** El
  extractor de texto plano **se come los signos menos** del consenso clínico 1 de la ASE 2025 y
  devuelve «18%» y «16%» en POSITIVO: un `pdftotext` habría publicado los dos cortes del lado
  equivocado del cero. Hoja 11, folio **995**, verificado glifo por glifo.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el −18 y el −16 estaban TECLEADOS en cuatro
  lugares sin dueño**, y el campo del strain —que no tiene `min` y nunca lo tuvo— llegaba al
  informe firmado como «SGL 18%», que leído literal es un strain positivo, o sea imposible.

- **SIETE PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **Biering-Sørensen 2023 SÍ está en la biblioteca** (`01_VI_y_camaras`). No se cita igual,
     porque la orden lo prohíbe.
  2. **La diferencia del segmento 15 entre Lang y Cerqueira no se puede verificar**: la Figura 5
     de Lang 2015 (folio 13) es un dibujo anatómico con categorías de color —incluidas «RCA o
     LAD» y «LAD o CX»— y **no numera los segmentos**. Se paró y no se escribió. → **AJ9-a**.
  3. **El corte AL de 3,1 no está en la Tabla 3 de Boldrini**: el score AL **no tiene fila SAB**.
     El 3,1 vive en la tabla de rendimiento de la hoja 27.
  4. **Cerqueira en la biblioteca es la versión del *Journal of Nuclear Cardiology*** (2002;9:240-5,
     folio **244**), no la de *Circulation* 105:539-542.
  5. **Los patrones son quince, no dieciséis.**
  6. **La app no rotula su modelo «AHA» en esa pestaña**: cero apariciones de esa sigla en las
     700 líneas del bloque de contractilidad y SGL. No había etiqueta que convertir en cita.
  7. **«Strain ASE 2025» vive en `17- Doppler tisular y strain`**, no en la carpeta 01.

- **WMSI: NO EXISTE en esta pestaña**, verificado de dos formas —cero claves con «wmsi» en el
  objeto global y cero nodos del DOM con «wmsi» en su id—. El único de la aplicación es
  `eeUpdateWMSI`, dentro del bloque muerto de Eco Estrés.

- ⚠️ **EL CAMPO DEL ESTUDIO Y LA COLUMNA DE EXCEL NO SE REESCRIBEN, Y ES UNA DECISIÓN.** El
  campo acepta lo que el médico escriba; lo que publica negativo es el PAPEL. Verificado escena
  por escena contra HEAD: ni un valor de campo ni una columna cambian. El precio —el Excel de un
  estudio con strain positivo sigue diciendo 18 mientras el informe dice −18— está declarado en
  **AJ9-f**, porque cambiar una columna de Excel exige parar y reportar.

- ⚠️ **EL RÓTULO SE FILTRABA ENTRE PACIENTES, Y LO CAZÓ TC-547 SOBRE MI PROPIO COMMIT 1.** El
  barrido de `limpiarCampos` alcanza a `#sgl-interp` —un `span[id]` dentro de un `.calc-row` de
  un `.calc-box`— pero **no** a `#sgl-interp-tab`, que es un `<div>` en otra pestaña. Medido:
  después de «Nuevo estudio» la fila volvía a «—» y la pestaña seguía anunciando
  «SGL -18% · limítrofe», o sea el strain del paciente ANTERIOR.

- ⚠️ **ABRIR EL GLOBO DEL 2,9 LE SUMABA TRES PUNTOS AL SCORE.** El contenedor `.criterio-item`
  lleva su propio `onclick="toggleCrit(...)"`, así que el botón necesita `stopPropagation` —el
  mismo motivo por el que el botón «Calcular» de al lado ya lo lleva—. Lo fija TC-547 (F4),
  clickeando de verdad y no llamando a `vInfoClic`.

- **TRES PARTES SE PARARON Y SE REPORTARON, NO SE APLICARON**: la diferencia del segmento 15
  (**AJ9-a**); la palabra «patognomónico» del patrón de amiloidosis, que la biblioteca no
  sostiene —Phelan publica 93 % y 82 %, y la Figura 6 ilustra una insuficiencia renal terminal
  que lo imita— (**AJ9-d**); y el signo del filtro de cardio-oncología del Laboratorio, que
  cuenta como anormal todo lo tipeado en positivo (**AJ9-c**).

- **LA RESPUESTA AL PUNTO 4, CON EJEMPLO MEDIDO.** `calcApice` divide el valor absoluto del
  campo «Strain apical» por el del campo «Strain basal», los dos **genéricos**; Boldrini define
  el SAB como la relación **septal**, en **cuatro cámaras**. El mismo paciente: apical −18 % y
  basal −6 % → **3,00**, criterio marcado, **+3 puntos**; el mismo apical con un basal GLOBAL de
  −7,5 % → **2,40**, sin marcar, **0 puntos**. Son tres puntos de un score diagnóstico desde
  ocho. **El corte no se movió**: 2,89 → 0 · **2,90 → 0** · 2,91 → 3.

- **A/B contra HEAD, uno por commit, y las diferencias de superficie firmada son SÓLO las
  autorizadas.** Commit 1: 14 escenas de 1467 claves, **cero** diferencias en las once escenas
  con SGL negativo y en los dos controles; las únicas son las **20 por escena** con SGL
  POSITIVO, y son el signo. Commits 2, 3, 4 y 5: **CERO** diferencias de superficie firmada, con
  el control positivo de pantalla al lado. Denominadores por escena: informe en los tres
  estilos, EN SUMA, las **440** columnas de Excel clave por clave, 961 campos, el Laboratorio por
  sus ocho funciones dueñas, el PDF generado de verdad en sus **seis** plantillas y el PPT.

- **12/12 MUTACIONES DIRIGIDAS MUERTAS EN EL PRIMER BARRIDO**, en worktree y nunca sobre el
  vivo, con guarda de md5. **Dos de las doce no revierten nada: aplican de más** —la 05 hace que
  el rótulo se cuele al informe firmado y la 11 que el 2,90 exacto sume—, y existen porque las
  condiciones que las matan son **controles negativos**.

- ⚠️ **TC-547 SALÍA VERDE AISLADO Y ROJO EN LA CORRIDA COMPLETA, Y LA CAUSA ERA MÍA: el estilo
  de informe es estado de SESIÓN.** Un caso anterior lo dejaba en **narrativo**, donde la frase
  es «y un strain longitudinal global de −18%» y no «SGL −18%»: el dato estaba y la condición no
  lo veía, con el informe emitido en 904 caracteres. Hoy el caso fija el estilo con un helper
  propio, y de paso gana una condición que mide el **narrativo** aparte.

- ⚠️ **Y TC-535 CAYÓ POR UNA ANIMACIÓN, NO POR UNA MAQUETA.** `.sacc-body` abre con `max-height`
  y una transición de **0,3 s**: medir en el acto lee la caja de MITAD de la animación y los
  hijos informan un rect que se superpone con el encabezado de su propia sección, así que
  `elementFromPoint` devolvía el encabezado en las cuatro esquinas. **No había ningún solape
  real** —a 1440 px el mismo botón daba los cinco puntos propios— y costó media docena de
  mediciones averiguarlo. El arnés ahora abre la sección **y le saca la animación** antes de
  medir.

- **SIETE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-471** y **TC-500** (el
  registro de globos, 62 → **65**), **TC-502** (el censo de Referencias 35 → **36**, el reparto
  de Función 3 → **4**, el índice del buscador 33 → **34** y el mapeo de tarjetas 41 → **44**),
  **TC-507** (los chips «Criterio de EcoSmart», 16 → **18**), **TC-509** (el mismo censo) y
  **TC-535** (los globos de 44×44, ocho → **once**, y su MÉTODO).

- **Línea base al cierre: suite 558/562**, en once lotes **cubriendo los 562 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **montado y listando nombres reales al abrir, ENTRE LOTES y
  al cerrar** y el md5 de `index.html` **idéntico** antes y después (`fc77acb0`). Los rojos son
  **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, **y ninguno más**: **TC-358 salió
  VERDE**. La corrida tarda **10,7 min**.
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 556/562 CON DOS ROJOS MÁS, LOS DOS MÍOS**, y por eso
  esa cifra no es la línea base: **TC-507** contaba los chips «Criterio de EcoSmart» y mi ficha
  nueva agrega dos, y **TC-547** caía por el estilo de informe que un caso anterior deja en
  narrativo. Los dos están cerrados y la cifra de arriba sale de la corrida **limpia**, de una
  sola pasada con el archivo de tests final.
  Semgrep **124 WARNING / 0 ERROR**. Excel **440** columnas. Censo **1025** campos, **0
  huérfanos**. Celular **63 hallazgos a 360 px y 72 a 390, 17 ALTA en cada ancho** — idénticos a
  HEAD, medidos en un worktree con el mismo script. 17 bloques de JS inline parsean.
- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES** (dos motores × 1440 y 390 px × dos temas),
  **valor por valor**: 17/17 pestañas con caja, **cero** desplazamiento horizontal del cuerpo,
  **cero** textos recortados y **cero errores de consola y de página en los dos motores**; el
  rótulo idéntico en los dos nodos y en las cuatro bandas —con el `+18` saliendo
  «SGL -18% · limítrofe» y el campo intacto en 18—; la ficha con sus 14 filas, sus cinco folios
  y sus dos chips; y los **tres globos nuevos en 44×44 con los CINCO puntos dando el propio
  botón**, también a 390 px —que es lo que confirma que el fallo de TC-535 era la animación y no
  la maqueta—.
  **Escribir no se volvió más lento**: trece teclas reales, media **0,32 ms** en los dos árboles,
  máximo 1,9 contra **1,8**, y el barrido de espejos 4,5 contra **4,7 ms**.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.**

- **`index.html` pasó de 9,94 MB / 139.828 líneas a 9,98 MB / 140.189** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- ⚠️ **EL ACENTO GRAVE DENTRO DE UN COMENTARIO COSTÓ CUATRO CORRIDAS, Y `check_backticks.py` NO
  CAZÓ NINGUNA.** El cuerpo de una sonda o de un caso es un template literal: un backtick
  —aunque esté en un comentario— cierra la cadena y el archivo deja de parsear con un
  `SyntaxError` que apunta decenas de líneas antes del culpable. **Lo que sirve es `node --check`
  sobre el archivo.** → **AJ9-g**. Y su hermana: una barra invertida escrita simple en un heredoc
  de Python llega al template como ninguna —`/pice\/base/` salió «Invalid regular expression
  flags» y `/toggleRef\('…'/` salió «Unterminated group»—.

- **Dónde está todo:** `docs/mapa/aj9-sgl-patrones.md` (**mapa NUEVO**, 14,9 KB), la ficha del
  caso en `docs/mapa/tests-fichas-547.md` (**archivo propio**), **seis mapas con un puntero cada
  uno** —medidos ANTES de escribir, todos por debajo de 29 KB—, `docs/fuentes/FUENTES.md` →
  «La tanda AJ9» con las seis fuentes transcritas, la tabla de premisas falsas y la de «Cambios
  de evidencia» de veintisiete filas, y `docs/PENDIENTES.md` → **SIETE** cosas declaradas
  (**AJ9-a** a **AJ9-g**).

### El strain en Referencias, el TRIV y el sexo — «Y, Parte 1» (2026-10-29)

- **CUATRO commits, y la orden pedía TRECE.** `b7d110e` (Y-1) · `505a9ee` (Y-2) · `1d1e591` (Y-3)
  · el de cobertura y documentación. Sello **`v20261029-1647`**, md5 de `index.html`
  **`7ef7a5de`**. Al empezar, `origin/main` = `HEAD` = **`2180c69`**, el cierre de POP-V2, ya
  publicado, con el pendrive `DISK_IMG` montado y listando nombres reales.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  ⚠️ **LOS COMMITS 4, 5 y 6 DE LA PARTE 1 Y LA PARTE 2 ENTERA NO SE HICIERON, y no quedaron a
  medias: ninguna línea de la app se tocó por ellos.** Están declarados uno por uno en
  `docs/PENDIENTES.md` → **Y-d** a **Y-g**, con los inventarios y las mediciones ya hechas. Y el
  punto **6b** —que era «sólo leer y reportar»— **sí se contestó**.

- **EL HALLAZGO MÁS GRANDE, EN UNA LÍNEA: el corte de 75 ms del TRIV no existe en la biblioteca.**
  La orden condicionaba el color y el significado de las dos referencias a verificarlo **en
  imagen**. Se verificó: la ASE 2025 de corazón derecho publica **≤ 73 ms** —hoja 28, folio 168,
  «IVRT … is typically ≤73 ms in normal healthy adults», y **Tabla 6**, hoja 29, folio 169,
  «RV IVRT, ms: ≤73 / >73»— y lo hace para **otra pregunta**: la función diastólica del VD, no
  «a favor de HTP». El 75 de `DT_TRIV_HTP_PANEL` es una decisión de pantalla ya declarada en el
  archivo y **sin fuente publicada**; el 60 que gobierna el informe firmado tampoco la tiene.
  **El campo y la sincronización sí se hicieron**, que es lo que la orden deja sin condición.
  → **Y-b**.

- **DOS PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **El 4b no tenía nada que alinear.** La app **ya aplica `≥ 45`** para el Marfan
     (`UMBRAL.marfan.iia = 45` con `maxAo >= u.iia`): medido sobre HEAD, 44,9 mm da
     `sin_indicacion` y **45,0 exactos dan `cx_iia`**, «Clase IIa · Nivel C desde 45 mm con
     factores». El `maxAo > 45` que `G-c` citaba es el de **Loeys-Dietz**, y ahí el estricto es
     **correcto** porque su Tabla 66 dice «SUPERIOR A 45 mm». **`G-c` era un pendiente falso y
     queda cerrado en `docs/PENDIENTES.md`**, con la medición al lado.
  2. **La suite no tenía 553 casos: tenía 563** al abrir —TC-1 a TC-548 sin huecos ni duplicados
     más quince TC-GR—, contado nombre por nombre.

- ⚠️ **EL DEFECTO DEL SEXO ERA DE PANTALLA Y NO DEL PAPEL, Y ESO CAMBIA DÓNDE SE ARREGLA.** El
  `onchange` del sexo llamaba sólo a `calcDiastol`, así que las cápsulas de AI/VI y de la aorta se
  quedaban con la clasificación del sexo anterior. Medido en HEAD: con la raíz en 38 mm y sexo
  femenino, `ao-interp` seguía diciendo «No se puede clasificar sin el sexo» y `ai-diam-interp`
  «Normal (≤40mm)» sobre 39 mm, que en una mujer es dilatado. **El informe no estaba atrasado** —se
  regenera entero cada vez—: lo que se atrasaba era la pantalla, que es desde donde se decide.

- **QUÉ SE RE-EVALÚA NO ES UNA SUPOSICIÓN: salió de un barrido sobre los 137 candidatos.** Todos
  los `calc*` de `window` más los de `RECALC_MODULOS`, llamados uno por uno sobre un estudio con
  el sexo recién cargado, mirando cuáles movían alguno de los **1.824 nodos** de la foto. Movieron
  **dos**: `calcBSA` —que encadena `calcAI`, `calcVI` y `calcAo`— y `calcAorta`. `sexoRecalcSync`
  llama a `calcAI` y `calcVI` **directo** y no a `calcBSA`, porque ése arrastra `calcAo`, que
  **escribe el grado** de la estenosis aórtica, y un cambio de sexo no puede mover una afirmación
  de severidad.

- **EL AVISO NARANJA NO SE AGREGÓ AL DUEÑO ÚNICO, Y ESO ES DELIBERADO.** `aiviSexoSync` ya tiene
  su oyente de documento sobre `input`, y un `<select>` lo dispara —medido—. Dos mecanismos para
  el mismo trabajo es lo que hace que una mutación sobreviva.

- **EL EN SUMA NO PERDIÓ NINGUNA FRASE, PORQUE NUNCA LA TUVO.** El punto (i) pedía que el informe
  y el EN SUMA dijeran sólo el diámetro: medido en las quince escenas del A/B, el EN SUMA **no
  tiene línea** para una raíz sin clasificar, ni antes ni después. Agregarle el diámetro habría
  metido una línea en el resumen de hallazgos de todo estudio con la raíz medida y sin sexo.

- ⚠️ **EL DENOMINADOR DE MI PROPIA SONDA ESTABA ENVENENADO, Y EL A/B DEL COMMIT 2 DABA CERO SIN
  PROBAR NADA.** Buscaba el espejo del TRIV con guion **bajo** (`vd_triv`) y el campo va con guion
  **medio** (`vd-triv`): decía «NO EXISTE» en los **dos** árboles. Lo destapó mirar el volcado, no
  la lectura. Corregido antes de medir: hoy el denominador publica que el espejo toma el valor
  (74, 76) y que no es campo del estudio.

- **13/13 MUTACIONES DIRIGIDAS MUERTAS**, en un worktree y nunca sobre el vivo, con guarda de md5.
  **Tres de las trece no revierten nada: la aplican de más** —la 05 hace que la fila del strain se
  vea con un 0 o con un valor fuera de banda, la 10 que el sexo deje de re-evaluar la aorta y la
  12 que el papel vuelva a llevar la frase—, porque las condiciones que las matan son **controles
  negativos**. Y la **08 rompe las dos puertas a la vez**, que es la lección del D-11.
  ⚠️ **DOS MUTACIONES NO APLICARON AL PRIMER BARRIDO Y NINGUNA ERA FALTA DE COBERTURA: las dos
  estaban mal escritas.** La 02 no contaba el `style="display:none;"` del marcado, y la 06 se
  anclaba en `if (dst.value === src.value) return …`, que aparece **seis** veces en el archivo
  —es el patrón de todos los espejos de la casa—.

- **A/B contra HEAD, uno por commit, y las diferencias de superficie firmada son SÓLO las
  autorizadas.** Commit 1: **cero** en 9 escenas, 10.010 claves y 3.960 celdas de Excel, con 27
  diferencias de pantalla como control positivo. Commit 2: **cero** en 8 escenas —los bordes
  74/75/76 del corte de pantalla y 59/60/61 del del papel—, 8.896 claves y 3.520 celdas. Commit 3:
  **DOCE**, todas en `yAo36` y `yAo39`, las dos escenas con la raíz cargada **sin sexo**, sobre 15
  escenas, 16.694 claves y 6.600 celdas.

- ⚠️ **EL ACENTO GRAVE DENTRO DE UN COMENTARIO COSTÓ DOS CORRIDAS, Y `check_backticks.py` NO CAZÓ
  NINGUNA.** Las dos veces fue un id escrito entre acentos graves dentro del comentario de un
  caso, y el cuerpo de un caso es un template literal. **Lo que sirve es `node --check` sobre el
  archivo.** Sus cuatro hallazgos siguen siendo los de `_probe_aj2.mjs`, preexistentes y falsos.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **valor por valor**, y son **idénticos a HEAD** en todo lo que no es el cambio:
  **cero** errores de consola y de página en los dos motores y en los dos árboles, **cero**
  desplazamiento horizontal del cuerpo, **cero** textos recortados, el rótulo «TRIV por Doppler
  tisular (ms)» entero en los cuatro anchos y 17/17 pestañas con caja a 1440 y 1000 px (11 a 768 y
  390, que es el desplegable móvil y es **idéntico en HEAD**). Las tres diferencias son
  exactamente las que la tanda introduce.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** El binario de chromium de Playwright
  sigue sin estar en esta máquina, así que Chrome va por el del sistema con `channel:'chrome'`:
  sin eso la sonda devuelve los cruces vacíos.

- **Línea base al cierre: suite 560/564**, en once lotes **cubriendo los 564 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **montado y listando nombres reales al abrir, ENTRE LOTES y
  al cerrar** y el md5 de `index.html` **idéntico** antes y después (`7ef7a5de`). Los rojos son
  **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, **y ninguno más**: **TC-358 salió
  VERDE**.
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 559/564 CON UN ROJO MÁS, QUE ERA MÍO**, y por eso esa
  cifra no es la línea base: **TC-457** tiene su propio denominador del cuadro del VD y se me
  pasó del censo. Está adaptado y la cifra de arriba sale de la corrida **limpia**, de una sola
  pasada con el archivo de tests final.
- **Semgrep 124 WARNING / 0 ERROR.** Excel **440** columnas con las mismas claves. Celular **63
  hallazgos a 360 px y 72 a 390, 17 ALTA en cada ancho** — idénticos a la base. Censo **1027 →
  1028**: **+1 control de pantalla y CERO campos guardados nuevos**, declarado en **Y-a**. 17
  bloques de JS inline parsean. Sin huérfanos nuevos.
- **`index.html` pasó de 10,02 MB / 140.761 líneas a 10,04 MB / 140.965** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **CUATRO CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-476** y **TC-478** (el
  cuadro del VD pasa de diez a once filas y de tres a cuatro condicionales; la grilla, de
  diecisiete a dieciocho campos y la columna 1 de seis a siete), **TC-521 (B3)** (la pastilla de
  la raíz dejó de esconder el valor del índice) y **TC-457** (el mismo conteo de once filas).
  ⚠️ **TC-457 SE ME PASÓ DEL CENSO Y LO DESTAPÓ LA CORRIDA COMPLETA.** Tiene su propio
  denominador —«el cuadro del VD tiene DIEZ filas (7 + FEVD + Qp + VD/VI)»— que es **el mismo
  invariante que TC-476 escrito con otras palabras**, así que grepear el conteo encontró uno y no
  el otro. Es el mismo modo de falla que la tanda C2 documenta con TC-520: una afirmación de
  inventario no se encuentra buscando el nombre de lo que tocaste.
  ⚠️ **Y TC-526 GANÓ TRES CONDICIONES EN VEZ DE SÓLO MUDARSE**: que el nodo viejo ya no existe,
  que la fila sigue a la del Tei y que la marca de plausibilidad **no** se movió — para que pueda
  volver a fallar si alguien repone el nodo de debajo del campo.

- **Dónde está todo:** `docs/mapa/y-vd-sexo-aorta.md` (**mapa NUEVO**, 11,8 KB), **cinco mapas con
  un puntero cada uno** —medidos ANTES de escribir, todos por debajo de 35 KB; ⚠️
  `vd-derecho.md` quedó en **34,4 KB**, a 626 bytes del techo, así que la próxima tanda que lo
  toque tiene que partirlo—, `docs/fuentes/FUENTES.md` → «La tanda Y, Parte 1» con la Tabla 6 de
  la ASE 2025, la Tabla 62 y la **Tabla 38 transcritas fila por fila en imagen** y la tabla
  «Cambios de evidencia» de doce filas, y `docs/PENDIENTES.md` → **OCHO** cosas declaradas
  (**Y-a** a **Y-h**) más el cierre de **`G-c`**.

### El posoperatorio reordenado — «POP-V2» (2026-10-29)

- **SIETE commits.** `a8b8fad` (1) · `74ca213` (2) · `7eba352` (3) · `892fd84` (4) · `31a4e39` (5)
  · `2a01ba9` (6) · el de cobertura y documentación. Sello **`v20261029-1425`**, md5 de
  `index.html` **`f72a928c`**. Al empezar, `origin/main` = `HEAD` = **`c1a0ef9`**, el cierre de la
  tanda AJ9, ya publicado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **EL DEFECTO QUE EL MÉDICO MIDIÓ, EN UNA LÍNEA: con índice cardíaco 1,57 la conclusión decía
  «Sin patrón de bajo gasto» ocho renglones debajo de «IC 1.57 — bajo».** Los cuatro patrones
  exigen combinaciones, y un paciente con el gasto bajo y todo lo demás en rango no cae en
  ninguna: «ninguno de los cuatro patrones» no es «sin bajo gasto». Hoy dice «Índice cardíaco
  bajo, sin un patrón que lo explique con los datos cargados».

- **LOS DOS DEFECTOS DE PANTALLA, MEDIDOS ANTES Y DESPUÉS a 1440 / 1000 / 768 / 390 px.** El
  recuadro del Swan-Ganz tenía **250 px de caja para 406 de contenido** a 1440 px y 250 para 367 a
  1000: hoy ninguno de los cuatro anchos scrollea. Y los **SEIS** selectores del POCUS quedaban
  recortados a 1000 px, con 9, 13 y 43 px de ancho útil para opciones que necesitan 100 a 110:
  hoy 0 de 6 en los cuatro anchos. Arreglado **por los dos lados** —la subgrilla y el piso de
  170 px del `.grid-3` de adentro—, porque uno solo no alcanzaba.

- **CUATRO PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **El dibujo YA reaccionaba al derrame pleural y a las líneas B** desde la G2 —`plR`, `plL` y
     los cuatro pares de `bl`—. Lo que faltaba son el Impella y el ECMO venovenoso, que
     `popEsqTexto` ya nombraba en el texto y el dibujo no tenía.
  2. **El consenso argentino del lactato está en la hoja 15, no en la 11**, y **archivado en la
     carpeta equivocada**: `19_Pulmon_POCUS/COMPLETO-B-52.pdf`. Censado **por contenido** sobre
     los 185 PDF de la biblioteca, porque por nombre de archivo no aparece.
  3. **El PiCCO no tiene campo de PAM en esta app**, censado: sus cinco campos son GC, IC, ITBVI,
     EVLWI y SVRI. → **POP-b**.
  4. **La RVS «ya la lee del dueño único» es verdad para la cápsula y FALSA para `popPatron`**,
     cuya tercera rama sigue leyendo `v('hemo_pam')`. Medido: con sólo la línea arterial cargada,
     la cápsula publica 1009 y el módulo ninguna; con las dos, 1009 contra 1574. → **POP-c**.

- **LA DOSIS SE CALCULA SOLA, Y GANA LA ÚLTIMA EDICIÓN DEL MÉDICO.** Dos marcas de runtime y
  ninguna persistida: `data-pop-auto` («lo escribió la app») y `data-pop-mano` («lo escribió una
  persona», puesta por el `oninput`). La segunda es lo único que hace que **borrar** la dosis la
  deje borrada —sin ella el barrido de espejos la repuebla 220 ms después, que es el defecto que
  el D-9, el D-10 y el D-11 pagaron tres veces—. Las dos entran en la lista cerrada de «Nuevo
  estudio», en el **selector y en el cuerpo**. Una dosis de un estudio viejo no se pisa por
  construcción: viene sin `data-pop-auto`.

- ⚠️ **EL SELECTOR DE TIMING DEL BALÓN NO ES UN CAMPO GUARDADO, Y ES UNA DECISIÓN FORZADA.** La
  orden autoriza **un solo** campo nuevo y ése es la PAM por línea arterial. Va con guion MEDIO
  —`pop-bcia-timing`— y entra en las DOS listas paralelas. **El precio, declarado: el timing no
  sobrevive a cerrar y reabrir el estudio.** → **POP-d**.

- **LAS DOS FUENTES DEL CORTE DE LACTATO SE LEYERON EN IMAGEN**, a 400 y 500 ppp, porque el signo
  «mayor que» es justo lo que una extracción de texto se come: ACC 2025 (Sinha, *J Am Coll
  Cardiol* 2025;85(16):1618-1641, **hoja 5, folio 1622**) y el Consenso de Shock Cardiogénico de
  la SAC (*Rev Argent Cardiol* 2024;92 Supl. 3, **hoja 15, folio 7**). Las dos cortan en 2 y las
  dos son **estrictas**. Las citas van en el globo ⓘ `pop-senales`.
  **La app NO asigna etapas SCAI ni emite «shock cardiogénico»**, y las dos fuentes usan ese
  mismo corte para definir el estadio C — que es justo lo que acá no se publica.

- **LOS CORTES 12 Y 18 ESTABAN ESCRITOS A MANO, CUATRO VECES CADA UNO.** El 18 coincidía en el
  número con `UMBRAL_PCP_HUMEDO` y era una segunda copia; el 12 es criterio propio y ahora tiene
  su constante. **Ningún número cambió.**

- **EL PATRÓN Y LAS CINCO PREGUNTAS SALIERON DEL PPT**, que era la **única** superficie firmada
  que seguía publicándolos: 35 textos → 29. El informe, el EN SUMA y la hoja del PDF ya no los
  llevaban desde la G4. ⚠️ **El Laboratorio NO se tocó**: su fuente son estudios guardados antes
  de la G4 y no se migra nada, que es lo que la orden manda hacer si el patrón sale ahí.

- **A/B contra HEAD, UNO POR COMMIT**, con el control positivo de pantalla al lado: commit 1,
  **cero** diferencias de superficie firmada en 5.409 claves; commit 2, **cinco** y las cinco
  autorizadas —el campo de la dosis, el bloque integrado, la hoja del PDF y el PPT pasan de
  «Vasoactivos | Noradrenalina» a «… Noradrenalina 0.2 mcg/kg/min»—; commit 3, el campo nuevo y
  su línea «PAM | 62 mmHg (medida (línea arterial))»; commit 4, **cero** en 10.844 claves;
  commit 5, **dos**, las dos el rótulo del patrón en el PPT de las escenas integradas, que el
  commit 6 retira; commit 6, **cinco**, las cinco en el PPT. Excel en **440** columnas con las
  mismas claves en todos.
  ⚠️ **LAS ESCENAS DE BORDE NO CAÍAN EN EL BORDE.** Se había supuesto una superficie corporal de
  1,8277 y la que esta app calcula con peso 70 y talla 170 es **1,818118685772619**: el «2,2
  exacto» daba **2,212**, del lado normal. Recalculadas preguntándole a `getBSA()`.

- **Línea base al cierre: suite 559/563**, en once lotes **cubriendo los 563 casos distintos**
  —contados nombre por nombre—, con el pendrive `DISK_IMG` **montado y listando nombres reales al
  abrir, entre lotes y al cerrar** y el md5 de `index.html` **idéntico** antes y después
  (`f72a928c`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, **y
  ninguno más**: **TC-358 salió VERDE**. Semgrep **124 WARNING / 0 ERROR**. Excel **440**
  columnas, sin una sola clave `pop_`. Censo del script **1025 → 1027** (+1 campo guardado
  autorizado, +1 control de pantalla), **0 huérfanos**; el juego de campos **guardados** se movió
  en exactamente uno, medido con `_camposN` en el A/B. Celular **63 hallazgos a 360 px y 72 a
  390, 17 ALTA en cada ancho** — idénticos a la base. 17 bloques de JS inline parsean.
- **14/14 MUTACIONES DIRIGIDAS MUERTAS EN EL PRIMER BARRIDO**, en 1 min 26 s, en worktree y nunca
  sobre el vivo, con guarda de md5. **Tres de las catorce no revierten nada: aplican de más** —el
  lactato de 2,0 exactos, el TAPSE de 17 exactos y el VD/VI de 0,90 exactos—, porque las
  condiciones que las matan son **controles negativos**. Y **la 13 rompe LAS DOS listas a la vez**:
  una mutación que rompa una sola la tapa la otra, que es la lección del D-11.
- **TC-548 cae contra HEAD por 51 de sus 82 condiciones y NINGUNA por excepción.** Las 31 que
  pasan en los dos árboles son los denominadores y los controles negativos.
- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES CADA UNO** (dos motores × 1440, 1000, 768 y
  390 px × dos temas × dos escenas): **cero** scroll del recuadro, **cero** selectores recortados,
  **cero** desplazamiento horizontal del cuerpo, **cero** textos recortados y **cero errores de
  consola y de página**, con los tres órdenes coincidiendo y los globos en 44×44 con los **cinco
  puntos dando el propio botón**. La diferencia entre motores es de **1 px** en el alto del
  recuadro. ⚠️ **WebKit de Playwright no es Safari, y se declara.**
  **Escribir no se volvió más lento**: quince teclas reales, media **0,61 ms** contra 0,67 en
  HEAD, máximo 1,3 contra 1,5, y el barrido de espejos **5,8 ms** contra 7,1 — con la dosis
  escribiéndose de verdad en el árbol nuevo y vacía en HEAD, que es el denominador.
- **CINCO CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-534** (cinco
  condiciones: la reserva de hueco, el reparto por áreas, el rótulo del balón con su timing y las
  dos de la vasoplejia), **TC-471**, **TC-500** y **TC-502** (el registro de globos, 65 → **67**,
  y el mapeo a Referencias 44 → **46**).
- **`index.html` pasó de 9,98 MB / 140.189 líneas a 10,02 MB / 140.761** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- ⚠️ **UNA TRAMPA DE INSTRUMENTACIÓN QUE VALE PARA CINCO ARNESES VIEJOS: una casilla se persiste
  como `<id>__chk`, no como `<id>`.** El estudio sintético del arnés de A/B heredado no tenía esa
  clave, así que `generarPPT` —que carga el estudio en el formulario— reponía **todas** las
  casillas apagadas: la franja de drogas decía «sin infusión activa» sobre una escena con la
  noradrenalina marcada, **en los dos árboles**. Corregido en `_probe_popab.mjs`; siguen con el
  defecto `_probe_r2ab`, `_probe_aab`, `_probe_bab`, `_probe_c1ab` y `_probe_c2ab`. → **POP-g**.
  Y al corregirlo se destapó que **el PPT imprime la CLAVE de la droga** (`nor 0.2`) y no su
  nombre, porque el `label[for=…]` que busca no existe. Preexistente, no tocado. → **POP-h**.

- ⚠️ **Y DOS MÁS, DE LAS QUE CUESTAN UNA CORRIDA.** (1) `#login-overlay` es `position:fixed` y
  tapa la página entera: sin descartarlo, `elementFromPoint` da **0 de 5 puntos** sobre un globo
  que mide 44×44 de verdad. (2) **`check_backticks.py` no distingue el cuerpo de un caso del
  comentario de bloque que lo precede**: una limpieza que borre «todos los acentos graves del
  bloque» se lleva los del comentario del caso siguiente, que son legítimos. Costó restaurar
  **TC-534 entero desde git**.

- **Dónde está todo:** `docs/mapa/pop-v2-posoperatorio.md` (**mapa NUEVO**, 20,1 KB, con la tabla
  de lo que `g-posoperatorio.md` decía y dejó de ser cierto), **siete mapas con un puntero cada
  uno** —medidos ANTES de escribir, todos por debajo de 28 KB—, `docs/fuentes/FUENTES.md` → «La
  tanda POP-V2» con las dos fuentes transcritas, sus dos reglas de folio comprobadas en el pie
  impreso y la tabla «Cambios de evidencia» de ocho filas, y `docs/PENDIENTES.md` → **OCHO** cosas
  declaradas (**POP-a** a **POP-h**).

### El banco de imágenes de Guardados y el esquema de la orejuela — «IMÁGENES» (2026-10-29)

- **SEIS commits, y los seis se hicieron.** `8a81823` (1) · `06af475` (2) · `72a26d4` (3) ·
  `f0ee02d` (4) · `9751f05` (5) · el de cobertura y documentación. Sello **`v20261029-2147`**,
  md5 de `index.html` **`e936a1c6`**. (El árbol se **reselló**: el primer sello, `v20261029-2127`,
  quedó atrás por el arreglo que la corrida completa destapó.) Al empezar, `origin/main` = `HEAD` = **`21c9b87`**, el
  cierre de la tanda Y, ya publicado, con el pendrive `DISK_IMG` montado y listando nombres
  reales. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  Cierra **Y-g**, que era esta tanda entera declarada como no hecha.

- **EL PAPEL NO SE MOVIÓ, Y ESTÁ MEDIDO POR DOS CAMINOS QUE NO SON EL MISMO.** El A/B general
  (`_probe_yab.mjs`, 132 escenas, 147.032 claves y 58.080 celdas de Excel) da **CERO diferencias**
  en superficie firmada y cero en pantalla, en los cuatro commits que tocan código.
  ⚠️ **Y ese cero es un control NEGATIVO para el commit 5**: ninguna de esas 132 escenas carga la
  orejuela, así que sobre el esquema no prueba nada. La prueba es `_probe_img2.mjs --file <HEAD>`
  con la orejuela **cargada** y el esquema ya guardado: informe en los tres estilos **idéntico al
  carácter** (612), EN SUMA idéntico, **440** columnas de Excel idénticas clave por clave y los
  campos guardados iguales.

- **DÓNDE SE GUARDA UN ESQUEMA, QUE ES LA DECISIÓN DE DISEÑO DE LA TANDA.** En el mismo registro
  de `ceibomed_img`, pero en una **segunda lista** (`esqs`) y NO entre los slots. Así
  `CeiboImg.leer` sigue devolviendo sólo `imgs` y **ningún emisor existente tiene que filtrar
  nada** — que es lo que garantiza que el papel no se mueva. La alternativa, meterlo entre los
  slots con una marca, exigía filtrarlo en **CINCO** lectores maduros (el PDF del formulario, el
  PDF de un estudio guardado, el PPT, su selector y el exportador de backup) y el primer olvido
  publicaba un esquema dentro de un informe firmado. El precio es un `get` antes del `put` en
  `CeiboImg.guardar`, declarado.

- ⚠️ **PINTAR Y GUARDAR SON DOS FUNCIONES, Y ES LA LECCIÓN QUE EL D-9, EL D-10 Y EL D-11 PAGARON
  TRES VECES.** `calcOAI` está en `RECALC_MODULOS`, así que lo corre el barrido de 220 ms y lo
  corre la restauración de un estudio guardado: si el guardado colgara de ahí, **abrir un estudio
  viejo le escribiría un esquema que nadie pidió**, o sea migrar estudios guardados. `oaiEsqSync`
  sólo pinta; `oaiEsqGesto` guarda, y lo llaman los cuatro `oninput`. Medido con su denominador:
  el dibujo SÍ se repinta con los valores nuevos y el registro conserva el mismo `ts`.

- **EL PPT SE PROBÓ ABRIENDO EL ARCHIVO, no sólo generándolo.** Se descarga a un directorio
  propio, se lista el zip y se lee el XML de cada diapositiva: 24 diapositivas, 25 medios,
  1.393.967 bytes, y los **únicos** textos del mazo son los números de imagen y el disclaimer.
  Censo sobre los 24 XML: **ningún nombre de paciente**, y el nombre del archivo tampoco.

- **EL LÍMITE DE 24 Y LOS REPARTOS 1 / 2 / 4 SALEN DE LA DEMO APROBADA**, no de una estimación
  (`maxEl = 24`). Medido: con 24 elegidas, clickear la 25 no suma nada. Y el orden es el de
  **elección**: clickeadas de la 26 a la 3, la 26 queda en la posición 1.

- **TRES PREMISAS DE LA ORDEN SE MIDIERON Y NO ERAN LO QUE DECÍAN.**
  1. **La barra de memoria no dice «5,2 MB usados» de una sola cosa**: el porcentaje sale de
     `navigator.storage.estimate()` —el **origen entero**— y los KB de `CeiboImg.uso().bytes`
     —**sólo** el store de imágenes—. Dos denominadores en la misma línea. → **IMG-b**.
  2. **«Si se borra el estudio, se van sus imágenes» es verdad para las imágenes y FALSO para el
     video**: `CeiboVideo` no tiene recolector y nadie lo llama. Medido: se sembró un video de
     32.768 bytes, se borró su estudio, corrieron los dos recolectores que la app tiene y el
     registro **sobrevive**. Reportado sin borrar nada. → **IMG-a**.
  3. **Las etiquetas por tipo (2D, color, Doppler) no están en la demo como rótulos**: son los
     cuatro dibujos sintéticos con que genera sus imágenes de ejemplo. No había nada que
     implementar. → **IMG-d**.

- **EL PRESUPUESTO DE RENDIMIENTO, MEDIDO ANTES DE ESCRIBIR LA PANTALLA** (110 estudios × 15
  imágenes = 1.650 miniaturas, 108,75 MB de `dataURL`): leer el store entero 49-53 ms; armar las
  1.650 miniaturas de una vez 103 ms de DOM, 290 ms hasta pintar y **221 MB de heap**; con
  `IntersectionObserver` 12 ms y 99 imágenes creadas. **Lo que se construyó cumple**: índice sin
  `dataURL` por cursor en 137 ms y 174.571 caracteres de metadata, con los meses **plegados**
  —3 ms síncronos, 22 ms hasta pintar, 12 grupos y CERO miniaturas— y 1 ms de clic para abrir un
  mes de 135, con 72 imágenes cargadas.

- **LOS FILTROS NO SE DUPLICARON, Y POR ESO NO PUEDEN DISCREPAR.** El enganche es `igPintar`, el
  único punto por el que pasan las dos cadenas de filtrado. Medido: 11 estudios → 165 imágenes,
  63 → 945, 13 → 195, FEVI clínico 33 → 495 y el **numérico** 30 → 450, o sea estudios × 15
  exacto en los cinco. Las mutaciones 06 y 07 lo matan por separado.

- **18/18 MUTACIONES MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5.
  ⚠️ **LA 17 SOBREVIVIÓ AL PRIMER BARRIDO Y ERA UN HUECO REAL**: la condición (F6) llamaba a
  `imgPersistir` **sin restaurar antes**, y `imgPersistir` sale temprano si no hay slots vivos, así
  que no llegaba a `CeiboImg.guardar` y no podía fallar. Es el «freno que tapa al que se muta».
  Cerrada restaurando primero, que además es el camino real —abrir un estudio y volver a
  guardarlo—. **Tres de las dieciocho no revierten nada: la aplican de más** (el esquema juzga, el
  barrido escribe, el esquema entra entre los slots).

- ⚠️ **TC-550 TUVO CUATRO DEFECTOS PROPIOS Y LOS CUATRO SON TRAMPAS DE MÉTODO**, escritas en su
  ficha: un uuid de **siete** caracteres que `_uuidValido` rechaza —el síntoma era «0 grupos», que
  se lee como que la pantalla no pinta—; la grilla ordenada por fecha **descendente**, así que la
  primera miniatura no es la del primer estudio sembrado y la estrella se escribía en el otro
  uuid; los nodos que se **desprenden** en cada repintado, con lo que elegir cinco elegía una; y
  `S()` despachando `input`, que es justo el evento que GUARDA, con lo que el control del barrido
  medía el gesto del médico.

- ⚠️ **Y EL ACENTO GRAVE COSTÓ CUATRO CORRIDAS, EN TRES ARCHIVOS DISTINTOS.** El cuerpo de un caso
  y el de una sonda inyectada son template literals. `node --check` caza el del caso; **no caza el
  de la sonda**, porque el `.mjs` sigue parseando: ahí lo que sirve es `new Function(cuerpo)` sobre
  lo que está entre los acentos graves. Y su hermana, también pagada dos veces: **una barra
  invertida simple no sobrevive al template literal** — `/[ \t\n]+/` escrito con una barra llegó al
  navegador con el tabulador literal adentro de la clase y los dieciséis cruces salieron con
  «Unterminated regular expression literal», que en un volcado se lee como un error de la app.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **valor por valor**: 2 grupos y 11 imágenes, el mes abierto con sus 5 miniaturas y
  las 5 cargadas, **cero** desplazamiento horizontal del cuerpo, **cero** textos recortados y
  **cero errores de consola y de página en los dos motores**; la estrella en **44×44 con los CINCO
  puntos dando el propio botón** también a 390 px; los cuatro botones del visor en 44 de alto; el
  esquema entrando entero (360 px a 1440, 328 a 390) con sus tres siluetas del cactus y sin
  juzgar. La única diferencia entre motores son 8 px en el ancho del visor.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Y el binario de chromium de Playwright
  sigue sin estar en esta máquina: Chrome va por el del sistema con `channel:'chrome'`.
  ⚠️ **A 390 px la barra de memoria baja de renglón**, y es el `flex-wrap` que esa cabecera ya
  tenía: los dos botones siguen juntos y en la fila del título a 1440 y a 1000 px.

- **Celular: 65 hallazgos a 360 px y 74 a 390, con 17 ALTA en cada ancho — los 17 de la línea
  base.** Los **dos** nuevos de cada ancho son `toque-chico` **MEDIA**: los dos botones de vista,
  de 30 px de alto y con rótulo, igual que los `.ig-filtro-btn` de al lado, que ya estaban así.
  Subirlos a 44 infla la cabecera, que es la trampa que este archivo ya documenta para el header.

- **Censo 1028 → 1029: UN control de pantalla nuevo y CERO campos guardados nuevos.** Es
  `ig-imgv-nota`, el textarea de la nota, y el prefijo `ig-` de `_noEsDelEstudio` lo deja afuera
  de `campos` — verificado por diff de ids contra HEAD y fijado por la condición (H3).
  ⚠️ **La primera versión de la sonda contó un campo de más**: su bucle de casillas no aplicaba
  `_noEsDelEstudio`, que `guardarInforme` sí aplica a los dos barridos, y tomaba `ig-ppt-on__chk`.
  Un falso positivo de censo, que es justo lo que esa medición está para evitar.

- **Línea base al cierre: suite 561/565**, en once lotes **cubriendo los 565 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **montado y listando nombres reales al abrir, ENTRE LOTES y
  al cerrar** y el md5 de `index.html` **idéntico** antes y después (`e936a1c6`). Los rojos son
  **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, **y ninguno más**: **TC-358 salió
  VERDE**.
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 560/565 CON UN ROJO MÁS, QUE ERA MÍO**, y por eso esa
  cifra no es la línea base: **TC-550** caía por su propio denominador (F0) porque `oaiEsqSync`
  escondía la caja del esquema **sin vaciarla**, así que el dibujo del paciente anterior seguía
  en el documento y un caso anterior del lote ya lo había pintado. El arreglo está en el commit 6
  y la cifra de arriba sale de la corrida **limpia**, de una sola pasada sobre el árbol resellado.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base. **Excel 440** columnas con las mismas claves.
  **Sin huérfanos nuevos.** 17 bloques de JS inline parsean.

- **Lo que se PARÓ y se reportó, no se aplicó**: la TGA, la CIA y la CIV (punto 5c), con el costo
  de la librería 3D medido —**603.445 bytes**, 0,60 MB inline o 0,81 MB en base64, un **+6,0 %**
  sobre un archivo de 10,14 MB— y los dos hosts externos censados; el borrado de imágenes desde la
  página, que la demo aprobada no trae; y las etiquetas por tipo, que tampoco.

- **`index.html` pasó de 10,04 MB / 140.965 líneas a 10,14 MB / 142.750** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **Dónde está todo:** `docs/mapa/img-guardadas.md` (**mapa NUEVO**, 17,3 KB), la ficha del caso en
  `docs/mapa/tests-fichas-550.md` (**archivo propio**), **cuatro mapas con un puntero cada uno**
  —medidos ANTES de escribir, todos por debajo de 28 KB—, `docs/fuentes/FUENTES.md` → «La tanda
  IMÁGENES» con las tres referencias visuales, el costo de la librería y las notas de trabajo, y su
  tabla «Cambios de evidencia» **vacía a propósito** porque esta tanda no escribe contenido
  clínico, y `docs/PENDIENTES.md` → **SIETE** cosas declaradas (**IMG-a** a **IMG-g**) más el
  cierre de **Y-g**.

### La orejuela del ETE y los videos al borrar — «TANDA NOCTURNA, Parte A» (2026-10-30)

- **SEIS commits**, y la orden pedía cinco: el sexto lo pidió una medición de la sonda de dos
  motores. `427aa06` (A1) · `6b589b6` (A2) · `42c4ccb` (A3) · `b9f824d` (A4) · `08dd2e9` (A3-b)
  · el de cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`33568df`**, el
  cierre de la tanda IMÁGENES, ya publicado, con el pendrive `DISK_IMG` montado y listando
  nombres reales. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LOS DOS DEFECTOS QUE EL MÉDICO REPORTÓ ESTÁN MEDIDOS, NO ESTIMADOS**, sobre una grilla de
  **640 combinaciones** —cuatro morfologías × ostium 10 a 40 × profundidad 10 a 50 × velocidad
  10 a 80—: el dibujo quedaba **apilado debajo** de los campos en los cuatro anchos, con los tres
  rect con caja; «VM» y «prof. N mm» se pisaban en **160 de 640** —que es exactamente la
  morfología «ala de pollo» con cualquier medida—; y la línea punteada de la profundidad cruzaba
  la caja del rótulo «Cx» en **640 de 640**. Después: **lado a lado con el dibujo a la derecha
  desde 900 px**, y **0 y 0**.

- ⚠️ **EL CHORRO DE INSUFICIENCIA ES CENTRAL SIEMPRE, Y ES UN HALLAZGO.** La demo lo orienta con
  el Carpentier **y el velo afectado**; el Carpentier existe en dos campos espejados y **el velo
  afectado NO existe en toda la app** —censado el documento entero—. Con el Carpentier solo no se
  puede decidir un lado: el tipo II manda el chorro a un lado o al otro **según el velo**.
  Agregarlo sería un campo guardado nuevo, que esta tanda tiene prohibido. → **NOC-A-a**.

- **EL CUADRO QUE SE GUARDA ES EL QUE SE ESTÁ VIENDO**, y eso es lo que sostiene animar sin
  romper la promesa del comentario anterior: `oaiEsqSVG` toma la **fase**, y el animador mueve los
  atributos cuadro a cuadro **con las mismas funciones**. Medido: tras «Incluir en el PDF»,
  teclear otro ostium y esperar 1,5 s —más que el diferido de 700 ms— deja el `ts` **idéntico**.

- ⚠️ **`r` NO SE HEREDA DE UN `<g>`, Y LA PRIMERA VERSIÓN DEL AHORRO DE CADENA LO PONÍA AHÍ.**
  Medido en Chrome **y** en WebKit sobre un documento mínimo: el círculo informa un `getBBox` de
  **0 × 0** y `getComputedStyle(...).r` da **`0px`**, o sea que el contraste espontáneo habría
  quedado **invisible sin un solo error de consola**. `fill` y `opacity` sí se heredan y van en el
  grupo, que ahorra 1.600 caracteres de cadena por repintado. Lo fija **TC-551 (C0b)** y la
  mutación **09**.

- **LAS CUATRO FUENTES DEL ⓘ SE LEYERON EN IMAGEN, Y TRES FRASES SE PARARON.** No se escribió
  «lo normal es 40 cm/s o más» —el «normal» de la oración de Hahn 2013 es el del **ritmo
  sinusal**, no el de la velocidad—, ni «antes de la ablación» —ninguna de las tres fuentes de la
  orejuela lo recomienda—, ni «en vistas medioesofágicas» junto al volumen de muestra.

- ⚠️ **DOS FUENTES QUE LA ORDEN NOMBRABA NO ENTRARON.** «Hahn 2021, hojas 47, 52 y 53» **no está
  en la biblioteca** —lo que hay es el documento de la ASE de competencia en intervenciones
  estructurales, de 16 hojas—; y los **folios 3355 y 3359 de la ESC 2024 de FA son dronedarona y
  ablación en insuficiencia cardíaca**, no la orejuela (su contenido de orejuela está en
  3346-3349 y son recomendaciones de cierre, que este ⓘ tiene prohibido llevar). Esa guía está
  además archivada en `22_Hemodinamica_avanzada`. → **NOC-A-c** y **NOC-A-d**.

- **EL DEFECTO DE A4, EN UNA LÍNEA: `CeiboVideo` no tenía recolector y al de `CeiboCine` no lo
  llamaba nadie** —su propio comentario decía «Sin esto, eliminar un estudio dejaría sus
  cineloops ocupando disco para siempre»—. Los tres caminos de borrado llamaban sólo al de
  imágenes. Hoy `imgRecolectarHuerfanas` recoge **las tres tiendas**, que es una puerta única y no
  tres parches. Los huérfanos que **ya existen** no se contaron —viven en el perfil del médico— y
  el fragmento de consola para contarlos, que sólo lee, está en **NOC-A-f**.

- ⚠️ **EL SEXTO COMMIT LO PIDIÓ UNA MEDICIÓN, Y ES UN DEFECTO LATENTE QUE EL ⓘ NUEVO DESTAPÓ.**
  `_vInfoColocar` acota el alto de la tarjeta al hueco del lado donde la pone, pero cuando el
  ancla queda **por debajo del pliegue** ese hueco da mayor que la pantalla entera. El ⓘ de la
  orejuela —3.092 caracteres— medía **360 × 1215 px en una ventana de 900** a 768 y a 390; el de
  HEAD —1.882— cabía en ese hueco falso y nadie lo había visto. Con un `Math.min` contra el alto
  útil queda en **360 × 884** y, con el botón dentro de la pantalla, **no mueve un píxel** de las
  ochenta y pico de tarjetas anteriores.

- ⚠️ **EL TIEMPO DE ESCRITURA EMPEORA 0,19 ms (≈5 %), Y SE DECLARA.** HEAD 3,85 a 4,27 ms contra
  4,02 a 4,23 en este árbol, en dos corridas independientes de cinco rondas cada una, en el
  escenario **más caro**: contraste severo con 56 partículas, trombo, IM severa y la animación
  corriendo. **Sin contraste espontáneo los dos árboles son indistinguibles.** El costo es el de
  dibujar el contraste, que es lo que la orden pide en 2a; las partículas moviéndose un cuadro sí
  y uno no y el color en el grupo son lo que lo dejan en 0,19 y no en más.
  ⚠️ **Hizo falta una sonda DEDICADA** (`scripts/_probe_oaitecla.mjs`): la misma función de teclas
  dio **1,42 ms corrida temprano y 2,90 ms corrida tarde sobre el MISMO árbol**, y un microbanco
  de 60 iteraciones antes **calienta el JIT** y baja el número a la mitad. Comparar los dos
  árboles con la tecla en posiciones distintas es comparar dos cosas que no son la misma.

- **14/14 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5.
  **Tres de las catorce no revierten nada: la aplican de más** —la 06 escribe la frecuencia de la
  animación en el campo del estudio, la 11 hace que el recolector de video borre todo sin mirar
  qué estudios están vivos, y la 13 que el ⓘ afirme el valor normal que ninguna fuente publica—,
  porque las condiciones que las matan son **controles negativos**.
  ⚠️ **Dos sobrevivieron al primer barrido y las dos estaban MAL ESCRITAS**: la 04 agregaba un
  `div` vacío **después** del cierre de la fila, que no cambia de quién es hermana la caja, y la
  13 no encontraba su ancla.

- **TC-551 cae contra HEAD por 30 de sus 52 condiciones y NINGUNA por excepción.** Las 22 que
  pasan en los dos árboles son los denominadores y los controles negativos.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), valor por valor: lado a lado a 1440 y 1000, apilado a 768 y 390; el dibujo en 360 px
  (328 a 390); los tres controles en **44 px de alto**; el ⓘ con sus **ocho bloques**, sin el
  bloque de dispositivos, dentro de la ventana y con scroll interno; el ⓘ **ámbar idéntico a HEAD
  en los dieciséis**; **cero** desplazamiento horizontal del cuerpo, **cero** textos recortados y
  **cero errores de consola y de página** en los dos motores y en los dos árboles.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel:'chrome'`.
  ⚠️ **Y UN `elementFromPoint` FUERA DEL VIEWPORT DA null**, no «tapado»: los tres controles caen
  en y=986 con una ventana de 900 de alto y la primera versión de la sonda daba **0/5** sobre
  botones que miden 44 × 44 de verdad y no están tapados por nada. Hay que traerlos a la vista
  antes de medir.

- **A/B contra HEAD con 140 escenas, 157.204 claves y 61.600 celdas de Excel: CERO diferencias de
  superficie firmada** —informe en tres estilos, EN SUMA, las **440** columnas clave por clave,
  los campos, el Laboratorio por sus ocho funciones dueñas, el PDF generado de verdad y el PPT—.
  Las **141** diferencias de pantalla son el control positivo: 140 son la fila nueva y la única
  de texto del dibujo es la palabra «trombo» en la escena que lo carga. **«juzga» sigue en false
  en las ocho escenas de orejuela.**

- **Línea base al cierre: suite 562/566**, en once lotes **cubriendo los 566 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada, con el pendrive
  `DISK_IMG` **montado y listando nombres reales al abrir, ENTRE LOS ONCE LOTES y al cerrar** y el
  md5 de `index.html` **idéntico** antes y después (`8ecbe4bc`). Los rojos son **TC-223, TC-376,
  TC-390 y TC-406**, los cuatro de siempre, **y ninguno más**: **TC-358 salió VERDE**. Semgrep **124 WARNING / 0 ERROR**. Censo **1029
  campos, 0 huérfanos nuevos**. Excel **440** columnas. 17 bloques de JS inline parsean.
  ⚠️ **LA LÍNEA BASE DEL CELULAR DE LA ORDEN ESTABA VENCIDA: no es 63 y 72, es 65 y 74**, con 17
  ALTA en cada ancho. El 63/72 es el de **antes** de la tanda IMÁGENES, cuya propia bitácora ya
  escribe 65/74. Medido en los dos árboles con el mismo script: **65 a 360 px y 74 a 390, con 17
  ALTA**, idénticos uno por uno.
  ⚠️ **Y EL ARNÉS DE LOTES CORRIÓ CERO CASOS Y DIJO QUE TODO BIEN**, la primera vez: usaba
  `mapfile`, que **no existe en el bash 3.2 de macOS**, contó cero casos, no ejecutó nada y aun
  así imprimió su marcador de cierre. Hoy el script exige el denominador y compara lo ejecutado
  contra lo leído.

- **`index.html` pasó de 10,14 MB / 142.750 líneas a 10,17 MB / 143.336** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.) Sello **`v20261030-0233`**,
  md5 de `index.html` **`b43c7af5`**.

- **Dónde está todo:** `docs/mapa/noc-a-orejuela.md` (**mapa NUEVO**, 13,0 KB), la ficha del caso
  en `docs/mapa/tests-fichas-551.md` (**archivo propio**, porque `tests-fichas.md` está en
  34,2 KB), **tres mapas con un
  puntero cada uno** —`tests.md` incluido— —`img-guardadas.md` 18,3 KB y `e-carpentier-tricuspide-orejuela.md` 20,8 KB,
  medidos ANTES de escribir—, `docs/fuentes/FUENTES.md` → «La TANDA NOCTURNA, Parte A» con las
  cuatro fuentes transcritas frase por frase, la tabla de lo que se paró y la de «Cambios de
  evidencia», y `docs/PENDIENTES.md` → **OCHO** cosas declaradas (**NOC-A-a** a **NOC-A-h**).

### El TRIV, el índice aórtico y la aortopatía en el papel — «TANDA NOCTURNA, Parte B» (2026-10-30)

- **CUATRO commits, y la orden pedía CINCO.** `9e70ba6` (B1) · `779902a` (B2) · el de B3 · el de
  cobertura y documentación. Al empezar, `origin/main` = **`33568df`** con los seis commits de la
  Parte A sin pushear. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  ⚠️ **EL COMMIT B4 NO SE HIZO, y no quedó a medias: ninguna línea de la app se tocó por él.**
  Son DOS cambios clínicos sobre el papel firmado —cortes nuevos por sexo para la unión
  sinotubular y la ascendente, y un vocabulario nuevo para graduarlos— y empezarlo sin poder
  cerrar la parte por completo habría dejado un cambio clínico a medias. Está declarado en
  `docs/PENDIENTES.md` → **NOC-B-a**, con **los ocho valores de la Figura 5 ya transcritos en
  imagen** y el inventario del lado de la app, que es la mitad del trabajo.

- **LA REGLA DE FOLIO DE LA EDICIÓN INGLESA SE COMPROBÓ EN EL PIE IMPRESO, EN TRES HOJAS
  DISTINTAS: folio = hoja + 3537** (hoja 10 → 3547, hoja 26 → 3563, hoja 105 → 3642). **Las ocho
  ubicaciones que la orden da son correctas**, verificadas una por una.
  ⚠️ **Y LAS CITAS QUE LA APP YA TENÍA NO SE REESCRIBIERON**, que es lo que la orden pide: siguen
  con el folio de la edición SEC. Esta parte **no agregó ninguna cita nueva a la pantalla**.

- **EL DEFECTO QUE CERRÓ EL B3, EN UNA LÍNEA: el informe firmado publicaba una recomendación con
  su clase, su nivel y su tabla.** Medido en diez escenas —los cinco síndromes, los bordes
  44,9 / 45 / 45,1 del Marfan y 45 / 45,1 de Loeys-Dietz, y un estudio ajeno—: antes, **cinco**
  publicaban una clase en el papel, **las diez** la tabla y el folio y **dos** el umbral. Después:
  **cero** en las diez. El panel explica; el papel afirma.

- ⚠️ **EL ÍNDICE SÓLO EN TURNER ES NUEVO, Y NO ES COSMÉTICO.** Desde el B2 el índice **se
  calcula**, así que sin esa condición habría aparecido en el informe de **cualquier** aortopatía
  con la aorta ascendente y la superficie corporal cargadas.

- ⚠️ **NADA AUTOMÁTICO ESCRIBE EL ÍNDICE EN EL ESTUDIO, Y ESTÁ MEDIDO.** Tras calcularlo y tras
  una pasada completa de `_recalcModulos`, el campo `marfan_ita` sigue **vacío**. Es la lección
  que el D-9, el D-10 y el D-11 pagaron tres veces.

- **TRES PREMISAS DE LA ORDEN SE VERIFICARON Y NO HUBO NADA QUE CORREGIR.** (1) El inglés dice
  «should be considered» para el ≥45 mm del Marfan y **la app ya lo dice así**: su único «puede
  considerarse» con umbral es el de Turner >25, que es Clase IIb, donde «may be considered» es lo
  correcto. (2) **La app no menciona aspirina tras cirugía con preservación valvular**: censado el
  documento entero, los tres usos de la palabra son de otra cosa. (3) **El Laboratorio no cambia**:
  su único uso de `marfan_ita` es un predicado de presencia, no una lectura de valor, así que no
  hubo nada que parar.

- ⚠️ **LA FIGURA 5 Y EL APARTADO 9.2.1.1 NO DICEN LO MISMO DEL SENO DE VALSALVA EN LA MUJER**: la
  figura da 34 mm y el apartado 36. La app aplica el del apartado, que es el que la tanda G
  verificó. **Reportado y sin tocar** → **NOC-B-e**.

- ⚠️ **UNA MUTACIÓN SOBREVIVIÓ Y ERA UN CONTROL VACUO.** (E5) afirmaba que el índice va sólo en
  Turner, pero sus seis escenas no-Turner **no tenían aorta ascendente**, así que el índice era
  nulo y el papel no lo mostraba *pase lo que pase*. Se cerró con una escena de Marfan **con el
  índice calculable** y su propio denominador. **14/14 muertas** tras cerrarla.
  ⚠️ **Y cuatro mutaciones salieron «NO APLICA» la primera vez** porque el worktree se creó antes
  de commitear el B3: el veredicto es honesto —no dice «muerta»— pero cuesta una corrida.

- **TC-552 cae contra el cierre de la Parte A por 22 de sus condiciones y NINGUNA por excepción.**

- ⚠️ **TC-262 y TC-419 FALLAN EN CIERTOS LOTES Y NO ES DE ESTA TANDA.** Verificado en un worktree
  sobre el commit B1, con los mismos scripts y el mismo lote: **falla idéntico**, con
  `ao:AVAi (BSA 2.00)`. Es dependencia de orden preexistente → **NOC-B-g**.

- **ONCE casos viejos adaptados, cada uno con el motivo escrito**: **TC-457**, **TC-476** y
  **TC-549** (el cuadro del VD pasa de once a doce filas, y el orden de TC-476 gana la fila nueva
  entre la S′ y el Tei), **TC-471** y **TC-500** (el registro de globos, 67 → 68), **TC-502** (las
  tarjetas sin botón, 21 → 22), **TC-116** (el texto de «falta el índice»), **TC-131** (el
  round-trip, con dos condiciones NUEVAS que lo miden por los dos lados), **TC-512** y **TC-521**
  (el iDA con un decimal), y **TC-116** y **TC-512** otra vez, por las cuatro condiciones que afirmaban la clase, la tabla y el folio en el papel.

- ⚠️ **UNA REGEX ESCRITA EN UN HEREDOC DE BASH NO LLEVA EL MISMO NÚMERO DE BARRAS QUE UNA ESCRITA
  DESDE PYTHON.** `/[ \\\\t\\\\n]+/` en un heredoc sin interpolación llega al template como
  `/[ \\t\\n]+/`, que es «espacio, barra invertida, t o n»: la sonda **se comía las t y las n** del
  texto medido, y el volcado decía «Calculado co la aor a asce de e». Es la hermana de la trampa
  de la barra simple que este archivo ya documenta.

- **A/B contra el cierre de la Parte A: 140 escenas, 157.204 claves y 61.600 celdas de Excel. Las
  36 diferencias de superficie firmada son UNA SOLA COSA**, el iDA pasando de entero a un decimal
  —«23 mm/m²» → «22,6» y «26» → «26,0»—, en el informe (tres estilos), el EN SUMA, los campos, el
  Excel, el PDF y el PPT de las **tres** escenas que tienen un iDA que vota. **Excel en 440
  columnas.** Las 280 de pantalla son los dos controles positivos: el registro de globos (67 → 68)
  y las filas del cuadro del VD (11 → 12).
  ⚠️ **NINGUNA DE LAS 140 ESCENAS INTEGRA LA AORTOPATÍA AL INFORME**, así que **el cero del B3 en
  ese A/B no prueba nada**: su medición es la sonda dedicada `_probe_aohered.mjs`, con diez
  escenas y el estudio ajeno de control.

- **Línea base al cierre: suite 563/567**, en once lotes **cubriendo los 567 casos distintos**, en
  UNA sola pasada sobre el árbol sellado, con el pendrive `DISK_IMG` **montado y listando nombres
  reales al abrir, ENTRE LOS ONCE LOTES y al cerrar**, y el md5 de `index.html` **idéntico** antes
  y después. Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, **y ninguno
  más**: **TC-358 salió VERDE**. Semgrep **124 WARNING / 0 ERROR**. Censo **1029 campos, 0
  huérfanos**. Excel **440** columnas. Celular **65 a 360 px y 74 a 390, 17 ALTA en cada ancho**,
  idénticos a la base. 17 bloques de JS inline parsean.
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 561/567 CON DOS ROJOS MÁS, LOS DOS MÍOS**, y por eso esa
  cifra no es la línea base: **TC-116** y **TC-512** tenían condiciones que afirman que el informe
  y el EN SUMA llevan la clase, la tabla y el folio —justo lo que el B3 retira— y **el censo no
  las encontró** porque las busqué por el nombre de lo que toqué y ellas lo dicen con otras
  palabras. Es el modo de falla que la C2 documenta con TC-520. Las cuatro condiciones están
  **invertidas**, no borradas, y exigen además lo que el papel SÍ tiene que decir.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), valor por valor: la fila del TRIV oculta sin valor y visible con él, 75 sin
  aclaración y 76 con ella **en amarillo**, el cuadro del VD en **doce** filas, el globo con sus
  **tres fuentes** dentro de la pantalla, el índice en «24,0 mm/m²», el iDA en «27,5 mm/m²», el
  papel **sin clase, sin tabla y sin folio** y la cápsula **todavía con la cita**; **cero**
  desplazamiento horizontal, **cero** textos recortados y **cero errores de consola y de página en
  los dos motores**.
  ⚠️ **EL ⓘ NUEVO DABA 0/5 A 390 px Y ERA LA ANIMACIÓN, NO LA MAQUETA.** Lo tapaba `sacc-hdr`, el
  encabezado del acordeón, que a mitad de su transición de 0,3 s informa un rect superpuesto con
  su propio cuerpo. Es la trampa que la tanda AJ9 ya documenta. Quitando la transición da
  **5/5**, y el barrido de celular no suma ni un hallazgo ALTA.

- **`index.html` pasó de 10,17 MB / 143.336 líneas a 10,19 MB / 143.550** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.)

- **Dónde está todo:** `docs/mapa/noc-b-aorta.md` (**mapa NUEVO**, 8,4 KB), la ficha del caso en
  `docs/mapa/tests-fichas-552.md` (**archivo propio**), `docs/fuentes/FUENTES.md` → «La TANDA
  NOCTURNA, Parte B» con las seis tablas y la Figura 5 transcritas **en imagen**, la tabla de las
  ocho ubicaciones verificadas y la de «Cambios de evidencia», y `docs/PENDIENTES.md` → **SIETE**
  cosas declaradas (**NOC-B-a** a **NOC-B-g**).

### El informe de la orejuela, el TRIV a 75, VD/AD y el dibujo de la demo — «CORRECCIONES» (2026-10-30)

- **SIETE commits, y los SEIS de código se hicieron enteros.** `1853085` (COR-1) · `48461eb`
  (COR-2) · `03e8919` (COR-3) · `b9493e8` (COR-4) · `37f2bf2` (COR-5) · `67c6f7d` (COR-6) · el de
  cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`9c479cc`**, el cierre de la
  TANDA NOCTURNA Parte B, ya publicado, con el pendrive `DISK_IMG` montado y listando nombres
  reales. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el informe firmado declaraba a un paciente
  «no apto para cierre percutáneo», y la aplicación no hace recomendaciones.** La tanda E había
  dejado esa rama con tres motivos escritos; la orden del médico los releva. Hoy sale «Orejuela
  izquierda: ostium 26 mm, profundidad 37 mm.», con mayúscula y con su sujeto —que hace falta de
  verdad: el párrafo de arriba corre con otra compuerta y puede no existir—.

- **EL BARRIDO 1c, CON SU DENOMINADOR: 64 escenas y 1.315.598 caracteres** de superficie firmada
  —informe en tres estilos, EN SUMA, el PDF generado de verdad y el PPT— contra trece palabras de
  veredicto y conducta. **TRES frases distintas, y nada más.** Una se retiró; las otras dos
  —«Considerar mayor complejidad para el cierre percutáneo» de la orejuela y «El grado VEXUS debe
  integrarse con la clínica»— quedan **reportadas y sin tocar** (→ **COR-a**). **El EN SUMA no
  publica ninguna y el PPT tampoco.**

- ⚠️ **UN SOLO CORTE DE 75 ms, Y ESO REVIERTE LO QUE ESTE ARCHIVO DECLARABA.** `DT_TRIV_HTP_PANEL`
  **se retiró** —no quedó como alias— y con ella el párrafo que decía que los dos umbrales tenían
  que seguir separados. Es una **decisión del médico**, del 9 y del 30 de octubre. El operador
  sigue siendo **estricto**: 75 exactos no es elemento a favor, 76 sí.

- **LA FRASE DE ELEMENTOS A FAVOR DE HTP TIENE TRES FORMAS Y UN SOLO DUEÑO**, que las cuatro ramas
  de `tricLine` consumen sin saber cuál salió. **Ningún corte nuevo**: «no llega a rango de HTP»
  es `HTP_VRT_BAJA_MAX` (2,8 m/s inclusive, ESC/ERS 2022, Figura 5, folio 28) y «VD
  disfuncionante» es `vdDisfPresente()`, el mismo `OR` de cinco parámetros que el informe ya
  usaba, extraído a dueño único porque vivía en un bloque que **cierra 1.800 líneas antes** de la
  línea tricuspídea.
  ⚠️ **La frase del gradiente subestimado es un CRITERIO DEL MÉDICO sin fuente verificada**, y va
  rotulada «CRITERIO DE ECOSMART — sin fuente verificada en la biblioteca» en el ⓘ del TRIV y en
  la Evidencia de HTP. El papel no lleva el rótulo: no lleva citas.
  ⚠️ **La categoría de probabilidad de HTP NO cambia**, medido en las 64 escenas sobre sus cinco
  cápsulas: cero diferencias.

- **LA GRILLA DE VD/AD QUEDÓ EN 3 × 6, SIN UN SOLO HUECO**, así que los espacios entre campos son
  iguales en las tres columnas. La fila 7 del CSS se retiró. **Ningún `id` cambió.**
  ⚠️ **El cuadro de referencias de abajo NO se reordenó**, y el renglón del código que decía que
  lo seguía dejó de ser cierto → **COR-b**.

- ⚠️ **EL INVENTARIO 5a FUE EL HALLAZGO DE LA TANDA: «Incluir en el PDF» NO INCLUÍA NADA.** Medido
  generando el PDF de verdad sobre HEAD: **cero imágenes**, con Config apagado **y** con Config
  prendido. Llamaba a `esqGuardarComoImagen`, que escribe en la lista `esqs`, y **`CeiboImg.leer`
  devuelve sólo `imgs`**, que es lo único que el PDF imprime. El botón se llamaba así y el PDF no
  lo incluía nunca. Hoy pone el esquema como **slot de `imgSlots`**: con el estudio SIN GUARDAR y
  Config apagado, el PDF pasa de **0 a 1** imagen, y al guardar con Config prendido llega **1** al
  disco. Sin un campo guardado nuevo.

- **LA COMPARACIÓN OBLIGATORIA CONTRA LA DEMO DA CERO PÍXELES.** Seis escenas, viewBox verificado
  igual (`0 0 340 350`): la aurícula izquierda, la VPSI, la orejuela, la línea del ostium, la de
  profundidad, el recuadro del Doppler y el **trombo** dan **`[0,0,0,0]`** en las seis, y el
  triángulo del VI sale «ausente» en las seis. El chorro y el contraste **no se comparan por caja**
  —las dos páginas animan por su cuenta— y se comparan por estructura.
  ⚠️ **La causa de «el trombo queda fuera»: la portada anterior no trajo el bloque `o.rec` de
  `taper`.** La app lo ponía en `OAI_ESQ_TIP`, la **punta** de la línea guía, donde la silueta ya
  se afinó. Hoy sale del **receso**, con un `clip-path` como red.

- ⚠️ **DOS DE LAS 24 MUTACIONES SOBREVIVIERON AL PRIMER BARRIDO, Y LAS DOS ERAN COBERTURA QUE
  FALTABA.** La 10 porque todas las escenas del gradiente subestimado hacen disfuncionante al VD
  con **TAPSE y onda S′**, así que los otros tres parámetros tapaban al que se mutaba. La 22
  porque **(F7) pasaba sobre un denominador vacío** —sin abrir la pestaña, todos los
  `getBoundingClientRect` daban 0 y la condición comparaba ceros contra ceros— y porque, una vez
  arreglado, **`getBoundingClientRect` ignora el `clip-path`** y la condición preguntaba por el
  **dueño** (`_oaiSpec`) en vez de por el **dibujo**. Se cerró con `isPointInFill`: en el receso
  dan **11 de 16**, en la punta **4**.

- **DIEZ CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-133** y **TC-49** (los
  valores del TRIV y la forma corta de la frase), **TC-417** (ídem), **TC-476** y **TC-478** (el
  orden de la grilla y el conteo por columna), **TC-526** (el strain ya no está entre el Tei y la
  FEVD), **TC-539** (la rama del trombo, **invertida**), **TC-549** (dos: la posición del TRIV y
  las dos constantes, **invertida**), **TC-551** (el esquema ya no va a `esqs`) y **TC-552**
  (dos, **invertidas**).

- **Línea base al cierre: suite 564/568**, en once lotes **cubriendo los 568 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **montado y listando nombres reales al abrir, ENTRE LOS
  ONCE LOTES y al cerrar** y el md5 de `index.html` **idéntico** antes y después
  (`3abd61f7`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, **y
  ninguno más**: **TC-358 salió VERDE**, y TC-262, TC-419, TC-507 y TC-131 también.
  **24/24 mutaciones dirigidas muertas**, en worktree y nunca sobre el vivo, con guarda de md5.
  Semgrep **124 WARNING / 0 ERROR**. Excel **440** columnas con las mismas claves. Campos
  guardados **idénticos**, ni uno nuevo ni uno perdido. Censo **sin huérfanos nuevos**. Celular
  **65 hallazgos a 360 px y 74 a 390, 17 ALTA en cada ancho** — la línea base exacta. 17 bloques
  de JS inline parsean.
- **CHROME Y WEBKIT COINCIDEN EN LOS VEINTICUATRO CRUCES** (dos motores × 1440, 1200, 1000, 768,
  500 y 390 px × dos temas), valor por valor: **cero errores de consola y de página** en los dos
  motores y en los dos árboles, **cero desplazamiento horizontal del cuerpo**, **cero textos
  recortados**, la grilla en **6/6/6** en los 24, el VD/VI y su selector en la **misma fila** en
  los 24, el dibujo con aurícula, VPSI y trombo y **sin** el triángulo en los 24, y el papel con
  la oración de la orejuela, «> 75 ms» y **sin** «apto» en los 24.
  ⚠️ **EL PUNTO 7 NO REPRODUCE NADA: cero diferencias contra HEAD en los 24 cruces.** La columna
  izquierda, los botones de arriba y las pestañas se adaptan exactamente igual entre 500 y
  1200 px. El «desorden pasajero» que el médico vio no se reprodujo.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
- ⚠️ **ESCRIBIR CUESTA 0,14 ms MÁS (3,6 %), Y SE DECLARA.** Medido con la sonda DEDICADA
  `_probe_oaitecla.mjs`, **alternando los dos árboles** en tres rondas de cinco: HEAD media
  **3,94 ms** (2,81 a 4,38) contra **4,08 ms** (2,29 a 4,46). El escenario es el más caro
  —contraste severo con 56 partículas, trombo y la animación corriendo— y el costo es el del
  dibujo nuevo: el SVG pasa de **6.615 a 10.194 caracteres** por la aurícula izquierda, la VPSI
  y la segunda capa de la silueta.
  ⚠️ **LA MEDICIÓN DE LA SONDA DE DOS MOTORES NO SIRVE PARA ESTO, y por eso hizo falta la
  dedicada**: daba 0,55-2,22 ms en HEAD contra 1,39-2,77 en el nuevo, porque las dos corridas van
  una después de la otra y la segunda compite con lo que dejó la primera. Es exactamente la
  trampa que la TANDA NOCTURNA Parte A documentó.
- **`index.html` pasó de 10,19 MB / 143.550 líneas a 10,23 MB / 144.055** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) Sello **`v20261030-1148`**, md5 de `index.html`
  **`3abd61f7`**.

- **Dónde está todo:** `docs/mapa/cor-correcciones.md` (**mapa NUEVO**, 13,9 KB), la ficha del
  caso en `docs/mapa/tests-fichas-553.md` (**archivo propio**), **seis mapas con un puntero cada
  uno** —medidos ANTES de escribir—, `docs/fuentes/FUENTES.md` → «La TANDA CORRECCIONES» con
  Meier 2014 transcripto en imagen y su tabla de cambios de evidencia, y `docs/PENDIENTES.md` →
  **SIETE** cosas declaradas (**COR-a** a **COR-g**).
  ⚠️ **Y `vd-derecho.md` SE PARTIÓ**: estaba en **34,4 KB**, a 626 bytes del techo, y el COR-3
  tenía que escribirle un puntero. La tanda G1 salió a `docs/mapa/vd-g1-columnas.md` (12,5 KB) y
  el mapa volvió a **24,4 KB**. Es la primera vez en varias tandas que la regla se aplica **antes**
  de cruzar el techo y no después.

### La orejuela, el PDF sin repetir, el EN SUMA de la bicúspide y la fila de miniaturas — «AJUSTES-1» (2026-10-30)

- **SEIS commits, y los cinco de código se hicieron enteros.** `612dd82` (AJ1-1) · `05569e8`
  (AJ1-2) · `cc6e0fd` (AJ1-3) · `3f6e436` (AJ1-4) · `ed321eb` (AJ1-5) · el de cobertura y
  documentación. Sello **`v20261030-1550`**, md5 de `index.html` **`a45f1edd`**. Al empezar,
  `origin/main` = **`9c479cc`** con **siete** commits locales sin pushear y `HEAD` = **`ac5d1b4`**,
  el cierre de la TANDA CORRECCIONES, que es lo que la orden pedía verificar.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LA FUENTE SE LEYÓ EN IMAGEN Y EL FOLIO SE COMPROBÓ EN EL PIE IMPRESO DE LAS DOS HOJAS.** La
  ASE 2025 de corazón derecho (Mukherjee), hoja 24 → «164 Mukherjee, M et al» y hoja 25 →
  «Mukherjee, M et al 165». **Coinciden con lo que la orden anticipa**, así que el commit 4 se
  aplicó: el folio 164 dice que en la hipertensión pulmonar grave con falla derecha la
  contractilidad reducida deja la presión sistólica estimada poco confiable, y la **Tabla 5**
  del folio 165 lista «Significant RV failure and contractile dysfunction» con su **única** marca
  en la columna «Underestimation».

- ⚠️ **EL RESPALDO ES PARCIAL Y SE DICEN TRES SALVEDADES, UNA DE LAS CUALES NO ESTABA EN LA
  ORDEN.** Las dos que la orden nombra —la fuente habla de falla **significativa** del ventrículo
  derecho, y el «probablemente» es del médico— y una tercera que salió de leer el folio: **el
  folio 164 nombra el gradiente ventrículo derecho-arteria pulmonar, no el de aurícula derecha a
  ventrículo derecho** que la frase menciona; a ése lo sostiene la Tabla 5, que no nombra ningún
  gradiente. Citar la fuente sin esa salvedad la haría respaldar algo que no dice.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: con una bicúspide cargada y nada más, el EN
  SUMA decía «Estudio sin alteraciones estructurales ni funcionales significativas».** Medido en
  HEAD. Es exactamente lo que la orden prohíbe, y lo cierra `vabSumaFrase()`, que nombra la
  válvula para TODA bicúspide cargada en Válvulas —no sólo con la sección integrada, que era la
  compuerta de la línea vieja—.

- **TRES PREMISAS DE LA ORDEN SE VERIFICARON Y NO ERAN LO QUE DECÍAN.**
  1. **«Considerar mayor complejidad» no existe en la Evidencia ni en Referencias**, censado el
     documento entero: su única aparición era el papel. La orden la rotula «si existe», así que
     no hubo nada que rotular y el contenido **se pierde** → **AJ1-b**.
  2. **Contractilidad y SGL no tienen el resumen al costado**: su maqueta es «imagen arriba,
     texto debajo», con la leyenda de colores al lado en 34 mm. **Reportado, no tocado** →
     **AJ1-c**.
  3. **El cactus no es el único `<option>` que afirma un riesgo sin fuente**: «Manga de viento —
     riesgo intermedio» lo sigue diciendo, y la orden no la nombra → **AJ1-a**.

- ⚠️ **EL ORDEN DE LOS DIAGRAMAS EN LA FILA SE PARÓ, Y ES LA CONDICIÓN QUE LA PROPIA ORDEN PONE.**
  Cada diagrama tiene su propia sección en el PDF, en un lugar que decide el código: no hay
  ningún orden almacenado, así que reordenarlos exige inventarlo y persistirlo, o sea un campo
  guardado nuevo → **AJ1-d**. En la fila **se ven y se pueden quitar**, que es lo que la orden
  pide de ellos.

- **DÓNDE VIVE HOY LA INCLUSIÓN Y EL ORDEN (el punto 5d), que son DOS mecanismos y no se
  unificaron:** las **capturas** y el **esquema de la orejuela** viven en `imgSlots`, en memoria,
  y a IndexedDB (`ceibomed_img`, lista `imgs`, por uuid) sólo si Config está prendido y el
  estudio se guarda; **el orden del array ES el de impresión**. Los **diagramas de toggle**
  tienen su inclusión en un `input` oculto por diagrama, que sí es campo guardado y **ya
  existía**: `contr_be_pdf`, `sgl_be_pdf`, `vab_pdf`, `ete_qx_pdf`. **Ningún campo guardado
  nuevo.**

- ⚠️ **LA ✕ DE UNA CAPTURA MARCA `noPdf` Y NO BORRA, Y ESO OBLIGÓ A UN CONTROL EN OTRA
  PANTALLA.** La imagen sigue en «🖼️ Imágenes del estudio» con un cartel «Fuera del PDF» y un
  botón «Incluir en el PDF»: sin ese botón, el texto de ayuda de la fila —que promete que se
  puede volver a incluir— sería falso.
  ⚠️ **Y `noPdf` NO VIAJA AL DISCO, LEÍDO EN EL CÓDIGO**: `CeiboImg.guardar` e `imgRestaurar` son
  allowlists explícitas que no lo incluyen, así que la exclusión vale para la **sesión**: quien
  guarde el estudio y lo reabra se la encuentra incluida otra vez. La imagen no se pierde.
  **No se tocó** —hacerla durar es cambiar lo que se escribe en el registro persistido de cada
  estudio con imágenes— y queda declarado en **AJ1-g**.

- ⚠️ **LA REGLA TÁCTIL GLOBAL INFLABA LOS BOTONES DE LA FILA Y LOS SACABA DE SU MINIATURA.** Lo
  destapó la sonda de dos motores: la ✕, declarada en 22 px, salía a **44×44** por
  `button { min-height:44px; min-width:44px }` y daba **1 de 5 puntos propios** —las otras cuatro
  caían sobre la imagen y sobre la tarjeta vecina—, y las dos flechas sumaban 90 px dentro de un
  hueco de 56. Se cerró con el patrón que `.pac-id-mk` ya usa: `min-width:0; min-height:0` más un
  `::after` absoluto. Medido: **45×41 la ✕ y 27×41 cada flecha, con los cinco puntos devolviendo
  el propio botón en los 24 cruces**. El ancho de las flechas es el que cabe: dos áreas de 44 en
  un hueco de 56 se solapan, y un toque cerca del borde movería la captura para el otro lado.

- **14/14 MUTACIONES DIRIGIDAS MUERTAS EN EL PRIMER BARRIDO**, en worktree y nunca sobre el vivo,
  con guarda de md5 antes y después. **Tres de las catorce no revierten nada: la aplican de
  más** —el recuadro del Doppler que no se dibuja nunca, el resumen que sale sin un solo dato y
  la frase de la bicúspide sobre una válvula que no lo es—, porque las condiciones que las matan
  son **controles negativos**. **La 05 rompe el dueño único por un solo lado a propósito**: el
  emisor deja de acortar el lienzo y `_oaiEsqAlto()` sigue devolviendo 262, que es la mutación
  que prueba que tener el alto escrito en dos lugares produce una imagen reescalada. **La 10
  rompe las dos mitades de la maqueta de la VAB a la vez**, que es la lección del D-11.

- **TC-554 cae contra HEAD por 26 de sus condiciones y NINGUNA por excepción.** Las que pasan en
  los dos árboles son los denominadores y los controles negativos.

- **EL PDF SE MIDIÓ CON COORDENADAS, Y HACÍA FALTA UNA SONDA PROPIA.** El A/B heredado guarda el
  texto de cada `doc.text` y la cantidad de figuras, así que un cambio de composición que no toca
  una palabra **le sale idéntico**: medido, el A/B del commit 2 daba UNA sola diferencia y ni la
  VAB ni el resumen aparecían. Con `_probe_aj1pdf.mjs`: la escena de la orejuela integrada pierde
  **una página entera** y su dibujo aparece en `146,30 55×56,6` junto a la tabla; la de la VAB
  pasa de dibujo centrado de 70×70 con la tabla debajo —bloque de **100,6 mm**— a dibujo de 48×48
  a la izquierda con la tabla a 65 mm a la misma altura —bloque de **53,6 mm**—.

- **A/B contra HEAD, 29 escenas, 33.189 claves y 12.760 celdas de Excel: 57 diferencias de
  superficie firmada y las 57 son las autorizadas.** Seis en `aLob3` —la frase retirada, en los
  tres estilos, el campo, el Excel y el PDF—; dos `_pdf`, que son la composición del commit 2; y
  49 en las **siete** escenas con bicúspide cargada, todas en el EN SUMA (tres estilos, campo,
  Excel, PDF y PPT). `vacio`, `ajeno`, `aSumaNoVab` —la misma raíz dilatada **sin** bicúspide— y
  los once controles de orejuela dan **cero**. Excel en **440** columnas con las mismas claves y
  el censo de campos sin moverse (946 y 962, idénticos).

- **CHROME Y WEBKIT COINCIDEN EN LOS 24 CRUCES** (dos motores × 1440, 1200, 1000, 768, 500 y
  390 px × dos temas), **cero diferencias entre motores**, y son **idénticos a HEAD en todo lo que
  no es el cambio**: **cero** desplazamiento horizontal del cuerpo, **cero** textos recortados y
  **cero errores de consola y de página** en los dos motores y en los dos árboles, con las mismas
  25 pestañas y el mismo desplegable móvil por debajo de 768 px. Lo que cambia son los cinco
  campos de la tanda, en los 24. **Escribir no se volvió más lento**: trece teclas reales, media
  **2,41 ms** en Chrome y 3,15 en WebKit, con el barrido en 5 a 6 ms.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.

- **Línea base al cierre: suite 564/569**, en once lotes **cubriendo los 569 casos distintos** —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol sellado, con el pendrive `DISK_IMG` **montado y verificado al abrir, ENTRE LOS ONCE LOTES y al cerrar** y el md5 de `index.html` **idéntico** antes y después (`a45f1edd`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-551**, que es el intermitente que `COR-f` ya declara —mide el chorro de la orejuela sin pausar la animación— y que **pasa 2 de 2 corrido aislado**, verificado. **TC-358 salió VERDE.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 563/569 CON UN ROJO MÁS, QUE ERA MÍO**, y por eso esa cifra no es la línea base: **TC-66**. Está adaptado y la cifra de arriba sale de la corrida **limpia**, de una sola pasada con el archivo de tests final.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base. **Excel 440** columnas con las mismas claves.
  **Sin huérfanos nuevos.** 17 bloques de JS inline parsean. **Celular: 65 hallazgos a 360 px y
  74 a 390, con 17 ALTA en cada ancho** — la línea base exacta, antes y después del arreglo
  táctil de la fila.

- **CINCO CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-78** y **TC-553
  (A7)(A8)**, invertidos porque la nota de complejidad salió del papel; **TC-504 (H5)(H8)**,
  **TC-506 (E3)(E4)** y **TC-66**, por la línea nueva del EN SUMA de la bicúspide.
  ⚠️ **TC-66 SE ME PASÓ DEL CENSO Y LO DESTAPÓ LA CORRIDA COMPLETA.** Grepeé la suite por «VAB
  fenotipo», que es como la escriben TC-504 y TC-506, y TC-66 la escribe **«VAB.»** a secas. Es el
  mismo modo de falla que la C2 documenta con TC-520 y la Y con TC-457: una afirmación sobre el
  texto no se encuentra buscando las palabras con que la escribe **otro** caso.

- ⚠️ **Y UN RESBALÓN PROPIO, CORREGIDO: `scripts/_probe_aj1wk.mjs` YA EXISTÍA.** Es la sonda de
  dos motores de la tanda **AJ1** del 23/10 (commit `92198c3`), y escribir la de esta tanda con
  ese nombre la **sobrescribió**. Se restauró desde HEAD **byte por byte** —10.139 bytes,
  verificado— y la de esta tanda se llama **`_probe_ajustes1wk.mjs`**. Los otros cinco nombres se
  censaron contra HEAD y ninguno existía. **Dos tandas con la misma sigla**: el mapa de aquélla es
  `docs/mapa/aj1-ajustes.md` y el de ésta es `docs/mapa/aj1-orejuela-pdf-ensuma.md`.

- **`index.html` pasó de 10,23 MB / 144.055 líneas a 10,28 MB / 144.727 líneas** — medido con `wc -c` y `wc -l`
  DESPUÉS de sellar. (MB de 10⁶: `wc -c` dividido por 1e6.)

- **Dónde está todo:** `docs/mapa/aj1-orejuela-pdf-ensuma.md` (**mapa NUEVO**, 19,6 KB), la ficha
  del caso en `docs/mapa/tests-fichas-554.md` (**archivo propio**, porque `tests-fichas.md` estaba
  en 34,2 KB), **siete mapas con un puntero cada uno** —medidos ANTES de escribir—,
  `docs/fuentes/FUENTES.md` → «La tanda AJUSTES-1» con el folio 164 literal, la Tabla 5
  transcrita fila por fila y la tabla «Cambios de evidencia» de diez filas, y
  `docs/PENDIENTES.md` → **SIETE** cosas declaradas (**AJ1-a** a **AJ1-g**).
  ⚠️ **`vab-bicuspide.md` quedó en 33,9 KB, a 1,1 KB del techo**: la próxima tanda que lo toque
  tiene que partirlo (**AJ1-e**).

### Los segmentos de la Figura 5, la coartación y la Tabla 68 — «AORTA-2» (2026-10-30)

- **CUATRO commits, y los tres de código se hicieron enteros.** `13a7e58` (AO2-1) · `fa7c865`
  (AO2-2) · `2e61d47` (AO2-3) · el de cobertura y documentación. Sello **`v20261030-1830`**, md5
  de `index.html` **`5ddfacc3`**. Al empezar, `origin/main` = `HEAD` = **`ad0067f`**, el cierre de
  la tanda AJUSTES-1, ya publicado, con el pendrive `DISK_IMG` montado y listando nombres reales.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LAS CUATRO FUENTES SE LEYERON EN IMAGEN A 200 ppp, Y EL PIE IMPRESO SE COMPROBÓ EN CADA
  HOJA.** La edición **inglesa** de la ESC 2024 de aorta (163 hojas, folio = hoja + 3537,
  verificado en cuatro hojas): **Figura 5** en la hoja 26 → folio **3563**; **Tabla 68** en las
  hojas 110 y 111 → folios **3647** y **3648**; **Tabla 38** en la hoja 74 → folio **3611**. Y la
  edición inglesa de la ESC 2020 de cardiopatías congénitas del adulto (84 hojas, folio =
  hoja + 562): la tabla de intervención en coartación y el apartado 4.6.3 en la hoja 42 → folio
  **604**. Los ocho valores de la Figura 5, los cinco umbrales y los nueve factores de la Tabla 68
  y las ocho recomendaciones de la Tabla 38 **coinciden uno por uno con lo que la orden anticipa**.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: una unión sinotubular de 34 mm en una mujer
  salía «Aorta torácica de calibre normal» en el informe FIRMADO.** Y el EN SUMA remataba con
  «Estudio sin alteraciones estructurales ni funcionales significativas». Medido en HEAD antes de
  escribir una línea. El corte de ese segmento era 38 mm para los dos sexos y la Figura 5 publica
  33 en la mujer.

- ⚠️ **DOS ARREGLOS QUE NADIE PIDIÓ Y QUE HABÍA QUE HACER, LOS DOS SOBRE EL BORDE DE UN CORTE.**
  1. **`aoSegDil` tenía el `>=` ESCRITO en la rama de `refSexo`.** Era la rama de la raíz, que sí
     cuenta su corte como dilatado. Al entrar la unión sinotubular y la ascendente por esa rama,
     ese `>=` les habría movido el borde: **38,0 y 40,0 exactos pasaban de normales a dilatados en
     el informe firmado**, sin que ninguna orden lo pidiera. Hoy las dos ramas preguntan por
     `incRef` a través de `aoSegPasa`, que es el dueño único del operador.
  2. **La franja «no se puede clasificar sin el sexo» estaba escrita** como
     `x >= _bajo && x < _alto`, que es correcta para la raíz y **equivocada** para un segmento con
     `>` estricto: daba «no se puede clasificar» sobre 33,0 exactos —normales en los dos sexos— y
     en cambio clasificaba 38,0, que es normal en el varón y está por encima del límite en la
     mujer. Hoy se deriva del mismo `aoSegPasa`. Lo fijan **TC-555 (A10b)** y **(A10c)**, que
     nacieron del barrido de mutaciones: sin ellas, la mutación 04 sobrevivía.

- **DOS PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **La lista de factores de la bicúspide NO salía de la Tabla 38.** `vabFactores` ya aplicaba
     los **nueve de la Tabla 68** —tres derivados y seis preguntados— y su propio comentario lo
     declara desde el Y3d5. No había defecto que corregir. Lo que sí había era **inferencia**: la
     casilla tenía dos estados y el comentario del Y3d5 lo decía con todas las letras —«sin marcar
     = no cuenta»—, así que un factor sin contestar pesaba igual que uno descartado.
  2. **La coartación YA llegaba al EN SUMA**, pero sólo con la sección integrada al informe. Sin
     integrar, con `coaConclusion` en «significativa», el resumen decía «sin alteraciones».

- **LAS SEIS CASILLAS SALIERON DE LA PANTALLA, Y LA DECISIÓN SE MIDIÓ EN VEZ DE SUPONERSE.** El
  criterio de la orden es «quedan sólo las casillas que alimentan el informe, el EN SUMA, el PDF o
  el Excel»: en tres escenas —ascendente 51 mm con riesgo bajo, 56 mm y 42 mm— se encendió cada
  uno de los seis por separado y el informe y el EN SUMA salieron **idénticos en los dieciocho
  cruces**. Lo único que mueven es `vabConclusion().txt`, que hoy llega **sólo al panel**: el
  `etePars` de la bicúspide se retiró en el Y3d8 y su `ccHoja('vab', …)` del PDF en el Y3f6.

- **NI UN CAMPO GUARDADO NUEVO NI UNA COLUMNA DE EXCEL, Y ESTÁ MEDIDO POR DIFERENCIA DE ids.** Los
  seis `vab_fr_*` ya eran campos de texto —la casilla era `vabchk-*`, con guión medio, y nunca se
  guardó—, así que el tercer estado entra en el valor: `''` es «sin dato». Censo de campos
  guardados: **946 ids en HEAD y 946 hoy, con el mismo juego exacto**, cero nuevos y cero
  perdidos. `LAB_XLS_MAP` no tiene una sola entrada `vab_`, censado.

- ⚠️ **EL «MÁS DE 50 mm» VA SIN CLASE, Y ES UNA DIFERENCIA DE TRADUCCIÓN.** El inglés dice
  «Surgery at >50 mm **may also be considered** in a shared decision», que es el verbo de la Clase
  IIb; la edición de la SEC lo pasa a «**se debe** considerar», que es el de la IIa. Se usa el
  sentido del inglés y no se le pone clase, porque es texto del cuerpo y la tabla no se la da.

- ⚠️ **LOS TRES «50 mm» QUE QUEDAN EN LA EVIDENCIA NO SON UNA REPETICIÓN**: son tres
  recomendaciones distintas —el fenotipo de raíz, el fenotipo ascendente con factores y la
  decisión compartida—, que es justo lo que la orden dice de la Tabla 38. Medido antes y después
  en la escena de una bicúspide con ascendente 52 y raíz 47: «55 mm» 2 → **1**, «52 mm» 3 → 1,
  «50 mm» 4 → **3** y «45 mm» 4 → **2**.

- **TRES PARTES SE PARARON Y SE REPORTARON, NO SE APLICARON.** La línea **integrada** del EN SUMA
  de la coartación, que publica «indicación de intervención Clase I ESC 2020» (→ **AO2-b**);
  `coaConclusion().txt`, que lleva clase, nivel, tabla y folio al **cuerpo del informe** (→
  **AO2-c**); y la negación global del EN SUMA sobre un segmento en la franja «sin sexo», que es
  preexistente y la raíz ya la tenía desde el G-4 (→ **AO2-d**).

- **14/14 MUTACIONES DIRIGIDAS MUERTAS EN EL PRIMER BARRIDO**, en 3 min 19 s, en worktree y nunca
  sobre el vivo, con guarda de md5 antes y después. **Cuatro de las catorce no revierten nada: la
  aplican de más** —el chip a todos los segmentos, la cita de la figura en el papel firmado, la
  coartación publicada también con la sección integrada y la clase agregada a la línea
  descriptiva—, porque las condiciones que las matan son **controles negativos**. La **03** y la
  **04** son el mismo error por dos puertas y van separadas a propósito: cada una sobrevive si la
  otra la tapa.

- **TC-555 cae contra HEAD por 26 condiciones y NINGUNA por excepción.** Las que pasan en los dos
  árboles son los denominadores y los controles negativos.

- **A/B contra HEAD: 132 escenas, 147.032 claves y 58.080 celdas de Excel. Las 50 diferencias de
  superficie firmada están en CINCO escenas y son las autorizadas** —`yAoSeg`, `yAoSegM`, `vab`,
  `yCoa` y `yVabCoa`—. Las otras **127 escenas dan cero**, `ajeno` y `vacio` incluidos. Y dentro
  de las escenas que cambian hay un control propio: el cayado y la descendente siguen diciendo
  «Dilatación» al lado de los dos que cambiaron, y la raíz también. Excel en **440** columnas con
  las mismas claves en todas.

- **Línea base al cierre: suite 565/570**, en once lotes **cubriendo los 570 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **montado y verificado al abrir, ENTRE LOS ONCE LOTES y al
  cerrar** y el md5 de `index.html` **idéntico** antes y después (`5ddfacc3`). Los rojos son
  **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-551**, que es el
  intermitente que `COR-f` declara y que la orden anticipa: corrido aislado pasa **2 de 2**.
  **TC-358 salió VERDE**, y TC-262, TC-419 y TC-507 también.
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 561/570 CON CINCO ROJOS MÁS, LOS CINCO MÍOS**, y por eso
  esa cifra no es la línea base: **TC-15** y **TC-39** (la palabra que el commit 1 retira),
  **TC-492** (la bibliografía de aorta, 3 → 4 entradas), **TC-514** (la sección de la bicúspide,
  5 → 14 filas) y **TC-535** (los globos de 44×44, 11 → 14). **Los cinco se me pasaron del censo**,
  y es el mismo modo de falla que este archivo ya documenta tres veces: grepeé por las palabras
  con que escribe la frase el caso que SÍ encontré, y estos la escriben con otras.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base. **Excel 440** columnas. **Censo 946 ids, el
  mismo juego exacto que HEAD.** Sin huérfanos nuevos. 17 bloques de JS inline parsean.
- **CELULAR: MEJORÓ.** 59 hallazgos a 360 px y 68 a 390, con **17 ALTA en cada ancho** — los 17 de
  la línea base. HEAD daba 65 y 74 con los mismos 17: los **seis** que bajan en cada ancho son las
  seis casillas retiradas, que eran `toque-chico` de severidad MEDIA.
- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **valor por valor**, y son idénticos a HEAD en todo lo que no es el cambio: **cero
  errores de consola y de página** en los dos motores y en los dos árboles, **cero** desplazamiento
  horizontal del cuerpo, **cero** textos recortados y las mismas 17 de 25 pestañas con caja. Los
  **tres globos nuevos miden 44×44 con los CINCO puntos dando el propio botón** y su tarjeta sale
  en 356×414 **dentro de la pantalla**, también a 390 px.
  ⚠️ **WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
  ⚠️ **Y LOS TRES GLOBOS DABAN 0×0 Y 0/5 EN LOS DIECISÉIS CRUCES**, en los dos árboles, hasta que
  la sonda abrió la **pestaña Y el acordeón** por su botón real: abrir la pestaña no le da caja a
  la tarjeta. Un cero en los dos lados se lee igual que «no cambió».

- **`index.html` pasó de 10,28 MB / 144.727 líneas a 10,32 MB / 145.243** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff son **633 líneas agregadas y 117 quitadas**.

- ⚠️ **EL ACENTO GRAVE DENTRO DE UN COMENTARIO COSTÓ CINCO CORRIDAS, EN DOS ARCHIVOS.** Siempre
  igual: un identificador escrito entre acentos graves dentro del comentario de un caso o de una
  sonda, y los dos cuerpos son template literals. `check_backticks.py` **no cazó ninguna** —mira
  el cuerpo, no el comentario de bloque que lo precede—; lo que sirve es **`node --check`** sobre
  el archivo. Es la quinta tanda seguida que lo paga.

- **TRECE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-15** y **TC-39** (la
  palabra que los dos segmentos dejan de afirmar; TC-39 conserva entera la prueba de concordancia
  de género, porque los otros tres segmentos no se movieron), **TC-66** (la línea del EN SUMA de
  la bicúspide), **TC-471**, **TC-500** y **TC-502** (el registro de globos, 68 → **71**, y el
  mapeo a Referencias 46 → **48**), **TC-492** y **TC-494** (la bibliografía de aorta, 3 → **4**
  entradas, por `AOR-005`), **TC-504** (**seis condiciones INVERTIDAS**: las casillas ya no
  están), **TC-514** (la sección de la bicúspide, 5 → **14** filas), **TC-521** (el control del
  índice separado del del corte por sexo, y el bloque de recomendaciones en **dos**), **TC-535**
  (los globos de 44×44, once → **catorce**) y **TC-537** (**invertida**: la línea vieja de
  umbrales ya no está).

- **Dónde está todo:** `docs/mapa/ao2-segmentos-bicuspide.md` (**mapa NUEVO**, 12,9 KB), la ficha
  del caso en `docs/mapa/tests-fichas-555.md` (**archivo propio**), **seis mapas con un puntero
  cada uno** —medidos ANTES de escribir—, `docs/fuentes/FUENTES.md` → «La tanda AORTA-2» con las
  cuatro fuentes transcritas tabla por tabla y la tabla «Cambios de evidencia» de dieciocho filas,
  y `docs/PENDIENTES.md` → **SIETE** cosas declaradas (**AO2-a** a **AO2-g**), con el inventario
  completo de la válvula aórtica tricúspide, más el cierre de **`AJ4-c`** y de **`AJ1-e`**.
  ⚠️ **Y `vab-bicuspide.md` SE PARTIÓ ANTES DE ESCRIBIRLE EL PUNTERO**, que es la regla: estaba en
  **33,9 KB**, sus secciones 10 y 11 salieron a `docs/mapa/vab-cuspides-dibujos.md` (16,9 KB) y el
  mapa volvió a **18,3 KB**. Cero líneas perdidas, movidas byte por byte. Es la primera vez en
  cinco tandas que la regla se aplica **antes** de cruzar el techo. Quedan esperando
  `congenitas-otros.md` (34,5 KB) y `panel-evidencia.md` (34,1 KB) → **AO2-g**.
