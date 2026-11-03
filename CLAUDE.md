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
| **Tocar el COLOR de un esquema que va al PDF, el ⓘ de una pregunta del panel de Evidencia, el REPARTO en dos columnas de una Evidencia de más de 6 preguntas, o las FRASES del informe de la transposición** | `docs/mapa/pant2-correcciones.md` |
| **Tocar un DIAGRAMA DE FLUJO de la ventana 🧭** (BSE 2024, ASE 2025 en ritmo sinusal o en FA, ASE/EACVI 2016 8A y 8B): los planos, el motor del SVG, el umbral de ancho o la tabla compacta | `docs/mapa/diastolica-diagrama.md` |
| **Tocar la GRILLA del Doppler mitral**: el orden de los 16 campos —**las columnas 2 y 3 están intercambiadas desde el Y3f2**—, el Tab por columnas, los puntos de corte o el selector del S/D | `docs/mapa/doppler-mitral-grilla.md` |
| **Tocar el BORRADO de una lesión valvular**: el retiro del grado, quién prendió una pastilla, los dos métodos de la IM, la continuidad de la IT, el grado de cada fila o **la salida temprana de `calcTHP`** | `docs/mapa/valvulas-borrado.md` |
| **Tocar el TIPO DE IM o el CARPENTIER de la mitral, o el STRAIN DE PARED LIBRE DEL VD**: la fila de tres campos y su ancho derivado del botón, la sincronía con el ETE y su guarda asimétrica, las tres voces del Carpentier, el paréntesis del informe o los cortes del strain | `docs/mapa/aj5-mitral-tipoim-carpentier.md` |
| **Tocar la PANTALLA de las dos lesiones MITRALES**: las tres columnas de la insuficiencia, las casillas automáticas, el cuadro de referencias en tres bloques, la columna 2 de la estenosis, el mecanismo de los globos ⓘ o **el aviso de fibrilación auricular de la continuidad** | `docs/mapa/valvulas-mitral-pantalla.md` |
| **Tocar la PANTALLA de las insuficiencias AÓRTICA o TRICUSPÍDEA**: sus columnas, las cinco casillas automáticas, las once tarjetas ⓘ, el rótulo THP o el color de los avisos | `docs/mapa/valvulas-ia-it-pantalla.md` |
| **Tocar un criterio de PRÓTESIS mitral o aórtica**: la Tabla 11, el AEO en tres tramos, el THP directo, el PPM de la Tabla 7, el badge del AVA aórtico, las tarjetas nativa-prótesis o el rótulo AEO | `docs/mapa/protesis-valvular.md` |
| **Tocar el PPM aórtico del informe, el voto de los cuatro criterios de obstrucción de la prótesis mitral o los dos retiros del gradiente medio** (tandas Z, Z5 y Z6) | `docs/mapa/protesis-z-z5-z6.md` |
| **Tocar la FUGA PARAVALVULAR de una prótesis QUIRÚRGICA**, aórtica o mitral: el motor único, los tres campos nuevos, la marca de origen o por qué la mitral no ofrece extensión circunferencial | `docs/mapa/protesis-fuga-pvl.md` |
| **Tocar la PLASTIA, el TEER o la TAVI de una válvula** —sus opciones, su graduación, los tres globos de Válvulas, su línea en el papel, sus símbolos en el dibujo del posoperatorio—, **las etiquetas del TEER fuera del papel**, o **el PPT del banco de imágenes**: la regla de disposición por área, el número opcional, la inicial, la final o el bucle con varios videos | `docs/mapa/valppt-opciones-ppt.md` |
| **Buscar un CORTE o una BANDA de plausibilidad** de cualquier válvula, con su fuente | `docs/mapa/valvulas-constantes.md` |
| **Tocar la MARCA DE MANUAL de una pastilla, el selector binario de la estenosis mitral, el VIOLETA de «Significativa», el VTI de entrada tricuspídeo, la CASILLA DE PISA de «Incluir en el informe» o lo que «Nuevo estudio» deja vivo** | `docs/mapa/valvulas-manual-binario.md` |
| **Tocar la COARTACIÓN en el papel** —el dueño único `coaPapel`, la aposición de la situación, el recuadro «Según la guía» del PDF o la fila del PPT—, **el guardado de los DIAGRAMAS con el estudio**, el valor por omisión de «Guardar imágenes con los estudios», **la ✕ que sobrevive (`noPdf`)**, **la orejuela que «a veces salía y a veces no»**, el ⓘ de la fila de miniaturas, **los tres ⓘ del TRIV** o el BARRIDO del papel | `docs/mapa/aj2-coartacion-diagramas.md` |
| **Tocar un CORTE DE SEGMENTO AÓRTICO de la Figura 5** —la unión sinotubular o la aorta ascendente por sexo, la frase «por encima del límite superior de lo normal», el chip del cayado y la descendente con su globo, la coartación en el EN SUMA, los tres textos de su pantalla, o los cinco umbrales de la Tabla 68 con sus nueve factores en tres estados | `docs/mapa/ao2-segmentos-bicuspide.md` |
| **Tocar las CÚSPIDES de la bicúspide, sus SEIS dibujos o la animación de la apertura** | `docs/mapa/vab-cuspides-dibujos.md` |
| **Tocar el CRITERIO DE DILATACIÓN DE LA RAÍZ AÓRTICA** —el corte por sexo, el índice de dimensión aórtica, el dueño `aoSegRef`/`aoSegIda`/`aoSegDil`, el globo ⓘ, el cruce entre las pantallas de BICÚSPIDE y de COARTACIÓN, o lo que la tanda AJ4 tocó de la Evidencia de la VAB | `docs/mapa/aj4-raiz-aortica.md` |
| **Tocar la SINCRONIZACIÓN de los dos campos de la raíz aórtica, el grado «sin sexo cargado», el voto del índice en el papel, las dos líneas nuevas del ⓘ de la raíz, los tres arreglos de pantalla de la tanda G o su sonda sistemática** | `docs/mapa/g-raiz-aortica.md` |
| **Tocar una AORTOPATÍA —Marfan, Loeys-Dietz, Turner, ACTA2, Ehlers-Danlos vascular—, la COARTACIÓN, el texto de la VAB o el MOTOR DE EVIDENCIA DE AORTA**: la tabla y el folio de cada síndrome, el corte de dilatación con su dueño, el cuestionario o las recomendaciones por debajo de 45 mm | `docs/mapa/aorta-aortopatias-evidencia.md` |
| **Tocar la TARJETA de criterios de MARFAN**: el score sistémico del Box 2 con sus trece rasgos, las siete reglas del Box 1 con su asterisco, los diecinueve campos guardados y su guardería, el cuadro «Conducta aórtica» con su globo, o la FIGURA que se transforma | `docs/mapa/marfan1-ghent.md` |
| **Tocar la PANTALLA de Marfan o su tarjeta**: las dos columnas de campos, las tres bandas de la tarjeta, los CUATRO globos con el glifo estándar y las diecinueve definiciones agrupadas por zona, el puntaje de la opción elegida, las reglas en una línea, la conclusión en cuatro filas con la pastilla sin indicaciones, o el **Z de la raíz aórtica** y por qué el calculado no existe | `docs/mapa/marfan2-pantalla-z.md` |
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
| **Tocar el panel de Evidencia: agregar una cita, una sección o un sub-bloque** | `docs/mapa/panel-evidencia.md` · la anatomía de una sección, su catálogo y los dos procedimientos en `docs/mapa/panel-evidencia-secciones.md` |
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
| **Tocar el SELECTOR DEL TIPO DE VALVULA OPERADA del posoperatorio, su CORTE DE BAJO GASTO, la PRECARGA, los SIGNOS del pericardio, «Integrar al informe» con cualquier dato, los CHORROS, los CATETERES, el TAMAÑO de las cavidades, los TRAZADOS de TAPSE y E/A, el ESQUEMA EN EL PDF, o el Z DE LA RAÍZ CALCULADO y la línea de Marfan** | `docs/mapa/popc-posoperatorio-marfan.md` |
| **Tocar la PANTALLA del POSOPERATORIO** (tanda POP-A, 01/11): las tres columnas independientes con su corte en 900 px, el monitoreo como tarjeta fija con el Swan en tres columnas y la PmAP derivada, el selector único de fármacos con el azul de metileno, las cuatro casillas de cirugía combinables con la marca heredada de un estudio viejo, las válvulas operadas con su tipo tomado de Válvulas, los drenajes, los nueve espejos `pop-esp-`, la tarjeta «Eco y POCUS» o la disposición de abajo | `docs/mapa/pa-pantalla-posoperatorio.md` |
| **Tocar el DIBUJO del POSOPERATORIO** (tanda POP-B, 01/11): el nivel de líquido del derrame pleural, el puente aortocoronario, la malla del injerto de aorta, los tres drenajes, las cuatro válvulas operadas con su tipo y su latido, los rótulos que se superponían, el botón «Integrar al informe» que dice por qué no puede, el tipo de válvula que ofrece sólo prótesis, el conteo de fármacos o la tarjeta «Pleura y pulmón» | `docs/mapa/popb-dibujo-posoperatorio.md` |
| **Tocar algo que la tanda AJ6 movió** (24/10): el cuerpo del informe de la Fallot reparada —el esquema, la fila vacía y la conducta retirada—, su Evidencia compacta con la prosa en el ⓘ, la ecografía pulmonar en cuatro columnas, o Referencias y Calculadoras dejando de ser módulos opcionales con el buscador que tapa las fichas | `docs/mapa/aj6-fallot-pulmon-refs.md` |
| **Tocar algo que la tanda AJ7 movió** (24/10): la línea de Fallot del EN SUMA y su `resumen`, la línea de presión de llenado del HF-PEFF, la fila «Descripción» del ateroma, el retiro automático del bloque integrado y el aviso al exportar, el VOTO del strain del VD y su banda en Referencias, el bloqueo del Tipo de IM y el Carpentier con prótesis, el rótulo que se achica, las dos conductas de constricción, la compuerta de su Evidencia, el aviso de VExUS armado con `join`, o el dueño único del corte de HTP | `docs/mapa/aj7-correcciones.md` |
| **Tocar el CARPENTIER de la mitral —quién es su dueño y dónde se dice—, el AVISO de la Evidencia de la TRICÚSPIDE, el strain del VD por debajo de 15 %, o las dos TABLAS de la OREJUELA** | `docs/mapa/e-carpentier-tricuspide-orejuela.md` |
| **Tocar algo de ECO ESTRÉS, o entender por qué su código sigue en el archivo sin interfaz**: las cinco piezas (A), las compartidas (B), las que tocan algo guardado (C), las TRES compuertas, las CUATRO familias «ee» —tres vivas— o la calculadora de probabilidad pre-test de la ESC 2019 que vive adentro | `docs/mapa/eco-estres-inventario.md` |
| **Montar un A/B o un barrido de MUTACIÓN, o leer una trampa de instrumentación** | `docs/mapa/arneses-ab-mutacion.md` |
| **Tocar el BUCLE DEL VIDEO de los dos PPT, los BOTONES de respuesta del panel de Evidencia, la cláusula de la IT sistémica de la TGA o la línea de la MIOCARDIOPATÍA HIPERTRÓFICA del PPT de congénitas**: el árbol de tiempo y su falla cerrada, el dueño único que prepara un mp4, la media query del piso táctil, o `mchConclusion().papel` | `docs/mapa/aj3-bucle-botones.md` |
| **Agregar o correr un caso de prueba** | `docs/mapa/tests.md` · los casos tanda por tanda en `docs/mapa/tests-punteros-tandas.md` · fichas en `docs/mapa/tests-fichas-577.md` (TC-577 a TC-581), `docs/mapa/tests-fichas-572.md` (TC-572 a TC-576), `docs/mapa/tests-fichas-550.md` (TC-550), `docs/mapa/tests-fichas-538.md` (TC-538), `docs/mapa/tests-fichas-537.md` (TC-537), `docs/mapa/tests-fichas-536.md` (TC-536), `docs/mapa/tests-fichas-535.md` (TC-535), `docs/mapa/tests-fichas-532.md` (TC-532), `docs/mapa/tests-fichas.md` (TC-499 en adelante), `docs/mapa/tests-fichas-496-498.md`, `docs/mapa/tests-fichas-491-495.md` y `docs/mapa/tests-fichas-481-490.md` |
| **Tocar el DIBUJO ESTÁTICO de la mitral en ETE**: la tabla única de festones por ángulo, la geometría, la línea del plano, el giro, las tres vistas con sus LETRAS DE FESTÓN, **la ORIENTACIÓN de la TRANSGÁSTRICA**, el PDF, los CUATRO DIBUJOS DE MEDIDAS TEER, **los CRITERIOS TEER y sus cortes** o **el ESPEJO de la FEVI y el DSFVI del TEER** | `docs/mapa/mitral-dibujo-estatico.md` |
| **Tocar algo que la tanda R2 corrigió** (21/10): las cinco opciones del derrame y la traducción del token viejo, el repintado de la VAB con el gesto de la pastilla, los seis puntos de la probabilidad de HTP, el e′ medial en tres tramos, el espesor relativo y el criterio por eco de la amiloidosis, el SGL y la calculadora de cardio-oncología, el síndrome intersticial difuso por zonas, el índice cardiaco y la RVS, o la orejuela | `docs/mapa/tanda-r2-correcciones.md` |
| **Tocar algo que la tanda R movió**: la lesión presente sin grado de la VAB, los cortes del TEER, la severidad de la disfunción del VD, el área de la AI, los grados del derrame, el taponamiento que ya no concluye, el VD/VI del TEP o los criterios declarados de Referencias | `docs/mapa/tanda-r-referencias.md` |
| **Tocar la sección de la VÁLVULA AÓRTICA BICÚSPIDE**: la disposición en tres columnas, las seis tarjetas ⓘ, los factores de riesgo con casilla, el DIBUJO y sus puntos sensibles, **la SIMETRÍA DE LAS CÚSPIDES y el ÁNGULO con que se dibuja**, **los SEIS dibujos por tipo y la ANIMACIÓN de la apertura**, **la FUNCIÓN VALVULAR derivada**, **el RESUMEN esquemático y su texto en Evidencia**, la morfología que sigue al tipo de fusión, la descripción del informe, el PDF o el recordatorio de la coartación | `docs/mapa/vab-bicuspide.md` |
| **Tocar el VISOR de «Imágenes guardadas» con VIDEO, el PPT con el cuadro fijo y sus dos avisos, el MOTOR DE TERCIOS de las hojas de diagramas del PDF —el registro, el empaquetador, la CIA debajo del texto de congénitas y las capturas al final—, la CÁPSULA de la coartación sin guía, las dos citas que salieron del papel o el PODADOR del PPT de congénitas** | `docs/mapa/img3-visor-tercios.md` |
| **Visor de cineloop, medición, calibración, IndexedDB** | `docs/mapa/imagenes-visor.md` |
| **Tocar el TRIV del VD en las referencias de VD/AD o de Doppler tricúspide, el ÍNDICE DE TAMAÑO AÓRTICO del síndrome de Turner, el iDA de la raíz con su decimal, o lo que la AORTOPATÍA HEREDITARIA publica en el informe y en el EN SUMA** | `docs/mapa/noc-b-aorta.md` |
| **Tocar el ESQUEMA DE LA OREJUELA del ETE —su lugar al lado de los campos, los rótulos que se pisaban, el movimiento del latido, el chorro leído de Válvulas, el contraste espontáneo o los tres controles—, el ⓘ de «Orejuela izquierda», o el BORRADO de los videos y cineloops de un estudio** | `docs/mapa/noc-a-orejuela.md` |
| **Tocar la pantalla «IMÁGENES GUARDADAS» de Guardados, la ESTRELLA DE IMAGEN con su nota, el PPT armado desde ahí o la FUNCIÓN COMÚN que guarda un esquema de la app como imagen —con su primer uso en la orejuela—**: los dos botones, los meses plegados, el índice sin `dataURL`, las dos listas del registro (`imgs` y `esqs`), el límite de 24, el cuadrado de tapar datos o por qué pintar y guardar son dos funciones | `docs/mapa/img-guardadas.md` |
| **Tocar algo que la tanda AJ2 corrigió** (23/10): la VRT «sin datos» frente a «no medible», el tipo de IM vacío, la coartación sin gradiente, la aorta que ya no gradúa, el ateroma sin riesgo embólico con el grosor completando el grado, el HF-PEFF sin FEVI y la negrita de su hoja, el eco pulmonar «bilateral», el score de TEP con un solo vocabulario y su maqueta en tres grupos, el EN SUMA que ya no niega lo que el informe describe, los dos buscadores o las tildes | `docs/mapa/aj2-correcciones.md` |
| **Tocar algo de la tanda I**: el TRAMO del score de Wilkins, la orejuela y sus dispositivos, la reparabilidad mitral con el rango de tenting, las DOS escalas de ateroma, las tres secciones de Evidencia de la ETE, las notas al pie de la estenosis tricuspídea o la INSUFICIENCIA PULMONAR en Fallot reparada con sus dos guías | `docs/mapa/tanda-i-ete.md` |
| **Tocar la ESTENOSIS MITRAL en el LABORATORIO**: las seis categorías, las dos casillas del filtro, el gráfico de distribución, el PDF de auditoría o el PPT | `docs/mapa/laboratorio-estenosis-mitral.md` |
| **Tocar la VISTA 2D de las válvulas**: el lector único del estado, las tarjetas, la tabla de cavidades, el dibujo, los chorros o el «por qué» | `docs/mapa/vista-2d-valvulas.md` |
| **Tocar el PANEL EN LÍNEA de la vista 2D**: el botón que prende y apaga, el apagado automático, la sincronía en vivo, el alto del dibujo o la línea de fase | `docs/mapa/vista-2d-en-linea.md` |
| **Tocar el RECUADRO de la hoja de congénitas del PDF, el rótulo de la caja «Tricúspide / PSAP», el ESQUEMA DE CIRCULACIÓN EN EL PDF con su botón único, el PANEL DE EVIDENCIA COMPACTO** —una línea por pregunta, los tres estados «Sí | No | ?», la etiqueta de guía, los grupos, el contador o las dos columnas por ancho de panel—, **o la CONCLUSIÓN DE PANTALLA de la TGA** | `docs/mapa/tga4-pdf-panel-compacto.md` |
| **Tocar el DIAGRAMA 3D DE LA TRANSPOSICIÓN**: los dos ejes y su dueño único, el valor `dtga`, el campo de cirugía, las comunicaciones leídas de sus pestañas, la carga diferida con SRI, «Incluir en el PDF» o la cirugía en el papel | `docs/mapa/tga-diagrama-3d.md` |
| **Tocar el ESQUEMA DE CIRCULACIÓN de la sangre de la TGA** —sus seis escenarios, las dos exclusiones de comunicación, la punta de flecha que depende de la dirección que la app guarda, la animación colgada del 3D, el corte de 1200 px o su ⓘ—, **la CONCLUSIÓN de la TGA en la columna izquierda**, o **la salida `papel` que saca la conducta del informe, del PDF y del PPT** | `docs/mapa/tga3-esquema-circulacion.md` |
| **Tocar la EVIDENCIA DE CONGENITAS con sus DOS guias** —la ACC/AHA 2025 y la ESC 2020—, una pregunta de la transposicion, de la CIA o de la CIV, la regla «una pregunta, una guia», la linea de referencia de la otra guia, la nota de tramos que no coinciden, **o el EN SUMA de una valvula con PLASTIA o con TEER** | `docs/mapa/correvid-evidencia-congenitas.md` |
| **Tocar el PAPEL de la TGA operada con JATENE o con RASTELLI**, el dueño `TGA_CIR_OP`, o **agregar una sección al panel de Evidencia con PREGUNTAS de tres estados** —la de la transposición, la CIA, la CIV o la prevención de muerte súbita de la MCH—: dónde se persisten las respuestas, cómo se agrupan las recomendaciones por situación y qué quedó parado | `docs/mapa/t2-evidencia-congenitas.md` |
| **Orientarse en otro módulo** (Congénitas, Laboratorio, PPT, Cardio-Onco, Pericardio) | `docs/mapa/congenitas-otros.md` |
| **Tocar algo que la tanda C1 movió** (28/10): los cuatro rótulos de VExUS contra la Figura 7 de Rola 2021 y su Evidencia sin conducta por grado, la casilla de HTP que dice «sin evaluar», los tres mensajes del Forrester con su dueño único, la RVS leyendo `pamEfectiva` con el origen de sus insumos, el POCUS del posoperatorio viendo el `vd_vi` de VD/AD, o el DIAGRAMA DE FORRESTER de la pestaña de Hemodinámica con sus dos cortes | `docs/mapa/c1-hemodinamica.md` |
| **Tocar la CALCULADORA DE RIESGO CV de cardio-oncología —la Tabla 4 y sus seis columnas, las filas de edad, la casilla sin fármaco—, las TRES TABLAS de la sub-pestaña HFA-ICOS o el MONITOREO de inmunoterapia y anti-VEGF** | `docs/mapa/d2-cardioonco-tabla4.md` |
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
| **Tocar lo que se DESMARCA en congénitas, la PANTALLA o el 3D de la TGA, los DIBUJOS de los criterios TEER o el PAPEL de la miocardiopatía hipertrófica**: la matriz de los 105 selectores, el quinto origen de la VAB, los tres estados del 3D con sus dos exclusiones de comunicación, o las cuatro salidas de `mchConclusion` | `docs/mapa/cong2a-desmarcar-tga-teer.md` |
| **Qué hizo cada tanda, con sus commits y lo que dejó pendiente** | `docs/REGISTRO_TANDAS.md` |
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
  sin frameworks. Hoy **11,09 MB / 155.230 líneas**, medido con `wc -c` y `wc -l` el 2026-11-03 al
  cierre de la tanda **PANT-3**, sobre el árbol ya sellado **y commiteado**: sello
  **`v20261103-0256`**, md5 **`0422963d`**. El diff de la tanda son **1.219 líneas agregadas y 221
  quitadas**, medido con `git diff` contra `efce508`. **Cero** `innerHTML`, `eval` o
  `new Function` nuevos, y cero claves.
  ⚠️ **Y EL RENGLÓN QUE ESTA TANDA ENCONTRÓ ESTABA UNA RESELLADA ATRÁS**, por tercera vez
  seguida: decía 11,02 MB / 154.232 líneas con el sello de PANT-2, y el árbol que se abrió traía
  **`v20261102-2051`** con md5 **`8af4c80b`**. **Medir con `wc -c`, `wc -l` y `md5` antes de
  presupuestar contexto**, no leer esto.
  (Antes: 11,02 MB / 154.232 al cierre de PANT-2, sello `v20261102-2051`, md5 `8af4c80b`.)
  ⚠️ **Y EL RENGLÓN QUE ESTA TANDA ENCONTRÓ ESTABA UNA RESELLADA ATRÁS:** decía `v20261102-1624`
  con md5 `17acf57a`, y el árbol que se abrió traía **`v20261102-1645`** con md5 **`c96543c6`**
  —que es el que la propia bitácora de TGA-4 da como línea base de su suite—. **Medir con
  `wc -c`, `wc -l` y `md5` antes de presupuestar contexto**, no leer esto.
  (Antes: 11,00 MB / 153.899 al cierre de TGA-4, sello `v20261102-1645`, md5 `c96543c6`.)
  El diff de la tanda son **551 líneas agregadas y 62 quitadas**, medido con `git diff` contra
  `7f7d5ec`. **Cero** `innerHTML`, `eval` o `new Function` nuevos, y cero claves.
  (Antes: 10,96 MB / 153.410 al cierre de CORR-EVID, sello `v20261102-1206`, md5 `16cf562a`.)
  ⚠️ **ESE ES EL ÁRBOL QUE LA SUITE MIDIÓ Y EL QUE QUEDÓ COMMITEADO.** `index.html` se selló ANTES
  de la suite completa y el commit de cobertura y documentación **no lo volvió a sellar**, porque
  no lo toca: su md5 es idéntico al del sello, verificado al cerrar. No hay líneas de diferencia
  que declarar. El diff de la tanda son **407 líneas agregadas y 136 quitadas**, medido con `git diff` contra `91dd547`.
  (Antes: 10,91 MB / 153.139 al cierre de VAL-PPT, sello `v20261102-0107`, md5 `738944d2`.)
  ⚠️ **ESE ES EL ÁRBOL QUE LA SUITE MIDIÓ Y EL QUE QUEDÓ COMMITEADO.** `index.html` se selló
  ANTES de la suite completa y los **cuatro** commits de cobertura y documentación **no lo
  volvieron a sellar**, porque no lo tocan: su md5 es idéntico al del sello, verificado al
  cerrar. No hay líneas de diferencia que declarar. El diff de la tanda son **506 líneas
  agregadas y 66 quitadas**.
  (Antes: 10,87 MB / 152.699 al cierre de TGA-3, sello `v20261101-2214`, md5 `7ff2a3f2`.)
  (Antes: 10,84 MB / 152.233 al cierre de POP-C, sello `v20261101-2008`, md5 `747b6597`.)
  ⚠️ **ESE ES EL ÁRBOL QUE LA SUITE MIDIÓ Y EL QUE QUEDÓ COMMITEADO, y por una vez sin asterisco:**
  la suite corrió DESPUÉS del commit de documentación, con su guarda de md5 confirmando que no
  cambió durante la corrida. No hay líneas de diferencia que declarar.
  (Antes: 10,78 MB / 151.374 al cierre de MARFAN-2, sello `v20261101-1540`, md5 `30f48f68`.)
  (Antes: 10,75 MB / 150.960 al cierre de MARFAN-1, sello `v20261101-1111`, md5 `05086dab`.)
  ⚠️ **Y EL RENGLÓN QUE ESTA TANDA ENCONTRÓ ESTABA DOS CIERRES ATRÁS:** decía «10,67 MB / 149.816
  líneas … `v20261101-0747`, md5 `feddd652`», y el árbol que se abrió traía **`v20261101-0834`**
  con md5 **`b6e61443`**, 10,67 MB y **149.822** líneas. **Medir con `wc -c`, `wc -l` y `md5`
  antes de presupuestar contexto**, no leer esto.
  (Antes: 10,67 MB / 149.822 al cierre de POP-B, sello `v20261101-0834`, md5 `b6e61443`.)
  ⚠️ **ESTA VEZ EL SELLO NO SE QUEDÓ ATRÁS, y es por una decisión:** `index.html` se selló ANTES
  de la suite completa y el commit de documentación **no lo volvió a sellar**, porque no lo
  toca. Así el árbol que la suite midió es el mismo que quedó commiteado: no hay tres líneas de
  diferencia que declarar, como pasó en POP-A.
  (Antes: 10,64 MB / 149.427 al cierre de POP-A, sello `v20261101-0512`, md5 `01677156`.)
  (Antes: 10,59 MB / 148.710 al cierre de CONG-2A, sello `v20261101-0152`, md5 `9e5415c1`.)
  ⚠️ **Y EL SELLO DE ESE RENGLÓN ESTABA UNA RESELLADA ATRÁS:** decía `v20261101-0041` con md5
  `0f6254dc`, y el árbol que esta tanda abrió traía **`v20261101-0152`** con md5 **`9e5415c1`**
  —la CONG-2A se reselló al cerrar y el renglón se quedó con el primer sello—. El conteo de
  líneas sí era el bueno. **Medir con `wc -c`, `wc -l` y `md5` antes de presupuestar contexto**,
  no leer esto.
  (Antes: 10,57 MB / 148.497 al cierre de AJUSTES-3, sello `v20261031-2125`, md5 `d5c32e0a`.)
  (Antes: 10,54 MB / 148.070 al cierre de TGA-2, sello `v20261031-1138`, md5 `4379ca6b`.)
  (Antes: 10,47 MB / 147.337 al cierre de TGA, sello `v20261031-0847`, md5 `bb9739ab`.)
  (Antes: 10,40 MB / 146.362 al cierre de IMÁGENES-3, sello `v20261031-0432`, md5 `899080d4`.)
  (Antes: 10,37 MB / 145.915 al cierre de AJUSTES-2, sello `v20261031-0106`, md5 `5d3a6fe2`.)
  (Antes: 10,34 MB / 145.470 al cierre de D2, sello `v20261030-2056`, md5 `ce4dd1ac`.)
  (Antes: 10,32 MB / 145.243 al cierre de AORTA-2, sello `v20261030-1830`, md5 `5ddfacc3`.)
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
  Las dependencias por CDN son jsPDF, XLSX, Chart.js, qrcode, pdf.js y PptxGenJS, todas con su
  hash SRI, más **three.js r128**, que desde la tanda TGA (31/10) se carga **sólo al abrir la
  sección de la TGA** y también con su hash. Se abre como archivo local y corre en Chrome.
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

## El papel describe — REGLA FIJA DE MAICOL (2026-10-31)

**EL PAPEL —informe en los tres estilos, EN SUMA, PDF y PPT— DESCRIBE.** No nombra guías ni
sociedades, no publica clases ni niveles, no cita tablas, figuras ni folios y no recomienda
conducta. Todo eso vive **solo** en la pestaña Evidencia, en Referencias o en el globo ⓘ.

⚠️ **AMPLIACIÓN — REGLA FIJA DE MAICOL (2026-11-02): LA PANTALLA TAMPOCO DA INDICACIONES.** En una
sección y en su tarjeta de criterios no se escribe «indicada», «se recomienda», «seguimiento por
imagen», «considerar» ni ninguna otra conducta: se dice **«cumple criterios para cirugía»**, **«no
cumple criterios para cirugía»** o **«sin datos suficientes»**. Las recomendaciones viven **solo**
en la Evidencia; la guía, la tabla, el folio y la clase, en el globo ⓘ.
Aplicado por primera vez en la tanda **MARFAN-2** sobre los once estados de la pastilla de
«Conducta aórtica» (`docs/mapa/marfan2-pantalla-z.md` § 3). **Ningún corte, umbral ni color se
movió**: lo que cambia es el verbo y lo que se omite, y el color sigue graduando I, IIa y IIb.

- El papel afirma lo que se midió y lo nombra por lo que es: «riesgo de muerte súbita a 5 años
  6,12 %», no «HCM Risk-SCD (ESC) 6,12 % — desfibrilador a considerar (Clase IIa)». El nombre de
  un modelo y el de una sociedad son nombres propios, y salen.
- **Ningún número medido puede desaparecer** al retirar una mención. El año de una guía sí: es
  parte de su nombre.
- **Antes de retirar algo del papel, verificar que su contenido esté en la Evidencia con su
  fuente.** Si no está, PARAR y reportarlo: escribirlo en la Evidencia es contenido clínico nuevo
  y lo decide Maicol.
- La forma de hacerlo **no es reescribir ni reordenar el texto**: se separan **descripción** y
  **conducta** y las dos salidas se arman con las mismas piezas (`coaPapel`, `mchConclusion().papel`
  y su `resumen`). Dos textos paralelos escritos a mano divergen; con una sola construcción no
  pueden.
- **EXCEPCIÓN EXPRESA DE MAICOL:** las etiquetas de la **pantalla** de criterios TEER —«NO apto»,
  «Heart Team», «anatomía compleja»— **no se tocan**: siguen en la pantalla, palabra por palabra.
  ⚠️ **PERO YA NO LLEGAN AL PAPEL, y este renglón decía lo contrario.** Decía que llegan a la hoja
  del PDF cuando el médico integra el módulo «y se quedan», y la tanda **VAL-PPT** (commit 5a,
  2026-11-02), **por orden expresa de Maicol**, las sacó de las catorce superficies de papel: la
  hoja publica la **medición** entera de cada criterio y el **conteo** de los no cumplidos, y el
  veredicto se queda en la pantalla. `teerEstado().papel` se arma con las mismas piezas que
  `titulo` y `nota`, así que los dos textos no pueden divergir. Medido antes y después con el
  módulo **integrado**, que es el único denominador que prueba algo.

## Nada dice que algo está «pendiente de revisión» — REGLA FIJA DE MAICOL (2026-11-02)

**Ninguna pantalla, ⓘ, Evidencia, Referencias ni documento del paciente** —informe, PDF, PPT—
dice que algo está «pendiente de revisión», «sin validar» o «a confirmar» por un cardiólogo, un
especialista o un experto. Tampoco que algo **FUE** validado por un especialista. Esa información
vive **solo** en los documentos internos del proyecto: `docs/PENDIENTES.md`, `docs/fuentes/FUENTES.md`
y este archivo.

**Lo que SE MANTIENE**, y hay que verificar que no se pierda al aplicar la regla:
- que la herramienta es de apoyo clínico y no reemplaza el juicio médico;
- que la Evidencia no constituye una recomendación terapéutica;
- que un esquema es ilustrativo y no es una imagen del estudio.

**Lo que NO es esta regla** y no se toca: un dato clínico del paciente («pendiente de estudio»,
«falta confirmar el diagnóstico», un puntaje «provisorio»), y lo que una FUENTE dice de sí misma
—«no validado externamente», «todavía no validados», «falta validación robusta»—, que es
contenido bibliográfico y a veces un aviso que evita un error.

⚠️ **Y si una frase sostiene algo que el usuario necesita para no equivocarse, no se saca: se
reescribe.** La tanda PANT-3 encontró una sola frase visible que encajaba en la regla —«Esquema
pendiente de revisión para esta cirugía: se muestra el de la anatomía»— y la mitad informativa
evita que el médico tome el dibujo de la anatomía por el de la cirugía: quedó «Para esta cirugía
se muestra el esquema de la anatomía».

⚠️ **EL CENSO DE ESTAS FRASES NO SE PUEDE HACER ENMASCARANDO COMENTARIOS CON UNA EXPRESIÓN
REGULAR, y está medido.** La apertura de comentario de bloque no graduada empareja con el cierre
siguiente, y una apertura dentro de una cadena o de una expresión regular desincroniza el
emparejamiento: enmascaraba el **74 %** del archivo y se comía el control positivo. Se hace en el
navegador, sobre lo que el médico puede leer —el DOM sin los `<script>`, las tarjetas ⓘ abiertas
**con su pestaña delante**, Referencias, la Evidencia y el papel—, más una pasada **cruda** sobre
el archivo con patrones estrictos cuyos hallazgos se inspeccionan a mano. La sonda es
`scripts/_probe_pant3rev.mjs`.

## El informe va en ORACIONES SEPARADAS — REGLA FIJA DE MAICOL (2026-11-03)

El texto del informe va en **oraciones separadas, una por tema**, con un orden lógico; cuando se
pasa a un hallazgo nuevo, **punto y oración nueva**, no un texto corrido. Y **cada hallazgo se
nombra UNA sola vez**, en el informe y en el EN SUMA.

Aplicado por primera vez en la tanda **PANT-4** sobre las dos estenosis aórticas: el evaluador
publica `papel` —la lista de oraciones— y `suma` —la única línea del EN SUMA—, las dos armadas de
las mismas piezas que lee la pantalla, y el emisor no redacta nada. El orden es lesión y tipo →
gradientes → repercusión → hallazgos asociados. Ver `docs/mapa/pant4-estenosis-evidencia.md` § 2.

## La pantalla: campos a la izquierda, diagrama a la derecha — REGLA FIJA DE MAICOL (2026-10-31)

En pantallas de **900 px o más**, los campos van a la izquierda y el diagrama a la derecha; por
debajo de 900 px el diagrama se apila debajo de los campos. El corte va **sobre la ventana** y no
sobre el contenedor: con `flex-wrap` el punto de quiebre depende del ancho que le quede a la
tarjeta, y entonces «a partir de unos 900 px» deja de ser medible.

Vale para los diagramas nuevos y para los que se toquen; **lo que ya quedó a la izquierda no se
mueve.** El patrón de referencia es el de la orejuela (`#oai-fila`) y el de la TGA
(`#tga-fila`): un contenedor flex, la columna de campos con `min-width:0` y la tarjeta del dibujo
con su ancho, todo dentro de una `@media (min-width: 900px)`.

## Las Evidencias de más de 6 preguntas, en dos columnas — REGLA FIJA DE MAICOL (2026-11-02)

**Toda Evidencia con MÁS DE 6 PREGUNTAS ordena las preguntas en DOS columnas** (con su ⓘ), y en
**UNA** columna en anchos menores, **y tiene que FUNCIONAR igual**: los tres estados, el ⓘ, la
lista de lo contestado y la lectura de otros módulos.

- Las dos columnas **reparten las preguntas en orden** —la primera mitad en la izquierda, leyendo
  hacia abajo— y no alternadas; un rótulo de grupo que caiga en el corte pasa a la columna
  siguiente. **La lista «Recomendaciones que aplican» y el contador van a todo el ancho.**
- **Los datos del estudio van ARRIBA**, no en una columna propia: con la tabla de datos a la
  izquierda las preguntas se leen en media pantalla.
- **Fila compacta**: el texto de la pregunta (hasta dos líneas), el control «Sí | No | ?» en línea
  y el ⓘ. Los botones del control miden **32 px de alto visible** con el **área táctil de 44 px**
  —que la da un `::after` absoluto, no un margen negativo— **sin agrandar la fila**. Meta: una
  pregunta de una o dos líneas ocupa **56 px o menos**.
- **Las de 6 preguntas o menos NO se mueven**, y hay que verificarlo: `_indCtrlHTML` es el molde de
  TODAS las botoneras del panel, así que una regla sin acotar las alcanza a las trece secciones.
- El corte es el ancho del **PANEL** y no el de la ventana (`IND_COLS_CORTE`, 900 px), por el mismo
  motivo de siempre: el panel sin maximizar mide 820 px tanto a 1440 como a 1000.

Aplicado por primera vez en la tanda **PANT-2** sobre las tres secciones que usan el molde —la
transposición (18 preguntas), la CIA (14) y la CIV (14)—; ver `docs/mapa/pant2-correcciones.md` § 3.

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
### Los botones CIA/CIV, el corazón maestro, cuatro pantallas y la arritmia ventricular — «PANT-3» (2026-11-02 y 03)

- **VEINTICINCO commits —los de documentación incluidos, contados con `git log`—, y los ONCE
  de la orden se hicieron enteros.** Primera mitad: los botones
  CIA/CIV, el esquema de la TGA, el retiro de los carteles de «revisión pendiente», el botón «3D»
  del corazón maestro y la pantalla de MCH. Segunda mitad: `ca412db` (6 · MCA) · `7db905a`
  (7 · Fallot) · `6bb3e71` (8a) · `11ccfe7` (8b) · `27aa986` (9) · `ae9d1b4` (9b) · `9691de6`
  (10) · `6dff25f` (10b) · los de cobertura. Y el cierre: `a0d6f8d` (12 · el rótulo del TEP y los
  once rojos) · `901748a` (13 · la sonda de dos motores) · `be55fa0` (14 · la condición que pedía
  más que la orden, y el paso 43 de la guía). Sello **`v20261103-0256`**, md5 de `index.html`
  **`0422963d`**. Al empezar, `origin/main` = `HEAD` = **`efce508`**.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- ⚠️ **EL DEFECTO MÁS GRANDE QUE ESTA TANDA SE HIZO A SÍ MISMA, Y LO GRITÓ LA APP POR CONSOLA.**
  El commit 9 movió el módulo de arritmia ventricular al principio de «CC frecuentes» cortando el
  texto **«desde su `<div>` hasta el `<div>` de la sección siguiente»**, y entre los dos estaban
  el **cierre** de `#tab-congenitas` y la **apertura** de `#tab-congenitas2`. Medido en el DOM:
  CC frecuentes se quedaba con **una** sección, sus otras nueve caían dentro de CC complejas y
  **las nueve complejas quedaban fuera de todo panel**. El diagnóstico del panel de Evidencia lo
  dijo con todas las letras —«#ete_cia_dir vive en ningún panel de pestaña»— y ese error de
  consola **no está en el árbol base**, verificado alternando sólo `index.html`.
  **Hoy el módulo se extrae por BALANCE DE ETIQUETAS**, contando `<div>` y `</div>` sobre el
  texto sin comentarios, y no «hasta el siguiente».
  ⚠️ **Y al revertirlo apareció el segundo, que lo tapaba:** MCA cerraba **un `</div>` de más**
  —el commit 6 fundió dos filas de tres campos borrando la apertura de la segunda y dejó su
  cierre—. Se vio por **profundidad de anidamiento**: Fallot y el módulo quedaban en 7 cuando sus
  hermanas están en 8. **Ningún caso lo veía**: nació **TC-631 (H)**.

- **LAS CUATRO PANTALLAS SIGUEN EL MISMO PATRÓN**, que es la regla fija de la casa: campos a la
  izquierda y conclusión a la derecha desde **900 px**, con una sola regla de CSS compartida
  (`#mca-fila, #tdf-fila, #esub-fila, #easv-fila`) y `repeat(3, …)` en vez de `auto-fit` por
  encima del corte —la lección que el commit 5 pagó con una barra horizontal a 900 px exactos—.

- ⚠️ **LA ZONA NO ECOCARDIOGRÁFICA DE MCA QUEDÓ A TODO EL ANCHO POR UNA MEDICIÓN, no por gusto.**
  Metida en la columna de campos, con la conclusión al lado comiendo 320 px, sus cinco tablas de
  criterios largos estiraban la sección de **1254 a 1821 px** a 1440: la disposición nueva era
  **peor** que la vieja. A todo el ancho queda en **1345**. La orden decide tres cosas y no dice
  cómo se anidan. **Aun así queda más alta a 1440 y a 1000 px** (1471 → 1985), y eso es el precio
  de lo decidido → **P3-j**.

- ⚠️ **LA DISPOSICIÓN EN TRES COLUMNAS DE FALLOT QUEDÓ PARADA, y es la condición que la orden
  pone.** De las **cinco** filas de campos, **una sola** lleva título: agruparlas en tres es
  inventarlas, y son **cuatro** temas, no tres. La propuesta está en **P3-i**.
  ⚠️ **Y la pantalla se contradecía a sí misma**: un recuadro decía «Acá no hay campos de
  volumen, y es a propósito» y veinte líneas más abajo están los dos campos de volumen con su
  grupo propio.

- **LOS DOS CORTES DE LA OBSTRUCCIÓN SUBAÓRTICA SE QUEDAN, CADA UNO ROTULADO.** Las cuatro hojas
  se volvieron a leer **en imagen**: **el 40 es MEDIO** y es criterio de intervención (ESC 2020,
  hoja 41 = folio 603, **Clase I · Nivel C**; la guía lo bajó expresamente de 50 a 40, hoja 10 =
  folio 572) y **el 50 es PICO**, sin clase ni nivel (ACC/AHA 2025, hoja 43 = folio e157, en el
  capítulo del defecto septal auriculoventricular; y la hoja 53 = folio e167 dice que **ningún
  dato identifica un umbral de gradiente**). Las dos reglas de folio, comprobadas en el pie
  impreso. **Ningún corte se movió.**
  ⚠️ **La ESC 2020 NO publica un recuadro de recomendaciones propio para la supravalvular**,
  censado sobre sus 84 hojas con control positivo: se aplica el umbral general y se dice así.

- **EL VALOR NUEVO DEL MÓDULO DE ARRITMIA: «Parada cardíaca recuperada».** Es un **valor** de un
  campo que ya existe: **cero campos nuevos y cero columnas de Excel**. Hubo que tocar las
  **cuatro** listas paralelas del vocabulario —y sin la del **importador**, reimportar un Excel
  exportado por la propia app devolvía `null` y el guardián descartaba la **fila entera** del
  paciente—. En MCH cuenta como prevención secundaria; en MCA **no aporta ningún criterio**; en
  Fallot se describe.

- ⚠️ **EL ESPEJO CONDICIONAL DE MCH BORRABA LA RESPUESTA DEL MÉDICO, y lo encontró una medición
  sobre el propio commit.** Reclamaba la autoría **siempre**, así que un «Sí» que el médico había
  contestado él quedaba marcado como escrito por la app y se borraba al apagar la condición. Hoy
  la marca sólo se pone cuando de verdad se escribió, y lo que el médico tuviera contestado se
  guarda en `data-tvprev` para devolvérselo. **Las dos marcas entran en el selector Y en el
  cuerpo** de «Nuevo estudio» — la lección que TC-514 cobró en rojo.

- **EL PAPEL: la única diferencia de toda la segunda mitad es la descripción del valor nuevo.**
  Con tipo «sostenida» el papel sale **idéntico carácter por carácter** en los dos árboles.
  ⚠️ **La primera versión empujaba además una nota que NOMBRABA LA GUÍA en el informe firmado.**
  Una medición la cazó y se retiró. Las otras notas de ese bloque **sí** la nombran: es
  preexistente → **P3-o**.

- **LOS RÓTULOS DE PRESIÓN: 25 de pantalla pasan a PSAP, PmAP y PDAP**, y **ningún id, ningún
  valor, ningún encabezado de Excel y ninguna línea de papel**. ⚠️ **Tres los encontró el caso y
  no el censo de origen**, porque el caso censa el **DOM**: un censo sobre el texto del archivo
  no ve lo que el DOM arma con etiquetas anidadas.

- **A/B POR COMMIT contra el árbol anterior: CERO diferencias de superficie firmada** en los
  commits 6, 7, 8a, 8b, 10 y 10b, con Excel **441 → 441** y campos **988 → 988** en todos. El
  commit 9 da **cero** en las quince escenas y **se declara que ése es un control negativo**:
  ninguna carga el módulo. La medición que vale es la del módulo cargado con el informe emitido.
  **A/B final contra `efce508`:** las tres claves de campos cambian en las **quince** escenas —son
  los **dos** campos nuevos autorizados, 986 → 988— y las superficies de papel cambian **sólo en
  las siete escenas con una lesión marcada**, que es el commit 1. `ajeno` cambia **sólo** por los
  dos campos. **Excel 441 → 441.**

- **33/33 MUTACIONES DIRIGIDAS MUERTAS** en el barrido final, en worktree y nunca sobre el vivo,
  con guarda de md5 **idéntico** antes y después, en 2,0 min. **Siete no revierten nada: la
  aplican de más**, porque las condiciones que las matan son controles negativos.
  ⚠️ **Tres sobrevivieron y me dijeron tres cosas distintas:** M07b era un **hueco real** —no
  había escena con una lesión encendida y la otra apagada CON DATOS, así que la compuerta de
  entrada tapaba a la de la rama—; M13 **medía el lugar equivocado** —la etiqueta «esquema
  ilustrativo» aparece DOS veces y preguntarle al documento entero dejaba pasar que se pierda
  una—; y M10 era **equivalente**: mover la CIA sola da 91 cruces contra 82 pero **cero
  desnudos**, porque lo que sostiene el invariante es el halo y el orden de emisión.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS, y es la decimoquinta tanda seguida.**
  Siempre igual: un identificador entre acentos graves dentro del comentario de un caso, y el
  cuerpo de un caso es un template literal. **`node --check` los cazó todos.**
  ⚠️ **Y UNA VARIANTE NUEVA: el acento grave dentro de un MENSAJE DE COMMIT entre comillas
  dobles es sustitución de comandos.** Cinco identificadores llegaron **vacíos** al mensaje, con
  bash avisando «command not found» por cada uno. Los mensajes largos van **por archivo**, con
  `git commit -F`.
  ⚠️ **Y un comentario de JavaScript dentro de un archivo de Python**, que no parsea.

- ⚠️ **SE PERDIÓ EL ARCHIVO DE TESTS ENTERO UNA VEZ**, por un `git checkout --` para recuperarse
  de un error de sintaxis: los cinco casos nuevos nunca se habían commiteado. **El archivo de
  tests se commitea apenas parsea.**

- ⚠️ **EL ÚNICO DEFECTO DE APP QUE DEJÓ LA TANDA LO ENCONTRÓ UN CASO VIEJO, Y SE CERRÓ.** La
  fila del TEP se leía **«PSAP  PSAP 45 mmHg — elevada (≥60 mmHg)»**: el `span` de al lado escribe
  la sigla **con** su valor y su corte, así que poner «PSAP» también en la etiqueta la decía dos
  veces. **TC-519 (O6)**, de otra tanda, exige que esa etiqueta no contenga la sigla. La orden del
  commit 10 cierra con «si algo de esto choca con lo que existe, PARÁ esa parte y reportá», así
  que esa fila es **la única parada** del commit 10 por ese motivo y su etiqueta nombra el
  **parámetro**: «Presión sistólica pulmonar». Las dos filas de arriba cumplen la misma regla
  porque su sigla —VD/VI y TAPSE— no es su nombre. Los rótulos de la hoja del PDF viven en
  `amiloTextoTEP` y no se tocaron. → **P3-q**.

- **DOCE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito, y los doce los destapó la
  CORRIDA COMPLETA.** **TC-61**, **TC-62** y **TC-506 (F8b)**: la casilla «Integrar al informe» ya
  no alcanza —desde la regla (v) del commit 1 la lesión tiene su propio dato de presencia—, y
  TC-61 gana **(Ca)**, que mide esa mitad sola. **TC-471 (H)** y **TC-500**: el registro de globos
  pasa de 108 y de 101 a **120**. **TC-502 (C3)**: las tarjetas sin ficha en Referencias, de 37 a
  **49**, nombradas una por una. **TC-535 (K0-K2)**: los globos de 44×44, de 29 a **41**.
  **TC-517 (g1)**: la ficha de HTP dice «TAPSE/PSAP». **TC-577 (G1)**: **INVERTIDA** y partida en
  dos, porque nació como control negativo de POP-A —cuyo commit de rótulos tocaba sólo el
  posoperatorio— y el commit 10 de esta tanda unificó las siglas en toda la app. **TC-604 (P6 a
  Q1)**: (P6) pasa a medir el aviso general donde vive ahora —la etiqueta de la tarjeta— y las
  otras cuatro quedan **INVERTIDAS**. Y **TC-632 (B5)**, que era de esta misma tanda y **pedía más
  que la orden**: hoy exige que el nombre completo sobreviva en **exactamente un** rótulo y que
  sea el del TEP, con **(B5b)** pidiendo que su valor sí traiga la sigla.
  ⚠️ **Y UNA DERIVA QUE EL CENSO DESTAPÓ EN TC-500:** su rótulo decía «97 entradas» y el número
  comparado era **101** —una adaptación anterior movió uno y no el otro—, así que el caso podía
  pasar en verde anunciando un denominador que no era el suyo. Los dos dicen 120.

- ⚠️ **LA SONDA DE DOS MOTORES MEDÍA SOBRE DOS DENOMINADORES DE CERO, Y NO ERAN DEFECTOS DE LA
  APP.** `.tab-btn` lleva `transition: all 0.15s`, así que leer `getComputedStyle` justo después
  del clic devuelve el valor **de partida**: el botón de lesión marcado informaba «sin relleno» en
  los dos motores y en los cuatro anchos, que se lee como «el commit 1 no pinta nada», y con
  400 ms de espera el mismo botón da `rgb(62, 207, 142)`, que es `var(--green)`. Y `.sacc-body`
  abre con `max-height` y 0,3 s de transición, apagada **después** del clic: la pantalla de MCH
  informaba 46 o 70 px y el máximo de campos por fila daba 0. Hoy la sonda apaga las dos
  animaciones **antes** de tocar y gana dos controles —que el botón de CIV **no** se pinte y que
  el relleno se vaya al desmarcar—. → **P3-s**.

- ⚠️ **Y UNA DEPENDENCIA DE ORDEN CERRADA QUE NO ERA DE ESTA TANDA:** el bloque (E) de **TC-535**
  salía **verde aislado** —y también contra `e97cd34` en un worktree— y **rojo** en cuanto corría
  después de **TC-502**, que llama a `setEstiloInforme` y no lo devuelve: su (E0) daba
  `0/0/0/0/0/0` y su (E7) `largo=0`, o sea un denominador de cero y no un hallazgo. Su escena fija
  ahora su propio estilo antes de emitir, igual que TC-547. Medido: `TC-502 + TC-535` pasa de
  **1/2 a 2/2**. **La causa sigue en pie en TC-502** → **P3-r**.

- **Línea base al cierre: suite 641/647**, en **doce lotes** cubriendo los **647 casos distintos**
  —contados nombre por nombre, con la guarda que compara lo listado con lo repartido y otra que
  cuenta los ejecutados: **647 de 647**—, en UNA sola pasada sobre el árbol sellado **y
  commiteado**, con el pendrive `DISK_IMG` **verificado al abrir, en los DOCE lotes y al cerrar**
  (catorce verificaciones, listando nombres reales) y el md5 de `index.html` **idéntico** antes y
  después (`0422963d`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre,
  más **TC-551 y TC-557**, los dos intermitentes declarados: **TC-551 corrido aislado sale VERDE**
  y **TC-557 cae con la firma `00000 44x44`** de `elementFromPoint` fuera del viewport que
  **TGA-h** ya documenta. **Ningún rojo nuevo.**
  ⚠️ **Y ESA CORRIDA DIO 640/647 CON UN ROJO MÁS, TC-632, QUE ERA MÍO**, y por eso la cifra de
  arriba sale de cerrarlo y volver a correr su lote entero: **42/42**.
  ⚠️ **El archivo de casos se editó durante la corrida y se declara**: fue **sólo comentario**
  —diez líneas, verificado con `git diff`—, `node --check` pasó antes del lote siguiente y ninguna
  condición cambió.
- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Excel 441** columnas con
  las **mismas 441 claves**, verificado clave por clave: en las escenas con una lesión marcada
  cambian **dos celdas**, y son las dos columnas de texto que espejan el informe y el EN SUMA.
  **Campos guardados 1002 → 1004**, los dos autorizados. **Sin huérfanos nuevos.**
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base exacta.
  **No empeoró.**
- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **sin una sola diferencia entre motores salvo métrica de fuente**: el botón de CIA en
  44×45 y el de CIV en 44×44 —45 en WebKit—, el relleno apagado antes, **encendido** tras marcar,
  apagado tras desmarcar y el de CIV apagado en los 16; las dos secciones abriendo en los 16; el
  esquema de la TGA con sus **12** textos y **4** con halo; el pie del corazón maestro **visible en
  Congénitas y oculto en Válvulas** —la única instancia—; la pantalla de MCH en 3 columnas, 2 cajas
  y 6 globos, con **988 px a 1440 y 2321 a 390** en Chrome (911 y 2132 en WebKit) y el máximo de
  campos por fila en **6 / 2 / 3 / 1**; **cero** desplazamiento horizontal, **cero** textos
  recortados y **CERO errores de consola y de página en los dos motores**.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
- **`index.html` pasó de 11,02 MB / 154.232 líneas a 11,09 MB / 155.230** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff de la tanda son **1.219 líneas agregadas y 221
  quitadas**, medido con `git diff` contra `efce508`, con **cero** `innerHTML`, `eval` o
  `new Function` nuevos y cero claves ni contraseñas.

- **Dónde está todo:** `docs/mapa/pant3-botones-3d-mch.md` (primera mitad) y
  `docs/mapa/pant3-pantallas-arritmia.md` (**mapa NUEVO**, 11,0 KB, segunda mitad),
  `docs/fuentes/FUENTES.md` → «La tanda PANT-3» con las cinco fuentes transcritas y sus reglas de
  folio comprobadas en el pie impreso, `docs/REGISTRO_TANDAS.md` → el bloque de la tanda,
  `docs/GUIA_PRUEBA_PANT3.md` → la guía manual en **42** pasos, `docs/CONTINUACION_PANT3.md`, y
  `docs/PENDIENTES.md` → **P3-a** a **P3-s**, con **P3-h** y **P3-q** cerrados, y
  `docs/GUIA_PRUEBA_PANT3.md` en **43** pasos.

### El PDF de la transposición, el panel compacto y la conclusión descriptiva — «TGA-4» (2026-11-02)

- **SIETE commits, y los SEIS de código se hicieron enteros.** `8294072` (1) · `ca110fa` (2) ·
  `4873668` (3) · `aca41e2` (3b) · `30adbbe` (4) · `38df3b4` (5) · el de cobertura y
  documentación. Sello **`v20261102-1624`**, md5 de `index.html` **`17acf57a`**. Al empezar,
  `origin/main` = `HEAD` = **`7f7d5ec`**, el cierre de CORR-EVID, ya publicado, con md5
  **`16cf562a`**, sello `v20261102-1206` y el pendrive `DISK_IMG` montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  Cierra la mitad de PDF de **T3-c**, y **T3-e**, **T3-f**, **VP-a** y **CE-d**.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el recuadro de la hoja de congénitas del PDF
  arrancaba con «Segun la guia:», y eso sale de la PLANTILLA COMPARTIDA de las catorce hojas.**
  Censado: lo emitían las **nueve** secciones que publican conclusión —`dap`, `vap`, `eisen`,
  `fontan`, `mch`, `ebs`, `tdf`, `tga` y `mca`—; `cia`, `civ` y `coa` pasan `null` y nunca lo
  emitieron. El `!!` se queda, porque es el marcador de bloque de nota y no texto. Medido de
  punta a punta en dos secciones **ajenas** a la transposición, con el PDF generado de verdad.

- ⚠️ **LA CLÁUSULA DEL BLOQUEO AURICULOVENTRICULAR NOMBRABA OTRA ANATOMÍA EN DOS DE LOS TRES
  TIPOS DE SU RAMA.** «complicación esperable en la ccTGA por la disposición del sistema de
  conducción» la recorren el switch auricular, la ccTGA y la d-TGA sin operar, y el médico la
  encontró en el PDF de un **switch auricular**. La rama `descriptivo` —Jatene y Rastelli— ya
  decía sólo el hallazgo desde TGA-3; ahora las dos dicen lo mismo para todos los tipos.
  ⚠️ **Tenía UNA sola aparición en todo el documento** y no vivía en ningún ⓘ ni en Referencias,
  así que se fue también de la pantalla → **T4-c**.

- **EL ROTULO (iv) ERA UN DEFECTO DE ROTULO, Y EL PRECEDENTE ESTABA EN EL MISMO BLOQUE.** El
  médico leyó «Morf. VP: Prótesis biológica» bajo un encabezado que dice «Tricúspide / PSAP» y lo
  entendió de la tricúspide. Las cuatro filas `VP` son la **válvula** pulmonar. Seis líneas más
  arriba, la sub-columna de la **vena** pulmonar ya había ganado un título condicional **con el
  mismo argumento, textual**: «un documento firmado que circula sin la app al lado no tiene dónde
  desambiguar». Las filas **no se movieron** —la agrupación del corazón derecho se conserva—; lo
  único que cambia es el título, y sigue siendo condicional. Dice «Válv. pulmonar» y no «V.
  pulmonar» porque la caja vecina dice «Vena pulmonar». Las cuatro filas salieron a un **dueño
  único** para que el título y las filas no puedan discrepar.

- **EL ESQUEMA ENTRA AL PDF CON EL MISMO BOTÓN, Y EL MOTOR NO SE TOCA.** `_pdfTile` ya dibujaba
  varias partes lado a lado: esto es una fila más en `partes`. La compuerta es `esqEstaIncluido`
  sobre la clave del 3D, o sea el MISMO estado —dos interruptores para una decisión es como se
  llega a que el médico apague uno y el papel siga trayendo el otro—.
  **71 → 72 figuras en las SEIS plantillas** con el botón encendido; 70 → 70 con él apagado y
  58 → 58 en la vista de referencia.

- ⚠️ **DOS DEFECTOS DEL COMMIT 2 LOS ENCONTRÓ SU PROPIA MEDICIÓN.** (1) **El esquema de la VISTA
  DE REFERENCIA se rasterizaba y habría entrado al informe firmado**: con el slot ya incluido y
  el médico tocando «Corazón normal», `tgaEsqSync` repinta el corazón normal y la rasterización
  se lo llevaba. La compuerta pasó a preguntar también por `_tga3dEsDato`. (2) **Generar el PPT y
  enseguida el PDF PERDÍA el esquema**: `generarPPT` carga el estudio en el formulario y el tipo
  queda vacío un instante, la compuerta se cerraba y el raster tiraba el dataURL. Medido:
  «compuerta abierta / dato NO». Con la compuerta cerrada ya **no se borra** lo rasterizado.

- **LA GEOMETRÍA DEL PDF, 108 CRUCES Y 108 OK EN LAS CINCO COMPROBACIONES** (9 escenarios × 2
  temas × 6 plantillas): las dos imágenes con el botón y cero sin él, cero superposición entre
  los dibujos, nada fuera de la hoja A4 con 5 mm de margen, la línea y el epígrafe presentes y
  sin pisar, y la proporción del esquema respetada.
  ⚠️ **El lienzo del 3D se estampa CUADRADO** —`_pdfTile` usa `p.ar || 1` y su parte nunca pasó
  `ar`—, o sea que un 4:3 sale estirado. Es preexistente de TGA-2 → **T4-d**.

- ⚠️ **LA CAUSA DE LOS 104 px POR PREGUNTA NO ERA LA PROSA, Y ESO CAMBIÓ EL ARREGLO ENTERO.** Las
  notas **ya estaban plegadas** en el ⓘ antes de esta tanda: `plegar` es verdadero para toda fila
  con botonera. Medida la fila: el rótulo ocupaba **674 px** y la celda de los botones **SESENTA**,
  así que los dos botones de 44×44 se **apilaban**. Con el tercer estado explícito la botonera
  pasa a tres opciones y se enciende el piso de 170 px que `_indFilaHTML` ya tenía: la fila baja
  a **55 px**. **Pasar a compacto sin eso SUBÍA el alto** —medido: 3947 → 4149—.

- ⚠️ **EL TERCER ESTADO PONE `null` Y NO LA CADENA VACÍA.** Medio panel pregunta `val == null`
  para decir «sin dato no cuenta como no»: con una cadena vacía la advertencia se habría callado
  justo en el estado que viene a hacer explícito. La traducción vive en **un solo lugar**, el
  manejador de clic, que es el único que escribe la respuesta.

- ⚠️ **LA FRASE DEL PIE NO SE RETIRÓ DEL MOLDE COMPARTIDO, Y ESE CENSO ES LA RAZÓN.** De las DIEZ
  secciones que usan `_indFilaOrigen`, **CINCO no dicen la frase en sus `notas`** —`_indEM`,
  `_indFOP`, `_indAo`, `_indVAB` y `_indEP`—, así que quitarla del molde a secas las dejaba sin
  **un solo** aviso de que lo contestado no viaja con el estudio. La quita quien ya la dice, por
  un parámetro. Medido: **19 → 1**.

- ⚠️ **EL ⓘ ABIERTO SE MEDÍA POR PRIMERA VEZ, Y ESTABA ROTO.** La celda del ⓘ queda en treinta
  píxeles en modo compacto: la nota se dibujaba en una tira de **103 × 590 px** y la fila pasaba
  de 55 a **637**. Cinco líneas de hoja de estilos y la nota cuelga en posición absoluta: **600 px
  de ancho y la fila no crece**. Es el commit 3b, y lo pidió una medición.

- **EL CORTE DE 50 mmHg: EXISTE, PERO NO PARA LA TRANSPOSICIÓN.** Leído en imagen a 190 ppp, con
  el folio comprobado en el pie impreso. **ACC/AHA 2025** (Gurvitz, *Circulation* 2026;153:e115-
  e251), **hoja 43, folio e157**, capítulo del defecto septal auriculoventricular, texto de apoyo:
  gradiente **PICO ≥50 mmHg** para la **estenosis subaórtica**, como corte de **gravedad**, **sin
  clase ni nivel propios**. **Hoja 53, folio e167**, capítulo de la estenosis subaórtica: el 50 es
  **pronóstico**, y la misma hoja dice que **no hay dato que identifique un umbral de gradiente**.
  **ESC 2020, hoja 10, folio 572: la guía lo BAJÓ expresamente de 50 a 40 mmHg**, y sus
  recomendaciones (hoja 41, folio 603) usan **media ≥40**, Clase I·C.
  **En el capítulo de la transposición ninguna de las dos publica un número**: censadas las hojas
  54 a 60 de la ESC y 73 a 86 de la ACC. La única recomendación es la 8 de la ccTGA (COR 2b·B-NR,
  hoja 84, folio e198), **sintomático + estenosis severa, sin gradiente**, y ya está en la
  Evidencia desde CORR-EVID. Se **PARÓ**: no se aplica, no se agrega pregunta y no se toca el
  corte de la cascada.
  ⚠️ **Y DESTAPÓ QUE LA APP TIENE DOS CORTES PARA LA MISMA LESIÓN**: `ESUB_MEDIO_SEVERO = 40` en
  su sección de estenosis subaórtica —rotulado «criterio de la ESC 2020»— y 50 en la
  transposición → **T4-a**.

- **LA CONCLUSIÓN DE PANTALLA, DESCRIPTIVA: 11 de 13 escenas cambian y DOS no.** Las dos de la
  rama `descriptivo` —Jatene y Rastelli— salen **idénticas**: son el control negativo. `papel`,
  `resumen` y `clave` **idénticos en las trece**, así que el papel no se mueve y el Laboratorio
  clasifica por la misma rama. **Ningún número medido desaparece**: la obstrucción subaórtica se
  sigue publicando como dato con su gradiente. Lo que se pierde de la pantalla está en **T4-b**,
  con qué respalda la Evidencia y qué no.

- **LOS ALTOS, ANTES → DESPUÉS, a 1440 px:** switch auricular **3947 → 3234** (maximizado, con
  las dos columnas, **3107 → 2384**); Jatene 1949 → 2074; Rastelli 2728 → 2238; ccTGA 2042 →
  2105; **CIA 3419 → 2834**; **CIV 3210 → 2625**. La fila más alta, **104 → 55** en los cinco.
  **El conteo de citas es IDÉNTICO en todos**: 172, 102, 130, 98, 12, 168 y 54, clase por clase y
  folio por folio. **La bicúspide, que comparte el molde, no se movió**: 1536 px, 22 citas, seis
  avisos por pregunta y `compacta=no`.
  ⚠️ **A 390 px el alto SUBE** —el switch auricular 5937 → 6161, la CIA 5303 → 5418 y la CIV
  4935 → 5063—: ahí el panel mide 366 px, la botonera cae en su propia línea por la maqueta móvil
  que ya existía, y los cuatro rótulos de grupo, el contador y el botón no se compensan. El
  arreglo es de escritorio → **T4-h**.

- **A/B contra HEAD, UNO POR COMMIT, con el PDF y el PPT generados de verdad: 29 escenas, Excel
  441 columnas clave por clave y 1002 campos.** Commit 1: **62** diferencias de superficie
  firmada, todas en las 24 escenas que toca. Commit 2: **UNA**, el `_pdf` de la única escena que
  toca el botón. Commits 3, 3b, 4 y 5: **CERO**, con su control positivo de pantalla al lado.
  `vacio`, `cSegNoInt`, `vpNo`, `esqPdfRef` y `ajeno` dan **cero** en todos.

- **28/28 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5
  **idéntico** antes y después. **Seis de las veintiocho no revierten nada: aplican el defecto de
  más**, porque las condiciones que las matan son controles negativos.
  ⚠️ **TRES SOBREVIVIERON AL PRIMER BARRIDO Y ME DIJERON TRES COSAS DISTINTAS.** **M07** era un
  **hueco real**: TC-615 no cerraba la compuerta un instante, así que el defecto del PPT antes
  del PDF no tenía cobertura —de ahí nació el bloque (G)—. **M19** era un **control que no podía
  fallar**: comparaba el atributo contra la misma constante, así que mover la constante movía los
  dos lados; hoy el corte **se afirma por su valor**. Y **M24** tenía el **ancla mal escrita**.

- **SEIS CASOS NUEVOS, TC-613 a TC-618**, con sus denominadores y sus controles negativos, y los
  seis **caen contra HEAD por 48 condiciones y NINGUNA por excepción**, verificado en un worktree.
  ⚠️ **TC-615 caía por EXCEPCIÓN la primera vez**: contra HEAD las tres funciones del esquema no
  existen y llamarlas a pelo mata el caso con un `ReferenceError`, que no dice qué invariante se
  rompió. Es la lección de TC-546.

- ⚠️ **DOS TRAMPAS DE MÉTODO MÍAS, Y LAS DOS COSTARON UNA CORRIDA.** (1) **TC-613 contaba la
  cláusula sobre el HTML del documento**, donde está el **código** de los script inline — y mi
  propio comentario, el que explica por qué se retiró, la contiene: **el arnés se medía a sí
  mismo**. Es la trampa que la tanda C2 documenta. Hoy se le pregunta al emisor. (2) **Edité
  `index.html` con la suite completa corriendo**: esa corrida quedó envenenada, se cortó por PID
  exacto y se rehizo entera sobre el árbol resellado.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS COSTÓ SEIS CORRIDAS, Y ES LA
  DECIMOQUINTA TANDA SEGUIDA QUE LO PAGA.** Siempre igual: un identificador entre acentos graves
  dentro del comentario de un caso o de una sonda, y los dos cuerpos son template literals.
  **`node --check` las cazó todas.** Lo que acabó funcionando fue **contar los acentos graves de
  cada caso después de cada edición y exigir el número exacto** —dos por caso—.
  ⚠️ **Y LA BARRA INVERTIDA SIMPLE, otra vez**: `(\\d+) en Sí` dentro del template de una sonda
  llega como `(d+)` y el contador salía «no» sobre un panel que lo tiene. Se cerró **no usando
  ninguna expresión regular**.
  ⚠️ **Y UNA TERCERA, NUEVA EN ESTA TANDA: la palabra que el runner usa como MARCADOR no puede
  aparecer en un comentario dentro del template.** `String.replace` con una cadena cambia la
  PRIMERA aparición, así que el JSON de la escena se inyectó en mi comentario y el montaje tiró
  «no está definida». Es la hermana de la trampa que AJUSTES-3 pagó con `'ID'` y `'N'`.

- ⚠️ **Y DOS DENOMINADORES DE CERO QUE SE LEÍAN COMO «EL COMMIT NO FUNCIONA».** (1) La sonda
  esperaba `window._tga3d`, que **no está en `window`** —es un `const` de módulo—, así que el
  reloj se consumía entero y el clic llegaba antes de tiempo: las tres escenas del botón medían
  **apagadas en los dos árboles**. La señal buena es `#tga-3d-cv canvas`. Y con la sección **ya
  abierta** nada vuelve a disparar el arranque de la librería: hay que re-despachar el `change`
  del tipo. (2) **El slot del dibujo no lo borra `limpiarCampos`** y se filtraba de una escena a
  la otra, dejando los controles encendidos en los dos árboles.

- **Línea base al cierre: suite 627/633**, en **doce lotes** cubriendo los **633 casos
  distintos** —contados nombre por nombre, con una guarda que compara lo listado con lo
  repartido y otra que cuenta los ejecutados: **633 de 633**—, en UNA sola pasada sobre el árbol
  sellado **y commiteado**, con el pendrive `DISK_IMG` **verificado al abrir, en los DOCE lotes y
  al cerrar** (catorce verificaciones, listando nombres reales) y el md5 de `index.html`
  **idéntico** antes y después (`c96543c6`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**,
  los cuatro de siempre, más **TC-182 y TC-551**, los dos intermitentes que la orden anticipa:
  **corridos aislados, los dos salen VERDE**, verificado. **Ningún rojo nuevo.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 623/633 CON CUATRO ROJOS MÁS, LOS CUATRO MÍOS**, y por
  eso esa cifra no es la línea base: **TC-565** caía por **excepción** —mi fila de grupo no traía
  `lbl` y mataba al filtro que lo lee—, **TC-566** y el propio TC-565 contaban el largo de la
  lista de filas clínicas, que ya no es sólo preguntas, **TC-569** daba por sentado que al abrir
  no hay ningún botón marcado —y el «?» lo está— y **TC-602** afirmaba que la conducta se queda
  en la pantalla, que es justo lo que el commit 4 cambia. Los cuatro están adaptados, el primero
  corrigiendo la APP, y la cifra de arriba sale de la corrida **limpia**, de una sola pasada
  sobre el árbol resellado.
- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Excel 441** columnas con
  las mismas claves. **Campos guardados 1002, el mismo juego exacto**: cero nuevos y cero
  perdidos. **Sin huérfanos nuevos.** 17 de 19 bloques de JS inline parsean, idéntico a HEAD.
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base
  exacta. **No empeoró.**
- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **sin una sola diferencia entre motores**: el panel compacto con sus 18 preguntas
  de 55 px —125 a 390—, **54 de 54 botones de respuesta a 44×44**, 18 etiquetas de guía, cuatro
  grupos, la frase del pie una vez, el contador presente, **139 citas**, la cápsula **sin una
  sola palabra de conducta** y **sin** la cláusula de la ccTGA, **cero** desplazamiento
  horizontal del cuerpo y **cero errores de página**.
  **El mismo cruce contra HEAD da: compacta=no, filas de 104 px, 36 botones, 0 etiquetas, 0
  grupos, la frase 19 veces, «seguimiento anual» en la cápsula y la cláusula presente — y las
  MISMAS 139 citas.**
  El único error de consola y el único texto recortado son **idénticos en HEAD**: el error es el
  `ERR_FILE_NOT_FOUND` del arnés, que carga de una copia en el temporal, y es lo que la tanda D2
  ya documenta.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
- **`index.html` pasó de 10,96 MB / 153.410 líneas a 11,00 MB / 153.899** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff son **551 líneas agregadas y 62 quitadas**, con
  **cero** `innerHTML`, `eval` o `new Function` nuevos y cero claves ni contraseñas.

- **Dónde está todo:** `docs/mapa/tga4-pdf-panel-compacto.md` (**mapa NUEVO**, 9,5 KB), las fichas
  de los seis casos en el propio archivo de tests, `docs/fuentes/FUENTES.md` → «La tanda TGA-4»
  con las tres hojas transcritas, las dos reglas de folio comprobadas en el pie impreso y la tabla
  «Cambios de evidencia» de cinco filas, `docs/REGISTRO_TANDAS.md` → el bloque de esta tanda,
  `docs/GUIA_PRUEBA_TGA4.md` → la guía de prueba manual en catorce pasos, y
  `docs/PENDIENTES.md` → **OCHO** cosas declaradas (**T4-a** a **T4-h**), incluida la decisión del
  médico sobre los símbolos de las válvulas del posoperatorio, que se quedan como están.
  ⚠️ **`congenitas-otros.md` (34,5 KB) NO se tocó**, que es lo que la orden pide.

### La conclusión a la izquierda, el papel sin conductas y el esquema de circulación — «TGA-3» (2026-11-01)

- **SEIS commits, y los CINCO de código se hicieron enteros.** `d2261f4` (1) · `d2cb912` (2) ·
  `91ae620` (3) · `1c9eb6d` (4) · `60aebc3` (5) · el de cobertura y documentación. Sello
  **`v20261101-2214`**, md5 de `index.html` **`7ff2a3f2`**. Al empezar, `origin/main` = `HEAD` =
  **`96b7ff0`**, el cierre de POP-C, ya publicado, con md5 **`747b6597`** y el pendrive `DISK_IMG`
  montado. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el informe FIRMADO de una transposición
  recomendaba conducta y nombraba la guía.** Medido en HEAD con la sección integrada y con su
  control positivo: «seguimiento anual» salía **una** vez en el informe en cada uno de los **tres**
  estilos, **tres** veces en cada una de las **seis** plantillas del PDF y **una** en el PPT; y la
  rama de la insuficiencia tricuspídea severa y sintomática llevaba **«(ESC 2020)»** al papel.
  **El EN SUMA no la llevaba**: `ccSumaLinea` arma su propia línea y nunca leyó la conducta.
  Censo de once marcadores por las once superficies de papel de cada escena: **381 → 0**.

- **NO SE REESCRIBIÓ NINGÚN TEXTO.** `papel` es la **misma lista de partes** congelada ANTES de que
  entre la conducta, así que las dos salidas se arman con las mismas piezas y no pueden divergir.
  Es el patrón de la coartación y de la miocardiopatía hipertrófica, y lo que la AJ7 pagó con la
  Fallot por no tenerlo. **Ejemplo:** «… Diámetro basal del ventrículo sistémico 45 mm. Función del
  ventrículo sistémico conservada — seguimiento anual.» → «… Diámetro basal del ventrículo
  sistémico 45 mm.» **Ningún número medido desaparece.**

- ⚠️ **ESTO TERMINA LO QUE TGA-2 EMPEZÓ.** Su rama `descriptivo` —Jatene y Rastelli— ya salía sin
  conducta, y su propio comentario decía que la cascada «cita la ESC 2020, que es lo que el
  principio del médico saca del papel».

- ⚠️ **UNA REGRESIÓN DEL COMMIT 2 QUE EL COMMIT 5 CIERRA, Y LA ENCONTRÓ UN CASO DE PRUEBA.** El
  commit 2 le puso `papel:true` al registro del PPT mientras la rama `descriptivo` devolvía sólo
  `txt` y `resumen`, así que para Jatene y Rastelli `cc.papel` quedaba `undefined` y **la
  diapositiva se quedaba sin su fila de conclusión**. El commit 5 la devuelve haciendo que esa
  rama también publique `papel`. Medido con el comparador oficial: el A/B del commit 2 muestra UNA
  diferencia de PPT en `cJat` y otra en `cRas`, y la línea de fondo HEAD → cierre las netea.
  ⚠️ **Y MI PRIMER ANÁLISIS DIJO «CERO» SOBRE ESAS DOS ESCENAS**: era un script improvisado que
  extraía el PPT con una clave que no existe, así que comparaba **dos cadenas vacías**. El
  comparador oficial de la tanda sí lo vio. **Un denominador envenenado, no una diferencia.**

- **LA CONCLUSIÓN PASA A LA COLUMNA IZQUIERDA**, al hueco que CONG-2A dejaba vacío bajo los campos:
  medido antes de tocar nada, **368 px de alto × 549 de ancho a 1440 px** y **475 × 358 a 1000**.
  La caja pasa de **1168×34 al pie** a **549×67 en (211, 913)**, justo bajo el último campo, que
  termina en y=901; el alto de la sección baja de **927 a 864 px** a 1440 y de **1056 a 977** a
  1000. **El contenido no cambia: 214 caracteres en los dos árboles.** Y `#tga-fila` sigue con
  **dos** hijos, que es lo que deja la maqueta de 900 px intacta.

- ⚠️ **DOS ARNESES MEDÍAN EL SOLAPE EN UN SOLO EJE, Y LOS DOS INFORMABAN UNO QUE NO EXISTE.**
  `pisaConcl` de `_probe_cong2a_pant.mjs` y `pisaCv` de **TC-574** restan el fondo del lienzo menos
  el tope de la conclusión: correcto mientras la conclusión estuviera **debajo**, y falso desde que
  vive **al lado**, porque dos cajas lado a lado comparten rango vertical por diseño. Informaban
  de 232 a 640 px. **La intersección en los DOS ejes es cero** en los ocho cruces y en los dos
  árboles. TC-574 se adaptó a medir los dos ejes; la sonda ajena **no se tocó** → **T3-g**.

- **EL ESQUEMA DE CIRCULACIÓN, Y SU DECISIÓN DE DISEÑO: no tiene selector.** El escenario sale de
  `tgaEjes()` y de `tga3dComs()`, los dueños únicos que ya lee el 3D: con un selector propio, el
  esquema y el 3D de la misma caja podrían mostrar **dos anatomías distintas del mismo paciente**.
  Medido: con `tga_tipo = mustard` el dibujo es **idéntico** al de `dtga` + `auricular`.

- **EL CONTROL CLÍNICO DE LOS RECORRIDOS, QUE ES LA CONDICIÓN DE LA ORDEN, Y SU RESPALDO NO ES LA
  DEMO.** Las frases del recorrido de la demo las redactó quien la armó y **no estaban en la app**.
  El respaldo es **`TGA3D_CIRC`**, que es de la app y que las tandas TGA y TGA-2 verificaron.
  **Los seis recorridos coinciden**, comparados uno por uno, así que **ninguno quedó parado**. El
  mecanismo de parada existe y **tiene cobertura** —la mutación M13 lo ejercita—, listo para el día
  que haga falta.

- ⚠️ **EN LA ccTGA LAS DOS VÁLVULAS CAMBIAN DE LADO, y es todo el sentido de la doble
  discordancia**: la aurícula derecha desemboca por la **mitral** en el ventrículo izquierdo
  morfológico y la izquierda por la **tricúspide** en el derecho morfológico. Medido: `M@80 T@220`
  contra `T@80 M@220` del resto. La mutación **M12** las descruza y mata el caso.

- **LAS DOS EXCLUSIONES SON LAS DEL 3D, NO UNAS NUEVAS**: no la CIA con el switch auricular, no la
  CIV con el Rastelli, por el motivo clínico que **C2A-f** ya declara. Dibujarlas acá y no allá
  dejaría los dos dibujos de la misma caja contradiciéndose sobre el mismo paciente. **Y la
  comunicación omitida se dice**: un dibujo que no muestra una CIA cargada sin explicar por qué se
  lee como que la app perdió el dato. Medido: `CIA=NO` **sólo** con `mus` (en sus dos formas) y
  `CIV=NO` **sólo** con `ras`.

- **LA PUNTA DE FLECHA VA SOLO DONDE LA APP GUARDA LA DIRECCIÓN, y está censado, no supuesto:**
  existen `ete_cia_dir` y `dap_dir`, y para la CIV **no hay ningún campo de dirección en toda la
  aplicación**. Medido: **6** puntas sin dirección —una por flecha de flujo—, **7** con la de la
  CIA y **8** con la del ductus.

- **SOLO LECTURA, Y ESTÁ MEDIDO:** recorrer los siete escenarios no mueve **ninguno** de los 986
  campos del estudio, y **ninguna** clave del esquema es campo del estudio. **Cero campos guardados
  nuevos y cero columnas de Excel**, verificado escena por escena: **19 de 19 con censo y Excel
  idénticos**, 441 → 441 y 1002 → 1002.

- ⚠️ **EL ESQUEMA SOBREVIVE A QUE EL CDN FALLE, Y SE MIDIÓ EN VEZ DE AFIRMARLO.** Con three.js
  bloqueado: `window.THREE` **no carga**, el 3D publica su aviso y el esquema **sigue dibujando**
  —3.559 caracteres de SVG, sus seis flechas y su línea de texto—, con **cero errores de página**.
  Es lo que valida pintar el esquema **antes** de las salidas tempranas de `tga3dSync`.

- ⚠️ **AL LADO DEL 3D DESDE 1200 px Y NO DESDE 900, Y ES UNA MEDICIÓN, NO UNA PREFERENCIA.** El
  recuadro mide **631 px a 1440** y **406 a 1000**, así que al lado el 3D quedaría en **327 px a
  1440** —que sirve— y en **126 px a 1000** —que no sirve para nada—. El punto 3a dice que el 3D
  «no se achica más de lo necesario», así que entre 900 y 1200 el esquema se apila **debajo del 3D
  dentro del recuadro**, y por debajo de 900 se apila junto con toda la caja, que es lo que la
  orden pide. **Las dos condiciones del 3a entran en conflicto a 1000 px** y se resolvió por la que
  la orden pone primero → **T3-a**.

- ⚠️ **LA TIPOGRAFÍA DEL SVG ES MÁS GRANDE QUE LA DE LA DEMO, Y ES UNA MEDICIÓN.** El SVG escala
  con su ancho: con los 9 px de la demo en un `viewBox` de 300, a los 268 px que el esquema ocupa
  al lado del 3D el rótulo saldría en **8,0 px**. El mínimo es **12**, que ahí sale en **10,7 px**:
  la misma tipografía que este recuadro ya usa en sus dos párrafos (10,5 y 11 px). Con 11 el mínimo
  caía en **9,8**. Y apilado el SVG **se topa en 340 px**: sin ese tope, en el recuadro de 706 px de
  los 768 la tipografía se iba a **28 px**.

- **LA ANIMACIÓN SE CUELGA DE LOS DOS DUEÑOS QUE EL 3D YA TIENE**, `_tga3d.pausado` y `_tga3d.fc`:
  con un estado propio, el botón «Pausar» dejaría el 3D quieto y el esquema moviéndose.
  `prefers-reduced-motion` queda satisfecho por ahí mismo. **Sin frecuencia, ritmo fijo**, y el
  bucle **se apaga solo** cuando el dibujo no se ve, con el mismo predicado del 3D.

- **LA ALTERNATIVA ACCESIBLE ES EL RECORRIDO QUE LA APP YA PUBLICA.** Sale de `TGA3D_CIRC`, el mismo
  que imprime el párrafo de al lado, así que el lector de pantalla y el que ve el dibujo reciben la
  **misma** secuencia. ⚠️ Ese nodo es **visually-hidden a propósito**, así que es un **falso
  positivo** de los barridos de «texto recortado»; las sondas de esta tanda lo descartan por `id`.

- **EL ⓘ ES EL ESTÁNDAR DE LA CASA** —glifo **U+24D8** en un botón de 44 px con `vinfo-btn-44`— y
  dice lo que el esquema **no** es: no es una imagen del estudio, no está a escala y **los
  recorridos de las cirugías esperan la revisión de un cardiólogo de congénitas**. **Sin una sola
  cita.** El registro pasa de **97 a 98** entradas.

- **17/17 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5
  **idéntico** antes y después, en 1,9 min. **Cinco de las diecisiete no revierten nada: aplican el
  defecto de más**, porque las condiciones que las matan son **controles negativos**.
  ⚠️ **TRES SOBREVIVIERON AL PRIMER BARRIDO Y ME DIJERON TRES COSAS DISTINTAS: dos estaban MAL
  ESCRITAS** —una sólo agregaba un atributo, la otra cambiaba una frase que el caso no mide— **y
  M14 era un HUECO REAL**: la condición del censo excluía justo los dos campos que el caso mueve a
  propósito, así que una escritura automática **sobre ellos** pasaba en verde. De ahí nacieron
  **(M1b)**, **(M1c)** y **(M1d)**, que le preguntan al campo **directo**.

- **CUATRO CASOS NUEVOS, TC-601 a TC-604**, con sus denominadores y sus controles negativos, y los
  cuatro **caen contra HEAD por 50 condiciones y NINGUNA por excepción**, verificado en un worktree.
  ⚠️ **LA SUITE CORRE CHROME SIN `--window-size`, O SEA A ~756 px**, por debajo del corte de la
  maqueta, así que la disposición se mide por la **regla de la hoja de estilos** y por la
  **estructura**: la geometría la miden las sondas en los cuatro anchos y los dos motores.
  ⚠️ **`VINFO` NO ESTÁ EN `window`** —lo dice el mapa de la TGA—: la primera versión de TC-604
  preguntaba por `window.VINFO` y sus ocho condiciones de contenido fallaban sobre un registro que
  sí existe.

- **SEIS CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-471** y **TC-500** (el
  registro de globos, 97 → **98**), **TC-502** (las tarjetas sin botón, 26 → **27**), **TC-535**
  (los globos de 44×44, 18 → **19**, en sus **tres** condiciones), **TC-573** (**INVERTIDA**, y es el día que ese caso anunciaba:
  afirmaba que la conclusión queda «FUERA de la fila, debajo de todo», que es justo lo que se
  cambió; gana dos condiciones nuevas para que pueda volver a fallar) y **TC-574** (la métrica de
  solape pasa a los **dos** ejes).

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS COSTÓ CUATRO CORRIDAS, Y ES LA
  DECIMOCUARTA TANDA SEGUIDA QUE LO PAGA.** Siempre igual: un identificador entre acentos graves
  dentro del comentario de un caso o de una sonda, y los dos cuerpos son template literals.
  **`node --check` las cazó todas.** Lo que acabó funcionando fue **contar los acentos graves de
  cada caso después de cada edición y exigir el número exacto** —dos por caso—.
  ⚠️ **Y EL `\n` DENTRO DE UN HEREDOC DE PYTHON, QUE ES LA HERMANA DE ESA TRAMPA:** en una cadena
  de Python que no es cruda, `\n` es un salto **real**, así que los cinco del texto del ⓘ partieron
  sus literales de JavaScript y el bloque dejó de parsear.

- ⚠️ **Y UNA TRAMPA DE MÉTODO MÍA QUE COSTÓ UNA MEDICIÓN: el A/B leía `index.html` VIVO y yo lo
  edité a mitad de corrida.** Esa medición quedó envenenada y hubo que cortarla por PID exacto y
  rehacerla. De ahí en más, **cada A/B corre sobre una copia sellada** y no sobre el árbol de
  trabajo. Y el `nohup … &` lanzado desde la herramienta de shell **no sobrevive al envoltorio**,
  que es lo que CONG-2A ya documenta en **C2A-h**.

- ⚠️ **`scripts/_probe_tga3.mjs` YA EXISTÍA**: es la sonda del papel de la tanda **TGA** del 31/10,
  y esta tanda se llama TGA-3. Es la colisión que AJUSTES-1 y AJUSTES-3 pagaron **sobrescribiendo
  una sonda ajena**. Se verificó con `ls` **antes** de crear cada nombre: los seis nuevos estaban
  libres, y el `git diff` de las ocho sondas de las tandas TGA, TGA-2 y CONG-2A está **vacío**.

- **A/B contra HEAD, con el PDF y el PPT generados de verdad: 19 escenas, 21.378 claves y 8.379
  celdas de Excel. 112 diferencias de superficie firmada, TODAS en las catorce escenas con
  conducta** (8 cada una). `vacio`, `ajeno`, `cSegNoInt` —la misma escena **sin integrar**—, `cJat`
  y `cRas` dan **CERO**. Por commit: el 1 **cero**, el 2 las 112 más las dos del PPT, el 3 **cero**,
  el 4 **cero**, el 5 las dos del PPT devueltas.
  ⚠️ **EL «pantalla=0» DE ESE ARNÉS ES UN CONTROL NEGATIVO EN LOS COMMITS 1, 3 y 4, y se declara:**
  no mide geometría ni mira los nodos del esquema. Eso lo miden `_probe_tga3concl.mjs`,
  `_probe_tga3circ.mjs` y `_probe_tga3wk.mjs`.

- **CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES, SIN UNA SOLA DIFERENCIA ENTRE MOTORES** (dos
  motores × 1440, 1000, 768 y 390 px × dos temas): el esquema al lado del 3D a 1440 y apilado por
  debajo de 1200, el SVG en **268×259 / 340×329 / 302×292**, la tipografía en **10,7-13,4 /
  13,6-17 / 12,1-15,1**, el globo en **44×44 con los CINCO puntos dando el propio botón**, la
  leyenda visible, la intersección **real** con el 3D y con la conclusión en **cero**, **cero**
  desplazamiento horizontal, **cero** texto recortado y **CERO errores de consola y de página**.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
  ⚠️ **El único error de consola del árbol de HEAD es del arnés** —`ERR_FILE_NOT_FOUND`, porque se
  carga de una copia en el temporal—, que es lo que la tanda D2 ya documenta. El árbol vivo da cero.

- **Línea base al cierre: suite 613/619**, en **doce lotes** cubriendo los **619 casos
  distintos** —contados nombre por nombre, con una guarda que compara el total con los distintos y
  otra que compara los ejecutados: **619 de 619**—, en UNA sola pasada sobre el árbol sellado, con
  el pendrive `DISK_IMG` **verificado al abrir, en los DOCE lotes y al cerrar** (catorce
  verificaciones, listando nombres reales) y el md5 de `index.html` **idéntico** antes y después
  (`7ff2a3f2`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más
  **TC-182 y TC-551**, los dos intermitentes que la orden anticipa: **corridos aislados, los dos
  salen VERDE**, verificado. **Ningún rojo nuevo.** **TC-358 y TC-557 salieron VERDES.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 612/619 CON UN ROJO MÁS, QUE ERA MÍO**, y por eso esa
  cifra no es la línea base: **TC-535**, porque de sus **tres** condiciones que cuentan los globos
  de 44×44 adapté (K0) y (K1) a diecinueve y **(K2) se quedó en dieciocho**. Los datos estaban bien
  —diecinueve globos, todos con 5/5 puntos propios—; lo que fallaba era el conteo. Está adaptada y
  la cifra de arriba sale de la corrida **limpia**, de una sola pasada con el archivo de tests
  final y sobre el mismo árbol sellado.
- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Excel 441** columnas con
  las mismas claves. **Censo de campos idéntico y sin huérfanos nuevos.** 17 de 19 bloques de JS
  inline parsean, idéntico a HEAD —los dos «rotos» son los artefactos preexistentes del extractor—.
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base exacta.
  **No empeoró.**
- **`index.html` pasó de 10,84 MB / 152.233 líneas a 10,87 MB / 152.699** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff son **480 líneas agregadas y 14 quitadas**.

- **Dónde está todo:** `docs/mapa/tga3-esquema-circulacion.md` (**mapa NUEVO**, 16,7 KB), las fichas
  de los cuatro casos en `docs/mapa/tests-fichas-601.md` (**archivo propio**, porque
  `tests-fichas.md` está en 34,2 KB), **dos mapas con un puntero cada uno** —medidos ANTES de
  escribir: `tga-diagrama-3d.md` 16,8 → 18,4 KB y `tests-punteros-tandas.md` 24,5 → 25,8—,
  `docs/fuentes/FUENTES.md` → «La tanda TGA-3» con `TGA3D_CIRC` transcrita, la tabla de lo que salió
  del papel y dónde sigue estando, y su tabla «Cambios de evidencia» **vacía a propósito**,
  `docs/REGISTRO_TANDAS.md` → el bloque de esta tanda, `docs/GUIA_PRUEBA_TGA3.md` → la guía de
  prueba manual en doce pasos, y `docs/PENDIENTES.md` → **SIETE** cosas declaradas (**T3-a** a
  **T3-g**).
  ⚠️ **`congenitas-otros.md` (34.540 B) NO se tocó**, que es lo que la orden pide.

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

### El diagrama 3D de la transposición — «TGA» (2026-10-31)

- **SEIS commits, y los tres de código se hicieron.** `b85f3ea` (TGA-1) · `0c1337d` (TGA-2) ·
  `7f6540b` (TGA-3) · el de cobertura y documentación. Al empezar, `origin/main` = `HEAD` =
  **`c5dc409`**, el cierre de IMÁGENES-3, ya publicado, md5 de `index.html` **`899080d4`**.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  Cierra **IMG3-h**, que era esta tanda entera declarada como no hecha, y en parte **IMG3-j**.

- **EL INVENTARIO DIO VUELTA LA PARTE A, Y ES LO PRIMERO QUE HAY QUE SABER.** La orden autoriza
  hasta CUATRO campos guardados nuevos: la cirugía realizada y, **sólo si no existen**, las tres
  comunicaciones. **Las CUATRO comunicaciones ya existen** —CIA y CIV en «CIA / CIV», el foramen
  oval en su sección y el ductus en la suya—, así que por la condición expresa de la orden se
  agregaron **cero**: el diagrama las LEE de ahí. Y **la cirugía NO tenía campo propio**: está
  fusionada dentro de `tga_tipo`, donde `mustard` y `senning` SON el switch auricular.
  Resultado: **UN** campo guardado nuevo, `tga_cirugia`.

- ⚠️ **Y UN CAMPO SOLO NACÍA MUERTO, ASÍ QUE HUBO QUE AGREGAR UN VALOR A UNO QUE YA EXISTÍA.** Con
  `cctga` la demo IGNORA la cirugía (`var o=(a==='dtga')?op:'none'`) y con `mustard`/`senning` la
  cirugía ya la dice el tipo: sin una anatomía **d-TGA** el campo nuevo no tiene dónde aplicarse.
  `tga_tipo` gana el valor `dtga`. **No es un campo ni una columna** —el Excel no se mueve por él y
  el Laboratorio tampoco, cuyo único uso de `tga_tipo` es el predicado de presencia `!== ''`— y el
  rótulo «completa» **sale de la propia orden**, que lo escribe en su ejemplo de redacción del
  informe. Su rótulo entró en los **TRES** mapas que lo publican en el MISMO commit: sin eso,
  `TIPO[tipo] || tipo` publicaba el token crudo «dtga» en el informe **firmado**.

- ⚠️ **JATENE Y RASTELLI ESTÁN PARADOS, Y ES EL LÍMITE QUE EL INVENTARIO FORZÓ.** La orden autoriza
  cuatro valores de cirugía; se publican **dos**. En Jatene y en Rastelli el ventrículo sistémico es
  el **izquierdo**, y `tgaConclusion` abre el informe **firmado** con «el ventrículo derecho es el
  ventrículo sistémico» y sigue con tres oraciones más que dependen de eso. Publicarlos exigía
  reescribir cuatro frases del informe, que es decisión de Maicol. Y hay dos textos de PANTALLA que
  quedan inexactos y tampoco se tocaron: el **título** de la sección dice «corregida» —y una d-TGA
  no operada no lo es— y su **párrafo de encabezado** afirma que el VD es el sistémico. → **TGA-a**.

- **LA COMPARACIÓN OBLIGATORIA CON LA DEMO: 20 DE 20 ESCENARIOS ALCANZABLES, IDÉNTICOS.** No se
  comparan píxeles: se corre el `scenario()` de la demo y el `tga3dEscena()` de la app con los
  MISMOS datos y se comparan campo por campo —puntos, colores, radios, extras y rótulos—. Treinta
  escenarios (6 combinaciones × 5 juegos de comunicaciones): **20 IGUALES** —corazón normal, d-TGA
  sin cirugía, d-TGA con switch auricular y L-TGA, en los cinco juegos— y **10 distintos**, que son
  exactamente los cinco de Jatene y los cinco de Rastelli. El `scenario()` de la demo es una IIFE y
  no exporta nada: se **extrae** el texto de sus constantes y de su función por marcas literales
  —verificando que cada una aparezca **una sola vez**, así que si la demo cambia la extracción falla
  ruidosamente— y se evalúa en una página en blanco.

- ⚠️ **UN DEFECTO LATENTE DE LA DEMO, QUE SE PORTÓ Y SE ARREGLÓ.** El reloj que
  `requestAnimationFrame` pasa es el del COMIENZO del cuadro y puede ser anterior al
  `performance.now()` tomado antes de construir la geometría: el primer `dt` sale **negativo**,
  `flowT` se va por debajo de cero y `getPointAt` recibe un parámetro negativo. three.js no lo
  valida: revienta con «Cannot read properties of undefined (reading 'x')» dentro de la librería
  minificada — **un error de consola que parece de la librería y es del reloj**. Pasa UNA vez, en el
  primer cuadro, y después nunca más, que es lo que lo hace difícil de ver. Tres guardas y las tres
  hacen falta: `Math.max(0,…)`, el doble módulo de `u`, y el reloj puesto en hora justo antes de
  arrancar el bucle. Encontrarlo costó cinco mediciones: parchear `getPointAt` **después** de que
  `tga3dInit` corre no lo caza, porque ya pasó.

- ⚠️ **Y LA CARGA DIFERIDA NO ERA LO QUE YO HABÍA ESCRITO.** `offsetParent` NO detecta el acordeón
  plegado —`secToggle` cierra con `max-height:0`, no con `display:none`—, así que con la sección
  CERRADA el predicado daba `true` y la librería se bajaba igual. La decisión del médico dice «sólo
  al abrir la sección de la TGA»; sin la pregunta por la clase `open`, la garantía era «al abrir la
  pestaña». Lo destapó una medición, no la lectura.

- **EL HASH SRI SE VERIFICÓ POR DOS CAMINOS INDEPENDIENTES Y COINCIDEN**, que es lo que este archivo
  manda: la API de cdnjs y `openssl` sobre el archivo bajado. three.js **r128**, con `integrity`,
  `crossorigin` y `referrerpolicy`, como los otros seis scripts de CDN de la app. El `onerror` cubre
  los dos fallos que importan —sin internet y hash que no coincide—, y en los dos el resto de la
  sección sigue funcionando porque nada más de la TGA depende de la librería. **`index.html` no
  crece por la librería.**

- ⚠️ **LA EXCLUSIÓN DE LA FAMILIA `cc` DEL MOTOR DE TERCIOS ERA UNA BANDERA DE LA CIA, Y EL
  COMENTARIO DEL MOTOR DECÍA LO CONTRARIO.** Decía «agregar otro congénito no toca este bloque» y
  era **falso por un renglón**: la exclusión estaba escrita `k === 'cia' && _ciaEnSuHoja`, así que un
  segundo congénito se estampaba debajo del texto de su módulo **y** volvía a entrar al motor — el
  mismo dibujo **DOS VECES** en el informe firmado. Hoy es una LISTA.
  Y el recolector del esquema 3D va **antes** de la hoja de congénitas y no junto al de la orejuela:
  esa hoja lee `_dg` cuatrocientas líneas más abajo pero **antes** del bloque de la orejuela.

- **UN SOLO LUGAR DONDE SE COLOCA EL SLOT.** `esqIncluirEnPDF` recibe un `<svg>` y lo rasteriza; el
  diagrama 3D es WebGL y ya tiene su `dataURL`. El cuerpo salió a `_esqPonerSlot` y las dos puertas
  terminan ahí. ⚠️ Y **`preserveDrawingBuffer: true` hace falta**: sin él `toDataURL` sobre el
  lienzo devuelve un PNG **en blanco** en cuanto el navegador limpió el buffer, y «Incluir en el
  PDF» habría guardado una imagen vacía **sin un solo error de consola**.

- **LA CIRUGÍA SE DICE UNA SOLA VEZ, Y ES POR CONSTRUCCIÓN.** `tgaCirFrase()` devuelve cadena vacía
  para `mustard` y `senning`, que ya la nombran en su propio rótulo, así que no hay escenario en que
  el papel la diga dos veces. Es el defecto que la tanda E pagó con el Carpentier, que se decía
  hasta TRES veces en el mismo informe firmado. **Sin dato no dice nada**: «sin dato» no es «sin
  cirugía».

- ⚠️ **LA PARTE B SE PARÓ, Y LA MEDICIÓN ES LO QUE LA PARA.** El commit 4 pedía retirar del PPT de
  congénitas la recomendación de desfibrilador de la miocardiopatía hipertrófica, «verificando antes
  que esté en la Evidencia o el ⓘ con su fuente; si no está, PARÁ». **No está**: cero menciones en la
  Evidencia de la MCH —que es toda sobre terapia de reducción septal—, cero en los **74** globos ⓘ y
  cero en las **62** fichas de Referencias, con el **control positivo** de que el papel sí la dice
  dos veces. Retirarla la perdería de la aplicación entera, y escribirla en la Evidencia sería
  contenido clínico nuevo. **TC-563 bloque C es el guardián de esa parada** y pasa en los dos
  árboles a propósito: el día que la recomendación entre, se pone rojo. → **TGA-c**.

- **LA PARTE C: EL ARCHIVO ESTÁ LISTO PARA ABRIR, Y EL VALOR DEL BUCLE NO ESTÁ VERIFICADO.**
  `~/Desktop/ceibo-experimento-ppt-bucle/experimento_bucle_video.pptx`, 65.683 bytes, con un MP4
  H.264 de 8.689 bytes y 2 segundos. ZIP coherente, **20 de 20** partes XML bien formadas,
  `repeatCount="indefinite"` y `spTgt spid="10"`. El árbol `p:timing > p:tnLst > p:par > p:cTn >
  p:childTnLst > p:video > p:cMediaNode > p:cTn + p:tgtEl` está respaldado pieza por pieza por
  Microsoft Learn, con la cita de cada una en **TGA-f**. ⚠️ **Pero el VALOR del bucle no**: esas
  páginas **no contienen la palabra «indefinite»** y remiten a `ST_TLTime` (§19.7.38), que no se
  pudo leer en el texto de la norma; la única fuente leída que admite el literal es la reproducción
  del esquema de **datypic**, que es un tercero. Por eso es un experimento y no una implementación.
  ⚠️ **Y la validación cazó un error mío**: la primera versión tenía un `</p:spTgt>` sobrante tras
  una etiqueta autocerrada → 19 de 20 partes bien formadas.

- ⚠️ **PptxGenJS 3.12.0 EMITE DOS SHAPES CON EL MISMO `id` EN LA MISMA DIAPOSITIVA**, medido sobre
  el paquete que genera de verdad: el segundo cuadro de texto y el video salen los dos con
  `id="3"`. Un `spid` duplicado es ambiguo y podría por sí solo hacer que PowerPoint se queje,
  confundiendo el experimento, así que al video se le puso un id libre. → **TGA-e**.

- **A/B contra HEAD: 159 escenas, 26.928 claves, y CERO diferencias de superficie firmada en 155.**
  Las 4 que cambian son exactamente las que cargan el valor de anatomía nuevo, en 8 de 8 superficies
  —informe en tres estilos, EN SUMA en tres, PDF y PPT—. `vacio`, `ajeno`, `tgaMus`, `tgaSen`,
  `tgaCc`, `tgaMusCir`, `tgaSinInt` y `tgaVacio` dan **cero**. Ejemplo: «Transposición de grandes
  arterias **corregida**» → «… **completa (d-TGA)**», y el EN SUMA «TGA — VD sistémico con
  disfunción leve» → «TGA **completa (d-TGA)** — VD sistémico con disfunción leve». Excel 440 → 441
  con «Switch auricular (Mustard o Senning)» en la columna nueva; campos guardados 962 → 963.
  ⚠️ **Ese A/B se corrió sobre los commits 1 y 2**, antes del 3: la granularidad por commit del 3 la
  da `_probe_tga3.mjs` con sus ocho escenas, sus denominadores y sus controles.

- **14/14 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5 antes
  y después. **Cuatro de las catorce no revierten nada: la aplican de más**, porque las condiciones
  que las matan son controles negativos. Cada mutación declara **su** caso: correr los tres por cada
  una habría tapado un reparto mal hecho — y eso es justo lo que pasó.
  ⚠️ **DOS SOBREVIVIERON AL PRIMER BARRIDO Y ME DIJERON COSAS DISTINTAS.** La **05** estaba mal
  repartida —apuntaba a TC-561, que mira el Excel y no el informe— **y además destapó un hueco
  real**: el caso se llama «d-TGA un valor nuevo» y no miraba que el token crudo no llegara al
  papel. Se reparó a TC-563 **y** nació la condición (D7). La **10** estaba **mal escrita**: cambiaba
  `o` en la cabecera de la escena, pero la rama de L-TGA **no lee `o` en ninguna línea** —todo lo que
  depende de la cirugía está detrás de un `a === 'dtga'`—, así que no inyectaba ningún defecto. Lo
  que hacía falta era inyectarlo DENTRO de la rama, y entonces el control negativo (C5) la mata.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS COSTÓ CUATRO CORRIDAS, Y ES LA OCTAVA TANDA
  SEGUIDA QUE LO PAGA.** Siempre igual: un identificador entre acentos graves dentro del comentario
  de un caso, y el cuerpo de un caso es un template literal. `check_backticks.py` **no cazó
  ninguna**; **`node --check` las cazó todas**. Lo que acabó funcionando fue contar los acentos
  graves del bloque nuevo después de cada edición y exigir el número exacto.
  ⚠️ **Y la barra invertida simple, dos veces.** `/[ \t\n\r]+/g` escrito con UNA barra llega al
  navegador con un salto de línea **real** dentro del literal de expresión regular: «Invalid regular
  expression: missing /». Se cerró **no usando ninguna expresión regular**, que es lo que la tanda
  AJUSTES-2 ya había aprendido.

- ⚠️ **TRES TRAMPAS DE DENOMINADOR, Y LAS TRES COSTARON UNA CORRIDA.** (1) **La sección de la TGA
  vive en la sub-pestaña «CC complejas» (`#tab-congenitas2`)**, no en «congenitas»: abrir sólo la
  primera deja todo su árbol bajo un `display:none`, `offsetParent` da null, TODO
  `getBoundingClientRect` da 0×0 y el diagrama parece no existir. (2) **Su acordeón YA VIENE
  ABIERTO**: un click a ciegas lo cierra, y entonces el diagrama no carga. (3)
  **`page.evaluate(cadena, arg)` DESCARTA el argumento** —queda `undefined` de los dos lados y dos
  resultados vacíos comparan iguales—, así que el `scenario()` de la demo se inyecta con
  `addScriptTag`.

- ⚠️ **Y UN DEFECTO QUE EL CASO DE PRUEBA ENCONTRÓ EN MI PROPIO PREDICADO.** `fop_tunel` es la
  **longitud del túnel en milímetros**, un campo numérico, y lo estaba leyendo como texto: funcionaba
  por casualidad. Y el predicado del FOP **no** es el `hayDato` de `fopConclusion`, a propósito: ese
  lo llena también un test de burbujas **negativo** —que es justo como se **descarta** un foramen
  oval—, así que usarlo habría dibujado una comunicación interauricular sobre un paciente en el que
  el médico acaba de descartarla.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Excel 440 → 441**, con las
  440 anteriores **idénticas en encabezado y en orden relativo**, medido contra HEAD con
  `_labOrdenarCols` en los dos árboles: una agregada, cero perdidas. **Censo 1024 → 1028**: **+1
  campo guardado** (`tga_cirugia`, el autorizado) y **+3 controles de pantalla** con prefijo
  `tga-3d-`, declarado en `_noEsDelEstudio` y fijado por TC-561 (F2). **Sin huérfanos nuevos.**
  17 bloques de JS inline parsean.

- **DOCE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito.** Diez por el Excel de 440 a 441
  —**TC-135, TC-457, TC-463, TC-464, TC-319, TC-429, TC-430, TC-440, TC-466, TC-470**—, más
  **TC-471** (el registro de globos, 73 → 74) y **TC-559** (el registro del motor de tercios, 7 → 8
  filas, y su cadena de orden).
  ⚠️ **Y LA PRIMERA PASADA DEL CENSO ENCONTRÓ CUATRO DE LAS DIEZ, NO LAS DIEZ.** Grepeé «440» con
  los filtros obvios y las otras seis lo escriben con otras palabras —`xls.n === 440`,
  `Object.keys(xl).length === 440`, `cols === 440`, `total === 440`, `excelCols() === 440`—. Hubo que
  barrer **toda** comparación `=== 440` en líneas que hablaran del Excel: **161 líneas** en la
  primera pasada y **42 más** en la segunda. Es el modo de falla que este archivo ya documenta seis
  veces, y esta vez el número es el que lo hace evidente.
  ⚠️ **Dos nombres de caso NO se tocaron**, y es a propósito: «TC-477 · el Excel **pasa** a 440
  columnas» es una afirmación HISTÓRICA de su propia tanda, no un invariante vivo.

- **DOS MOTORES, DIECISÉIS CRUCES CADA UNO** (Chrome del sistema y WebKit de Playwright × 1440,
  1000, 768 y 390 px × dos temas), **y coinciden valor por valor**: la sección abre, three.js
  **no está** sin tipo cargado y entra en **r128** con tipo, lienzo 560×420 —302×420 a 390 px—,
  los seis controles a la vista, los seis rótulos del dibujo, la fila de cirugía visible, el globo
  en 380×414 **dentro de la pantalla** y **sin una sola cita**, **cero** desplazamiento horizontal
  del cuerpo, **cero** textos recortados y **CERO errores de consola y de página en los dos
  motores**. El papel idéntico en los dos. La única diferencia entre motores son **9 px** en el
  ancho del botón «Corazón normal» (208 contra 217), que es la métrica de su texto.
  ⚠️ **LOS CUATRO BOTONES DEL DIBUJO MIDEN 44 px Y NINGÚN PUNTO CAE EN OTRO CONTROL, pero NO dan
  5/5, y la razón es geométrica.** Son `.btn`, con `border-radius: 7px`: el punto a 2 px de la
  esquina cae **fuera** de la forma redondeada y `elementFromPoint` devuelve el contenedor flex
  —que no es un control y no hace nada—. Exigir 5/5 sobre un rectángulo redondeado es exigir algo
  que la geometría no da; lo que se cuenta es que un toque no caiga en **otro control**, y eso da
  4 de 4 en los dieciséis cruces. Los globos **cuadrados** de 44×44 con `vinfo-btn-44` sí dan 5/5,
  y los mide TC-535.
  ⚠️ **WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
  ⚠️ **Y LA SONDA MIDIÓ SOBRE UN DENOMINADOR VACÍO DOS VECES ANTES DE SERVIR**: registraba el
  estado del acordeón **antes** de abrirlo —la sección nace cerrada, y por eso los controles llevan
  `data-ui`—, y no marcaba «Integrar al informe», cuya ausencia deja el papel **sin una palabra de
  la TGA**: «SIN LÍNEA» se lee como que el commit 3 no funciona.

- ⚠️ **LA SUITE COMPLETA ENCONTRÓ TRES REGRESIONES MÍAS Y SEIS CONTEOS SIN ADAPTAR, Y LAS TRES
  REGRESIONES SON EL MISMO DEFECTO: EL PREFIJO ESTÁ EN TRES LISTAS Y YO LO ESCRIBÍ EN UNA.**
  TC-159, TC-246 y TC-247 **pasan contra HEAD y fallaban en mi árbol**, verificado en un worktree.
  1. `_noEsDelEstudio` decide qué **se guarda** — ésa la había puesto.
  2. `_CAMPOS_FUERA_DEL_ESTUDIO` decide si el formulario **«tiene datos»**. `tga-3d-fc` es un
     `input[type=number]` con `value="70"` en el marcado, así que `limpiarCampos` lo vaciaba y
     `_formTieneDatos` veía un campo distinto de su valor por defecto: **«Nuevo estudio» PREGUNTABA
     sobre un formulario vacío** y —peor— **el autoguardado creía que el formulario ya estaba
     empezado y NO restauraba el borrador**.
  3. **`data-ui`**, que se lo pide `secAutoOpen`: abre un acordeón cuando encuentra adentro un
     control con valor. La casilla «Nombres» viene marcada y la frecuencia trae 70, así que
     **entrar a «CC complejas» abría la sección de la TGA sola** → TC-514.
  Y acá `data-ui` es lo correcto y **no** un prefijo: ese barrido no tiene regex donde registrar
  uno, y **su propio comentario lo dice**. Es la lección del D-11 con `data-espejo` por tercera vez.
  Las tres listas quedan fijadas por TC-561 **(F2)**, **(F5)**, **(F6)** y **(F7)**, y por las
  mutaciones **08**, **15** y **16** — una por puerta, porque romper una sola la tapan las otras.

- **16/16 MUTACIONES DIRIGIDAS MUERTAS** en el barrido final, en worktree y nunca sobre el vivo,
  con guarda de md5 antes y después.

- **Línea base al cierre: suite 573/578**, en once lotes **cubriendo los 578 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **montado y verificado al abrir, ENTRE LOS ONCE LOTES y al
  cerrar**, y el md5 de `index.html` **idéntico** antes y después (`bb9739ab`). Los rojos son
  **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-557**.
  **TC-358, TC-551 y TC-182 salieron VERDES.**
  ⚠️ **TC-557 ES UN INTERMITENTE NUEVO Y NO ES DE ESTA TANDA**, caracterizado como manda este
  archivo —mismo directorio, mismos scripts, alternando sólo `index.html`—: **2 rojas de 9** contra
  HEAD y **2 de 6** en el árbol nuevo, siempre la misma condición `(D4)` y siempre con el mismo
  diagnóstico `00000 44x44`, que es la firma de `elementFromPoint` fuera del viewport. → **TGA-h**.
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 564/578 CON NUEVE ROJOS MÁS**, y por eso esa cifra no es
  la línea base: **tres regresiones mías** —TC-159, TC-246 y TC-247, el defecto de las tres listas—
  y **seis conteos sin adaptar** —TC-477, TC-479, TC-500, TC-502, TC-514 y TC-535—. Los nueve están
  cerrados y la cifra de arriba sale de la corrida **limpia**, de una sola pasada sobre el árbol
  sellado.

- **Semgrep 124 WARNING / 0 ERROR.** **Excel 441** columnas. **Censo 1028**, 0 huérfanos nuevos.
  **Celular 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base exacta.
  17 bloques de JS inline parsean.

- **`index.html` pasó de 10,40 MB / 146.362 líneas a 10,47 MB / 147.337** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) Sello **`v20261031-0847`**, md5 **`bb9739ab`**.

- **Dónde está todo:** `docs/mapa/tga-diagrama-3d.md` (**mapa NUEVO**, 13,4 KB), las fichas de los
  tres casos en `docs/mapa/tests-fichas-561.md` (**archivo propio**), **cinco mapas con un puntero
  cada uno** —medidos ANTES de escribir, todos por debajo de 35 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda TGA» con su tabla «Cambios de evidencia» **vacía a
  propósito** y los dos censos con su control positivo, y `docs/PENDIENTES.md` → **OCHO** cosas
  declaradas (**TGA-a** a **TGA-h**) más el cierre de **IMG3-h** y, en parte, de **IMG3-j**.
  ⚠️ **`congenitas-otros.md` (34,5 KB) NO se tocó**, que es lo que la orden pide. `tests.md` quedó
  en **34,4 KB**: la próxima tanda que lo toque tiene que partirlo.

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

### La calculadora sin fármaco, las seis columnas de la Tabla 4 y el monitoreo — «D2» (2026-10-30)

- **CINCO commits, y los cuatro de código se hicieron enteros.** `1866fd2` (D2-1) · `f973566`
  (D2-2) · `1c03919` (D2-3) · `8c198a8` (D2-4) · el de cobertura y documentación. Sello
  **`v20261030-2056`**, md5 de `index.html` **`ce4dd1ac`**. Al empezar, `origin/main` = `HEAD` =
  **`5cc2a36`**, el cierre de la tanda AORTA-2, ya publicado, con el pendrive `DISK_IMG` montado
  y listando nombres reales. **El push lo corre Maicol: esta tanda tenía orden expresa de NO
  pushear.**

- **LAS CUATRO FUENTES SE LEYERON EN IMAGEN, Y EL FOLIO SE COMPROBÓ EN EL PIE IMPRESO DE SIETE
  HOJAS.** Guía ESC 2022 de cardio-oncología (Lyon y cols., *Eur Heart J* 2022;43:4229-4361),
  edición **inglesa**, 133 hojas, **folio = hoja + 4228**: **Tabla 4** en las hojas 18 y 19,
  folios **4246** y **4247**, con sus **seis** columnas celda por celda a 420 ppp;
  **Recomendaciones-tabla 10** en la hoja 36, folio **4264**; **Figura 20** en la hoja 45, folio
  **4273**; y **Recomendaciones-tabla 1** en la hoja 21, folio **4249**.
  **Las seis columnas coinciden una por una con lo transcripto en `docs/PENDIENTES.md` → D-b**,
  así que no hubo que parar ningún fármaco.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: con el selector de fármaco vacío, la
  calculadora clasificaba igual.** Medido en HEAD antes de tocar nada: una hipertensión sola salía
  «Riesgo MEDIO (1/13 pts)» y tres factores «Riesgo ALTO (3/13 pts)», con su línea de derivación,
  en la cápsula **y** en `co-riesgo-resultado`; y el informe **firmado** de un estudio integrado
  publicaba «puntaje 2/13 puntos — riesgo alto» sobre un paciente sin tratamiento elegido. La
  Tabla 4 tiene una columna **por fármaco**: sin fármaco no hay columna que aplicar.

- **EL MENSAJE NUEVO NO LLEGA AL PAPEL, Y NINGUNA CADENA NUEVA TAMPOCO.**
  `hfaicosPublicarBasal` publica la **misma** pastilla gris que ya usaba sin datos, y
  `hfaicosTexto` se calla la oración de la categoría, la derivación, el calendario y la línea de
  «clasificación orientativa», dejando las frases descriptivas que ya existían palabra por
  palabra.

- ⚠️ **EL A/B DEL COMMIT 2 DESTAPÓ UN DEFECTO DE ESE MISMO COMMIT.** `hfaicosTexto` nombraba la
  columna con un **ternario binario**, cierto mientras las columnas aplicadas fueran dos: con las
  seis, el informe **firmado** de un paciente con mieloma múltiple decía «según la tabla … para
  **terapias dirigidas contra HER2**». Lo encontró la escena `f_mieloma_bnp`. Hoy el nombre sale
  de una tabla por columna.

- ⚠️ **LA CASILLA DE ANTECEDENTE CORONARIO SON TRES FILAS DE LA TABLA, Y EN CUATRO COLUMNAS NO
  VALEN LO MISMO.** «Severe VHD», «MI or PCI or CABG» y «Stable angina»: con antraciclinas y
  anti-HER2 las tres son H —por eso nada se movió—, con BCR-ABL y mieloma las tres son «–», con
  RAF/MEK las tres son H, **y con anti-VEGF son –, VH y VH**. Se aplica el **mayor**, que es el
  lado seguro y el mismo criterio que la nota al pie g. **El precio, declarado: con anti-VEGF, un
  paciente cuyo único antecedente sea una valvulopatía severa se clasifica muy alto.** Partir la
  casilla agregaría campos guardados → **D2-a**.

- **DOS FÁRMACOS NUEVOS EN EL SELECTOR SIN UN CAMPO GUARDADO NI UNA COLUMNA DE EXCEL.** `mieloma`
  y `raf_mek` no tenían dónde caer. `co_farmaco` y la columna «Fármaco cardiotóxico» ya existían:
  lo que se agrega son dos **valores** al vocabulario, en el mapa de etiquetas **y** en el inverso
  del importador, que es lo que mantiene vivo el round-trip. Medido: **Excel 440 → 440 columnas
  con las mismas claves** y **censo 946 → 946 ids con el mismo juego**.

- **LAS TABLAS A Y C DE HFA-ICOS SE DIBUJAN DESDE EL MISMO DUEÑO QUE CLASIFICA** (cierra **D-c**).
  La A publicaba doce factores con puntos **fijos** iguales para todos los fármacos y la C
  clasificaba con «≥4 puntos de la sección A **o** fármaco de muy alto riesgo», que es el piso por
  fármaco que la Tabla 4 no tiene. **Ejemplo medido:** un paciente con hipertensión y nada más,
  con un anti-VEGF, leía «1 punto → Medio» en A+C y la calculadora dos tarjetas más arriba decía
  **ALTO**. Hoy `coT4RefPintar()` las arma desde `coT4Pesos()`, `_coT4Edad()` y `_CO_T4_CORTES`:
  **66 celdas, cero discrepancias con el dueño.** **La tabla B no se tocó y se reporta**: agrupar
  fármacos en bandas no tiene equivalente en la Tabla 4 → **D2-b**.

- ⚠️ **LAS DOS FILAS DE MONITOREO NO ESTABAN EN UN LUGAR: ESTABAN EN TRES**, cada una con su
  propia versión y las tres distintas —y la intro de una afirmaba ser «la MISMA columna» de otra
  cuando no lo era—. Se corrigieron las **tres** (cierra **D-g**): dejar dos contradiciendo a la
  que se arregla es el defecto que esta pestaña ya pagó con sus tablas estáticas. → **D2-f**.

- **EL PUNTO 4b, VERIFICADO Y SIN TOCAR NADA: la derivación SÍ sigue la categoría de la guía.**
  Releída en imagen la Recomendaciones-tabla 1: riesgo bajo «proceed … without delay» (I · C) y la
  app no muestra acción; moderado «may be considered» (IIb · C); alto y muy alto «is recommended …
  before anticancer therapy» (I · C). Las clases ya vivían en el globo.

- **DOS MUTACIONES SOBREVIVIERON AL PRIMER BARRIDO, Y LAS DOS ERAN COBERTURA QUE FALTABA.** La 05
  porque apagar la derivación en el dueño es **redundante** con las salidas tempranas de los dos
  pintores —se cerró preguntándole al dueño, que es donde vive el contrato—; y la 15 porque el
  control negativo del monitoreo corría sobre una escena **sin el módulo integrado**, donde nada
  de cardio-oncología baja al informe: un control que no podía fallar. **15/15 muertas** tras
  cerrarlas, en worktree y nunca sobre el vivo, con guarda de md5.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MI PROPIO COMENTARIO COSTÓ DOS CORRIDAS, Y `check_backticks.py`
  NO CAZÓ NINGUNA.** Las dos veces fue un identificador entre acentos graves dentro del comentario
  de un caso. **Lo que sirve es `node --check`.** Es la sexta tanda seguida que lo paga.

- ⚠️ **Y DOS TRAMPAS NUEVAS DEL ARNÉS, LAS DOS PAGADAS.** (1) **Un caso agregado al FINAL del
  archivo de tests no se ejecuta**: `CASOS` se consume en el bloque que arranca Chrome, que no
  está al final, y la suite imprime **«0/0 ✓ sin regresiones»** sobre un caso que nunca corrió.
  (2) **La tarjeta de un globo es `position:fixed`, así que su `offsetParent` es `null` aunque
  esté abierta**: preguntar por `offsetParent` devolvía «NO VISIBLE» sobre una tarjeta de 620×476
  perfectamente dibujada.

- ⚠️ **Y SEMGREP SUBIÓ A 125 CON MI PRIMERA VERSIÓN DEL PINTOR**, por `ceibo-xss-innerhtml-concat`:
  armaba las dos tablas concatenando `innerHTML`. Se reescribió con **nodos**, que es lo que
  `calcHFAICOS` ya hacía y por el mismo motivo —«un warning más en la línea base es un warning que
  el próximo lector tiene que volver a descartar a mano»—. Volvió a **124 / 0 ERROR**.

- **A/B contra HEAD, uno por commit, y las diferencias de superficie son SÓLO las autorizadas.**
  Commit 1: cambian las **cinco** escenas sin fármaco y con algo cargado, sobre 142; `sf_vacio`,
  `ajeno` y las 135 con fármaco dan **cero**. Commit 2: cambian **58** —19 de anti-VEGF, 19 de
  BCR-ABL, la de la nota g con anti-VEGF y 19 de «Otro», éstas **sólo** en la línea de alcance—;
  antraciclinas, anti-HER2, inmunoterapia, radioterapia, las seis sin fármaco y el estudio ajeno
  dan **cero**. Commits 3 y 4: **CERO** en las 142, con su control positivo al lado —la medición
  dedicada, donde las dos tablas cambian por completo—.
  ⚠️ **Y MIELOMA Y RAF/MEK SE MIDEN APARTE, con `--nuevos`**: sus opciones no existen en el árbol
  viejo, y ponerle a un `<select>` un valor que no tiene lo deja en vacío, o sea que el A/B
  mostraría diferencias donde el cambio no puede actuar.
  ⚠️ **Y EL PRIMER A/B DIO «142 DE 142 CAMBIAN», QUE ERA MI PROPIA SONDA**: leía
  `hfaicosEstado().clasifica`, una clave que HEAD no tiene, así que todas las escenas diferían por
  ella. Se descarta en la comparación.

- **Dónde está todo:** `docs/mapa/d2-cardioonco-tabla4.md` (**mapa NUEVO**, 12,2 KB), la ficha del
  caso en `docs/mapa/tests-fichas-556.md` (**archivo propio**, porque `tests-fichas.md` está en
  34,2 KB), el puntero en `docs/mapa/d-cardioonco-amiloidosis.md` § 9 y en `docs/mapa/tests.md`
  —los dos medidos ANTES de escribir, 28,8 y 30,5 KB—, `docs/fuentes/FUENTES.md` → «La tanda D2»
  con las cuatro fuentes transcritas tabla por tabla y su tabla «Cambios de evidencia» de
  dieciséis filas, y `docs/PENDIENTES.md` → **SIETE** cosas declaradas (**D2-a** a **D2-g**).

- **Línea base al cierre: suite 567/571**, en once lotes **cubriendo los 571 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **montado y verificado al abrir, ENTRE LOS ONCE LOTES y al
  cerrar** y el md5 de `index.html` **idéntico** antes y después (`ce4dd1ac`). Los rojos son
  **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, **y ninguno más**: **TC-358 salió
  VERDE**. **15/15 mutaciones dirigidas muertas** (2 min 43 s).
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 561/571 CON SEIS ROJOS MÁS, LOS SEIS MÍOS**, y por eso
  esa cifra no es la línea base: **TC-101**, **TC-105**, **TC-106** y **TC-107** medían el camino
  del puntaje propio en escenas **sin fármaco**, donde desde el commit 1 ya no hay banda —se les
  eligió «Otro», que no tiene columna y conserva exactamente esos cortes—; **TC-508 (H4)** barría
  el **documento entero** exigiendo que «cada 3 ciclos» no apareciera en ninguna parte, y lo cazó
  la fila de inmunoterapia, que ahora publica el suyo; y **TC-520** salió verde. **Los cinco se me
  pasaron del censo**, y es el modo de falla que este archivo ya documenta cuatro veces: grepeé
  por las palabras con que escribe la frase el caso que SÍ encontré.
- **Semgrep 124 WARNING / 0 ERROR**, la línea base. **Excel 440** columnas con las mismas claves.
  **Censo 946 ids, el mismo juego exacto que HEAD.** Sin huérfanos nuevos. 17 bloques de JS
  inline parsean.
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base
  exacta. El globo nuevo nace con `vinfo-btn-44` y no suma ni un hallazgo.
- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **valor por valor**: la cápsula diciendo «Elegí el fármaco para calcular el riesgo»
  y lo que lee el papel con su pastilla gris; la matriz en **14 filas × 7 columnas**; las **tres**
  copias de cada fila de monitoreo; el globo en **44×44 con los CINCO puntos dando el propio
  botón**, también a 390 px; su tarjeta **dentro de la pantalla** y con los dos folios; **cero**
  desplazamiento horizontal del cuerpo, **cero** textos recortados y **cero errores de consola y
  de página**. La única diferencia entre motores son **8 px** en el alto de la tarjeta a 768 px.
  La matriz scrollea dentro de su contenedor **sólo a 390 px**, en los dos motores, que es el
  patrón `overflow-x:auto` que el chequeo de celular acepta para siete columnas.
  ⚠️ **WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`: sin eso la sonda devuelve los cruces vacíos.
  ⚠️ **EL ÚNICO ERROR DE CONSOLA DEL ÁRBOL DE HEAD ES DEL ARNÉS**, no de la app: se carga desde
  una copia en el directorio temporal y ahí un recurso relativo no resuelve. El árbol vivo da cero.
- **A/B GLOBAL contra HEAD, 142 escenas: 44 cambian en superficie firmada y son las autorizadas**
  —las **cinco** sin fármaco, 19 de anti-VEGF, 19 de BCR-ABL y la de la nota g con anti-VEGF—.
  `ajeno` y `sf_vacio` dan **cero**, y las 19 de «Otro» cambian **sólo en pantalla**, en su línea
  de alcance.
- **NUEVE CASOS VIEJOS ADAPTADOS en el censo, y SEIS MÁS que destapó la corrida completa**, cada
  uno con el motivo escrito: **TC-72** (con una segunda lectura CON fármaco que le devuelve el
  denominador a «la hoja trae SU banda»), **TC-99**, **TC-100** y **TC-108** (los títulos y los
  cortes de las tablas A y C, y el aviso que dejó de ser cierto), **TC-471** y **TC-500** (el
  registro de globos, 71 → **72**), **TC-502** (las tarjetas sin botón, veintitrés →
  **veinticuatro**), **TC-535** (los globos de 44×44, catorce → **quince**), **TC-540** (D4
  **invertida** y E1 con fármaco), **TC-101**, **TC-105**, **TC-106**, **TC-107** y **TC-508**.
- **`index.html` pasó de 10,32 MB / 145.243 líneas a 10,34 MB / 145.470** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff son **332 líneas agregadas y 105 quitadas**.

### El visor con video, el motor de tercios del PDF y el papel sin guías — «IMÁGENES-3» (2026-10-31)

- **DIEZ commits, y las PARTES A, B y C se hicieron enteras. LA PARTE D NO SE HIZO.**
  `f6e3197` (1) · `69c9bff` (2) · `92ba745` (3) · `d172624` (4) · `822a261` (5) · `197df0d` (6)
  · `6c8dc0f` (7) · `2ea773e` (8) · `0eecc32` (9) · el de cobertura y documentación.
  Al empezar, `origin/main` = `HEAD` = **`07ffe05`**, el cierre de AJUSTES-2, ya publicado, con
  el pendrive `DISK_IMG` montado y listando nombres reales.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  ⚠️ **LA PARTE D —el diagrama 3D de la transposición de las grandes arterias— no se hizo, y no
  quedó a medias: ninguna línea de la app se tocó por ella.** Su **inventario 10a sí está
  hecho**, que es la mitad del trabajo, en `docs/PENDIENTES.md` → **IMG3-h**. Lo que decidió:
  **el campo `tga_tipo` tiene TRES valores** —`cctga`, `mustard`, `senning`— y la demo necesita
  dos ejes, anatomía (normal / d-TGA / L-TGA) y cirugía (ninguna / switch auricular / Jatene /
  Rastelli), así que **sólo DOS de sus seis escenarios son alcanzables** con los datos que la
  app tiene y la orden prohíbe campos guardados nuevos.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el estudio de prueba del médico pasa de
  CINCO hojas a TRES, y sus diagramas de cinco hojas a UNA.** Medido con el PDF generado de
  verdad: la CIA queda debajo de su texto de congénitas y Contractilidad+SGL, la mitral, el jet
  post-TAVI y la orejuela entran en una sola hoja de diagramas. Son las **dos hojas** que la
  demo aprobada da para ese preset.

- **TRES PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **El PPT del ESTUDIO ya incrustaba el video**, con su póster, su corrección de rotación y
     la salvedad del `.mov`. Lo que no incluía nada era el PPT de «Imágenes guardadas».
  2. **El FOP no tiene dibujo en la app**, contra lo que la demo supone: `fopPdfFilas()` es una
     tabla y no hay ninguna función que dibuje un FOP, censado.
  3. **La demo de tercios no lleva el sufijo `_aprobado`** con que la orden la nombra. Es el
     único de los tres así. Su contenido coincide con lo que la orden describe, así que se usó
     como referencia y se declara (**IMG3-d**).

- ⚠️ **EL BUCLE DEL VIDEO EN EL PPT NO SE PUEDE MARCAR, Y SE PARÓ.** Verificado por dos
  caminos: el XML de un paquete generado de verdad no tiene `<p:timing>`, ni `repeatCount`, ni
  `cMediaNode`; y los **477.529 bytes** del bundle de PptxGenJS 3.12.0 tienen **cero**
  apariciones de esos términos y de cualquier `loop*`. Escribirlo a mano post-procesando el zip
  es posible —la app ya post-procesa— pero no se puede verificar sin PowerPoint y este archivo
  ya documenta que una parte OOXML mal formada hace que PowerPoint pida reparar **y que al
  reparar BORRE la diapositiva completa**. → **IMG3-a**, con el XML que haría falta.

- **EL MOTOR DE TERCIOS ES DECLARATIVO Y SU EMPAQUETADOR ES PURO.** `PDF_DIAG_REG` es el único
  dueño del orden, del tamaño y de la familia; `PDF_DIAG_EXC` dice qué pareja no va junta; y
  `pdfDiagPack` devuelve las hojas sin tocar el documento, así que el acomodo se puede medir
  sin generar un PDF. **Nada se corta por CONSTRUCCIÓN y no por presupuesto**: el alto de la
  línea se mide primero y el dibujo se escala a lo que queda.
  **Comparado contra la demo aprobada corriendo las dos lógicas lado a lado: 12 casos, 12
  iguales, 0 distintos.**

- ⚠️ **DOS DEFECTOS QUE ENCONTRARON MIS PROPIOS CONTROLES NEGATIVOS, SOBRE MIS PROPIOS
  COMMITS.** `ete_seg_A1`..`ete_seg_P3` guardan un **entero** y el 0 es «Normal», así que la
  línea de la mitral publicaba «0: A1, A2, A3, P1, P2, P3» en el papel de un paciente sin una
  sola lesión marcada; y `im_grado` es **numérico con '0' de fábrica**, así que publicaba
  «Insuficiencia mitral · 0». Los dos rótulos salen hoy de los dueños que ya existían
  —`window.ETE_ESTADOS`, `_oaiImGrado()` y `_CC_GRADO`— y no de una segunda copia.

- **EL PODADOR DEL PPT DE CONGÉNITAS PODA, NO REESCRIBE, Y TIENE TRES GUARDAS.** Parte el texto
  por sus propios separadores y descarta el segmento que nombra una guía o lleva un verbo de
  conducta. Las tres guardas nacieron de una medición sobre mi primera versión: los dos puntos
  y «, que …» son separadores; la fuente se quita DENTRO del paréntesis; y **ningún número
  medido puede desaparecer**. Y la regla de cierre es **todo o nada**: si sobrevive un marcador,
  si se perdió un número o si no quedó nada, se devuelve el texto original y la sección queda
  **parada**. Medido sobre veintidós estados: **ocho podadas, una parada** —la miocardiopatía
  hipertrófica, que entrelaza la recomendación con un recuento (**IMG3-g**)— y trece sin cambio.

- ⚠️ **EL RÓTULO DE LA DIASTÓLICA SON NUEVE, NO UNO.** La orden nombra «Incompleto — ASE 2025»;
  medido, el mismo span publica además «DD Grado I/II/III», «DD — Presión elevada»,
  «Indeterminado», «Datos insuficientes», «Función diastólica normal» y la variante de BSE 2024,
  y las nueve llegan al PPT por la misma fila. Se podó en ese único punto y se declara
  (**IMG3-i**).

- **A/B contra HEAD con `_probe_ajustes2ab.mjs` —148 escenas, 166.040 claves y 65.120 celdas de
  Excel— en los nueve commits.** Los commits 1, 2, 3, 5, 7 y 9 dan **CERO** diferencias de
  superficie firmada; se declaran como CONTROL NEGATIVO cuando ninguna de esas escenas puede
  ejercitar el cambio, y su medición es la sonda dedicada. El commit 8 da **172 diferencias y
  todas son las autorizadas**: cuatro escenas pierden la cita de Beaubien-Souligny del informe
  (tres estilos) y del PDF, y 148 cambian la fila del PPT de «Incompleto — ASE 2025» a
  «Incompleto». **Excel: cero diferencias, 440 columnas, en los nueve.**

- **20/20 MUTACIONES DIRIGIDAS MUERTAS EN EL PRIMER BARRIDO**, en 1 min 41 s, en un worktree y
  nunca sobre el vivo, con guarda de md5. **El reparto es limpio**: las ocho de la Parte A matan
  SOLO a TC-558, las seis de la Parte B SOLO a TC-559 y las seis de la Parte C SOLO a TC-560.
  **Cuatro no revierten nada: la aplican de más**, porque las condiciones que las matan son
  controles negativos.

- **CUATRO CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-212** (el filtro de
  slots cambió de nombre al retirarse la página «Imágenes adjuntas»; el invariante —el video no
  sale en el PDF— no se movió), **TC-490** (el bull's eye ya no lleva una banda en mayúsculas
  sino el rótulo de su franja), **TC-554** (B3 a B8: el esquema de la orejuela y el dibujo de la
  bicúspide son tiles del motor, y **B7 queda INVERTIDA** porque la tabla ya no va a la derecha
  sino que es una línea debajo) y **TC-557** (A9 **invertida** —la cápsula ya no nombra la
  guía— y G2 adaptada —la salvedad se queda y la cita salió—).
  ⚠️ **TC-554 falló primero por mi propio arnés**: buscaba el rótulo de la bicúspide con la
  PRIMERA aparición, y el cuerpo del informe la nombra con las mismas palabras. Hay que buscarlo
  en la hoja de diagramas.

- **Línea base al cierre: suite 569/575**, en once lotes **cubriendo los 575 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **montado y verificado al abrir, ENTRE LOS ONCE LOTES y al
  cerrar** y el md5 de `index.html` **idéntico** antes y después (`899080d4`). Los rojos son
  **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-182 y TC-551**, los dos
  intermitentes que la orden anticipa: **repetidos, los dos salen VERDE**. **TC-358 salió
  VERDE**, y TC-262, TC-419 y TC-507 también.
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 565/575 CON CUATRO ROJOS MÁS, LOS CUATRO MÍOS**, y por
  eso esa cifra no es la línea base: TC-212, TC-490, TC-554 y TC-557. Los cuatro están adaptados
  y la cifra de arriba sale de la corrida limpia, de una sola pasada con el archivo de tests
  final.
- **Semgrep 124 WARNING / 0 ERROR**, la línea base. **Excel 440** columnas con las mismas claves,
  clave por clave, en los nueve A/B. **Censo 1023 → 1024**: el +1 cae en «Fuera del estudio (por
  prefijo)» (92 → 93), que es el `<select>` de velocidad del visor con prefijo `ig-`; **cero
  campos guardados nuevos y cero columnas de Excel**. Sin huérfanos nuevos. 17 bloques de JS
  inline parsean.
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base
  exacta que la orden declara.
- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px
  × dos temas), con su CONTROL contra HEAD: **cero errores de consola y de página en los dos
  motores y en los dos árboles**, cero desplazamiento horizontal del cuerpo, 17 de 25 pestañas
  con caja y **los mismos dos textos recortados que HEAD** —los dos `.pac-id-mk`, preexistentes—.
  La cápsula sin guía en los dieciséis; el ⓘ pasa de 356×420 a 356×530 y gana la Figura 44 y
  **los dos folios**, dentro de la pantalla en los dieciséis; el reproductor y sus controles, que
  en HEAD no existen, miden 413×310 y 413×44; «Medir» oculto sobre un video en los dieciséis; y
  el modo grande lleva el modal de 441 a 1100 px a 1440, de 434 a 972 a 1000 y de 434 a 740 a
  768, con el botón **oculto a 390** en los dos motores. Las diferencias entre motores son 2 px
  en el video y 2 px en el botón.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
  ⚠️ **Y LA SONDA MIDIÓ SOBRE UN DENOMINADOR VACÍO DOS VECES ANTES DE SERVIR**: el visor vive
  dentro de la pestaña Guardados —que no es un `.tab-btn` sino el botón flotante
  `#floatBtnGuardados`— y su superposición, aunque sea `position:fixed`, informa 0×0 mientras su
  contenedor está en `display:none`; y el globo es `#vinfo-card`, no `.vinfo-card`. Los dieciséis
  cruces daban «todo bien» sobre cajas de cero.

- **`index.html` pasó de 10,37 MB / 145.915 líneas a 10,40 MB / 146.362** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff son **885 líneas agregadas y 438 quitadas**.

- **Dónde está todo:** `docs/mapa/img3-visor-tercios.md` (**mapa NUEVO**, 13,4 KB), las fichas
  de los tres casos en `docs/mapa/tests-fichas-558.md` (**archivo propio**), **cuatro mapas con
  un puntero cada uno** —medidos ANTES de escribir, todos por debajo de 34 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda IMÁGENES-3» con la única cita agregada y la tabla de lo
  que salió de cada superficie y dónde sigue estando, y `docs/PENDIENTES.md` → **DIEZ** cosas
  declaradas (**IMG3-a** a **IMG3-j**) más el cierre parcial de **AJ2-e**.
  ⚠️ **`congenitas-otros.md` (34,5 KB) NO se tocó**, que es lo que la orden pide.

### La coartación sin guías, los diagramas guardados y el barrido del papel — «AJUSTES-2» (2026-10-31)

- **SIETE commits, y los SEIS de código se hicieron enteros.** `ed6ab4d` (1) · `3e40fbb` (2) ·
  `8376605` (3) · `26e7dd3` (4) · `93cc85c` (5) · `aff0b87` (6) · el de cobertura y
  documentación. Sello **`v20261031-0106`**, md5 de `index.html` **`5d3a6fe2`**. Al empezar,
  `origin/main` = `HEAD` = **`420a67b`**, el cierre de la tanda D2, ya publicado, con el pendrive
  `DISK_IMG` montado y listando nombres reales.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **EL PRINCIPIO QUE GOBIERNA LA TANDA, del médico, el 30/10:** *el papel describe; las guías,
  las clases, los niveles, las tablas, los folios y las recomendaciones viven en la Evidencia, en
  Referencias o en el ⓘ.* Las cuatro superficies: informe, EN SUMA, PDF y PPT.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el informe firmado de una coartación mandaba
  a medir el gradiente pico-pico invasivo y citaba la ESC 2024 con su figura y su folio.** Medido
  en HEAD con la escena del médico —istmo 8 mm, gradiente medio 25 mmHg, sección integrada—: el
  censo de las cuatro superficies daba «ESC 2024» 8 veces, «Figura 44» 4, «folio» 4 y «medir el
  gradiente pico-pico invasivo» 4; con indicación Clase I, «Clase I» 7 y «Tabla 69» 4. Hoy el
  informe dice **«Coartación de aorta nativa. Diámetro del istmo 8 mm. Gradiente medio 25 mmHg,
  con criterios de significación por Doppler (mayor de 20 mmHg).»**, literal al ejemplo que dio.
  **Cierra AO2-b y AO2-c.**

- **UN DUEÑO ÚNICO, `coaPapel`, Y NO UN PARCHE POR EMISOR.** `coaConclusion().txt` lo leen SEIS
  consumidores y dos no son papel —la cápsula `coa-concl` y el panel de Evidencia—, que
  **conservan la cita**, igual que la Parte B de la TANDA NOCTURNA decidió para la raíz aórtica.
  Verificado: la sección de Evidencia, la tarjeta `evTarjetaCoa` y la cápsula salen **idénticas a
  HEAD**, y el censo de sus diecisiete marcadores da el mismo número en los dos árboles.

- ⚠️ **LA APOSICIÓN HUBO QUE MOVERLA A p[0], Y SIN ESO SE PERDÍA UNA PALABRA DEL PAPEL.** Hasta
  hoy «nativa» viajaba DENTRO de `c.txt`: retirarlo sin mover la aposición habría hecho que el
  informe firmado de una coartación nativa dejara de decir que lo es. Medido en HEAD: su p[0]
  decía «Coartación de aorta.» a secas.

- ⚠️ **EL A/B DESTAPÓ UN DEFECTO DEL PROPIO COMMIT 1.** Con el texto escrito a mano en el mapa
  `DX`, la escena de la **cola diastólica sola** publicaba en el EN SUMA «(mayor de 20 mmHg)»
  sobre un paciente **sin gradiente medio medido**, mientras el informe decía «(cola diastólica
  con gradiente no concluyente)». Eran dos voces; hoy el EN SUMA lee el dueño único.

- ⚠️ **Y REVIERTE, SÓLO PARA LA COARTACIÓN, LA DECISIÓN DEL 2026-09-10 SOBRE EL PPT**, que su
  propio comentario todavía explicaba. El principio nuevo nombra las cuatro superficies. Las
  otras once entradas de `CC_PPT` quedan literales → **AJ2-e**.

- **EL SEGUNDO DEFECTO DEL MÉDICO, REPRODUCIDO Y MEDIDO: con Config prendido y cuatro diagramas
  incluidos en el PDF, el estudio guardado quedaba con CERO imágenes y CERO esquemas.** Los
  cuatro toggles sólo levantan un flag; el PDF rasteriza su canvas al generarse y nadie escribe
  esa imagen. Hoy `diagGuardarIncluidos()` los guarda: **0 → 4**, con su marca «esquema», y la
  pantalla «Imágenes guardadas» los ve (índice 1 → **5 slots**, cuatro con marca).
  ⚠️ **VAN A `esqs` Y NO A `imgSlots`, y eso es lo que deja el papel quieto**: cada uno ya tiene
  su sección propia en el PDF, así que entre los slots se imprimirían **dos veces**.

- **«Guardar imágenes con los estudios» viene PRENDIDO cuando nadie lo tocó**, y el valor ya
  elegido se respeta: clave ausente → `false` en HEAD y **`true`** hoy; `'0'` → false en los dos.
  La función sólo LEE: **ningún estudio ya guardado cambia**.

- **CIERRA AJ1-g: `noPdf` entra en las DOS allowlists de IndexedDB.** Son dos listas, y agregarla
  a una sola deja el defecto en pie por el otro lado —la lección del D-11—. Medido: HEAD pierde
  la marca al guardar y reabrir (0), hoy la conserva (1). **Es la única propiedad que esta tanda
  agrega**, y es la que la orden autoriza.

- ⚠️ **LA OREJUELA: EL PDF SIEMPRE FUE DETERMINISTA; LO QUE NO LO ERA ES LO QUE EL MÉDICO CREE.**
  Matriz de **trece combinaciones generando el PDF de verdad**: lo incluido sale en las trece.
  Al reabrir, el slot vuelve **sin `esqClave`** —no está en ninguna allowlist—, el botón anuncia
  «📄 Incluir» sobre un dibujo que ya está, y **al tocarlo el PDF lo imprime DOS VECES** (caso L).
  `esqSlotIdx` adopta el huérfano cuando hay exactamente uno; la causa raíz se declara en
  **AJ2-a** porque persistir la clave serían dos propiedades más.

- ⚠️ **UN SOLAPE TÁCTIL REAL EN LA FILA DE MINIATURAS, Y NO ERA COSMÉTICO.** De los cinco puntos
  del ⓘ nuevo, la esquina inferior izquierda devolvía la **✕ de la primera miniatura**: su
  `::after` se extiende 14 px hacia **arriba**, donde está la cabecera. **Tocar esa esquina
  quitaba una imagen del PDF cuando el médico quería abrir la ayuda.**

- **LA PREMISA DE 4b ERA FALSA: EL ARRASTRE YA EXISTÍA**, y funciona. Medido con gestos reales,
  tres capturas de colores distintos y el PDF generado de verdad: la ▶ mueve, el arrastre mueve
  y **el PDF imprime en ese mismo orden**. Las flechas dan 5/5 puntos con área táctil de 27×41.

- **LOS TRES ⓘ DEL TRIV DICEN LO MISMO PORQUE LEEN EL MISMO DUEÑO** (`TRIV_DTI_LEE` y
  `TRIV_DTI_FUENTE`). Censo de las doce frases: función del VD **0/12 → 12/12**, tamaño **0/12**
  y **remite**, el globo idéntico. La fila del Doppler tricúspide **reusa la clave `vd-triv`**:
  dos botones sobre el mismo registro es literalmente «el mismo texto».

- **EL BARRIDO DEL PAPEL, CON SU DENOMINADOR: 148 escenas y 3.072.850 caracteres** —informe en
  tres estilos, EN SUMA en tres, PDF en seis plantillas y PPT—. **El papel está casi limpio:
  cinco menciones.** Se retiran las **dos** que son conducta dirigida al médico —«El grado VEXUS
  debe integrarse con la clínica» (que `COR-a` ya declaraba) y la de la insuficiencia mitral
  severa—, **las dos con su contenido ya en la Evidencia, verificado antes de retirarlas**. Las
  otras tres se listan → **AJ2-c**.
  ⚠️ **La lista de palabras de la orden no cubría las citas por AUTOR ni por REVISTA**, y la de
  Beaubien-Souligny sólo apareció al ampliar el censo con esos dos patrones.

- **VERIFICADO EN IMAGEN**: ESC 2024 de aorta, edición **inglesa**, hoja 112 → folio **3649**
  (folio = hoja + 3537, comprobado contra el índice). Los **seis** criterios de la Figura 44, y el
  **E** es «Mean gradient >20 mmHg across the CoA region on DUS», **estricto**.
  ⚠️ **El «>35 mmHg peak gradient» que la extracción de texto devuelve es un rótulo DENTRO de la
  imagen del panel E, no un criterio de la lista**: el comentario del trabajo H tiene razón.
  ⚠️ **No se agregó ninguna cita**: la Evidencia y el ⓘ ya tenían todo lo que salió del papel.

- **18/18 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5.
  **Cuatro de las dieciocho no revierten nada: la aplican de más**, porque las condiciones que
  las matan son controles negativos. La **11** rompe las dos allowlists de `noPdf` a la vez y la
  **02** y la **03** son el mismo error por dos puertas.
  ⚠️ **LA 05 SOBREVIVIÓ DOS VECES, Y LAS DOS POR LA MISMA RAZÓN.** Ninguna condición miraba el
  **PPT**. El primer arreglo **reproducía la expresión** del emisor en vez de ejecutarlo, así que
  medía código escrito en el caso y no el de la app — un control que no podía fallar. Hoy
  **(A10)** y **(A11)** espían `PptxGenJS` y generan el mazo.

- **SIETE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-113** (el EN SUMA ya no
  declara la clase, **invertida**), **TC-145** (el toggle arranca prendido, **invertida** y
  ampliada a los tres estados), **TC-175** (dos: la hoja sin el recuadro «Segun la guia», y la
  que compara contra el clasificador pasa a exigir que el texto de **pantalla** no esté),
  **TC-471** y **TC-500** (el registro de globos, 72 → **73**), **TC-502** (las tarjetas sin
  botón, 24 → **25**), **TC-535** (los globos de 44×44, quince → **diecisiete**) y **TC-551**
  (F2, el valor por omisión, **invertida** conservando lo que vigila).
  ⚠️ **TRES DE LOS SIETE LOS DESTAPÓ LA CORRIDA COMPLETA, NO EL CENSO** —TC-145, TC-175 y
  TC-551—, y es el modo de falla que este archivo ya documenta cinco veces.

- ⚠️ **LA BARRA SIMPLE DENTRO DE UN TEMPLATE, DOS VECES, Y UNA ROMPIÓ UN CASO ENTERO.** Un
  `split` por salto de línea escrito con una barra llega como un salto LITERAL entre comillas y
  tira «Invalid or unexpected token»: **TC-113 caía por excepción**, no por su condición. Y en
  otra, una clase de espacio llegó como la letra ese. **Las dos se cerraron no usando ninguna
  expresión regular.** Más su hermana nueva: **la secuencia de cierre de comentario dentro de un
  literal de expresión regular cierra el bloque `/* */` antes de tiempo.**

- ⚠️ **EL ACENTO GRAVE DENTRO DE UN COMENTARIO, CINCO VECES, EN CUATRO ARCHIVOS.**
  `check_backticks.py` **no cazó ninguna**; **`node --check` las cazó todas**. Es la séptima
  tanda seguida que lo paga.

- **Dónde está todo:** `docs/mapa/aj2-coartacion-diagramas.md` (**mapa NUEVO**, 21,1 KB), **siete
  mapas con un puntero cada uno** —medidos ANTES de escribir, todos por debajo de 33 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda AJUSTES-2» con la Figura 44 transcripta criterio por
  criterio y su tabla «Cambios de evidencia» de doce filas, y `docs/PENDIENTES.md` → **SIETE**
  cosas declaradas (**AJ2-a** a **AJ2-g**) más el cierre de **AO2-b**, **AO2-c** y **AJ1-a**.
  ⚠️ **`congenitas-otros.md` (34,5 KB) NO se tocó**: está a 500 bytes del techo y la coartación
  vive ahí. **La próxima tanda que necesite escribirle tiene que partirlo** → **AJ2-b**.

### Jatene y Rastelli, y la Evidencia de congénitas — «TGA-2» (2026-10-31)

- **SEIS commits, y los cinco de código se hicieron enteros.** `5d0d942` (T2-1) · `1f60647` (T2-2)
  · (T2-3) · `d902f59` (T2-4) · `d6ddb02` (T2-5) · el de cobertura y documentación. Al empezar,
  `origin/main` = `HEAD` = **`61f6968`**, el cierre de la tanda TGA, ya publicado, con md5 de
  `index.html` **`bb9739ab`** y el pendrive `DISK_IMG` montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  Cierra **TGA-a** y, a medias, **IMG3-g**.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: la d-TGA operada con switch arterial o con
  Rastelli no se podía cargar, porque el informe firmado habría afirmado que el ventrículo derecho
  es el sistémico y en esas dos cirugías es el IZQUIERDO.** La TGA-1 los había parado por eso. La
  decisión del médico del 31/10 lo resuelve **por el lado del texto y no del campo**: con esas dos
  cirugías el papel DESCRIBE —tipo, cirugía y datos neutros cargados— y no interpreta.

- ⚠️ **TRES CAMPOS QUEDAN PARADOS Y SE REPORTAN, que es lo que la orden pide textualmente.**
  `tga_func_vd`, `vd_bas` e `it_grado`: la redacción que esta sección tiene para los tres nombra el
  ventrículo o la válvula **sistémico**, y escribirles otra es contenido clínico nuevo. El valor no
  se borra —la fila de la función se esconde sin vaciarla— y el grado de insuficiencia tricuspídea
  sigue saliendo por Válvulas. → **TGA2-a**.

- **`TGA_CIR_OP` ES LA PIEZA NUEVA, Y ES UN DUEÑO ÚNICO.** La traducción al vocabulario de la demo
  estaba escrita **dos veces** —en `_tga3dClave` y como la condición `o !== 'auricular'` de
  `tga3dEscena`—. Con dos valores alcanzaba; con cuatro, esa forma manda `jatene` y `rastelli` a la
  rama de la d-TGA sin operar, con la aorta del color equivocado.
  **La comparación obligatoria con la demo da 30 de 30 escenarios IGUALES**, contra 20 de 30 en la
  TGA-1.

- **CUATRO SECCIONES DEL PANEL DE EVIDENCIA PREGUNTAN, CON EL MOLDE DE LA BICÚSPIDE Y SIN
  REESCRIBIRLO**: la transposición (nueva), la CIA, la CIV y la prevención de muerte súbita de la
  miocardiopatía hipertrófica (nueva). **TREINTA Y OCHO preguntas distintas** de tres estados: 19 en
  la transposición —7 con el switch auricular, 4 con el arterial, 6 con el Rastelli y 3 con la
  ccTGA, de las que la de la fracción de eyección del ventrículo sistémico la comparten el switch
  auricular y la ccTGA—, 9 en la CIA, 7 en la CIV y 3 en la muerte súbita. El panel muestra sólo
  las del escenario cargado. Las recomendaciones van agrupadas por situación, con su clase, su
  nivel, su hoja y su folio.

- **DÓNDE SE PERSISTEN LAS RESPUESTAS, que es lo que la orden pide reportar: en `_indClin`**, la
  memoria efímera del panel. Es el MISMO mecanismo con el que la Evidencia de la bicúspide guarda
  las suyas cuando el campo está vacío; **la diferencia es que la bicúspide tiene además seis campos
  guardados** (`vab_fr_*`) y estas cuatro **no tienen ninguno**, porque la orden prohíbe agregarlos.
  Pasan igual por `_indOrigen` con el valor de origen en `null`, para que el día que alguna tenga
  campo propio no haya que reescribir la fila. El precio está en **TGA2-f**.

- ⚠️ **LA GUÍA NO PUBLICA NINGUNA TABLA DE INTERVENCIÓN PARA LA d-TGA NO OPERADA DEL ADULTO**, y es
  un hallazgo, no un olvido: las tres situaciones que la ESC 2020 trata en el adulto son el switch
  auricular, el switch arterial y el Rastelli. Con «sin cirugía» o sin dato el panel lo DICE.
  Tampoco hay recomendación propia de la transposición para el ejercicio, el embarazo ni la
  profilaxis de endocarditis: el apartado 4.12.6 los remite a los apartados generales.

- ⚠️ **LA PARTE C SE HIZO A MEDIAS, Y LO QUE LA PARA ES UNA FUENTE QUE NO ESTÁ.** La línea del PPT
  de la miocardiopatía hipertrófica cita DOS guías: la ESC —que está, y cuya Tabla 23 entró entera
  en la Evidencia como sección nueva— y la **AHA/ACC 2020**, que **NO está en la biblioteca**: lo
  que hay en `11_Miocardiopatias` es la de **2024**. La línea es UNA sola cadena con las dos
  mitades, así que podar la de la ESC publicaría media recomendación. → **TGA2-c**; **IMG3-g** sigue
  abierto.

- ⚠️ **EL A/B GENERAL DA UN CERO VACUO SOBRE EL COMMIT 5, Y SE DECLARA.** Ninguna de las 163 escenas
  carga una miocardiopatía hipertrófica, así que su «cero diferencias» no distingue «no toca el
  papel» de «la sonda no mira donde el cambio puede actuar». La medición que vale es
  `scripts/_probe_t2c.mjs`, con la cardiopatía cargada.

- **A/B contra HEAD, UNO POR COMMIT, con 163 escenas, 184.337 claves y 71.883 celdas de Excel.**
  Commit 1: **62 diferencias de superficie firmada y las 62 están en las CINCO escenas de Jatene y
  Rastelli**; las otras 158 —`tgaMus`, `tgaSen`, `tgaCc`, `tgaDtga`, `tgaDtgaAur`, `tgaMusCir`,
  `tgaComs`, `tgaVacio`, `ajeno`, `vacio`— dan **cero**. Commits 2, 3, 4 y 5: **CERO** diferencias
  de superficie firmada, con el control positivo de pantalla al lado (42, 15, 2 y 0 nodos del
  panel). En la escena sin integrar lo único que cambia es el valor del campo y su columna, no el
  texto: la compuerta de la casilla sigue en pie.

- **14/14 MUTACIONES DIRIGIDAS MUERTAS EN EL PRIMER BARRIDO**, en worktree y nunca sobre el vivo,
  con guarda de md5 antes y después. **Tres de las catorce no revierten nada: la aplican de más**
  —el switch auricular cayendo también en la rama descriptiva, esconder la fila borrando el valor, y
  «sin dato» contando como «no»—, porque las condiciones que las matan son **controles negativos**.
  Cada mutación declara **su** caso: TC-564 el papel y el dibujo, TC-565 el panel de la TGA, TC-566
  los de la CIA y la CIV, TC-567 el de la muerte súbita.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS COSTÓ TRES CORRIDAS, Y ES LA OCTAVA TANDA
  SEGUIDA QUE LO PAGA.** Siempre igual: un identificador entre acentos graves dentro del comentario
  de un caso, y el cuerpo de un caso es un template literal. `check_backticks.py` **no cazó
  ninguna** —sus cuatro hallazgos siguen siendo los de `_probe_aj2.mjs`, preexistentes y falsos—;
  **`node --check` las cazó todas**.

- ⚠️ **TRES CONDICIONES DE MIS PROPIOS CASOS MEDÍAN SOBRE UN DENOMINADOR INCOMPLETO.** El **título**
  del bloque del panel es texto de la pantalla y lleva la hoja y el folio, y la primera versión de
  las tres sondas sólo juntaba las líneas: «el panel no cita el folio 592» daba cero sobre una
  cadena que **sí** estaba. Y en TC-564 el color rojo de la demo se escribió **14173499** cuando es
  **14172987** (`0xd8433b`).

- **CUATRO CASOS NUEVOS, TC-564 a TC-567**, con sus denominadores y sus controles negativos, y los
  cuatro **caen contra HEAD** sin caer por excepción: TC-564 por 24 condiciones, TC-566 por 19, y
  TC-565 y TC-567 por su **denominador** —contra `61f6968` esas dos secciones del panel no existen,
  y el caso lo dice en vez de reventar—.
- **TRES CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-561** (el selector de
  cirugía pasa de dos valores a cuatro, y su control negativo cambia «Jatene» por «Nikaidoh», que
  es una variante real que la app no publica; gana además (E4b), el round-trip de los dos valores
  nuevos), **TC-322** (las secciones del panel con escenario propio, y la escena B pasa de DOS a
  TRES bibliografías porque esa miocardiopatía hipertrófica abre ahora dos secciones) y **TC-533**
  (las secciones de `IND_SECS`, de 31 a 33).
  ⚠️ **TC-561 LO DESTAPÓ LA CORRIDA COMPLETA Y NO EL CENSO**, y es el modo de falla que este
  archivo ya documenta seis veces: grepeé por el nombre de lo que toqué y ese caso afirma el
  vocabulario con otras palabras.
- ⚠️ **LOS BOTONES DE RESPUESTA DEL PANEL MIDEN 22 px Y EL CÓDIGO DICE 44, Y ES PREEXISTENTE.**
  Medido en los dos árboles: los 24 que la bicúspide ya tenía dan 22 px con `min-height: 0`. El
  comentario de `_indCtrlHTML` afirma que la regla táctil global de 44 px los gobierna, y **no
  gana**. `check_mobile.js` no lo ve porque el panel es un modal que ese barrido no abre. Lo que
  esta tanda cambia es la escala: las preguntas pasan de 24 a cincuenta. → **TGA2-h**.
- **Línea base al cierre: suite 576/582**, en once lotes **cubriendo los 582 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **verificado al abrir, ENTRE LOS ONCE LOTES y al cerrar** y
  el md5 de `index.html` **idéntico** antes y después (`4379ca6b`). Los rojos son **TC-223,
  TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-182 y TC-551**, los dos intermitentes
  que la orden anticipa: **repetidos aislados, los dos salen VERDE**. **TC-358 y TC-557 salieron
  VERDES.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 576/582 CON UN ROJO MÁS, QUE ERA MÍO**, y por eso esa
  cifra no es la línea base: **TC-561** afirmaba que el selector de cirugía tiene «SOLO los dos
  valores que esta tanda publica» y usaba «jatene» como valor inventado en su control negativo.
  Está adaptado y la cifra de arriba sale de la corrida **limpia**, de una sola pasada con el
  archivo de tests final.
- **14/14 MUTACIONES DIRIGIDAS MUERTAS EN EL PRIMER BARRIDO**, en worktree y nunca sobre el vivo,
  con guarda de md5 antes y después.
- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Excel 441** columnas con
  las mismas claves, clave por clave, en los cinco A/B. **Campos guardados 963, el mismo juego
  exacto que HEAD**: cero nuevos y cero perdidos, medido por diferencia de ids. **Sin huérfanos
  nuevos.** 17 bloques de JS inline parsean.
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base exacta.
- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **valor por valor**: el título sin «corregida», el párrafo sin afirmar cuál es el
  ventrículo sistémico, el selector de cirugía con sus cinco opciones, la fila de función del VD
  **escondida** con el valor **intacto** en «moderada», el papel sin nombrar el ventrículo
  sistémico, la sección de la transposición en el panel con sus cuatro preguntas y su folio, **cero
  desplazamiento horizontal**, **cero textos recortados** y **CERO errores de consola y de página
  en los dos motores**. La única diferencia entre motores es ninguna: el panel mide 818×745 en los
  dos. ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
- **`index.html` pasó de 10,47 MB / 147.337 líneas a 10,54 MB / 148.070** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff son **792 líneas agregadas y 59 quitadas**.
  Sello **`v20261031-1138`**, md5 **`4379ca6b`**.

- **Dónde está todo:** `docs/mapa/t2-evidencia-congenitas.md` (**mapa NUEVO**, 12,4 KB), las fichas
  de los cuatro casos en `docs/mapa/tests-fichas-564.md` (**archivo propio**, porque
  `tests-fichas.md` está en 34,2 KB), **tres mapas con un puntero cada uno** —medidos ANTES de
  escribir: `tga-diagrama-3d.md` 13,4 → 14,9 KB, `panel-evidencia.md` 34,1 → 34,5 y `tests.md`
  34,4 → 34,6—, `docs/fuentes/FUENTES.md` → «La tanda TGA-2» con las **siete tablas transcriptas
  fila por fila en imagen**, las dos reglas de folio comprobadas en el pie impreso y la tabla
  «Cambios de evidencia» de quince filas, y `docs/PENDIENTES.md` → **OCHO** cosas declaradas
  (**TGA2-a** a **TGA2-h**) más el cierre de **TGA-a** y el cierre parcial de **IMG3-g**.
  ⚠️ **`congenitas-otros.md` (34,5 KB) NO se tocó**, que es lo que la orden pide. `panel-evidencia.md`
  y `tests.md` quedan los dos a menos de 500 bytes del techo: **la próxima tanda que necesite
  escribirles tiene que partirlos** → **TGA2-g**.

### El bucle del video, los botones de la Evidencia y la miocardiopatía del PPT — «AJUSTES-3» (2026-10-31)

- **SEIS commits, y los CINCO de código y documentación se hicieron enteros.** `bcc333b` (AJ3-1) ·
  `37fe3ab` (AJ3-2) · `d851260` (AJ3-3) · `eaea958` (AJ3-4) · `ddb3fa5` (AJ3-5) · el de cobertura y
  documentación. Al empezar, `origin/main` = `HEAD` = **`8d37a65`**, el cierre de TGA-2, ya
  publicado, con md5 de `index.html` **`4379ca6b`** y el pendrive `DISK_IMG` montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  Cierra **IMG3-a**, **TGA2-b** y, en parte, **IMG3-g**.

- **EL BUCLE DEL VIDEO ENTRA EN LOS DOS CAMINOS DE PPT, Y LO QUE LO SOSTIENE NO ES LA NORMA: ES LA
  PRUEBA.** La tanda TGA generó fuera del producto un `.pptx` con el árbol de tiempo escrito a
  mano y **el médico lo abrió en PowerPoint el 31/10/2026: no pidió reparar y el video se repite
  sin parar.** `_pptxBucleVideos` porta ese ajuste pieza por pieza, como post-proceso dentro de
  `_pptxDescargarSaneado`, que es el **único punto de descarga** de los tres exportadores.
  **El `p:timing` que la app escribe es IDÉNTICO CARÁCTER POR CARÁCTER al del experimento, salvo
  el VALOR del `spid`**, medido en los dos caminos contra el archivo de referencia leído sin
  modificarlo. La diferencia es deliberada: el experimento cableaba `10` y la app usa `max + 1`,
  porque un 10 cableado falla en una diapositiva con diez shapes. → **AJ3-f**.

- ⚠️ **FALLA CERRADA, AL CONTRARIO QUE LA PODA DE PARTES DE LA MISMA FUNCIÓN.** Una parte OOXML mal
  formada no abre con una advertencia: PowerPoint pide reparar y **al reparar borra la diapositiva
  completa** —el defecto que `_pptHex` documenta, con dos hojas en blanco reportadas el
  2026-09-16—. Las diapositivas se arman en memoria, se validan **todas** con parseo estricto, y
  recién entonces se escriben: si una no valida, **ninguna** se escribe, el mazo sale sin bucle
  como hasta hoy y se avisa. Medido con `DOMParser` roto: 0 diapositivas con `p:timing`, el video
  incrustado igual, 0 XML rotos y el aviso dicho.

- ⚠️ **UN `spid` DUPLICADO NO SE PUEDE USAR, Y LA LIBRERÍA LOS EMITE.** PptxGenJS 3.12.0 da el mismo
  `id` a dos shapes de la misma diapositiva —el segundo cuadro de texto y el video salen los dos
  con `id="3"`—. Al video se le asigna un id libre de su diapositiva; es seguro, porque ese `id`
  es local y lo referencian sólo el árbol de tiempo y las animaciones, y esta librería no escribe
  ninguna.

- **«IMÁGENES GUARDADAS» PASA A INCRUSTAR EL CLIP COMPLETO**, en la celda que le toca de la grilla
  de 1, 2 o 4 por diapositiva, con el cuadro ya tapado de póster. El primer cuadro queda como
  **caída**, con su motivo en la línea de resultado. Con eso cambiaron el **aviso de privacidad**
  —decía que de un video iba sólo su primer cuadro, y dejó de ser cierto— y entraron los **dos
  umbrales de tamaño**, por las MISMAS constantes que el otro camino.
  `_pptVideoMp4Preparar` es el **dueño único** de «blob → lo que `addMedia` necesita»: se extrajo
  al abrir el segundo camino, porque la corrección de rotación y la salvedad del `.mov` con una
  copia en cada lado quedan atrás en cuanto una cambie.

- ⚠️ **EL TEXTO «el video no arranca solo» DEL PPT NO SE TOCÓ, Y ES DELIBERADO.** Sigue siendo
  cierto —el bucle arranca al clic— y decir «se repite» mentiría el día que el bucle caiga.
  → **AJ3-c**.

- ⚠️ **LA PREMISA DEL COMMIT 2 ERA PARCIALMENTE FALSA, Y ESTÁ MEDIDA EN DIECISÉIS CRUCES.** La orden
  dice que los botones de respuesta del panel «miden 22 px aunque el código afirma 44», como si la
  regla táctil no ganara. Medido con los DOS punteros × 1440/1000/768/390 px × dos temas:

  | | alto | con 44×44 | encima de otro control |
  |---|---|---|---|
  | puntero **grueso** (dedo, tablet) — HEAD | 44 | 39/39 | **0** |
  | puntero **fino** (mouse) — HEAD | **22** | 0/39 | **5** |
  | los dos, después | **44** | **39/39** | **0** |

  O sea que **en el dispositivo que importa ya estaban bien**: los 22 px con mouse los ponía una
  media query deliberada, con su decisión escrita. Lo que SÍ era un defecto son esos **cinco**
  botones con parte de su cuadrado táctil encima de un vecino —las dos preguntas del HFA-PEFF—,
  que es justo lo que la orden prohíbe.

- **DOS MEDICIONES DECIDIERON EL MECANISMO, Y DESCARTARON EL `::after`.** (1) **El panel no crece**:
  con el botón en 22 y en 44 mide LO MISMO —818×745 a 1440 px y 364×729 a 390—, porque las filas
  de la tabla ya tenían ese alto. (2) **Con 22 px hay solape y con 44 no**: agrandar el área con
  un `::after` —el patrón de `.pac-id-mk`— habría **tapado** el control vecino. No revierte la
  decisión del 2026-09-25 («se conserva el piso y lo que baja es el PESO VISUAL»): la cumple.
  El ⓘ de un término se queda en la media query, y ahora es el único.

- **EL ESTADO DEJÓ DE DEPENDER SÓLO DEL COLOR.** `aria-pressed` cubría al lector de pantalla; el
  botón marcado lleva además **`✓ ` delante del rótulo**, que es una diferencia de FORMA.

- **LA CLÁUSULA DE LA IT SISTÉMICA VUELVE, LITERAL.** «La válvula tricúspide de estos pacientes es
  la auriculoventricular sistémica: su insuficiencia pesa como pesaría una mitral.», ubicada en
  `61f6968` línea 18038, al `ojo` del globo `tga-3d`, que es el **único ⓘ de `#sacc-cc-tga`**.
  Verificado que aparece **carácter por carácter**, una sola vez, a 1440 y a 390 px. Va rotulada
  **«Criterio de EcoSmart»** porque la analogía no está en ninguna hoja leída —lo que el registro
  sí tiene es la recomendación 4 de la ESC 2020, folio 619, IIa · C, que respalda el CONCEPTO— y
  con el antecedente explicitado AFUERA. **Sin folio, sin clase y sin nombrar la guía.**
  Y se verificó que el resto del párrafo retirado **no se había perdido**: lo dicen
  `TGA3D_INFO.ltga` y `.mus`. **TGA2-b cerrado.**

- **LA AHA/ACC 2024 SE LEYÓ EN IMAGEN, Y COINCIDE CON LO QUE LA APP APLICA.** Ommen y cols.,
  *Circulation* 2024;149:e1239-e1311, **hoja 29, folio e1267**, apartado 7.2. **Regla de folio:
  folio = hoja + 1238, comprobada en el PIE IMPRESO de las hojas 26 y 29** («June 4, 2024  e1264»
  y «June 4, 2024  e1267»). Recomendación 3, **COR 2a · B-NR**, «it is reasonable to offer an ICD»
  con **≥1 factor mayor**, y los **cinco** factores cotejados uno por uno contra los cinco de
  `mchAHA`. La recomendación 6, COR 2b, es el árbitro Clase IIb que la app ya publicaba.
  **La única discrepancia es el AÑO de la etiqueta**: la app rotula «AHA/ACC 2020», que no está en
  la biblioteca. **Reportado y sin tocar** → **AJ3-a**.

- **EL DEFECTO QUE CERRÓ IMG3-g, EN UNA LÍNEA: `_ccPptPodar` devolvía `parado: true`**, porque
  «desfibrilador razonable (Clase IIa)» está PEGADO a «(1 sin evaluar)» y llevarse la recomendación
  se lleva el 1 — la guarda 3 del podador lo detecta y devuelve el original.

- ⚠️ **NO SE REORDENÓ EL `resumen`, QUE HABRÍA SIDO MÁS SIMPLE, Y SE MIDIÓ POR QUÉ.** Lo leen DOS
  consumidores y los dos son papel firmado: la hoja del PDF (`ccHoja('mch', …)`) y la diapositiva.
  Es el defecto que la tanda AJ7 pagó con la Fallot. `mchConclusion` gana una salida `papel` y
  `CC_PPT` le pone `papel:true`, como a la coartación; **las dos salidas se arman de las MISMAS
  piezas** —`resumen = desc + conducta`, `papel = desc`—, así que dos textos paralelos no pueden
  divergir. **Medido: `resumen` IDÉNTICO a HEAD en seis escenarios.**
  Ejemplo: «AHA/ACC 2020: 1 factor mayor de 5 — desfibrilador razonable (Clase IIa) (1 sin
  evaluar)» → «**Factores mayores de riesgo de muerte súbita: 1 factor mayor de 5 (1 sin
  evaluar)**», con los seis números del original intactos.

- **LOS DOS MAPAS AL TECHO SE PARTIERON POR TEMA, Y CERO LÍNEAS PERDIDAS.** `panel-evidencia.md`
  34.522 → **17.456 B**, con la anatomía de una sección a `panel-evidencia-secciones.md`
  (18.833 B); `tests.md` 34.636 → **17.919 B**, con la cola de punteros por tanda a
  `tests-punteros-tandas.md` (18.168 B) —que es la parte que crece con cada tanda—. Comprobado por
  diferencia: de las líneas no vacías del original, **cero** no aparecen en alguno de los dos
  resultantes. `congenitas-otros.md` sigue en **34.540 B** y no se tocó, que es lo que la orden
  pide; dónde conviene partirlo está medido en **AJ3-d**.

- **18/18 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5
  antes y después. **Cuatro no revierten nada: la aplican de más**, porque las condiciones que las
  matan son controles negativos.
  ⚠️ **CUATRO SOBREVIVIERON AL PRIMER BARRIDO Y SÓLO UNA ERA COBERTURA QUE FALTABA.** La **05** sí:
  el escenario tenía UNA sola diapositiva con video, así que «todo o nada» y «salteo la que falla»
  daban el mismo resultado → nacieron **(G1)** y **(G2)**, con dos diapositivas. La **14** estaba
  **mal dirigida** —mutaba el papel de la miocardiopatía y TC-570 mira el de la transposición—, la
  **15** era un **freno que tapa al que se muta** —revertía la rama de la ESC, que en esa escena no
  aporta conducta— y la **17** estaba **mal escrita**: cambiaba sólo el TÍTULO del bloque y las
  líneas seguían ahí.

- ⚠️ **DOS BUGS PROPIOS EN LOS CASOS, Y CADA UNO COSTÓ UNA CORRIDA.** (1) Los marcadores de la
  plantilla de TC-568 eran `'ID'` y `'N'`, y `String.replace` con una cadena reemplaza la PRIMERA
  aparición: la **N de `<p:cNvPr>`** quedaba `<p:c0vPr>` y dejaba de ser un shape, así que el censo
  contaba CERO videos sobre una diapositiva que sí los tiene. (2) TC-571 usaba los campos del
  formulario general y no los del MÓDULO, así que medía sobre dos denominadores vacíos.

- ⚠️ **SON DOS SECCIONES DEL PANEL Y NO UNA, Y TC-563 CENSABA IGUAL DE MAL.** `_indMCH` es la de la
  hipertrofia y la obstrucción; `_indMCHSCD` la de prevención de muerte súbita, que es donde vive
  la recomendación. Preguntarle sólo a la primera daba **cero** sobre una Evidencia que sí la
  tiene — o sea que la condición que dejaba la poda parada medía sobre el lugar equivocado.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS COSTÓ TRES CORRIDAS, Y ES LA NOVENA TANDA
  SEGUIDA QUE LO PAGA.** Siempre igual: un identificador entre acentos graves dentro del comentario
  de un caso, y el cuerpo de un caso es un template literal. **`node --check` las cazó todas.**

- **NUEVE BLOQUES DE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-558 (D1)** (el
  aviso dice que el clip entra COMPLETO), **TC-563 (C2)** —**invertida**, y es el día que ese caso
  anunciaba— más **(C2b)**, **(C6)**, **(C7)** y **(C8)**, y **TC-567** (el título, **(A2)** 4/2/3
  → 5/3/4, **(A2b)** nueva sobre los tres bloques de la ESC, **(A4)** tres → cuatro bloques, y
  **(C1)(C2)** con su nombre corregido más **(C2b)**).
  ⚠️ **(A2b) DISCRIMINA POR EL NIVEL Y NO POR LA SIGLA**: las líneas del bloque de la AHA no dicen
  «AHA» en su texto. La ESC usa «Nivel B» a secas; la AHA, «B-NR» y «C-EO».

- **A/B contra HEAD con `_probe_aj3ab.mjs`: 148 escenas, 23.828 claves y CERO diferencias de
  superficie firmada** —informe en tres estilos, EN SUMA, las **441** columnas de Excel clave por
  clave, los campos, el Laboratorio por sus ocho funciones dueñas, el PDF generado de verdad en
  sus seis plantillas y el PPT—. Excel **441 / 441** y campos **947 / 947**.
  ⚠️ **ESE CERO ES UN CONTROL NEGATIVO PARA LOS COMMITS 1 Y 4, Y SE DECLARA.** Ninguna de esas 148
  escenas carga un **video** ni una **miocardiopatía hipertrófica integrada**, así que sobre el
  bucle y sobre la línea del PPT de la MCH no prueba nada. Las mediciones que valen son
  `scripts/_probe_aj3bucle.mjs` —los dos PPT generados de verdad— y la comparación directa de
  `mchConclusion()` en seis escenarios, donde el `resumen` sale **idéntico** y el `papel` cambia.

- **Los DOS PPT generados de verdad, validados parte por parte**: el del estudio, 130.224 bytes,
  ZIP coherente, **44 de 44** XML bien formados, el video en `ppt/media/media-5-1.mp4` y
  `repeatCount="indefinite"` con `spid="10"`; el de «Imágenes guardadas», 68.676 bytes, ZIP
  coherente, **24 de 24** XML bien formados, el video en `ppt/media/media-2-1.mp4` y
  `repeatCount="indefinite"` con `spid="6"`. **Cero referencias colgadas** en los dos.
  Quedan en **`~/Desktop/ceibo-ppt-bucle-aj3/`** para que Maicol los abra en PowerPoint → **AJ3-g**.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Sin huérfanos nuevos.**
  17 bloques de JS inline parsean. `check_backticks.py` da sus cuatro hallazgos de siempre, los
  preexistentes y falsos de `_probe_aj2.mjs`.

- **El archivo de referencia del experimento NO se tocó**: 65.683 bytes y su fecha original,
  verificado al cerrar. Se leyó descomprimiendo una **copia** en un temporal.

- ⚠️ **Y EL MISMO RESBALÓN QUE LA TANDA AJUSTES-1, CORREGIDO: `scripts/_probe_aj3wk.mjs` YA
  EXISTÍA.** Es la sonda de dos motores de la tanda **AJ3 del 23/10/2026** —otra tanda con la
  misma sigla, igual que pasó con AJ1—, y escribir la de esta tanda con ese nombre la
  **sobrescribió**. Se restauró desde `8d37a65` **byte por byte** —16.615 bytes, `git diff`
  vacío— y la de esta tanda se llama **`_probe_ajustes3wk.mjs`**. Los otros cinco nombres se
  censaron contra `8d37a65` uno por uno y **ninguno existía**: `_probe_aj3bucle.mjs`,
  `_probe_aj3btn.mjs`, `_probe_aj3ab.mjs`, `_probe_ajustes3wk.mjs` y `_mut_aj3.py`.
  **Dos tandas con la misma sigla**: el mapa de aquélla es `docs/mapa/aj3-ett-avanzado.md` y el
  de ésta es `docs/mapa/aj3-bucle-botones.md`.

- ⚠️ **LA PRIMERA CORRIDA COMPLETA DESTAPÓ UNA REGRESIÓN MÍA, Y POR ESO ESA CIFRA NO ES LA LÍNEA
  BASE: TC-322.** Verificado en un worktree con los mismos scripts, alternando sólo
  `index.html`: **verde en `8d37a65` y rojo en mi árbol**. Su escena B siembra `vmax_ao` y
  `mch_grad_reposo`, y desde el commit 4 la sección de prevención de muerte súbita cita **dos**
  documentos —la ESC 2023 que cargó TGA-2 y la AHA/ACC 2024 de esta tanda—, así que las
  **entradas** pasan de 3 a 4. Las **bibliografías** siguen siendo tres, una por sección.
  **La adaptación refuerza el invariante en vez de sólo mover el número**: además de 4 entradas,
  exige que la de muerte súbita sea **la única** con dos, para que agregarle una cita a otra
  sección ponga el caso en rojo en vez de compensarse con ésta.
  ⚠️ **Y el censo no lo encontró**: grepeé la suite por «AHA», por «ahaMch2024» y por el nombre
  de la sección, y TC-322 no nombra ninguno de los tres — cuenta `<li>` de un `<details>`. Es el
  modo de falla que este archivo ya documenta siete veces.

- **LOS TRES INTERMITENTES, CARACTERIZADOS COMO MANDA ESTE ARCHIVO** —mismo directorio, mismos
  scripts, alternando sólo `index.html`—:
  **TC-551** sale **VERDE** corrido aislado, que es lo que `COR-f` declara.
  **TC-557** cae **IGUAL contra HEAD**, así que no es de esta tanda: es `TGA-h`.
  **TC-358** es el de `E-h`, la carrera de `pdfTxt` que lee `window.jspdf` sin esperarlo:
  **2 rojos de 11 corridas** en el árbol nuevo y 0 de 5 en HEAD, con seis verdes seguidos al
  final. La muestra de HEAD es chica y no distingue; el diagnóstico del caso es el de siempre y
  esta tanda no toca jsPDF.

- **Línea base al cierre: suite 579/586**, en once lotes **cubriendo los 586 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **verificado al abrir, ENTRE LOS ONCE LOTES y al cerrar** y
  el md5 de `index.html` **idéntico** antes y después (`d5c32e0a`). Los rojos son **TC-223,
  TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-358, TC-551 y TC-557**, los tres
  intermitentes que la orden anticipa. **Ningún rojo nuevo.**
  ⚠️ **LA PRIMERA CORRIDA COMPLETA DIO 578/586 CON UN ROJO MÁS, QUE ERA MÍO** —TC-322—, y por eso
  esa cifra no es la línea base. Está adaptado y la de arriba sale de la corrida **limpia**, de
  una sola pasada sobre el árbol sellado y con el archivo de tests final.

- **18/18 mutaciones dirigidas muertas.** **Semgrep 124 WARNING / 0 ERROR**, la línea base.
  **Excel 441** columnas con las mismas claves. **Campos guardados 947, el mismo juego exacto que
  HEAD**: cero nuevos y cero perdidos, medido por diferencia en el A/B. **Sin huérfanos nuevos.**
  17 bloques de JS inline parsean.

- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base
  exacta que la orden declara. **No empeoró.**

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **valor por valor**: **37 de 37** botones a 44×44 y **cero** encima de otro
  control; la marca ✓ presente y **una sola**; el globo en 380×414 —374 a 390 px— **dentro de la
  pantalla**, con la cláusula **una vez**, su rótulo, y **cero** folio, clase o nombre de guía;
  el papel de la miocardiopatía con **cero** recomendación y **cero** guía pero con su rótulo;
  el `resumen` **todavía** con la recomendación; el informe **sin** la cláusula; **cero**
  desplazamiento horizontal; y **CERO errores de consola y de página en los dos motores**.
  **El mismo cruce contra HEAD da 0 de 37 a 44 px y CINCO solapes**, que es exactamente lo que
  esta tanda cierra.
  Los **cinco textos recortados** que Chrome reporta son **idénticos en HEAD** —preexistentes, y
  WebKit no los ve: es métrica de fuente—. La única diferencia entre motores es ésa.
  ⚠️ **WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
  ⚠️ **Y LOS DIECISÉIS ERRORES DE CONSOLA DEL ÁRBOL DE HEAD SON DEL ARNÉS, no de la app**:
  `ERR_FILE_NOT_FOUND`, porque ese árbol se carga desde una copia en el temporal y ahí un recurso
  relativo no resuelve. Es lo que la tanda D2 ya documenta. El árbol vivo da **cero**.

- **`index.html` pasó de 10,54 MB / 148.070 líneas a 10,57 MB / 148.497** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff son **527 líneas agregadas y 95 quitadas**.
  Sello **`v20261031-2125`**, md5 **`d5c32e0a`**.

- **Dónde está todo:** `docs/mapa/aj3-bucle-botones.md` (**mapa NUEVO**, 14,0 KB), las fichas de
  los cuatro casos en `docs/mapa/tests-fichas-568.md` (**archivo propio**), **cinco mapas con un
  puntero cada uno** —medidos ANTES de escribir, todos por debajo de 24 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda AJUSTES-3» con la tabla del folio e1267 transcripta fila
  por fila, la regla de folio comprobada en el pie impreso de dos hojas, el cotejo de los cinco
  factores y la tabla «Cambios de evidencia» de once filas, y `docs/PENDIENTES.md` → **SIETE**
  cosas declaradas (**AJ3-a** a **AJ3-g**) más el cierre de **IMG3-a**, de **TGA2-b** y, en
  parte, de **IMG3-g**.
  **Los dos PPT de prueba quedan en `~/Desktop/ceibo-ppt-bucle-aj3/`** para que Maicol los abra
  en PowerPoint: ésa es la verificación que no se puede hacer desde acá (**AJ3-g**).
  ⚠️ **`congenitas-otros.md` (34.540 B) NO se tocó**, que es lo que la orden pide; dónde conviene
  partirlo está medido en **AJ3-d**.
### Lo que se desmarca, la pantalla y el 3D de la TGA, los dibujos TEER y el papel de la MCH — «CONG-2A» (2026-10-31 y 2026-11-01)

- **SIETE commits, y los seis de código y documentación se hicieron enteros.** `655ffc2` (1) ·
  `1f8d30b` (2) · `30714c9` (3) · `ce1a6a6` (4) · `4894cee` (5a) · `07b695c` (5b) · el de
  cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`bae00b8`**, el cierre de
  AJUSTES-3, ya publicado, con md5 de `index.html` **`d5c32e0a`** y el pendrive `DISK_IMG`
  montado. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  Cierra `AJ3-a` y `AJ3-b`.

- **LA MATRIZ DE «DESMARCAR» ES EL HALLAZGO, Y SU DENOMINADOR LA MITAD DEL HALLAZGO.** Los
  **105** selectores con opción vacía de las diecinueve secciones de congénitas, barridos en
  Chrome con gestos reales: con cada sección **sembrada**, **45 mueven** alguna superficie al
  ponerse, **44 quedan idénticos al basal** al vaciarse y **UNO sobrevive**, `vab_tipo`. El
  médico tenía razón: en las otras congénitas no pasa.
  ⚠️ **La primera versión barrió sobre un formulario VACÍO y 88 de los 105 salieron MUDOS** —sus
  secciones tienen compuertas—, y un campo que no mueve nada al ponerse **no puede probar nada al
  vaciarse**. Es el denominador de cero que este archivo documenta.

- ⚠️ **LO QUE MANTIENE VIVA LA VÁLVULA BICÚSPIDE ES LA MORFOLOGÍA DE VÁLVULAS, Y NO SE TOCÓ.** Es
  la decisión del Y3d7: `vabMorfSeguir` pone `va_morf` en «Bicúspide» al elegir un tipo de fusión,
  y al volver el tipo a «—» esa morfología se conserva. **El control negativo es lo que decide:**
  con «Bicúspide» puesta **a mano** y el tipo nunca tocado, el informe dice exactamente lo mismo
  —«Válvula aórtica bicúspide, sin estenosis ni insuficiencia.»— y el EN SUMA también. El estado
  posterior al desmarcado es **indistinguible de una afirmación del médico**, y retirarla sería
  escribir automáticamente en un campo del estudio. → **C2A-a**.

- **LO QUE SÍ ERA UN DEFECTO: `_VAB_ORIGENES` tenía cuatro entradas y le faltaba `va_morf`**, que
  es el quinto y el que decide si la válvula es bicúspide. Medido con el gesto real: con el tipo
  cargado y la morfología devuelta a mano a «Trivalva normal», el informe, el EN SUMA y
  `vabConclusion()` dejaban de nombrar la bicúspide y el **RESUMEN de la sección seguía diciendo
  «VAB»**, junto con el espejo `vab_morf_ro`, el dibujo y el botón del PDF. El comentario de la
  zona afirmaba que `va_morf` ya estaba cubierto, y era **falso por un renglón**: lo que había era
  un oyente propio que llamaba sólo a `vabMorfAviso()`. Ese oyente se retiró.

- **LA PANTALLA DE LA TGA, ANTES Y DESPUÉS, EN LOS CUATRO ANCHOS Y LOS DOS TEMAS.** Antes: cinco
  filas de `grid-3` con la cirugía sola —dos huecos— y «Síntomas» sola —dos huecos—, y la tarjeta
  del dibujo a ancho **completo**: 1194 px para un lienzo de 560×420 a 1440 px, o sea **634 px
  vacíos**; la sección medía **1144 px** de alto. Después: lado a lado a 1440 y 1000 px y apilado
  a 768 y 390, el lienzo en **605 px** y la sección en **913**.
  Con d-TGA salen **las seis filas que el médico pidió**; sin la cirugía los campos **corren** y
  quedan **cinco filas llenas sin un solo hueco**, medido con ccTGA y con Post-Mustard.

- ⚠️ **LOS CAMPOS SON UNA SOLA GRILLA DE DOS COLUMNAS, Y EL ANCHO COMPLETO DE «SÍNTOMAS» ES
  CONDICIONAL POR UNA CUENTA.** Con una fila por tema, esconder el grupo de la cirugía deja su
  celda vacía. Y con la cirugía visible hay diez campos antes —cinco filas llenas— y el ancho
  cierra la sexta sin hueco; sin ella hay nueve, así que forzarlo empujaría «Síntomas» a una fila
  propia y **crearía** el hueco que esto viene a sacar. La clase la pone `tgaSync`, el mismo dueño
  que muestra y esconde la cirugía, así que no pueden discrepar.

- ⚠️ **EL DEFECTO DEL 3D NO ES «CON EL TIPO VACÍO»: ES «AL VACIAR EL TIPO», Y ASÍ SE REPRODUCE.**
  Con el tipo vacío de entrada la librería no se baja y no hay dibujo —medido, cero desborde en
  los cuatro anchos—. Cargando un tipo y volviéndolo a «—», el canvas de 420 px **se queda**
  mientras `tga3dSync` le pone al lienzo `height:0px`: ese lienzo lleva `min-height:40px` en
  línea, **que gana**, así que el host informaba 40 px de alto con un canvas de 420 adentro y sin
  `overflow`. **Desbordaba su tarjeta por 363 px y pisaba la fila «Conclusión» por 340**, en los
  cuatro anchos. Hoy los seis estados dan **0 y 0**, con el acordeón abierto y cerrado.

- **SIN TIPO SE DIBUJA EL CORAZÓN NORMAL, Y SON TRES ESTADOS Y NO DOS.** La vista de referencia
  —declara no ser de este paciente, va **sin** comunicaciones y **sin** PDF—, el corazón normal
  por omisión —tampoco es un dato, así que tampoco va al PDF, pero **sí** lleva las comunicaciones
  cargadas— y el dibujo con tipo, que es el dato. `_tga3dEsDato()` es el dueño único y lo
  consultan **LOS DOS** gates del PDF, porque romper uno solo lo tapa el otro: preguntar
  `_tga3d.ref` en cada lugar dejaba entrar el corazón normal sin tipo al **PDF firmado**.

- ⚠️ **LAS COMUNICACIONES YA SE LEÍAN DE SUS PESTAÑAS, Y LA PREMISA DE LA ORDEN ES PARCIALMENTE
  FALSA.** `tga3dComs()` es el dueño único desde la TGA-1 y ya toma la CIA de «CIA / CIV», el
  foramen de «FOP», la CIV de «CIA / CIV» **o** de «CIV residual» de la TGA, y el ductus de «DAP».
  Lo que faltaba era **dibujarlas**: vivían dentro de la rama de la d-TGA sin cirugía, que es la
  forma de la demo. Salieron a un bloque común con la **misma geometría**, número por número.
  **El ductus baja al mismo bloque con su condición de siempre**, y es lo que deja los tres en el
  orden `asd`, `vsd`, `pda` para que la d-TGA sin cirugía salga idéntica elemento por elemento.

- ⚠️ **DOS ANATOMÍAS SE EXCLUYEN, CADA UNA DE UNA SOLA COMUNICACIÓN, Y NO ES MAQUETA.** Con el
  **switch auricular** no se dibuja la CIA —el tabique auricular se resecó y la sangre va por los
  dos túneles que esa rama dibuja— y con el **Rastelli** no se dibuja la CIV —esa rama ya pone un
  anillo en el tabique interventricular, a 0,2 de distancia, que es el túnel del ventrículo
  izquierdo a la aorta—. → **C2A-f**.
  Medido: la CIA pone su anillo en `[-0.45,0.95,-0.3]` en el corazón normal, la d-TGA, la L-TGA,
  Jatene y Rastelli y **no** en el switch auricular; la CIV el suyo en `[-0.05,-0.9,0.2]` en el
  corazón normal, la d-TGA, la L-TGA y el switch auricular y **no** en el Rastelli; «CIV residual»
  en «No» da cero anillos y el formulario vacío también; y el dibujo sigue al dato al cambiarlo en
  otra pestaña, **0 → 1 → 2 → 0**.

- **LA COMPARACIÓN CON LA DEMO: los CINCO escenarios en que la demo dibuja comunicaciones
  —`dtga/none/sh0` a `sh4`— siguen IGUALES.** De los 30, **17 iguales y 13 distintos**, y los 13
  son exactamente los que esta tanda autoriza.
  ⚠️ **Y EL CONTROL COSTÓ UNA CORRIDA: `_probe_t2a_demo.mjs` y `_probe_tga2demo.mjs` NO aceptan
  `--file`** y cargan siempre el `index.html` vivo, así que correrlos «contra HEAD» mide el árbol
  de trabajo **las dos veces** y devuelve el **mismo número** —17 y 13 en los dos—, que en un
  volcado se lee como «el commit no cambió nada». Con `_probe_cong2a_demo.mjs`, que acepta
  `--file`, el control da **30 de 30** contra HEAD, que es lo que la TGA-2 declara.

- **LA CAUSA DE LOS DIBUJOS TEER ERA DE UNA LÍNEA: `.teer-figrow`, `.teer-figcol` y `.teer-fig`
  estaban en el marcado desde que la sección existe y NO TENÍAN UNA SOLA REGLA.** Los dos `div`
  eran bloques normales y el SVG se dibujaba a ancho completo debajo del campo.

  | ancho | cada dibujo, antes | después | alto de los catorce campos, antes | después |
  |---|---|---|---|---|
  | 1440 | 290×226 | **150×117** | **937 px** | **619 px** |
  | 1000 | 186×145 | 150×117 | 767 px | 619 px |
  | 768 | **706×552** | 220×172 | **3.204 px** | 1.706 px |
  | 390 | 328×256 | 220×172 | 2.023 px | 1.706 px |

- **LOS 150 px SON UNA MEDICIÓN, NO UNA PREFERENCIA.** El valor va dentro del SVG con
  `font-size="26"` sobre un `viewBox` de 320, así que se ve a 26 × ancho / 320: a 110 px quedaría
  en **8,9 px** y a 150 px en **12,2**, y el tope de 12 px es el que el barrido de celular de este
  repositorio usa para «texto chico». Medido sobre la caja real del texto: **41×15 px** a 1440 y
  60×21 a 390, contra 79×29 y 89×32. **Y el apilado lleva tope de 220 px**: sin él, a 768 px el
  SVG vuelve a estirarse a 706×552.

- **LAS TRES ETIQUETAS DE LOS CRITERIOS TEER SÍ LLEGAN AL PAPEL, Y SE REPORTA SIN CAMBIARLO**, que
  es lo que la orden pide. Medido **con su denominador** —el módulo integrado, `amiloEnInforme()`
  devolviendo `teer` y `am-txt-teer` con 665 caracteres—: la **hoja del PDF** trae «NO apto» dos
  veces, «Heart Team» una y «anatomía compleja» una, sobre 3.274 caracteres. El informe en los
  tres estilos y el EN SUMA en los tres dan **cero**. → **C2A-c**.
  Del PPT no se afirma nada: el espía de esa sonda devolvió cero caracteres, o sea denominador
  vacío.

- **EL PAPEL DE LA MIOCARDIOPATÍA HIPERTRÓFICA, ANTES Y DESPUÉS, EN CUATRO ESCENAS.** Antes, con
  el módulo integrado y la escena de riesgo alto: el informe en los tres estilos traía «AHA/ACC
  2020» 1, «AHA» 3, «ESC» 1, «HCM Risk-SCD» 1, «Clase IIa» 1, «desfibrilador» 1 y «razonable» 1;
  el EN SUMA en los tres, «AHA/ACC» 1 y «HCM Risk-SCD» 1; y la hoja del PDF, «AHA/ACC 2020» 3,
  «AHA» 9, «ESC» 3, «HCM Risk-SCD» 4, «Clase IIa» 3, «desfibrilador» 3 y «razonable» 3.
  **Después: CERO en las siete superficies y en las cuatro escenas.**
  Ejemplo del EN SUMA: «HCM Risk-SCD 31.57 % a 5 años (riesgo alto). AHA/ACC 3/5 factores mayores
  (1 sin evaluar)» → «**Riesgo de muerte súbita 31.57 % a 5 años (riesgo alto). Factores mayores
  3/5 (1 sin evaluar)**».

- **NINGÚN NÚMERO MEDIDO DESAPARECE, Y ESTÁ VERIFICADO NÚMERO POR NÚMERO** en las cuatro escenas y
  las tres superficies: el **único** que sale es **«2020»**, que es el año de la guía. Los dos que
  entran son dos **«5»**, del «riesgo a 5 años» con que se nombra el score.

- **EL CONTENIDO ESTÁ EN LA EVIDENCIA Y SE VERIFICÓ ANTES DE RETIRARLO**, que es la condición que
  la orden pone: la sección «Miocardiopatía hipertrófica — prevención de muerte súbita» publica
  **18 líneas** con **9** menciones de desfibrilador, **13** clases, el **folio e1267** de la
  AHA/ACC 2024 y los **folios 3561-3562** de la ESC 2023. **No se agregó ninguna cita**: las
  cargaron AJUSTES-3 y TGA-2.
  **No se reescribió ni se reordenó ningún texto**: se separan DESCRIPCIÓN y CONDUCTA y las
  salidas se arman con las mismas piezas, que es el patrón que AJUSTES-3 dejó hecho. `_escCond` y
  `_ahaCond` quedan **armados a propósito** —son el texto que la Evidencia publica con su clase y
  su folio— y la mutación 15 los vuelve a pegar.

- ⚠️ **LO QUE QUEDA EN EL PAPEL Y NO ES DE LA MIOCARDIOPATÍA, DECLARADO:** una mención de «guía»
  en el informe y dos en el PDF, **idénticas antes y después**. Salen de la **aurícula izquierda**
  —«El grado de dilatación auricular no se informa: la guía lo gradúa sólo por volumen indexado»—
  y las dispara el diámetro anteroposterior de la escena, no la miocardiopatía: verificado que no
  están en `txt`, ni en `resumen`, ni en `papel` de `mchConclusion`. → **C2A-e**.

- **DOS REGLAS FIJAS NUEVAS EN ESTE ARCHIVO**, las dos de Maicol y del 31/10/2026: «El papel
  describe», con sus cuatro corolarios medidos y la **excepción expresa** de las tres etiquetas de
  los criterios TEER; y «La pantalla: campos a la izquierda, diagrama a la derecha» desde 900 px,
  con el corte sobre la **ventana**. Y **`docs/REGISTRO_TANDAS.md`**, un solo archivo con un
  bloque por tanda, cargado con las **doce** tandas del 30 y 31 de octubre y sus 76 commits, todo
  salido de `git log` y de este archivo.

- **18/18 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5
  antes y después. **Cuatro de las dieciocho no revierten nada: la aplican de más** —el ancho
  completo de «Síntomas» sin la cirugía, o sea CREAR el hueco; la CIA con el switch auricular; la
  CIV con el Rastelli; y la conducta de vuelta en el `resumen`—, porque las condiciones que las
  matan son **controles negativos**. La **02** rompe las dos mitades a la vez, que es la lección
  del D-11.
  ⚠️ **TRES SOBREVIVIERON AL PRIMER BARRIDO Y ME DIJERON TRES COSAS DISTINTAS.** La **07** porque
  **el commit 3c tapa al 3b**: con el corazón normal por omisión, la rama «todavía no hay dibujo»
  no se ejecuta nunca mientras la librería esté cargada, así que el blindaje del recuadro es la
  **segunda red** y hubo que romper las dos puertas (→ **C2A-b**). La **10** era un **hueco real**:
  mis condiciones veían el canvas —que existe porque lo crea `tga3dInit`, dibuje o no— y leían el
  **texto**, que sale de la bandera y no de la anatomía; nacieron **(B7)** y **(B8)**, que miran el
  **contenido** del dibujo. Y la **13** porque el suite corre por debajo de 900 px, donde lo que
  acota el dibujo es el `max-width` del apilado y no la maqueta: nació **(B2b)**, que mira el
  `display` computado, observable en cualquier ancho.

- **A/B contra HEAD: 163 escenas, 183.033 claves y 71.883 celdas de Excel. Las 52 diferencias de
  superficie firmada están TODAS en las cuatro escenas de miocardiopatía hipertrófica.** Las otras
  **159 dan cero**, `vacio` y `ajeno` incluidas, y también las tres de la válvula bicúspide, las
  siete de la TGA y la de los criterios TEER. **Excel 441 columnas con las mismas 441 claves
  exactas**, y **963 ids de campos idénticos**: cero nuevos y cero perdidos.
  ⚠️ **ESE CERO ES UN CONTROL NEGATIVO PARA LOS COMMITS 1 A 4, Y SE DECLARA.** El arnés monta un
  estado y corre el embudo completo, así que un commit que cambia **cuándo** se repinta —y no
  **qué**— no puede mostrar diferencia ahí. Las mediciones que valen son las sondas dedicadas:
  `_probe_cong2a_vab.mjs` con gestos reales, `_probe_cong2a_pant.mjs`, `_probe_cong2a_3d.mjs`,
  `_probe_cong2a_demo.mjs` y `_probe_cong2a_teer.mjs`, todas antes y después.
  ⚠️ **Y EL PRIMER A/B DIO CERO EN LAS CUATRO ESCENAS DE MIOCARDIOPATÍA, QUE ERA MI PROPIO
  DENOMINADOR VACÍO:** no marcaban `mch_incluir_chk`, así que el papel no traía una palabra de la
  miocardiopatía en ninguno de los dos lados.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES, EN LAS DOS ZONAS** (dos motores × 1440,
  1000, 768 y 390 px × dos temas). La TGA: lado a lado a 1440 y 1000 y apilado a 768 y 390, **cero
  desborde del dibujo**, **cero** desplazamiento horizontal del cuerpo, **cero** textos recortados,
  **9 de 9** controles a 44 px de alto y **cero errores de consola y de página en los dos
  motores**. Los criterios TEER: 150×117 lado a lado y 220×172 apilado, las tres etiquetas con el
  mismo conteo —1, 3 y 2—, cero scroll, cero recortes y cero errores. La única diferencia entre
  motores es el alto de los catorce campos: **619 px en Chrome contra 584-590 en WebKit**, que es
  métrica de fuente.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
  ⚠️ **Y EL ÚNICO ERROR DE CONSOLA DEL ÁRBOL DE HEAD ES DEL ARNÉS**, no de la app: se carga desde
  una copia en el temporal y ahí un recurso relativo no resuelve. Es lo que la tanda D2 ya
  documenta. El árbol vivo da **cero**.

- **ESCRIBIR NO SE VOLVIÓ MÁS LENTO**, medido alternando los dos árboles en **tres rondas** de doce
  teclas reales sobre el gradiente subaórtico —que es el único camino por tecla que esta tanda
  toca, porque su `oninput` va a `tgaSync`—: HEAD media **13,04 a 15,31 ms** contra **11,36 a
  15,47** en el árbol nuevo, y el barrido 11,9-15,4 contra 12,3-15,3. Las bandas se superponen.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS COSTÓ TRES CORRIDAS, Y ES LA DÉCIMA TANDA
  SEGUIDA QUE LO PAGA.** Siempre igual: un identificador entre acentos graves dentro del comentario
  de un caso o de una sonda, y los dos cuerpos son template literals. Lo que acabó funcionando fue
  **contar los acentos graves del bloque y exigir el número exacto** —dos por caso— y
  **`node --check`** después de cada edición. En TC-576 hubo que quitar los **ocho** de su cuerpo
  de una pasada.

- ⚠️ **Y UNA TRAMPA DEL ARNÉS DE FONDO, QUE COSTÓ DOS RELANZAMIENTOS:** un `nohup … &` lanzado
  desde la herramienta de shell **no sobrevive** al proceso padre, así que la suite se cortó en el
  lote 3 con el log en una sola línea. Lo que funciona es lanzar el script **directo** en segundo
  plano, sin `&`.

- ⚠️ **Y LA QUE MÁS COSTÓ: `getBoundingClientRect().top` ES RELATIVO AL VIEWPORT, NO AL
  DOCUMENTO.** TC-573 daba **cero filas** dentro de su lote y seis aislado, con la grilla midiendo
  694 px de ancho y su `offsetParent` no nulo: el filtro `y >= 0` descartaba **todos** los campos
  porque la página quedaba scrolleada por un caso anterior, y el cero se leía como «la maqueta no
  existe». Lo que define una fila es que dos campos compartan su `y`, y eso vale con cualquier
  desplazamiento. **Tres hipótesis anteriores —el acordeón cerrado, la pestaña cambiada, la
  librería a medio cargar— las descartó una línea de diagnóstico dentro de la propia condición**,
  que imprime el display de la pestaña, del acordeón y de la zona junto con el conteo. Leer el
  código no lo habría encontrado.

- **Línea base al cierre: suite 585/591**, en once lotes **cubriendo los 591 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **verificado al abrir, ENTRE LOS ONCE LOTES y al cerrar**,
  **591 de 591 ejecutados** y el md5 de `index.html` **idéntico** antes y después (`9e5415c1`).
  Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-182 y
  TC-551**, los dos intermitentes que la orden anticipa: **repetidos aislados, los dos salen
  VERDE**. **Ningún rojo nuevo.** **TC-358, TC-262, TC-419, TC-507 y TC-557 salieron VERDES.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO SIETE ROJOS MÁS**, y por eso esa cifra no es la línea
  base: cinco eran casos viejos que afirmaban el comportamiento anterior —TC-561, TC-562, TC-563,
  TC-567 y TC-571—, uno era el intermitente TC-551, y el séptimo era **mi propio TC-573**, que
  daba **cero filas** dentro de su lote y seis aislado. Los seis primeros están adaptados y el
  séptimo corregido; la cifra de arriba sale de la corrida **limpia**, de una sola pasada sobre el
  árbol resellado y con el archivo de tests final.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. El diff de `index.html`
  son **336 líneas agregadas y 123 quitadas**, de las que **293** no son comentario, con **cero**
  `innerHTML`, `eval` o `new Function` nuevos. **Excel 441** columnas con las mismas claves.
  **Censo sin huérfanos nuevos** y **sin campos guardados nuevos**: ningún id cambió. 17 de 19
  bloques de JS inline parsean, idéntico a HEAD —los dos «rotos» son artefactos del regex del
  extractor, preexistentes—.
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base exacta.
  **No empeoró.**

- **CINCO CASOS NUEVOS Y SEIS ADAPTADOS.** Nuevos: **TC-572** a **TC-576**, los cinco con sus
  denominadores y sus controles negativos, y los cinco **caen contra HEAD** sin caer por excepción.
  Adaptados, cada uno con el motivo escrito: **TC-64** (el score se nombra por lo que es, y el
  invariante —que no se publica incompleto— no se movió); **TC-561 (B2)** (la fila de la cirugía
  dejó de ser un `grid-3` y su display computado es «flex»; lo que importa es que se **vea** con
  d-TGA); **TC-562 (C10)** y **(G2)**, las dos **invertidas** (con el switch auricular la escena
  ahora **cambia**, porque la CIV se dibuja y la CIA no; y el aviso ya no pide elegir el tipo);
  **TC-563 (C3)** y **(C6)**; **TC-567 (C1)**, **(C2)** y **(C3)**; y **TC-571 (A1)**, **(A2)**,
  **(C1)**, **(C2)**, **(D1)** y **(D2)**.
  ⚠️ **LOS TRES ÚLTIMOS SON EL DÍA QUE ELLOS MISMOS ANUNCIABAN.** TC-563 (C3) era el control
  negativo del censo —«el papel SÍ dice la recomendación»—, TC-567 (C1) y (C2) afirmaban que el
  informe y el PDF **seguían** diciéndola con «AHA/ACC 2020», y TC-571 (A1) y (A2) eran el
  denominador de su propio caso: el `resumen` traía la conducta con el «(N sin evaluar)» pegado,
  que es lo que impedía podarla. Las once condiciones están **invertidas**, no borradas, y cada una
  ganó una condición de denominador para que siga pudiendo fallar.
  ⚠️ **Y LOS CINCO LOS DESTAPÓ LA CORRIDA COMPLETA, NO EL CENSO.** Grepeé la suite por «AHA/ACC
  2020», «HCM Risk-SCD», «desfibrilador» y «Clase IIa» y encontré **TC-64**; los otros cinco lo
  dicen con otras palabras o lo miden por otro camino —el display de una fila, la firma de una
  escena, el `parado` de un podador—. Es el modo de falla que este archivo ya documenta ocho veces.

- **`index.html` pasó de 10,57 MB / 148.497 líneas a 10,59 MB / 148.710** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) Sello **`v20261101-0152`**, md5 **`9e5415c1`**.

- **Dónde está todo:** `docs/mapa/cong2a-desmarcar-tga-teer.md` (**mapa NUEVO**, 10,0 KB), las
  fichas de los cinco casos en `docs/mapa/tests-fichas-572.md` (**archivo propio**, porque
  `tests-fichas.md` está a 800 bytes del techo), **cinco mapas con un puntero cada uno** —medidos
  ANTES de escribir, todos por debajo de 34 KB—, `docs/fuentes/FUENTES.md` → «La tanda CONG-2A»
  con la verificación de la Evidencia y la tabla de las once cosas que salieron del papel,
  `docs/REGISTRO_TANDAS.md` → el bloque de esta tanda, y `docs/PENDIENTES.md` → **OCHO** cosas
  declaradas (**C2A-a** a **C2A-h**) más el cierre de **AJ3-a** y **AJ3-b**.
  ⚠️ **`congenitas-otros.md` (34.540 B) NO se tocó**, que es lo que la orden pide.

### La pantalla del posoperatorio — «POP-A» (2026-11-01)

- **SIETE commits, y los SEIS de código se hicieron enteros.** `162aa9d` (POP-A-1) · `49864a0`
  (POP-A-2) · `3561bf9` (POP-A-3) · `67038f5` (POP-A-4) · `d1bd8ad` (POP-A-5) · `bc1ad49`
  (POP-A-6) · el de cobertura y documentación. Sello **`v20261101-0452`**, md5 de `index.html`
  **`01677156`**. Al empezar, `origin/main` = `HEAD` = **`47ff639`**, el cierre de CONG-2A, ya
  publicado, con md5 **`9e5415c1`** y el pendrive `DISK_IMG` montado.
  ⚠️ **EL ÁRBOL SE RESELLÓ AL CERRAR, Y LA VERIFICACIÓN MIDIÓ EL SELLO ANTERIOR:** la suite
  completa, las catorce mutaciones, el A/B y los dos motores corrieron sobre `v20261101-0452` con
  md5 **`baaf6f49`**, y el commit 7 lo volvió a sellar porque `sellar_version.py` se corre antes de
  cada `git add`. **El diff entre los dos árboles son TRES líneas** —`ECO_BUILD`, `ECO_BUILD_MS` y
  el sello del pie—, verificado con `diff` contra la copia que midió todo. Ni una línea de código.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **TRES PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **La asistencia YA tenía el dispositivo y su opción en la misma fila.** En los tres casos
     —balón, Impella y ECMO— las dos cajas dan la misma `y` (588) a 1440 y a 1000 px, porque un
     item de grid en `display:none` no ocupa pista y la opción visible cae en la segunda columna
     del `.grid-2`. **No había nada que reubicar y no se tocó una línea.**
  2. **El renglón de tamaño de este archivo tenía el sello una resellada atrás**: decía
     `v20261101-0041` con md5 `0f6254dc` y el árbol traía `v20261101-0152` con `9e5415c1`.
  3. **El denominador de la suite no era 591: son 596** al cerrar —TC-1 a TC-581 sin huecos más
     quince TC-GR—, contados nombre por nombre.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: la pestaña era una pila de 2096 px a 1440 px y
  de 2857 a 1000**, así que el médico scrolleaba la pestaña entera para pasar del contexto al
  POCUS. Hoy la columna más alta mide **957 px** a 1440 y 1078 a 1000, en tres columnas
  **independientes** —cada una su propio contenedor flex— con el corte sobre la ventana en 900 px.
  ⚠️ **No es un grid de seis items en tres columnas, y la diferencia es el pedido**: con los items
  sueltos, las filas se alinean y la más alta estira a sus dos vecinas.

- **EL PANEL DE FÁRMACOS NO EMPUJA NADA, Y ESTÁ MEDIDO CON SU CONTROL.** Al abrirlo las tres
  tarjetas vecinas y la fila de dosis no mueven un píxel, el alto del cuerpo queda en **2707 px
  antes y después**, y el panel **se superpone** con la tarjeta de abajo — que es la prueba de que
  flota y no el cero de una sonda que no mira nada.

- ⚠️ **EL AZUL DE METILENO NO INVENTA NADA, Y SON TRES COSAS.** `POP_DROGAS_SIN_UNIDAD` lo saca de
  `POP_DROGAS_PESO` —no escribe su dosis sola— y hace que la línea de la dilución diga que la app
  no declara su unidad en vez de publicar un «≈ N mcg/kg/min»; `POP_DROGAS_PATRON` lo excluye, así
  que no mueve `haySoporte` del patrón ni la franja del dibujo; y `POP_DOSIS_UNID` hace que el
  papel publique «Azul de metileno 1.5», sin unidad. Su uso hemodinámico espera la guía EACTS
  2024 → **PA-a** y **PA-b**.

- ⚠️ **LA CASILLA «OTRA» NO TIENE TOKEN, Y ES UNA PARADA MEDIDA.** `_pptSpan` lee `e.textContent`,
  y en un `<select>` eso es la **lista entera** de opciones: la celda «Tipo de cirugía» de la
  diapositiva publica hoy las ocho, sea cual sea el valor —defecto preexistente, medido en HEAD—.
  Agregarle una novena cambiaba esa celda en **toda** escena integrada, o sea el papel firmado de
  cualquier estudio. El informe, el EN SUMA y la hoja del PDF igual publican «Otra», porque leen
  `popCxEstado()`. → **PA-d**.

- ⚠️ **UN ESTUDIO VIEJO SE LEE Y NO SE REESCRIBE, Y ES LO QUE MÁS CUIDADO LLEVÓ.** Sin casillas
  marcadas y con `pop_cx_tipo` cargado, la casilla que le corresponde se muestra con una **marca
  heredada** —una clase CSS con su tilde tenue— y su `checked` **no se toca**: si se tocara,
  guardar le agregaría una clave `__chk` que el estudio no tenía. Medido: con `'valvular'` los
  cuatro `checked` dan 0, el campo queda como estaba, y el papel y el EN SUMA salen **idénticos**
  —«Tipo de cirugía | Valvular» y «PostCEC Valvular — hora 6 h — IC 1.76 L/min/m² — bajo gasto.»—.

- ⚠️ **LA UNIFICACIÓN DE PLEURA Y PULMÓN SE PARÓ, CON SEIS CONTRADICCIONES MEDIDAS OPCIÓN POR
  OPCIÓN.** El posoperatorio gradúa el derrame **por lado** y el módulo tiene **uno** con una
  lateralidad; las características son Hemotórax contra Tabicado; las líneas B son tres grados
  contra **seis casillas por zona**; y el neumotórax es un grado contra un **criterio de dos
  signos**. Traducir cualquiera en una dirección inventa un dato o lo pierde. **El pericardio sí
  se unificó**, porque ahí hay un solo dueño. → **PA-e**.

- **EL DIBUJO QUEDA IDÉNTICO, Y ESTÁ VERIFICADO NODO POR NODO.** Con la misma escena cargada y la
  animación **parada** antes de fotografiar, en los cuatro anchos: **77 nodos** antes y después, la
  **firma** del SVG —cada nodo con su etiqueta y sus atributos ordenados— idéntica, `viewBox`
  «0 0 600 496» idéntico, `aria-label` idéntico, el texto del esquema y la conclusión idénticos.
  No se tocó una línea de `popEsqPintar`. Eso es la tanda POP-B.

- ⚠️ **UNA REGLA DE 1100 px QUE DEJÓ DE TENER SENTIDO, Y LA ENCONTRÓ UN CASO DE PRUEBA.**
  `.pop-pocus-grid` se partía en dos columnas desde 1100 px, lo que con la tarjeta a ancho
  completo daba dos de ~600 px. Con las tres columnas del POP-A la tarjeta mide ~404, y medido a
  1440 px esa regla la partía en dos de **182 px** —y en **128** a 1100—. El pedido dice «el
  recuadro del eco, el VD con su conclusión, y DEBAJO pericardio, pleura y pulmón en una grilla
  compacta de dos columnas»: las dos columnas son las de los selectores. La subgrilla quedó en UNA
  a cualquier ancho, y su `.grid-3` con piso de 170 px se fue con ella, porque esta tanda pasó sus
  dos grillas a `.grid-2` y no quedaba un nodo que la usara.
  **A/B del commit 7 contra el árbol del commit 6: CERO diferencias de superficie firmada y CERO
  de pantalla** en las 109 escenas —es un cambio de CSS y el sello, y ninguno de los dos mueve una
  palabra—. Lo que sí cambia es la geometría, y se mide aparte: la subgrilla pasa de **dos pistas
  de 182 px a una de 374** a 1440 px, sin un rótulo recortado en ninguno de los cuatro anchos.

- **DIECIOCHO campos guardados nuevos, todos de la lista autorizada**, y cero perdidos: cuatro de
  tipo de cirugía, cuatro de válvulas operadas, tres de drenajes, cinco del azul de metileno y dos
  de la cama. Censo **947 → 965**. **Excel 441 → 441** columnas con las mismas claves.
  **Y NUEVE que NO se guardan**, todos con prefijo `pop-esp-` (guión MEDIO) en las **dos** listas
  paralelas y con `data-espejo` **sin valor** —la declaración estática, no la marca de runtime que
  `limpiarCampos` borra: es la lección del D-11, que costó TC-514 en rojo—.

- **CINCO CASOS NUEVOS, TC-577 a TC-581**, con sus denominadores y sus controles negativos, y los
  cinco **caen contra HEAD por CONDICIONES y ninguno por excepción**: 18, 23, 21, 25 y 15
  condiciones en rojo, medidas en un worktree sobre `47ff639`.
  ⚠️ **EL SUITE CORRE CHROME SIN `--window-size`, O SEA A 756 px**, por debajo del corte de 900:
  los casos miden el reparto por la **REGLA de la hoja de estilos** —con un ayudante que recorre
  `document.styleSheets`— y por la **ESTRUCTURA**, no por geometría. La geometría lado a lado la
  miden las sondas. ⚠️ Y Chrome normaliza `minmax(0, 1fr)` a **`minmax(0px, 1fr)`**: costó una
  corrida.

- **14/14 MUTACIONES DIRIGIDAS MUERTAS EN EL PRIMER BARRIDO**, en worktree y nunca sobre el vivo,
  con guarda de md5 antes y después, y **cada una mató exactamente su caso** — el reparto es
  limpio: las de un commit no ponen rojo al caso de otro. **Repetidas sobre el árbol SELLADO** al
  cerrar, por el arreglo de CSS del commit 7: **14/14 otra vez**. **Tres de las catorce
  no revierten nada: la aplican de más** —el azul al patrón, el azul con unidad en el papel, y una
  prótesis mecánica por omisión en una válvula marcada sin tipo—, porque las condiciones que las
  matan son **controles negativos**.

- **DOS CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-534** (diez condiciones: el
  conteo de drogas, la grilla de filas, el alto del bloque, las cuatro del acordeón que se retiró,
  la regla de 1100 px, «Nuevo estudio» y las reglas de 768 px) y **TC-548** (siete: el conteo de
  tarjetas, el de drogas, el orden del marcado, el de tabulación, el recuadro del dispositivo y el
  desplegable). **Once de las diecisiete están INVERTIDAS**, no borradas: siguen vigilando lo
  mismo desde el otro lado.
  ⚠️ **Y LOS DOS LOS DESTAPÓ LA CORRIDA COMPLETA, NO EL CENSO.**

- **A/B contra HEAD con `_probe_paab.mjs`: 109 escenas, 120.429 claves y 48.069 celdas de Excel.**
  Las diferencias de papel están en **ocho** escenas, las ocho con datos nuevos, y **`cxLegado` y
  `ecoPocus` dan CERO**, que son los dos controles negativos que importan. El dibujo no cambia en
  **106 de las 107** escenas del A/B del commit 4; la única donde su texto se mueve es `dhEsp`, y
  no es el dibujo: es el **dato** que entra por la puerta nueva.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **en las 25 claves medidas**: lado a lado a 1440 y 1000 y apilado a 768 y 390; el
  dibujo en 581×483 px a 1440 y 328×274 a 390; el panel cerrado al nacer con su botón de 44 px de
  alto; la ✕ en 44×44 con los **cinco puntos** dando el propio botón, también a 390; las tres
  columnas del Swan; la PmAP derivada; los drenajes en **una fila**; el papel y el EN SUMA
  idénticos; **cero desplazamiento horizontal, cero textos recortados y CERO errores de consola y
  de página en los dos motores y en los dos árboles**.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.

- **Línea base al cierre: suite 590/596**, en once lotes **cubriendo los 596 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **verificado al abrir, ENTRE LOS ONCE LOTES y al cerrar** —y
  listando nombres reales—, **596 de 596 ejecutados** y el md5 de `index.html` **idéntico** antes y
  después (`baaf6f49`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre,
  más **TC-182 y TC-551**, los dos intermitentes que la orden anticipa: **corridos aislados, los
  dos salen VERDE**, verificado. **TC-358 y TC-557 salieron VERDES.** **Ningún rojo nuevo.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 588/596 CON DOS ROJOS MÁS, LOS DOS MÍOS**, y por eso esa
  cifra no es la línea base: **TC-534** —el caso grande de la tanda G, con el conteo de drogas, la
  grilla de filas, el alto del bloque, las cuatro condiciones del acordeón, la regla de 1100 px,
  «Nuevo estudio» y las de 768— y **TC-548**, el de la POP-V2, con el conteo de tarjetas, el de
  drogas, el orden del marcado, el de tabulación, el recuadro del dispositivo y el desplegable.
  Los dos están adaptados y la cifra de arriba sale de la corrida **limpia**, de una sola pasada
  sobre el árbol sellado y con el archivo de tests final.
- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. El diff de `index.html`
  son **960 líneas agregadas y 252 quitadas**, de las que **905** no son comentario, con **cero**
  `innerHTML`, `eval` o `new Function` nuevos y cero claves o contraseñas. **Sin huérfanos
  nuevos.** 17 de 19 bloques de JS inline parsean, idéntico a HEAD.
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base exacta.
  **No empeoró.**
- **`index.html` pasó de 10,59 MB / 148.710 líneas a 10,64 MB / 149.427** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff son **971 líneas agregadas y 254 quitadas**, de
  las que **915** no son comentario, con **cero** `innerHTML`, `eval` o `new Function` nuevos y
  cero claves ni contraseñas.

- **Dónde está todo:** `docs/mapa/pa-pantalla-posoperatorio.md` (**mapa NUEVO**, 24,0 KB), las
  fichas de los cinco casos en `docs/mapa/tests-fichas-577.md` (**archivo propio**, porque
  `tests-fichas.md` está a 800 bytes del techo), **cinco mapas con un puntero cada uno** —medidos
  ANTES de escribir, todos por debajo de 32 KB—, `docs/fuentes/FUENTES.md` → «La tanda POP-A» con
  su tabla «Cambios de evidencia» **vacía a propósito** y el censo de las opciones de cada válvula,
  `docs/REGISTRO_TANDAS.md` → el bloque de esta tanda, y `docs/PENDIENTES.md` → **NUEVE** cosas
  declaradas (**PA-a** a **PA-i**).

### Los arreglos de POP-A y el dibujo del posoperatorio — «POP-B» (2026-11-01)

- **OCHO commits, y los SIETE de código se hicieron enteros.** `dbdc5bf` (1) · `a7662ba` (2) ·
  `423eb8a` (3) · `1469c7b` (4) · `7bd3e14` (5) · `5b43c4a` (6) · `a0850ca` (7) · el de cobertura
  y documentación. Al empezar, `origin/main` = `HEAD` = **`f8ea371`**, el cierre de POP-A, ya
  publicado, con md5 de `index.html` **`01677156`**.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LA PREMISA DEL COMMIT 1 ERA FALSA, Y EL BISECT LO PRUEBA.** El médico reportó que «Integrar al
  informe» del posoperatorio no integra y que con el mismo estudio en `47ff639` sí. Medido en los
  **OCHO** árboles —`47ff639` y los siete commits de POP-A—, con el estudio del pedido y con el
  **click real** de Playwright: los ocho se comportan **idéntico**. Con peso y talla,
  `suficiente=true`, botón habilitado, integra en los ocho; sin peso ni talla, `false`,
  deshabilitado, no integra en los ocho. **No hay ninguna regresión de POP-A.**
  Antes del bisect: **diez variantes** del estudio —el azul con y sin dosis, sólo «Otra», las
  cuatro válvulas, PiCCO, ECMO venovenoso, la tricúspide con una morfología nativa, los tres
  drenajes y el round-trip completo de guardar y reabrir por `editarInforme`— integran **todas**;
  y el botón acepta el click real en 1440, 1000, 768 y 390 px, con el panel de fármacos cerrado y
  abierto. La única condición que lo bloquea es `popPatron().suficiente`, y con los datos del
  pedido el motivo es la **superficie corporal**: tres de las cuatro fuentes de índice dividen por
  `getBSA()`. Esa compuerta existe desde antes de POP-A → **POPB-a**.

- **LO QUE SÍ ERA UN DEFECTO, y es lo que el commit 1 cierra: el botón quedaba MUDO.**
  `popConclSync` le escribe un `title` con el motivo y `_amiloAvisoPintar(k, false)` hacía
  `removeAttribute('title')` **a secas** 220 ms después, en el barrido de bloques integrados.
  Medido: `title` vacío en los ocho árboles. El médico se quedaba con un botón en gris, con el
  cursor de prohibido y **sin una palabra de por qué**. Hoy el barrido sólo borra el title que él
  mismo escribió, comparándolo contra `_AM_AVISO_TXT` — sin marca de runtime nueva, así que no hay
  lista paralela que tocar.

- ⚠️ **EL CONTEO DE FÁRMACOS TAMBIÉN ERA PREEXISTENTE.** Sumaba las once casillas MÁS la
  asistencia circulatoria, y con la asistencia en su propia tarjeta desde POP-A-1 eso dejó de
  coincidir con nada que se vea: con noradrenalina, dopamina y balón decía «3 marcados» con dos
  filas, **y lo decía igual en `47ff639`**. Hoy cuenta
  `#pop_farm_rows .pop-droga.pop-droga-on`, o sea las filas visibles, que no es una segunda regla:
  esa clase la pone el bucle de drogas de la misma pasada. Medido en nueve escenas: HEAD falla 5,
  el árbol nuevo 0.

- **EL PAPEL DESCRIBÍA LA CIRUGÍA CON UNA MORFOLOGÍA NATIVA.** `popCxValvTxt` publicaba `d.value` a
  secas, así que una tricúspide marcada con «Mixomatosa» en Válvulas salía al informe, al EN SUMA y
  a la hoja del PDF como «tricúspide — Mixomatosa». Hoy el tipo sale **sólo** si es una prótesis, y
  si no, «sin tipo consignado». Las opciones del selector se filtran con `_popVEsProt`, que
  pregunta al `<option>` del dueño si su valor empieza con «Prótesis»: **dos por válvula**, las
  mismas cuatro veces. TAVI queda afuera por orden expresa y plastia y TEER no existen en ningún
  dueño → **POPB-c**.

- **LA DISPOSICIÓN: la columna 3 bajó de 1228 a 647 px.** «Pleura y pulmón» salió a una tarjeta de
  ancho completo debajo de las tres columnas, en dos columnas desde 900 px, y dentro de «Eco y
  POCUS» la ecocardiografía quedó al lado del ventrículo derecho. La tarjeta pasó de **1115 a
  534 px**. ⚠️ **Quedan huecos de más de 120 px en algunos casos y NO se inventó otra
  disposición**, que es lo que la orden manda: con cinco fármacos la columna 2 mide 1107 px —866
  de ellos la tarjeta de fármacos, cuyas filas crecen una por droga— → **POPB-b**.

- **LOS TRES TEXTOS DEL DIBUJO QUE SE SUPERPONÍAN, MEDIDOS CON `getBBox` CRUZANDO TODOS LOS
  PARES**: «derrame pleural D moderado · I severo» × «AP 100/50» (61 × 12 px), «Presión arterial»
  × «aumento diastólico (timing verificado)» (35 × 17) y ése × «PAM 78 mmHg · medida (Swan-Ganz)»
  (25 × 17). Los dos primeros los había visto el médico; **el tercero no estaba reportado**.
  Después: **cero superposiciones y cero textos fuera del lienzo en las treinta escenas del
  arnés**, a 1440 y 1000 px.
  ⚠️ **Y un desborde que nadie había visto:** la franja de vasoactivos está centrada en x 330 y con
  los diez fármacos del patrón pasaba de 900 unidades en un dibujo de 600.

- **EL DERRAME PLEURAL SE DIBUJA.** Era una elipse de 44 × 22 px, **la misma** para los tres
  grados. Hoy es un nivel de líquido recortado con la MISMA ruta que dibuja el pulmón, con el color
  de líquido del dibujo y sin texto encima: **22 / 44 / 72** unidades de alto para leve, moderado y
  severo, con la base fija en y 268. «Ausente» y sin cargar no dibujan nada.
  ⚠️ **EL ANILLO DEL DERRAME PERICÁRDICO NO SIGUE AL TAMAÑO, contra lo que el pedido supone:** su
  grosor es **8 px con leve, moderado Y severo** y 14 sólo con compromiso hemodinámico. Lo que
  distingue es el COMPROMISO. Reportado y no tocado → **POPB-d**.

- **CUATRO CAPAS NUEVAS Y LAS CUATRO VÁLVULAS.** El puente aortocoronario, la malla del injerto de
  aorta y los tres drenajes, cada uno con su dato y sin un solo rótulo en el dibujo —los tres se
  nombran en «Características del esquema»—. Las dos cirugías se leen de `popCxEstado()`, el dueño
  único que también publica el papel, **y eso incluye al estudio viejo**: con `pop_cx_tipo` en
  `cabg` el puente se dibuja, con la misma firma que con la casilla. Con `combinada` no se dibuja
  ninguna. Y cuatro válvulas operadas con su tipo —mecánica oscura con dos velos, biológica clara
  con tres soportes, **sin tipo un anillo punteado y sin velos**— latiendo con la **frecuencia
  cargada**: la aórtica y la pulmonar en sístole y la mitral y la tricúspide en diástole.
  **Medido muestreando 32 veces en 1,6 s: el hueco va de 0 a 9; sin frecuencia se queda en 0 en
  las 32; y en 32 muestras pareadas las dos abiertas a la vez son CERO.**
  ⚠️ **Eso las desacompasa de las cavidades, que respiran con `POP_ESQ_PER_MS`** → **POPB-f**.

- **EL RESTO DEL DIBUJO ES IDÉNTICO, escena por escena:** la firma de los nodos que no son las
  capas nuevas da el MISMO hash en las 21 escenas del arnés, en el árbol del commit 5 y en el del
  commit 6. Y sin cirugía declarada, con «valvular» sola y con «combinada», las cinco capas están
  apagadas y la firma es idéntica a la de un formulario vacío.

- ⚠️ **UN DEFECTO QUE ENCONTRÓ LA RELECTURA DEL PROPIO DIFF, Y ES LA TRAMPA QUE ESTE ARCHIVO
  DOCUMENTA CUATRO VECES.** La nota ámbar que esta tanda estrena salía con `color: var(--amber)`, y
  **`--amber` no está en el `:root` de ningún tema**: vive dentro de `.amilo-root` —donde vale
  `var(--orange)`— y de `#sp-root`. Fuera de esos dos el `var()` no resuelve y `color` cae en su
  valor **inicial**, que es negro: la nota quedaba invisible en el tema oscuro. Corregido a
  `var(--orange)`. Censando el archivo quedan **tres** usos globales preexistentes → **POPB-h**.

- **18/18 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5
  antes y después. **Cuatro de las dieciocho no revierten nada: la aplican de más** —el papel
  describiendo con una nativa, el derrame dibujado con «ausente», el puente sin cirugía y las
  válvulas latiendo sin frecuencia—, porque las condiciones que las matan son **controles
  negativos**. Son más de las catorce que la orden sugiere: cada una mata una condición que ninguna
  otra mata, y el barrido entró en el tope de tiempo.
  ⚠️ **UNA SOBREVIVIÓ AL PRIMER BARRIDO Y EL MOTIVO ES UN FRENO QUE TAPA AL QUE SE MUTA.** La 06
  mutaba sólo el `val` de `popVEstado`, y su único consumidor es el valor del selector, que con la
  lista **ya filtrada** no puede tomar una morfología nativa: poner un valor que no es ninguna de
  sus opciones deja el `<select>` en cadena vacía. O sea que el filtro de opciones la protege por
  el otro lado. Reescrita para mutar el **predicado**, que es la mitad que la etiqueta «de
  Válvulas» y el papel leen: **5 condiciones en rojo**.

- ⚠️ **DOS TRAMPAS DE INSTRUMENTACIÓN NUEVAS, Y LAS DOS COSTARON UNA MEDICIÓN.**
  (1) **`getBBox()` sobre un `<g>` devuelve coordenadas LOCALES**, o sea antes de su `transform`:
  las cuatro válvulas daban la MISMA caja `[-11,-5,22,10]` y el cruce entre ellas reportaba **seis
  superposiciones que no existen**. La caja que sirve es `getBoundingClientRect()`.
  (2) **El bucle del dibujo se apaga cuando el dibujo no se ve** —lo apaga su
  `IntersectionObserver`— y en una ventana de 1000 px de alto el esquema cae en y 2000: sin
  `scrollIntoView` el hueco de los velos se lee **siempre en 0**, que es el cuadro único de la fase
  0 y se parece a «no late».
  Y una tercera, de método: **`--solo` toma una lista separada por COMAS, no repetida.** Con
  `--solo A --solo B` corre **sólo el último**, y el arnés de lotes imprimió «1/1 ✓ sin
  regresiones» cuatro veces sobre lotes de 55 casos.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS COSTÓ TRES CORRIDAS, Y ES LA UNDÉCIMA
  TANDA SEGUIDA QUE LO PAGA.** Siempre igual: un identificador entre acentos graves dentro del
  comentario de un caso o de una sonda, y los dos cuerpos son template literals. **`node --check`
  las cazó todas**; `check_backticks.py` ninguna. Y una barra simple en un literal de expresión
  regular dentro de un template, que se cerró **no usando ninguna expresión regular**.

- **SEIS CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-534 (B11)** —el rótulo del
  derrame pleural salió del dibujo, y la condición se reescribió para exigir que el derrame se
  siga dibujando, que no haya rótulo encima y que el grado esté en el texto—, **TC-548 (A1)(A2)**
  y **(A6)** —ésta **invertida**: el contador cuenta las filas y la asistencia ya no suma—,
  **TC-577 (A2)(B1)** —nueve tarjetas → diez— y **TC-580 (D1)**, **invertida**, porque el selector
  ya no clona la lista entera del dueño; lo que conserva es la pregunta «¿las opciones salen del
  dueño?».
  ⚠️ **LOS SEIS LOS DESTAPÓ LA CORRIDA COMPLETA, NO EL CENSO**, y es el modo de falla que este
  archivo ya documenta nueve veces.

- **A/B contra HEAD, 115 escenas, 127.059 claves y 50.715 celdas de Excel: DOS diferencias de
  superficie firmada, las dos en `pbVNativa`** —la única escena con una morfología nativa sobre una
  válvula marcada—, y las dos son el mismo hecho: «tricúspide **- Mixomatosa**» → «tricúspide
  **- sin tipo consignado**», en el bloque integrado y en las **seis** plantillas del PDF. Las
  otras **114 escenas dan cero**, `vacio` y `ajeno` incluidas. **Excel 441 → 441** con las mismas
  claves y **campos guardados 965 → 965**, sin una sola escena que difiera. Las 145 de pantalla son
  el control positivo: el orden de las tarjetas (115), la fila «Cirugía y drenajes» (20) y el
  contador de fármacos (9).
  ⚠️ **El cero de los commits 5, 6 y 7 en ese arnés es un CONTROL NEGATIVO y se declara:** no mide
  la geometría del SVG. Lo que prueba es que el papel y el Excel no se movieron. La medición del
  dibujo es `scripts/_probe_popb_esq.mjs`, con sus treinta escenas y sus cajas.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **valor por valor en las 37 claves**: cero desplazamiento horizontal del cuerpo, cero
  textos recortados, **cero errores de consola y de página en los dos motores**, la tarjeta de
  pleura y pulmón a ancho completo en los dieciséis, el par eco/VD en dos columnas a 1440 y 1000 y
  en una a 768 y 390, las cinco capas encendidas, las tres válvulas con su tipo, el nivel pleural en
  44 y 72, **cero superposiciones de texto del SVG y cero textos fuera del lienzo**.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`. El único error de consola del árbol de HEAD es del arnés —se carga desde una
  copia en el temporal y ahí un recurso relativo no resuelve—, que es lo que la tanda D2 ya
  documenta.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. El diff de `index.html` son
  **493 líneas agregadas y 104 quitadas**, con **cero** `innerHTML`, `eval` o `new Function` nuevos
  y cero claves ni contraseñas. **Sin huérfanos nuevos.** 17 bloques de JS inline parsean.
  **Celular: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — idénticos a HEAD,
  medidos en un worktree con el mismo script. **No empeoró.**

- ⚠️ **EL PENDRIVE `DISK_IMG` SE DESMONTÓ A MITAD DE LA TANDA Y VOLVIÓ.** Estaba montado al abrir y
  al sellar; se desmontó —`diskutil list external` no devolvía nada, o sea el disco desconectado— y
  para la corrida final estaba de vuelta, verificado al abrir, **entre los once lotes** y al
  cerrar. La corrida que vale es la última.

- **Línea base al cierre: suite 595/600**, en once lotes **cubriendo los 600 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **verificado al abrir, ENTRE LOS ONCE LOTES y al cerrar** y
  el md5 de `index.html` **idéntico** antes y después (`b6e61443`). Los rojos son **TC-223,
  TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-557**, el intermitente que la orden
  anticipa: **corrido aislado sale VERDE**, verificado, con la firma `00000 44x44` de
  `elementFromPoint` fuera del viewport que `TGA-h` ya declara. **Ningún rojo nuevo.**
  **TC-358, TC-182 y TC-551 salieron VERDES.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 591/600 CON CUATRO ROJOS MÁS, LOS CUATRO MÍOS** —TC-534,
  TC-548, TC-577 y TC-580—, y por eso esa cifra no es la línea base. Los cuatro están adaptados y
  la de arriba sale de la corrida **limpia**, de una sola pasada sobre el árbol sellado y con el
  archivo de tests final.

- **`index.html` pasó de 10,64 MB / 149.427 líneas a 10,67 MB / 149.822** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) Sello **`v20261101-0834`**, md5 **`b6e61443`**.

- **Dónde está todo:** `docs/mapa/popb-dibujo-posoperatorio.md` (**mapa NUEVO**, 15,1 KB), las
  fichas de los cuatro casos en `docs/mapa/tests-fichas-582.md` (**archivo propio**, porque
  `tests-fichas.md` está en 34,2 KB), **dos mapas con un puntero cada uno** —medidos ANTES de
  escribir: `pa-pantalla-posoperatorio.md` 24,0 → 25,5 KB y `tests-punteros-tandas.md` 18,9 →
  20,2—, `docs/fuentes/FUENTES.md` → «La tanda POP-B» con su tabla «Cambios de evidencia» **vacía a
  propósito** y los cuatro censos con su control positivo, `docs/REGISTRO_TANDAS.md` → el bloque de
  esta tanda, y `docs/PENDIENTES.md` → **OCHO** cosas declaradas (**POPB-a** a **POPB-h**).
  ⚠️ **`congenitas-otros.md` (34,5 KB) no se tocó**, y `valvulas.md` (33,9) tampoco.

### La pantalla de Marfan, su tarjeta y el Z de la raíz — «MARFAN-2» (2026-11-02)

- **CINCO commits, y los CUATRO de código se hicieron enteros.** `23212e2` (1) · `b626253` (2) ·
  `92b1cda` (3) · `0d2217d` (4) · el de cobertura y documentación. Al empezar, `origin/main` =
  `HEAD` = **`40fb624`**, el cierre de MARFAN-1, ya publicado, con md5 **`05086dab`** y el
  pendrive `DISK_IMG` montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: la tarjeta de criterios tenía 538 px de
  scroll interno a 1440×900.** Hoy **cero**, con 26 px de margen, idéntico en Chrome y WebKit.
  ⚠️ **EL QUE SCROLLEA ES `#crit-card`, NO `#crit-cuerpo`**: la tarjeta lleva su `max-height` y
  su `overflow:auto` en la CAJA, así que el cuerpo informa su alto COMPLETO aunque no entre, y
  medirlo a él da «scroll interno 0» sobre una tarjeta que se corta. Y el alto del modal tampoco
  sirve de presupuesto: en cuanto el contenido entra, la caja **se encoge** a su contenido.
  HEAD: 1388 de alto en 850 de caja. Hoy: 826 de 826.

- **EL GLOBO QUE «PASABA DESAPERCIBIDO» NO ERA OTRO COMPONENTE: ERA OTRO CARÁCTER.** Censado en
  HEAD: **74** botones usan `&#9432;` / `U+24D8` —la «i» dentro de un círculo, ⓘ— y **20** usaban
  `&#8505;` / `U+2139` —INFORMATION SOURCE, una «i» suelta, ℹ—, que son los cuatro de MARFAN-1
  más los diecinueve por rasgo. Misma clase `.vinfo-btn vinfo-btn-44`, mismo tamaño, mismo color.
  De **veintiuno a cuatro**, los cuatro con el glifo estándar y 44×44.

- ⚠️ **LAS DIECINUEVE DEFINICIONES NO SE PIERDEN, Y ES POR CONSTRUCCIÓN.** Siguen siendo las
  entradas `mfs-*` de `VINFO` —su dueño único— y los dos globos de grupo las **leen** de ahí,
  agrupadas en las diez zonas del cuerpo. Medido: **19 de 19 publicadas y 19 de 19 con su
  folio**, en los dos motores, con una condición que **siembra un centinela** en una entrada de
  `VINFO` para probar que no hay una segunda copia.
  ⚠️ **Son DIECINUEVE y no dieciocho**, que es lo que la orden anticipa: trece rasgos del Box 2
  más seis criterios aparte, contados sobre `MFS_SCORE` y `MFS_APARTE`.

- ⚠️ **AMPLIACIÓN DE LA REGLA FIJA, DECISIÓN DEL MÉDICO: LA PANTALLA TAMPOCO DA INDICACIONES.**
  Los once estados de la pastilla pasan a decir si el paciente **cumple** o **no cumple** los
  criterios. **Las once claves de `marfanEstado` NO se tocan** —las lee el Laboratorio— y **los
  colores tampoco**: el color sigue graduando I, IIa y IIb, así que la información no se pierde.
  `ETQ` es local de `marfanSync` y, censado, **ningún otro módulo lo lee**.

- ⚠️ **DOS PREMISAS DE LA ORDEN ERAN FALSAS, Y ESTÁN MEDIDAS.**
  1. **El título «Aortopatía hereditaria» NO es más grande.** Los dos únicos elementos de la
     sección que llevan esa palabra son el encabezado del acordeón —**11px/700**, idéntico a los
     otros once de C. Congénitas— y el `calc-lbl` de la fila sin datos —**12px/500**, idéntico a
     las otras **270** del documento—. No se tocó ningún tamaño: achicar uno lo sacaría de la
     convención. → **MF2-d**.
  2. **El selector de un criterio aparte NO contesta sólo «Sí» y «No».** El de los otros
     síndromes contesta «Sí, sin rasgos», que con el ancho que le puse primero salía **cortado en
     los dieciséis cruces** — y la escena del caso no lo veía porque medía los seis en su opción
     vacía. Lo cazó la sonda de dos motores, no la lectura.

- **EL Z CALCULADO SE PARÓ, Y LA CONDICIÓN ES LA QUE LA ORDEN PONE.** **Devereux 2012 NO está en
  la biblioteca**: censados **por contenido** —no por nombre de archivo— los **245 PDF** de las
  28 carpetas, con **control positivo** (la misma búsqueda encuentra «revised Ghent nosology» en
  seis archivos). Los **68** PDF de catorce hojas o menos se listaron y ninguno es él.
  ⚠️ **Y LA REFERENCIA DEL Z EN EL LOEYS NO ES DEVEREUX 2012**, leído en imagen: el folio 479
  remite, para el diámetro de borde de ataque a borde de ataque en diástole, a su referencia
  **13** —**Roman MJ, Devereux RB, Kramer-Fox R, O'Loughlin J, Am J Cardiol 1989;64:507-12**—,
  que tampoco está. La **14** —Lin FY y cols., *J Cardiovasc Comput Tomogr* 2008;2:298-308— la
  cita para la tomografía y la resonancia. → **MF2-a**.
  **Lo que sí se hizo: el campo manual.** `mfs_z_raiz`, campo guardado, **sin columna de Excel**,
  con round-trip comprobado por las funciones reales, y las reglas 1, 2, 3 y 7 leyéndolo también
  **sobre un estudio archivado** — lo que MARFAN-1 no podía.

- **18/18 MUTACIONES DIRIGIDAS MUERTAS** sobre el árbol sellado, en worktree y nunca sobre el
  vivo, con guarda de md5. **Cuatro de las dieciocho no revierten nada: la aplican de más**,
  porque las condiciones que las matan son **controles negativos**.
  ⚠️ **La 01 sobrevivió al primer barrido y estaba MAL ESCRITA**: agregaba un atributo al
  contenedor y no movía ningún campo, o sea que no inyectaba el defecto.

- **EL PAPEL NO SE MOVIÓ, con el PDF y el PPT generados de verdad:** A/B contra HEAD con 19
  escenas, 323 claves, **8379** celdas de Excel, **11.700** textos de PDF en SEIS plantillas y
  **475** del PPT. **CERO diferencias** en informe (tres estilos), EN SUMA, las **441** columnas,
  el PDF y el PPT. Las 34 de pantalla son las autorizadas: 17 en la cápsula y 17 en `maxAo`.

- **ONCE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-116** y **TC-512** (la
  lista de factores se lee del globo; ⚠️ hay que tomar **sólo su párrafo**, porque el resto trae
  «45 mm» y haría pasar por «5 mm» un texto que no es el que el caso mide), **TC-125** (19 → 20
  campos del estudio en el panel), **TC-471**, **TC-500** y **TC-502** (el registro 96 → 97 y las
  tarjetas sin botón 45 → 26), **TC-535** (los globos de 44×44, 37 → 18), **TC-587** y **TC-588**
  (el Z ya no obliga a abrir la tarjeta), **TC-589** (la pastilla y los globos, con dos
  condiciones **nuevas** que exigen las diecinueve definiciones con su folio) y **TC-590** (la
  tarjeta pasa de tres columnas a bandas más figura).
  ⚠️ **TC-125 y TC-512 los destapó la CORRIDA COMPLETA y no el censo**, que es el modo de falla
  que este archivo ya documenta nueve veces.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS COSTÓ CINCO CORRIDAS, Y ES LA
  DECIMOTERCERA TANDA SEGUIDA QUE LO PAGA.** Siempre igual: un identificador entre acentos graves
  dentro del comentario de un caso o de una sonda, y los dos cuerpos son template literals.
  `check_backticks.py` **no cazó ninguna**; **`node --check` las cazó todas**. Lo que acabó
  funcionando fue un control automático que recorre los bloques nuevos y aborta si encuentra uno.
  ⚠️ **Y una barra invertida simple, otra vez**: `/^\([1-7]\) /` escrito con una barra llega al
  navegador como `/^([1-7]) /` —un grupo de captura— y deja de pedir el paréntesis. Se cerró **no
  usando ninguna expresión regular**.

- ⚠️ **Y UNA TRAMPA DEL ARNÉS QUE COSTÓ DOS CORRIDAS: el cuerpo de un caso tiene que DEVOLVER su
  IIFE.** `ev` lo envuelve en una función **no async** (`(function(){ ... })()`), así que
  `(async () => {...})();` sin `return` evalúa la promesa y devuelve `undefined`: el runner dice
  «el caso no declara NINGUNA condición» y no hay forma de ver el error adentro. Y la comparación
  va por `String(t[1]) === String(t[2])`, no por `===` estricto.

- **Línea base al cierre: suite 604/609**, en doce lotes **cubriendo los 609 casos distintos**
  —contados nombre por nombre, no por la suma de los lotes—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **verificado al abrir, ENTRE LOS DOCE LOTES y al cerrar** y
  el md5 de `index.html` **idéntico** antes y después (`30f48f68`). Los rojos son **TC-223,
  TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-182**, el intermitente que
  IMÁGENES-3 y TGA-2 ya declaran: **corrido aislado sale VERDE**, verificado. **Ningún rojo
  nuevo.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 603/609 CON DOS ROJOS MÁS, LOS DOS MÍOS** —TC-125 y
  TC-512—, y por eso esa cifra no es la línea base. Los dos están adaptados y la de arriba sale
  de la corrida limpia, de una sola pasada sobre el árbol sellado y con el archivo de tests final.
- **Semgrep 124 WARNING / 0 ERROR**, la línea base. **Excel 441** columnas con las mismas claves.
  **Censo de campos guardados 984 → 985**: el nuevo es `mfs_z_raiz`, el autorizado, y no se perdió
  ninguno. **Sin huérfanos nuevos.** 17 bloques de JS inline parsean. El diff de `index.html` son
  **574 líneas agregadas y 163 quitadas**, con **cero** `innerHTML`, `eval` o `new Function`
  nuevos —los dos que el diff muestra son comentarios— y cero claves ni contraseñas.
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base
  exacta. **No empeoró.**
- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **sin una sola diferencia** en las once claves comparadas: lado a lado desde 900 px
  y apilado por debajo, la tarjeta con **cero scroll interno a 1440 y 1000**, las tres bandas con
  la figura a la derecha, los tres globos en 44×44 con el glifo estándar, las **19** definiciones,
  **cero** cita en el cuerpo de la tarjeta, la conclusión en sus cuatro filas, el papel sin la
  conclusión y sin el Z, **cero** desplazamiento horizontal, **cero** textos recortados y **CERO
  errores de consola y de página en los dos motores**.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
- **`index.html` pasó de 10,75 MB / 150.960 líneas a 10,78 MB / 151.374** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) Sello **`v20261101-1540`**, md5 **`30f48f68`**.

- **Dónde está todo:** `docs/mapa/marfan2-pantalla-z.md` (**mapa NUEVO**, 12,4 KB), las fichas de
  los cuatro casos en `docs/mapa/tests-fichas-591.md` (**archivo propio**, porque
  `tests-fichas.md` está en 34,2 KB), el puntero en `docs/mapa/marfan1-ghent.md` § 6-bis y en
  `docs/mapa/tests-punteros-tandas.md`, `docs/fuentes/FUENTES.md` → «La tanda MARFAN-2» con las
  referencias 13 y 14 transcriptas en imagen, el censo del Devereux con su control positivo y la
  tabla «Cambios de evidencia» de ocho filas, `docs/REGISTRO_TANDAS.md` → el bloque de esta
  tanda, y `docs/PENDIENTES.md` → **OCHO** cosas declaradas (**MF2-a** a **MF2-h**).
  ⚠️ **`congenitas-otros.md` (34.540 B) NO se tocó**, que es lo que la orden pide.

### La tarjeta de criterios de Marfan con el artículo original — «MARFAN-1» (2026-11-01)

- **SIETE commits, y los SEIS de código se hicieron enteros.** `8d95df3` (1) · `31ee701` (2) ·
  `b032969` (3) · `7d39fb9` (4) · `b98ae7a` (5) · `aeeae9e` (6) · el de cobertura y
  documentación. Al empezar, `origin/main` = `HEAD` = **`27a917d`**, el cierre de POP-B, ya
  publicado, con md5 **`b6e61443`** y el pendrive `DISK_IMG` montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

- **LA FUENTE SE LEYÓ EN IMAGEN Y LA REGLA DE FOLIO SE COMPROBÓ EN EL PIE IMPRESO DE CUATRO
  HOJAS.** Loeys 2010, *J Med Genet* 47:476-485; **FOLIO = HOJA + 474**, verificado en las hojas
  3 (477), 4 (478), 5 (479) y 6 (480). **Todo lo que la orden anticipaba se confirmó**, incluido
  que los asteriscos del Box 1 están en **1, 3, 6 y 7 y no en 2, 4 ni 5**, verificado glifo por
  glifo.

- **UNA PREMISA DE LA ORDEN ERA FALSA, Y ESTÁ MEDIDA: el último caso de la suite no es TC-580,
  es TC-585.** 585 numéricos sin huecos más quince TC-GR = **600** casos distintos. Los cinco
  nuevos van de TC-586 a TC-590.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: la tarjeta sumaba la ectopia lentis al
  puntaje y el Box 2 no la incluye.** Son cinco defectos medidos contra el original: la ectopia
  dentro del score con 3 puntos; el máximo declarado 20 con once rasgos que sumaban **19**;
  cinco rasgos faltantes más la deformidad del retropié; los calificadores «que requiere cirugía»
  y «moderado», que esta revisión **eliminó** expresamente (folio 480); y los epónimos
  «Walker-Murdoch» y «Steinberg», que el artículo **no trae**. El único epónimo que la fuente sí
  trae es la **línea de Köhler**, y ése se conserva.

- **DIECINUEVE CAMPOS GUARDADOS NUEVOS, todos de la lista autorizada, y CERO columnas de Excel.**
  Censo **965 → 984**, cero perdidos. El Excel sigue en **441** columnas con las mismas claves.

- ⚠️ **LA GUARDERÍA NO ES UN RESTO, Y EL PRÉSTAMO TUVO UN DEFECTO QUE CAZÓ UNA MEDICIÓN.**
  `critAbrir` hace `innerHTML = render()`, así que un campo que viviera dentro de la tarjeta se
  destruiría al reabrirla y al abrir **otro** panel de criterios. La primera versión de
  `_mfsDevolver` devolvía la guardería **vacía** —los bloques quedaban en los huecos de la
  tarjeta— y tras cerrar y reabrir el score volvía a 0. Hoy los recoge **antes** de moverla.

- ⚠️ **EL Z DE LA RAÍZ NO ES UN CAMPO GUARDADO DE ESTA APLICACIÓN**, censado el documento
  entero. Vive en la tarjeta y no viaja con el estudio, así que sobre un estudio **archivado**
  las reglas que dependen de él quedan en «sin dato (falta el valor del Z)» salvo que haya
  disección. **Ningún Z se calcula** con una fórmula que la app no tenga. → **MF1-a**.

- **LAS SIETE REGLAS, CON TRES ESTADOS POR CONDICIÓN.** Cualquiera falsa → no cumple; todas
  verdaderas → cumple; si no → sin dato. **Una condición desconocida no es una condición falsa.**
  «Ao» es el Z **o la disección**, que es la definición literal del Box 1: por eso la disección
  cumple sin mirar el Z y, en la regla 7, sin mirar la edad.
  ⚠️ **Con el formulario vacío las reglas 3 y 6 dicen «No cumple» y no «Sin dato»**, porque el
  puntaje siempre es calculable; el porqué lo aclara con «con lo tildado». → **MF1-b**.

- ⚠️ **EL 3b NO TENÍA NADA QUE RETIRAR AL PRINCIPIO, Y SÍ AL MEDIRLO POR ESTADO.** El papel ya
  estaba limpio —lo dejó así la B3 del 30/10—, pero censando los **once** estados de la cascada,
  **uno** llevaba «ESC 2024» al **EN SUMA**: el de síndrome sin declarar, que es uno de los dos
  que suben `r.txt` tal cual. Retirado; su contenido queda en la cápsula y en el globo nuevo.

- **EL CUADRO «CONDUCTA AÓRTICA» CONSERVA SU VEREDICTO Y SUS MILÍMETROS**, y la guía, la tabla,
  el folio y la clase pasaron a un globo. `marfanEstado` separa `txt` de `cita` y las dos salidas
  se arman de las mismas piezas. Las claves `cx_i`, `cx_iia` y `cx_iib` **no se tocan**: las lee
  el Laboratorio.
  ⚠️ **Un `dyn` de VINFO devuelve un NODO y no una cadena**: con HTML, la tarjeta publicaba «No
  se pudo construir la tarjeta.» en los ocho cruces. Lo cazó la sonda, no la lectura.

- **VEINTIÚN GLOBOS, y donde el artículo no define algo lo dicen y no lo completan.** La
  discrepancia de la miopía está **confirmada y escrita**: el Box 2 publica «más de 3» y el folio
  480 la escribe **de las dos formas**.
  ⚠️ **El globo lleva `stopPropagation` y va DENTRO del rótulo**: la fila es un `<label>`, así
  que sin eso **abrir la ayuda tildaría el rasgo**.

- **LA FIGURA: 20 DE 20 ESCENAS IDÉNTICAS A LA DEMO**, renderizando las dos con los mismos datos
  en la misma corrida y comparando el SVG de marcas textual, los ocho factores de forma con
  tolerancia 1e-6 y las cuatro rutas interpoladas. **No se comparan píxeles**: dos motores dan
  píxeles distintos con el mismo SVG. `prefers-reduced-motion` verificado **con su control**.
  ⚠️ **La casilla «Superponer la figura de referencia» se estaba guardando**: el guión medio
  **no alcanza por sí solo**, porque `_noEsDelEstudio` va por PREFIJO. Lo cazó una medición y el
  censo había subido a 985.

- **18/18 MUTACIONES DIRIGIDAS MUERTAS EN EL PRIMER BARRIDO**, en worktree y nunca sobre el vivo,
  con guarda de md5 antes y después, y **cada una mató exactamente su caso**. **Cuatro de las
  dieciocho no revierten nada: la aplican de más**, porque las condiciones que las matan son
  controles negativos.

- ⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS COSTÓ TRES CORRIDAS, Y ES LA DUODÉCIMA
  TANDA SEGUIDA QUE LO PAGA.** Lo que acabó funcionando fue **contar los acentos graves de cada
  caso después de cada edición y exigir el número exacto** —dos por caso— más `node --check`.
  ⚠️ **Y dos trampas del arnés:** un caso devuelve `{ extra: [...] }` y no el array pelado —con
  el array el runner avisa «no declara NINGUNA condición», que es justo para lo que ese guardián
  está—; y **caer contra HEAD por excepción no es caer**, así que los cinco llevan helpers
  tolerantes al árbol viejo. Es la lección de TC-546.

- **CUATRO CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**, y los cuatro por lo mismo:
  afirmaban que la cápsula publica la clase y la tabla. **TC-116** y **TC-512** leen ahora la
  cita junto al texto —y TC-512 además el globo—, **TC-552 (E9)** quedó **invertida** y
  **TC-125** se reescribió: probaba la tarjeta vieja entera y su invariante «ningún control del
  panel lleva id» se **invirtió a propósito** para Marfan.
  ⚠️ **Y esa condición invertida cazó un matiz al escribirla:** son **veinte** controles con id,
  no diecinueve — el vigésimo es la casilla de la figura, que no es del estudio. Separarlos la
  dejó más fuerte.

- **`index.html` pasó de 10,67 MB / 149.822 líneas a 10,75 MB / 150.960** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) Sello **`v20261101-1111`**, md5 **`05086dab`**.

- **Dónde está todo:** `docs/mapa/marfan1-ghent.md` (**mapa NUEVO**, 11,1 KB), las fichas de los
  cinco casos en `docs/mapa/tests-fichas-586.md` (**archivo propio**, porque `tests-fichas.md`
  está en 34,2 KB), **cuatro mapas con un puntero cada uno** —medidos ANTES de escribir, todos
  por debajo de 29 KB—, `docs/fuentes/FUENTES.md` → «La tanda MARFAN-1» con el Box 1 y el Box 2
  transcriptos, la regla de folio comprobada en cuatro hojas y la tabla «Cambios de evidencia»
  de trece filas, `docs/REGISTRO_TANDAS.md` → el bloque de esta tanda, y `docs/PENDIENTES.md` →
  **OCHO** cosas declaradas (**MF1-a** a **MF1-h**).
  ⚠️ **`congenitas-otros.md` (34.540 B) NO se tocó**, que es lo que la orden pide.

### El posoperatorio terminado, Marfan y el dibujo al PDF — «POP-C» (2026-11-02)

- **ONCE commits, y los DIEZ de código se hicieron enteros.** `4593686` (1) · `afdd4da` (2) ·
  `7356d94` (3) · `20b164a` (4) · `e14e17a` (5) · `e2a794b` (6) · `3093691` (7) · `8f50dc6` (8)
  · `4fe6947` (9) · `1e3514e` (10) · `ca97fe2` el de cobertura y documentación. Sello
  **`v20261101-2008`**, md5 de `index.html` **`747b6597`**. Al empezar, `origin/main` = `HEAD` =
  **`559ad60`**, el cierre de MARFAN-2, ya publicado, con el pendrive `DISK_IMG` montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  Cierra **POPB-a**, **POPB-d**, **POPB-e**, **POPB-h** y **MF2-a**.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ, EN UNA LÍNEA: el selector del tipo de válvula operada no
  seguía a Válvulas en NINGUNA de las cuatro** — ni al poner la prótesis, ni al cambiarla, ni al
  sacarla. El médico lo reportó con una sola; medido con gestos reales, eran las cuatro y en todo
  gesto. `popCxVSync` tenía **un solo llamador**, `popSync`, y el barrido de espejos lo excluye a
  propósito porque escribe campos del estudio. **El papel ya leía el dueño**, verificado.

- **LAS DOS FUENTES SE LEYERON EN IMAGEN, Y UNA DIO VUELTA UN PENDIENTE.**
  **Devereux 2012** (*Am J Cardiol* 2012;110:1189-94) **SÍ está desde el 2026-11-01**: MARFAN-2
  lo había censado por contenido sobre los 245 PDF y no estaba, y por eso paró el cálculo. Hoy el
  Z de la raíz se calcula con su Tabla 1.
  ⚠️ **SU FOLIO DE REVISTA NO ES DERIVABLE Y SE DECLARA:** el PDF es el **manuscrito de autor de
  NIH-PA**, de catorce hojas, cuyo pie dice «Page N» del manuscrito mientras la revista son seis
  páginas. Se cita **por hoja con su pie impreso**.
  **Consenso de Shock Cardiogénico de la SAC 2024**, sección 6.14, hojas 91 a 93 = folios 83 a 85,
  **folio = hoja − 8** comprobado en tres encabezados. Sus cinco criterios coinciden uno por uno
  con lo que la orden anticipaba, y el índice cardíaco es **estricto**: «IC < 2,2».

- ⚠️ **EL CORTE DE 21 mm DEL PERICARDIO NO EXISTE: PARADO Y REPORTADO.** La orden pide alinearlo a
  20 «sólo si el 21 es el corte de gravedad del derrame». Censado: `DPT_VCI_PLETORA_MM` **ya vale
  20** (Tabla 17, ESC 2025) y `DPT_TAM` también. Los **únicos** 21 mm son la categoría C de la
  probabilidad de HTP (ESC/ERS 2022), que es **otra guía y otro módulo**, y el código ya declara
  esa divergencia. No había nada que alinear.

- ⚠️ **EL CORTE DE BAJO GASTO DIVERGE DE HEMODINÁMICA A PROPÓSITO.** `_popIcBanda` usa `< 2,2` y
  `_icBanda` sigue en `<= 2,2` por la decisión del médico del **21/10/2026**. Esta orden cambia el
  corte **sólo** en el posoperatorio, así que la divergencia **se declara** — el mismo patrón con
  que `DPT_VCI_PLETORA_MM` convive con el `vciD > 21` del HTP. **Sólo es observable con el PiCCO**,
  que el médico tipea: las otras tres fuentes dividen un gasto por la superficie corporal.

- **LA COMPARACIÓN OBLIGATORIA CON LA DEMO v9: 180 de 180 escenarios IDÉNTICOS.** No se comparan
  píxeles: se **extraen** `valveGeo`, `openFrac` y `plume` del archivo por marcas literales —cada
  una exigida UNA sola vez, así que si la demo cambia la extracción falla ruidosamente—, se
  evalúan en una página **en blanco** y se comparan los **números**.
  ⚠️ **LA TOLERANCIA DE LA PLUMA ES 0,005 INCLUSIVE Y NO ES ARBITRARIA:** la app redondea la ruta
  a dos decimales y la demo deja el crudo, así que la diferencia máxima **posible** es medio ulp.
  Seis escenarios caen justo ahí y el `>` estricto los contaba como distintos.

- ⚠️ **LOS TRES AVISOS DE POPB-h, MEDIDOS: `color` NO «cae en negro».** Se **hereda**, así que caía
  en el texto del tema. Lo que de verdad desaparecía es el fondo pastel, el borde y **el anillo del
  botón, que no se dibujaba en absoluto** (`box-shadow: none`). El aspecto **no cambia donde ya
  funcionaba**: `--orange` es lo que `.amilo-root` le asigna a `--amber`.

- **DOS DEFECTOS PROPIOS QUE LA SUITE COMPLETA DESTAPÓ, los dos del commit 9:** las letras E y A
  del trazado **se superponían y se salían del lienzo**. Nacían sin `display:none` **propio** —un
  `display:none` en el padre no se hereda al computado del hijo, y `getBBox` sigue devolviendo
  caja—, así que sin posicionar quedaban las dos en el origen. Lo cazó **TC-585**.

- ⚠️ **DOS HALLAZGOS PREEXISTENTES, DECLARADOS Y NO TOCADOS.** `popEsqArrancar` **no vuelve a
  arrancar** el bucle del dibujo al reaparecer, porque `popEsqFrame` deja de re-agendarse sin
  limpiar `_popEsq.rafId` — verificado **idéntico en HEAD byte por byte** (→ POPC-k). Y el botón
  «Usar este valor» mide **95×30**, heredando el piso táctil que MF2-f ya declara (→ POPC-l).
  ⚠️ **Y EL DENOMINADOR DEL LATIDO ES `visible`, NO `rafId`:** el id viejo da un **falso «sí»**
  mientras `popEsqFrame(0)` deja todo en la fase cero. Costó una corrida.

- **Línea base al cierre: suite 610/615**, en doce lotes **cubriendo los 615 casos distintos**
  —contados nombre por nombre, con una guarda que compara el total con los distintos—, en UNA sola
  pasada sobre el árbol sellado **y commiteado**, con el pendrive `DISK_IMG` **verificado al abrir,
  en los DOCE lotes y al cerrar**, **615 de 615 ejecutados** y el md5 de `index.html` **idéntico**
  antes y después (`747b6597`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de
  siempre, más **TC-557**, el intermitente que `TGA-h` declara: **corrido aislado pasa a la
  segunda**, verificado. **Ningún rojo nuevo.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO OCHO ROJOS MÁS, LOS OCHO MÍOS** —TC-253, TC-534, TC-535,
  TC-548, TC-559, TC-562, TC-585 y TC-588—, y por eso esa cifra no es la línea base. Los ocho son
  casos viejos que afirmaban el comportamiento anterior, cinco de ellos **el día que ellos mismos
  anunciaban**; están adaptados, invertidos donde correspondía.
  ⚠️ **Y EL ARNÉS DE LOTES CONTABA UNO DE MENOS:** `wc -l` sobre un volcado que no termina en
  salto. Los 615 **sí** corrían —`sed` toma hasta el final— pero el contador decía 614. Corregido
  con `grep -c .` y una guarda que compara el total con los distintos.

- **31/31 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5
  antes y después. **Siete de las treinta y una no revierten nada: la aplican de más.**
  ⚠️ **Dos sobrevivieron al primer barrido y las dos eran cobertura que faltaba**, una de ellas en
  dos pasos: los chorros son **pulsátiles** y una foto cae en un instante al azar del ciclo.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base. **Excel 441** columnas con las mismas claves en
  las 136 escenas. **Campos guardados: +1**, `pop_esq_pdf`, el único autorizado. **Sin huérfanos
  nuevos.** 17 de 19 bloques de JS inline parsean, idéntico a HEAD.
- **CELULAR: 59 hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — medido contra HEAD
  **uno por uno**: idéntico. **No empeoró.**
- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), **sin una sola diferencia entre motores**: el selector siguiendo al dueño, los dos
  rótulos de la conclusión, el botón habilitado, los tres avisos resolviendo su color, las
  válvulas, los catéteres, los trazados y los chorros, el Z en +1.72 con su nota; **cero** errores
  de consola y de página, **cero** desplazamiento horizontal, **cero** textos recortados y **cero**
  superposiciones de texto del SVG.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema.
- **EL DIBUJO, EN 32 ESCENAS:** cero superposiciones de texto y cero elementos fuera del lienzo.
- **A/B contra HEAD: 136 escenas, 153.120 claves y 59.976 celdas de Excel. OCHO escenas con
  diferencia de papel, y las ocho son las autorizadas:** tres de la línea de Marfan, una del corte
  del índice en el 2,20 exacto y cuatro de «integrar con cualquier dato». Las otras **128 dan
  cero**, `vacio` y `ajeno` incluidas. El campo nuevo está **vacío en las 136**.
- **`index.html` pasó de 10,78 MB / 151.374 líneas a 10,84 MB / 152.233** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.)

- **Dónde está todo:** `docs/mapa/popc-posoperatorio-marfan.md` (**mapa NUEVO**, 19,0 KB), las
  fichas de los seis casos en `docs/mapa/tests-fichas-595.md` (**archivo propio**), **cuatro mapas
  con un puntero cada uno** —medidos ANTES de escribir, todos por debajo de 27 KB—,
  `docs/fuentes/FUENTES.md` → «La tanda POP-C» con las dos fuentes transcritas en imagen, el censo
  del corte de 21 mm y la tabla «Cambios de evidencia» de ocho filas, `docs/REGISTRO_TANDAS.md` →
  el bloque de esta tanda, y `docs/PENDIENTES.md` → **DOCE** cosas declaradas (**POPC-a** a
  **POPC-l**).
  ⚠️ **`congenitas-otros.md` (34.540 B) NO se tocó**, que es lo que la orden pide.

### Las opciones de plastia, TEER y TAVI, los retoques y el PPT — «VAL-PPT» (2026-11-02)

- **DOCE commits, y los OCHO de código se hicieron.** `9da2a0e` (1) · `7f25750` (2) ·
  `76a458a` (3) · `84e5196` (4) · `71d76a6` (5a) · `1aa31be` (6) · `84f1941` (7) · `a0e8dd6` (8)
  · `2073e3e`, `aa43ecc`, `67a71b9` y `7bd0b6a`, los cuatro de cobertura y documentación. Sello
  **`v20261102-0107`**, md5 de `index.html` **`738944d2`**. Al empezar, `origin/main` = `HEAD` =
  **`5ae3959`**, el cierre de TGA-3, ya publicado, con md5 **`7ff2a3f2`** y el pendrive
  `DISK_IMG` montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  ⚠️ **LOS COMMITS 5b, 6a Y EL LABORATORIO SE PARARON Y SE REPORTARON**, cada uno con su
  medición: el 5b porque cuatro de las ocho ramas de conducta de `tgaConclusion` **no tienen
  respaldo** en las 26 recomendaciones de `TGA_IND_RECS`; el 6a porque su premisa **no se
  reproduce** —el resumen de la VAB SÍ dice «VAB» en seis escenarios, medido—; y el Laboratorio
  porque la orden lo pone fuera de alcance.

- **EL INVENTARIO SE MIDIÓ EN CHROME, NO SE LEYÓ, Y DIO TRES DEFECTOS.** No se puede medir un
  valor desconocido asignándolo —un `value` que no es ninguna `<option>` deja el select en
  cadena vacía—, así que la sonda **inyecta la option al vuelo**. Con eso:
  1. **El importador descartaba la FILA ENTERA del paciente.** `_labXlsLista` devolvía `null`
     para los cuatro valores nuevos, y un null pierde el nombre, la cédula, la FEVI y el
     informe —no la celda—.
  2. **El fallback destruía el acrónimo.** El informe FIRMADO publicaba «Válvula tricúspide de
     morfología **teer tricuspídeo (t-teer)**». Es el mismo defecto que la nota de
     `VALV_MORF_FRASE` documenta para TAVI, por la otra puerta —y apareció una **tercera** vez
     en el texto del esquema del posoperatorio: «mitral con **tEER** mitral»—.
  3. **El dibujo pintaba todo lo que no dijera «mecánica» como protesis BIOLÓGICA.**

- **EL REPARTO POR VÁLVULA NO SE TRANSCRIBE EN NINGUNA LISTA**: sale por construcción de las
  `<option>` del propio dueño. Medido: aórtica con TAVI, mitral y tricúspide con plastia y TEER,
  **pulmonar sin ninguno de los tres**. Y la sincronía da **13/13 en los dos sentidos**, con
  gestos reales y la pestaña y el acordeón abiertos por su botón real.

- **NINGÚN CORTE NUEVO, Y LO QUE LO SOSTIENE SON CUATRO FUENTES LEÍDAS EN IMAGEN** con su regla
  de folio comprobada en el pie impreso: los **tres grados** de la IM residual (ASE 2019, folio
  460), el **PISA descartado** tras el borde a borde por TRES caminos independientes (450, 451 y
  458), el gradiente de 5 mmHg como **predictor y no corte** (452 y 459), los cortes de **6 mmHg
  y 1,8 cm²** de la estenosis mitral **iatrogénica** (Nicoara 2020, folio 702, que **no se
  aplican**: son del quirófano), el **T-TEER** en la Recommendation Table 9 (ESC/EACTS 2025,
  hoja 53 = folio **4687**, sin cortes propios) y el **estudio de base de 1 a 3 meses** de la
  TAVI (ASE 2024, folio 20).
  ⚠️ **DOS PREMISAS DE LA ORDEN NO SE CONFIRMARON**: el «baseline 1-3 meses» está en la **Table
  6**, no en la 5; y el **seguimiento anual del TEER NO está** en el documento —su único
  «annually» es de la válvula pulmonar transcatéter—, así que se paró y no se escribió.

- **EL DEFECTO MÁS GRANDE QUE CERRÓ EL PAPEL, EN UNA LÍNEA: con una plastia o un TEER mitral
  como ÚNICO hallazgo, el cuerpo la describía y el EN SUMA decía «Estudio sin alteraciones
  estructurales ni funcionales significativas».** Sólo la mitral, y está medido por qué: la
  tricúspide ya subía por su rama de morfología y la aórtica con TAVI la toma el bucle de
  prótesis. No se agrega una palabra: `reusar` empuja la línea que el cuerpo ya imprimió.

- ⚠️ **LA COMPARACIÓN CON LA DEMO ENCONTRÓ UN DEFECTO REAL, Y ES SU VALOR.** La primera versión
  le dio a la TAVI los velos de la **biológica** —bisagras en ±8 y largo 8— y la demo los dibuja
  en **±7 con largo 6**: las 44 escenas de TAVI salieron distintas. Tras cerrarlo: **139 iguales
  y CERO distintos**, siete piezas estáticas y 132 cruces de tipo × válvula × fase, con
  tolerancia 0,005 declarada.

- **LAS TRES ETIQUETAS DEL TEER SALEN DEL PAPEL: de 18 superficies a CERO.** Medido **con el
  módulo integrado** —sin eso un cero no prueba nada—: la hoja del PDF las traía en sus SEIS
  plantillas, «NO apto» ×5, «Heart Team» ×2 y «anatomía compleja» ×1 sobre 3.562 caracteres.
  El CONTROL POSITIVO —la pantalla— **las conserva intactas**, y **ningún número medido
  desaparece**, verificado número por número.

- ⚠️ **EL COMMIT 5b SE PARÓ ENTERO, Y LA VERIFICACIÓN ES LO QUE LO PARA.** La orden lo
  condiciona a que «las recomendaciones ya viven en la Evidencia». Verificado sobre las **26
  recomendaciones** de `TGA_IND_RECS`: **cuatro** de las ocho ramas de conducta de la TGA no
  tienen respaldo —el seguimiento anual, el tratamiento médico de insuficiencia cardíaca, la
  resincronización **por disfunción** (la Evidencia sólo la publica por bloqueo
  auriculoventricular) y la obstrucción subaórtica—. Aplicarlo entero las perdería de la
  aplicación; a medias deja una pantalla incoherente. → **VP-a**.

- ⚠️ **Y EL 6a NO SE REPRODUCE.** El resumen de la VAB **sí** dice «VAB» con la morfología de
  Válvulas, medido en **seis** escenarios con su control negativo y con el acordeón abierto por
  su botón real (ancho > 0). No se cambió nada. → **VP-b**.

- **EL RÓTULO DE LA MIOCARDIOPATÍA PASA A 2024, Y SÓLO EL AÑO.** Verificado en imagen: la
  AHA/ACC 2024 (Ommen, *Circulation* 2024;149:e1239-e1311) **está** en la biblioteca, hoja 29 =
  folio **e1267**, y su Recomendación 3 (COR 2a · B-NR) lista los **cinco factores mayores**, que
  coinciden **uno por uno** con los de `mchAHA`; la Recomendación 6 publica los dos árbitros.
  El score no se movió.

- **EL PPT: la disposición ya no es fija.** `igPptDisposicion` es una función **pura** que elige
  la de mayor área sin deformar, con **tolerancia declarada del 1 %** y empate a favor de la que
  la app ya usaba. La diferencia observable: **cuatro verticales pasan de 2×2 a 4×1**, de 14,1 a
  **44,4** pulgadas cuadradas.
  ⚠️ **EN UNA HOJA 16:9 EL APILADO NO GANA NUNCA**, así que «2x1 siempre» no distinguiría una
  regla que funciona de una que devuelve lo mismo: el control es la **hoja vertical**, donde la
  misma función elige 1×2.

- **EL BUCLE CON VARIOS VIDEOS YA FUNCIONABA, Y SE VERIFICÓ CON UN MP4 REAL** (H.264, `moov`
  antes de `mdat`): sobre el `.pptx` generado de verdad, **28 de 28 XML bien formados**, **dos
  videos en la MISMA diapositiva** con `repeatCount="indefinite"` y spids **distintos**, y
  **cero referencias colgadas**.
  ⚠️ **CADA VIDEO ARRANCA CON SU PROPIO CLIC** —el XML pone `delay="indefinite"` en cada uno— y
  no se inventó un truco para iniciarlos juntos → **VP-e**.
  **Y LA CAÍDA ESTÁ PROBADA DE VERDAD**: con `DOMParser` roto el archivo sale **igual y sano**
  —95.009 bytes, los dos videos incrustados, **0 árboles de tiempo**, 0 referencias colgadas,
  validación OK— y la línea de resultado lo dice. Vale para los **dos** exportadores.

- ⚠️ **UNA GUARDA REDUNDANTE SE RETIRÓ PORQUE UNA MUTACIÓN SOBREVIVIÓ**, y es la lección que el
  D-10 pagó cinco veces: el `valvEsProtesis` de la pasada nueva no hacía nada que
  `popVTipoCorto` no hiciera. Y la mutación que vale rompe **las dos mitades a la vez**: aflojar
  sólo el filtro de tipo es una mutación **equivalente** —medido, el EN SUMA sale idéntico en
  los tres escenarios—.

- **24/24 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y nunca sobre el vivo, con guarda de md5
  **idéntico** antes y después. **Tres condiciones nacieron del barrido**: `(B5b)` —la plastia
  tiene que APAGAR el círculo, no sólo prender su aro—, `(E1)` —medía «≤ 1» y no podía fallar—
  y el bloque `(F)` entero, con una prótesis **y una lesión**, que es la única escena donde el
  duplicado es posible.
  **Y la 23 nació al cerrar la tanda**, por la condición `(E9c)`: la malla de la TAVI encendida
  **siempre**, o sea una mecánica con el marco del stent. Una condición nueva sin mutación
  propia no está probando nada, y ésta muere en 11 s.

- **CUATRO CASOS NUEVOS, TC-605 a TC-608**, que caen contra HEAD por **46 condiciones y NINGUNA
  por excepción**, verificado en un worktree.
  ⚠️ **Y PAGARON TRES TRAMPAS**: el cuerpo de un caso devuelve `{ extra: [...] }` y no el array
  pelado; la **barra escapada no sobrevive al template literal** —`/AHA\/ACC 2024/` llega como
  `/AHA/ACC 2024/` y los flags son inválidos, cerrado **no usando ninguna expresión regular**—;
  y el **acento grave dentro de mis propios comentarios**, que `node --check` cazó.

- **DIECISIETE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito, y los DIECISIETE los
  destapó la CORRIDA COMPLETA y no el censo** —es el modo de falla que este archivo ya documenta
  diez veces: grepear por el nombre de lo que tocás no encuentra una afirmación escrita con
  otras palabras—. **Nueve** en el 9b: **TC-13** (**invertida**), **TC-289** (el conteo
  reescrito como invariante, y queda **más fuerte**), **TC-470** (**S0 invertida**, más la
  morfología mitral de nueve a once), **TC-471**, **TC-472**, **TC-474**, **TC-500**, **TC-502**
  y **TC-535** (los conteos de inventario). **Ocho** en el 9d: los cuatro del TEER —**TC-74**,
  **TC-86**, **TC-92** y **TC-GR-07**, que exigían el veredicto en la hoja del PDF— y los cuatro
  del posoperatorio —**TC-580 (D1)**, **TC-583 (B2)(B3)(B5)** con su **título** corregido,
  **TC-595 (A1)** y **TC-585 (E9b)**—.
  ⚠️ **LOS OCHO DEL 9d FALLABAN TAMBIÉN AISLADOS —0 de 8—, así que no eran dependencia de
  orden.** Verificado en un worktree sobre `5ae3959` con los mismos scripts, alternando sólo
  `index.html`: **SIETE caen ahí por catorce condiciones y ninguna por excepción**, o sea que
  las adaptaciones siguen discriminando. **TC-585 pasa, y eso es lo correcto**: es un caso de
  POP-B y no de esta tanda, y lo que se arregló fue su fragilidad.

- ⚠️ **EL CONTEO DE RUTAS DE TC-585 MEDÍA EL MONTAJE Y NO EL LATIDO, y de ahí nació una
  condición.** Exigía **DOS** rutas en el grupo de la válvula y el commit 4 montó ahí el
  semicírculo de la plastia y la malla de la TAVI —este dibujo monta cada pieza **una** vez y el
  pintor la prende y la apaga—. Hoy exige los dos velos por **posición**, con la geometría de la
  demo en los dos, y nace **(E9c)**: sobre una prótesis **mecánica**, ninguna pieza de plastia,
  de TAVI ni de TEER puede estar encendida. Sin ella, una fuga de pieza —justo lo que el
  commit 4 pudo introducir— pasaba en verde.

- **EL FILTRO DEL SELECTOR SE LE PREGUNTA AL DUEÑO DE LOS SÍMBOLOS, Y NO A UN PREFIJO
  TRANSCRIPTO.** Las tres condiciones del posoperatorio contaban «sólo prótesis»; hoy preguntan
  a `popVTipoCorto`, que es el dueño único de los símbolos del dibujo y devuelve **cadena
  vacía** para una morfología nativa. Así exigen lo que importa —que no se pueda elegir un tipo
  que el dibujo no sabe dibujar— y no hay que mantenerlas al día. El conteo pasa a **4, 5, 5 y
  3**, medido. Y **(B3) quedó invertida**: antes afirmaba que la TAVI no estaba en ninguna parte
  y hoy exige que esté en la **aórtica** y en **ninguna** de las otras tres, que es una
  discriminación que el control anterior no hacía.

- **Línea base al cierre: suite 617/623**, en **doce lotes** cubriendo los **623 casos
  distintos** —contados nombre por nombre, con una guarda que compara el total con los distintos
  y otra que compara los ejecutados: **623 de 623**—, en UNA sola pasada sobre el árbol sellado,
  con el pendrive `DISK_IMG` **verificado al abrir, en los DOCE lotes y al cerrar** (catorce
  verificaciones, listando nombres reales) y el md5 de `index.html` **idéntico** antes y después
  (`738944d2`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más
  **TC-182 y TC-551**, los dos intermitentes que las tandas anteriores ya declaran: **corridos
  aislados, los dos salen VERDE**, verificado. **Ningún rojo nuevo.** **TC-358, TC-557, TC-262,
  TC-419 y TC-507 salieron VERDES.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 610/623 CON OCHO ROJOS MÁS, LOS OCHO MÍOS**, y por eso
  esa cifra no es la línea base: los cuatro del TEER y los cuatro del posoperatorio de arriba.
  **Los ocho fallaban también aislados —0 de 8—**, así que no eran dependencia de orden: eran
  casos viejos que afirman el comportamiento que esta tanda cambió por orden expresa. Están
  adaptados y la cifra de arriba sale de la corrida **limpia**, de una sola pasada sobre el mismo
  árbol sellado y con el archivo de tests final.
  ⚠️ **Y EL CONTADOR DEL ARNÉS DE LOTES SUMABA DE MÁS: decía «636 de 623».** Contaba con
  `grep -cE "^  TC-"`, que atrapa también las líneas de **diagnóstico** que el runner imprime por
  cada caso rojo —trece rojos, trece líneas de más—. Corregido anclando el conteo al ✓ o ✗ del
  final de línea. Es el hermano del `wc -l` que POP-C pagó en el otro sentido.

- **Semgrep 124 WARNING / 0 ERROR.** **Excel 441** columnas. **Campos guardados: NINGUNO nuevo.**
  **Sin huérfanos nuevos.** 17 de 19 bloques de JS inline parsean, idéntico a HEAD. **Celular 59
  hallazgos a 360 px y 68 a 390, con 17 ALTA en cada ancho** — la línea base exacta. **No
  empeoró.**

- **`index.html` pasó de 10,87 MB / 152.699 líneas a 10,91 MB / 153.139** — medido con `wc -c` y
  `wc -l` DESPUÉS de sellar. (MB de 10⁶.) El diff son **506 líneas agregadas y 66 quitadas**, con
  **cero** `innerHTML`, `eval` o `new Function` nuevos.
  ⚠️ **Los cuatro commits de cobertura y documentación NO volvieron a sellar `index.html`**,
  porque no lo tocan: su md5 al cerrar es **`738944d2`**, el mismo del sello, verificado. Así el
  árbol que la suite midió es el que quedó commiteado.

- **Dónde está todo:** `docs/mapa/valppt-opciones-ppt.md` (**mapa NUEVO**, 16,7 KB), las fichas
  de los cuatro casos en `docs/mapa/tests-fichas-605.md` (**archivo propio**),
  `docs/fuentes/FUENTES.md` → «La tanda VAL-PPT» con las cinco fuentes transcritas y su tabla de
  cambios de evidencia, `docs/REGISTRO_TANDAS.md` → el bloque de esta tanda,
  `docs/GUIA_PRUEBA_VALPPT.md` → la guía de prueba en dieciséis pasos, y `docs/PENDIENTES.md`
  → **DIEZ** cosas declaradas (**VP-a** a **VP-j**).
  ⚠️ **`congenitas-otros.md` (34.540 B) NO se tocó**, ni `valvulas.md` (33,9 KB).
