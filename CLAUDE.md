# EcoSmart — reglas de trabajo
<!-- L1:INDICE -->

## Donde esta cada cosa

**`CLAUDE.md` es corto a proposito.** Tiene las reglas fijas del medico, la tabla de mapas,
el protocolo de verificacion, las trampas conocidas, el flujo de trabajo, SEGURIDAD, la
tabla de Procedencia y el «Estado vigente» de las **tres ultimas tandas** (PANT-22,
PANT-21 y PANT-20), que es lo que la proxima sesion necesita para medir. El historial
anterior salio a `docs/archivo/` en la tanda **LIMPIEZA-1** (2026-11-08), textual y en su
orden original: no se resumio, no se reescribio y no se borro una linea.

| archivo | que tiene | como se usa |
|---|---|---|
| `CLAUDE.md` (este) | reglas, mapas, protocolo, trampas, Procedencia y las tres ultimas tandas | **se lee entero**: es el unico |
| `docs/archivo/CLAUDE_HISTORIAL_TANDAS.md` | las secciones de tanda cerradas que estaban aca —de PANT-19 hacia atras y de TGA a VAL-PPT— | `grep -nE "^### "` y `sed -n` por rango |
| `docs/archivo/PENDIENTES_CERRADOS.md` | los items de `docs/PENDIENTES.md` que su propio texto declara cerrados, con su fecha y su tanda | `grep -rn "<id>" docs/archivo/` |
| `docs/PENDIENTES.md` | todo lo **abierto** y toda **decision del medico** pendiente | `grep -n` por id o titulo |
| `docs/INVENTARIO_LIMPIEZA_L1.md` | el mapa del reparto y el **manifiesto** con las lineas originales de cada bloque | `grep -n` |
| `docs/HISTORIAL_CLAUDE.md` y `docs/historial/` | las bitacoras mas viejas, de antes de esas dos mudanzas | `grep -n` por titulo |

⚠️ **Los cinco archivos de abajo NO se leen enteros**: son cientos de miles de tokens
entre todos y leer uno solo desborda la ventana. Se busca con
`grep -n` por id, por titulo de encabezado o por tema, y se leen 20-80 lineas con
`sed -n "a,bp"`. Es la misma regla que la «Regla de oro» de abajo fija para
`docs/historial/`, aplicada a lo que esta tanda movio.

```bash
grep -nE "^### " docs/archivo/CLAUDE_HISTORIAL_TANDAS.md   # que tandas hay archivadas
grep -rn "P17b-" docs/PENDIENTES.md docs/archivo/          # un id, en los dos lugares
```

---

<!-- /L1:INDICE -->

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
| **Tocar el TIEMPO DE EYECCIÓN o el AT/ET de la prótesis AÓRTICA, la nota del AT, la tarjeta de severidad protésica, la TAVI graduada, el DESAJUSTE que no se escribe con una estenosis, o el estado visual del botón «Severidad»** | `docs/mapa/pant18-protesis-aortica.md` |
| **Tocar el REPINTADO de la cápsula aórtica al elegir el modelo, el ÁREA EFECTIVA frente a la del modelo EN LA TAVI, la CONDICIÓN DE 1 DESVÍO del desajuste, la frase «con posible estenosis», el DESAJUSTE que apaga «normofuncionante», la MITRAL sin conclusión por fila, las CUATRO DECLARACIONES de criterio propio o los DOS TEXTOS del 3D de congénitas** | `docs/mapa/pant26-protesis-aortica-mitral.md` |
| **Tocar el CATÁLOGO DE MODELOS Y TAMAÑOS de prótesis** —el botón «Modelo y tamaño» de la aórtica, las tres tablas de datos (A4 quirúrgica, A1/A2/A3 de TAVI y A5 mitral), los valores esperados, la EOA indexada predicha, lo medido con su diferencia en desviaciones estándar, o la EOA frente a la del modelo en la tarjeta de severidad— | `docs/mapa/pant19-catalogo-protesis.md` |
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
| **Tocar la pestaña REFERENCIAS**: las NUEVE pestañas principales y su reparto, el buscador con su rótulo de sección, el botón «Ver referencia» de las tarjetas ⓘ o la TABLA DE CIRUGÍA AÓRTICA | `docs/mapa/referencias-subpestanas.md` |
| **Tocar la entrada «ASOCIACIONES Y SÍNDROMES» de Referencias** —sus dos tablas, su envoltorio de celular, su reparto— **o uno de los QUINCE RESÚMENES de congénitas**: el molde de `ref-miocard`, el techo de 849 caracteres y 7 viñetas, qué sección quedó afuera y las dos reglas de folio | `docs/mapa/pant36-asociaciones-resumenes.md` |
| **Tocar un CUESTIONARIO de Evidencia de congénitas** —el ductus, la coartación, la Fallot reparada del VD, la estenosis pulmonar, la conclusión de la bicúspide, la miocardiopatía hipertrófica obstructiva o la VENTANA AORTOPULMONAR—, **o el COLOR AL TOCAR una estructura del corazón maestro** | `docs/mapa/pant17-evidencia-congenitas.md` |
| **Tocar la EVIDENCIA DE PRÓTESIS —aórtica, mitral, tricúspide o pulmonar—, el ORDEN de una sección de prótesis o el BLOQUE DE CAUSAS del gradiente alto**: `ordenProt`, `_indCausas`, qué guía rige cada válvula, qué causa se marca sola y por qué la tricúspide y la pulmonar no llevan bloque | `docs/mapa/pant21-evidencia-protesis.md` |
| **Tocar el INTERRUPTOR de una sección de Evidencia de un SECTOR AVANZADO** —el ayudante `_indSectorIncluido`, la propiedad `av`, las trece secciones y su clave, por qué el panel no necesita repintado— **o un TEXTO de la Evidencia o de Referencias que comparaba dos fuentes** | `docs/mapa/pant22-evidencia-sectores.md` |
| **Tocar uno de los CATORCE textos que el médico reescribió en PANT-27** —las siete notas de la estenosis mitral, la entrada de sangrado de Fontan, el último párrafo del globo de la calculadora de TAVI, el bloque del reverso diastólico de la ficha `ref-ia` o la oración de la cirugía ante el trombo protésico grande— | `docs/mapa/pant27-textos-evidencia.md` |
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
| **Tocar el ENCABEZADO de un documento** —de dónde sale el nombre de la institución, la línea gris que no se imprime, el logo a la derecha, el nombre editable de la hoja del Informe—, **el EDITOR SOBRE LA HOJA de Configuración** —sus dos modos, el cuerpo como una sola zona editable, las SEIS convenciones con el «## » nuevo, lo que queda fijo, los dos cierres, «Guardar como modelo» o «Volver al texto original»—, o **los DOS DOCUMENTOS EN BLANCO**: sus dos claves fijas, su contenido mínimo, su nombre, «Vaciar», las dos casillas de firma o la firma que nunca queda sola | `docs/mapa/pant33-editor-hoja-blancos.md` |
| **Tocar la HOJA DE UN DOCUMENTO en pantalla** —el botón en el rincón derecho, la A4 en milímetros con su cuerpo en puntos y su zoom, el pegado como texto llano, el clic en el fondo con su confirmación—, **la CONSTANCIA en tres oraciones**, **el LOGO a la izquierda con el nombre centrado**, **el cuerpo y el SALTO DE HOJA de los tres consentimientos**, **las casillas DIBUJADAS de la declaración**, **las hojas comunes sin título**, o **la CASILLA DE PPT de «Prótesis valvulares» con su diapositiva** | `docs/mapa/pant31-hoja-ppt.md` |
| **Tocar un DOCUMENTO del Informe** —la constancia o los tres consentimientos—: el boton «Documentos», el maquetador unico con sus tipos de bloque, la justificacion palabra por palabra, la casilla dibujada, el salto de hoja del ETE, la regla de la declaracion junto a las firmas, el azul de los datos, el aviso «Actualizar con los datos», o la hoja guardada en «Imagenes»; **o la seccion «PROTESIS VALVULARES» del Laboratorio**: por que no puede llamar a ningun evaluador de protesis, de donde sale cada dato, las dos pilas del grafico, el orden de las categorias de trastorno, los dos que van aparte, o su seccion del PDF de auditoria | `docs/mapa/pant30-documentos-protesis.md` · el manual del medico en `docs/DOCUMENTOS_P30.md` |
| **Tocar una VISTA DE ANGIOGRAFÍA del 3D de Contractilidad** —las nueve, sus ángulos internos, el título fijo del botón, la tilde de la lista o el RÓTULO dentro del cuadro—, **el SELECTOR DE ARTERIA** con su criterio de dueño, o **el ESQUEMA DE ANOMALÍAS CORONARIAS de Referencias**: sus cinco apartados, sus dieciocho casillas sin `id`, su motor de dibujo, su paleta por tema o por qué el cuadro no puede quedar fijo | `docs/mapa/pant34-vistas-selector-esquema.md` |
| **Tocar las DOS TARJETAS GRISES de Contractilidad, el bloque «Arterias posiblemente involucradas» o las ARTERIAS CORONARIAS del 3D**: el achique a 220 y 150 px, las cinco formas de texto del bloque con su dueño del nivel, el botón «Coronarias», el tronco de la aorta, las siete letras, el tramo gris, la dominancia, las seis vistas de angiografía, o por qué las arterias acompañan la contracción | `docs/mapa/pant29-coronarias-3d.md` |
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
| **Agregar o correr un caso de prueba** | `docs/mapa/tests.md` · los casos tanda por tanda en `docs/mapa/tests-punteros-tandas.md` · fichas en `docs/mapa/tests-fichas-821.md` (TC-821 a TC-824), `docs/mapa/tests-fichas-813.md` (TC-813 a TC-820), `docs/mapa/tests-fichas-807.md` (TC-807 a TC-812), `docs/mapa/tests-fichas-801.md` (TC-801 a TC-806), `docs/mapa/tests-fichas-795.md` (TC-795 a TC-800), `docs/mapa/tests-fichas-787.md` (TC-787 a TC-794), `docs/mapa/tests-fichas-769.md` (TC-769 a TC-777), `docs/mapa/tests-fichas-577.md` (TC-577 a TC-581), `docs/mapa/tests-fichas-572.md` (TC-572 a TC-576), `docs/mapa/tests-fichas-550.md` (TC-550), `docs/mapa/tests-fichas-538.md` (TC-538), `docs/mapa/tests-fichas-537.md` (TC-537), `docs/mapa/tests-fichas-536.md` (TC-536), `docs/mapa/tests-fichas-535.md` (TC-535), `docs/mapa/tests-fichas-532.md` (TC-532), `docs/mapa/tests-fichas.md` (TC-499 en adelante), `docs/mapa/tests-fichas-496-498.md`, `docs/mapa/tests-fichas-491-495.md` y `docs/mapa/tests-fichas-481-490.md` |
| **Tocar el DIBUJO ESTÁTICO de la mitral en ETE**: la tabla única de festones por ángulo, la geometría, la línea del plano, el giro, las tres vistas con sus LETRAS DE FESTÓN, **la ORIENTACIÓN de la TRANSGÁSTRICA** o el PDF | `docs/mapa/mitral-dibujo-estatico.md` |
| **Tocar los CUATRO DIBUJOS DE MEDIDAS TEER, los CRITERIOS TEER y sus cortes, el ESPEJO de la FEVI y el DSFVI del TEER, o las DOS PROFUNDIDADES DE COAPTACIÓN sincronizadas** | `docs/mapa/mitral-teer-criterios.md` |
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
| **Tocar un TEXTO explicativo de una pantalla de congénitas —los diecisiete globos ⓘ `cc9-*`—, o una de las CINCO Evidencias nuevas** (defecto del septo auriculoventricular, anomalía de Ebstein, circulación de Fontan, conexión venosa pulmonar anómala parcial, síndrome de Eisenmenger): sus preguntas, sus bloques por guía, las diferencias que se muestran sin resolver, o la frase del índice de Celermajer que todavía llega al papel | `docs/mapa/pant10-congenitas-evidencia.md` |
| **Tocar el PAPEL de la anomalía de Ebstein o del síndrome de Eisenmenger, la casilla «(no se visualiza VCI)», el TDE y el TRIV del Doppler mitral, las dos profundidades de coaptación, el DERRAME PLEURAL POR LADO del eco pulmonar con su sincronía con el posoperatorio, el DIBUJO DEL PULMÓN, o las MASAS en la pestaña Otros con su tabla de diferenciales y las dos fichas de Referencias nuevas** | `docs/mapa/pant11-vci-pulmon-masas.md` |
| **Tocar una de las SIETE PANTALLAS de congenitas que la tanda PANT-9 redisenio** —Fontan, Eisenmenger, Ebstein, defecto del septo auriculoventricular, conexión venosa pulmonar anómala parcial, ductus o ventana aortopulmonar—: sus tres columnas por tema, el reparto de cada campo, los DOS cortes de 900 y 1.260 px, la tarjeta gris de conclusión, los **diecisiete textos que pasaron al globo** —la caja roja de Celermajer incluida—, o la **opción de valve-in-valve de TAVI** con su sincronía de morfología y su condición del Laboratorio | `docs/mapa/pant9-congenitas-columnas.md` |
| **Tocar el CORAZON MAESTRO en 3D** —el motor modular con sus cinco anatomías de base y sus diez lesiones, las reglas de compatibilidad, los dos modos, la tabla lateral, el globo, o la lectura de las pestañas— **o la casilla «Vena cava superior izquierda persistente»** | `docs/mapa/pant12-corazon-maestro.md` · el inventario del 3D anterior en `docs/INVENTARIO_CORAZON_MAESTRO.md` |
| **Tocar el PDF del CORAZÓN MAESTRO** —el recorte al contenido, su proporción, el esquema que entra con el ◫ o el TEXTO de cuatro partes que lo describe—, **el ESQUEMA DEL POSOPERATORIO que salía solo**, **los DOS VIOLETAS de los túneles**, **el ANILLO ACOSTADO de la obstrucción subaórtica**, **las SUTURAS EN MALLA del Jatene**, **los PARCHES VERDES con la CIV residual cruzando**, **la CAVA IZQUIERDA en celeste**, **la LEYENDA por entradas**, **el TÍTULO del dibujo**, **la PESTAÑA de la transposición en cuatro grupos** o **las SECCIONES de congénitas cerradas al entrar** | `docs/mapa/pant14c-pdf-colores.md` |
| **Tocar el ESTADO del corazón maestro** —por qué arrancaba con el estudio viejo, el dueño único que lo deriva, «Nuevo estudio», el acceso a las congénitas—, **el INTERRUPTOR de presencia de una sección de congénitas que se enciende solo**, **el PDF con un solo dibujo y su esquema según el botón ◫**, **el RETIRO del recuadro de la transposición con su «Ver en 3D»**, **el TÚNEL violeta del switch auricular** o **el ANILLO de la obstrucción subaórtica** | `docs/mapa/p14b-estado-puerta-tunel.md` |
| **Tocar los COLORES del esquema de circulación del corazón maestro** —por qué salían las cajas negras, `cmSchPal` y sus respaldos por tema, dónde se redibuja—, **las REGLAS DE COMPATIBILIDAD de la transposición en el módulo**, la **obstrucción subaórtica**, o **lo que «Según el estudio» LEE de cada pestaña** —el Fallot reparado, la coartación, la estenosis pulmonar, las dos aórticas, el defecto AV, Ebstein y Fontan—, la **única base con su orden de prioridad** o la **línea de lo no dibujado** | `docs/mapa/pant14-esquema-lesiones.md` · el inventario campo por campo en `docs/INVENTARIO_SEGUN_EL_ESTUDIO_P14.md` |
| **Tocar «EXPLORAR» del corazon maestro** —sus tres zonas con su corte de 1260 px, los botones finos de 30 px con area tactil de 44, las combinaciones por sigla o el esquema de circulacion—, **su boton «Incluir en el PDF»**, **la TRANSPOSICION como sexta anatomia de base**, **la tabla de diferenciales de MASAS cerrada y sus textos neutros**, **el BRONCOGRAMA en puntitos con el boton del PDF del pulmon**, o **las VARIANTES ANATOMICAS en grilla compacta** | `docs/mapa/pant13-explorar-tga-masas.md` |
| **Orientarse en otro módulo** (Congénitas, Laboratorio, PPT, Cardio-Onco, Pericardio) | `docs/mapa/congenitas-otros.md` |
| **Tocar la PANTALLA de «CIA / CIV», el ANCHO del dibujo del VD, el MOLDE de una sección de válvula del panel de Evidencia —su franja ámbar, sus tarjetas de datos, sus preguntas por tema o su pregunta de SÍNTOMAS con su ⓘ—, la sección ÚNICA de la mitral del ETE, los criterios TEER lado a lado, la frase de dato faltante del FORRESTER fuera del papel o los dos rótulos de la PROFUNDIDAD DE COAPTACIÓN** | `docs/mapa/pant6-pantallas-molde.md` |
| **Tocar el DIBUJO DE SOBRECARGA DEL VD de Hemodinámica** —su motor portado de la demo, su ancho derivado del esquema valvular, los dos rótulos, la línea del TAPSE, el botón de pausa o la fase quieta—, **el Forrester al lado de los valores**, o la PANTALLA del derrame y el taponamiento, de la CIA y la CIV lado a lado, de la Fallot reparada en tres columnas, de constricción contra restricción, el ORDEN del ETE mitral con sus dos puertas, o los ESTADIOS de la AHA/ACC 2020 de las cuatro válvulas que faltaban | `docs/mapa/pant5-pantallas-vd.md` |
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

⚠️ **Al 2026-11-10, tras la tanda PANT-31, el mapa nuevo nació mediano** —`pant31-hoja-ppt.md`,
**18,2 KB**— y los dos que recibieron un puntero quedaron medidos ANTES de escribirlo, que es la
regla: `pant30-documentos-protesis.md` **13,9 → 15,4 KB** y `tests-punteros-tandas.md`
**34,1 → 34,7 KB**. ⚠️ **Ese último queda a 300 bytes del techo: la próxima tanda que lo toque
tiene que partirlo.** Las fichas de los seis casos salieron a archivo propio
(`tests-fichas-795.md`, 10,2 KB) justamente por eso: `tests-fichas.md` está a menos de 1 KB del
suyo.

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
  sin frameworks. Hoy **12,71 MB / 174.869 líneas**, medido con `wc -c` y `wc -l` el 2026-11-11 al
  cierre de la tanda **PANT-36**, sobre el árbol ya sellado: sello **`v20261111-0442`**, md5 **`44207a10`**.
  ⚠️ **ESAS DOS CIFRAS VAN EN LA MISMA LÍNEA, Y NO ES UN GUSTO DE FORMATO**: TC-753 exige que en el
  renglón donde está el sello que publica el pie haya además un md5 de ocho hexadecimales, y con el
  salto de línea entre los dos el caso sale ROJO -- lo pagó PANT-31, que los partió al reflujar el
  párrafo.
  El diff de PANT-36 son **229 líneas agregadas y 4 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `f9b5812` **sobre el árbol ya sellado** —las tres del sello
  incluidas—, de las que **214** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas. **UN solo id nuevo**
  —`ref-asoc`—, que no termina en `-aviso` ni cae en ninguno de los **21** barridos por sufijo o
  prefijo del archivo, y **cero** `input`, `select` y `textarea` nuevos, que es lo que deja todo lo
  de esta tanda fuera del censo del estudio y del Excel por construcción.
  ⚠️ **POR TRIGÉSIMA SEGUNDA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show f9b5812:index.html` da **174.644** líneas,
  **12.675.123** bytes y el md5 **`2ed17cab`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,68 MB / 174.644 al cierre de la tanda **PANT-34**, sello **`v20261111-0030`**, md5 **`2ed17cab`**.)
  El diff de PANT-34 son **711 líneas agregadas y 26 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `31399ad`, de las que **646** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos —las DOS apariciones de `innerHTML` en el diff son
  el comentario que declara que el esquema se arma con `createElementNS` y no con ninguno— y cero
  claves ni contraseñas. **DOS ids nuevos** —`lv3d-coro-lista-art` y `rac-root`—, ninguno
  terminando en `-aviso` ni cayendo en ninguno de los **21** barridos por sufijo o prefijo del
  archivo, y **cero** de los dieciocho `input` nuevos lleva `id`, que es lo que los deja fuera de
  los tres mecanismos del censo por construcción.
  ⚠️ **POR TRIGÉSIMA PRIMERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show 31399ad:index.html` da **173.959** líneas,
  **12.629.165** bytes y el md5 **`b3259e74`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,63 MB / 173.959 al cierre de la tanda **PANT-33**, sello **`v20261110-2022`**, md5 **`b3259e74`**.)
  El diff de PANT-33 son **979 líneas agregadas y 583 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `6cccf59`, de las que **888** no son comentario, con **cero** `eval(`
  y `new Function` nuevos, **CUATRO** `innerHTML` nuevos y cero claves ni contraseñas. Los cuatro
  están declarados y Semgrep sigue en su línea base de **125**: **tres** son el marcado de la hoja
  —el del editor, el de la hoja de un documento en blanco y el del cuerpo al repintarse—, y los
  tres salen de `docmodHojaEdHTML` / `docmodEdCuerpoHTML`, que pasan **cada tramo** del texto del
  médico por `escHtml` y sólo agregan las etiquetas de negrita que `docmodRuns` encuentra; el
  **cuarto** es la ayuda de las convenciones, armada de una constante del archivo. Medido con el
  texto que lo prueba: un bloque con `<b>ojo</b>` y un `<script>` se ve como **texto** en la hoja
  y en el papel, con cero elementos inyectados.
  **DIECISÉIS ids nuevos de pantalla y CERO campos guardados del estudio**, **cero columnas de
  Excel (457)** y **ningún id existente cambiado**: los cuatro `input` nuevos
  —`cfg-doc-frase`, `cfg-doc-firmam`, `cfg-doc-firma` y `cfg-doc-nom`— llevan prefijo **`cfg-`**,
  que es el que los deja fuera del censo del estudio y del Excel por las DOS listas a la vez
  (`_CAMPOS_FUERA_DEL_ESTUDIO` y `_noEsDelEstudio`), y **ninguno** de los dieciséis termina en
  `-aviso` ni en `-badge`, que son los barridos por sufijo de «Nuevo estudio».
  ⚠️ **POR TRIGÉSIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las dos
  formas que esta casa manda: `git show 6cccf59:index.html` da **173.563** líneas, **12.604.966**
  bytes y el md5 **`4979b4ff`**, los tres idénticos a lo que el renglón decía, y el sello del pie
  (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,60 MB / 173.563 al cierre de la tanda **PANT-32**, sello **`v20261110-1736`**, md5 **`4979b4ff`**.)
  El diff de PANT-32 son **1.348 líneas agregadas y 32 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `8967e5f`, de las que **1.216** no son comentario, con **cero** `eval(`
  y `new Function` nuevos, **siete** `innerHTML` nuevos y cero claves ni contraseñas. Los siete están
  declarados y Semgrep se movió **un** aviso: dos son `ed.innerHTML = ''` —la cadena vacía—, uno
  recibe un literal, tres pasan cada valor del usuario por `escHtml`, y el séptimo es la vista previa
  del editor, que recibe el marcado de `docHojaHTML`, el mismo que arma la hoja del Informe. **Cero
  campos guardados nuevos** del estudio, **cero columnas de Excel (457)** y **ningún id existente
  cambiado**: los **treinta y uno** nuevos llevan todos prefijo `cfg-`, ninguno termina en `-aviso`
  ni en `-badge` y ninguno cae bajo ninguno de los barridos por prefijo de `limpiarCampos`.
  ⚠️ **POR VIGESIMONOVENA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show 8967e5f:index.html` da **172.247** líneas,
  **12.532.229** bytes y el md5 **`fcb65077`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,53 MB / 172.247 al cierre de la tanda **PANT-31**, sello **`v20261110-1327`**, md5 **`fcb65077`**.)
  El diff de PANT-31 son **499 líneas agregadas y 56 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `e531b73`, de las que **459** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos —la única aparición de `innerHTML` en el diff es un
  comentario que declara que `docRender` reescribe el de la hoja— y cero claves ni contraseñas.
  **Cero campos guardados nuevos**, **cero columnas de Excel (457)** y **ningún id existente
  cambiado**: los cuatro ids nuevos son todos de pantalla —`doc-conf`, `doc-conf-txt`,
  `doc-conf-seguir` y `doc-conf-ok`—, ninguno termina en `-aviso` ni cae bajo ninguno de los
  **veintiún** barridos por sufijo o prefijo de id del archivo (12 `id$=` y 9 `id^=`, contados
  distintos), y cada uno aparece exactamente una vez.
  ⚠️ **Y POR PRIMERA VEZ EN VEINTIOCHO TANDAS EL RENGLÓN QUE SE ENCONTRÓ ESTABA MAL EN LAS TRES
  CIFRAS: una resellada atrás Y corto por ocho líneas.** Decía 12,50 MB / **171.796** líneas con el
  sello `v20261110-1024` y el md5 `81f36826`, y el árbol que se abrió —`e531b73`, el cierre de
  PANT-30— traía **171.804** líneas, **12.501.930** bytes, sello **`v20261110-1041`** y md5
  **`f4ded2a9`**, verificado con `git show e531b73:index.html` y con el sello del pie. Lo más
  llamativo es que **el párrafo de PANT-30 de «Estado vigente», en este mismo archivo, SÍ los tenía
  bien**: PANT-30 se reselló al cerrar, su sección lo registró y este renglón se quedó con el primer
  sello. **Medirlo con `wc -c`, `wc -l` y `md5` antes de presupuestar contexto**, y cuando las dos
  partes de este archivo no coincidan, creerle al archivo y no a ninguna de las dos.
  (Antes: 12,50 MB / 171.804 al cierre de la tanda **PANT-30**, sello **`v20261110-1041`**, md5 **`f4ded2a9`**.)
  El diff de PANT-30 son **1.780 líneas agregadas y 3 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `41d9c1d`, de las que **1.692** no son comentario, con **CINCO**
  `innerHTML` nuevos —los cinco declarados: `docRender`, que arma su marcado entero con `escHtml`
  y `docMarcar`, y los cuatro del Laboratorio (`res`, `ley`, `tot` y la tabla de modelos), que
  reciben literales, números y los nombres de modelo pasados por `escHtml`; Semgrep sigue en su
  línea base—, **cero** `eval(` y `new Function` nuevos y cero claves ni contraseñas. **Cero
  campos guardados nuevos** (1010 contra 1010, medido en el navegador contra `41d9c1d`), **cero
  columnas de Excel** y **ningún id existente cambiado**: los ids nuevos son todos de pantalla
  —`doc-ov`, `doc-ov-tit`, `doc-aviso-cambio`, `doc-estado`, `doc-hoja`, `doc-btn`, `doc-menu`,
  `doc-x`, `doc-quitar`, `lab-prot-vacio`, `lab-prot-cuerpo`, `lab-prot-resumen`,
  `lab-prot-chart`, `lab-prot-chart-leyenda`, `lab-prot-mod-pos`, `lab-prot-mod-tipo`,
  `lab-prot-mod-tabla`, `lab-prot-trast-total` y `lab-prot-trast`—.
  ⚠️ **Y EL ID DEL AVISO NO PUEDE TERMINAR EN «-aviso».** `limpiarCampos` —«Nuevo estudio»— barre
  `[id$="-aviso"]` y les pone `textContent` vacío: con el id `doc-aviso`, ese barrido vaciaba el
  recuadro del aviso y **se llevaba su botón puesto**, así que después de un «Nuevo estudio» el
  médico veía «Los datos de la app cambiaron» sin la única forma de aceptarlo. Lo destapó **la
  suite completa**, no la lectura ni las cinco sondas: TC-790 pasaba **aislado** y salía **rojo en
  su lote**.
  ⚠️ **POR VIGESIMOSÉPTIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show 41d9c1d:index.html` da **170.019** líneas,
  **12.397.649** bytes y el md5 **`6aa22c01`**, los tres idénticos a lo que el renglón decía, y
  el sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,40 MB / 170.019 al cierre de la tanda **PANT-29**, sello **`v20261110-0034`**, md5 **`6aa22c01`**.)
  ⚠️ **Y EL ARCHIVO QUEDÓ MÁS CHICO EN BYTES AUNQUE GANÓ 648 LÍNEAS**, por primera vez en muchas
  tandas: PANT-29 quitó las tres fichas grandes de Referencias, que vivían en **tres líneas** de
  38.112, 51.938 y 73.929 caracteres —163.979 bytes en tres renglones—, y lo que entró son 648
  líneas de marcado y de JS normalmente indentado. 12,51 → **12,40 MB**.
  El diff de PANT-29 son **758 líneas agregadas y 110 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `88f9cb8`, con **cero** `innerHTML`, `eval(` y `new Function`
  nuevos y cero claves ni contraseñas. **Cero campos guardados nuevos, cero columnas de Excel
  (457) y ningún id existente cambiado**: los ids nuevos son todos de pantalla
  (`contr-arterias`, `contr-arterias-li`, `lv3d-col-der`, `lv3d-coro-panel`, `lv3d-coro-caja`,
  `lv3d-coro-lista` y `lv3d-coro-pie`), y los tres que salieron son los de las fichas quitadas.
  ⚠️ **POR VIGESIMOSEXTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show 88f9cb8:index.html` da **169.360** líneas,
  **12.514.545** bytes y el md5 **`c4fb0ba6`**, los tres idénticos a lo que el renglón decía, y
  el sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,51 MB / 169.360 al cierre de la tanda **PANT-28**, sello **`v20261109-2009`**, md5 **`c4fb0ba6`**.)
  El diff de PANT-28 son **115 líneas agregadas y 6 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `36b7bb0`, de las que **89** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas. **Cero campos
  guardados nuevos, cero columnas de Excel (457) y ningún id existente cambiado**: los tres ids
  nuevos son los de las tres fichas de Referencias (`ref-racong`, `ref-atleta`, `ref-chagas`).
  ⚠️ **POR VIGESIMOQUINTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show 36b7bb0:index.html` da **169.251** líneas,
  **12.342.200** bytes y el md5 **`e2ebb637`**, los tres idénticos a lo que el renglón decía, y
  el sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,34 MB / 169.251 al cierre de la tanda **PANT-26**, sello **`v20261109-1705`**, md5 **`e2ebb637`**.)
  El diff de PANT-26 son **244 líneas agregadas y 30 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `3476036`, de las que **205** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas. **Cero campos
  guardados nuevos, cero columnas de Excel (457) y ningún id cambiado**, contado sobre el diff.
  ⚠️ **POR VIGESIMOCUARTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show 3476036:index.html` da **169.037** líneas,
  **12.323.864** bytes y el md5 **`a14c45a0`**, los tres idénticos a lo que el renglón decía, y
  el sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,32 MB / 169.037 al cierre de la tanda **PANT-27**, sello **`v20261109-1203`**, md5 **`a14c45a0`**.)
  El diff de PANT-27 son **55 líneas agregadas y 33 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `ddcf42d`, de las que **49** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas. **Cero campos
  guardados nuevos, cero columnas de Excel (457) y ningún id cambiado**, contado sobre el diff.
  ⚠️ **POR VIGESIMOTERCERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show ddcf42d:index.html` da **169.015** líneas,
  **12.323.411** bytes y el md5 **`f2587ad8`**, los tres idénticos a lo que el renglón decía, y
  el sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,32 MB / 169.015 al cierre de la tanda **PANT-25**, sello **`v20261108-0123`**, md5 **`f2587ad8`**.)
  El diff de PANT-25 son **75 líneas agregadas y 10 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `bc62db2`, de las que **61** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas. **Cero campos
  guardados nuevos, cero columnas de Excel (457) y ningún id cambiado**, contado sobre el diff.
  ⚠️ **POR VIGESIMOSEGUNDA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show bc62db2:index.html` da **168.950** líneas,
  **12.288.401** bytes y el md5 **`b8481a9b`**, los tres idénticos a lo que el renglón decía, y
  el sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,29 MB / 168.950 al cierre de la tanda **PANT-24**, sello **`v20261107-2204`**, md5 **`b8481a9b`**.)
  El diff de PANT-24 son **263 líneas agregadas y 30 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `a40073f`, de las que **64** no son comentario, con **UN**
  `innerHTML` nuevo —`cel.innerHTML = badge('gray', 'Revisar los valores')`, que recibe un
  literal por el mismo `badge()` que las tres líneas hermanas de su propia función, y Semgrep
  sigue en su línea base—, **cero** `eval(` y `new Function` nuevos y cero claves ni
  contraseñas. **Cero campos guardados nuevos, cero columnas de Excel y ningún id cambiado**,
  contado sobre el diff.
  ⚠️ **POR VIGESIMOPRIMERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show a40073f:index.html` da **168.717** líneas,
  **12.268.984** bytes y el md5 **`224fd6ae`**, los tres idénticos a lo que el renglón decía, y
  el sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,27 MB / 168.717 al cierre de la tanda **PANT-23**, sello **`v20261107-1627`**, md5 **`224fd6ae`**.)
  El diff de PANT-23 son **72 líneas agregadas y 22 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `4c1af7d`, de las que **SIETE** no son comentario —tres selectores
  de CSS, un `if` y las tres líneas del sello—, con **cero** `innerHTML`, `eval(` y
  `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR VIGÉSIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show 4c1af7d:index.html` da **168.667** líneas,
  **12.264.443** bytes y el md5 **`52f7573b`**, los tres idénticos a lo que el renglón decía.
  (Antes: 12,26 MB / 168.667 al cierre de la tanda **PANT-22**, sobre el árbol ya sellado: sello
  **`v20261107-1137`**, md5 **`52f7573b`**.
  El diff de PANT-22 son **193 líneas agregadas y 76 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `e727fe2`, de las que **168** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR DECIMONOVENA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show e727fe2:index.html` da **168.550** líneas,
  **12.256.775** bytes y el md5 **`439f6bb0`**, los tres idénticos a lo que el renglón decía.)
  (Antes: 12,26 MB / 168.550 al
  cierre de la tanda **PANT-21**, sobre el árbol ya sellado: sello **`v20261107-0025`**, md5
  **`439f6bb0`**. El diff de PANT-21 son **649 líneas agregadas y 17 quitadas** en `index.html`,
  medido con `git diff --numstat` contra `e716871`, de las que **623** no son comentario, con
  **cero** `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR DECIMOCTAVA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show e716871:index.html` da **167.918** líneas,
  **12.199.178** bytes y el md5 **`a99b0db9`**, los tres idénticos a lo que el renglón decía.
  (Antes: 12,20 MB / 167.918 al cierre de PANT-20, sello `v20261106-2156`, md5 `a99b0db9`.) El diff de PANT-20 son **426 líneas agregadas y 33 quitadas** en `index.html`,
  medido con `git diff --numstat` contra `694e9e3`, de las que **400** no son comentario, con
  **cero** `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR DECIMOSEXTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show 694e9e3:index.html` da **167.525** líneas,
  **12.160.653** bytes y el md5 **`298cc61d`**, los tres idénticos a lo que el renglón decía.
  (Antes: 12,16 MB / 167.525 al cierre de PANT-19, sello `v20261106-1923`, md5 `298cc61d`.) El diff de PANT-19 son **918 líneas agregadas y 14 quitadas** en `index.html`,
  medido con `git diff --numstat` contra `56b868b`, de las que **849** no son comentario, con
  **cero** `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR DECIMOQUINTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show 56b868b:index.html` da **166.621** líneas,
  **12.088.119** bytes y el md5 **`f39a988f`**, los tres idénticos a lo que el renglón decía.
  (Antes: 12,09 MB / 166.621 al cierre de PANT-18, sello `v20261106-1452`, md5 `f39a988f`.) El diff de PANT-18 son **369 líneas agregadas y 56 quitadas** en `index.html`,
  medido con `git diff --numstat` contra `7f1380a`, con **cero** `eval(` y `new Function` nuevos,
  **SEIS** `innerHTML` nuevos y cero claves ni contraseñas. Los seis están declarados y Semgrep
  sigue en su línea base: **tres** son `badge(...)`, que pasa su texto por `escHtml`; **dos** son
  la entidad literal de la raya; y **uno** es la nota de la tarjeta, que se arma con `_critEsc`
  y reemplaza al `innerHTML` que esa misma línea ya tenía.
  ⚠️ **Y ESTE RENGLÓN DECÍA «un `innerHTML` nuevo», QUE ERA FALSO**: lo conté de memoria sobre el
  cambio que tenía en la cabeza —la fila del AT/ET— en vez de contarlo sobre el diff. `git diff`
  da **seis**. Se corrigió con un `--amend` sobre el commit 9, que estaba sin pushear, que es la
  única forma de que el número de commits no se corra otra vez.
  ⚠️ **POR DECIMOCUARTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show 7f1380a:index.html` da **166.308** líneas,
  **12.064.255** bytes y el md5 **`37c39207`**, los tres idénticos a lo que el renglón decía.
  (Antes: 12,06 MB / 166.308 al cierre de PANT-17b, sello `v20261106-0912`, md5 `37c39207`.) El diff de PANT-17b son **326 líneas agregadas y 316 quitadas** en `index.html`,
  medido con `git diff --numstat` contra `1345340`, con **cero** `innerHTML`, `eval(` y
  `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR DECIMOTERCERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show 1345340:index.html` da **166.284** líneas,
  **12.061.076** bytes y el md5 **`8b2343fd`**, los tres idénticos a lo que el renglón decía.
  (Antes: 12,06 MB / 166.284 al cierre de PANT-17, sello `v20261106-0223`, md5 `8b2343fd`.)
  El diff de PANT-17 fueron **1.358 líneas agregadas y 35 quitadas**. El diff de PANT-17 son **1.358 líneas agregadas y 35 quitadas**, medido con
  `git diff --numstat` contra `040d89e`, de las que **1.300** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR DUODÉCIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show 040d89e:index.html` da **164.961** líneas,
  **11.910.440** bytes y el md5 **`276361e9`**, los tres idénticos a lo que el renglón decía.
  (Antes: 11,91 MB / 164.961 al cierre de PANT-14c, sello `v20261105-2222`, md5 `276361e9`.) El diff de PANT-14c son **882 líneas agregadas y 140 quitadas**, medido con
  `git diff --numstat` contra `741d0cc`, de las que **792** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR UNDÉCIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las dos
  formas que esta casa manda: `git show 741d0cc:index.html` da **164.219** líneas, **11.858.074**
  bytes y el md5 **`f6eb884f`**, los tres idénticos a lo que el renglón decía. **El renglón se mide
  al final**, con `wc -l` sobre el archivo sellado.
  (Antes: 11,86 MB / 164.219 al cierre de PANT-14b, sello `v20261105-1629`, md5 `f6eb884f`.) El diff de PANT-14b son **536 líneas agregadas y 46 quitadas**, medido con
  `git diff --numstat` contra `4ebeee4`, de las que **492** no son comentario, con **cero** `eval(`
  y `new Function` nuevos, **un** `innerHTML` nuevo —el del esquema de la transposición, que recibe
  el marcado que `tgaEsqCuerpo` arma con constantes de este archivo y cuyos colores pasan por
  `tgaEsqResolver`, que **valida** cada valor contra un patrón de color antes de que entre— y cero
  claves ni contraseñas.
  ⚠️ **Y ESE SELLO ES EL SEGUNDO: el árbol se reselló al cerrar.** El primero, `v20261105-1510`
  con md5 `8a28881b`, es el que la suite y el barrido de mutaciones midieron hasta que ese barrido
  destapó una redundancia —`cm3dReset` cerraba el panel que `limpiarCampos` ya cerraba 433 líneas
  antes— y hubo que retirarla; la suite se rehizo entera sobre el árbol nuevo.
  ⚠️ **Y EL RENGLÓN QUE PANT-14b ENCONTRÓ ESTABA UNA TANDA ATRÁS**, por primera vez en doce: decía
  **11,80 MB / 163.420 líneas** con el sello `v20261105-0008` y el md5 `00825a73`, que son los de
  **PANT-13**, mientras el árbol que se abrió era el cierre de PANT-14 —`4ebeee4`, con **163.729**
  líneas, **11.821.949** bytes y md5 **`ae21bc42`**, los tres verificados con
  `git show 4ebeee4:index.html`—. PANT-14 escribió su delta en su propia sección y no tocó éste,
  que es el que se lee para presupuestar contexto. **309 líneas de diferencia.** **Medirlo con
  `wc -c`, `wc -l` y `md5` antes de presupuestar contexto**, no leer esto.
  (Antes: 11,80 MB / 163.420 al cierre de PANT-13, sello `v20261105-0008`, md5 `00825a73`.) El diff de la tanda son **1.148 líneas agregadas y 263 quitadas**, medido con
  `git diff --numstat` contra `866482f`, de las que **1.044** no son comentario, con **UN**
  `innerHTML` nuevo —que recibe una cadena armada **sólo con constantes de este archivo** y no un
  dato del paciente, y lo declara en su comentario—, cero `eval(` y `new Function`, cero claves ni
  contraseñas, y con los **17** bloques de JS inline parseando.
  ⚠️ **POR NOVENA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las dos
  formas que esta casa manda: `git show 866482f:index.html` da **162.535** líneas, **11.740.020**
  bytes y el md5 **`f27f4705`**, los tres idénticos a lo que el renglón decía. **El renglón se
  mide al final**, con `wc -l` sobre el archivo sellado.
  (Antes: 11,74 MB / 162.535 al cierre de PANT-12, sello `v20261104-1942`, md5 `f27f4705`.) El diff de la tanda son **1.253 líneas agregadas y 30 quitadas**, medido con
  `git diff --numstat` contra `9c5ab8f`, de las que **1.124** no son comentario, con **un solo**
  `innerHTML` nuevo —que recibe texto de una constante del archivo y no un dato del paciente, y
  Semgrep sigue en su línea base—, cero `eval(` y `new Function`, cero claves ni contraseñas, y
  con los **17** bloques de JS inline parseando.
  ⚠️ **POR OCTAVA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las dos
  formas que esta casa manda: `git show 9c5ab8f:index.html` da **161.312** líneas, **11.636.304**
  bytes y el md5 **`a78bd6ce`**, los tres idénticos a lo que el renglón decía. **El renglón se
  mide al final**, con `wc -l` sobre el archivo sellado.
  (Antes: 11,64 MB / 161.312 al cierre de PANT-11, sello `v20261104-1554`, md5 `a78bd6ce`.) El diff de la tanda son **1.160 líneas agregadas y 93 quitadas**, medido con
  `git diff --numstat` contra `cf04f84`, de las que **1.037** no son comentario, con **cero**
  `innerHTML`, `eval(` o `new Function` nuevos —la única aparición de `innerHTML` en el diff es
  un comentario que declara que el dibujo del pulmón no usa ninguno— y cero claves ni
  contraseñas, y con los **17** bloques de JS inline parseando.
  ⚠️ **POR SÉPTIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las dos
  formas que esta casa manda: `git show cf04f84:index.html` da **160.245** líneas, **11.546.900**
  bytes y el md5 **`c91b1462`**, los tres idénticos a lo que el renglón decía. **El renglón se
  mide al final**, con `wc -l` sobre el archivo sellado.
  (Antes: 11,55 MB / 160.245 al cierre de PANT-10, sello `v20261104-1123`, md5 `c91b1462`.)
  El diff de PANT-10 son **1.065 líneas agregadas y 55 quitadas**, medido con
  `git diff --numstat` contra `b734958`, de las que **1.054** no son comentario, con **cero**
  `innerHTML`, `eval(` o `new Function` nuevos y cero claves ni contraseñas, y con los **17**
  bloques de JS inline parseando.
  ⚠️ **POR SEXTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las dos
  formas que esta casa manda: `git show b734958:index.html` da **159.235** líneas, **11.413.222**
  bytes y el md5 **`2a135ab1`**, los tres idénticos a lo que el renglón decía. **El renglón se
  mide al final**, con `wc -l` sobre el archivo sellado.
  (Antes: 11,41 MB / 159.235 al cierre de PANT-9, sello `v20261104-0832`, md5 `2a135ab1`.) El diff de la tanda son **812 líneas agregadas y 457 quitadas**, medido con
  `git diff --numstat` contra `244530d`, con **cero** `innerHTML`, `eval` o `new Function` nuevos y
  cero claves ni contraseñas, y con los **17** bloques de JS inline parseando.
  ⚠️ **POR QUINTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las dos
  formas que esta casa manda: `git show 244530d:index.html` da **158.880** líneas, **11.389.617**
  bytes y el md5 **`0aece97f`**, los tres idénticos a lo que el renglón decía. **El renglón se
  mide al final**, con `wc -l` sobre el archivo sellado.
  (Antes: 11,39 MB / 158.880 al cierre de PANT-8, sello `v20261104-0623`, md5 `0aece97f`.) El diff de esa tanda son **466 líneas agregadas y 25
  quitadas**, medido con `git diff --numstat` contra `afed3e8`, con **cero** `innerHTML`, `eval` o
  `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR CUARTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las dos
  formas que esta casa manda: `git show afed3e8:index.html` da **158.439** líneas, **11.351.103**
  bytes y el md5 **`77a4558a`**, los tres idénticos a lo que el renglón decía. **El renglón se
  mide al final**, con `wc -l` sobre el archivo sellado.
  (Antes: 11,35 MB / 158.439 al cierre de PANT-7, sello `v20261104-0136`, md5 `77a4558a`.) El diff de la tanda son **746 líneas agregadas y 119
  quitadas**, medido con `git diff --numstat` contra `437834d`, de las que **707** no son
  comentario, con **cero** `innerHTML`, `eval` o `new Function` nuevos y cero claves ni
  contraseñas.
  ⚠️ **POR TERCERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN, y se verificó de las dos
  formas que esta casa manda:** decía 11,30 MB / 157.812 líneas con el sello `v20261103-2018` y el
  md5 `bb6adf41`, y `git show 437834d:index.html` da **157.812** líneas, **11.299.600** bytes y
  ese md5 exacto. **El renglón se mide al final**, con `wc -l` sobre el archivo sellado y con
  `git show <commit>:index.html | wc -l` para el anterior.
  (Antes: 11,30 MB / 157.812 al cierre de PANT-6, sello `v20261103-2018`, md5 `bb6adf41`.) El diff de la tanda son **1.447 líneas agregadas y 427 quitadas**, medido con
  `git diff --numstat` contra `c42d9e3`, de las que **1.365 no son comentario**, con **cero**
  `innerHTML`, `eval` o `new Function` nuevos y cero claves ni contraseñas.
  ⚠️ **POR SEGUNDA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN, y se verificó de las dos
  formas que esta casa manda:** decía 11,22 MB / 156.792 líneas con el sello `v20261103-1546` y el
  md5 `98d60651`, y `git show c42d9e3:index.html` da **156.792** líneas, **11.223.517** bytes y ese
  md5 exacto. **El renglón se mide al final**, con `wc -l` sobre el archivo sellado y con
  `git show <commit>:index.html | wc -l` para el anterior.
  (Antes: 11,22 MB / 156.792 al cierre de PANT-5, sello `v20261103-1546`, md5 `98d60651`.)
  ⚠️ **Y EN PANT-5, POR PRIMERA VEZ EN SEIS TANDAS, EL RENGLÓN TAMBIÉN ESTABA BIEN, y casi lo
  estropeo yo.** Decía 155.780 líneas con el sello y el md5 de PANT-4, y `wc -l` sobre
  `dbfc0c3:index.html` da **155.780** exactos: ni una de diferencia. Una medición mía a mitad de
  la tanda dijo 155.781 y la escribí acá como si el renglón hubiera estado corto; al cerrar la
  volví a tomar con `wc -l` sobre el blob del commit y era falsa. **El renglón se mide al final,
  con `wc -l` sobre el archivo sellado y con `git show <commit>:index.html | wc -l` para el
  anterior** —no con lo que uno anotó al abrir—.
  (Antes: 11,15 MB / 155.780 al cierre de PANT-4, sello `v20261103-1204`, md5 `e986c258`.)
  (Antes: 11,09 MB / 155.230 al cierre de PANT-3, sello `v20261103-0256`, md5 `0422963d`.) El diff de la tanda son **1.219 líneas agregadas y 221
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

## El nombre de la guia americana de congenitas es «ACC/AHA 2025» — FIJO (2026-11-06)

**No se renombra a 2026**, y el motivo esta medido: su **titulo oficial impreso** dice 2025 y su
**copyright** dice 2025; el «2026» que aparece en el pie de las hojas interiores —«2026 ACHD
Guideline»— es el anio del **numero de *Circulation*** (2026;153:e115-e251, 24 de febrero de
2026), no el de la guia. PANT-17 paro el renombre por eso (`P17-e`) y PANT-17b volvio a verlo en
el pie de las hojas 35, 39, 42, 45 y 87 al leerlas en imagen. Las **197** apariciones de
`ACC/AHA 2025` en `index.html` y las **100** de `docs/` se quedan como estan.

## Un dibujo sin color se dibuja con un ALFA POR PIXEL, no con una malla — REGLA FIJA (2026-11-06)

Cuando una estructura de un dibujo tiene que verse **sin color pero dejando ver lo que tiene
detras**, el material NO es de alambre (`wireframe`), ni una geometria de aristas, ni un relleno
plano con opacidad baja: es un **sombreado propio** cuyo alfa se calcula por pixel del angulo
entre la normal de la superficie y la direccion hacia la camara, de modo que el **centro queda
casi del todo transparente y solo la silueta lleva un halo fino**. Lleva `transparent`,
`depthWrite` en **falso** —para no tapar lo de atras— y **cara delantera solamente**, para que el
halo no se duplique con la cara de atras de la misma pieza.

**Y se mide por PIXELES**, comparando TRES cuadros del mismo dibujo: todo normal, la estructura
sin color, y la misma estructura **oculta por completo**. Los tres se componen sobre el fondo real
del recuadro antes de contar. Un contorno no mueve un solo punto, asi que una comparacion de
geometria no lo ve — es la leccion de PANT-14, y PANT-17 la volvio a pagar dejando una rejilla
gris que el medico vio y ninguna prueba.

## Todo cartel ⓘ usa la MISMA letra — REGLA FIJA DE MAICOL (2026-11-04)

El cuerpo de **todas** las tarjetas que abre un globo ⓘ se ve en el mismo tamaño de letra: el
que la propia tarjeta (`#vinfo-card`) declara, hoy **11 px**. Un cartel no se declara su propio
tamaño de cuerpo. Los 12 px quedan para el título `<h4>` y los 9 px para los rótulos de bloque,
que son papeles distintos y son iguales en todos.

Medido en PANT-7 sobre las **122** claves del registro: 74.734 caracteres de cuerpo a 11 px,
3.461 de título a 12 y 2.279 de rótulo a 9. El único que se salía era el de la orejuela
(`_oaiRefGlobo`), que fijaba `font-size:12px` a mano y traía **2.537 de sus 3.110 caracteres**
un punto más grandes que el resto, más 116 en negrita también a 12 — que es lo que el médico vio.

⚠️ **Y LA MEDICIÓN DE CIERRE DA 2.653, QUE ES LA SUMA DE ESOS DOS: no son dos cifras que se
contradicen.** La sonda de dos motores cuenta los caracteres de cuerpo **por tamaño computado**,
sin separar la negrita, así que publica **12px : 2.653** en HEAD y **11px : 2.653** en el árbol
nuevo, con el pie en 10 px (413 caracteres), los 10,5 (16) y los 9 (20) **intactos** y los 3.110
totales idénticos. Las dos mediciones dicen lo mismo contado de dos formas.

Un tamaño **menor** dentro de un cartel sí es legítimo donde cumple un papel propio —los 10 px
de un pie de ficha, los 9 de un chip—, y esos no se tocan.

## Ningún texto habla mal de las guías — REGLA FIJA DE MAICOL (2026-11-04)

**Ningún texto de la app** —pantalla, ⓘ, Evidencia, Referencias, tablas— habla mal de las guías
ni deja que se malinterprete lo que dicen:

- **NO** dice que dos fuentes «no coinciden», «difieren», «discrepan», «se contradicen» o «se
  muestran sin resolver».
- **NO** compara ni juzga una fuente contra otra.
- **NO** escribe «no se encontró», «ninguna fuente publica» ni frases parecidas sobre lo que las
  guías **no** dicen.

**Cada fuente se cita por lo que ella misma dice, en su propia oración, con su hoja y su folio.**
Si dos fuentes dicen cosas distintas se escribe cada una por separado, sin comentario.

**Lo que NO es esta regla**, y no se toca:
- lo que la app dice de **sí misma** —«esta aplicación no publica un valor normal», «esta
  pantalla no publica el número y lista cuáles faltan», «este globo no publica cortes ni
  conducta»—: no habla de una guía;
- dos **mediciones del paciente** que difieren —«si difiere del transvalvular», «la app avisa si
  difieren en 3 mm o más»—;
- lo que una **fuente dice de sí misma** («no validado externamente»), que es contenido
  bibliográfico y a veces un aviso que evita un error.

Aplicado por primera vez en la tanda **PANT-13** (commit 5). El censo se hace **en el navegador**
—sobre lo que el médico lee: el DOM sin los `<script>`, el registro de globos, las fichas y la
Evidencia— y **no por grep**: un grep sobre el archivo marcó 864 líneas y la enorme mayoría eran
**comentarios**, que en esta casa van sin tilde y sin pulir a propósito. La sonda es
`scripts/_probe_pant13neutro.mjs`. Medido: **Masas pasó de cinco apariciones a cero** y el resto
de la app de **treinta textos distintos a seis**, y los seis que quedan son los que **no caen**
bajo la regla, cada uno con su motivo en `docs/PENDIENTES.md` → **P13-a**.

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

- **Una variable de CSS que no existe deja el dibujo NEGRO, y no avisa.** `--card` **no existe
  en esta aplicación**: un `fill="var(--card)"` escrito como atributo de presentación es inválido
  en tiempo de cómputo, y como `fill` es una propiedad **heredada** cae en el **negro** de la raíz
  (`stroke` cae en `none`). Así salieron las seis cajas y las dos válvulas del esquema de
  circulación del corazón maestro, con el texto encima en su color —porque los textos van por una
  **regla de CSS**, que sí resuelve— y contraste 1,32. **No es de un motor: pasa igual en Chrome y
  en WebKit.** Es el mismo defecto que POP-B pagó con `--amber`. **La regla: un dibujo no escribe
  `var()` en un atributo; resuelve el color al dibujar, desde los estilos calculados, con un
  respaldo explícito por tema.** Y **fuera del documento no existe ninguna variable**, así que lo
  mismo vale para el marcado que se rasteriza al PDF.
- **Comparar GEOMETRÍA no ve un color.** La prueba de PANT-13 comparó el esquema contra su demo
  nodo por nodo y dio 36 de 36: no podía ver el negro, porque el negro no mueve un punto. Una
  prueba visual mide **colores** —relleno calculado, o muestra de píxeles sobre el raster— y no
  sólo posiciones.
- **`getBBox()` dentro de un subárbol en `display:none` devuelve CEROS.** Un panel que nace
  cerrado hace que todas las cajas y todos los textos informen el origen, así que una condición
  que los empareje por su caja medida no empareja ninguno y **pasa sobre nada**. Se compara por
  **atributos** (`x`, `y`, `width`, `height`, `cx`, `cy`), que son exactos y no necesitan maquetado.
- **`_cm3d` no está en `window`**: es un `const` de nivel de script, así que vive en el ámbito
  léxico global y se alcanza **por su nombre pelado**. Con `window._cm3d` el guardia corta y la
  medición sale sobre un denominador vacío, que se lee igual que «todo bien».
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
<!-- L1:INDICE -->

> ⚠️ **Y la tanda LIMPIEZA-1 (2026-11-08) movio una segunda camada.** Acá quedan las **tres
> ultimas** tandas —PANT-22, PANT-21 y PANT-20—; de **PANT-19 hacia atras**, y el bloque
> que seguia a «Procedencia» (de la tanda TGA a VAL-PPT), estan en
> `docs/archivo/CLAUDE_HISTORIAL_TANDAS.md`, textuales y en su orden. Se buscan con
> `grep -nE "^### "` y se leen por rango con `sed -n`. **Ninguna regla se movio**, otra vez:
> lo verificado esta en `docs/INVENTARIO_LIMPIEZA_L1.md`.

**La tanda PANT-36 (2026-11-11) — «Asociaciones y síndromes» y los quince resúmenes de
congénitas.** DIEZ commits. Sello **`v20261111-0442`**, md5 **`44207a10`**. Referencias →
Cardiopatía congénita gana **(A)** una **tercera entrada**, «🔗 Asociaciones y síndromes», debajo
de «Anomalías coronarias», con dos tablas —**nueve síndromes con cardiopatía** y **trece
asociaciones entre cardiopatías sin síndrome**—, y **(B)** **quince resúmenes por patología**
dentro de `ref-congenitas`, debajo de los cuatro renglones que esa ficha ya tenía, que quedan
intactos. **Nada de esto llega al papel.**
⚠️ **«PESTAÑA NUEVA» QUIERE DECIR ENTRADA, y la hipótesis de la orden es falsa en su letra**:
Referencias tiene **nueve** subpestañas y «Cardiopatía congénita» **es una de ellas**, así que lo
que vive debajo de una entrada es otra **entrada** del mismo panel. Es el vocabulario que PANT-25
fijó. Los números que se mueven son el censo de entradas (**40 → 41**), el índice del buscador
(**38 → 39**) y `REF_SUBTAB.congenitas` (**2 → 3**).
**El texto no se retipea**: las dos tablas salen de `scripts/_gen_p36tablas.py` y los quince
resúmenes de `scripts/_gen_p36resumenes.py`, donde la especificación del médico y la fuente de
cada viñeta viven **una sola vez**; de ahí salen el marcado **y** el documento de control.
`_probe_p36asoc.mjs` compara **celda por celda, carácter por carácter**: **cero diferencias** en
los dos rótulos, los ocho encabezados, las 22 filas y las **101 celdas**, con las 22 primeras
celdas en 700.
**Y el marcado del archivo es, byte por byte, el que los generadores emiten**: verificado al
cerrar, el bloque de las dos tablas y el de los quince resúmenes están en `index.html` **tal
cual** salen de sus dos scripts, y `docs/CONTROL_CONGENITAS_P36.md` es idéntico a lo que el
generador imprime. Así no puede haber una edición a mano que el documento de control no refleje.
**La entrada no agrega un campo ni una columna, por construcción**: lo que entra son `div`,
`table`, `tr`, `td` y `th` —**cero** `input`, `select` y `textarea`, que es lo que el censo
recorre—, y el **único id nuevo de toda la tanda es `ref-asoc`**, que no termina en `-aviso`.
**El celular va por el patrón MEDIDO de PANT-25 en `ref-tumores`**: envoltorio `overflow-x:auto`
con la tabla en `min-width` (900 y 700 px). A 390 px los envoltorios desplazan **572** y **372**
px **dentro de sí mismos** y el documento **0**; a 768, **194** y 0; a 1000, **122** y 0; a 1280 y
1440, ninguno lo necesita.
⚠️ **LA PRIMERA CORRIDA DE ESA SONDA MIDIÓ SOBRE UN DENOMINADOR VACÍO**: Referencias muestra
**un** panel a la vez y el arnés abría la pestaña pero no la **subpestaña**, así que la entrada no
tenía geometría y el desplazamiento daba **0 en los cinco anchos** — que se lee igual que «no
desborda». Hoy la sonda llama a `refSubTab('congenitas')` en cada medición.
**El molde de los resúmenes es el MEDIDO en la TAREA 0 sobre `ref-miocard`**: título de 12 px en
700 y `--accent2` con 6 px de margen abajo, cuerpo de 12 px con interlineado 1,8 y viñetas
`• <b>Rótulo:</b> texto`, **sin línea de fuente**. **El techo es 849 caracteres y 7 viñetas**, el
de la amiloidosis. ⚠️ **CINCO resúmenes se escribieron pasados y se acortaron SIN perder un solo
número medido** —Marfan 1.124, TGA 955, CoAo 907, CVPA 904 y Eisenmenger 890—: lo que salió fueron
palabras. El más largo hoy es Marfan con **848** de 849.
**Las fuentes, leídas EN IMAGEN a 200 ppp o más**: catorce resúmenes salen de la **ACC/AHA 2025**
(diecisiete hojas, folios e149 a e208) y **uno solo** —Marfan/EHAT— de la **ESC 2020 inglesa**
(hojas 43 y 44, folios 605 y 606), porque la americana **se excluye a sí misma** de ese tema
(hoja 11, folio e125). Las dos reglas de folio, comprobadas en **ocho** y **cinco** hojas.
⚠️ **Y LA IMAGEN CAMBIÓ UN NÚMERO**: el texto extraído de la ESC devuelve **«(2030%)»** donde la
hoja imprime **«(20–30%)»** — el guion del rango se pierde en la extracción. Es exactamente la
razón por la que la orden exige leer los números en imagen.
**De las DIECINUEVE secciones de `_CC_SECS` se escribieron QUINCE**: `mch` y `mca` ya tienen
resumen en `ref-miocard`, `fop` ya tiene ficha propia, y la **ventana aortopulmonar quedó afuera
por falta de fuente** —la americana la nombra **una vez** y de pasada (folio e122) y la europea
**ninguna**—, que es lo que B3 manda. Declarado en **P36-a**.
**A/B del papel contra `f9b5812`, con el PDF y el PPT generados de verdad: 121 escenas, 148.572
claves y 55.297 celdas de Excel, con CERO diferencias de superficie firmada Y de pantalla.** Su
cero de pantalla es un **control negativo declarado**: ese arnés no abre Referencias.
**NINGUNA OTRA FICHA SE MOVIÓ, medido carácter por carácter** con las **41** entradas abiertas y
su subpestaña activa: **39 de las 40** idénticas, ninguna perdida, y la única que cambia es
`ref-congenitas` (**287 → 11.878** caracteres). **El clon del globo ⓘ `otr-rac` sigue en 478
caracteres con el texto idéntico**, porque lo nuevo vive en una entrada **hermana**.
**42/42 MUTACIONES DIRIGIDAS MUERTAS** en **1,5 min**, en un worktree y **nunca** sobre el vivo,
con el md5 del vivo idéntico antes y después y las **42 anclas verificadas ANTES** de correr.
**Ninguna sobrevivió al primer barrido.** ⚠️ Dos anclas no aplicaban y las dos eran mías: la línea
del cuerpo de un resumen es **idéntica en los quince** —es el molde—, y los comentarios del
barrido se escribieron con `/* */`, que **en Python no es un comentario** (la trampa de PANT-20).
**Cobertura: TC-821 a TC-824**, los cuatro cayendo contra `f9b5812` por **31 condiciones y NINGUNA
por excepción**, con **CINCO** casos adaptados: TC-502 (tres condiciones), TC-509 (una), **TC-761
(dos), TC-763 (una) y TC-817 (dos)**.
⚠️ **Y ESOS TRES ÚLTIMOS LOS DESTAPÓ LA CORRIDA COMPLETA, NO EL CENSO**: cuentan las mismas
entradas de Referencias con otros nombres de variable, así que el censo que hice buscando
`REF_SUBTAB` y `_refIndiceArmar` no los encontró. Es el modo de falla que este archivo ya
documenta una decena de veces. De paso, **dos de ellos tenían el rótulo desactualizado desde
PANT-28** —decían «CUARENTA Y TRES» y «CUARENTA Y UNA» mientras la condición ya exigía 40 y 38—,
y se corrigió también el rótulo. **Los cinco adaptados caen 0/5 contra `f9b5812`**, que es lo
que confirma que siguen discriminando.
⚠️ **LA PRIMERA VERSIÓN DE TC-822 CAÍA POR EXCEPCIÓN**: contra el árbol anterior la entrada no
existe y un acceso pelado tira `TypeError` **antes** de medir nada. Hoy todo acceso va por un
ayudante con guarda y el caso cae por **doce** condiciones.
⚠️ **Y LA LISTA DE CASOS SE CUENTA CON EL PATRÓN COMPLETO DEL ID**: la suite tiene **822** casos
`TC-<número>` **más quince `TC-GR-nn`**, o sea **837** distintos. Contar sólo los numéricos deja
**quince casos sin ejecutar** y el total parece cerrar.
**CHROME Y WEBKIT COINCIDEN EN LOS VEINTE CRUCES** (dos motores × 1440, 1280, 1000, 768 y 390 px
× dos temas **reales**, diez «día» y diez «noche», con el tema devuelto por la sonda), con **UNA
sola firma de valores** sobre veinte magnitudes a la vez: las tres entradas en su orden, **dos**
tablas de **10 y 14** filas y **5 y 3** columnas, las **22 de 22** primeras celdas en negrita,
**cero** negros, **cero** controles, **cero** cursivas, **31** hijos y **15** resúmenes con
máximo **848** caracteres y **7** viñetas, **cero** fuera del molde, **cero** invisibles, **cero**
textos recortados, **cero** desplazamiento horizontal y **CERO errores de consola y de página en
los dos motores**.
⚠️ **LA ÚNICA DIFERENCIA ENTRE MOTORES ERA DE SERIALIZACIÓN Y LA LEÍ MAL LA PRIMERA VEZ**: el
mismo interlineado de 1,8 sobre 12 px se computa **«21.6px» en Chrome y «21.599998px» en
WebKit**, así que una comparación de **cadena** daba los quince resúmenes «fuera del molde» en
WebKit y ninguno en Chrome. Se midió antes de creerle; hoy la sonda compara el **número**.
⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema.
**Semgrep 125 WARNING / 0 ERROR**, la línea base exacta. **Sin huérfanos nuevos.** **Excel 457** y
**1010 campos**, idénticos. **17 de 19** bloques de JS inline parsean. **CELULAR: 59 hallazgos a
360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta.
**Línea base al cierre: suite 830/837**, en **DIECISÉIS** lotes cubriendo los **837 casos
distintos** —contados nombre por nombre con el patrón **completo** del id, **cero duplicados**—,
en UNA sola pasada sobre el árbol sellado, con los **837 ejecutados**, el md5 de `index.html`
**idéntico** antes y después (`44207a10`) y el pendrive `DISK_IMG` verificado **dieciocho** veces:
al abrir, en cada uno de los dieciséis lotes y al cerrar. Los rojos son **TC-223, TC-376, TC-390 y
TC-406**, los cuatro de siempre, más **TC-358, TC-551 y TC-557**, los tres intermitentes que la
orden declara. **Ningún rojo nuevo.**
⚠️ **Y LA PRIMERA PASADA DIO 829/837 CON TRES ROJOS MÁS, LOS TRES MÍOS**: TC-761, TC-763 y
TC-817. Están adaptados y la cifra de arriba sale de la pasada **LIMPIA**, con el archivo de casos
final: una tanda no puede informar un número de una pasada hecha con un archivo de casos
anterior.
⚠️ **LOS TRES INTERMITENTES SE CARACTERIZARON COMO MANDA ESTA CASA, Y LOS TRES PASAN SOLOS**:
corrido **cada uno por su cuenta**, TC-358, TC-551 y TC-557 dan **1/1**; corridos **los tres
juntos**, tres veces, dan **2/3, 3/3 y 3/3**. O sea que son sensibles al lote y no a esta tanda,
que es exactamente lo que su propia declaración describe.
Lo declarado, en **P36-a** a **P36-e**; el mapa, en
`docs/mapa/pant36-asociaciones-resumenes.md`; el inventario, en `docs/INVENTARIO_P36.md`; la
trazabilidad de las **96** viñetas, en `docs/CONTROL_CONGENITAS_P36.md` (**62** leídas en imagen);
las fichas, en `docs/mapa/tests-fichas-821.md`; la guía manual, en
`docs/GUIA_PRUEBA_PANT36.md` (**10** pasos).

**La tanda PANT-34 (2026-11-11) — las NUEVE vistas de angiografía con su rótulo, el selector de
ARTERIA y el esquema de ANOMALÍAS CORONARIAS en Referencias.** OCHO commits. Sello
**`v20261111-0030`**, md5 **`2ed17cab`**. El médico pidió tres cosas y ninguna llega al papel: la
lista de vistas del 3D de Contractilidad pasa de **seis a nueve**, el botón **deja de cambiar de
título** y la vista elegida se dice con un **rótulo dentro del cuadro**; la primera fila del panel
gana un segundo desplegable, **«Arteria»**; y la ficha de anomalías coronarias deja de ser cuatro
viñetas y pasa a ser **un texto corrido con casillas dentro de las frases** que dibujan un esquema
al costado.
⚠️ **DOS HIPÓTESIS DE LA ORDEN RESULTARON FALSAS, Y LAS DOS CAMBIARON EL DISEÑO DE LA PARTE B.**
La primera: **el globo ⓘ `otr-rac` clona los dos primeros hijos de la ficha** —los que no llevan
`data-ref-solo`—, así que reemplazar «el contenido actual» la habría cambiado, y la orden manda
dejarla **idéntica carácter por carácter**. Lo que se reemplazó es el **cuerpo propio**, los hijos
3 y 4 de PANT-29, y el esquema entra con la misma marca: el clon sigue dando **478 = 478**
caracteres, y de las **40** fichas de Referencias **39 son idénticas**. La segunda:
**`position:sticky` NO puede funcionar ahí**, porque la `.card` que envuelve la ficha es
`overflow:hidden` en los **dos** ejes y se vuelve el antecesor de desplazamiento más cercano, así
que un sticky adentro no se activa nunca — el cuadro va estático al costado. Y una tercera, menor:
en Referencias **no había ni una casilla de verificación**, así que no hubo patrón previo que
copiar.
**Las nueve vistas, con el giro INTERNO y ni un grado en pantalla.** `LV3D_CORO_VISTAS` pasa a ser
el **dueño único del nombre**: de esa tabla salen el texto de los nueve botones y el rótulo del
cuadro, así que la lista y el dibujo no pueden nombrar la misma vista de dos formas —lo fija
TC-813 (A4)—. Tres son nuevas y **cinco de las seis viejas cambiaron de ángulo**, a pedido.
**La convención alcanzó y no hubo que adaptar nada**: el vector de cámara es
`d = [sin(a)·cos(b), sin(b), cos(a)·cos(b)]`, así que «de frente» es `a:0`, «lateral izquierda de
90°» es `a:90` —base válida, sin degenerar— y «sin angulación» es `b:0`.
**El título es siempre «Vista de angiografía»** —hasta PANT-33 pasaba a decir «Vista: OAD
caudal»— y lo que dice cuál está puesta son la **tilde** de la lista y el **rótulo** del cuadro, en
el rincón **derecho** de abajo, a la misma altura que la brújula y del lado opuesto. Medido antes
de escribirlo: ese rincón tenía **cero** píxeles con tinta contra los 904 del de la brújula. Va
después del bucle de polígonos, **no entra en `polis`** y no cambia un solo movimiento del 3D;
lleva **halo**, así que se lee en los dos temas y en modo angiografía —**413** píxeles de tinta en
el claro, **410** en el oscuro y **213** que no son el fondo en angiografía—.
**El selector de arteria lee el dueño que la dominancia YA resolvió**: la derecha es `g === 'CD'`
y la izquierda es todo lo demás. Con una segunda lista de reparto, el día que la dominancia mueva
una rama el selector y el dibujo dirían cosas distintas. **Se filtra la DEFINICIÓN y no el
dibujo**, que es lo que hace que lo que no se dibuja desaparezca completo —el trazo, su **letra** y
su **tramo gris**—. Medido en las nueve combinaciones: con dominancia derecha **20 / 12 / 8**
arterias y `CD,Cx,D,DA,DP,MO,PL` / `Cx,D,DA,MO` / `CD,DP,PL`; codominante **19 / 13 / 6**, con la
PL del lado izquierdo; izquierda **19 / 17 / 2**. Los segmentos caen de **1.298 a 748 y a 550**.
Y **no toca** el estado de contractilidad, el texto de hallazgos, la leyenda ni el bloque
«Arterias posiblemente involucradas»; tocar un territorio **no lo mueve**; sobrevive al cambio de
vista y de dominancia, y **apagar «Coronarias» lo devuelve a «Todas»** sin reiniciar la dominancia.
⚠️ **LOS DOS DESPLEGABLES COMPARTEN LA FILA CON `flex:1 1 0` Y NO CON UNA BASE EN PÍXELES**: la
columna mide **150 px** a 1440 y a 1000, así que con una base de 96 px los dos botones se irían a
líneas distintas justo en el ancho de escritorio, que es donde la orden los quiere juntos. Medido
en cinco anchos: **73 / 73 / 73 / 336 / 147 px**, los dos de 44 px de alto, cero texto recortado y
cero desplazamiento. **El panel sigue teniendo TRES filas.**
**El esquema, por construcción y no por cuidado.** Los textos son los que el médico aprobó y se
**generaron** desde la especificación con un script, no se retipearon. El motor dibuja con
`createElementNS` y **no con `innerHTML`**, con splines Catmull-Rom convertidas a Bézier que pasan
por los puntos dados. **Las dieciocho casillas van SIN `id`**, y eso es lo que las deja fuera de
los tres mecanismos del censo: `limpiarCampos` recorre `input[id]` y les escribe el `checked`
guardado, así que una casilla con `id` **se destildaría sola en «Nuevo estudio» dejando el dibujo
puesto sin su casilla**. El cuadro se oculta **con una clase** y no con `hidden`, que es la lección
de PANT-30.
⚠️ **EL COLOR VA POR UNA REGLA DE CSS Y NO COMO `var()` EN UN ATRIBUTO**, que es la trampa que
POP-B pagó con `--amber` y PANT-13 con `--card`: ahí es inválido en tiempo de cómputo y cae en el
negro heredado. Por una regla sí resuelve **y además sigue al tema solo**. Medido en los cinco
esquemas y en los dos temas: **cero** trazos y **cero** rellenos en negro, con **dos paletas sin un
solo color en común**, **cero** rótulos fuera del lienzo de 400 × 360 y **cero** rótulos encimados.
**La parte D es sólo medición y el comportamiento de la captura NO se tocó.** Medido sobre el PNG
de verdad: el rótulo **sale** —641 píxeles de tinta con una vista y cero sin ella—, la captura
**respeta** el selector —tres PNG distintos y volver a «Todas» devuelve el mismo hash—, no tapa
nada —la banda del pie da **3.930** idénticos en las seis escenas— y es legible —paleta fija blanca
y escala 2—. No es un defecto: queda en **P34-d**.
**Cobertura: TC-813 a TC-820**, los ocho cayendo **0/8** contra `31399ad` por **64 condiciones y
NINGUNA por excepción**, con **TC-779, TC-783 y TC-784 adaptados** (TC-784 con su **(B2)
INVERTIDA**, que es el día que ese caso anunciaba).
**44/44 MUTACIONES DIRIGIDAS MUERTAS** en 57,5 min, en worktree y **nunca** sobre el vivo, con
el md5 del vivo idéntico antes y después y las 44 anclas verificadas **antes** de correr.
⚠️ **EL PRIMER BARRIDO DEJÓ CUATRO SOBREVIVIENTES Y LAS CUATRO ERAN DE MI LADO, NO DE LA APP**:
el rótulo sin restituir el contexto —que **nada** veía, porque el ciclo de prender y apagar de
TC-783 no elige vista—; el rótulo de la aorta al centro, **equivalente** para la condición de
solapes porque ahí tampoco se encima con los senos; el tema claro perdiendo **una** de sus nueve
variables, que la condición «las dos listas son distintas» no podía ver; y el pie con
`display:none`, que `textContent` no distingue — el agujero que TC-779 ya documenta.
⚠️ **Y LA RESTITUCIÓN DEL CONTEXTO NO SE PUEDE MEDIR POR IDEMPOTENCIA, que fue el primer intento y
la mutación TAMBIÉN lo sobrevivió: la fuga es ESTABLE.** Una vez que el `textAlign` queda puesto,
**todos** los cuadros dibujan la brújula igual de corrida, así que dos repintados seguidos dan el
mismo píxel. Lo que discrimina es el **estado del contexto después de pintar**.
**A/B contra `31399ad`, con el PDF y el PPT generados de verdad en las 121 escenas: CERO
diferencias de superficie firmada Y de pantalla**, sobre **148.572 claves comparadas** y **55.297
celdas de Excel**, con **Excel 457** en los dos árboles y el **juego de claves de campos idéntico
en las 121** —o sea cero campos guardados nuevos— y cero errores de página en los dos lados. Su
cero de pantalla es un **control negativo declarado**: ese arnés no abre el panel de Coronarias,
no elige vista, no toca el selector ni abre la ficha de Referencias. Lo que prueba la tanda son
las siete sondas propias y TC-813 a TC-820.
**Con «Coronarias» APAGADO el 3D es IDÉNTICO A HEAD, píxel a píxel**: el lienzo da el mismo hash
que la línea base (**`1c7500fc`**), y **con «Coronarias» prendido sin tocar vista ni selector,
también** (**`16dedac`**). Las tres opciones del selector dan tres dibujos distintos y el viaje de
ida y vuelta vuelve al mismo hash.
**CHROME Y WEBKIT COINCIDEN EN LOS VEINTE CRUCES** (dos motores × 1440, 1280, 1000, 768 y 390 px
× dos temas), con **UNA sola combinación de valores**: las **NUEVE** vistas con «Modo
angiografía», el título **«Vista de angiografía»** en los veinte, el botón **«Arteria»** con su
título fijo en la **misma fila**, **OCHO** botones de 44 px con **cero** por debajo, el rótulo con
tinta en su rincón (409 a 413) y la brújula en el suyo (889 a 910), los tres lados dando
`CD,DP,PL` / `Cx,D,DA,MO` / las siete, la ficha con sus **cuatro** hijos, **cinco** apartados,
**dieciocho** casillas, **cero** con `id`, **cero** tildadas y los cinco cuadros ocultos, el
esquema en **fila** a 1440, 1280, 1000 y 768 px y en **columna** a 390 —ahí el cuadro **debajo** y
en 300 px—, **cero** solapes, **cero** rótulos fuera del lienzo, **cero** negros, **cero**
desplazamiento horizontal, **cero** textos recortados y **CERO errores de consola y de página en
los dos motores**.
⚠️ **LA ÚNICA DIFERENCIA ENTRE MOTORES ES DE MÉTRICA DE FUENTE, y está medida sin redondeo**: la
zona táctil de la casilla del **título** mide **24,00 px en Chrome y 23,31 en WebKit** —0,69 px
corta—, mientras las de las frases dan **25,00** y **24,31**. Es el ascenso más descenso de 11 px
en cada motor, y WebKit de Playwright **no es Safari**; la app corre en Chrome. La etiqueta entera
sigue respondiendo al toque, y mide de 114 a 1.151 px de ancho. Queda declarado en **P34-b**: se
cierra con un píxel más de relleno, al precio de volver a sellar.
**CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta,
medido con la máquina sola.
⚠️ **Y UNA COSA QUE HICE MAL: la primera medición del celular corrió EN PARALELO con los dos
motores**, que es la lección (7) de la orden. Dio la misma cifra, pero una medición que compite por
la máquina no se informa: la de arriba es la de la corrida limpia.

**Semgrep 125 WARNING / 0 ERROR**, la línea base exacta, sin un aviso nuevo. **Sin huérfanos
nuevos.** El diff son **711 líneas agregadas y 26 quitadas** en `index.html`, medido con
`git diff --numstat` contra `31399ad`, de las que **646** no son comentario, con **cero**
`innerHTML`, `eval(` y `new Function` nuevos —las dos apariciones de `innerHTML` en el diff son el
comentario que declara que no se usó ninguno— y cero claves ni contraseñas. **DOS ids nuevos**,
`lv3d-coro-lista-art` y `rac-root`, ninguno terminando en `-aviso` ni cayendo en ninguno de los
**21** barridos por sufijo o prefijo del archivo; **diez líneas de `<input>` nuevas con las
dieciocho casillas y CERO con `id`**. **17 bloques de JS inline parsean.**
⚠️ **UN HALLAZGO DE MÉTODO QUE ALCANZA A LAS TANDAS ANTERIORES: el tema de esta app NO es
`prefers-color-scheme`.** Es la clase `light-mode` que `loadTheme()` pone leyendo
`localStorage.ett_theme`. Dos sondas de esta tanda midieron **dos veces el tema oscuro** antes de
que lo cazara —los mismos colores en los dos lados, que se lee igual que un control negativo bien
hecho—, y **los cruces de «dos temas» de las sondas de dos motores de PANT-30 a PANT-33 tienen el
mismo defecto**, porque usan el `colorScheme` del contexto de Playwright. La sonda nueva siembra la
clave, llama a `loadTheme()` y **devuelve qué tema quedó puesto**.
⚠️ **Y POR TRIGÉSIMA PRIMERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, verificado de
las dos formas que esta casa manda: `git show 31399ad:index.html` da **173.959** líneas,
**12.629.165** bytes y el md5 **`b3259e74`**, los tres idénticos a lo que el renglón decía, y el
sello del pie coincidía con el que `CLAUDE.md` publicaba.
**Línea base al cierre: suite 827/833**, en **DIECISÉIS** lotes cubriendo los **833 casos
distintos** —contados nombre por nombre, **cero duplicados**—, en UNA sola pasada sobre el árbol
sellado, con los **833 ejecutados**, el md5 de `index.html` **idéntico** antes y después
(`2ed17cab`) y el pendrive `DISK_IMG` verificado **dieciocho** veces: al abrir, en cada uno de los
dieciséis lotes y al cerrar. Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de
siempre, más **TC-358 y TC-557**, los dos intermitentes declarados, que pasan **3 de 3 corridos
aislados** —y corridos de a dos fallan 2 de 3, que es exactamente la sensibilidad que su propia
declaración describe—. **Ningún rojo nuevo.**
⚠️ **Y LA PRIMERA PASADA DIO 824/833 CON TRES ROJOS MÁS, Y DOS DE ELLOS ERAN MÍOS**: TC-551 —el
tercer intermitente declarado, que en la pasada limpia salió verde—, **TC-753** —que tenía razón:
`CLAUDE.md` seguía publicando el sello de PANT-33 mientras el pie ya traía el nuevo— y **TC-780**,
la adaptación que el censo no vio y la corrida completa sí. Los dos están corregidos y la cifra de
arriba sale de la pasada **LIMPIA**, con el archivo de casos final: una tanda no puede informar un
número de una pasada hecha con un archivo de casos anterior.
Lo declarado, en **P34-a** a **P34-e**; el mapa, en
`docs/mapa/pant34-vistas-selector-esquema.md`; el inventario, en `docs/INVENTARIO_P34.md`; las
fichas, en `docs/mapa/tests-fichas-813.md`; la guía manual, en `docs/GUIA_PRUEBA_PANT34.md`
(**12** pasos).

**La tanda PANT-33 (2026-11-10) — el editor SOBRE LA HOJA, los dos documentos en blanco y el
encabezado.** OCHO commits. Sello **`v20261110-2022`**, md5 **`b3259e74`**. El médico probó
PANT-32 en la app y pidió otra cosa: Configuración → Documentos queda **mínima** —el interruptor
y la lista— y se edita **DIRECTO SOBRE LA HOJA**, a pantalla completa, sin panel al costado ni
cajones por sección; hay **SEIS** documentos fijos, los cuatro incluidos y dos **en blanco**.
⚠️ **EL DEFECTO QUE EL MÉDICO REPORTÓ ERA UN CAMPO EQUIVOCADO, Y LOS DOS ESTADOS ERAN
INCORRECTOS.** `docDatos()` resolvía la institución por `sv('med-centro')` →
`centro_nombre_activo` → `'CeiboMed'`, y **ninguno de los tres es el «centro de trabajo»**, que
vive en `ett_centro_principal` y lo lee `ecoGetCentroPrincipal()`. Medido en la TAREA 0 con
GREMEDA cargado: devolvía **«CeiboMed»** con el modo institucional apagado —o sea **otra**
institución, que es peor que la raya— y cadena vacía con el modo encendido, que es de donde salía
la **raya**. Hoy delega en `hdrCentroNombre()`, el dueño único que pinta el botón 🏥 de la
cabecera: con la cadena copiada, el documento y la cabecera podrían nombrar dos instituciones
distintas el día que una cambie. **La raya estaba en una sola línea** (`D.inst || '—'`), más un
círculo de iniciales **VACÍO** que nadie había reportado; hoy, sin dato, va una **línea gris** con
«Nombre de la institución» por `::before` sobre el elemento **vacío** —vacío, lo que se escribe es
lo que vale— y el papel **no emite ninguna operación de nombre**: por eso no se imprime, y no por
una regla de impresión. Medido: **13** operaciones con institución y **11** sin ella.
**El logo vuelve a la DERECHA** (D3): PANT-31 lo había pasado a la izquierda leyendo «rincón
izquierdo» de su propia orden, y medido caía en **x 21 mm** de una hoja de 210. Hoy el círculo cae
en **189** y el logo en **178**, y en pantalla **lo que lo mueve es el ORDEN DEL DOM** sobre la
misma grilla `18mm 1fr 18mm`: no hay una regla nueva. El nombre sigue centrado en el ancho de la
**hoja**. En la hoja del Informe el nombre es **editable** y vale sólo para ese paciente: se
guarda en `_docEst[clave].inst` y lo aplican las **tres** superficies por un solo lector,
`docDatosHoja()` —con la corrección aplicada sólo al pintar, el médico vería su institución en la
pantalla y la de la app en el papel—. Verificado con **teclado real** por CDP.
⚠️ **EL EDITOR ES LA MISMA HOJA DEL INFORME, EN EL MISMO OVERLAY, CON DOS MODOS** (`_docModo`), y
eso es todo el diseño: con un editor paralelo hay dos maquetas y el día que un bloque cambie de
aspecto el editor muestra una cosa y el papel otra. El editor de PANT-32 —dos columnas en la
pantalla de Configuración, con una vista previa de 330 px— **salió entero, con su CSS**. **El
cuerpo es UNA sola zona editable y no un `contenteditable` por bloque**, que es lo que hace
posible «borrar todo y rehacerlo de cero»; las partes fijas se ven en su lugar y no se pueden
tocar —medido: **CERO** partes fijas editables y **DOS** editables en total—, con un paciente
**ficticio** (María Fernanda Pérez) y la institución y el logo **reales**.
⚠️ **EL MODELO QUE SE GUARDA TIENE LA MISMA FORMA QUE EN PANT-32**, y no es casualidad: el editor
convierte el modelo a **un** texto y el texto al modelo, así que el almacén, su validador, la
derivación del original y la regla de oro siguen siendo los mismos. **El único camino nuevo es la
conversión.** Y esa conversión tiene que devolver **la misma FORMA, no sólo la misma tinta**,
porque `docmodIgualAlOriginal` compara los cuerpos: con el cuerpo en una «pregunta» en vez de
seis, abrir un incluido y guardarlo sin cambiar nada lo dejaría marcado como editado **para
siempre** y su papel saldría por el armador. Lo destapó el barrido, no la lectura.
⚠️ **LA CONVENCIÓN `## ` ES NUEVA, contra lo que la orden suponía** («como hoy»): medido en la
TAREA 0, `docmodTextoABloques('## Titulo\nCuerpo.')` devolvía **un solo bloque `p`**. Hace falta
porque el cuerpo entero es un texto que el médico puede borrar y rehacer, y en los
consentimientos es además lo que lo parte en «preguntas» y lo que las vuelve a unir. La ida y
vuelta de los **cuatro** incluidos no pierde nada: texto idéntico, **13 / 329 / 501 / 355**
palabras, bloques idénticos bloque por bloque, el cuerpo **igual al original** y el papel de
PANT-31 —**1/13**, **3/150**, **3/198** y **3/152**—, con `docmodDef(k) === DOC_DEFS[k]` en los
cuatro.
**Los dos documentos en blanco son dos claves FIJAS** (`DOCMOD_BLANCOS`) y no dos «propios»: la
lista y el menú tienen **seis** filas siempre, no «hasta seis», y no hay nada que crear ni que
borrar. Son vírgenes —encabezado, la fecha arriba a la derecha, el cuerpo y, si se pide, la
firma—: **cero** títulos, **cero** línea del paciente, **cero** tabla de firmas, y con el texto
vacío y sin firma **una hoja de 5 operaciones**. ⚠️ **LA FIRMA NUNCA QUEDA SOLA EN UNA HOJA (C5),
y no hizo falta un mecanismo nuevo**: el **último** bloque del cuerpo viaja con ella en el grupo
`firmas`, que es el que `altoGrupo` mide antes de abrirlo. Medido en **trece** largos distintos.
Y en el Informe un blanco se edita con la **misma** zona editable, que no es una preferencia: con
el texto vacío no hay un solo bloque al que ponerle `contenteditable`.
⚠️ **`DOCMOD_VER` NO SE SUBE Y LA RAÍZ `blanco` ES OPCIONAL, y de eso depende A5**: el almacén que
PANT-32 dejó en el navegador del médico **no tiene** esa raíz, y exigirla —o subir la versión—
descartaría el almacén entero, o sea lo que el médico ya editó de los cuatro incluidos. Los
documentos «propios» que hubiera en disco **no se listan y no se borran**; en el árbol real había
**cero**, medido. ⚠️ Y **`conFirma` y no `firma`** en el estado de la hoja: `st.firma` ya era la
firma de los DATOS, y dos cosas con el mismo nombre habrían disparado el aviso «Actualizar con
los datos» al tildar una casilla.
⚠️ **TRES DEFECTOS PROPIOS QUE DESTAPARON LOS CASOS Y LA LECTURA NO**: `cfgDocsVis` sin rama para
los documentos en blanco —el interruptor de su fila se movía y el documento **seguía en el
menú**—; el pegado en el cuerpo que **colapsaba los saltos de línea**, porque `docSan` manda a un
espacio todo lo que no está entre U+0020 y U+00FF y **U+000A es el salto** —un texto de tres
párrafos entraba como UNA línea—; y el contenedor `cfg-docs-ed` del editor viejo, que había
quedado **vacío** en el marcado.
⚠️ **Y TRES TRAMPAS DEL CUERPO EDITABLE, las tres medidas con TECLADO REAL**: el `input` de un
Enter llega con el `target` puesto en el **DIV de la línea nueva** y no en la zona editable, así
que la pulsación se perdía —hoy se busca con `closest`—; tras borrar **todo** el cuerpo el cursor
queda en el **contenedor**, así que lo escrito entraba como nodo de texto **suelto** y «AAA» Enter
«BBB» daba **«BBBAAA»** —hoy `docmodEdNormalizar` garantiza «una línea, un div» en cada
pulsación—; y `innerText` cuenta una línea **en blanco** como **DOS** saltos, así que el texto
volvía con un salto de más —hoy se lee el `textContent` de cada hijo—.
⚠️ **Y UNA TRAMPA DEL ARNÉS, NUEVA Y DECLARADA**: `S.tecla('Enter')` manda keyDown y keyUp **sin
`text`**, y así Chrome **no inserta párrafo** en un `contenteditable` —el DOM no cambia y el
cursor se va al contenedor—. Con `escribir('\r')` el Enter parte la línea como el del médico. Es
la misma trampa que el arnés de PANT-31 ya documenta para el carácter.
**Cobertura: TC-807 a TC-812**, los seis cayendo contra `6cccf59` —TC-807 por **CATORCE**
condiciones y **sin una excepción**, TC-808 por cuatro y los otros cuatro por su denominador—,
con **TC-801, TC-802, TC-803 y TC-804 adaptados** (TC-803 con **(C6)** y **(C7) INVERTIDAS**, que
es el día que su propia condición anunciaba) y **TC-805 y TC-806 RETIRADOS** con su motivo en el
lugar donde vivían, porque el alta de documentos propios y la exportación salieron con su código.
**41/41 MUTACIONES DIRIGIDAS MUERTAS** en **1,9 min**, en una copia del árbol y **nunca** sobre el
vivo, con el md5 del vivo idéntico antes y después y las 41 anclas verificadas **antes** de
correr. ⚠️ **EL PRIMER BARRIDO DEJÓ CUATRO SOBREVIVIENTES Y LOS CUATRO DIJERON COSAS DISTINTAS**:
**dos huecos reales** —el nombre corregido que no llegaba al papel, y la FORMA del modelo, que
ningún texto ni papel podía ver—, **uno** que sobrevivía por la **escena** —con un cuerpo de UNA
línea los dos lectores dan lo mismo— y **uno** por cómo estaba **escrita** la condición: dos
hechos unidos por un «y» dentro de una función anónima.
**A/B contra `6cccf59`, con el PDF y el PPT generados de verdad: 121 escenas, 148.572 claves y 55.297 celdas de Excel, con CERO diferencias de superficie firmada Y de pantalla.** Su cero de pantalla es un
**control negativo declarado**: ese arnés no abre Configuración, ni la sección, ni el editor, ni
la hoja. Lo que prueba la tanda son las seis sondas propias y TC-807 a TC-812.
**Línea base al cierre: suite 820/825**, en **quince** lotes cubriendo los **825 casos
distintos** —contados nombre por nombre, **cero duplicados**—, en UNA sola pasada sobre el árbol
sellado, con el md5 de `index.html` **idéntico** antes y después (`b3259e74`) y el pendrive
`DISK_IMG` verificado al abrir, en cada lote y al cerrar. Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-557**, el intermitente que `TGA-h` declara y que pasa **3 de 3** corrido aislado. **Ningún rojo nuevo**, y **TC-551, el otro intermitente declarado, salió VERDE** en esta corrida.
**⚠️ Y LA PRIMERA PASADA SE PERDIÓ POR UN CUELGUE QUE CAUSÉ YO, declarado: corrí el A/B de 121 escenas EN PARALELO con la suite, y a los veinte minutos los dos logs dejaron de crecer a la vez —el lote 11 quedó en 38 de 55—. Es la trampa que este archivo documenta para el A/B encadenado, con tres navegadores en vez de dos. La cifra de arriba sale de la pasada LIMPIA, con la máquina sola y con el archivo de casos final —el que ya trae TC-787 y TC-798 adaptados—: una tanda no puede informar un número de una pasada hecha con un archivo de casos anterior**
**CHROME Y WEBKIT COINCIDEN EN LOS VEINTE CRUCES** (dos motores × 1440, 1280, 1000, 768 y 390 px
× dos temas), con **UNA sola combinación de valores en los veinte**: la sección en el índice **5
de 9** con sus **SEIS** filas y sus etiquetas de tipo, **cero** cupo, **cero** «Agregar», **cero**
«Borrar», el menú con sus **seis** entradas y **cero** `onclick` inline, el editor abriendo sobre
la hoja con **CERO** partes fijas editables y **DOS** editables, el paciente ficticio, «Guardar
como modelo» **apagado**, el zoom en **1 / 1 / 1 / 0,937 / 0,461**, **cero** tinta fuera del
papel, el orden del DOM **`hueco, nombre, logo`** con el nombre centrado a **0,0 px** del centro,
el documento en blanco con su texto gris y **cero** títulos, **cero** línea del paciente y
**cero** tabla de firmas, su casilla de firma en la barra, **cero** controles por debajo de 44 px,
**cero** textos recortados y **CERO errores de consola y de página en los dos motores**.
⚠️ **EL ÚNICO DESPLAZAMIENTO HORIZONTAL ES PREEXISTENTE, Y ESTÁ MEDIDO CON SU CONTROL**: a 1000 px
el cuerpo desplaza **13 px en Chrome y 39 en WebKit**, y el **mismo** cruce contra `6cccf59` da
**exactamente los mismos** 13 y 39. El control reproduce además las premisas: ahí la lista tiene
**cuatro** filas, el menú **cuatro** entradas y «Editar» **no** abre la hoja.
⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema.
**Semgrep 125 WARNING / 0 ERROR**, la línea base exacta, sin un aviso nuevo. **Sin huérfanos
nuevos.** **Celular 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** —la línea base
exacta—. **17 bloques de JS inline parsean.**
⚠️ **Y UNA TRAMPA DE MÉTODO QUE COSTÓ UNA CORRIDA**: quitar el **último** caso de
`test_clinico.mjs` buscando «el próximo `caso(`» se lleva puesta **la cola del runner** —su
try/catch, el cierre de Chrome y el código de salida—, porque después del último caso no hay
otro. El síntoma es un suite que corre y **no imprime nada**, con código de salida **0**. Se
restituyó del árbol de la línea base. Y por **decimoséptima** tanda seguida, el acento grave en mi
propio comentario dentro del cuerpo de un caso, dos veces.
Lo declarado, en **P33-a**, **P33-b** y **P33-c**; el mapa, en
`docs/mapa/pant33-editor-hoja-blancos.md`; el inventario, en `docs/INVENTARIO_P33.md`; el manual
del médico, en `docs/DOCUMENTOS_P33.md`; las fichas, en `docs/mapa/tests-fichas-807.md`; la guía
manual, en `docs/GUIA_PRUEBA_PANT33.md` (**48** pasos).

**La tanda PANT-32 (2026-11-10) — el cajón de Documentos en Configuración.** NUEVE commits. Sello
**`v20261110-1736`**, md5 **`4979b4ff`**. Configuración gana una sección **📄 Documentos** donde el
médico cambia el texto de los cuatro documentos que vienen con la app, los oculta del menú del
Informe, agrega hasta **dos** documentos propios —una constancia o un consentimiento— y exporta e
importa todos los modelos; los modelos guardan **solo textos y opciones**, en `localStorage`, con el
patrón de `ecosmart_frases`, y **jamás datos de pacientes, logo ni institución**, medido por el
complementario sobre el archivo exportado.
⚠️ **LA REGLA DE ORO SE CUMPLE POR CONSTRUCCIÓN Y NO POR CUIDADO**: un incluido **sin editar** no
pasa por el armador —`docmodDef` devuelve el objeto de `DOC_DEFS` **tal cual**, el mismo y no una
copia—, así que su PDF y su imagen son los de PANT-31 por **identidad**. Medido: **1/13**, **3/150**,
**3/198** y **3/152** hojas y operaciones, y `def === DOC_DEFS[clave]` en los cuatro. Y «sin editar»
se decide **comparando** el cuerpo contra el original, **en el LECTOR y no solo en el botón
«Guardar»**: lo destapó TC-801 (C6), porque `ed` puede llegar de un archivo **importado** y un
documento con el texto original exacto tiene que imprimir por su definición. Con una bandera,
«Volver al texto original» más Guardar lo habría dejado marcado para siempre.
El modelo original de un incluido se **DERIVA** de su definición por rebanado y **no se retipea**:
ni una palabra de los cuatro cambia, y medido palabra por palabra el texto derivado no pierde
ninguna del cuerpo (**13**, **318**, **459** y **342**). Las cinco convenciones de A4 —viñeta,
casilla, raya, negrita y línea en blanco— con ida y vuelta verificada; ⚠️ **una casilla es una línea
que ARRANCA con el cuadrado y trae UNO solo**, y una con cuadrados **en el medio** es un `pchk` que
los **dibuja**, porque `docSan` convierte el U+2610 en un espacio y un cuadrado que no se dibuja sale
como un hueco que el paciente no puede marcar. La negrita **palabra por palabra** entra por un
bloque NUEVO (`pr`) y una función NUEVA (`parrafoRico`), **sin tocar `parrafo`**: el peso por palabra
es un campo **opcional** de la operación `tw`, así que las 21, 27 y 23 líneas justificadas de los
tres consentimientos se dibujan por el camino de siempre. **El botón se oculta con una CLASE y no
con `hidden`**, y el control está medido: con el atributo puesto y la clase sacada, el envoltorio
computa `display:flex` y el botón sigue midiendo 132 px —`.btn` declara `inline-flex` y le gana al
`[hidden]` del navegador—, que es lo que PANT-30 pagó. **El menú del Informe se PINTA** del almacén,
con la clave por `data-doc-k` y un oyente delegado, y cambia **al instante**. **La vista previa del
editor usa la hoja del Informe**: `docRender` salió partido y su armado pasó a
`docHojaHTML(bloques, D, editable)` —con dos armados, el editor mostraría una cosa y el papel otra—,
y su paciente, su institución y su médico son **ficticios**. La impresión de un propio reusa el
grupo `firmas` que el maquetador ya medía con `altoGrupo`: medido, la declaración y la tabla de
firmas caen en la **hoja 1** del propio corto y en la **hoja 2** del largo, siempre **juntas**, con
las hojas comunes aparte y **un solo** `salto`.
⚠️ **TRES HIPÓTESIS DE LA ORDEN RESULTARON FALSAS O INCOMPLETAS, las tres medidas en la TAREA 0**: el
botón «Documentos» **no tenía** forma de ocultarse ni de deshabilitarse; `def.hojas` declara
1/2/2/2 y las hojas reales son **1/3/3/3** —nadie lee el campo—; y la declaración y las firmas **ya**
viajaban juntas, así que D4 no necesitó mecanismo nuevo.
⚠️ **TRES DEFECTOS PROPIOS QUE LA VERIFICACIÓN DESTAPÓ Y LA LECTURA NO**: los tres oyentes del editor
se registraban en **cada** repintado —`cfgDocsEdRender` reemplaza el `innerHTML` pero no el
contenedor—, así que «Volver al texto original» preguntaba **dos** veces y «Guardar» habría guardado
dos; la comparación del editado vivía solo en el botón; y la siembra del médico de las sondas usaba
`eco_medicos`, que **no existe** —la clave es **`ett_medicos`**—, error **heredado de la sonda de
PANT-31**, que medía el papel con el nombre del médico vacío y la firma dibujando «____».
**A/B contra `8967e5f`, con el PDF y el PPT generados de verdad en las 121 escenas: los dos volcados
son IDÉNTICOS BYTE POR BYTE** (md5 `92c0f603`), con **148.572** claves y **55.297** celdas de Excel
comparadas y **cero** diferencias de superficie firmada y de pantalla; **Excel 457** en las 121 y
**cero campos guardados nuevos**. Su cero de pantalla es un **control negativo declarado**: ese arnés
no abre Configuración, ni la sección, ni el editor, ni el menú, ni la hoja. Lo que prueba la tanda
son las cinco sondas propias y **TC-801 a TC-806**, con **51/51 mutaciones dirigidas muertas** en
2,8 min, en worktree y nunca sobre el vivo, con el md5 del vivo idéntico antes y después. **El
primer barrido dejó SIETE sobrevivientes**: **cuatro huecos reales** cerrados con condiciones nuevas
—la frase de la constancia duplicada, que contar palabras no veía; el camino de la **validación** del
almacén, que la cadena corrupta no ejercitaba porque caía en el `catch`; ocultar un incluido
**editado**; y el almacén guardando el archivo crudo—, **dos mal dirigidas** —`order:9` no mueve el
DOM, y el tope de propios era **redundante** con el tope total— y **una** que el texto de prueba no
ejercitaba. **Diecisiete casos existentes corridos antes de escribir nada y los diecisiete pasan SIN
adaptación.**
**Línea base al cierre: suite 814/821**, en **quince** lotes cubriendo los **821 casos distintos**
—contados nombre por nombre, **cero duplicados**—, en UNA sola pasada sobre el árbol sellado, con
los **821 ejecutados**, el md5 de `index.html` **idéntico** antes y después (`4979b4ff`) y el
pendrive `DISK_IMG` verificado al abrir, en cada uno de los quince lotes y al cerrar (diecisiete
verificaciones). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más
**TC-182**, **TC-706** y **TC-791**. ⚠️ **LOS TRES ÚLTIMOS SON SENSIBILIDAD DE LOTE PREEXISTENTE, Y
ESTÁ MEDIDO DE LA FORMA QUE LO DECIDE**: los tres pasan **aislados**, y corridos **en su lote**
contra `8967e5f` —el mismo archivo de casos, la misma composición de lotes, sólo el `index.html`
distinto— salen **rojos igual**: TC-182 en el lote 2, TC-706 en el 13 y TC-791 en el 15. **Ningún
rojo nuevo**, y **TC-551 y TC-557, los dos intermitentes declarados, salieron VERDES** en esta
corrida.
⚠️ **Y LA PRIMERA CORRIDA DIO 812/821 CON DOS ROJOS MÁS, LOS DOS MÍOS Y LOS DOS EXPLICADOS**:
**TC-753**, que tenía razón —`CLAUDE.md` todavía publicaba el sello de PANT-31 mientras el pie ya
traía el nuevo—, y **TC-805**, que **aislado pasaba y en su lote salía rojo** con «doc.save is not a
function». Esa es la segunda vez en dos tandas que un caso mío falla sólo en su lote: **veintitrés**
casos de este archivo envuelven `window.jspdf.jsPDF` para que `save` no baje un archivo, y uno que
vuelve temprano deja la envoltura puesta. Hoy el caso instala **su propia** envoltura y la restaura,
que es la única forma de que la condición mida lo mismo en cualquier lote.
**Chrome y WebKit coinciden en los VEINTE cruces** (dos motores × 1440, 1280, 1000, 768 y 390 px ×
dos temas) con **una sola combinación de valores**: el botón en 44 px, apagado en `display:none` con
alto **cero**, el menú con sus cuatro opciones y **cero** `onclick` inline, la sección en el índice
**5 de 9** con sus cuatro filas y **cero** botones «Borrar», el editor en dos columnas a 1440, 1280 y
1000 px y en una —con la vista previa **debajo**— a 768 y 390, cinco `textarea` y **cero**
`contenteditable` en su columna, la vista previa con su paciente **ficticio**, **cero**
`contenteditable` y «3 hojas», **cero** controles por debajo de 44 px, **cero** desplazamiento
horizontal y **CERO errores de consola y de página en los dos motores**. ⚠️ **Los «cinco textos
recortados» de 1000 px son un artefacto de medición y está medido**: son párrafos **dentro** de la
vista previa, que es una A4 con `zoom: 0,52` y `overflow: auto`, y el contenedor **no desborda en
ancho** en ninguno de los cuatro anchos (`scrollWidth` 794 = `clientWidth` 794) — lo que desborda es
el **alto**, que es para lo que la caja scrollea. **WebKit de Playwright no es Safari, y se declara.**
Semgrep **125 WARNING / 0 ERROR**, **un** aviso sobre la línea base de 124, y es el `innerHTML` del
editor, cuyas interpolaciones pasan **todas** por `escHtml` —medido con el texto que lo prueba: un
bloque con `<b>ojo</b>` y un `<script>` se ve como **texto**, con cero elementos—. **Sin huérfanos
nuevos**, medido en los dos árboles. **Celular 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada
ancho** — la línea base exacta, medida con el **mismo script en los dos árboles**. **17 de 19**
bloques de JS inline parsean, idéntico a la línea base.
⚠️ **UNA COSA QUE ESTA TANDA HIZO SIN QUE SE LE PIDIERA Y DESHIZO**: un `git add -A docs/` del commit
7 se llevó puestos **diecisiete** demos de `docs/3d/` que estaban sin rastrear desde tandas
anteriores. Volvieron a no rastreados con `git rm --cached` —los archivos **siguen en disco**, no se
borró nada— porque agregarlos no era de esta tanda.
Lo declarado, en **P32-a**, **P32-b** y **P32-c**; el mapa, en
`docs/mapa/pant32-modelos-documentos.md`; el inventario, en `docs/INVENTARIO_P32.md`; el manual del
médico, en `docs/DOCUMENTOS_P32.md`; las fichas, en `docs/mapa/tests-fichas-801.md`; la guía manual,
en `docs/GUIA_PRUEBA_PANT32.md` (**67** pasos).

**La tanda PANT-31 (2026-11-10) — la hoja de los documentos del Informe, y la casilla de PPT de las
prótesis valvulares.** NUEVE commits. Sello **`v20261110-1327`**, md5 **`fcb65077`**. ⚠️ **EL
DEFECTO QUE EL MÉDICO REPORTÓ ERA UNA LÍNEA DE CSS, Y NO UN RECORTE**: `.doc-hoja-wrap` es
`display:flex` y su `align-items` computaba `normal` —o sea **stretch**—, así que la hoja recibía un
alto **definido** igual al de la caja del envoltorio (783 px) en vez de crecer con su contenido, y
**1.502 de los 2.285 px de tinta del ETE se dibujaban por fuera del papel blanco**, sobre el fondo
oscuro del overlay (2.677 a 390 px). No había desborde horizontal ni texto recortado en ninguno de
los cinco anchos: el problema era entero vertical. Y la hoja pasa a ser una **A4 de verdad** —210 mm,
`min-height` 297, los márgenes de `DOC_GEO`— con el cuerpo y el interlineado en los **puntos** de la
misma `def` que maqueta jsPDF (10,5 / 10,2 / 8,8 pt) contra los 12,5 px fijos que usaba para los
cuatro, los seis tamaños derivados por `calc(var(--doc-sz) + n pt)`, y `docZoomAjustar` escribiendo
el único número que la hace entrar (1 / 1 / 1 / 0,937 / 0,461). **`zoom` y no `transform`**, porque
`transform` no participa del flujo y dejaría el alto sin escalar reservado; y porque **con `zoom` el
clic real cae donde se ve**, verificado con teclado real a 390 px. ⚠️ **LA HIPÓTESIS «NO PUDO
EDITAR» ES FALSA, Y LA PRIMERA MEDICIÓN LA «CONFIRMÓ» SOBRE LA PANTALLA DE LOGIN**:
`#login-overlay` es `position:fixed` con `z-index:2147483000` y tapa todo, así que el clic real
caía ahí y el foco quedaba en `BODY`. Con la sesión abierta, el párrafo, la viñeta y la casilla se
editan en los cinco anchos. Lo que **sí** faltaba es el **pegado**: la app no tenía **un solo**
oyente de `paste`, así que entraba el marcado del origen; hoy un oyente delegado lo cancela e
inserta `text/plain` por `docSan`. El **clic en el fondo** cierra —con `event.target===this`, que es
además lo que evita que `enhanceClickables` lo vuelva un `role="button"`— y con correcciones a mano
**pregunta**, con el foco en «Seguir editando» y **Escape = seguir editando**, cortado con
`stopImmediatePropagation` porque el oyente genérico de accesibilidad le apretaría «Cerrar».
**«Guardado o impreso» es un estado propio** (`st.entregado`). ⚠️ **DOS PREMISAS DE R4 YA PASABAN**:
Escape ya cerraba la hoja y el visor de la miniatura ya cerraba con Escape y con un clic afuera. La
**constancia** pasa a **tres oraciones** —medido, las dos últimas caían a mitad de renglón— y el
**encabezado** pone el **logo a la izquierda** con el **nombre centrado** en el ancho de la hoja, en
las tres superficies, probado con un logo ancho y uno cuadrado sin deformar; ⚠️ **la premisa de R6
era FALSA: el círculo salía a la DERECHA** (x 189 de 210 mm en el papel, x 1054 en pantalla). Los
**tres consentimientos** quedan a 10,2/13,4 pt con **dos hojas más la común** —medido sobre el PDF
generado de verdad, 3 y 3 y 3—, el salto antes de «Antes del estudio» en el ETE y en burbujas y
antes de «¿Hay otras alternativas?» en la cardioversión, la declaración con 5 pt entre viñetas y
8,30 mm arriba de cada línea de casillas, 6,76 mm hasta la tabla de firmas y su fila en 16 mm, y las
**hojas comunes sin título** en **una** hoja. ⚠️ **Y LA LÍNEA DE «capacitado para recibir la
información» NO TENÍA CASILLAS EN EL PAPEL**: era un `p` con los U+2610 **dentro** del texto, que
`docSan` convierte en un espacio, así que salían **dos huecos** en una línea que el paciente tiene
que marcar; el `cajas: 1` que llevaba era una bandera **muerta** —nadie la leía y
`docBloquesNuevos` ni la copiaba, igual que `neg`—. Hoy es un bloque **`pchk`** y
`parrafoCasillas` la maqueta palabra por palabra dibujando un cuadrado donde está cada glifo, **sin
cambiar una palabra del texto**. En el **Laboratorio**, «Prótesis valvulares» gana su **casilla de
PPT** —44 × 44 px, a 14 px del borde, sin marcar de fábrica, en la misma clave
`ecosmart_lab_ppt_chk`— con un **grupo propio** `prot` y su diapositiva; sin tildar el mazo sale
**idéntico** (3 hojas, 0 gráficos, 0 tablas) y con tildar trae **una** más, y destildar vuelve
exacto. ⚠️ **EL GRÁFICO APILADO DE DOS PILAS NO TIENE EQUIVALENTE NATIVO EN ESTE MAZO**, y se midió:
`_pptAddChart` se usa con **una sola serie** en las catorce hojas y no hay un solo `barGrouping`, así
que las barras van con `gBarras` y las categorías **posición · tipo** combinadas (**P31-b**).

⚠️ **Y EL HALLAZGO DE MÉTODO MÁS CARO DE LA TANDA ES NUEVO: UN ACENTO GRAVE DE MÁS NO SIEMPRE ROMPE
EL PARSEO.** Dos, alrededor de «indexOf», en un comentario que agregué a **TC-798**, cerraron su
template antes de tiempo, y lo que quedó era JS **válido** —una cadena, un `.indexOf` y un `-1`—,
así que `node --check` **pasó** y el caso quedó registrado con `fn` igual al **número −1**: el runner
lo evaluaba, le devolvía `undefined` y lo reportaba como «el caso no declara NINGUNA condición».
Lo encontré imprimiendo `c.fn.length`, que dio **2**. **Y EL BARRIDO DE MUTACIONES LO CONTÓ COMO
COBERTURA**: un caso que falla siempre produce un `✗`, y el scorer lee el `✗` como «muerta», así que
las **seis** mutaciones declaradas a TC-798 salieron «muertas» en los dos primeros barridos sin que
eso probara nada. Se rehizo el barrido entero. El runner gana un **guardián de arranque** —el cuerpo
de todo caso tiene que ser una **cadena** de más de 40 caracteres, y si no sale con 1— verificado por
mutación: reintroducir los dos acentos graves en una copia lo pone en rojo con el id del caso.
**A/B contra `e531b73`, con el PDF y el PPT generados de verdad: 121 escenas, 148.572 claves,
55.297 celdas de Excel y CERO diferencias de superficie firmada** —informe en los tres estilos, EN
SUMA, las **457** columnas, los campos, el Laboratorio, el PDF en sus seis plantillas y el PPT de un
estudio—. Su **cero de pantalla es un control negativo declarado**: ese arnés no abre el menú, ni la
hoja, ni la sección del Laboratorio, ni tilda la casilla; lo que prueba la Parte A son las cuatro
sondas propias y TC-795 a TC-800. **44/44 mutaciones dirigidas muertas**, en worktree y nunca sobre
el vivo, con el md5 del vivo idéntico antes y después; los tres sobrevivientes del primer barrido
eran **huecos de cobertura** y se cerraron con condiciones nuevas —el tope de 1 del zoom, que en la
ventana del suite no hace nada; el pegado del `text/html`, que `execCommand` mete como **texto** y
contar elementos no veía; y el corte del Escape, que se mide con un **centinela** porque el oyente
genérico elige el diálogo visible más alto y en este árbol no siempre es la hoja—.
**Suite 809/815** en quince lotes, en UNA pasada sobre el árbol sellado, con los 815 ejecutados, el
md5 idéntico antes y después y el pendrive `DISK_IMG` verificado diecisiete veces; los rojos son
**TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-551 y TC-557**, los dos
intermitentes declarados, que pasan **3 de 3 corridos aislados**. **Ningún rojo nuevo**, y **TC-753 quedó verde** después de corregir lo que
tenía razón en marcar: mi reflujo del renglón de tamaño había partido el sello y el md5 en dos
líneas. **Chrome y WebKit coinciden en los VEINTE cruces** (dos motores × 1440, 1280, 1000, 768 y
390 px × dos temas): los dos bordes derechos alineados, cero solapados, la hoja con el mismo zoom
(1 / 1 / 1 / 0,937 / 0,461), **toda la tinta dentro del papel**, cero desborde horizontal, tres
hojas de PDF, el cuerpo en 13,6 px = 10,2 pt exactos, el encabezado en tres columnas con el nombre a
**0,0 px** del centro, la edición y el pegado llano, la pregunta de cierre con su foco y su tarjeta
dentro de la pantalla, la casilla en 44 × 44 px igual a la de «Valvulopatías», y **cero errores de
consola y de página en los dos motores**. Las dos únicas diferencias entre motores son de métrica de
fuente: 2 px de ancho en el botón (134 contra 132) y tres textos que WebKit informa recortados sin
ganar un píxel de desplazamiento (**P31-f**). Semgrep **124/0**, la línea base; **sin huérfanos
nuevos**, medido en los dos árboles; **celular 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada
ancho** —el archivo del barrido es **idéntico byte por byte** al del árbol base—. Lo declarado, en
**P31-a** a **P31-g**; el mapa, en `docs/mapa/pant31-hoja-ppt.md`; el inventario, en
`docs/INVENTARIO_P31.md`; las fichas, en `docs/mapa/tests-fichas-795.md`; la guía manual, en
`docs/GUIA_PRUEBA_PANT31.md`.

**La tanda PANT-30 (2026-11-10) — los documentos del Informe y las prótesis valvulares en el
Laboratorio.** NUEVE commits. Sello **`v20261110-1041`**, md5 **`f4ded2a9`**. El Informe gana un
botón **«Documentos ▾»** en su única fila de acciones —la que ya tiene «Regenerar Informe»— con
cuatro opciones **siempre activas**: una **constancia** y tres **consentimientos** (cardioversión
eléctrica, ETE con sedación, test de burbujas). ⚠️ **UNA LISTA DE BLOQUES, UN MAQUETADOR, TRES
EMISORES**, y eso es todo el diseño: `docMaquetar` convierte la lista de bloques en operaciones de
dibujo con sus coordenadas, y de esa única lista salen la hoja de pantalla, el PDF y la imagen.
⚠️ **NO SE IMPRIME CON `window.print()`** —lo declara `amiloImprimirPDF` desde hace tandas: capturaba
la interfaz entera—, así que el papel se arma con jsPDF, que es además lo que hace medible el
formato: A4, 14/12/13 mm de margen, cuerpo e interlineado por documento, justificado **palabra por
palabra** —calculado acá y no delegado al `align:'justify'` de jsPDF, que dejaría a la imagen sin
las posiciones—. ⚠️ **LA CASILLA SE DIBUJA, NO SE ESCRIBE**: U+2610 no existe en WinAnsi y además
`splitTextToSize` lo mide con métricas inventadas; los **acentos sí** se conservan. **Las hojas,
medidas en el PDF de verdad**: constancia 1, cardioversión 1 + 1 de hojas comunes, burbujas 1 + 1,
ETE 2 + 1 con «Antes del estudio» arrancando la hoja 2, la declaración y las firmas en la **misma**
hoja en los tres y el pie en **todas**. ⚠️ **Y PARA QUE ENTRARAN HUBO QUE MEDIR DOS COSAS, no
apretar la tipografía**: el aire entre bloques se llevaba una hoja entera (292 mm sobre una banda
de 272), y **`altoGrupo` mide la TINTA y no la `y` de cierre** —esa `y` incluye el margen que el
último bloque deja detrás, 2 mm, y al final de una hoja no ocupa nada—; sin eso el de burbujas
pasaba de hoja por **1,9 mm** de aire que no se imprime. Hoy cierra con **5,3 mm** libres →
**P30-b**. **La hoja es editable y NUNCA se pisa**: el estado vive en memoria (**P30-a**) y con un
dato cambiado aparece «Actualizar con los datos» sin tocar nada. **«Guardar en Imágenes» va a
`esqs` y no a `imgSlots`**, que es lo que deja el papel quieto, y `guardarEsquema` **reemplaza**,
así que el «actualizar» no necesita camino propio. En el **Laboratorio**, «Mediciones» gana
**«Prótesis valvulares»** debajo de Valvulopatías, con su reflejo en el PDF de auditoría justo
después de la sección 9. ⚠️ **NO PUEDE LLAMAR A NINGÚN EVALUADOR DE PRÓTESIS**, y eso decide todo:
los cuatro leen el DOM y el Laboratorio corre sin DOM. Posición, tipo y modelo salen de **campos
guardados**; el **trastorno**, del **texto del informe** —el mismo mecanismo con que esta pestaña
ya clasifica la geometría del VI— y la pantalla lo **dice** (**P30-e**). **Las ocho conclusiones se
midieron en el navegador** en once escenas, no leyendo el código, y eso corrigió dos cosas: la
aórtica emite «con posible estenosis» **sin** la palabra «protésica», así que se busca sólo dentro
de las oraciones que nombran una prótesis; y la mitral y la pulmonar **no escriben conclusión**.
**DOS pilas** en el gráfico —las reparaciones no se suman—, **`data-ppt-no`** y no `data-ppt`
—`data-ppt` agregaría una diapositiva al PPT— y el **«con alteración» de un modelo sale de SU
posición**. ⚠️ **TRES DEFECTOS PROPIOS QUE LA VERIFICACIÓN DESTAPÓ Y LA LECTURA NO**: el id
`doc-aviso` caía en el barrido `[id$="-aviso"]` de «Nuevo estudio» y **se llevaba el botón del
aviso puesto** —TC-790 verde aislado y rojo en su lote—; **`hidden` no oculta un `.btn`** en esta
app, porque `.btn` declara `display:inline-flex` y le gana al `[hidden]` del navegador, así que
«Quitar de Imágenes» se veía **siempre**, 141 px de ancho con el atributo puesto; y un `style`
duplicado desalineaba las filas grises de la tabla de modelos. ⚠️ **Y UN DEFECTO PREEXISTENTE,
declarado sin tocarlo (P30-d)**: `showTab` lee el `window.event` **global**, y después de una
escritura en IndexedDB ese global es el `success` de la transacción, cuyo `target` es un
`IDBTransaction` —que no tiene `classList`—, así que la función aborta. **A/B contra `41d9c1d`,
con el PDF y el PPT generados de verdad: 121 escenas, 148.572 claves, 55.297 celdas de Excel y
CERO diferencias de superficie firmada**; su cero de pantalla es un **control negativo** declarado,
porque ese arnés no abre el menú, ni la hoja, ni la sección. Lo cubren **TC-787** a **TC-794**, los
ocho cayendo **0/8** contra la línea base, con **47/47 mutaciones dirigidas muertas** —ocho
sobrevivieron al primer barrido y se cerraron con condiciones nuevas, no aflojando la mutación—.
**Chrome y WebKit coinciden en los dieciséis cruces** (dos motores × cuatro anchos × dos temas),
con las **174 operaciones de papel del ETE idénticas** en los dos y sus tres hojas, el botón en 44
px, las cuatro opciones con 44 px de alto, las casillas en **dos** columnas salvo a 390 px, el
resumen en dos columnas a 1440 y 1000 y en una a 768 y 390, **cero** desplazamiento horizontal y
**cero** errores de consola y de página. La única diferencia es que **WebKit desborda el texto
justificado por menos de un carácter** —3,28 y 1,51 px en dos bloques, a 768 px—, declarado en
**P30-g** y sin tocar: no tapa nada, no gana scroll y no llega al papel. **Suite 804/809** en
quince lotes, en UNA pasada sobre el árbol sellado, con los 809 ejecutados, el md5 idéntico antes
y después y el pendrive `DISK_IMG` verificado diecisiete veces; los rojos son los cuatro de
siempre más **TC-557**, el intermitente declarado, que pasa **3 de 3** aislado. Semgrep **124/0**,
Excel intacto, **cero campos guardados nuevos** (1010 contra 1010), **celular 59 hallazgos a 360 px
y 67 a 390, con 18 ALTA en cada ancho** —la línea base exacta—. Lo declarado, en **P30-a** a
**P30-g**; el mapa, en `docs/mapa/pant30-documentos-protesis.md`; el
manual del médico, en `docs/DOCUMENTOS_P30.md`; el inventario, en `docs/INVENTARIO_P30.md`; las
fichas, en `docs/mapa/tests-fichas-787.md`; la guía manual, en `docs/GUIA_PRUEBA_PANT30.md`.

**La tanda PANT-29 (2026-11-10) — Referencias más breve y las arterias coronarias en el 3D de
Contractilidad.** TRECE commits. Sello **`v20261110-0034`**, md5 **`6aa22c01`**. Las **tres fichas
grandes** de PANT-28 se **quitan** con su reparto —sumaban 83.067 caracteres de `textContent`
contra los 2.702 de `ref-miocard` entera— y las reemplazan **dos resúmenes breves** dentro de
`ref-miocard`, con el molde medido del sector y por debajo de su techo de **849** caracteres y 7
viñetas, y **cuatro viñetas** dentro de `ref-coronarias` con tipos, frecuencia, riesgo y cirugía.
El reparto vuelve de **43 a 40** y el índice del buscador de **41 a 38**, sin un solo cambio en
el buscador: su índice se arma recorriendo los encabezados de cada panel. ⚠️ **EL GLOBO
`otr-rac` QUEDA IDÉNTICO CON UNA LÍNEA**: clonaba `r.children` entero, y hoy `_otrRefClon`
saltea los hijos marcados `data-ref-solo` —478 caracteres por el clon y 494 en pantalla, en los
dos árboles—. ⚠️ **MEDIR ESE GLOBO EXIGE ABRIR EL ACORDEÓN «variantes» PRIMERO**: cerrado, el
botón mide 0×0, `_vInfoColocar` devuelve `null` y la cuenta da cero caracteres sobre un globo que
sí existe. En **Contractilidad**, las dos tarjetas grises se achican a `7px 9px` de relleno y,
con el 3D abierto, a **220** y **150 px** con el 3D como columna flexible —que le da 104 px más a
1440 px y, de paso, **corrige un defecto preexistente**: a 1000 px la columna de hallazgos medía
**44 px** con dos textos recortados, y hoy mide 220 con cero—. La tarjeta de hallazgos gana el
bloque «**Arterias posiblemente involucradas**» con sus cinco formas de texto, cuya pertenencia
sale de `CONTR_TERRITORIO` —que reparte **igual** que la demo— y cuyo nivel se decide por el
**mínimo número AHA** alterado, que es la regla del pedido leída al revés. Y el 3D gana el botón
«**Coronarias**» con las arterias del paciente, el tronco de la aorta, las **siete** letras y un
panel de tres filas. ⚠️ **LA DEMO ES three.js Y ESTE 3D NO**: es un pintor 2D propio sobre un
canvas de 680×380, así que lo que se porta es la **definición** de cada arteria, con la
conversión medida `d = ph + 90`. ⚠️ **LAS ARTERIAS ACOMPAÑAN LA CONTRACCIÓN PORQUE LEEN EL MISMO
RADIO QUE LA PARED** —`lv3dRing(k, fase, G)` por cuadro, con Catmull-Rom en el espacio de
**parámetros** y no de puntos 3D—: medido en cuatro fases y 340 muestras, el cociente contra la
pared se desvía 4,8 × 10⁻⁵ mientras el radio absoluto se contrae de 4,50 a 3,39. La demo **no se
anima**, así que eso no sale de ella. ⚠️ **CON «Coronarias» APAGADO EL 3D ES IDÉNTICO, MEDIDO POR
PÍXELES**: el mismo hash y los mismos 52.322 bytes que HEAD. ⚠️ **Y TC-783 DESTAPÓ UN DEFECTO
REAL**: el trazo de las arterias dejaba `lineJoin` en `round` y el contexto del canvas es el
mismo entre cuadros, así que el repaso de contorno de los 1.440 cuadros de la malla quedaba
cambiado **para siempre** y el defecto sobrevivía a apagar el botón; una comparación de
estructura no lo habría visto, porque no mueve un solo polígono. **El papel es IDÉNTICO**: 125
escenas, 153.484 claves y 57.125 celdas, con PDF y PPT generados de verdad, cero diferencias,
medido dos veces. Lo cubren **TC-778** a **TC-783** —los seis de PANT-28, **reescritos**
conservando su número, porque afirmaban las fichas que esta tanda quitó— y **TC-784** a
**TC-786**, con **TC-502**, **TC-509**, **TC-761**, **TC-763**, **TC-563** y **TC-490**
adaptados; los tres últimos **invertidos**, y en los tres es el día que su propia excepción
anunciaba. **Suite 794/801** en quince lotes, en UNA sola pasada sobre el árbol sellado, con los
cuatro rojos de siempre, los dos intermitentes declarados y **TC-753**, que fue mío y tenía razón:
`CLAUDE.md` publicaba el sello del primer sellado y el pie ya traía el segundo. **36/36 mutaciones
dirigidas muertas** —las dos que sobrevivieron al primer barrido eran huecos reales y se cerraron
con dos condiciones nuevas, no aflojando la mutación—, Semgrep **124/0**, Excel **457**, celular
**59 y 67 con 18 ALTA**, y Chrome y WebKit coincidiendo en los dieciséis cruces con **cero**
errores de consola y de página. ⚠️ **LOS COMMITS 6 Y 7 —los resúmenes de las DIECINUEVE cardiopatías congénitas de la
app— QUEDARON AFUERA por capacidad**, que es la prioridad que la orden fija; lo que falta, con
las dos guías y sus reglas de folio listas para reusar, está en **P29-a · 1**. Lo declarado, en
**P29-a**, **P29-b** y **P29-c**; el mapa, en `docs/mapa/pant29-coronarias-3d.md`; la guía
manual, en `docs/GUIA_PRUEBA_PANT29.md`.

**La tanda PANT-28 (2026-11-09) — Referencias: las anomalías coronarias, el corazón de atleta
y la miocardiopatía chagásica.** NUEVE commits. Sello **`v20261109-2009`**, md5 **`c4fb0ba6`**.
Referencias gana **TRES fichas** y el reparto pasa de **40 a 43** entradas, con el índice del
buscador de **38 a 41**: la de **detalle de anomalías coronarias** (`ref-racong`), con siete
bloques numerados, y las de **corazón de atleta** (`ref-atleta`, seis bloques) y
**miocardiopatía chagásica** (`ref-chagas`, siete), pegadas a `ref-miocard` en «Otros
hallazgos». ⚠️ **La de coronarias es una ficha HERMANA y no va dentro de `ref-coronarias`, y
está medido**: el globo ⓘ `otr-rac` clona esa ficha **entera**, así que todo lo que entrara ahí
entraría a una tarjeta de 360 px; medido en los dos árboles, la ficha vieja da **445**
caracteres y el globo **478**, idénticos. **Cada cifra sale de una hoja leída EN IMAGEN a 200
ppp** con su folio comprobado en el pie o la cabecera: Frommelt (hoja + 258, en once hojas), la
ACC/AHA 2025 (e + hoja + 114), la ESC 2020 inglesa (hoja + 562), la ESC 2022 (hoja + 3996), la
AHA/ACC/HRS 2017 (e + hoja + 271), Ommen (e + hoja + 1238), la ASE 2020 de eco de estrés (folio
= hoja), Baggish (hoja + 522), **Sharma 2017** (hoja + 1056), Japp 2016 (hoja + 2995), la ESC
2023 (hoja + 3502) y Nunes (e + hoja + 168). ⚠️ **El documento nuevo de ECG en atletas SE
ENCONTRÓ Y SE LEYÓ** —Sharma y cols., *JACC* 2017;69(8):1057-75—, así que el bloque de ECG del
atleta **existe**; en cambio las coronarias **no tienen** bloque de ECG, de restricción del
deporte ni de aneurismas, porque ninguna hoja leída publica contenido verificado sobre eso. La
oración del folio **4698** del trombo protésico grande se agrega a la **aórtica MECÁNICA**,
donde la pregunta **ya** estaba acotada por `esMec` —lo que corrige una frase de PANT-27: la que
no está acotada es la **tricúspide**, y no se le prestó—. **El papel es IDÉNTICO**: 125 escenas,
153.484 claves y 57.125 celdas de Excel, con PDF y PPT generados de verdad, **cero
diferencias**. Lo cubren **TC-778** a **TC-783**, con **TC-502**, **TC-509** y **TC-761**
adaptados; **40/40 mutaciones dirigidas muertas** —las dos que sobrevivieron al primer barrido
eran **redundancia** y se cerraron afinando la condición, no la mutación—. Lo declarado, en
**P28-a**, **P28-b** y **P28-c**; el inventario, en `docs/INVENTARIO_REFERENCIAS_P28.md`; los
tres controles de lectura, en `docs/CONTROL_CORONARIAS_P28.md`, `docs/CONTROL_ATLETA_P28.md` y
`docs/CONTROL_CHAGAS_P28.md`; la guía manual, en `docs/GUIA_PRUEBA_PANT28.md`.

**La tanda PANT-26 (2026-11-09) — las prótesis aórticas, la mitral y el 3D de congénitas.**
OCHO commits. Sello **`v20261109-1705`**, md5 **`e2ebb637`**. La **cápsula de la aórtica se
repinta al elegir el modelo**: `vModTrasElegir` faltaba desde PANT-19 —dos llamadas guardadas con
`typeof`, cero definiciones— y el informe ya decía «significativa» mientras la cápsula seguía en
«Posible». La **TAVI compara su área efectiva contra la del modelo**, con la **misma** función,
los **mismos** cortes y el **mismo** dueño: lo único que cambió en `eaProtEOAz` es que pregunta
por `valvEsProtesis` en vez de dos cadenas escritas a mano. El **desajuste** gana la condición de
la nota al pie de la **Tabla 7** —«measured EOA is within 1 SD of the reference EOA», hoja 19,
folio **20** comprobado en la cabecera impresa, leída en imagen a 400 ppp—: con modelo y desvío se
publica sólo si se cumple, y **no se escribe nada en su lugar**; la fila de pantalla sigue
publicando el número. Con **velocidad o gradiente altos y sin eje independiente** el papel dice
**«con posible estenosis»** —EN SUMA «TAVI con posible estenosis.» o «Prótesis aórtica: posible
estenosis.»—, con el paréntesis de medidas conservado: censo combinatorio de **64** escenas,
cambian **24** y las otras **40** quedan idénticas. Una **TAVI con desajuste ya no sale
«normofuncionante»**, y con un solo predicado alcanza a los **seis** caminos que publican la
palabra. La **mitral** publica el valor y la escala por fila y **no concluye**: la conclusión
queda sólo en el resumen, que es el que cuenta criterios. Cuatro **declaraciones de criterio
propio** —los cortes de la TAVI, su área, la regla de la pulmonar y la condición del desajuste—,
y la salvedad de la TAVI pierde su atribución a la guía. El **globo del 3D de congénitas** pasa al
texto aprobado, de tres párrafos, y la línea de abajo dice «Cargadas y no representadas en este
diagrama», sin «todavía». ⚠️ **Una premisa de la orden no se reprodujo**: la suite tiene **768**
casos, no 783. Y la **Evidencia de la prótesis aórtica ya razonaba** las cinco causas, así que no
se tocó. Lo cubren **TC-769** a **TC-777**, con **TC-303**, **TC-474**, **TC-726**, **TC-734** y
**TC-757** adaptados; **38/38 mutaciones dirigidas muertas**. Lo declarado, en **P26-a**; el mapa,
en `docs/mapa/pant26-protesis-aortica-mitral.md`; la guía manual, en `docs/GUIA_PRUEBA_PANT26.md`.

**La tanda PANT-27 (2026-11-09) — los catorce textos de la Evidencia que el médico aprobó.**
CINCO commits. Sello **`v20261109-1203`**, md5 **`a14c45a0`**. Las **siete notas de la estenosis
mitral** pasan a afirmar: T1 dice qué área usa la aplicación en vez de relatar el operador de
cada parte del documento, y **T2 declara los cortes de 5 y 10 mmHg como criterio de la
aplicación** en vez de contar de qué documento no salen — con lo que **las dos notas «Queda
declarado, no corregido» de la sección quedan cerradas**. T3, T4 y T5 dicen lo que la guía dice,
sin comparar sus partes ni decir qué le falta al documento consultado; T6 y T7 pierden la
tipografía de énfasis y la aposición. La entrada **`fon.ev.sangrado` de Fontan** dice lo que la
ESC 2020 indica y **pierde su `tramo`**, que es el remate que comparaba las dos guías; el último
párrafo del globo **`tavi-calc`** afirma la calcificación severa sin decir que la guía no la
define; y el bloque del **reverso diastólico** dice los tres grados en castellano. **La cirugía
ante un trombo protésico grande no obstructivo** se suma en una oración aparte, leída **en imagen
a 300 ppp** en la hoja 64 con el folio **4698** comprobado en la cabecera, y **sólo** en el ramal
de prótesis **mecánica**, que es el único lugar acotado por tipo. ⚠️ **TRES premisas de la orden
no se reprodujeron**: T10 a T13 no están en la Evidencia sino en la ficha de Referencias
`ref-ia`; T14 sólo es específico de mecánica en **uno** de sus tres lugares visibles, así que los
otros dos quedaron **PARADOS**; y T2 son **dos** notas, una por etiología. **El papel es idéntico
a HEAD** y ningún cálculo, corte ni condición se movió. Lo cubren **TC-765** a **TC-768**, con
**TC-328** y **TC-516** adaptados; **40/40 mutaciones dirigidas muertas**. Lo declarado, en
**P27-a**; el mapa, en `docs/mapa/pant27-textos-evidencia.md`; la guía manual, en
`docs/GUIA_PRUEBA_PANT27.md`.

**La tanda AUD-PROT (2026-11-09) NO toca `index.html`** —md5 `f2587ad8`, sin cambio— y no
genera sello: la linea base sigue siendo la de PANT-25. Cuatro commits, solo documentos y dos
sondas de solo lectura. Audita la logica de las CUATRO posiciones protesicas —parametros, cortes
literales, regla de combinacion, estados y el texto de cada superficie—, el catalogo de modelos
y el contraste con CINCO hojas de la ASE 2024 releidas en imagen. **Tres hipotesis de la orden
quedaron desmentidas**: el «sin datos suficientes» es solo de la AORTICA —la mitral, la
tricuspide y la pulmonar no escriben nada cuando no concluyen—; **28 de los 108 modelos del
catalogo no sirven** para comparar el area en desviaciones estandar; y el motor aortico no
distingue biologica de mecanica. Y destapo dos cosas que nadie habia visto: una **TAVI con
desajuste severo sale «normofuncionante»** en el cuerpo y en el EN SUMA, y la **capsula de
pantalla no se repinta al elegir el modelo** porque `vModTrasElegir` no existe en el archivo.
Todo en `docs/AUDITORIA_PROTESIS.md`; lo declarado, en `docs/PENDIENTES.md` -> **PRO-a** a
**PRO-d**.

**La tanda PANT-25 (2026-11-08) — Referencias se ordena como la app, y masas y fuentes
embolígenas ganan lo que les faltaba.** SEIS commits. Sello **`v20261108-0123`**, md5
**`f2587ad8`**. La pestaña Referencias pasa de **seis a NUEVE** pestañas principales:
**Cardiopatía congénita** —con Anomalías coronarias adentro—, **Cardiotoxicidad** y
**Hemodinámica**, las tres **antes de «Otros hallazgos»**. **Se mueve, no se reescribe**, y está
medido: de las **40** entradas, **cero** cambian de texto, de título o de conteo de hijas, y sólo
**cinco** cambian de panel; **ningún id cambia**. `SUBTIT` era el único enlace que se rompía solo
y entra en el mismo commit. Las **50** claves de «Ver referencia» resuelven en los dos árboles, y
el buscador da **26 términos idénticos y 10 que sólo cambian el rótulo de sección**, sobre 36.
La ficha de **masas** pasa de **14 filas a 63** con los cinco bloques de la decisión (5), y la de
**fuentes embolígenas** de **18 a 31** con las sensibilidades y los predictores de embolia; cada
cifra se leyó **en imagen**, con las tres reglas de folio comprobadas en el pie o la cabecera, y
la tabla de control está en `docs/CONTROL_MASAS_P25.md`. **La fila sin fuente de la OMS sale** y
**la cláusula que exponía lo pendiente también**, por la regla del 08/11. **El papel es idéntico a
HEAD**: 121 escenas, 148.572 claves y 55.297 celdas, cero diferencias. Lo cubren **TC-761** a
**TC-764**, con **TC-502**, **TC-509**, **TC-531**, **TC-534** y **TC-679** adaptados. ⚠️ **La
premisa central de la orden no se reprodujo**: las dos fichas **ya existían** desde PANT-11.
**Suite 773/779** en quince lotes, con los cuatro rojos de siempre más TC-551 y TC-557, los dos
intermitentes declarados, que pasan **4 de 4 aislados**; Semgrep **124/0**, Excel **457**,
celular **59 y 67 con 18 ALTA**, y Chrome y WebKit coincidiendo en los dieciséis cruces. Lo
declarado, en **P25-a**, **P25-b** y **P25-c**; el inventario, en
`docs/INVENTARIO_REFERENCIAS_P25.md`; la guía manual, en `docs/GUIA_PRUEBA_PANT25.md`.

**La tanda PANT-24 (2026-11-08) — cierre de textos de prótesis y de la Evidencia, y el tamaño
táctil del ⓘ.** SIETE commits. Sello **`v20261107-2204`**, md5 **`b8481a9b`**. La **TAVI sin un solo dato que indique
estenosis o insuficiencia protésica** dice «normofuncionante» en el informe y «TAVI
normofuncionante.» en el EN SUMA —con el paréntesis de medidas, porque ningún número medido
desaparece—; un **AT/ET de 1 o más** es un error de carga, así que la fila dice «Revisar los
valores» y el cociente deja de publicarse en el papel, lo que cierra **P18-b**; la cita
**`escGuchCiv`** declara su criterio como propio de la aplicación con el molde de PANT-22; el
corte del **trombo protésico grande** pasa a «10 mm o más» con su cita en la Figura 20; y el **ⓘ
de la Evidencia** gana una zona de toque de **44 × 42 px** en pantallas táctiles, con los 42
medidos sobre **129 pares de vecinos a 42,9 px**. **El decimal con coma sólo en pantalla**: el
papel tiene DOS diferencias autorizadas y un separador no es una. Lo cubren **TC-757** a
**TC-760**; **TC-289** adaptado, y es el caso que encontró la tercera fuente de insuficiencia
protésica. **P18-b** y **P18-d** quedan cerrados; lo declarado, en **P24-a**, **P24-b** y
**P24-c**; el inventario, en `docs/INVENTARIO_PANT24.md`; la guía manual, en
`docs/GUIA_PRUEBA_PANT24.md`.

**La tanda PANT-23 (2026-11-07) — la Evidencia, tanda 2 de 2.** Cuatro commits (el inventario,
el ORDEN, los GLOBOS y la cobertura en dos). Sello **`v20261107-1627`**, md5 **`224fd6ae`**. Pone el orden del
MODELO —la estenosis aórtica— en las **17** secciones que tenían el recuadro «Con lo contestado»
ARRIBA de las preguntas, y hace que los **473** globos de nota del panel abran el **cajón
flotante** y no su texto dentro de la fila: eran **105 en 17 secciones** los que lo abrían adentro,
y en Hemodinámica la fila pasaba de **43 a 637 px de alto**. **Ningún texto cambió** —28 secciones
idénticas byte por byte y 17 permutaciones puras, 502.468 caracteres de los dos lados— y **cero
citas se renumeraron**, porque el recuadro no emite un solo corchete. Lo cubren **TC-754**,
**TC-755** y **TC-756**; **TC-747 (F1)** quedó **invertido**. Lo declarado, **P23-a** y **P23-b**;
el inventario, en `docs/INVENTARIO_EVIDENCIA_P23.md`; la guía manual, en
`docs/GUIA_PRUEBA_PANT23.md`.

**La tanda LIMPIEZA-1 (2026-11-08) no toca `index.html`** —md5 `52f7573b`, sin cambio— y no
genera sello: la linea base sigue siendo la de PANT-22. Cuatro commits: el inventario, el
reparto de `docs/PENDIENTES.md`, el de `CLAUDE.md` y la cobertura. `CLAUDE.md` paso de 880.308
a **146.634 B** y `docs/PENDIENTES.md` de 1.007.449 a **888.548**, o sea de unos **472.000 a
unos 259.000 tokens** entre los dos. Lo cubre **TC-753**; lo declarado, **L1-a** y **L1-b**.

<!-- /L1:INDICE -->
### La Evidencia de un sector no incluido, y los textos que comparaban fuentes — «PANT-22» (2026-11-07)

- **OCHO commits —contados con `git log e727fe2..HEAD` AL CERRAR, y el commit que escribe este
  número entra en la cuenta— y los SEIS de código se hicieron enteros.** `9bc3e5c` (1, el
  inventario, que no toca una línea de la app) · `97ff7b6` (2) · `ab6624d` (3) · `1f7cff0` (4) ·
  `3109186` (5) · `ff61952` (6a, los casos, las mutaciones y el sello) · `1c4ace3` (5b, las TRES
  cadenas de Referencias que el censo no vio) · **éste** (6b, la documentación).
  Sello **`v20261107-1137`**, md5 **`52f7573b`**. Al empezar, `origin/main` =
  `HEAD` = **`e727fe2`**, el cierre de PANT-21, ya publicado, con md5 `439f6bb0` y el pendrive
  `DISK_IMG` montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  ⚠️ **EL COMMIT 6a SELLA ANTES DE LA VERIFICACIÓN Y EL 6b NO VUELVE A SELLAR**, porque no toca
  `index.html`: así el árbol que la suite, el barrido, el A/B, los dos motores y el celular midieron
  es exactamente el que queda commiteado.

- **EL DEFECTO QUE EL MÉDICO REPORTÓ SE REPRODUJO CON EL GESTO REAL.** Con un TAPSE de 14 mm y un
  E/e′ de 16 cargados y **sin incluir ningún sector avanzado en el informe**, el panel de Evidencia
  abría igual «Constricción pericárdica — diagnóstico», «Perfil hemodinámico — presiones y
  resistencias estimadas por eco» y «Amiloidosis cardíaca — algoritmo diagnóstico». Hoy no abre
  **ninguna** de las trece, y con el sector incluido su sección sale **idéntica** a HEAD.

- **UN SOLO MECANISMO EN UN SOLO LUGAR.** `_indSectorIncluido(av)` vive justo antes de `IND_SECS`,
  se consulta en **`indicRender`** —el **único** punto de armado, censado: lo llaman `indicAbrir` y
  `_indRepintarConservando`— y se declara con la propiedad **`av`** de la entrada, el mismo patrón
  con que `amiloSecs` declara `soloHoja` y `omitir`. **TRECE** entradas la tienen; las **treinta y
  dos** que no son de un sector avanzado **no se tocan**, y una sección sin `av` no se filtra.
  ⚠️ **LEE EL MISMO INTERRUPTOR QUE LEE EL INFORME Y NO UNA COPIA DEL CRITERIO**: `amiloIntegrado`,
  que es el que `amiloEnInforme()` consulta para armar la hoja del PDF. Con un predicado propio, el
  día que ese interruptor cambie el panel y el informe discreparían sobre el mismo sector.
  ⚠️ **Y LA LLAMADA VA PELADA, SIN `typeof`**: si la función no existiera, un `typeof` devolvería
  falso en silencio; pelada tira `ReferenceError`, lo caza el try/catch de `indicRender` y la
  sección no se pinta. Las dos formas de fallar terminan del lado que el médico pidió. Es el mismo
  fail-closed que `amiloEnInforme` aplica a `omitir`.

- **LA AMILOIDOSIS SON DOS CLAVES Y EL ETE CINCO**, así que `av` acepta una lista y **alcanza con
  UNA**. Lo fijan TC-748 (D1) y (D2): con una sola el ayudante dice sí, y **la otra sola sigue en
  NO**, que es lo que prueba que no es un alias.

- **P22-b QUEDA VACÍO, Y ES UNA MEDICIÓN**: censados los **dieciséis** sectores de `amiloSecs`,
  **los dieciséis comparten UN interruptor**, así que no hubo ninguno que parar por falta de
  criterio. **`wilk` y `teer` no tienen sección de Evidencia** y eso no es una parada: no hay nada
  que filtrar, y **TC-748 (F3)** se pone rojo el día que la ganen.

- **EL DATO SIGUE SINCRONIZADO, QUE ES LA MITAD DEL PEDIDO**, medido por el gesto real **y** por una
  siembra muda, y también **después** de armar el panel: el perfil hemodinámico sigue calculando su
  índice cardíaco y su gasto, el módulo de constricción sigue recibiendo el dato y el HFA-PEFF sigue
  puntuando, con el sector **sin integrar** en las tres.

- ⚠️ **EL PANEL NO NECESITÓ UN MECANISMO DE REPINTADO, Y SE MIDIÓ POR QUÉ.** Es un overlay
  `position:fixed` con `z-index:300` y el botón «📎 Integrar al informe» de un sector queda
  **tapado** por él —`document.elementFromPoint` devuelve `indic-overlay`—, así que para incluir o
  sacar hay que cerrar el panel, y al reabrirlo `indicRender` lo rearma. El punto 2c se cumple **por
  construcción** y **no se agregó nada**. Con el panel sin secciones se muestra el mensaje que la
  app **ya tenía**: cero frases nuevas.

- ⚠️ **Y TC-322 NO SE ROMPE, contra lo que la orden anticipa**: ese caso llama a `S.fn()` **directo**
  y el filtro no lo alcanza. **No se adaptó.**

- **VEINTINUEVE CADENAS REESCRITAS**, cada fuente por lo que **ella** dice, en su propia oración y
  con su hoja y su folio intactos: **siete** en Hemodinámica y en la prótesis mitral —la nota del
  Forrester, el ⓘ del índice cardíaco con sus folios 30, 2 y 162, el ⓘ de la resistencia vascular
  con sus dos bandas, y las cuatro del desajuste protésico— y **veintidós** en el resto de la
  Evidencia y en Referencias, más el encabezado de la tabla de `critMCH`.
  ⚠️ **NINGÚN NÚMERO, HOJA, FOLIO, TABLA NI CLASE SE PERDIÓ**, contado **valor por valor** contra
  HEAD en las diez secciones medidas y en Referencias. **El único valor que sale en toda la tanda es
  el «1,1 cm²/m²»** del ejemplo de la prótesis mitral, que era el valor que **ilustraba la
  contradicción** y no vive en ningún otro lado de la sección → **P22-a**, y lo fija **TC-751 (C3)**.

- ⚠️ **EL CENSO NO SE HACE POR GREP, Y ESTÁ MEDIDO**: los mismos patrones devuelven **469** líneas y
  casi todas son **comentarios**. El filtro que sirve cuenta comillas y se queda con lo que está
  **dentro de una cadena literal** —**89** al abrir la tanda, **46** al cerrarla— y se confirma en el
  **DOM abierto** con los globos de cada fila desplegados, de 3.906 a 18.947 caracteres por sección y
  **75.136** en Referencias. **CONTROL POSITIVO** en los dos commits: las **seis** cadenas viejas,
  inyectadas, se detectan las seis. **CONTROL NEGATIVO**: la válvula tricúspide y la reparabilidad
  mitral dan cero en los **dos** árboles.
  ⚠️ **LAS DOS FORMAS QUE QUEDAN NO CAEN BAJO LA REGLA**: son «el folio impreso coincide con la hoja
  del PDF», que es la **regla de folio** de una fuente —cómo se numera— y no una comparación con
  otra.
  ⚠️ **Y «no gradúa» TIENE USOS LEGÍTIMOS** en las secciones de válvula, donde el sujeto es un
  gradiente o una tabla: vive en `PROH_TRAMO` y no en `PROH`, o daría un falso rojo.

- ⚠️ **CUATRO DENOMINADORES VACÍOS, CORREGIDOS ANTES DE CREERLE A LA MEDICIÓN.** La sonda sembraba
  `tdf_ip_rf` y `esub_grad_medio`, que **no existen** —son `ip_grado` + `tdf_func_vd` y
  `esub_gradiente_medio`—, y abría la pestaña `'referencias'`, que es **`'refs'`**: con los tres mal,
  dos secciones y Referencias **entera** medían sobre **cero** caracteres. Y un **rojo falso** de
  TC-751 (E4): `evRefPintar` pinta las fichas **sólo al abrir su subpestaña**, así que el DOM de
  Referencias daba 88.054 caracteres con cero apariciones de lo que esa condición vigila — se mide en
  el **registro** `EV_REG`, con su propio denominador.

- **DOS COSAS PARADAS, en P22-a**: la **tabla** de siete filas de `critMCH`, comparativa **por
  diseño** —se le cambió el encabezado y las filas no se tocaron—, y la entrada de bibliografía
  **`escGuchCiv`**, cuyo aviso de que el criterio de la app diverge de su fuente no se puede
  reescribir sin declarar ese criterio como propio, que es una decisión clínica.

- **CINCO CASOS NUEVOS, TC-748 a TC-752**, con sus denominadores y sus controles negativos, y los
  cinco **caen contra `e727fe2` por condiciones y NINGUNO por excepción**.
  ⚠️ **EL HELPER `__t.avInc` ES IDEMPOTENTE PORQUE `amiloIntegrar` ES UN TOGGLE**: llamarlo sobre un
  sector ya integrado lo **RETIRA**. Lo pagó TC-752, cuya escena dejaba hemodinámica **afuera**
  —`integrar=1 · integrado=false`— porque el bloque (D6b) de **TC-537**, del mismo lote, ya la había
  integrado; y retirar **no borra el textarea**, así que su texto seguía ahí en 736 caracteres y el
  síntoma no se parecía a la causa. Las **cinco** llamadas pasan por el helper, y **(D6b) recibió la
  misma guarda**: hoy es más fuerte, porque ya no depende del estado que le deje el caso anterior.
  ⚠️ **NI UNA EXPRESIÓN REGULAR EN LOS CASOS NUEVOS, y se midió por qué**: el cuerpo de un caso es un
  template literal, así que `/\s+/g` llega como `/s+/g` y **reemplaza las «s» por espacios** —
  «Estenosis aortica» pasaba a «E teno i aortica» y **ningún título emparejaba**. Los dos
  normalizadores recorren `charCodeAt`.
  ⚠️ **Y EL ACENTO GRAVE DENTRO DE MI PROPIO COMENTARIO**, por decimosexta tanda seguida, en el
  cuerpo de un caso. Lo cazó `node --check`.

- **DIECISIETE BLOQUES DE CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-533**
  (los conteos de `IND_SECS`, con **(D3) INVERTIDA**, que es el día que esa condición anunciaba),
  **TC-534**, **TC-535**, **TC-537**, **TC-544**, **TC-510**, **TC-349** y **TC-610** (**(D2)
  INVERTIDA**), y **TC-669 a TC-673** (el filtro en (D0) y **(D2) INVERTIDA** en los cinco).
  ⚠️ **Y CINCO MÁS QUE LA CORRIDA COMPLETA DESTAPÓ, NO EL CENSO**, y es el modo de falla que este
  archivo ya documenta diez veces: **TC-520**, **TC-553** y **TC-554** medían una sección de
  Evidencia de un sector avanzado **sin integrar el sector**, así que ganan su `avInc` y una
  condición de denominador —(F0b), (A9b) y (D0b)— que declara que el sector quedó incluido; y
  **TC-532 (C8)(D8)** y **TC-545 (C6)** quedan **INVERTIDAS**, porque exigían la frase «no tienen
  fuente» y «Ninguna guía de la biblioteca publica un recuento así» que el commit 5 reescribió:
  hoy exigen la frase NUEVA **y** que la vieja ya no esté. **Los cinco pasan 5/5 contra `e727fe2`**
  con el mismo archivo de casos, así que eran consecuencia autorizada y no una regresión; y
  **TC-532 y TC-545 caen ahí por sus tres condiciones invertidas**, o sea que siguen
  discriminando.

- **35/35 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y **nunca** sobre el vivo, con el md5 del árbol
  vivo **idéntico** antes y después. La **36 se retiró declarada** (P22-a).
  ⚠️ **EL PRIMER BARRIDO DEJÓ TRECE SOBREVIVIENTES Y SE REPARTIERON EN TRES CLASES**: **siete huecos
  reales**, con siete condiciones nuevas; **dos equivalentes a nivel de sección** —la condición
  miraba la sección entera y la mutación movía una oración, así que hoy miden **dentro** de la
  oración—; y **cuatro mal escritas o mal dirigidas**.
  ⚠️ **Y LAS ANCLAS SE VERIFICAN ANTES DE CORRER EL BARRIDO** (`--anclas`): el worktree había quedado
  en HEAD y las treinta y cinco daban **x0**, que se lee igual que «no hay cobertura». Se rehizo con
  `git worktree add --detach` sobre el commit exacto.

- **A/B contra `e727fe2`, con el PDF y el PPT generados de verdad: 114 escenas, 23.256 claves,
  52.098 celdas de Excel y CERO diferencias de superficie firmada** —informe en los tres estilos, EN
  SUMA, las **457** columnas clave por clave, los **1.010** campos, el Laboratorio, el PDF en sus
  seis plantillas y el PPT con sus 25 textos—. **Las 61 diferencias de pantalla son el control
  positivo**, y las 61 caen en claves del panel de Evidencia.

- **Línea base al cierre: suite 761/767**, en **catorce** lotes cubriendo los **767 casos
  distintos** —contados nombre por nombre, cero duplicados—, en UNA sola pasada sobre el árbol
  sellado, con el pendrive `DISK_IMG` **verificado al abrir, en los CATORCE lotes y al cerrar**
  (dieciséis verificaciones) y el md5 de `index.html` **idéntico** antes y después
  (`52f7573b`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más
  **TC-551 y TC-557**, los dos intermitentes declarados. **Ningún rojo nuevo.**
  ⚠️ **LOS DOS SE CARACTERIZARON COMO MANDA ESTA CASA**: TC-551 pasa **2 de 2** corrido aislado
  —el chorro de la orejuela sin pausar la animación, que `COR-f` declara— y **TC-557 da 2 rojos
  de 4 en el árbol nuevo y 1 de 4 contra `e727fe2`**, con cuatro corridas de cada lado y la misma
  firma `00000 44x44` de `elementFromPoint` fuera del viewport que `TGA-h` documenta: es
  preexistente, y esta tanda **no toca el mecanismo de los ⓘ**.
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 756/767 CON CINCO ROJOS MÁS, LOS CINCO MÍOS**, y por eso
  esa cifra no es la línea base: los cinco de arriba. Están adaptados y la cifra sale de la
  corrida **limpia**, de una sola pasada sobre el mismo árbol sellado y con el archivo de casos
  final.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px
  × dos temas), con **UNA sola combinación de valores en los dieciséis**: **cero** secciones de
  sector avanzado sin incluir ninguno, el mensaje que la app ya tenía, **una** con la constricción
  incluida, **cero** formas prohibidas en Hemodinámica, en la prótesis mitral y en la
  constricción, **cero** desplazamiento horizontal, **cero** textos recortados y **CERO errores
  de consola y de página en los dos motores**. El panel mide 820 / 820 / 744 / 366 px.
  ⚠️ **El único hallazgo de Referencias es la cadena declarada** —«Lo que la tabla dice de sí
  misma: … no publica una tercera de obstrucción severa»—, que no cae bajo la regla.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Sin huérfanos nuevos.**
  **Cero campos guardados nuevos**, **Excel 457** con las mismas claves y **ningún id cambió**.
  **CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta.

- **Dónde está todo:** `docs/mapa/pant22-evidencia-sectores.md` (**mapa NUEVO**, 9,0 KB),
  `docs/INVENTARIO_EVIDENCIA_P22.md` (el inventario de solo lectura del commit 1), las fichas de los
  cinco casos en `docs/mapa/tests-fichas-748.md` (**archivo propio**, porque `tests-fichas.md` está
  en 34,2 KB), **cuatro mapas con un puntero cada uno** —medidos ANTES de escribir:
  `a-evidencia-textos.md` 10,1 KB, `c1-hemodinamica.md` 15,2, `panel-evidencia.md` 22,7 y
  `tests-punteros-tandas.md` 29,7—, `docs/fuentes/FUENTES.md` → «La tanda PANT-22» con las
  veintinueve cadenas y su tabla «Cambios de evidencia», `docs/REGISTRO_TANDAS.md` → el bloque de la
  tanda, `docs/GUIA_PRUEBA_PANT22.md` → la guía manual en **18** pasos, y `docs/PENDIENTES.md` →
  **P22-a** (tres textos y la mutación retirada) y **P22-b** (**vacío a propósito**), con las tres
  premisas que no se reprodujeron y el intermitente preexistente de TC-533 (E0).

### La Evidencia de prótesis, una sección por válvula — «PANT-21» (2026-11-07)

- **DIEZ commits —contados con `git log e716871..HEAD` AL CERRAR, y el commit que escribe este
  número entra en la cuenta— y los SIETE puntos de la orden se tocaron, con el 4a PARADO por
  medición.** `3ed6627` (1) · `2a64425` (2) · `e36de3f` (3) · `4b38f74` (4) · `69a5868` (5) ·
  `b231bd0` (6) · `438828b` (7a, los casos y el sello) · `6838911` (7b, lo que el barrido
  destapó) · el 7c (la condición del último superviviente) · **éste** (7d, la documentación).
  Sello **`v20261107-0025`**, md5 **`439f6bb0`**. Al empezar, `origin/main` = `HEAD` =
  **`e716871`**, el cierre de PANT-20, ya publicado, con md5 `a99b0db9` y el pendrive `DISK_IMG`
  montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  ⚠️ **EL COMMIT 7a SELLA ANTES DE LA VERIFICACIÓN Y LOS TRES ÚLTIMOS NO VUELVEN A SELLAR**,
  porque no tocan `index.html`: así el árbol que la suite, el barrido, el A/B, los dos motores y
  el celular midieron es exactamente el que queda commiteado.

- **LAS CINCO GUÍAS, EN IMAGEN, Y LAS CINCO REGLAS DE FOLIO COMPROBADAS EN EL PIE O LA CABECERA
  IMPRESOS.** ESC/EACTS 2025 **final** (102 hojas, folio = hoja + 4634): la **Recommendation
  Table 17 entera** a 300 ppp en dos tramos —hoja 66, **folio 4700** impreso en el encabezado— y
  su **Figura 20** (hoja 65, **folio 4699**). ACC/AHA 2020 (folio = hoja + 71): hojas 79, 81 y 83,
  folios **e150**, **e152** y **e154**. ASE 2024 (folio = hoja + 1): **Figura 13 y Tabla 5** en la
  hoja 18, **folio 19**; la obstrucción por trombo, calcificaciones o pannus en la hoja 9, folio
  10; las causas de estenosis mitral en la hoja 24, folio 25. ACC/AHA 2025 de congénitas (folio =
  hoja + 114): hoja 75, **folio e189**. ESC 2020 de congénitas **inglesa** (folio = hoja + 562):
  hoja 60, **folio 622**.

- **LA TABLA 17 NO ESTÁ DIVIDIDA POR VÁLVULA, Y ESO ES LO QUE ORGANIZA LA TANDA.** Trece filas en
  seis grupos. **Ninguna de clase III.** ⚠️ **Y NINGUNA FILA DE PRÓTESIS PULMONAR**, verificado
  fila por fila: sus únicas posiciones nombradas son la **aórtica** (fila 6, **transfemoral**) y la
  **mitral o tricuspídea** (fila 7, **transvenoso**). Por eso la pulmonar se arma con las guías de
  congénitas, que es lo que la decisión del médico manda.

- ⚠️ **EL COMMIT 4a SE PARÓ, Y ES UNA MEDICIÓN: a la sección mitral NO LE FALTABA NINGUNA FILA.**
  Censado sobre el árbol anterior, `PROTM_REC_2025` ya traía **doce** claves —las doce filas de la
  Tabla 17 que alcanzan a esa posición— con su clase y su nivel, coincidiendo fila por fila con lo
  leído en imagen, y `PROTM_REC_AHA_2020` las **cinco** de la guía americana. No se agregó una sola
  pregunta. **Lo fija TC-744 (C0)**, que se pone rojo tanto si una desaparece como si alguien
  agrega una decimotercera creyendo que falta.

- **TRES SECCIONES NUEVAS Y UNA AMPLIADA.** `IND_SECS` pasa de **42 a 45**: `Prótesis aórtica`
  (12 preguntas), `Prótesis tricúspide` (12) y `Prótesis pulmonar` (11), más la mitral, que ya
  existía. Cada una va **pegada a la de su válvula nativa** porque es la que **ocupa su lugar**.
  ⚠️ **Ningún título es prefijo de otro ni tiene otro por prefijo**: `IND_SECS` se recorre por el
  prefijo del título, y los cuatro divergen en su **segunda palabra**.

- **LA AÓRTICA DEJA DE DECIR «esta sección no aplica».** `_indEA` devolvía una tarjeta cuyo texto
  decía «esa es otra tabla, la de reintervención, **que esta aplicación todavía no implementa**».
  Hoy devuelve `null` —igual que las tres mitrales nativas con una prótesis mitral— y la que ocupa
  su lugar es `_indProtA`. ⚠️ **El predicado es el MISMO en las dos**: con dos distintos existiría
  un estado en que se ven las dos, o ninguna.

- **EL ORDEN ES UNA OPCIÓN POR SECCIÓN, `ordenProt`, Y SÓLO LAS CUATRO DE PRÓTESIS LA TRAEN.**
  Pone el orden que el médico fijó —preguntas, «Con lo contestado», causas, «Ver detalle» plegado,
  bibliografía— e **implica el molde de preguntas**, porque ese molde ES el orden que la decisión
  pide. Medido: **cero diferencias de DOM en TODAS las demás secciones**, en los cuatro anchos.
  ⚠️ **LAS CAUSAS VAN DESPUÉS DE LO QUE LA SECCIÓN CONCLUYE, Y ESO SON DOS LUGARES DISTINTOS**:
  «Con lo contestado» es `adapt` en tres de ellas y es **`recom`** en la **mitral**, que concluye
  con `_protmRecom` desde antes. Con `adapt` van antes del «Ver detalle»; sin `adapt`, después de
  la conclusión visible.

- **UN SOLO AYUDANTE DE CAUSAS, PARAMETRIZADO POR VÁLVULA.** `_indCausas(lista, decide)` y
  `_indCausasHTML(cs, nota)`. `decide(clave)` devuelve **tres** estados y los tres usan los iconos
  de la leyenda que el panel ya imprime: `true` → ✅ «la rama que el algoritmo señala», `false` →
  — «la hermana, medida y descartada», `null` → ❓ «no decidible». ⚠️ **Sin esa distinción, una
  causa no decidible saldría con la marca de «medido y no alcanza el criterio»**, que es una
  afirmación que esta aplicación no puede sostener.

- **QUÉ SE MARCA SOLO, Y DÓNDE NO HAY BLOQUE.** En la **aórtica**, sólo el **hiperflujo** y el
  **desajuste**, que son las que la **Figura 13** decide con el **cociente de VTI** y la **EOA
  indexada** que la app ya calcula. Medido con su control positivo y su negativo: con el cociente
  en 0,33 y el área en 0,92 sale «hiperflujo ✅ · desajuste —», y con el **mismo** cociente y el
  área en 0,39 se da vuelta; con el cociente en 0,21 las cinco salen ❓.
  En la **mitral**, **ninguna**: la guía da una **lista** (hoja 24, folio 25) y **no un
  algoritmo**. Y la **tricúspide** y la **pulmonar** **no llevan bloque**, porque la ASE 2024 trae
  **una sola** enumeración de causas —la mitral— y su Tabla 19 y su Tabla 15 publican **cortes y
  no causas**. Las dos secciones lo **DICEN** en una de sus notas. → **P21-a**.

- ⚠️ **UNA PREMISA DE ARCHIVO NO SE REPRODUJO.** La orden nombra la ESC 2020 de congénitas «en
  inglés»; el archivo `Baumgartner_2020_Cardiopatias_Congenitas.pdf` está en **español** y tiene
  **79 hojas**, así que no cumple `folio = hoja + 562` y sus hojas 52, 60 y 61 no son las que el
  índice describe. La inglesa es **`ESC congenitos en ingles 2020.pdf`**, 84 hojas, y su **hoja 60
  imprime 622**. Se usó la inglesa. → **P21-a**.

- ⚠️ **Y LAS DOS PARTES DEL MISMO DOCUMENTO NO USAN EL MISMO OPERADOR EN EL TROMBO GRANDE**: la
  Tabla 17 imprime «**>10 mm**» y su Figura 20 «**≥10 mm**». Las dos leídas en imagen. La app no
  aplica ese corte a ningún número suyo: lo publica como texto, con la forma de la tabla, que es
  la que rige. → **P21-a**.

- **UNA SOLA PREGUNTA SE PRE-RESPONDE DESDE UN CAMPO, y sólo porque significa EXACTAMENTE lo
  mismo**: `ea_pvl_origen` en «paravalvular» o «mixta» es Sí, en «central» es No y vacío es sin
  dato. Medido: con «central» su control **ni siquiera se dibuja** y las preguntas bajan de siete a
  seis, que es el contrato de `_indFilaOrigen`. ⚠️ **Censado: la app NO tiene campo de síntomas, de
  riesgo quirúrgico ni de trombosis protésica**, así que las demás se contestan a mano.

- **38/38 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y **nunca** sobre el vivo, con el md5 del
  árbol vivo **idéntico** antes y después (`439f6bb0`), en 1,0 min.
  ⚠️ **EL PRIMER BARRIDO DEJÓ DOCE SOBREVIVIENTES Y SE REPARTIERON EN CUATRO CLASES.** **Seis
  huecos reales**, con nueve condiciones nuevas: nada miraba que la sección estuviera **registrada
  en `IND_SECS`** —sacarla la dejaba fuera del panel con todo en verde—; faltaban las **escenas de
  borde de la Figura 13**, así que mover el corte del cociente de 0,30 a 0,25, el del área de 0,85
  a 0,75 y dejar de mirar el área pasaban los tres en verde; y **la cita se contaba sobre el JOIN**
  de las cinco causas y de las once preguntas, así que quitarle la hoja y el folio a UNA seguía
  encontrándolos en las otras. **Dos miraban el OBJETO y no el HTML**: romper lo que `ordenProt`
  HACE pasaba en verde porque el objeto seguía igual. **Y dos estaban mal declaradas**: la del
  orden de la mitral apuntaba al caso del emisor, y la de la sección ajena a un caso que no
  siembra ninguna congénita. Un decimotercero sobrevivió al **segundo** barrido, y era otro hueco:
  el control negativo **busca** la primera sección sin `ordenProt`, así que si una se lo gana la
  búsqueda elige otra — hoy esa sección se siembra y se exige **por nombre**.

- **SEIS CASOS NUEVOS, TC-742 a TC-747**, con sus denominadores y sus controles negativos, y los
  seis **caen contra `e716871` por 35 condiciones y NINGUNA por excepción**, verificado alternando
  sólo `index.html` con el mismo archivo de casos. Los accesores llevan guarda a propósito: contra
  el árbol anterior tres de las cuatro funciones de sección **no existen**.

- **TRES CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito**: **TC-322** (tres escenarios
  nuevos; ese caso se pone rojo tanto al borrar una sección como al agregarla), **TC-533** (el
  conteo de `IND_SECS`, 42 → **45**) y **TC-291**, **INVERTIDO**, y es el día que ese caso
  anunciaba: afirmaba que con una prótesis `_indEA` publica la tarjeta «no aplica». Hoy exige que
  la nativa se calle **y** que la de prótesis exista con sus preguntas, así que puede fallar por
  los dos lados.

- ⚠️ **TRES TRAMPAS QUE ESTA TANDA PAGÓ, Y LAS TRES SON DE ESCRITURA.** (1) **El acento grave
  dentro de MI PROPIO comentario**, en el cuerpo de un caso — **tres veces**, y es la decimoquinta
  tanda seguida que lo paga; lo caza `node --check` y lo previene **contar** los acentos graves del
  cuerpo de cada caso y exigir el número exacto. (2) **La barra invertida de un literal de
  expresión regular** no sobrevive al template literal: `/ESC\/EACTS 2025/` llegó como
  `/ESC/EACTS 2025/` y dio «Invalid regular expression flags»; se cerró **no usando ninguna
  expresión regular**. (3) **Los títulos de los recuadros del panel NO van en mayúsculas en el
  HTML** —la mayúscula la pone el CSS con `text-transform`—, así que buscarlos con la forma que el
  DOM muestra devuelve −1 sobre un recuadro que **sí** está.

- **A/B contra `e716871`, con el PDF y el PPT generados de verdad: 108 escenas comparables, 22.032
  claves y CERO diferencias de superficie firmada**, informe en los tres estilos, EN SUMA, las **457** columnas de Excel
  clave por clave, los campos, el Laboratorio, el PDF en sus seis plantillas y el PPT. Las **96**
  diferencias de pantalla son el control positivo, y las 96 caen en tres claves del panel de
  Evidencia: `_evTexto`, `_evN` y `_evSecs`.
  ⚠️ **El arnés gana CUATRO escenas propias** —una por válvula en el estado alterado que abre el
  bloque de causas—: sin ellas el cero sería un control negativo sobre escenas que no alcanzan la
  zona que la tanda toca.

- **Línea base al cierre: suite 756/762**, en **catorce** lotes cubriendo los **762 casos
  distintos** —contados nombre por nombre, en el orden DEL ARCHIVO y con una guarda que compara lo
  listado con lo ejecutado—, en UNA sola pasada sobre el árbol sellado, con el pendrive `DISK_IMG`
  **verificado al abrir, en cada uno de los catorce lotes y al cerrar** (dieciséis verificaciones)
  y el md5 de `index.html` **idéntico** antes y después (`439f6bb0`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-551 y TC-557**, los dos intermitentes declarados.
  ⚠️ **LOS DOS SE CARACTERIZARON COMO MANDA ESTA CASA, y los dos pasan 3 DE 3 CORRIDOS AISLADOS**:
  TC-551 es el que `COR-f` declara —mide el chorro de la orejuela sin pausar la animación— y
  TC-557 el que `TGA-h` declara, con la firma de `elementFromPoint` fuera del viewport.
  **Ningún rojo nuevo**, y los **seis casos nuevos y los tres adaptados en verde**.
  ⚠️ **Y 762 LISTADOS CONTRA 762 DISTINTOS**: cero duplicados, contado nombre por nombre antes de
  repartir los lotes.

- **38/38 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y **nunca** sobre el vivo, en 1,0 min, con el
  md5 del árbol vivo **idéntico** antes y después (`439f6bb0`). Cada mutación declara **su** caso.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), y la única diferencia entre motores es de **métrica de fuente**: de 2 a 5 px en el
  alto de una sección. En los dieciséis: las **cuatro** secciones abriendo, el panel con sus
  **cinco** secciones despiertas, el orden `encabezado · grid · contestado · causas · Ver detalle ·
  bibliografía` en la aórtica y `encabezado · grid · conclusión · causas · Ver detalle ·
  bibliografía` en la mitral, **7 / 4 / 7 / 11** preguntas contestables, **CERO** botones de
  respuesta por debajo de 30 px de alto (21 / 8 / 21 / 33), los folios de cada sección presentes,
  **cero** desplazamiento horizontal del cuerpo y **CERO errores de consola y de página en los dos
  motores**.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
  **El mismo cruce contra `e716871` es el control, y reproduce la premisa**: el panel abre con
  **DOS** secciones y la **única** de prótesis que existe es la **mitral**; las otras tres no están.
  ⚠️ **Y LOS CINCO TEXTOS RECORTADOS DEL PANEL SON PREEXISTENTES**: el control da **5** en los
  dieciséis cruces de los **dos** árboles y en los dos motores, con `scrollH` en cero en los
  treinta y dos.
  **Alto del contenido visible por sección, en Chrome** (la sección abierta con sus plegables
  cerrados): aórtica **1257 / 1257 / 1300 / 2211** px a 1440, 1000, 768 y 390; mitral **1160 /
  1160 / 1196 / 1818**; tricúspide **778 / 778 / 794 / 1328**; pulmonar **1233 / 1233 / 1472 /
  2052**.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Sin huérfanos nuevos.**
  **CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta.
  **No empeoró.**

- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Sin huérfanos nuevos.**
  **Cero campos guardados nuevos**, **Excel 457** con las mismas claves y **ningún id cambió**.
  17 de 19 bloques de JS inline parsean, idéntico a HEAD.

### El catálogo en la mitral, la tricúspide y la pulmonar — «PANT-20» (2026-11-06 y 07)

- **DOCE commits —contados con `git log 694e9e3..HEAD` AL CERRAR, y el commit que escribe este
  número entra en la cuenta— y los SIETE de código se hicieron enteros.** `e189031` (1) ·
  `2ab58d5` (2) · `45a0b04` (3) · `f1663a5` (4) · `4ca40fc` (5) · `05032c5` (6) · `97f249c` (7)
  · `3a93fd7` (8a, los casos apenas parsean) · `72ad932` (8b, la cobertura de las dos fichas) ·
  `411e0d7` (8c, el sello) · `1dc29f0` (8d, lo que el barrido destapó) · **éste** (8e, cobertura
  y documentación). Sello **`v20261106-2156`**, md5 **`a99b0db9`**. Al empezar, `origin/main` =
  `HEAD` = **`694e9e3`**, el cierre de PANT-19, ya publicado, con md5 `298cc61d` y el pendrive
  `DISK_IMG` montado.
  **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**
  ⚠️ **EL COMMIT 8c SELLA ANTES DE LA VERIFICACIÓN Y LOS DOS ÚLTIMOS NO VUELVEN A SELLAR**,
  porque no tocan `index.html`: así el árbol que la suite, el barrido, el A/B, los dos motores y
  el celular midieron es exactamente el que queda commiteado, y no hay tres líneas de diferencia
  que declarar al cerrar. Es la forma que POP-B y PANT-17 dejaron escrita.
  ⚠️ **POR DECIMOSÉPTIMA VEZ SEGUIDA EL RENGLÓN DE TAMAÑO QUE SE ENCONTRÓ ESTABA BIEN**, y se
  verificó de las dos formas que esta casa manda: `git show 694e9e3:index.html` da **167.525**
  líneas, **12.160.653** bytes y el md5 **`298cc61d`**, los tres idénticos a lo que decía.

- **LAS CINCO TABLAS, EN IMAGEN A 300 ppp, Y LA REGLA DE FOLIO COMPROBADA EN CADA HOJA.**
  ASE 2024 (Zoghbi, *JASE* 2024;37:2-63), **folio = hoja + 1**, comprobado en el **pie** impreso
  de las hojas pares y en el **encabezado** de las impares, hoja por hoja y no deducido de dos.
  **A7** (hoja 61, folio 62): 12 modelos, 26 filas de tamaño, **82** celdas con dato. **A9**
  (hoja 62, folio 63): 8 modelos, 28 tamaños, **190** celdas más **6** «NA» impresos. **A8**
  (hoja 61, folio 62). **Tabla 15** (hoja 32, folio 33) y **Tabla 19** (hoja 35, folio 36), las
  dos de obstrucción protésica.

- ⚠️ **EL ± SE LEE POR SU FUENTE, Y ES MÁS BARATO QUE LA GEOMETRÍA DE PANT-19.** El PDF lo
  codifica como el carácter **«6»**, que es por lo que la capa de texto devuelve «11 6 6» por
  «11 ± 6». PANT-19 lo resolvió midiendo el **exceso de ancho** del glifo, con umbral; esta tanda
  encontró la razón: el ± es un **token aparte con fuente `AdvPS586B`**, distinta de la de los
  dígitos (`AdvPSA183`), así que se separa **por el nombre de la fuente** y sin umbral.

- ⚠️ **CUATRO PREMISAS NO SE REPRODUJERON, Y LAS CUATRO SON DE ESTRUCTURA.**
  1. **La A7 tiene CUATRO formas de celda y la orden supone una** —y su propia nota al pie
     declara dos—: media con desvío, **mediana con rango intercuartílico**, valor único y
     **límite superior**. La celda del catálogo era `[media, desvío]`; ganó un **tercer elemento
     opcional** con el texto impreso, que la pantalla publica **tal cual**. Medido: **9** celdas
     de límite y **56** con texto impreso sobre 82. Un **límite no tiene valor central**, así que
     no da diferencia en desviaciones ni EOA indexada predicha → **P20-a**.
  2. **La A8 no es modelo × tamaño: es referencia × situación**, dos de sus tres columnas
     numéricas dicen «NR» y `vt_morf` **no tiene opción de implante transcatéter**. Se cargó con
     **su propia forma** y **sin un solo consumidor** → **P20-b**.
  3. **La A9 está TRANSPUESTA**, y asignar columna a modelo por la cercanía del encabezado falla
     en **2 de 4** bloques: hubo que leerla en la imagen.
  4. **La pulmonar tiene sólo TRES campos medidos**: no existe en la app un campo de tiempo de
     aceleración ni de área para una prótesis pulmonar → **P20-c**.

- **EL BOTÓN DE LA MITRAL VA EN SU PROPIA FILA, Y ESO DEJA A TC-522 EN VERDE POR CONSTRUCCIÓN.**
  Su fila de morfología es un `grid` de **tres** con el ancho acotado al botón «Insuficiencia»
  que ese caso vigila, y un cuarto hijo apretaría las tres celdas por debajo de su piso —que es
  justo lo que PANT-19 midió para pararlo (**P19-e**)—. La fila nueva es **hermana** de la de
  tres, con `margin-top:-6px`, y los anchos de la grilla salen **idénticos** a los cuatro anchos
  (483 / 275 / 706 / 328 px), medido antes y después.

- **UN SOLO COMPONENTE PARA LAS CUATRO POSICIONES, Y LO QUE SE AGREGA ES UNA ENTRADA POR
  VÁLVULA.** `VMOD_POS` pasa de una a cuatro entradas y el catálogo se elige por **`VMOD_TABLA`**,
  un dueño único nuevo: el día que entre otra posición se agrega una fila. **El repintado no hubo
  que tocarlo en ninguna de las tres columnas** —`ESPEJOS_VIVOS`, `RECALC_MODULOS` y el final de
  `limpiarCampos`—, porque `vModSyncTodos` recorre `Object.keys(VMOD_POS)`.

- **EL PPM MITRAL SALIÓ A SU DUEÑO ÚNICO, `_vmPpmClasificar`.** Estaba dentro de `vmProtEOA`, y
  la entrada de la mitral lo necesita desde el componente: con la regla copiada, los dos lados
  podrían graduar distinto el mismo desajuste el día que un corte se mueva.
  **La tricúspide y la pulmonar NO publican PPM** —ninguna de sus tablas da el área indexada
  esperada—, así que su entrada lo declara en `null` y el pintor publica en su lugar la **EOA
  indexada predicha** a secas, **sin veredicto**.

- **LA CONVERSIÓN DE UNIDAD ES DEL CAMPO Y NO DE LA TABLA.** La A9 publica la velocidad pico de
  la onda E en **m/s** y el campo de la app está en **cm/s**: la entrada declara `fac:100` y el
  pintor convierte la media **y el desvío** antes de restar. Medido con la Carbomedics Standard
  31, que espera 1,4 ± 0,19 m/s: **140 da +0.0 DE, 178 da +2.0, 121 da −1.0 y 102 da −2.0**.
  ⚠️ **Sin convertir el desvío, 178 habría dado «+20 DE»**, que es un número que ningún eco
  produce y que el médico habría leído como un error de la aplicación.

- **DOCE CAMPOS GUARDADOS NUEVOS Y DOCE COLUMNAS DE EXCEL** (445 → **457**), cuatro por válvula,
  todos con guión **BAJO** y **ocultos con `display:none`** y no con `type="hidden"`: en un
  hidden el `value` y el `defaultValue` son el mismo atributo y «Nuevo estudio» no los limpiaría
  (**P14c-g**). Recorren las **siete** listas y sólo dos necesitaron tocarse —la salida del Excel
  y el mapa del importador—; las otras cinco los toman por su prefijo.
  ⚠️ **NINGÚN ENCABEZADO DEL EXCEL CONTIENE «EOA» NI «AEO»**, que es la condición que un caso
  existente exige desde PANT-19: las columnas de área se llaman «AVm de referencia mitral»,
  «AVT de referencia tricúspide» y «Área de referencia pulmonar».

- ⚠️ **LA PREMISA DEL COMMIT 7 SE DESMINTIÓ A FAVOR DE LA APP, Y ESO CAMBIÓ LO QUE HABÍA QUE
  HACER.** La orden supone que la tricúspide y la pulmonar se graduaban con cortes de válvula
  **nativa**; medido, la app ya aplica `VT_PROT_T19` y `VP_PROT_T15`, que son las dos tablas de
  **prótesis** y coinciden **fila por fila** con las imágenes. Lo que faltaba eran las **fichas
  de Referencias**: la subpestaña de protésicas pasa de **cinco a siete**, las dos nuevas nacen
  cerradas, con su hoja, su folio y el folio de su tabla de valores esperados, y **sin un globo
  nuevo**.

- ⚠️ **EL DEFECTO QUE ME HICE EN EL COMMIT 7 Y QUE CAZÓ LA SONDA: las dos fichas quedaron FUERA
  del contenedor.** Mi ancla cerraba a la vez la tarjeta de endocarditis **y** el contenedor
  `ref-protesicas`, así que las fichas existían, el buscador las indexaba y el médico que
  navegara por las solapas **no las encontraba nunca**. Se revirtió con
  `git show HEAD:index.html > index.html` y se rehízo con un ancla de seis líneas. **Lo fija
  (G2) de TC-741**, que pregunta por `contains` y no por existencia.
  ⚠️ **Y UN SEGUNDO, DE PLANTILLA: `TFILA1` CONTIENE `FILA1`.** `replace('FILA1', …)` corrompió
  la tabla de la tricúspide —publicaba las filas de la pulmonar con «T» sueltas—. Se cerró con
  marcadores únicos y un aserto de que cada uno aparece exactamente una vez y ninguno queda.

- ⚠️ **EL DEFECTO MÁS CARO DE LA TANDA FUE MÍO Y SE LLEVÓ UN CASO ENTERO: UN MARCADOR DE
  PROTECCIÓN NO PUEDE CONTENER LO QUE SE VA A REEMPLAZAR.** Al pasar los conteos del Excel de
  445 a 457 protegí el nombre `TC-445` con el marcador `@@TC445@@` —que **contiene** «445»—, así
  que la expresión regular lo reescribió a `@@TC457@@` y la restitución dejó
  `caso('@@TC457@@', …)`: **el caso desapareció de la suite**. Lo encontró **contar los casos
  distintos** —755 contra 756— y no la lectura. La lección quedó escrita en
  `docs/mapa/tests-punteros-tandas.md`.

- **40/40 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y **nunca** sobre el vivo, en 2,2 min, con
  el md5 del árbol vivo **idéntico** antes y después (`a99b0db9`). Cada mutación declara **su**
  caso y el reparto es limpio: TC-736 **8** · TC-737 **6** · TC-738 **8** · TC-739 **5** ·
  TC-740 **4** · TC-741 **8** · TC-731 **1**. Las 40 anclas aparecen **exactamente una vez** en
  `index.html`, verificado **antes** de correr el barrido —que es lo que PANT-19 pagó con siete
  anclas que no aplicaron por escribirlas con secuencias `\uXXXX` en vez del carácter real—.
  ⚠️ **EL PRIMER BARRIDO DEJÓ TRES SOBREVIVIENTES Y LAS TRES DIJERON COSAS DISTINTAS.** **Un
  hueco real**: la 18 le pone a la entrada de la mitral el clasificador de PPM **aórtico** —que
  existe, está expuesto y también devuelve una categoría—, y las condiciones (D0) a (D3) llaman
  al clasificador mitral **directo**, así que ninguna ataba la **publicación** a su dueño; nació
  **(D4)**, que **busca su escena en vez de adivinarla**: los cortes mitrales (0,90 y 1,20) y los
  aórticos (0,65 y 0,85) coinciden en casi todo el rango, así que recorre tres modelos por cinco
  pares de peso y talla hasta dar con uno donde los dos veredictos difieran, y **si ninguno los
  separa el denominador lo DICE**. **Una mal dirigida**: la 21 rompe la búsqueda por palabra del
  componente **único**, y la mata **(B3b) de TC-731**, de PANT-19 —«ifecta» cae en MEDIO de
  «Trifecta»—, así que declarada al caso de esta tanda sobrevivía **sobre cobertura que ya
  existía**. **Y una mal escrita**: la 40 cambiaba el **rótulo** de una fila de la ficha pulmonar
  y la fila seguía ahí, así que la condición que cuenta filas con celda de dato no podía fallar.
  ⚠️ **Y arreglar el arnés costó una corrida por un resbalón propio:** los dos comentarios nuevos
  se escribieron con `/* */`, que en un archivo de Python **no es un comentario**.

- **SEIS CASOS NUEVOS, TC-736 a TC-741**, con sus denominadores y sus controles negativos, y los
  seis **caen contra `694e9e3` por 52 condiciones y NINGUNA por excepción**, verificado en un
  worktree alternando sólo `index.html` con el mismo archivo de casos. **Los cinco adaptados
  también caen ahí**, que es lo que confirma que discriminan.

- **CINCO CASOS VIEJOS ADAPTADOS, los cinco conteos de inventario y los cinco míos**: **TC-135**
  y **TC-479** (las columnas del Excel), **TC-502** y **TC-509** (las fichas de Referencias,
  38 → **40**, y el reparto de la solapa Válvulas, 12 → **14**) y **TC-632**.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo. **Sin huérfanos nuevos.**
  El diff de la tanda son **426 líneas agregadas y 33 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `694e9e3`, de las que **400** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas.

- **Línea base al cierre: suite 750/756**, en **catorce** lotes cubriendo los **756 casos
  distintos** —contados nombre por nombre, con una guarda que compara lo listado con lo
  ejecutado: **756 de 756**—, en UNA sola pasada sobre el árbol sellado, con el pendrive
  `DISK_IMG` **verificado al abrir, en cada uno de los catorce lotes y al cerrar** (dieciséis
  verificaciones) y el md5 de `index.html` **idéntico** antes y después (`a99b0db9`). Los rojos
  son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-551 y TC-557**, los
  dos intermitentes declarados: **TC-551 pasa 2 de 2 corrido aislado** —el chorro de la orejuela
  sin pausar la animación, que `COR-f` documenta— y **TC-557 cae IDÉNTICO contra `694e9e3`**, con
  la firma `00000 44x44` de `elementFromPoint` fuera del viewport que `TGA-h` declara, así que no
  es de esta tanda. **Ningún rojo nuevo, y los seis casos nuevos en verde.**
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 745/756 CON CINCO ROJOS MÁS, LOS CINCO MÍOS**, y por eso
  esa cifra no es la línea base: **TC-135**, **TC-479**, **TC-502**, **TC-509** y **TC-632**, los
  cinco conteos de inventario. Están adaptados y la cifra de arriba sale de la corrida **limpia**,
  de una sola pasada sobre el mismo árbol sellado y con el archivo de casos final.

- **A/B contra `694e9e3`, con el PDF y el PPT generados de verdad: 104 escenas, 127.696 claves y
  47.528 celdas de Excel. Las 2.808 diferencias de superficie firmada son el INVENTARIO DEL
  FORMULARIO y nada más**, y las tres clases son el mismo hecho: **1.248** son los doce campos
  nuevos (104 × 12), **1.248** las doce columnas nuevas y **312** los tres conteos (`_camposN`,
  `_camposClaves`, `_excelN`). **Ninguna clave de informe, EN SUMA, PDF, PPT ni Laboratorio
  difiere**, verificado clave por clave con un barrido que las clasifica una por una: **CERO
  «otras»**. Los doce traen valor en **6** escenas —las que cargan un modelo— y están **vacíos en
  98**; `p20sinMod` es el control y da cero. **Excel 445 → 457 con doce agregadas y CERO
  perdidas**; campos **998 → 1010**, los doce autorizados y **ninguno perdido**.
  ⚠️ **Y SUS «0 DIFERENCIAS DE PANTALLA» SON UN CONTROL NEGATIVO, Y SE DECLARA**: ese arnés no
  abre el componente ni mira su tarjeta. Lo que lo mide son `scripts/_probe_pant20mod.mjs` y la
  sonda de dos motores.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), con **UNA** diferencia entre motores y es de métrica de fuente: **3 px** en el ancho
  del botón (128 contra 131). En los dieciséis: las **tres** secciones abiertas, los **tres**
  botones en **44 px de alto**, **ajeno=0 en los 48** —ningún toque cae en otro control—, la fila
  **propia** del botón mitral **hermana** de la grilla de tres, esa grilla con sus **tres** hijos
  `vm_morf, vm_tipo_im, vm_carp` intactos, la tarjeta **flotante** a 1440 y 1000 y **hoja fija
  abajo** a 768 y 390, **dentro** de la pantalla, cerrando con **Escape** y **devolviendo el foco
  al botón**, las **siete** fichas con la pulmonar y la tricúspide **dentro** del contenedor y
  **cerradas**, **cero** desplazamiento horizontal, **cero** textos recortados y **CERO errores de
  consola y de página**.
  **El mismo cruce contra `694e9e3` es el control, y reproduce las premisas**: los tres botones
  **NO EXISTEN**, la fila propia en falso, **cinco** fichas con cero pulmonar y cero tricúspide,
  y la grilla de tres **idéntica** —o sea que TC-522 no se movió—, con el mismo `scrollH=0` y
  `recortados=0`.
  ⚠️ **El único error de consola de ese árbol es del arnés**, `ERR_FILE_NOT_FOUND`, porque se
  carga de una copia en el temporal: lo que la tanda D2 ya documenta. El árbol vivo da **cero** en
  los dieciséis.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
  `channel: 'chrome'`.
  ⚠️ **Y LA PRIMERA CORRIDA DE ESA SONDA MIDIÓ SOBRE UN DENOMINADOR VACÍO**: los tres botones
  informaban **0×0** y la tarjeta no abría en los dieciséis cruces, que se lee igual que «el
  componente no está». Faltaba abrir las tres secciones con `toggleEteSeccion` sobre los ids
  `ete-seccion-valv-*`. Se validó el cuerpo en **un** cruce antes de gastar la corrida entera.

- **CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base
  exacta. **No empeoró.**

- **Dónde está todo:** `docs/mapa/pant20-catalogo-tri-pulm.md` (**mapa NUEVO**, 14,2 KB),
  `docs/INVENTARIO_PROTESIS_P20.md`, las **dos** transcripciones celda por celda
  —`docs/TRANSCRIPCION_A7_P20.md` y `docs/TRANSCRIPCION_TRICUSPIDE_P20.md`—, las fichas de los
  seis casos en `docs/mapa/tests-fichas-736.md` (**archivo propio**, porque `tests-fichas.md`
  está a menos de 1 KB del techo), **cuatro mapas con un puntero cada uno** —medidos ANTES de
  escribir: `protesis-valvular.md` 23,4 KB, `referencias-subpestanas.md` 28,2,
  `tests-punteros-tandas.md` 27,4 y `protesis-tri-pulm.md` 19,1—, `docs/fuentes/FUENTES.md` →
  «La tanda PANT-20» con la regla de folio comprobada en cada hoja, las notas al pie literales,
  las dos tablas de obstrucción transcritas y su tabla «Cambios de evidencia»,
  `docs/REGISTRO_TANDAS.md` → el bloque de la tanda, `docs/GUIA_PRUEBA_PANT20.md` → la guía
  manual en **24** pasos, y `docs/PENDIENTES.md` → **SEIS** cosas declaradas (**P20-a** a
  **P20-f**).

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
