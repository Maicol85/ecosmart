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
| **Tocar un CUADRO DE DATOS del PDF** —los doce, su orden, la grilla de tres, las líneas de válvula dentro de cada cuadro, el asterisco de la aorta— **o el botón «Cuadros» del Informe** con su tarjeta, su punto de aviso y su arrastre con el dedo | `docs/mapa/cuadros-pdf-tarjeta.md` |
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
| **Agregar o correr un caso de prueba** | `docs/mapa/tests.md` · los casos tanda por tanda en `docs/mapa/tests-punteros-tandas.md` · fichas en `docs/mapa/tests-fichas-971.md` (TC-971 a TC-977), `docs/mapa/tests-fichas-872.md` (TC-872 a TC-881), `docs/mapa/tests-fichas-825.md` (TC-825 a TC-831), `docs/mapa/tests-fichas-821.md` (TC-821 a TC-824), `docs/mapa/tests-fichas-813.md` (TC-813 a TC-820), `docs/mapa/tests-fichas-807.md` (TC-807 a TC-812), `docs/mapa/tests-fichas-801.md` (TC-801 a TC-806), `docs/mapa/tests-fichas-795.md` (TC-795 a TC-800), `docs/mapa/tests-fichas-787.md` (TC-787 a TC-794), `docs/mapa/tests-fichas-769.md` (TC-769 a TC-777), `docs/mapa/tests-fichas-577.md` (TC-577 a TC-581), `docs/mapa/tests-fichas-572.md` (TC-572 a TC-576), `docs/mapa/tests-fichas-550.md` (TC-550), `docs/mapa/tests-fichas-538.md` (TC-538), `docs/mapa/tests-fichas-537.md` (TC-537), `docs/mapa/tests-fichas-536.md` (TC-536), `docs/mapa/tests-fichas-535.md` (TC-535), `docs/mapa/tests-fichas-532.md` (TC-532), `docs/mapa/tests-fichas.md` (TC-499 en adelante), `docs/mapa/tests-fichas-496-498.md`, `docs/mapa/tests-fichas-491-495.md` y `docs/mapa/tests-fichas-481-490.md` |
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
| **Tocar el «WHAT IF» de la estenosis aórtica**: el botón y su azul, las cuatro situaciones, el globo, el panel flotante con su arrastre, las fórmulas del flujo y del gradiente, el área que se abre con el flujo, o lo que le hace al dibujo 2D | `docs/mapa/pant37-what-if.md` |
| **Tocar la ALINEACIÓN de las dos vistas del visor** —la plantilla única de barra, el «✕ Cerrar vista» de cada vista, el prefijo libre, la columna de 340 px con su corte de 1369 px—, **el RESULTADO integrado abajo y centrado**, **la TABLA que se muda a la columna de la vista activa**, **«+ Vista» con IMÁGENES FIJAS** —su marca, la deduplicación por nombre/cuadros/bytes o los homónimos distinguidos— o **el SIMPSON bloqueado en una vista de imagen fija** | `docs/mapa/medir4a-vistas-cierre.md` |
| **Tocar el PANEL del visor** —el negro de los costados, el tope del modal, el selector FIJO con su scroller—, **la TABLA de una medida por fila** con su valor grande, **el GLOBO ⓘ del panel de medición**, **el orden del VI o el Diam TSVI en Aorta**, **los BOTONES de la barra y su contraste**, **la CALIBRACIÓN DE VELOCIDAD con dos valores** con su línea del cero y el modo M, **el FAC del VD** o **la banda de «Vmax pulmonar»** | `docs/mapa/medir3-panel-botones-calibracion.md` |
| **Tocar la BURBUJA que queda al cerrar un cartel TERMINADO, la VENTANA DE SILENCIO de la app con su pestillo, la CADENCIA del sondeo ocioso, los CINCO botones del cartel de la tanda —los tres apagados y los dos vivos—, los NOMBRES que un dato tiene en el ecógrafo, las MINIATURAS de «Imágenes sin estudio» con el borrado de a una, o el mensaje de MEDIR una fija** | `docs/mapa/p7-burbuja-silencio-botones.md` |
| **Tocar el CARTEL que sale con la PRIMERA imagen, la BURBUJA de abajo a la derecha, el texto que cuenta imágenes, cineloops, informes y los que no se pueden ver, las imágenes REPETIDAS, el ruteo por FORMATO de la vista previa y del visor, la tarjeta de los formatos que no se ven, los DATOS PARA EL ECÓGRAFO con su rótulo de cable o Wi-Fi y su carpeta compartida, el umbral de ESPACIO del puente, los NOMBRES de la fila de Permitir, o la COMPATIBILIDAD con un puente 1.3.x** | `docs/mapa/p6-tanda-burbuja-formatos.md` |
| **Tocar la CALIBRACIÓN DE DISTANCIA a mano** —su unidad, el cuadro que pide los milímetros, su campo sin valor puesto, la pista «1 cm = 10 mm» o la confirmación «Escala fijada»—, **el CARTEL de la vista previa de CeiboLink que tapaba el visor**, **la frase de la dirección probable**, **el mensaje de la vinculación que quedaba pegado** o **«Ir al estudio» desde una imagen de la galería** | `docs/mapa/p5-calibracion-capas-navegacion.md` |
| **Tocar la TABLA DE MEDIDAS del visor** —sus cinco columnas, el armador único de los dos cajones, las filas calculadas o «Borrar»—, **los NOMBRES del Doppler pulmonar** —la «Vmax pulmonar» fundida o las dos de la insuficiencia—, **el ÁREA por estructura (AI y AD)**, **Simpson en mL/m²**, o **la COMUNIDAD DE DESARROLLO DE IA bloqueada** —su estado único, su nombre único, el cartel, los dos botones o el bloque de Configuración— | `docs/mapa/medir2-tabla-anahi.md` |
| **Tocar la PREGUNTA DE DESTINO de las imágenes** —sus cuatro salidas, el selector de estudio guardado, la entrada del pendrive—, **el CINELOOP que se guarda solo con el estudio**, la TIRA con lo adjuntado «sin guardar», la CONFIRMACIÓN a CeiboLink de un estudio de solo cineloop, la BANDEJA con el cineloop entero y su asignación, o el **DICOM SIN COMPRIMIR** con su tope | `docs/mapa/ec3-destino-unico.md` |
| **Tocar «VER LO QUE ESPERA», el PANEL que se actualiza solo, la FECHA del aviso, los DIÁLOGOS PROPIOS con sus dos pesos, el UMBRAL que se deriva de la memoria del equipo, la VISTA PREVIA, o el MODO ELEGIR de la galería** —eliminar, adjuntar, exportar, importar y «Desde imágenes guardadas»— | `docs/mapa/ec5-previa-galeria.md` |
| **Tocar el VEREDICTO POR ARCHIVO del importador** —qué devuelven `mediosImportar` y `dcmImgImportar`, por qué `imgCompressLoad` devuelve una promesa, quién confirma a CeiboLink y cuándo—, **el TOPE de un DICOM sin comprimir** con su pregunta y su tope duro, **las MINIATURAS y el visor de «Sin estudio»**, o **los CINELOOPS en «Imágenes guardadas»** con su índice, su filtro y su exclusión del PPT | `docs/mapa/ec4-confirmar-pesados.md` |
| **Tocar el PANEL DE CeiboLink de Configuración** —el interruptor, el estado con su luz, la vinculación, los datos para el ecógrafo, la lista de equipos con su apodo, los ajustes o la ayuda de las tres vías—, **la CAPA DE COMUNICACIÓN con el conector** —el token, el token de generación, la traducción de errores o el mensaje de fallo de red—, o **los seis ayudantes que sobrevivieron al panel de Orthanc** | `docs/mapa/ceibolink-panel.md` |
| **Tocar el PANEL COMPACTO de CeiboLink** —la cabecera de dos renglones, los cuatro plegables nativos, el renglón de un equipo, el hueco de la grilla—, **el SONDEO**, **el AVISO de imágenes o de equipo nuevo** con su agrupación por tiempo, **ADJUNTAR al estudio** con su confirmación al guardar, **la BANDEJA de imágenes sin estudio**, o **la REGLA de nombre Y documento** y el aviso de espacio | `docs/mapa/ec2-aviso-bandeja.md` |
| **Tocar el PANEL EN LÍNEA de la vista 2D**: el botón que prende y apaga, el apagado automático, la sincronía en vivo, el alto del dibujo o la línea de fase | `docs/mapa/vista-2d-en-linea.md` |
| **Tocar el RECUADRO de la hoja de congénitas del PDF, el rótulo de la caja «Tricúspide / PSAP», el ESQUEMA DE CIRCULACIÓN EN EL PDF con su botón único, el PANEL DE EVIDENCIA COMPACTO** —una línea por pregunta, los tres estados «Sí | No | ?», la etiqueta de guía, los grupos, el contador o las dos columnas por ancho de panel—, **o la CONCLUSIÓN DE PANTALLA de la TGA** | `docs/mapa/tga4-pdf-panel-compacto.md` |
| **Tocar el DIAGRAMA 3D DE LA TRANSPOSICIÓN**: los dos ejes y su dueño único, el valor `dtga`, el campo de cirugía, las comunicaciones leídas de sus pestañas, la carga diferida con SRI, «Incluir en el PDF» o la cirugía en el papel | `docs/mapa/tga-diagrama-3d.md` |
| **Tocar el VALSALVA del grado III** —el selector, su sugerencia, la cláusula del informe y del EN SUMA, la notita punteada de los dos esquemas—, **los CUATRO TRAMOS del strain de pared libre del VD**, **la ficha del COR TRIATRIATUM**, **el solapamiento de las Tablas 11 y 12 del gradiente protésico mitral**, **la extensión circunferencial de la fuga de la TAVI** o **la ALCOHOLIZACIÓN SEPTAL del HCM Risk-SCD** | `docs/mapa/p3a-valsalva-strain-cortri.md` |
| **Tocar algo que la tanda MEDIR-6 movió** (16/11): el bloque de CALCULADOS debajo de la imagen con su ranura por vista y su corte de 1024 px, la lista de VTI por válvula con su índice real, el ALIAS de la VCI y la PmAD, «Limpiar» por estructura, «Borrar» de a uno con su número de llegada; el TRIV a **≥75 ms** en sus dos lectores; el ⓘ del índice de CELERMAJER; la CIV **sin** el DDVI indexado; los cuatro TRAMOS del velo posterior y los DOS cortes de coaptación por procedimiento con su tethering; las TRES casillas de la Tabla 4; el COR TRIATRIATUM; o la comprobación del PENDRIVE | `docs/mapa/medir6-triv-civ-teer-onco.md` |
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
| **Tocar los CONTEOS de la diástole**, la frase de la dobutamina del informe, el corte del TRIV de los elementos indirectos de HTP, la **TABLA FIJA de valores esperados de prótesis** de Referencias, las **tres fichas de severidad** nuevas, el **resumen del posoperatorio** de `ref-pop`, o el **aviso de independencia** en tres bloques con su ⓘ | `docs/mapa/pr4-diastole-triv-referencias.md` |
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

⚠️ **Al 2026-11-21, tras el PROMPT 7, el mapa nuevo nació mediano** —`p7-burbuja-silencio-botones.md`,
**16,8 KB**— y el que recibió el puntero quedó medido ANTES de escribirlo, que es la regla:
`p6-tanda-burbuja-formatos.md` **19,3 → 20,2 KB**. Las fichas de los siete casos salieron a archivo
propio (`tests-fichas-971.md`, **7,9 KB**) porque `tests-punteros-tandas.md` está en **36,4 KB** y
`tests-fichas.md` en 34,6: los dos **por encima** del techo.
⚠️ **Y POR ESO `tests-punteros-tandas.md` NO SE TOCÓ**: agregarle un puntero de tres líneas a un
archivo que ya cruzó el techo es exactamente lo que esta regla viene a evitar. El enlace a las
fichas nuevas vive en la tabla de arriba, que es donde se busca. **La próxima tanda que lo toque
tiene que partirlo** — hace ocho tandas que lo dice.

Sin importaciones automáticas (`@archivo`): un `@` acá vuelve a desbordar la ventana.

---

## Qué es EcoSmart y cómo se trabaja

- App clínica de ecocardiografía en **un solo `index.html`**: HTML + CSS + JS inline, sin build,
  sin frameworks. Hoy **13,67 MB / 189.004 líneas**, medido con `wc -c` y `wc -l` el 2026-11-21 al cierre de la **PARTE 1 de P8** (la biblioteca del estudio, la selección del PDF, los duplicados, el borrado y medir sin botón), sobre el árbol ya sellado: sello **`v20261121-1143`**, md5 **`11fe51ba`**.
  El diff de P8 son **619 líneas agregadas y 41 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `7ed031b` **sobre el árbol ya sellado**, con **CERO** `eval(` y
  `new Function` nuevos, **CERO** claves y contraseñas, y **UNA** sola aparición de `innerHTML`,
  que es el **comentario** que declara que el renglón de cuenta entra por `textContent`.
  **CERO `input`, `select` y `textarea` nuevos**, que es lo que deja todo esto fuera del censo
  del estudio y del Excel **por construcción**: **cero campos guardados nuevos** y las **457**
  columnas quietas. **Y cero cortes clínicos, cero fórmulas y cero umbrales.**
  **TRES ids nuevos** —`img-cuenta`, `img-pdf-todas` e `img-pdf-ninguna`—, ninguno terminando en
  `-aviso` ni en `-badge` y **ninguno** cayendo en ninguno de los veintidós barridos por sufijo o
  prefijo de id del archivo, verificado uno por uno; los dos de la galería (`ig-sel-todas`,
  `ig-sel-ninguna`) se crean al vuelo y tampoco caen en ninguno.
  ⚠️ **POR QUINCUAGÉSIMA CUARTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se
  verificó de las dos formas que esta casa manda: `git show 7ed031b:index.html` da **188.426**
  líneas, **13.628.580** bytes y el md5 **`cf41995d`**, los tres idénticos a lo que el renglón
  decía, y el sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,63 MB / 188.426 al cierre del **prompt 7** (la burbuja del cartel terminado, el sondeo de cuatro segundos, la ventana de silencio, los botones, los nombres del ecógrafo, las miniaturas de «Sin estudio», el mensaje de medir y los seis intermitentes), sobre el árbol ya sellado: sello **`v20261121-0308`**, md5 **`cf41995d`**.
  El diff del prompt 7 son **487 líneas agregadas y 44 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `2a1bc79` **sobre el árbol ya sellado**, de las que **228 son código
  de verdad**, 242 comentario y 17 en blanco — las 487 cierran exacto.
  ⚠️ **ESE 227 NO SE MIDIÓ CON EL FILTRO DE SIEMPRE, Y LA DIFERENCIA IMPORTA**: el filtro que esta
  casa viene usando descarta los renglones que arrancan con `/*`, `*` o `//`, y cuenta como código
  **los renglones de continuación de un comentario de bloque que no arrancan con asterisco** — que
  en este archivo son la mayoría. Con ese filtro este diff daría **430**. El 227 sale de llevar el
  estado del comentario de bloque, que es lo que de verdad separa código de prosa. Las cifras «no
  comentario» de las tandas anteriores están medidas con el filtro viejo y son, por lo tanto,
  **altas**.
  Con **CERO** `innerHTML`, `eval(` y `new Function` nuevos, **cero** claves y
  contraseñas, y **CERO** `input`, `select` y `textarea` nuevos — que es lo que deja todo esto
  fuera del censo del estudio y del Excel **por construcción**: **cero campos guardados nuevos** y
  las **457** columnas quietas. El único id que el diff muestra en el marcado es
  `eco-build-sello`, que ya existía y reaparece porque el sello cambió; lo nuevo son **atributos**
  —`data-clnk-alias`, `data-clnkb-medir`, `data-clnkb-medir-una`, `data-clnkb-medir-nota`— y una
  **clase**, `clnk-av-off`, ninguno de los cuales entra a ninguno de los veintitrés barridos por
  sufijo o prefijo de id del archivo.
  **Y CERO cortes clínicos, cero fórmulas y cero umbrales**: lo que este prompt movió son dos
  cadencias, una ventana de silencio propia, textos y pantallas.
  ⚠️ **POR QUINCUAGÉSIMA TERCERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se
  verificó de las dos formas que esta casa manda: `git show 2a1bc79:index.html` da **187.983**
  líneas, **13.597.295** bytes y el md5 **`555ee5c0`**, los tres idénticos a lo que el renglón
  decía, y el sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,60 MB / 187.983 al cierre del **cierre de P6-j y P6-k**, sello **`v20261120-1207`**, md5 **`555ee5c0`**.)
  El diff de ese cierre son **TRECE líneas agregadas y CUATRO quitadas** en `index.html`, medido con
  `git diff --numstat` contra `ad38d37` **sobre el árbol ya sellado**, de las que **UNA sola no es
  comentario** —`if (document.hidden) return;`, dentro del rebote de `clnkRefrescar`—, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos, **cero** ids nuevos —el único que el diff muestra,
  `eco-build-sello`, ya existía y reaparece porque el sello cambió— y **cero** `input`, `select` y
  `textarea` nuevos: las **457** columnas quietas y cero campos guardados nuevos, **por
  construcción**. Las otras doce son **NUEVE** de comentario —el que declara por qué esa línea va
  ahí y no adentro de `clnkPanelALaVista`— y las **TRES** del sello.
  (Antes: 13,60 MB / 187.974 al cierre del **prompt 6**, sello **`v20261120-0019`**, md5 **`0a1b2c03`**.)
  El diff del prompt 6 son **1.389 líneas agregadas y 73 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `7873930` —el cierre del prompt 5— **sobre el árbol ya sellado**, de
  las que **1.166** no son comentario, con **CERO** `eval(` y `new Function` nuevos, **CERO**
  claves y contraseñas, **CERO** `iframe` nuevos y **UNA** sola aparición de `innerHTML` en el
  diff, que es el **comentario** que declara que el dibujo de la tanda se arma con
  `createElementNS` y no con ninguno.
  **CERO `input`, `select` y `textarea` nuevos con `id`**, que es lo que deja todo esto fuera del
  censo del estudio y del Excel **por construcción**: **cero campos guardados nuevos** y las
  **457** columnas quietas. **Y cero cortes clínicos, cero fórmulas y cero umbrales**: lo que este
  prompt movió son textos, un ruteo por formato, una cadencia de sondeo y dos lecturas nuevas del
  canal local.
  **DOS ids nuevos, los dos creados al vuelo**: `clnk-tanda-svg` —el dibujo del cartel— y
  `clnk-burbuja`. El único que el diff muestra en el marcado, `eco-build-sello`, **ya existía** y
  reaparece porque el sello cambió. Ninguno de los dos termina en `-aviso` ni en `-badge` y
  **ninguno cae en ninguno de los veintitrés barridos por sufijo o prefijo de id del archivo**,
  verificado uno por uno.
  ⚠️ **POR QUINCUAGÉSIMA SEGUNDA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se
  verificó de las dos formas que esta casa manda: `git show 7873930:index.html` da **186.658**
  líneas, **13.514.126** bytes y el md5 **`6ff0372e`**, los tres idénticos a lo que el renglón
  decía, y el sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,51 MB / 186.658 al cierre del **prompt 5** (la calibración en milímetros, el cartel que tapaba el visor, los dos textos de CeiboLink y «Ir al estudio»), sobre el árbol ya sellado: sello **`v20261119-1634`**, md5 **`6ff0372e`**.
  El diff del prompt 5 son **281 líneas agregadas y 22 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `35a7c97` —el cierre del prompt 4, que era a la vez `origin/main`—
  **sobre el árbol ya sellado**, de las que **262** no son comentario, con **CERO** `innerHTML`,
  `eval(` y `new Function` nuevos, **CERO** claves y contraseñas, y **CERO** `input`, `select` y
  `textarea` nuevos con `id` — que es lo que deja todo esto fuera del censo del estudio y del Excel
  **por construcción**: **cero campos guardados nuevos** y las **457** columnas quietas. El único
  id que el diff muestra en el marcado es `eco-build-sello`, que ya existía y reaparece porque el
  sello cambió; el cuadro nuevo de milímetros **no lleva un solo `id`** y se alcanza por
  `data-med-calmm`, justamente para no entrar a ese censo por existir.
  **Y CERO cálculos, cero cortes, cero umbrales y cero fórmulas**: lo que esta tanda movió son
  textos, un orden de capas y dos líneas de navegación.
  ⚠️ **POR QUINCUAGÉSIMA PRIMERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se
  verificó de las dos formas que esta casa manda: `git show 35a7c97:index.html` da **186.399**
  líneas, **13.498.944** bytes y el md5 **`ec205ee0`**, los tres idénticos a lo que el renglón
  decía, y el sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,50 MB / 186.399 al cierre del **prompt 4**, sello **`v20261118-1640`**, md5 **`ec205ee0`**.)
  El diff del prompt 4 son **475 líneas agregadas y 112 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `4d5c0a4` —el último commit pusheado— **sobre el árbol ya sellado**,
  de las que **424** no son comentario, con **CERO** `eval(` y `new Function` nuevos, **CERO**
  claves y contraseñas, y **UNA** sola aparición de `innerHTML` en el diff, que es el **comentario**
  que declara que la tabla fija de Referencias se pinta con **nodos** y no con ninguno.
  **CERO `input`, `select` y `textarea` nuevos con `id`**, que es lo que deja todo lo de este
  prompt fuera del censo del estudio y del Excel **por construcción**: **cero campos guardados
  nuevos** y las **457** columnas quietas. Y **cero cortes clínicos movidos**: el único operador
  que esta tanda tocó —el ≥ 75 del TRIV— **ya era así** en el código desde el MEDIR-6; lo que
  cambió es un texto que decía «por encima de».
  **CATORCE ids nuevos**, contados sobre el diff: los **tres** del aviso de independencia
  (`eco-indep-1`, `-2` y `-3`), los **cuatro** contenedores de la tabla fija de prótesis
  (`ref-pao-cat`, `ref-pm-cat`, `ref-ptric-cat`, `ref-ppulm-cat`), los **tres** de las fichas de
  severidad (`ref-sevet`, `ref-sevep`, `ref-sevip`) y `ref-pop-resumen`; los otros cuatro que el
  diff muestra —`ref-ptric`, `ref-trombo`, `ref-viv`, `ref-endo` y `eco-build-sello`— **ya
  existían** y reaparecen porque sus líneas se movieron o porque el sello cambió. Ninguno de los
  nuevos termina en `-aviso` ni en `-badge` y **ninguno cae en ninguno de los veintitrés barridos
  por sufijo o prefijo de id del archivo**, verificado uno por uno.
  ⚠️ **Y DOS IDS SE RETIRARON**: `eco-indep-txt` y `eco-indep-fin`, los dos nodos con que la
  TAREA 1 partió el punto de independencia del aviso. El punto 9 lo reparte en tres bloques, así
  que ese corte dejó de existir.
  ⚠️ **POR QUINCUAGÉSIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show 4d5c0a4:index.html` da **186.036** líneas,
  **13.465.027** bytes y el md5 **`28b76636`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,47 MB / 186.036 al cierre de la **TAREA 2**, sello **`v20261118-0906`**, md5 **`28b76636`**.)
  El diff de la TAREA 2 son **278 líneas agregadas y 7 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `90d4460` —el cierre de la TAREA 1— **sobre el árbol ya sellado**,
  de las que **263** no son comentario, con **CERO**
  `innerHTML`, `eval(` y `new Function` nuevos, **CERO** claves y contraseñas, y **UN** id nuevo
  —`ref-hemo`—, que no termina en `-aviso` ni en `-badge` y **no cae en ninguno de los veintitrés
  barridos por sufijo o prefijo de id del archivo**.
  **CERO `input`, `select` y `textarea` nuevos**: lo de esta tarea queda fuera del censo del
  estudio y del Excel **por construcción**, con **cero campos guardados nuevos** y las **457**
  columnas quietas. Y **CERO cálculos, cero PDF, cero informe, cero EN SUMA y cero Laboratorio**:
  es sólo la pestaña Referencias.
  ⚠️ **EL CONTENIDO DE LA FICHA NO SE RETIPEA**: sale de `scripts/_gen_hemo_ref.py`, que emite el
  marcado **y** `docs/CONTROL_HEMO_REF.md` —la trazabilidad de los dieciocho bloques y la lista de
  las veintiocho cosas que quedaron afuera con su motivo—. Nada de lo que quedó afuera se nombra
  en la aplicación: la regla fija del 2026-11-04 prohíbe que un texto diga que dos fuentes no
  coinciden o que algo no se encontró.
  (Antes: 13,42 MB / 185.765 al cierre de la **TAREA 1**, sello **`v20261118-0832`**, md5 **`78f83745`**.)
  El diff de la TAREA 1 son **65 líneas agregadas y 8 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `a58a223` **sobre el árbol ya sellado**, de las que **59** no son
  comentario, con **CERO** `innerHTML`, `eval(` y `new Function` nuevos, **CERO** claves y
  contraseñas, y **DOS** ids nuevos —`eco-indep-txt` y `eco-indep-fin`—: ninguno termina en
  `-aviso` ni en `-badge` y **ninguno cae en ninguno de los veintitrés barridos por sufijo o
  prefijo de id del archivo**, verificado uno por uno. Los otros dos que el diff muestra,
  `eco-build-sello` e `indic-titulo`, **ya existían**.
  **CERO `input`, `select` y `textarea` nuevos**, que es lo que deja todo lo de esta tarea fuera
  del censo del estudio y del Excel **por construcción**: **cero campos guardados nuevos** y las
  **457** columnas quietas.
  ⚠️ **POR CUADRAGÉSIMA NOVENA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó
  de las dos formas que esta casa manda: `git show a58a223:index.html` da **185.708** líneas,
  **13.416.490** bytes y el md5 **`60fe3171`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,42 MB / 185.708 al cierre de **CUADROS**, sello **`v20261118-0219`**, md5 **`60fe3171`**.)
  El diff de CUADROS son **1.084 líneas agregadas y 621 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `d3ea944` **sobre el árbol ya sellado**, de las que **965** no son
  comentario, con **CERO** `innerHTML`, `eval(` y `new Function` nuevos —las DOS apariciones de
  `innerHTML` en el diff son los comentarios que declaran que la tarjeta se pinta con nodos y no
  con ninguno—, **CERO** claves y contraseñas, y **ONCE** ids nuevos, todos con prefijo **`cuad-`**:
  ninguno termina en `-aviso` ni en `-badge` y **ninguno cae en ninguno de los veintitrés barridos
  por sufijo o prefijo de id del archivo**, verificado uno por uno. El duodécimo que el diff muestra,
  `eco-build-sello`, **ya existía** y reaparece porque el sello cambió.
  **CERO `input`, `select` y `textarea` nuevos con `id`**, que es lo que deja todo lo de esta tanda
  fuera del censo del estudio y del Excel **por construcción** y no por una lista: **cero campos
  guardados nuevos** y las **457** columnas quietas.
  ⚠️ **POR CUADRAGÉSIMA OCTAVA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó
  de las dos formas que esta casa manda: `git show d3ea944:index.html` da **185.245** líneas,
  **13.395.233** bytes y el md5 **`5c283337`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,40 MB / 185.245 al cierre de **3A**, sello **`v20261117-2129`**, md5 **`5c283337`**.)
  El diff de 3A son **444 líneas agregadas y 139 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `e24a81c` **sobre el árbol ya sellado**, de las que **388** no son
  comentario, con **CERO** `innerHTML`, `eval(` y `new Function` nuevos y **DOS** `select` nuevos
  con `id` —`diast_valsalva` y `mch_ex_alcohol`—; los otros dos que el diff muestra,
  `diast_ritmo` y `otr_var_cortri`, **ya existían** y reaparecen porque sus líneas se movieron.
  O sea **dos campos guardados nuevos** y **CERO columnas de Excel**: el Excel del Laboratorio
  tiene orden expresa de no tocarse y su mapa es explícito, así que las **457** columnas no se
  movieron. **CUATRO globos ⓘ nuevos** (143 → **148** en el registro, contado en el navegador).
  ⚠️ **POR CUADRAGÉSIMA SÉPTIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó
  de las dos formas que esta casa manda: `git show e24a81c:index.html` da **184.940** líneas,
  **13.366.139** bytes y el md5 **`73289048`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,37 MB / 184.940 al cierre de **PARTE-2**, sello **`v20261116-1019`**, md5 **`73289048`**.)
  El diff de PARTE-2 son **390 líneas agregadas y 29 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `ac4be40` **sobre el árbol ya sellado**, con **CERO** `innerHTML`,
  `eval(` y `new Function` nuevos, **CERO** `input`, `select` y `textarea` nuevos con `id` —y por
  eso **cero** campos guardados nuevos y las **457** columnas de Excel quietas, medido con TC-135,
  TC-479, TC-824 y TC-831 en verde— y **UN** `<tr>` y **DOS** chips «CRITERIO DE ECOSMART» nuevos,
  contados sobre el diff (37 → 39 en el conteo crudo del archivo).
  ⚠️ **POR CUADRAGÉSIMA SEXTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó
  de las dos formas que esta casa manda: `git show ac4be40:index.html` da **184.707** líneas,
  **13.343.271** bytes y el md5 **`f4f277b0`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,34 MB / 184.707 al cierre de **MEDIR-6**, sello **`v20261116-0650`**, md5 **`f4f277b0`**.)
  El diff de MEDIR-6 son **535 líneas agregadas y 112 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `b065c69` **sobre el árbol ya sellado**, con **CERO** `innerHTML`,
  `eval(` y `new Function` nuevos y **CINCO** `input` nuevos con `id` — los tres de la casilla
  coronaria partida (`hfaicos_cv_vhd`, `hfaicos_cv_mi`, `hfaicos_cv_angina`) y los dos del cor
  triatriatum (`otr_var_cortri` y su nota—. O sea **cinco campos guardados nuevos** y **CERO
  columnas de Excel**, medido: TC-135, TC-479, TC-824 y TC-831 pasan **sin adaptar**, así que las
  **457** columnas no se movieron. Los `hfaicos_*` no están en `LAB_XLS_MAP`, verificado.
  ⚠️ **POR CUADRAGÉSIMA QUINTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó
  de las dos formas que esta casa manda: `git show b065c69:index.html` da **184.278** líneas,
  **13.308.763** bytes y el md5 **`ceb16d2d`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,31 MB / 184.278 al cierre de **PANT-38**, sello **`v20261115-1954`**, md5 **`ceb16d2d`**.)
  El diff de PANT-38 son **308 líneas agregadas y 52 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `121bb99` **sobre el árbol ya sellado**, con **CERO** `innerHTML`,
  `eval(` y `new Function` nuevos, **UN** id nuevo en el marcado —`lv3d-slot-botones`; los otros
  dos que el diff muestra ya existían— y **CERO** `input`, `select` y `textarea` nuevos con `id`,
  que es lo que deja todo esto fuera del censo del estudio y del Excel **por construcción**.
  ⚠️ **POR CUADRAGÉSIMA CUARTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó
  de las dos formas que esta casa manda: `git show 121bb99:index.html` da **184.022** líneas,
  **13.287.956** bytes y el md5 **`52cb231e`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,29 MB / 184.022 al cierre de **MEDIR-5**, sello **`v20261115-1535`**, md5 **`52cb231e`**.)
  ⚠️ **LA CIFRA DE CELULAR DE ESTE ARCHIVO ESTABA MAL, Y QUEDA CORREGIDA ACÁ: SON 36 ALTA, NO 18.**
  Medido con el MISMO script en los DOS árboles —el vivo y `2cd2ee9`, que es el cierre de
  MEDIR-4b— da **36 en los dos**, y con `--todo` también 36. O sea que **no hubo ninguna
  regresión**: lo que estaba mal era el número publicado. Las secciones de tanda de más abajo
  siguen diciendo «18 ALTA» y **no se reescribieron**: son el registro de lo que cada tanda
  midió en su momento, y falsearlo sería peor que dejarlo con esta advertencia arriba.
  **Los 36 son TODOS preexistentes y ajenos al visor**, verificados uno por uno: los
  `input.ind-chk` de los acordeones de Evidencia (41 del mismo tipo, 15×15 px), `#ecoHdrBurger`
  (44×30) y `#cfg-clnk-on` (13×13). Ninguno sale del visor ni de esta tanda.
  **No se corrigió el script** ni se tocó ninguno de esos controles: agrandar el área táctil de
  los acordeones de Evidencia es otra tanda y lo decide el médico (**M5-n**).
  (Antes: 13,22 MB / 183.025 al cierre de **MEDIR-4b**, sello `v20261115-0555`, md5 `c875ae0f`.)
  El diff de MEDIR-4b son **441 líneas agregadas y 69 quitadas** en `index.html`, medido con
  `git diff --numstat` contra **`74df0b6`** —el cierre de MEDIR-4a, que es la línea base de ESTA
  tanda— **sobre el árbol ya sellado**, de las que **379** no son comentario, con **cero** `eval(`
  y `new Function` nuevos, **cero** claves y contraseñas, **cero** direcciones nuevas y **CERO
  llamadas de red nuevas**.
  **CERO `innerHTML` nuevos que reciban una concatenación**: las TRES apariciones del diff son el
  **comentario** que declara por qué el mensaje se arma antes de asignarlo, la línea que asigna esa
  cadena **ya prearmada** —sólo literales, ni un dato del paciente— y la **cadena vacía** que
  esconde el panel. Semgrep queda en su línea base.
  **CERO ids nuevos en el marcado**: el único que el diff muestra, `eco-build-sello`, **ya existía**
  y reaparece porque el sello cambió. Los tres del globo ⓘ —`med-info-ov`, `med-info-tit` y
  `med-info-ok`— los crea al vuelo el diálogo de MEDIR-3 y **se destruyen al cerrarlo**. Los de la
  barra de dos pasos **no son ids**: son los atributos `data-simp-paso`, `data-simp-listo` y
  `data-simp-pfx`, y van **prefijados por vista** justamente para que no pueda haber un id
  duplicado con las dos vistas abiertas.
  **CERO `input`, `select` y `textarea` nuevos con `id`**, que es lo que deja todo lo de esta tanda
  fuera del censo del estudio y del Excel **por construcción** y no por una lista: el Excel queda en
  **457** columnas con **cero** campos guardados nuevos.
  ⚠️ **POR CUADRAGÉSIMA TERCERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se
  verificó de las dos formas que esta casa manda: `git show 74df0b6:index.html` da **182.653**
  líneas, **13.191.594** bytes y el md5 **`359755ea`**, los tres idénticos a lo que el renglón
  decía, y el sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,19 MB / 182.653 al cierre de la tanda **MEDIR-4a**, sello **`v20261115-0250`**, md5 **`359755ea`**.)
  El diff de MEDIR-4a son **433 líneas agregadas y 72 quitadas** en `index.html`, medido con
  `git diff --numstat` contra **`e7a1f3e`** —el cierre del bloque 0 de MEDIR-4, que es la línea
  base de ESTA tanda— **sobre el árbol ya sellado**, de las que **363** no son comentario, con
  **CERO** `innerHTML`, `eval(` y `new Function` nuevos, **cero** claves y contraseñas, **cero**
  direcciones nuevas y **CERO llamadas de red nuevas**.
  **DOS ids nuevos en el marcado, contados sobre el diff**: `cine-cerrar-v` —el «✕ Cerrar vista»
  de la vista A, que hasta MEDIR-3 existía sólo en la B con el prefijo `b-`— y `b-cine-der-slot`
  —la ranura de los cajones de la vista B—. Los cinco que el diff además muestra —`cine-add-b`,
  `cine-cerrar`, `cine-biplano`, `cine-simp-uni` y `eco-build-sello`— **ya existían** y
  reaparecen porque sus líneas cambiaron. **Ninguno de los dos nuevos termina en `-aviso` ni en
  `-badge`**, y **ninguno cae en ninguno de los veintidós barridos por sufijo o prefijo de id
  del archivo** (13 `id$=` y 9 `id^=`), verificado uno por uno.
  **CERO `input`, `select` y `textarea` nuevos con `id`**, que es lo que deja todo lo de esta
  tanda fuera del censo del estudio y del Excel **por construcción** y no por una lista: el Excel
  queda en **457** columnas con **cero** campos guardados nuevos. **Y lo que se RETIRA es un
  control**: la casilla de Anahí por fila, que nunca tuvo `id`.
  ⚠️ **POR CUADRAGÉSIMA SEGUNDA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se
  verificó de las dos formas que esta casa manda: `git show e7a1f3e:index.html` da **182.292**
  líneas, **13.163.769** bytes y el md5 **`6545b13e`**, los tres idénticos a lo que el renglón
  decía, y el sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,16 MB / 182.292 al cierre de la tanda **MEDIR-3**, sello **`v20261114-2057`**, md5 **`6545b13e`**.)
  El diff de MEDIR-3 son **775 líneas agregadas y 220 quitadas** en `index.html`, medido con
  `git diff --numstat` contra **`3e64801`** —el cierre de MEDIR-2, que es la línea base de ESTA
  tanda— **sobre el árbol ya sellado**, de las que **658** no son comentario, con **CERO**
  `innerHTML`, `eval(` y `new Function` nuevos, **cero** claves y contraseñas, **cero** direcciones
  nuevas y **CERO llamadas de red nuevas**.
  **CERO ids nuevos en el marcado**: los tres que el diff muestra —`cine-modal`, `cine-der-slot` y
  `eco-build-sello`— **ya existían** y reaparecen porque sus líneas cambiaron. Los tres del globo ⓘ
  —`med-info-ov`, `med-info-tit` y `med-info-ok`— los crea al vuelo el diálogo y **se destruyen al
  cerrarlo**, así que no dejan un nodo que los barridos de «Nuevo estudio» puedan alcanzar; ninguno
  termina en `-aviso` ni en `-badge`.
  **CERO `input`, `select` y `textarea` nuevos con `id`**, que es lo que deja todo lo de esta tanda
  fuera del censo del estudio y del Excel **por construcción** y no por una lista: el Excel queda en
  **457** columnas con **cero** campos guardados nuevos.
  ⚠️ **POR CUADRAGÉSIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de las
  dos formas que esta casa manda: `git show 3e64801:index.html` da **181.737** líneas,
  **13.123.356** bytes y el md5 **`3b0e2373`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,12 MB / 181.737 al cierre de la tanda **MEDIR-2**, sello **`v20261114-0031`**, md5 **`3b0e2373`**.)
  ⚠️ **EL ÁRBOL SE RESELLÓ AL RETOMAR, Y FUE POR UN DEFECTO QUE LA SONDA DE DOS MOTORES
  ENCONTRÓ**: el `row-gap` de 16 px de la fila del selector **no aplicaba**, porque el marcado
  emitía el atajo `gap:3px` **en línea** y ése fija los dos ejes, así que le ganaba a la hoja — y
  con la fila **envuelta** eso dejaba **tres pares de áreas táctiles solapadas**. El primer sello,
  `v20261113-1953` con md5 `08eb08c0` y 181.730 líneas, es el de la pasada que se mató en el lote
  17. Todo lo que se midió después —la batería, Semgrep, el celular, los ocho cruces y las
  mutaciones— corrió sobre este árbol. Declarado en **M2-g**.
  El diff de MEDIR-2 son **511 líneas agregadas y 53 quitadas** en `index.html`, medido con
  `git diff --numstat` contra **`671d52b`** —el cierre de MEDIR-1, que es la línea base de ESTA
  tanda— **sobre el árbol ya sellado**, de las que **447** no son comentario, con **CERO**
  `innerHTML`, `eval(` y `new Function` nuevos —las dos apariciones de `innerHTML` en el diff son
  el comentario que declara el `join` y la línea que REEMPLAZA al `innerHTML` que ya estaba—,
  **cero** claves y contraseñas, **cero** direcciones nuevas y **CERO llamadas de red nuevas**.
  **SIETE ids nuevos, contados sobre el diff**: `anahi-ov`, `anahi-tit` y `anahi-ok` —los tres los
  crea al vuelo el cartel y se destruyen al cerrarlo—, `cfg-card-anahi`, `cfg-anahi-tit`,
  `cfg-anahi-txt` e `igio-exp-anahi`. El octavo que el diff muestra, `eco-build-sello`, **no es
  nuevo**: es el del pie, que reaparece porque el sello cambió. **Ninguno** termina en `-aviso` ni
  en `-badge` y **ninguno** cae en ninguno de los **veintidós** barridos por sufijo o prefijo de
  id del archivo (13 `id$=` y 9 `id^=`), verificado uno por uno.
  **CERO `input`, `select` y `textarea` nuevos con `id`**, que es lo que deja todo lo de esta
  tanda fuera del censo del estudio y del Excel **por construcción** y no por una lista: el bloque
  de Configuración no tiene un solo control, el cartel tampoco, y la casilla de la tabla la pinta
  el JS sin id.
  ⚠️ **Y EL DIFF SE MIDIÓ PRIMERO CONTRA `ff8c585`, Y ESA CIFRA ERA FALSA PARA ESTA TANDA**: daba
  **978 y 200**, porque `ff8c585` es la línea base de **MEDIR-1** y el diff mezclaba las dos
  tandas —aparecían como «nuevos» `cine-maxi`, `cine-modal` y el `cine-cap-etiq` reindentado, que
  son de MEDIR-1—. La línea base de una tanda es el cierre de la anterior.
  ⚠️ **POR TRIGÉSIMA NOVENA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show ff8c585:index.html` da **180.952** líneas,
  **13.072.280** bytes y el md5 **`f381026b`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 13,07 MB / 180.952 al cierre de la tanda **ECO-CONECTOR-5**, sello **`v20261112-2150`**, md5 **`f381026b`**.)
  El diff de ECO-CONECTOR-5 son **1.926 líneas agregadas y 104 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `5a9f0ca` **sobre el árbol ya sellado**, de las que **1.829** no son
  comentario, con **CERO** `innerHTML`, `eval(` y `new Function` nuevos —contados sobre el diff y no
  de memoria—, **cero** claves y contraseñas, **cero** direcciones nuevas y **CERO llamadas de red
  nuevas**: todo pasa por `clnkPedir`, que ya existía.
  ⚠️ **Y ESTE PÁRRAFO DECÍA «1.896 agregadas y 116 quitadas» CON «1.586 no comentario» Y «CUATRO
  `innerHTML`», QUE ERA FALSO EN LAS CUATRO CIFRAS**: lo conté de memoria sobre lo que tenía en la
  cabeza en vez de contarlo sobre el diff. `git diff --numstat` da **1.926 y 104**, el barrido de
  líneas que no son comentario da **1.829**, y `innerHTML` aparece **cero** veces en las líneas
  agregadas. Es exactamente el error que PANT-18 y ECO-CONECTOR-2 pagaron con su propio conteo.
  **OCHO ids nuevos, contados sobre el diff**: cinco en el marcado —`cfg-clnk-acciones`,
  `clnkav-b5`, `clnkav-cuerpo`, `ig-imgv-adj` e `img-desde-guardadas`— y tres que la columna de la
  galería crea al vuelo —`ig-elegir-on`, `ig-sel-cnt` e `ig-sel-res`—. El noveno que el diff muestra,
  `eco-build-sello`, **no es nuevo**: es el del pie, que reaparece porque el sello cambió.
  **Ninguno** termina en `-aviso` ni en `-badge` y **ninguno** cae en los veintiún barridos por
  sufijo o prefijo del archivo.
  **CERO `input`, `select` y `textarea` nuevos con `id`**: el único control nuevo con id es la
  casilla `ig-elegir-on`, que la pinta el JS y lleva prefijo `ig-`, y el censo medido en el
  navegador en los DOS árboles da **1132** controles con id, **1004** que entran al censo del
  estudio, **457** columnas de Excel y **381** claves del mapa del Laboratorio — **los cuatro
  idénticos a los dos lados**, con el detector de que son dos árboles diciendo NO en el base y SÍ
  en el vivo.
  ⚠️ **POR TRIGÉSIMA OCTAVA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show 5a9f0ca:index.html` da **179.130** líneas,
  **12.969.155** bytes y el md5 **`6f25d43d`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,97 MB / 179.130 al cierre de la tanda **ECO-CONECTOR-4**, sello **`v20261112-1639`**, md5 **`6f25d43d`**.)
  El diff de ECO-CONECTOR-4 son **683 líneas agregadas y 73 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `12d27ce` **sobre el árbol ya sellado**, de las que **627** no son
  comentario, con **cero** `innerHTML`, `eval(` y `new Function` nuevos, **cero** claves y
  contraseñas, **cero** direcciones nuevas y **CERO llamadas de red nuevas**.
  **UN SOLO id nuevo, contado sobre el diff**: `clnkb-ver`, el del visor de la bandeja, que se crea
  al vuelo. No termina en `-aviso` ni en `-badge` y no cae en ninguno de los veintiún barridos por
  sufijo o prefijo del archivo. **CERO `input`, `select` y `textarea` nuevos con `id`**, que es lo
  que deja todo lo de esta tanda fuera del censo del estudio y del Excel **por construcción** y no
  por una lista. **Excel en 457 columnas y cero campos guardados nuevos.**
  ⚠️ **POR TRIGÉSIMA SÉPTIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show 12d27ce:index.html` da **178.520** líneas,
  **12.930.920** bytes y el md5 **`e262aa4d`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,93 MB / 178.520 al cierre de la tanda **ECO-CONECTOR-3**, sello **`v20261112-1355`**, md5 **`e262aa4d`**.)
  El diff de ECO-CONECTOR-3 son **1.622 líneas agregadas y 223 quitadas** en `index.html`, medido
  con `git diff --numstat` contra `bff56dc` **sobre el árbol ya sellado**, de las que **1.431** no
  son comentario, con **cero** `innerHTML`, `eval(` y `new Function` nuevos —la única aparición de
  `innerHTML` en el diff es el comentario que declara que todo lo que viene de CeiboLink y de un
  estudio guardado entra por `textContent`—, **cero** claves y contraseñas, **cero** direcciones
  nuevas y **CERO llamadas de red nuevas** —el único `fetch(` del diff está en el comentario que
  explica por qué un `dataURL` se decodifica a mano—.
  **CUATRO ids nuevos, contados sobre el diff**: `clnkav-b4`, `ig-bandeja`, `ig-bandeja-cnt` y
  `ig-bandeja-lista`. **Ninguno** termina en `-aviso` ni en `-badge` y **ninguno** cae en ninguno de
  los veintiún barridos por sufijo o prefijo del archivo. **CERO `input`, `select` y `textarea`
  nuevos con `id`**, que es lo que deja todo lo de esta tanda fuera del censo del estudio y del
  Excel **por construcción** y no por una lista: el buscador del selector de estudio guardado no
  lleva `id` a propósito, y el bloque «Sin estudio» no tiene un solo control. **Excel en 457
  columnas y cero campos guardados nuevos.**
  ⚠️ **POR TRIGÉSIMA SEXTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show bff56dc:index.html` da **177.121** líneas,
  **12.849.803** bytes y el md5 **`ec482b6d`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,85 MB / 177.121 al cierre de la tanda **ECO-CONECTOR-2**, sello **`v20261112-0158`**, md5 **`ec482b6d`**.)
  El diff de ECO-CONECTOR-2 son **1.521 líneas agregadas y 205 quitadas** en `index.html`, medido
  con `git diff --numstat` contra `8afba18` **sobre el árbol ya sellado**, de las que **1.300** no
  son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos —la única aparición de `innerHTML` en el diff es
  el comentario que declara que el nombre del equipo entra por `textContent`—, **cero** claves y
  contraseñas, **cero** direcciones nuevas y **CERO llamadas de red nuevas**: todo pasa por
  `clnkPedir`, que ya existía.
  ⚠️ **Y ESE PÁRRAFO DECÍA «1.726 líneas agregadas y 206 quitadas», QUE ERA FALSO**: lo conté de
  memoria sobre lo que tenía en la cabeza en vez de contarlo sobre el diff. `git diff --numstat`
  da **1.521 y 205**. Es exactamente el error que PANT-18 pagó con su conteo de `innerHTML`.
  **TREINTA Y DOS ids nuevos, contados sobre el diff**: **veinte** con prefijo **`cfg-`**, **ocho**
  con **`clnkav-`** (el modal de los avisos), **tres** con **`clnkb-`** (la bandeja) y el del pie
  que repone el sellador. **Ninguno** termina en `-aviso` ni en `-badge` y **ninguno** cae en ninguno
  de los veintiún barridos por sufijo o prefijo del archivo. **Tres controles nuevos, los tres
  con prefijo `cfg-`**, que es lo que los deja fuera del censo del estudio y del Excel por las
  DOS listas a la vez (`_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO`); y la sección de la
  bandeja **no tiene un solo `input`**, así que queda fuera por construcción. **Excel en 457
  columnas y cero campos guardados nuevos.**
  ⚠️ **POR TRIGÉSIMA QUINTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show 8afba18:index.html` da **175.805** líneas,
  **12.769.895** bytes y el md5 **`60ed9c1c`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,77 MB / 175.805 al cierre de la tanda **ECO-CONECTOR-1**, sello **`v20261111-2208`**, md5 **`60ed9c1c`**.)
  ⚠️ **Y EL ARCHIVO QUEDÓ MÁS CHICO AUNQUE LA TANDA ESCRIBIÓ 1.018 LÍNEAS**, por segunda vez en
  muchas tandas: el panel de Orthanc que se retiró era más grande que el de CeiboLink que lo
  reemplaza —1.093 líneas quitadas contra 1.018 puestas—. 175.880 → **175.805**.
  El diff de ECO-CONECTOR-1 son **1.018 líneas agregadas y 1.093 quitadas** en `index.html`,
  medido con `git diff --numstat` contra `e9fb2d0` **sobre el árbol ya sellado**, de las que
  **853** no son comentario, con **cero** `eval(` y `new Function` nuevos y cero claves ni
  contraseñas. **UN** `innerHTML` en el diff, y es el **comentario** que declara que todo lo que
  viene del conector entra con `textContent` y que no se usa ninguno. **VEINTIÚN ids nuevos**
  —veinte con prefijo **`cfg-`** más el del pie que repone el sellador—, **ninguno** terminando en
  `-aviso` ni en `-badge`, que son los barridos por sufijo de «Nuevo estudio»; y **cuatro**
  controles nuevos, los cuatro con prefijo `cfg-`, que es lo que los deja fuera del censo del
  estudio y del Excel por las DOS listas a la vez (`_noEsDelEstudio` y
  `_CAMPOS_FUERA_DEL_ESTUDIO`). **Excel en 457 columnas y cero campos guardados nuevos**, que lo
  fijan TC-824 y TC-831 en verde.
  ⚠️ **POR TRIGÉSIMA CUARTA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show e9fb2d0:index.html` da **175.880** líneas,
  **12.771.276** bytes y el md5 **`3f5893e7`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,77 MB / 175.880 al cierre de la tanda **PANT-37**, sello **`v20261111-1450`**, md5 **`3f5893e7`**.)
  ⚠️ **ESAS DOS CIFRAS VAN EN LA MISMA LÍNEA, Y NO ES UN GUSTO DE FORMATO**: TC-753 exige que en el
  renglón donde está el sello que publica el pie haya además un md5 de ocho hexadecimales, y con el
  salto de línea entre los dos el caso sale ROJO -- lo pagó PANT-31, que los partió al reflujar el
  párrafo.
  El diff de PANT-37 son **1.018 líneas agregadas y 7 quitadas** en `index.html`, medido con
  `git diff --numstat` contra `f1412a2` **sobre el árbol ya sellado**, de las que **948** no son comentario, con **cero**
  `innerHTML`, `eval(` y `new Function` nuevos —las DOS apariciones de `innerHTML` en el diff son
  comentarios que declaran que el panel y sus gráficas se arman por nodos y no con ninguno— y
  cero claves ni contraseñas. **Cuarenta ids nuevos, todos con prefijo `wi-`** —guión MEDIO—, que
  es lo que los deja fuera del censo del estudio y del Excel por las DOS listas a la vez
  (`_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO`), y **ninguno** termina en `-aviso` ni en
  `-badge`, que son los barridos por sufijo de «Nuevo estudio».
  ⚠️ **EL ÁRBOL SE RESELLÓ AL CERRAR, Y FUE POR UN DEFECTO QUE LA MEDICIÓN DE LOS DOS MOTORES
  ENCONTRÓ**: a **1000 px** el panel nacía con su borde derecho 16 px fuera de la ventana, el
  acote lo corría esos 16 px hacia la izquierda y le **tapaba al dibujo 6 px de ancho por 336 de
  alto, 2016 px²** — lo único que la orden prohíbe—, reproducible en los dos motores y en los dos
  temas. El acote ahora **angosta** el panel al hueco que le queda a su derecha en vez de
  correrlo. Todo lo que se midió después —el barrido, los dos motores, el celular, el A/B y la
  suite— corrió sobre este árbol. Declarado en **P37-f**.
  ⚠️ **POR TRIGÉSIMA TERCERA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
  las dos formas que esta casa manda: `git show f1412a2:index.html` da **174.869** líneas,
  **12.709.527** bytes y el md5 **`44207a10`**, los tres idénticos a lo que el renglón decía, y el
  sello del pie (`#eco-build-sello`) coincidía con el que `CLAUDE.md` publicaba.
  (Antes: 12,71 MB / 174.869 al cierre de la tanda **PANT-36**, sello **`v20261111-0442`**, md5 **`44207a10`**.)
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

> ⚠️ **AL 2026-11-15 ESTE ARCHIVO PESA 391 KB —unos 107k tokens— Y «Estado vigente» TIENE
> DIECISÉIS TANDAS, NO TRES.** Medido con `wc -c` al cerrar MEDIR-4a. **MEDIR-4a TAMPOCO HIZO LA
> MUDANZA, y se declara en vez de dejarlo pasar en silencio**: su orden no la pedía, el presupuesto
> se fue en los cuatro bloques y su verificación de cierre, y un `sed` mal apuntado sobre este
> archivo cuesta más que el tamaño. Es la **decimocuarta** tanda seguida que la posterga. Lo que
> hay que mudar hoy a `docs/archivo/CLAUDE_HISTORIAL_TANDAS.md` es todo lo anterior a **MEDIR-3**,
> o sea de **ECO-CONECTOR-5 hacia atrás**.
>
> ⚠️ **AL 2026-11-13 ESTE ARCHIVO PESABA 347 KB —unos 95k tokens— Y «Estado vigente» TENÍA TRECE
> TANDAS, NO TRES.** Medido con `wc -c` al cerrar ECO-CONECTOR-5. La regla de la LIMPIEZA-1 dice
> que acá quedan **las tres últimas**; de ECO-CONECTOR-1 hacia atrás —PANT-37, PANT-36, PANT-34,
> PANT-33, PANT-32, PANT-31, PANT-30, PANT-29, PANT-28, PANT-26, PANT-27 y las dos de auditoría—
> tendrían que estar en `docs/archivo/CLAUDE_HISTORIAL_TANDAS.md`. **Cada tanda desde la LIMPIEZA-1
> agregó la suya sin archivar ninguna**, y por eso el archivo pasó de 146 KB a 347. **La próxima
> tanda tiene que hacer la mudanza antes de escribir su sección**: es media hora de `sed` y deja el
> archivo en el tamaño que esta regla promete.
>
> ⚠️ **Y la tanda LIMPIEZA-1 (2026-11-08) movio una segunda camada.** Acá quedan las **tres
> ultimas** tandas —PANT-22, PANT-21 y PANT-20—; de **PANT-19 hacia atras**, y el bloque
> que seguia a «Procedencia» (de la tanda TGA a VAL-PPT), estan en
> `docs/archivo/CLAUDE_HISTORIAL_TANDAS.md`, textuales y en su orden. Se buscan con
> `grep -nE "^### "` y se leen por rango con `sed -n`. **Ninguna regla se movio**, otra vez:
> lo verificado esta en `docs/INVENTARIO_LIMPIEZA_L1.md`.

**P8, PARTE 1 (2026-11-21) — la biblioteca del estudio, la selección del PDF, los duplicados, el
borrado y medir sin botón.** SIETE puntos (1.1 a 1.7) y SEIS commits. Sello
**`v20261121-1139`**, md5 **`36f90f39`**, **188.968** líneas. Línea base **`7ed031b`**, el cierre
del prompt 7. **Sin push: lo corre Maicol.** ⚠️ **LA PARTE 2 —el visor de cineloop, puntos 2.1 a
2.6— NO SE EMPEZÓ**, y se declara en **P8-g**; el **2.7 sí está contestado entero**.

**NADA CLÍNICO SE MOVIÓ, y es medible**: cero cortes, cero umbrales, cero fórmulas. Y **CERO**
`input`, `select` y `textarea` nuevos, que deja todo esto fuera del censo del estudio y del Excel
**por construcción**: cero campos guardados nuevos y las **457** columnas quietas.

**TRES PREMISAS DEL REPORTE DEL MÉDICO RESULTARON FALSAS, Y ESO CAMBIÓ QUÉ HABÍA QUE CONSTRUIR.**
Está todo en `docs/INVENTARIO_P8.md`, medido en Chrome con imágenes sintéticas:
- **«Con pendrive entran solo a la biblioteca» es FALSO.** El cable y el pendrive comparten UNA
  puerta —`mediosImportar` → `imgCompressLoad` → `imgSlots`— y las dos entraban al PDF: 3 slots,
  3 en el papel, `origen: ['ceibolink','ceibolink','estudio']`. Lo que del pendrive no ocupa slot
  son los **cineloops**, que van a su cola. **No había un camino bueno que copiar.**
- **«En la grilla siguen figurando como incluidas» es FALSO**: las dos listas YA estaban
  sincronizadas —`infMinCapturas` bajaba 3→2 en el acto y la celda decía «Fuera del PDF» con su
  botón—. Lo roto era la **LEGIBILIDAD**: 10 px pegados al borde de abajo, **debajo** del selector
  de calidad, y el botón `--bg2` sobre banda `--bg3`, o sea **gris sobre gris**. Las dos quejas
  —«siguen incluidas» y «el botón casi no se ve»— son **el mismo defecto**.
- **«No avisa por qué» es FALSO**: `guardarInforme` devuelve `false` y emite el toast con el
  motivo exacto. Lo roto es la **forma**: un toast se desvanece, y con el sondeo repintando cada
  cuatro segundos es justo el aviso que se pierde.

**EL MODELO, Y POR QUÉ NO HUBO MIGRACIÓN.** `imgSlots` es la **biblioteca**; la selección del PDF
son los slots **sin `noPdf`**. ⚠️ **SE REUSÓ `noPdf` Y NO UN CAMPO NUEVO**, y es lo que evita
reescribir lo guardado: los **seis** emisores del PDF, `infMinCapturas` y la lista blanca de
`CeiboImg` ya preguntaban por `!s.noPdf` desde AJUSTES-2. Un estudio guardado antes de hoy no
trae la marca, `!!undefined` es `false`, y **se reimprime idéntico** —medido: 1 slot, 1 en el
PDF—. **Lo único que cambió es con qué marca NACE una imagen nueva.** Un `enPdf` invertido habría
dejado todos los estudios viejos imprimiendo sin imágenes.

**1.1 · Todo lo que llega entra a la biblioteca y FUERA del PDF**, por la puerta única, así que
alcanza al cable, al pendrive, al «+», al pegado y a la captura del visor **por construcción y no
por una lista**. Los **esquemas** no pasan por ahí y siguen entrando **incluidos**: su botón ES el
gesto explícito del médico, y lo fija TC-978 (D1) como control negativo.

**1.2 · La pastilla es el estado Y el control.** `＋ AL PDF` / `✓ EN EL PDF` arriba a la izquierda
de cada celda, con `aria-pressed`, delegada **una sola vez** y en fase de captura. Se retiran el
cartel y su botón gris sobre gris. La ✕ roja conserva su `title="Eliminar"` —lo exige un caso— y
pasa por `imgBorrarBib`, que **pregunta** y dice que la pastilla es la otra cosa; `imgRemove`
queda intacta, que la llaman tres casos y `igSelEliminar`. **El «doble borrado» desaparece por
construcción**: hay UN borrado y vive en la biblioteca.
La fila de miniaturas es el **destino del arrastre** —tipo propio `application/x-eco-bib`, porque
las propias miniaturas ponen su índice en `text/plain` para reordenar— y **se ve vacía** cuando
hay biblioteca: sin eso no habría dónde soltar ni nada que avisara que el informe va a salir sin
imágenes. Más «📄 Todas al PDF» / «🗂 Ninguna al PDF» y el renglón «N en la biblioteca · M en el
PDF».

**1.3 · La deduplicación, y el primer intento que la batería desmintió.** La clave es **nombre del
archivo + hash FNV‑1a de su contenido** (`_imgClaveArchivo` → `slot._srcKey`, sólo en memoria), y
es **opt-in desde las dos puertas de importación**: sin clave no se deduplica nada, lo que deja
afuera a propósito la captura del visor y el pegado.
⚠️ **EL PRIMER INTENTO DEDUPLICABA POR EL `dataURL` COMPRIMIDO Y ERA UN DEFECTO REAL.** TC-234
importa **dos DICOM con los mismos píxeles y distinta región** —uno declara su escala y el otro
no— y el slot guarda el JPEG recomprimido, no la cabecera: los dos daban bytes idénticos y el
segundo se descartaba. Son dos archivos **clínicamente distintos**. TC-242 pagó lo mismo con tres
fijas hechas de los mismos bytes. **Lo encontró la batería, no la lectura.**
Una repetida devuelve **`'dup'`** y no `false`: con `false` contaría como «no entró», el aviso
diría que sigue esperando en CeiboLink y **no se confirmaría al guardar**.
⚠️ **NO SE LE CONFIRMA NADA AL PUENTE AL ADJUNTAR** (decisión de Maicol): se mantiene la regla de
que nunca se borra allá lo que EcoSmart no guardó completo. Declarado en **P8-b**.

⚠️ **Y EL MÉDICO MANDÓ UN DATO REAL A MITAD DE LA TANDA QUE PRECISA LA CAUSA, Y ABRIÓ UN HUECO QUE
LA CLAVE EN MEMORIA NO CUBRÍA.** Con el VINNO **por router**, el equipo mandó **9** imágenes y la
última llegó tarde: hubo **tres carteles**, y **cada cartel adjunta TODO lo que el puente tiene
acumulado, no sólo lo nuevo** —7, después 8, después 9—, así que el estudio quedaba con
**24 en vez de 9**. La deduplicación por archivo ya lo atajaba **dentro de una sesión**; lo que no
cubría era el otro caso que él pidió: **el reenvío completo después de GUARDAR**. Ahí `imgSlots`
se repuebla del disco y `_srcKey` **vivía sólo en memoria**, así que el lote entero volvía a
entrar. Por eso **`_srcKey` pasa a persistirse**, en las dos allowlists —escritura y lectura—, con
el mismo criterio con que `noPdf` entró en AJUSTES-2: son ~45 bytes por imagen, **no es un campo
del estudio ni una columna de Excel**, y un registro viejo que no la trae simplemente **no
deduplica** en vez de romper.
**Y no hace falta recordar qué carteles hubo:** `imgSlots` **es** la biblioteca, así que un solo
barrido cubre las dos mitades de lo que el médico pidió —«sólo se agregan las que no están ya en
el estudio **o en la biblioteca**»—. Alcanza con preguntar si **este** archivo ya está.
**Lo cubre TC-984**, que simula los tres carteles y mide **9 y no 24**, con el reenvío completo
tras guardar y reabrir dejando las nueve, una décima imagen entrando como control negativo, y un
registro de antes de P8 que no rompe nada. Cae contra `7ed031b` por su denominador.

**1.4 · El borrado que «no se concreta», y su causa.** `CeiboImg.quitar(uuid, idxs, esperados)`
gana un tercer argumento **opcional**: el `dataURL` que la pantalla creía que estaba en cada
posición. Lo que no coincide **no se borra** y se informa en `desfasados`. Los índices son
POSICIONES y la galería los saca de un índice y de una **caché por estudio**; cualquier escritura
entremedio los corre, y **un índice corrido no falla: borra OTRA imagen del mismo estudio**.
`igSelEliminar` **invalida la caché antes de leer** —antes lo hacía después— y dice el desfase en
vez de perder la imagen equivocada en silencio.
Más «☑ Todas» / «☐ Ninguna» en la galería, que alcanza a **lo que está a la vista** y **lo dice**:
los meses nacen plegados y «todas» no puede significar lo que el médico no está viendo.
⚠️ **La selección múltiple en «Imágenes sin estudio» NO se hizo** → **P8-c**. En la biblioteca ya
existía desde ECO-CONECTOR-5, medido. Y el borrado múltiple de **estudios** queda **evaluado y no
construido**, con su motivo → **P8-d**.

**1.5 · El aviso ya no se va solo.** La regla no cambió; se suma un cartel que no se desvanece,
con tres cosas que el toast no decía: qué falta, **cuántas** imágenes esperan y que **no se
perdieron**.
⚠️ **Y ACÁ SE PAGÓ UNA TRAMPA NUEVA, QUE QUEDA ESCRITA**: el aviso de «ya estaban» salió primero
por `_dstAviso`, y **fuera de una tanda eso es un `alert` NATIVO** que el runner no sustituye: la
batería entera quedó colgada esperando un clic y hubo que matar una corrida de 31 casos. Nació
`_dstNota` —junta dentro de una tanda, `toast` fuera—, y la regla es que **un aviso que no exige
una decisión va por ahí**.

**1.6 · Medir sin botón que activar.** Se retira «📏 Medir» de la pantalla; `medFijaToggle` y
`_medFijaOn` **siguen existiendo** (los llaman seis casos). Un clic sobre la imagen abre el visor
por `_medClicEnvoltorio`, con una **ventana de 260 ms** que el `dblclick` —«ampliada»— cancela, y
que `imgRender` también cancela; la celda se **re-resuelve por su `data-idx`** al vencer, no se
guarda el nodo. El precio, declarado: abrir el visor tarda un cuarto de segundo más.
Las **miniaturas del Informe no abren el visor**, deliberado → **P8-e**.

**1.7 · EL VTI DEL VINNO NO SE CERRÓ, Y NO SE TOCÓ UNA LÍNEA DE CÁLCULO.** Hay **un solo** cálculo
(`_vtiDe`), la matemática está bien y el eje del tiempo sale **siempre** del archivo. **«El aviso
dijo 167,8 y la tabla 136,7» queda EXPLICADO y no es una contradicción**: 167,8 supera la banda
(0,5–150 cm), así que ese trazo se **rechazó** y nunca entró a la lista; el 136,7 es un trazo
anterior. Lo que confunde es que el rechazo **deja la fila vieja a la vista**. La razón contra los
21,66 del equipo es **6,31×** y, como la Vmax está bien, el error está en el **eje del tiempo** o
en el **ancho del trazo**: o es un trazo de **~6 latidos** —la app no tiene **ninguna guarda de
duración** y la banda admite seis— o es el `PhysicalDeltaX` del VINNO, que esta casa **nunca
midió** (las 301 regiones medidas son de GE y Sonoscape). **El discriminador ya está en pantalla:
los `ms` de esa fila.** La corrección segura es un **corte clínico nuevo** → **P8-a**.

**COBERTURA: SIETE casos nuevos, TC-978 a TC-984**, uno por punto más el de los tres carteles
acumulados, y los siete **caen contra `7ed031b`** con el mismo archivo de casos **por su denominador declarado**. **TRES casos
adaptados**: **TC-179** (dos condiciones **INVERTIDAS** en dos mitades: que al importar NO salga
en el PDF **y** que SÍ salga en cuanto se la manda, más una tercera sobre la marca del slot
—porque las dos de PDF pasaban en el árbol viejo por otro motivo y no discriminaban—, y además
pasa a medir **SU** imagen y no «la primera llena», que era por qué pasaba en su lote y fallaba
aislada); **TC-182** (lo mismo para el cuadro capturado del visor, que es la decisión del médico
«Capturar → biblioteca → yo elijo»); y **TC-554** con sus condiciones **(E5)** y **(E6)**
invertidas. Los tres caen contra la línea base. **Ninguno borrado y ninguno aflojado.**
⚠️ **TRES CASOS LOS DESTAPÓ LA BATERÍA Y NO MI CENSO** —TC-234, TC-242 y TC-179—, y los tres
señalaban defectos **míos**, no consecuencias autorizadas.

**VERIFICACIÓN. Semgrep 126 WARNING / 0 ERROR**, la línea base exacta. **Sin huérfanos nuevos.**
**17 de 17** bloques de JS inline parsean. El PDF **medido de verdad**: con la marca puesta
imprime **0** imágenes y tras «Todas al PDF» imprime la del slot.

**El prompt 7 (2026-11-21) — la burbuja del cartel terminado, el sondeo de cuatro segundos, la
ventana de silencio, los botones, los nombres del ecógrafo, «Sin estudio» y el mensaje de medir.**
NUEVE tareas, A a I, y las nueve se hicieron. OCHO commits de código, uno por tarea. Sello
**`v20261121-0308`**, md5 **`cf41995d`**, **188.426** líneas. Línea base **`2a1bc79`**, el cierre de
P6-j y P6-k. **Sin push: lo corre Maicol.**

**NADA CLÍNICO SE MOVIÓ, y es medible**: cero cortes, cero umbrales, cero fórmulas. Lo que este
prompt movió son dos cadencias, una ventana de silencio propia, textos y pantallas. Y **CERO**
`input`, `select` y `textarea` nuevos, que deja todo esto fuera del censo del estudio y del Excel
**por construcción**: cero campos guardados nuevos y las **457** columnas quietas.

**LO QUE EL MÉDICO MIDIÓ CON EL VINNO REAL, Y QUE ES LO QUE ORDENA LA TANDA.** Dieciséis imágenes
llegaron al cartel y se pudieron adjuntar, con el envío completo en 30 s. El primer cartel de
«equipo nuevo» tardó **12 a 15 s** (con el ecofalso, 3). La tanda 2 —seis imágenes y un cineloop—
llegó entera en menos de 30 s y los botones de adjuntar siguieron «apagados» **más de tres
minutos**, y **funcionaban igual al tocarlos**. Tamaños reales: fija de 177 a 258 KB, cineloop de
**7,0 MB** con 102 cuadros; el contador de espacio era correcto.

**TAREA A — LA BURBUJA SALÍA SÓLO CERRANDO UN CARTEL QUE TODAVÍA LLEGABA.** Con la tanda ya cerrada
`clnkTandaCerrar` pone `_clnkTanda` en `null`, así que la rama que la levantaba no entraba y el
cartel desaparecía entero: el médico que cerraba para despejar la pantalla perdía la única puerta a
sus archivos hasta el próximo «Ver lo que espera». Hoy `clnkAvisoCerrar(porMedico)` levanta la
burbuja **quieta y latiendo**, con el número de los **ids del grupo** y no de `tanda_imagenes`, que
incluye la cuarentena.
⚠️ **LAS DOS GUARDAS CONTRA LOS «DOS CARTELES CONTRADICTORIOS», LAS DOS MEDIDAS.** (1) Sólo los
**tres** caminos del médico pasan `true` —la ✕, el clic en el fondo y Escape—: `dstResumen` cierra
con «Entendido» **después** de adjuntar y `_clnkAvisoGrupo` seguía puesto ahí, así que una burbuja
levantada en cualquier cierre diría «Llegaron N archivos» sobre archivos recién adjuntados. (2) Los
cuatro destinos **sueltan** el grupo, así que no se puede resucitar un envío ya decidido ni cerrando
el resumen con la ✕. «Vista previa» **no** lo suelta: mirar no es decidir. (3) `_clnkPregAbierta`
la apaga mientras hay una pregunta anidada, donde `_clnkAvisoReponer` reabre el modal dos líneas
después.

**TAREA B — EL SONDEO OCIOSO BAJA A CUATRO SEGUNDOS, Y UNA PREMISA ESCRITA QUEDÓ DESMENTIDA.** El
comentario que fijaba los quince decía que bajarlo sería «**sin un solo beneficio clínico**»: la
medición del médico lo desmiente, porque lo que ve en esos quince segundos es la pantalla quieta con
sus imágenes ya llegadas. **El costo está medido**, que es lo que la tarea pide declarar: el cuerpo
de `GET /v1/estado` pesa **64 bytes** contra el conector falso (~150 en el contrato) y un turno
contra loopback tarda **1,5 ms** — de 4 a **15 pedidos/min**, de 0,25 a **0,94 KB/min**, de 0,12 a
**0,46 MB en ocho horas** y de 0,010 a **0,037 % de un hilo**. El de la tanda abierta **no se
movió**: sigue en los 4000 que el prompt 6 fijó entre 3 y 5 s, y `clnkSondeoMs()` sigue siendo el
dueño único aunque los dos valores ahora coincidan.

**TAREA C — LA REGLA QUE CIERRA LA TANDA ES DEL PUENTE, Y SON DOS MINUTOS.** `tanda_cierra` ya viene
calculado y `tanda_abierta` sale de compararlo con el reloj del puente (§P8). Los tres minutos que
el médico midió son esos dos **más** el turno de sondeo que tardaba en enterarse, sobre un envío
cuya **última** imagen llegó más tarde de lo que parecía.
⚠️ **NI EL SONDEO NI LA REAPERTURA DE LA BURBUJA LA REINICIAN, y esto se midió y no se supuso:**
ninguno de los dos toca `tanda_ultima`, que es de lo único de lo que cuelga el plazo.
Esta app **no puede** tocar el plazo del puente, así que lo que se agrega es una regla propia **más
corta** en una constante sola, `CLNK_SILENCIO_MS = 20000`, con **un solo dueño**
—`clnkSilencioCumplido`— leído por los **dos** caminos que deciden cuándo se puede decidir:
`clnkTandaAbierta`, que el sondeo consume en vez del `tanda_abierta` del puente, y `clnkGrupoListo`,
el filtro del aviso de siempre. Con la regla en uno solo, el cartel diría «Listo» mientras el aviso
sigue esperando dos minutos.
⚠️ **ESTO REVIERTE, POR ORDEN EXPRESA DEL MÉDICO, la regla del prompt 6 que decía «el plazo lo da
el puente y NO se duplica».** Lo que **no** cambia es que el puente sigue guardando los archivos su
plazo entero: no se borra ni se confirma nada antes de tiempo. Declarado en **P7-a**.
**FALLA HACIA «NO CERRAR»**: sin `tanda_ultima`, con una fecha que no se entiende o con la tanda
vacía devuelve `false` y manda el puente. Y **un PESTILLO** impide el ida y vuelta: una vez que la
app declaró cerrada una tanda no la vuelve a abrir, y lo que entra después **engorda** el cartel que
ya está en pantalla —la rama de actualizar, que retitula «Llegaron más imágenes del ecógrafo»—. El
pestillo se suelta cuando el **puente** dice que la tanda cerró.

**TAREA D — EL DEFECTO DE LOS «BOTONES PÁLIDOS QUE FUNCIONAN» ERA UNA LÍNEA.**
`_clnkAvisoApagarBotones` ponía la opacidad en un estilo **en línea** y `clnkAvisoAbrir` no la
borraba, así que el cartel siguiente nacía con `disabled = false` y la opacidad `.55` todavía
puesta. **Los dos caminos que lo producen, los dos sin pasar por `_clnkAvisoApagarBotones(false)`:**
`clnkBurbujaAbrir` —el que el médico usó— y la rama de ACTUALIZAR de `clnkRevisarImagenes`. Hoy el
aspecto va por una **clase** que la apertura limpia de los cinco en un solo lugar, y el apagado es
`disabled` de verdad más la clase: un botón deshabilitado no emite click, que es lo que impide el
estado al revés.
El cartel abierto deja de ser una pantalla sin nada que hacer: `CLNK_TANDA_BOTONES` pasa de cuatro
cadenas a **CINCO** entradas con su manejador, en el mismo orden que `dstPreguntar`, con los tres
destinos apagados y **Vista previa y Descartar vivos**, que piden la lista **recién al tocarlos**
(`_clnkTandaGrupo`).
⚠️ **`_clnkTandaEnPantalla` ES NUEVA Y HACE FALTA**: la vista previa reemplaza el cuerpo del modal,
y `clnkTandaCuerpo` —que no encuentra ahí su contador— lo **vacía** y repinta el dibujo encima,
borrándole al médico la tira que está mirando. La bandera viaja con el estado del aviso, así que
«Volver a la pregunta» devuelve también la capacidad de seguir actualizando el contador. Y
`clnkTandaCerrar` con la vista previa encima **no toca nada y no pierde la tanda**: con `_clnkTanda`
en `null` ese cartel se quedaba diciendo «Están llegando» para siempre.

**TAREA E — LOS NOMBRES QUE EL DATO TIENE EN EL ECÓGRAFO.** Los rótulos actuales **no se tocan**;
cada dato gana debajo una línea más chica, «En tu ecógrafo puede llamarse:», y el panel dice una
sola vez que **SCP = el equipo que recibe las imágenes (esta computadora)**. `_clnkDato` gana un
sexto argumento opcional, aparte de `nota` porque la dirección usa las dos a la vez.
⚠️ **SÓLO EL VINNO ESTÁ CONFIRMADO**, así que el panel **no dice de qué marca** es cada nombre:
dice «puede llamarse» y lista las formas. TC-975 lo mide buscando **once** nombres de marca y
exigiendo **cero**.

**TAREA F — «IMÁGENES SIN ESTUDIO» DE LA PESTAÑA IMÁGENES ESTABA DOS TANDAS ATRASADA.** Hay **dos**
pantallas que muestran la bandeja; ECO-CONECTOR-3 le agregó «Asignar» y ECO-CONECTOR-4 las
miniaturas **sólo a la de Guardados**, y la otra se quedó con texto y «Borrar» —su comentario
todavía decía «una miniatura invita a un gesto que todavía no existe», con las dos mitades de ese
argumento ya caducadas—. Hoy las dos usan el **mismo pintor** y ofrecen lo mismo.
**`clnkbBorrarUna(id, clase, k)` es nueva**: opera sobre el arreglo del registro —no sobre una
copia— y si no queda nada **borra el registro**. El visor gana «🗑 Borrar esta imagen», antes de
«Borrar el envío» porque es la acción más chica, con su confirmación propia.
⚠️ **NO TOCA NINGÚN ESTUDIO Y NO CONFIRMA NADA A CEIBOLINK, por construcción**: esta base no tiene
una sola ruta hacia `imgSlots` y los ids ya se confirmaron al entrar a la bandeja. TC-976 lo mide
censando **todos** los controles con id de la app antes y después y exigiendo que la cadena sea
idéntica.

**TAREA G — «NO PASA NADA AL INTENTAR MEDIR» ERA LITERAL.** El lightbox de una fija no tenía un
botón de medir, así que no había nada que tocar ni nada que dijera por qué. Hoy el mensaje exacto
—«Para medir, asignala a un estudio»— vive en **una** constante que leen un renglón a la vista y un
botón «📏 Medir».
⚠️ **EL BOTÓN VA SIN `disabled`**: uno deshabilitado no emite click, así que el médico tocaría el
único control que tiene que **explicarle** por qué está bloqueado y no pasaría nada. **La regla no
se toca**: las mediciones siguen viviendo dentro del estudio, y los cines siguen midiéndose —TC-977
lo fija con un control positivo que abre un cineloop y exige su botón de medir **y** la ausencia de
este mensaje—.

**TAREA H — LOS SEIS INTERMITENTES ERAN LA CDN, Y SE ARREGLÓ EN EL ARNÉS. P6-l QUEDA CERRADO.** La
causa es **una sola**: el caso corría antes de que la CDN entregara su biblioteca —«NO HAY jsPDF» en
TC-347, TC-348 y TC-350; `Chart is not defined` en TC-147— y **TC-99 caía por ARRASTRE**, porque
TC-147, del mismo lote, lanzaba a mitad del render del Laboratorio y dejaba esa pestaña a medio
pintar. Eso explica lo que P6-l no podía: **la CDN no está caída** —`curl` entrega el jsPDF en 0,43
a 0,56 s— y lo que no alcanzaba era **el momento en que el caso medía**.
`test_clinico.mjs` espera a **jsPDF, Chart y XLSX antes del primer caso**, con tope de doce
segundos, y **publica cuánto tardaron**. **No se tocó una línea de `index.html` ni una condición de
un caso**, que es lo que la tarea manda. ⚠️ **Y no se espera en silencio**: si alguna no llegó, el
encabezado lo dice y los casos salen rojos con su motivo. **Medido: los seis —más TC-143 y TC-535,
que esta casa declara con la misma causa— pasan 8 de 8 en CINCO corridas seguidas**, con las tres
bibliotecas en 250 a 500 ms; antes del arreglo, tres corridas dieron **1/6, 5/6 y 2/6**.

**COBERTURA: SIETE casos nuevos, TC-971 a TC-977**, uno por tarea de la A a la G, y los siete caen
contra `2a1bc79` con el mismo archivo de casos — tres por condiciones (ocho, dos y siete) y cuatro
por su **denominador declarado**, y **ninguno por excepción**. **TRES casos adaptados**: **TC-961**
en cinco condiciones —tres de cadencia, que leen la constante en vez del 15000 escrito a mano, y dos
**INVERTIDAS** por la tarea D: antes exigía que los cinco botones estuvieran apagados y ahora exige
que los dos de abajo **no** lo estén, así que falla por los dos lados—, **TC-970** y **TC-845** en
su condición de cadencia. Ninguno borrado y ninguno aflojado.
⚠️ **DOS DE LOS TRES ADAPTADOS LOS DESTAPÓ LA CORRIDA Y NO MI CENSO**: TC-970 y TC-845 afirmaban los
15000 con otros nombres de variable.

**LÍNEA BASE AL CIERRE: suite 979/985**, en **DIECIOCHO** lotes cubriendo los **985 casos
distintos** —contados con el patrón COMPLETO del id, **cero duplicados**—, en UNA sola pasada sobre
el árbol resellado, con los **985 ejecutados**, el md5 de `index.html` **idéntico** antes y después
(`cf41995d`), el pendrive `DISK_IMG` verificado **veinte** veces con sus **343** archivos de
`GEMS_IMG`, y **las tres bibliotecas de la CDN en los dieciocho lotes** —que es la tarea H
midiéndose a sí misma—. **Los siete casos nuevos y los tres adaptados, en verde.**
Los rojos son **seis**: los **cinco** que la orden declara conocidos —TC-182, TC-376, TC-406,
TC-551 y TC-903— y **TC-847**, que era **mío**: pasaba **aislado** y salía rojo en su **lote 15**.
Adaptado y vuelto a correr su lote entero: **55/55**, con el md5 del árbol idéntico al abrir y al
cerrar. **No se rehizo la pasada completa**, y se declara con su motivo: `index.html` **no cambió**
y el único archivo que se movió fue el de casos — el mismo criterio con que la 3A y el prompt 4 no
rehicieron la suya. **El estado real es 980/985 con los cinco rojos conocidos.**

⚠️ **ES LA SEGUNDA PASADA, Y LA PRIMERA NO SE INFORMA PORQUE DESTAPÓ UNA REGRESIÓN MÍA Y EL ÁRBOL
CAMBIÓ DESPUÉS.** Dio **976/985** con **nueve** rojos: los cinco conocidos y **cuatro** que pasan
contra `2a1bc79` con el mismo archivo de casos, o sea los cuatro de esta tanda, y los cuatro
fallando también **aislados**.
**TC-840 ERA UNA REGRESIÓN REAL DEL PRODUCTO Y SE ARREGLÓ EN EL PRODUCTO**: `clnkLeerAjustes`
borraba el mensaje de `cfg-clnk-amsg`, y a esa función la llama el rebote que el **sondeo** arma en
cada turno — con el sondeo a cuatro segundos, el mensaje «Guardado. Cambiar el nombre reinicia el
receptor: por unos segundos no entran imágenes, y hay que cargar el nombre nuevo en el ecógrafo» se
borraba en cuatro, y **no alcanzan para leer dos renglones de una instrucción**. Hoy la limpieza
vive en los **gestos** del médico —guardar y abrir el panel— y no en la lectura de fondo: queda
**mejor** que antes de la tarea B. El árbol se reselló por eso, de `v20261121-0202` a
`v20261121-0308`.
Los otros tres eran de los casos, y los tres quedaron adaptados **sin aflojar una condición**:
**TC-850 (G) INVERTIDO** —afirmaba que «Sin estudio» no tiene miniaturas, que es justo lo que la
tarea F cambió—, **TC-873 (F)** y **TC-847 (F)**, que miden llamadas **explícitas** y a los que el
sondeo de cuatro segundos se les metía en la ventana de medición.
⚠️ **Y TC-847 ENSEÑÓ DOS COSAS.** Una: **parar el temporizador NO alcanza** — un turno ya en vuelo
sigue su curso, porque `_clnkSondear` es `async`, así que lo que lo cierra es dejar la escena en
`vacio`. Dos: **el diagnóstico engañaba**, porque `clnkAvisoCerrar` esconde el modal pero **no
vacía el título ni el párrafo**, así que el caso informaba el texto del aviso **anterior** y parecía
que el cartel de imágenes estaba encima; lo que fallaba era que `clnkAvisarEquipoNuevo` **no vuelve
por el mismo equipo en la misma sesión** y un turno del sondeo ya había avisado.

**VERIFICACIÓN AL CIERRE. Semgrep 126 WARNING / 0 ERROR**, la línea base exacta. **Sin huérfanos
nuevos.** **17 de 17** bloques de JS inline parsean. **CELULAR: 38 ALTA**, la línea base exacta —y
ninguno es de este prompt: son los `input.ind-chk` de los acordeones de Evidencia, `#ecoHdrBurger` y
`#cfg-clnk-on`, que es el **M5-n** que decide el médico—. **CERO** `innerHTML`, `eval(` y
`new Function` nuevos, **cero** claves y contraseñas. **Excel en 457 columnas y CERO campos
guardados nuevos**, por construcción.

⚠️ **TRES TRAMPAS QUE ESTA TANDA PAGÓ.** (1) El **acento grave** dentro de mis propios comentarios,
por trigesimotercera tanda seguida: el guardián de `_insertar_p7.py` lo cazó dos veces **antes** de
insertar y `node --check` una tercera, después de un reemplazo que metió uno en un comentario ya
insertado. (2) La **barra invertida** de una expresión regular, que no sobrevive al template: el
guardián también la abortó. (3) **UNA NUEVA, y queda escrita**: `.btn` declara
`transition: opacity .15s`, así que un `getComputedStyle` **inmediato** devuelve el valor de
**arranque** y no el de destino — la clase ya estaba puesta y el `cursor` y el `filter` ya eran los
nuevos, y la opacidad daba 1. El caso salía rojo sobre una app que se porta bien, y buscar un
`!important` que no existe costó una corrida. Declarada en **P7-j**.

⚠️ **LA MUDANZA DE «ESTADO VIGENTE» A `docs/archivo/` TAMPOCO SE HIZO, y se declara en vez de
dejarlo pasar en silencio**: la orden no la pedía y el presupuesto se fue en las nueve tareas y su
verificación. Es la **decimoquinta** tanda seguida que la posterga. Lo que hay que mudar hoy es todo
lo anterior a **MEDIR-4a**, o sea de **MEDIR-3 hacia atrás**.

Lo declarado, en **P7-a** a **P7-m** —con **P6-l CERRADO** por la tarea H—; el mapa, en
`docs/mapa/p7-burbuja-silencio-botones.md`; la guía manual contra CeiboLink real, en
`docs/GUIA_PRUEBA_P7.md`; el corredor de lotes, en `scripts/_lotes_p7.sh`; el insertador de casos
con su guardián de acentos graves, en `scripts/_insertar_p7.py`.

**El cierre de P6-j y P6-k (2026-11-20) — el rebote del sondeo con la pestaña oculta y la escena
propia de TC-964.** DOS arreglos y CUATRO commits. Sello **`v20261120-1207`**, md5 **`555ee5c0`**,
**187.983** líneas. Línea base **`ad38d37`**, el cierre del prompt 6. **Sin push: lo corre Maicol.**

**P6-j — LA GUARDA DEL DISPARO GANA UNA LÍNEA, Y NADA MÁS.** TC-845 (D) exigía **cero** pedidos al
conector con la pestaña del navegador oculta y salían **cuatro** —la cadena entera de
`clnkLeerEstado`—. La compuerta del sondeo funcionaba y el temporizador quedaba apagado: lo que
aterrizaba era el **rebote de 400 ms** que el bloque D arma en **cada** turno, armado con la pestaña
a la vista y disparado adentro de la ventana en que ya no lo está. Hoy la guarda del disparo
pregunta también por **`document.hidden`**.
⚠️ **NO SE TOCÓ `clnkPanelALaVista`, Y ES LA DECISIÓN DE FONDO**: esa función mide la **caja del
nodo** —y hace bien, porque esconder la pestaña del navegador no le quita la caja: medido, devuelve
`true` con la pestaña oculta— y la leen **seis** sumideros donde esa pestaña está a la vista por
definición. Y **no sirve `clnkSondeoDebe()`** en su lugar: pide además el vínculo, así que
cambiaría la conducta de esos seis.
**Medido con `scripts/_probe_p6_845.mjs`**, con su control de la hipótesis: la escena 1 pasa de
**cuatro pedidos a CERO**, con `clnkPanelALaVista()` **todavía en `true`** ahí —o sea que esa
función no cambió—, y la escena 2 —el rebote disparado **antes** de ocultar— sigue en **cero**.

**P6-k — UNA ESCENA CON IDS PROPIOS, Y `index.html` NO SE TOCA.** TC-970 pasaba **3 de 3 aislado** y
salía rojo en el lote 18 porque el bloque **D de TC-964** —del mismo lote— usaba la escena
`unaSuelta` y le **gastaba el aviso**: el aviso no vuelve por las mismas imágenes en la misma
sesión y los 978 casos corren en UNA página. El conector falso gana **`unaSuelta4`** —id `img_z4`—
y el bloque apunta ahí. **Quinta vez que esta casa paga esa trampa**, y la quinta escena con id
propio por el mismo motivo.
⚠️ **Y AL ESCRIBIR SU COMENTARIO PAGUÉ EL ACENTO GRAVE DENTRO DEL CUERPO DE UN CASO**, por
trigesimosegunda tanda seguida. `node --check` lo cazó con un «missing ) after argument list» que
apuntaba a la línea del `caso(` y no a la del acento.

**LO MEDIDO.** **TC-845, TC-964 y TC-970 pasan 1/1 corridos aislados**, y el grupo **TC-961 a
TC-970 da 10/10**. **Semgrep 126 WARNING / 0 ERROR**, **celular 38 ALTA**, **sin huérfanos nuevos**
y **17 de 17** bloques de JS inline parsean —las cuatro la línea base exacta, corridas **una por
vez** con la máquina sola—.

**Suite completa: 966/978**, en los **dieciocho** lotes, en UNA sola pasada sobre el árbol sellado,
con los **978 ejecutados**, el md5 de `index.html` **idéntico** antes y después (`555ee5c0`) y el
pendrive `DISK_IMG` verificado **veinte** veces con sus **343** archivos de `GEMS_IMG`. **TC-845 y
TC-970 en verde**, que es lo que esta pasada venía a arreglar.
Los rojos son **doce**: los **cinco** conocidos —TC-182, TC-376, TC-406, TC-551 y TC-903—,
**TC-753** y **SEIS** intermitentes.
⚠️ **TC-753 TENÍA RAZÓN, Y ES UN COSTO DE ORDEN QUE QUEDA ESCRITO**: la pasada corrió **antes** de
escribir la documentación, así que el árbol ya estaba sellado en `v20261120-1207` y `CLAUDE.md`
todavía publicaba `v20261120-0019`. Con la documentación al día **vuelve a verde** y su **lote 14 se
rehizo entero**. **El sello se escribe acá ANTES de la pasada, o el caso sale rojo con razón.**
⚠️ **Y LOS SEIS INTERMITENTES —TC-99, TC-147, TC-347, TC-348, TC-350 y TC-796— NO SON DE ESTOS DOS
ARREGLOS, y está medido de la forma que esta casa manda**: en un worktree sobre **`ad38d37`** —el
árbol **anterior**, md5 `0a1b2c03`, el mismo que la pasada de ayer dejó en 971/978—, con el
**mismo** archivo de casos y el mismo conector falso y sólo el `index.html` distinto, los seis
fallan **6 de 6**; en el árbol vivo esa misma selección da **5 de 6**, o sea que el viejo falla
**más**. Y los seis fallan **corridos estrictamente solos**: **0/1 los seis**, así que no es
sensibilidad de lote.
**La causa visible es la CDN sin llegar a tiempo** —TC-347 lo dice con todas las letras, «flujo=NO
HAY jsPDF», el mismo síntoma que TC-535 y TC-143 ya tienen declarado— y flapea: tres corridas de la
misma terna dieron **1/3** y **0/3**.
⚠️ **PERO LA CDN NO ESTÁ CAÍDA, Y ESO QUEDA SIN EXPLICAR**: `curl` le saca el jsPDF en **0,43 a
0,56 s**, y una sonda propia que abre `index.html` en el mismo Chrome y espera **seis segundos**
encuentra los **cinco** scripts en **200** y `jspdf`, `Chart` y `XLSX` **definidos**. El archivo
llega; lo que no alcanza es el momento en que el caso mide. **TC-796 falla por otra cosa** —«0
editables»— y **TC-99** por una condición de contenido, así que no todos comparten la causa.
**Ninguna condición se aflojó y ningún caso se tocó**: los seis quedan declarados en **P6-l**, con
lo que falta medirles —cuatro corridas de cada lado, que es lo que esta casa exige para un
intermitente—. **TC-99** y **TC-147** ya estaban declarados como intermitentes; los otros cuatro no,
y quedan declarados ahora.

Lo declarado, en **P6-j** y **P6-k** (RESUELTOS), **P6-l** (los seis intermitentes) y **P6-m**
(TC-753); el mapa, en `docs/mapa/p6-tanda-burbuja-formatos.md` § 4; la guía, en
`docs/GUIA_PRUEBA_P6.md`, con su paso de la pestaña oculta.

**El prompt 6 (2026-11-20) — la tanda, la burbuja, los formatos del buzón y los datos del
ecógrafo.** ONCE bloques, A a K, y los once se hicieron. OCHO commits, uno por bloque o por par de
bloques. Sello **`v20261120-0019`**, md5 **`0a1b2c03`**, **187.974** líneas. Línea base
**`7873930`**, el cierre del prompt 5 y a la vez `origin/main`. **Sin push: lo corre Maicol.**

**NADA CLÍNICO SE MOVIÓ, y es medible**: cero cortes, cero umbrales, cero fórmulas. Lo que este
prompt movió son textos, un ruteo por formato, una cadencia de sondeo y dos lecturas nuevas del
canal local. Y **CERO** `input`, `select` y `textarea` nuevos con `id`, que deja todo esto fuera del
censo del estudio y del Excel **por construcción**: cero campos guardados nuevos y las **457**
columnas quietas.

**EL BLOQUE 0 — LA CAUSA DEL PUNTO D ERAN DOS COSAS INDEPENDIENTES, Y LA HIPÓTESIS DE LA ORDEN
EXPLICABA LA MITAD.** Reproducido con el gesto del médico en el Chrome del sistema, no leyendo:
(1) **`_clnkAvisadas` no se vaciaba al descartar**, y el puente deriva el `id` de cada imagen del
**contenido** del archivo, así que el mismo archivo re-enviado vuelve con el **mismo id** —para
`clnkRevisarImagenes` eso es indistinguible de «ya se avisó»—; con la lista vaciada a mano y **sin
tocar nada más** el aviso volvía, y con ids nuevos salía igual. (2) **El sondeo NUNCA refrescaba
la tarjeta**: con el panel a la vista y la lista vacía decía «sin imágenes esperando», entraban
**OCHO** y se sondeaba, y seguía diciendo lo mismo; sólo `clnkLeerEstado()` a mano la movía.
**Arreglar sólo la primera habría dejado el segundo síntoma intacto.**

⚠️ **Y `dstLeer` YA FUNCIONABA, lo que cambió qué había que hacer en el bloque E:** la puerta de
los tres sumideros clasifica por los **BYTES** con `_firmaArchivo`, así que un JPG ya entraba como
imagen y un MP4 como video. Lo roto eran `_clnkPrevMini` y `clnkPrevAbrir`, que llamaban a
`_dcmImgLeer` **sin preguntar** — y esa función lanza, textuales, los dos mensajes que el médico
vio: «no tiene la marca «DICM» en el byte 128» y «el archivo es demasiado corto para ser un DICOM».
**Lo roto era mirar, no adjuntar.**

**BLOQUE A — EL CARTEL SALE CON LA PRIMERA IMAGEN.** `clnkTandaDe(d)` lee los cuatro campos de
`GET /v1/estado` y pregunta por el **TIPO** de `tanda_abierta` y no por su verdad: con un `!`, un
puente que no manda el campo y uno que manda `false` se leerían igual. El cartel sale con el dibujo
de las imágenes viajando —SVG por `createElementNS`, cero `innerHTML`— y los cuatro destinos
**apagados**; al cerrar la tanda dice «Listo: el envío terminó.», los botones se prenden y el
dibujo **se para**. El sondeo pasa a **4 s** mientras hay tanda abierta, con `clnkSondeoSync`
todavía idempotente.
⚠️ **DURANTE LA TANDA ABIERTA SOLO SE USA `GET /v1/estado`**, que no lleva token y pesa ~150 bytes:
por eso el cartel dice **cuántos** y no **de quién** —esa ruta a propósito no dice el equipo—. Con
un sondeo de cuatro segundos pidiendo la lista con token, el panel bajaría el inventario del
conector quince veces por minuto.
⚠️ **Y DICE «ARCHIVOS» Y NO «IMÁGENES»**, apartándose de la frase de ejemplo del contrato:
`tanda_imagenes` cuenta TODO lo que entró, y «están llegando 4 imágenes» sobre un PDF y un TXT es
exactamente el defecto que el médico reportó.
⚠️ **EL PLAZO LO DA EL PUENTE Y NO SE DUPLICA.** `CLNK_VENTANA_MS` queda **sólo** como camino viejo.

**BLOQUE B — LA BURBUJA.** Con la ✕ y la tanda abierta el cartel se **achica** a una burbuja abajo
a la derecha, con la misma animación —el mismo dibujo, reusado— y el número subiendo; al cerrar la
tanda dice «Llegaron N archivos — tocá para elegir» y **late** con un ciclo de 2,6 s. **NO SE
REABRE SOLA.**
⚠️ **EL RINCÓN ESTÁ MEDIDO:** a 1280×900 no hay un solo elemento fijo ni pegajoso ahí —el toast
vive abajo **al centro** en la capa 999— y cero botones tienen su centro en el rincón de 170×170.
La burbuja va en la capa **690**: por debajo de los modales (700) y del toast (999), **sin moverle
la capa a nadie**.
⚠️ **DOS DEFECTOS REALES QUE LA SONDA DESTAPÓ Y LA LECTURA NO:** el cartel **volvía solo** en el
turno siguiente al cierre de la tanda —el turno caía en `clnkRevisarImagenes`, que no sabe nada de
la burbuja, así que «no se reabre sola» duraba UN turno— y a 1000 px la burbuja **tapaba TRES
botones** del selector de estilo del informe, medido con `elementFromPoint`. Lo segundo no se
cierra moviéndola: la burbuja **reserva su alto** en el cuerpo, con el alto **medido** y no escrito,
y lo **devuelve** al irse.

**BLOQUE C — EL CARTEL CUENTA LAS CUATRO CLASES.** `dstCuenta` contaba **dos** —«video» era un
cineloop y TODO LO DEMÁS una fija— así que un TXT salía como «1 imagen». `_clnkClase` es el dueño
único, con las cuatro **disjuntas** y en un orden que no es arbitrario: informe manda sobre todo
—un PDF tampoco se ve, pero «1 informe» dice MÁS—, después `se_puede_ver === false` manda sobre el
tipo —un TIF llega con `tipo: 'imagen'`—, después video, y lo que queda es imagen. El equipo se
nombra con `clnkNombreEqDe`: apodo, si no `nombre_para_mostrar`.
⚠️ **SE COMPARA CONTRA `false` Y NO CON UN `!`:** contra un puente 1.1 el campo no viene y
`!undefined` es verdadero — todas las imágenes de un DICOM se contarían como «no se pueden ver».
⚠️ **Y LA CUARENTENA SE CUENTA SOBRE **TODAS** LAS TANDAS, que salió de medir el contrato:** es por
equipo y un lote es por equipo, así que `en_cuarentena` de un grupo **visible** es siempre cero, y
contándolo por lote la frase de §P8 quedaba **inalcanzable**.
**Y `clnkAgrupar` PASA A AGRUPAR POR EL `lote` DEL PUENTE**, que es lo que §P8 prohíbe duplicar con
todas las letras.

**BLOQUE D — LAS REPETIDAS VUELVEN A AVISAR.** `clnkDescartar` **olvida** el id que acaba de
destruir y lo **anota** en `_clnkDescartadas`, que es lo que permite decirle al médico que ya las
había descartado y que el ecógrafo las volvió a mandar; y el sondeo llama a `clnkRefrescar`, que
trae sus dos guardas puestas.
⚠️ **NO ALCANZA CON VACIAR LA LISTA ENTERA, y por eso hay DOS listas:** sin `_clnkAvisadas` un aviso
cerrado con la ✕ vuelve cada quince segundos. Se olvidan **sólo** los ids que se destruyeron, y
**sólo** si el puente los borró de verdad — un 503 deja la imagen allá. Los dos controles están en
el caso.

**BLOQUES E y F — EL FORMATO DECIDE CÓMO SE MIRA.** `clnkFmtDe` es el dueño único de la ficha de
los doce formatos del §P2, con **cuatro** salidas: DICOM al visor de siempre, imagen al lightbox,
video al reproductor **sin «Capturar frame»** —mirar no es decidir—, y lo que no se ve **no se baja
y no se abre**. El reproductor se partió en dos (`videoVerBlob(blob, conCaptura)`) sin cambiarle
una línea de comportamiento. Los formatos que no se ven salen en una **tarjeta** con su ícono y su
sigla, la lista de los aceptados **derivada de la tabla**, y **SOLO el botón Descartar** —lo que
reemplaza lo que el documento del puente propone sobre adjuntarlos—.
**Una foto del buzón entra a los TRES destinos, y un VIDEO también entra a un estudio guardado** —
el camino que **no existía**: `CeiboVideo` sólo tenía `guardar`, que **reemplaza** todos los videos
del estudio.
⚠️ **UN CINELOOP DICOM PERDÍA SU MARCA 🎬** cuando el icono salió sólo del formato: los seis de la
tira de TC-877 salieron 📷. Era una **pérdida** de información, no una mejora.
⚠️ **Y UNA CABECERA `ftyp` DE 32 BYTES NO ES UN VIDEO:** `_firmaArchivo` la reconoce —lo único que
mide son cuatro bytes— pero `_videoPoster` no saca un cuadro de algo sin un solo fotograma. El
falso lleva ahora un MP4 **real** de 1.491 bytes, un color de 32×32 por dos décimas generado con
ffmpeg y embutido como texto. **Sin un dato de nadie: es un color.**

**BLOQUES G, H e I.** Cada dirección con su rótulo —**cable** o **Wi-Fi**, y **«desconocido» NUNCA
se escribe**—, las sin enlace **apagadas** pero legibles y copiables, `null` **normal** porque un
dato que falta no es un «no», y las 169.254 al final con una partición **estable**: lo único que
esta pantalla mueve. Panel de carpeta compartida con la frase de la contraseña y **CERO campos**
para escribirla, medido. El umbral del aviso de espacio lo da **`bytes_aviso`** con dos guardas, y
el tope se dice tal cual lo informa el puente —**dejó de ser 2 GB fijos**—. Y la fila donde el
médico aprieta PERMITIR dice el nombre en criollo y distingue **«copiado a mano»** de **«por
red»**, que es la diferencia que §P5 explica y que no se puede omitir.

**BLOQUE J — LA REGLA VIEJA NECESITABA CÓDIGO NUEVO.** Los otros ocho bloques fueron dejando su
camino viejo, pero faltaba el aviso: §P8 describe **dos** reglas y la de la 1.3 es «avisar recién
cuando `lote_cierra` ya pasó», y la app avisaba en el acto. `clnkGrupoListo(g)` toma el
`lote_cierra` **más nuevo** del grupo —el cierre **se corre** cuando entra otra imagen— y sin el
campo el grupo está **listo**, que es la regla de antes de la 1.3: hacerlo esperar lo dejaría sin
avisar nunca.

**EL ARNÉS:** el conector falso pasa a hablar el contrato **1.4** con una **compuerta por versión**
—cada campo detrás de la versión que lo trajo— así que una sola sonda mide también el bloque J.
Suma los cuatro campos de la tanda, `bytes_aviso`, la lista `tandas` con su lote derivado como el
puente lo deriva, `nombre_para_mostrar`, `origen`/`formato`/`se_puede_ver`/`lote`, el
`tipo`/`enlace` de cada dirección, `carpeta_compartida`, el `Content-Type` por formato con
`nosniff`, los dos equipos de carpeta y **dieciséis escenas nuevas**.
⚠️ **Su `t0` pasó de tres a cinco minutos:** con tres, las escenas de antes del prompt 6 quedaban
con la tanda **abierta** y sus botones apagados.

**LOS DOS MOTORES:** Chrome del sistema y WebKit, en 1440, 1280, 1000, 768 y 390 px, en los dos
temas **reales** —puestos con `ett_theme` más `loadTheme()` y **devueltos** por la sonda—:
**32 cruces**, **UNA** sola combinación de valores, con **CERO errores de consola y de página**.
Las **dos** diferencias son declaradas: con «reducir animaciones» del sistema las dos animaciones
se detienen **dejando el dibujo visible** (`animando` 3 → 0 y el latido en `none`), que es lo que el
bloque B pide; y la burbuja mide **46 px en Chrome y 47 en WebKit**, que es métrica de fuente.
⚠️ **WebKit de Playwright no es Safari, y se declara.**
⚠️ **Y LA PRIMERA CORRIDA DE ESA SONDA MIDIÓ SOBRE UN DENOMINADOR VACÍO**: con `equipos: 5` viene
un equipo esperando decisión y **el aviso de equipo nuevo gana**, así que `svg:false` y `viajan:0`
en los 32 — que se lee igual que «el cartel no sale». Es `equipos: 4`.

**Cobertura: TC-961 a TC-970**, uno por bloque, cada uno cayendo contra el árbol anterior de **su**
bloque. **UN caso adaptado, TC-839**: su control positivo afirmaba el literal `'1.1.0'` del conector
falso, que esta tanda llevó a 1.4; hoy lee la versión **de la escena**, así que un cambio futuro de
versión no lo hace caer por algo que no es suyo.

**Línea base al cierre: suite 971/978**, en **DIECIOCHO** lotes cubriendo los **978 casos
distintos** —contados con el patrón COMPLETO del id, **cero duplicados**—, en UNA sola pasada sobre
el árbol sellado, con los **978 ejecutados**, el md5 de `index.html` **idéntico** antes y después
(`0a1b2c03`) y el pendrive `DISK_IMG` verificado **veinte** veces leyendo DICOMDIR, con sus **343**
archivos de `GEMS_IMG` declarados en cada control.
Los rojos son **siete**: los **cinco** que esta casa ya declara conocidos —TC-182, TC-376, TC-406,
TC-551 y TC-903— **más DOS que son MÍOS y quedan ABIERTOS, declarados y no tapados**:

- ⚠️ **TC-845 es un DEFECTO REAL de esta tanda, y está medido con control de la hipótesis.** Su
  bloque (D) exige **cero** pedidos con la pestaña del navegador oculta y encuentra **cuatro**:
  `/v1/estado`, `/v1/conexion`, `/v1/equipos` y `/v1/ajustes`, que son la cadena entera de
  `clnkLeerEstado`. **La compuerta del sondeo funciona** —`clnkSondeoDebe()` da falso y
  `_clnkSondear` no manda nada propio—; lo que aterriza es el **rebote de 400 ms** que el bloque D
  arma en **cada** turno al llamar a `clnkRefrescar()`, armado mientras la pestaña estaba a la
  vista y disparado adentro de la ventana en que ya no lo está. Su guarda al disparar,
  `clnkPanelALaVista()`, sigue diciendo que **sí**: mide la **caja del nodo**, y esconder la pestaña
  del navegador no le quita la caja —medido, `true` con la pestaña oculta—. El comentario de esa
  función dice «el médico pudo apagar el módulo o **cambiar de pestaña**», y la pestaña que no ve es
  justamente la del navegador. **Falla contra el lado barato**: es **una** ronda de cuatro pedidos a
  loopback, una sola vez, y **el temporizador sigue apagado**, así que no hay sondeo que siga
  corriendo. Medido: contra `7873930`, con el **mismo** archivo de casos y el mismo conector falso,
  TC-845 pasa; y dejando que el rebote dispare **antes** de ocultar, con la pestaña oculta da
  **cero**. **NO se arregló en esta pasada**, por la regla del prompt de informar antes de tocar
  código nuevo. El arreglo es **una línea**: agregarle a la guarda del disparo la visibilidad de la
  pestaña del navegador. **No se toca `clnkPanelALaVista`**, que la leen seis sumideros donde la
  pestaña del navegador **está** a la vista por definición. → **P6-j**
- **TC-970 es sensibilidad de lote y es de mi arnés, no de la app**: pasa **3 de 3 corrido aislado**
  y sale rojo en su lote por la condición del 1.1.0. La causa está medida: **TC-964**, del mismo
  lote y de esta misma tanda, usa la escena `unaSuelta` antes de pasar a la suya, y el aviso **no
  vuelve por las mismas imágenes en la misma sesión** —los 978 casos corren en UNA página—. Es la
  quinta vez que esta casa paga esa trampa, y mi propio bloque D ya la había pagado creando
  `unaSuelta3`. El arreglo es del conector falso y del caso, **no de `index.html`**: una escena con
  ids propios. → **P6-k**

**Ningún rojo nuevo ajeno a la tanda**, y los otros nueve casos nuevos y el adaptado en verde.

**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta. **Sin huérfanos nuevos.** **17 de 17
bloques de JS inline parsean.** **CELULAR: 38 ALTA**, la línea base exacta. **CERO `eval(` y
`new Function` nuevos**, **cero** claves y contraseñas, **cero** `iframe` nuevos y **UNA** sola
aparición de `innerHTML` en el diff, que es el **comentario** que declara que el dibujo se arma con
`createElementNS`. **Excel en 457 columnas y CERO campos guardados nuevos**, por construcción.
⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS, VEINTIDÓS VECES EN ESTA TANDA** —en el
cuerpo de seis casos—, por trigésima primera tanda seguida. Lo que lo cerró es de método: el cuerpo
de cada caso se escribe en **su propio archivo** y lo inserta `insertar.py`, que los cuenta y
**aborta** antes de insertar nada.
⚠️ **Y LA SUITE SE CREYÓ COLGADA SIETE HORAS POR UNA TRAMPA DEL VIGILANTE, NO DE LA SUITE**: el
`until ! pgrep -qf "_lotes_p6.sh"` que esperaba su fin **se empareja a sí mismo** —su propia línea
de comando contiene esa cadena—, así que no termina nunca. La suite había cerrado a la hora.

El mapa, en `docs/mapa/p6-tanda-burbuja-formatos.md`; el inventario del bloque 0, en
`docs/INVENTARIO_P6.md`; lo declarado, en **P6-a** a **P6-k**; la guía manual contra CeiboLink
1.4.0 real, en `docs/GUIA_PRUEBA_P6.md` (**14** pasos; **15** desde el cierre de P6-j); las sondas, en `scripts/_probe_p6base.mjs`,
`_probe_p6a.mjs`, `_probe_p6b0.mjs`, `_probe_p6b.mjs`, `_probe_p6dos.mjs` y
`_probe_p6_845.mjs` —la del defecto—, cada una con su cuerpo aparte; el corredor de lotes, en
`scripts/_lotes_p6.sh`.

**El prompt 5 (2026-11-19) — la calibración en milímetros, el cartel que tapaba el visor, los dos
textos de CeiboLink y «Ir al estudio».** CUATRO arreglos chicos y un commit. Sello
**`v20261119-1634`**, md5 **`6ff0372e`**, **186.658** líneas. Línea base **`35a7c97`**, que era a
la vez `origin/main` y el último commit pusheado. **Sin push: lo corre Maicol.**

**NADA DE CÁLCULO SE MOVIÓ, y es medible**: cero cortes, cero umbrales, cero fórmulas, cero
unidades internas. Lo que cambió son **textos**, un **orden de capas** y **dos líneas de
navegación**. Y **CERO** `input`, `select` y `textarea` nuevos con `id`, que deja todo esto fuera
del censo del estudio y del Excel **por construcción**: cero campos guardados nuevos y las **457**
columnas quietas.

**PUNTO 1 — LA CALIBRACIÓN A MANO HABLA EN MILÍMETROS EN LOS DOS LUGARES, Y EL NÚMERO HAY QUE
ESCRIBIRLO.** El cartel de la guía decía «escribí cuántos **centímetros** hay entre los dos» y el
cuadro que aparecía después preguntaba «en **milímetros**» **con «10» ya escrito**: quien leía el
cartel y aceptaba ese 10 se quedaba con la escala **diez veces mal**, y desde ahí cada distancia de
esa imagen salía diez veces chica **con el aspecto de un número medido**. No hay segunda red: en
una fija del ecógrafo la escala manual es la única que esa imagen tiene.
El `prompt` nativo se reemplazó por un cuadro propio —`_medCalPedirMm`, que devuelve una promesa—
porque un cuadro del navegador **no puede** llevar la unidad al lado ni un botón que se niegue a
aceptar un campo vacío. **El campo nace vacío**, el botón **arranca apagado** y se prende recién
con un número mayor que cero, al lado dice **mm** y debajo **«1 cm = 10 mm»**. La confirmación
—**«Escala fijada: la línea marcada = N mm»**— sale del **dueño único** `_medCalFrase` y la dicen
el aviso del momento **y** el panel guía cada vez que se vuelve a medir, delante del factor por
píxel, que se queda porque es lo único que permite auditar una medición.
⚠️ **NI UN SOLO `id` EN SUS NODOS**: el censo, el Excel y `limpiarCampos` recorren `input[id]`, así
que un campo con id entraría a las 457 columnas **por existir**. Se alcanza por `data-med-calmm`,
el mismo recurso que el selector de cineloop — y es lo que permite que la prueba lo maneje **con el
gesto real**, escribiendo y apretando, en vez de sustituir una función del navegador.
⚠️ **LA VISTA SE CAPTURA ANTES DEL `await` Y SE VUELVE A ENTRAR EN ELLA PARA ESCRIBIR.** `cv.onclick`
va envuelto en `_vBind`, cuyo `finally` repone la vista anterior en cuanto la parte **sincrónica**
vuelve: con un `await` en el medio, calibrar en la vista B escribiría en la **A**. Con el `prompt`
nativo el problema no existía porque bloqueaba el hilo — es el precio de haberlo cambiado, y es la
misma trampa que «Listo» del Simpson y `vistaCerrarUna` ya pagaron. Y **se vuelve a mirar el estado
después del `await`**: si la imagen cambió, `medCambioDeImagen` ya apagó `_medCalibrando` y el largo
recién escrito es de una imagen que ya no está. **Falla hacia NO calibrar.**
El texto de la **velocidad** nombra ahora su propia unidad —**m/s**, la que su cuadro pide— y de
paso deja de describir mal el mecanismo de MEDIR-3: son **dos valores cualesquiera** y no «el cero
y otro». **La velocidad sigue con dos `prompt` nativos** y el **eje del tiempo sigue sin calibrarse
a mano** (**P5-d**, **P5-e**).

**PUNTO 2 — EL CARTEL DE LA VISTA PREVIA DEJA DE TAPAR LA IMAGEN, Y LA CAUSA ERA ORDEN DE CAPAS.**
`#clnkav-ov` vive en la **capa 700**; el visor de cineloop en la **400** y el lightbox de una fija
en la **402**, así que el visor se abría **debajo** y la caja opaca de 440 px le tapaba el centro.
**No es de un sistema operativo**: por eso pasaba igual en Windows y en Mac. Hoy
`_clnkPrevTapar()` lo **esconde** —y no lo cierra: `clnkAvisoCerrar` apaga el estado, **olvida el
grupo** y borra los cinco manejadores, con lo que «← Volver a la pregunta» se quedaría sin nada a
donde volver— y `clnkPrevDestapar()` lo repone desde los **dos** cierres de visor.
⚠️ **NO SE TOCÓ LA CAPA DE NINGÚN MODAL**, que es la otra forma de arreglarlo y pondría el visor por
encima de todo lo demás. ⚠️ **SE TAPA DESPUÉS DE ABRIR EL VISOR**: si el visor no llegó a abrirse,
el cartel se queda visible, que es el lado seguro. ⚠️ **Y NO REPONE UN CARTEL QUE YA SE CERRÓ**: con
`_clnkAvisoAbierto` en falso, reponer el `display` dibujaría un **modal fantasma** con sus botones
apuntando a una pregunta que ya no existe.

**PUNTO 3 — LOS DOS TEXTOS DE LA TARJETA.** «Es la que conviene dar.» pasa a **«CeiboLink sugiere
ésta.»**: la marca de `probable` la pone **el conector** y esta app no la puede verificar —no sabe
si el adaptador que el sistema llama «Wi-Fi» es inalámbrico, ni al revés—, así que dicho como
recomendación propia un acierto y un error se leen igual. Y el mensaje de la vinculación **deja de
quedar pegado**: `_clnkVmsgLimpiar` lo vacía en **un** lugar y lo llaman «🔄 Actualizar» —que pasó a
tener su propia función— y la apertura del panel.
⚠️ **EL VACIADO NO VA DENTRO DE `clnkLeerEstado`, Y ES LA DECISIÓN DE FONDO**: `clnkVincular` y
`clnkDesvincular` escriben su mensaje y **la llaman al final**, así que vaciarlo ahí borraría el
resultado que acaban de escribir. **TC-959 lo fija con un control explícito.**

**PUNTO 4 — «Ir al estudio» ABRE EL ESTUDIO, Y LA CAUSA ESTÁ MEDIDA.** `igImgVisorCerrar` pone
`_igVisor` en `null`, y el manejador leía `_igVisor.id` **después** de llamarla: el **TypeError** se
llevaba el manejador entero, la imagen se cerraba —esa parte sí corría— y `verDetalleInforme` **no
llegaba a correr nunca**. Reproducido contra `35a7c97`: `Uncaught TypeError: Cannot read properties
of null (reading 'id')`.
⚠️ **Y DOS FUNCIONES MÁS ABAJO, `igImgVisorMedir` YA TENÍA EL ARREGLO ESCRITO CON SU COMENTARIO
explicando esta misma trampa**: eran las mismas dos líneas, una con la copia del id y la otra sin
ella — por eso «Medir» abría el estudio y «Ir al estudio» no. El arreglo es copiar el id a una local
antes de cerrar, **no toca ninguna otra pantalla** y **«Medir» no se tocó**, por orden expresa.

**Cobertura: TC-957 a TC-960**, los cuatro cayendo **0/4 contra `35a7c97`** con el mismo archivo de
casos —tres por su denominador declarado y **TC-960 por sus condiciones reales, con la excepción
en la mano**—. **DOS casos adaptados: TC-187**, que pasa a manejar el cuadro propio con el gesto
real y gana una condición, y **TC-838**, **INVERTIDO** (exige la frase nueva **y** que la vieja ya
no esté); los dos caen también contra la línea base.
⚠️ **TC-187 ES SENSIBLE AL LOTE Y NO ES DE ESTA TANDA, y está medido**: con `--solo` falla por
cuatro condiciones de su **primer** bloque —el de la escala del archivo, que esta tanda no toca— y
falla **igual, por las mismas cuatro y con la misma tolerancia, contra el árbol anterior y con el
archivo de casos anterior**. Corriendo solo, el canvas no tiene ancho útil y los dos clics se mapean
al mismo punto. **En su lote sale verde** (**P5-a**).
⚠️ **Y EL SUSTITUTO DEL `prompt` SE DEJÓ PUESTO EN TC-187 COMO RED**: contra un árbol viejo el cuadro
nativo **bloquea la página para siempre** y la batería entera queda colgada esperando un clic que
nadie da. **Lo pagó una corrida de verificación de esta tanda.**

**Línea base al cierre: suite 963/968**, en **DIECIOCHO** lotes cubriendo los **968 casos
distintos** —contados con el patrón COMPLETO del id, **cero duplicados**—, en UNA sola pasada sobre
el árbol sellado, con los **968 ejecutados**, el md5 de `index.html` **idéntico** antes y después
(`6ff0372e`) y el pendrive `DISK_IMG` verificado **veinte** veces leyendo DICOMDIR, con sus **343**
archivos de `GEMS_IMG` declarados en cada control. Los rojos son **TC-182, TC-376, TC-406, TC-551 y
TC-903**, los cinco que esta casa ya declara conocidos. **NINGÚN ROJO NUEVO**, y los cuatro casos
nuevos, los dos adaptados y **TC-753** en verde.

⚠️ **Y EL LOTE 18 SE REHIZO ENTERO DESPUÉS DE LA PASADA, con su motivo**: al revisar la cobertura
se vio que TC-958 ejercitaba **un solo** visor —el del cineloop— y la vista previa abre **dos**,
porque el lightbox de una imagen fija es otro nodo con su propia capa y su propio cierre. O sea que
la mitad del arreglo del punto 2 estaba sin cubrir y el caso no lo decía. Se le agregaron dos
condiciones y el lote entero volvió a correr: **33/33**, con el md5 de `index.html` **idéntico**
al abrir y al cerrar. **No se rehizo la pasada completa**: `index.html` no cambió y el único
archivo que se movió fue el de casos. Es el mismo criterio con que la 3A y el prompt 4 no
rehicieron la suya.

**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta. **Sin huérfanos nuevos.** **17 de 17
bloques de JS inline parsean.** **CELULAR: 38 ALTA**, la línea base exacta. **CERO `innerHTML`,
`eval(` y `new Function` nuevos** y cero claves ni contraseñas.
⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS, TRES VECES EN ESTA TANDA** —en el cuerpo de
dos casos y en una adaptación—, por trigésima tanda seguida. Las tres las cazó el guardián que
cuenta los acentos graves **antes** de insertar, más `node --check`.

El mapa, en `docs/mapa/p5-calibracion-capas-navegacion.md`; lo declarado, en **P5-a** a **P5-g**;
la guía manual, en `docs/GUIA_PRUEBA_P5.md` (**14** pasos); el corredor de lotes, en
`scripts/_lotes_p5.sh`.

**El prompt 4 (2026-11-18) — la diástole sin conteos, la dobutamina, el TRIV, Referencias y el
aviso de independencia.** NUEVE puntos y SEIS commits de código, uno por tema. Sello
**`v20261118-1640`**, md5 **`ec205ee0`**, **186.399** líneas. Línea base **`4d5c0a4`**, que era a la
vez `origin/main` y el último commit pusheado.

**DOS DE LOS NUEVE PUNTOS NO SE IMPLEMENTARON, Y LOS DOS POR MEDICIÓN.** El **4** —el strain
GLOBAL del VD en cuatro tramos— porque **la fuente no coincide**: la Tabla 1 de la ASE 2025
(hoja 5, folio **145**, comprobado en el pie impreso) trae **DOS** filas de strain del VD, y los
cortes que la orden pide —`>20 | ≤20 a ≥15 | <15 a ≥11 | <11`— son los de la fila de la **pared
libre de tres segmentos**, que esta aplicación **ya gradúa en esos cuatro tramos desde la 3A**. La
fila del strain **global de seis segmentos** publica otros —`>17 | ≤17 a >13 | ≤13 a >9 | ≤9`—, es
otra magnitud y la aplicación **no tiene campo** para ella. Es lo mismo que **P3A-b** ya declaraba.
Y el **8** porque la orden decía «SOLO INFORMAR».

**PUNTO 1 — LA DIÁSTOLE DEJA DE PUBLICAR EL CONTEO EN EL TEXTO ESCRITO.** De los **cuatro**
algoritmos, el único que lo publicaba era la **ASE 2025 en ritmo sinusal**, con la constante `nPar`
interpolada en **SEIS** ramas. La ASE/EACVI 2016 lo había perdido en la 3A; la BSE 2024 **nunca** lo
tuvo —sus frases ENUMERAN los parámetros que votaron, no los cuentan— y los **tres** protocolos de
FA tampoco: su conteo nació en `ventanaDet`. ⚠️ **Y LA TARJETA Y LA VENTANA 🧭 NO SE TOCARON**:
`R.pos` y `R.total` siguen vivos y los sigue publicando `R.ventanaDet`, igual que `R.via`, los
`det1`/`det2` de la FA y el «N de M criterios positivos» de la BSE y de la ASE 2016. Un conteo
explica; no afirma.

**PUNTO 2 — LA RECOMENDACIÓN DEL ECO CON DOBUTAMINA SALE DEL INFORME.** Lo que se retira es
«Considerar ecocardiograma con dobutamina a bajas dosis para distinguir severidad verdadera de
pseudo-severa.» de la rama de bajo flujo y bajo gradiente **clásica**; la descripción queda entera,
con sus seis números. **El contenido retirado YA ESTÁ en la Evidencia**, en la nota del estadio
**D2** de la Tabla 7 de la ACC/AHA 2020, y TC-951 lo mide con su propia condición: si esa nota
desaparece, el caso se pone rojo —y lo que hay que mirar entonces es la Evidencia, no devolver la
frase al papel—. ⚠️ **LAS OTRAS TRES COLAS DEL MISMO BLOQUE NO SE TOCARON** (**PR4-b**): el score
de calcio por TAC, la revisión del TSVI y el repaso de las integrales. La orden nombró la de la
dobutamina y retirar texto clínico es decisión del médico.

**PUNTO 3 — EL TRIV YA CORTABA EN «75 ms O MÁS» Y LO QUE SE CERRÓ FUE UN TEXTO.** `DT_TRIV_HTP`
vale 75 y sus **dos** lectores comparan con `>=` **desde el MEDIR-6 (B1)**. Lo que quedaba con el
operador estricto era la sección de **hipertensión pulmonar** del panel de Evidencia —«por encima
de 75 ms»: el panel decía una cosa y el informe firmado hacía otra sobre el mismo número— y **tres
comentarios** del archivo, uno de los cuales todavía decía «TRIV tricuspídeo > 60 ms». Los dos
elementos indirectos —TAP < 105 ms y TRIV— **se mantienen**. ⚠️ **Y LAS TRES FUENTES DEL CORTE NO
ESTÁN EN LA BIBLIOTECA** (**PR4-d**): buscadas por nombre en «16- HTP», «03_VD_y_corazon_derecho»,
«17- Doppler tisular y strain» y en todo el árbol, no están Cabrita 2013, Bréchot 2008 ni Howard LS
2012 —el único «Howard» del árbol es Howard BV, de un artículo de aorta—. Las tres citas **se
conservan sin folio**, como estaban, y el globo **declara el corte como criterio de la aplicación**,
que es lo que la orden manda para lo que no se encuentra.

**PUNTO 5 — REFERENCIAS · PRÓTESIS.** Las siete fichas quedan en el orden de las válvulas de la
aplicación: **aórtica, mitral, tricúspide, pulmonar** y después las tres que no son de una posición.
Es una **mudanza de nodos**: ni una palabra cambia, ningún id se toca y `REF_SUBTAB` no se entera.
Y cada una de las cuatro posiciones gana una **tabla fija de valores esperados por marca, modelo y
tamaño** que **LEE el mismo catálogo que el selector «Modelo y tamaño»** —`VMOD_TABLA` y las
constantes `PROT_CAT_*`—, sus columnas del `_COLS` de ese catálogo, sus rótulos del `VMOD_COL_TXT`
que ya existía y el formato de cada celda de `_vmPar`. **Ni un número escrito**: TC-953 recorre las
cuatro tablas **celda por celda** contra el catálogo que el propio caso recorre, así que una sola
cifra copiada a mano lo pone rojo. La **aórtica lleva DOS** tablas —quirúrgica y transcatéter—, el
mismo reparto de `vModCatalogo`. Se pinta con **nodos** y no con `innerHTML`, y la primera vez que
se abre la ficha. **«AEO» y no «EOA»**: las dos etiquetas de `VMOD_COL_TXT` y los cuatro literales
del chip de la indexada predicha se habían quedado con la sigla inglesa.

**PUNTO 6 — LOS CRITERIOS DE SEVERIDAD.** El inventario completo —las OCHO lesiones nativas, las
CUATRO posiciones protésicas y el desajuste— vive en `docs/CONTROL_SEVERIDAD_REF.md` con su dueño y
su fuente, y con las **ONCE** diferencias entre lo que la aplicación usa y lo que dice la guía, que
**no se escriben en la aplicación**. En la app entraron las **TRES** lesiones que **no tenían
ficha**: estenosis tricuspídea, estenosis pulmonar e insuficiencia pulmonar. **Ningún corte se
tocó**, y es medible: TC-956 compara cada corte publicado contra su constante leída **en vivo** y
además exige que esas constantes sigan en su valor.

**PUNTO 7 — EL RESUMEN DEL POSOPERATORIO**, ocho bloques al principio de `ref-pop`, cada uno con su
línea de 10 px con fuente y folio, generado por `scripts/_gen_pop_ref.py` junto con
`docs/CONTROL_POP_REF.md`. **NADA** de las cinco contradicciones que el capítulo 12 del Word muestra
sin resolver, **nada** de lo que marca «verificar a ojo», **ningún** coeficiente de escala de riesgo
y **ninguna** conducta. La **tabla de criterios no se tocó**: sus diecisiete `tr` y sus diecisiete ⓘ
siguen iguales.

**PUNTO 9 — EL AVISO DE INDEPENDENCIA EN TRES BLOQUES.** La frase de cabecera pierde los dos
artículos y el punto largo se reparte en **⚖️**, **📚** y **✏️**, con las mismas palabras. El ⓘ del
título de Evidencia dice lo mismo **en los mismos tres bloques**, leyéndolos del aviso, más un
**cuarto** separado por una línea fina que es lo único propio del globo; la tarjeta pasa de 400 a
460 px. ⚠️ **EL ID VA EN EL DIV Y EL DIBUJITO ADENTRO**: con el emoji fuera del nodo habría dos
dueños del icono.

**DOS MOTORES, OCHO CRUCES.** Chrome del sistema y WebKit, en 1440 y 390 px, en los dos temas
**reales** —puestos con `ett_theme` más `loadTheme()` y **devueltos** por la sonda—: **UNA sola
combinación de valores en los ocho**, con **CERO errores de consola y de página**. Tres bloques con
sus tres dibujitos, caja en seis, botón de continuar de 414×44 a 1440 y 284×44 a 390 y alcanzable en
los ocho; globo de 44×44 con sus cuatro bloques leídos del aviso y la tarjeta de 460×216 y 374×248
**dentro de la pantalla**; el orden de las siete fichas de prótesis, las **dos** tablas de la
aórtica y una por posición con sus líneas de fuente, **AEO y cero EOA**, y a 390 px las cuatro
tablas desplazando **dentro de su envoltorio** (310 contra 787, 740, 1.001, 1.100 y 1.064 px) con el
documento **sin** desplazar; y el resumen del posoperatorio con sus ocho líneas en 10 px antes de la
tabla de diecisiete filas.
⚠️ **LA SONDA ENCONTRÓ DOS DENOMINADORES VACÍOS MÍOS**, los dos del punto 5: la subpestaña es
**`valv`** y no `protesicas`, y «protesicas» es **además** una entrada **plegable**. Con cualquiera
cerrada las tablas miden 0 × 0 y el desplazamiento da 0, que se lee igual que «no desborda».
**WebKit de Playwright no es Safari, y se declara.**

**COBERTURA: NUEVE casos nuevos, TC-948 a TC-956**, uno por punto y tres por superficie en el
punto 1. **OCHO caen contra `4d5c0a4`** y **TC-949 pasa en los dos árboles, declarado en PR4-a**:
el conteo nunca estuvo en `textoSuma`, así que ese caso es una guarda de regresión para la
superficie que la orden nombra y no lo que discrimina.
**DIECINUEVE casos adaptados, ninguno borrado y ninguno aflojado**: TC-453 (el literal del estado
(a) sin su conteo), TC-291 (dos condiciones que exigían la ausencia de la palabra «dobutamina» y
pasaron a exigir la del rótulo «BF/BG clásica», una de ellas con la mitad de «bajo flujo» que le
faltaba, así que quedó **más fuerte**), TC-739 y TC-740 (el renombre de EOA a AEO), TC-502, TC-509,
TC-761, TC-763, TC-817, TC-821 y TC-947 (los censos de Referencias: 42 → 45 entradas, 40 → 43 en el
índice del buscador y 14 → 17 en el reparto de «valv»), TC-944 y TC-945 y TC-625 (el aviso y su
globo, con tres condiciones **INVERTIDAS**) y **TC-925**, cuya condición del grado III pasó de
EXIGIR el conteo a PROHIBIRLO.
⚠️ **DOS DE LOS DIECINUEVE LOS DESTAPÓ LA SUITE COMPLETA Y NO MI CENSO**, y las dos causas son las
de siempre: **TC-925** afirma el conteo partido en **dos** `indexOf` —«par» y «metros positivos)»,
para no escribir la tilde—, así que ni «parámetros positivos» ni el patrón «N/M» lo encontraban; y
**TC-947** cuenta el índice del buscador con su propio ayudante y su rótulo decía «CUARENTA», así
que no caía en la búsqueda por «=== 40». Los **dos** caen contra `4d5c0a4` y los dos quedaron
verdes.

**Línea base al cierre: suite 957/964**, en **DIECIOCHO** lotes cubriendo los **964 casos
distintos** —contados con el patrón COMPLETO del id, **cero duplicados**—, en UNA sola pasada sobre
el árbol sellado, con los **964 ejecutados**, el md5 de `index.html` **idéntico** antes y después
(`ec205ee0`) y el pendrive `DISK_IMG` verificado **veinte** veces leyendo DICOMDIR —en 3 a 5 ms, con
sus **343** archivos de `GEMS_IMG` declarados en cada control— más un toque previo antes del primer
lote. Los rojos son **TC-182, TC-376, TC-406, TC-551 y TC-903**, los cinco que la orden declara
conocidos, más **TC-925 y TC-947**, que eran **míos** y son consecuencia autorizada de los puntos 1
y 6. **Ningún rojo nuevo ajeno a la tanda.**
⚠️ **EL LOTE 17 SE REHIZO ENTERO con el archivo de casos final** —es el que tiene a los dos—: da
**54/55**, con **TC-903** como único rojo, que es uno de los intermitentes declarados. **No se
rehizo la pasada completa**, y se declara con su motivo: `index.html` **no cambió** —mismo md5
antes y después de adaptar los dos casos— y el único archivo que se movió fue el de casos. Es el
mismo criterio con que la 3A no rehizo su pasada.

**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta. **Sin huérfanos nuevos.** **17 de 17
bloques de JS inline parsean.** **CELULAR: 60 hallazgos a 360 px y 68 a 390, con 19 ALTA en cada
ancho y 38 en total** — la línea base **exacta**, medida con el **mismo script en los dos árboles**.
**Excel en 457 columnas y CERO campos guardados nuevos**, por construcción: **cero** `input`,
`select` y `textarea` nuevos con `id`.

El mapa, en `docs/mapa/pr4-diastole-triv-referencias.md`; el inventario de severidad, en
`docs/CONTROL_SEVERIDAD_REF.md`; la trazabilidad del resumen del posoperatorio, en
`docs/CONTROL_POP_REF.md`; lo declarado, en **PR4-0** a **PR4-k**; la guía manual, en
`docs/GUIA_PRUEBA_PR4.md` (**14** pasos); la sonda de dos motores, en `scripts/_probe_pr4.mjs` con
su cuerpo aparte; los dos generadores, en `scripts/_gen_pop_ref.py` y `scripts/_gen_sev_ref.py`; el
corredor de lotes, en `scripts/_lotes_pr4.sh`.

**La tanda CUADROS (2026-11-18) — los doce cuadros del PDF, la grilla de tres, las líneas de
válvula y la tarjeta «Cuadros».** CUATRO commits. Sello **`v20261118-0219`**, md5 **`60fe3171`**,
**185.708** líneas.

**EL PDF DEJA DE ARMAR SUS CUADROS CON CINCO LITERALES DENTRO DE `generarPDFReal`.** Son **DOCE**,
de a **tres por fila**, y salen de un dueño único —`cuadDefs`— que lee también la tarjeta nueva del
Informe. Con dos listas, la pantalla y el papel firmado podrían mostrar cuadros distintos y en
distinto orden. **Y NO HAY SEGUNDA DERIVACIÓN DE NINGÚN NÚMERO**: los derivados que vivían en el
bloque de pre-cálculos de esa función se **mudaron enteros y textuales** a `cuadCtx`, que
`generarPDFReal` ahora **consume** — no se copió una línea, se movió.

**LO QUE SALIÓ DEL PAPEL.** La **fila de cuadros de válvulas** en los **ocho** estilos —también en
los que caía en una segunda hoja—; **TODOS los valores de referencia** —el mecanismo de `ref` se
conserva y lo usa **una sola fila**, el gasto cardíaco para decir con qué frecuencia se calculó, que
no es una referencia sino el insumo—; el resumen de la aorta que «Otros» publicaba por segunda vez
en el mismo papel; el **Ø TSVI** del cuadro de continuidad, que era la tercera impresión del mismo
diámetro; y el **AVA** del cuadro del gasto. **Ninguna constante de corte se tocó**: siguen
gobernando la pantalla, el informe y la Evidencia.

**LO QUE ENTRÓ.** Las **líneas de válvula** —una por hallazgo, dentro del cuadro de su estructura,
la morfología marcada con el color de la plantilla y sin repetir ningún número que el cuadro ya
publica en sus filas—; el **asterisco** de los segmentos aórticos dilatados con su pie; el **DVI**
en el cuadro de continuidad, de `_eaCritDvi`, el dueño que ya lo calcula con sus dos bandas puestas;
y «Otros» en **una sola línea** con el pericardio, las masas, el pulmón y las variantes anatómicas.

⚠️ **DOS CUADROS PUBLICAN MÁS FILAS QUE LAS QUE LA ORDEN ENUMERA, Y ES DELIBERADO.** La orden lista
tres segmentos aórticos y siete filas de VD; acá salen **cinco** y **nueve**. El cayado, la aorta
descendente, la FEVD y la relación VD/VI son **números MEDIDOS** que no se publican en ningún otro
cuadro: retirarlos los borraría del papel, y en esta casa ningún número medido desaparece. Declarado
en **CUAD-a**.

**LA GRILLA, LA MISMA REGLA EN LOS DOS LADOS.** `cuadFilas(n)`: 12 → 3·3·3·3 · 11 → 3·3·3·2 ·
10 → 3·3·2·2 · 7 → 3·2·2 · 4 → 2·2 · 2 → 2 · 1 → 1. En el papel, una llamada a
`drawTablaCompacta` por fila, y una fila es **atómica** —su `checkPage` pide hoja con el alto
completo—, así que ningún cuadro se corta entre dos hojas. En la tarjeta, una grilla de **SEIS**
columnas con un `span` por cuadro: con tres no hay forma de partir una fila en mitades. El span va
en un **atributo** y no en un estilo en línea, porque la media query de celular le gana al atributo
y no le ganaría a un estilo en línea.

**EL BOTÓN Y LA TARJETA.** Botón chico, rectangular, **sin texto**, con el ícono de cuatro
cuadraditos en SVG —un emoji cambia de dibujo en cada sistema y acá el ícono **es** el nombre del
botón—, a la derecha de «Evidencia». La tarjeta muestra los **mismos** cuadros con los mismos datos,
sin datos del paciente y sin el texto del informe; se quita un cuadro con su ✕, se recupera de la
franja de quitados con un toque, se reordena **arrastrando con eventos de puntero** —el arrastre
nativo de HTML no existe con el dedo— y «Restablecer» vuelve al orden de fábrica.
⚠️ **EL EJE DEL ARRASTRE SE DECIDE POR LA POSICIÓN DE LOS DOS CUADROS Y NO POR LA FORMA DE UNO**: la
primera versión miraba si el cuadro era más ancho que alto, y en celular —uno por fila, ancho
completo— eso ordenaba por el eje que ahí no ordena nada. Lo destapó un caso.
⚠️ **EL AVISO NO VIVE SÓLO EN EL COLOR**: el punto es una **forma** que está o no está, y el `title`
y el `aria-label` lo dicen con palabras en los dos estados.
⚠️ **LA CONFIGURACIÓN VIVE EN MEMORIA Y DURA LO QUE DURA LA APP ABIERTA** (corrección del médico):
no la descarta ni «Nuevo estudio» ni abrir otro estudio, y **por eso NO hay ningún gancho en
`limpiarCampos`** — la ausencia de ese gancho ES la decisión, escrita ahí para que el próximo pase
no lo agregue creyendo que falta.

**CUATRO DUEÑOS PARTIDOS EN DOS FORMAS, NO DUPLICADOS.** `_imMetodoPdfPartes` y `emAvmPdfPartes`
devuelven las **partes** y no la cadena, porque hay dos consumidores con dos formatos: la fila de
una tabla escribe «PISA: 26.1 mm²» y la línea de válvula «26.1 mm² (PISA)». Con dos funciones
decidiendo qué método entra, el día que una casilla cambie de regla una de las dos superficies se
queda con la anterior. `_imMetodoPdfVal` y `emAvmPdfVal` conservan su salida carácter por carácter.

**LO MEDIDO.** PDF generado de verdad y **mirado rasterizado**: el mismo estudio pasa de **TRES
hojas a DOS**, con el informe narrativo fluyendo a la hoja 2. **Los OCHO estilos** sin una fila de
válvulas y sin un valor de referencia, con la configuración reflejada en los ocho — verificado por
los **bytes** del PDF, que sale sin comprimir. **Chrome y WebKit coinciden en los seis cruces**
(dos motores × 1369, 900 y 390 px) con **cero errores de consola y de página**: botón 44×44 sin
texto y con sus cuatro rectángulos, manija y ✕ en 44×44, **tres cuadros por fila a 1369 y 900 y UNO
a 390**, cero textos recortados y **cero desplazamiento horizontal propio** —el de 900 px es
preexistente, medido con la tarjeta cerrada—. La tarjeta **no escribe un solo campo**: censo de
todos los `input`, `select` y `textarea` con id idéntico antes y después. **Semgrep 126 WARNING /
0 ERROR**, la línea base exacta; **sin huérfanos nuevos**; **celular 38 ALTA**, la línea base
exacta medida con el **mismo script en los dos árboles**.

**COBERTURA: TC-928 a TC-943**, uno por cada punto de la orden, los dieciséis cayendo **0/16 contra
`d3ea944`** por **92 condiciones** y **ninguno por excepción**. **DIECISIETE casos adaptados**
—TC-260, TC-279, TC-281, TC-295, TC-299, TC-307, TC-311, TC-315, TC-337, TC-345, TC-347, TC-434,
TC-459, TC-475, TC-487, TC-536 y TC-614—, con **catorce condiciones invertidas**; ninguno borrado y
ninguno aflojado. **QUINCE de los diecisiete caen 0/15 contra `d3ea944`**; los otros **dos pasan en
los dos árboles y se declaran** en **CUAD-j**: uno cambió su **extractor** y el otro un
**denominador**, y ninguna de las dos cosas es una afirmación.
⚠️ **DOCE DE ESOS DIECISIETE LOS DESTAPÓ LA CORRIDA DE LOTES Y NO MI CENSO**, y las dos causas son
las de siempre: afirmaban una fila del cuadro de válvulas **por su rótulo exacto** —y el dato se
mudó a la línea, donde el rótulo está dentro de una oración— o buscaban un **literal en el texto
fuente** de `generarPDFReal`, que es justo lo que esta tanda mudó a otra función. Las dos clases
quedaron reescritas midiendo la **conducta** y no cómo está escrito el código.
⚠️ **LA SUITE COMPLETA NO SE CORRIÓ, POR ORDEN EXPRESA.** Se corrieron los **lotes de riesgo**: los
**380** casos cuyo cuerpo toca el PDF, el informe narrativo, el EN SUMA o el Laboratorio,
seleccionados por el patrón de su propio cuerpo y no a ojo. Los 571 restantes **no se ejecutaron**.
**Línea base al cierre: 377/380** en **SIETE** lotes, en UNA sola pasada sobre el árbol sellado, con
el md5 de `index.html` **idéntico** antes y después (`60fe3171`) y el pendrive `DISK_IMG` verificado
**nueve** veces leyendo DICOMDIR, en 14 a 19 ms. Los rojos son **TC-376** y **TC-406**, dos de los de
siempre, y **TC-182**, el intermitente declarado, que pasa **2 de 2 corrido aislado**. **Ningún rojo
nuevo**, y los dieciséis casos nuevos y los diecisiete adaptados en verde.
⚠️ **SON DOS PASADAS Y SÓLO SE INFORMA LA SEGUNDA**, porque la primera fue de **diagnóstico**: dio
363/380 y destapó los doce casos adaptados que el censo no había visto. Esta casa no informa un
número de una pasada hecha con un archivo de casos anterior.
⚠️ **Y LO QUE ESTA TANDA PAGÓ**: el **acento grave dentro de mis propios comentarios** en el cuerpo
de un caso, **cinco** veces —el generador de los casos lo **aborta** antes de insertar nada, que es
la única forma, porque lo que queda a veces es JS válido y `node --check` pasa—; una **expresión
regular con barra invertida** en el cuerpo de un caso; **`display:none` sin geometría** —el botón
medía 0×0 sin abrir la pestaña del Informe—; el **overlay de login** tapando la página entera, con
`elementFromPoint` devolviendo `login-overlay` en todos los puntos; y un objeto de `cuadDefs`
**leído antes** de cambiar el dato, que devolvía el estado anterior.
El mapa, en `docs/mapa/cuadros-pdf-tarjeta.md`; las fichas, en `docs/mapa/tests-fichas-928.md`; lo
declarado, en **CUAD-a** a **CUAD-i**; la guía manual, en `docs/GUIA_PRUEBA_CUADROS.md` (12 pasos);
la sonda, en `scripts/_probe_cuad.mjs`; el generador de casos, en `scripts/_gen_cuad_casos.py`; el
corredor de lotes, en `scripts/_lotes_cuad.sh`.

**La tanda 3A (2026-11-17) — el Valsalva del grado III, los cuatro tramos del strain del VD, la
ficha del cor triatriatum y cuatro arreglos clínicos.** OCHO commits. Sello **`v20261117-2129`**,
md5 **`5c283337`**, **185.245** líneas.

**CINCO PREMISAS DEL PEDIDO SE DIERON VUELTA AL MEDIRLAS, Y TRES ERAN «YA ESTABA HECHO».** El
corte del strain **por sexo ya no existía** —se unificó en la AJ1 y el −21 de la mujer sólo vive en
una lápida—; los **tres grados de la fuga de la TAVI ya existían** desde la PRO-B3 con los cortes
de la Tabla 8; y la **lógica del solapamiento de las Tablas 11 y 12 ya estaba** desde el Z6-2, con
la sensibilidad y la especificidad citadas **en un comentario**. Lo que faltaba en los tres casos
era decirlo en pantalla. El **`IIIa/IIIb`** de la app es, en 19 de sus 20 apariciones, el
**Carpentier de la mitral** —otra clasificación con el mismo nombre— y la única diastólica era
**una frase**. Y la **BSE 2024 no detecta llenado restrictivo**: sus tres categorías no llevan
grado, así que **no se la tocó**, como la orden pedía.

⚠️ **Y EL ARCHIVO AFIRMABA, EN CUATRO LUGARES Y «MEDIDO EN IMAGEN», QUE LA TABLA 1 DE LA ASE 2025
NO BANDEA EL STRAIN. ERA FALSO, Y SE LEYÓ EL PDF PARA SABERLO.** El comentario de los cortes, la
ficha `FUN-VD-008` («esos dos cortes no existen en la fuente»), el bloque de las tres reglas del
voto y el bloque del piso del strain lo sostenían. La hoja 5, folio **145** comprobado en el pie
impreso («Mukherjee, M et al | 145»), dice: `RV longitudinal free wall strain (three segment), %*`
con **>20 | ≤20 a ≥15 | <15 a ≥11 | <11**, y su nota al pie `*` —la que el archivo ya citaba— dice
«Absolute values and ranges for strain are shown», o sea **rangos, en plural**. Las cuatro
afirmaciones quedan corregidas con su cita; la transcripción, en `docs/fuentes/FUENTES.md`.
El strain gradúa ahora **moderada y severa también en el informe FIRMADO** (orden de Maicol), con
el grado saliendo del **mismo registro** que la pantalla: un TAPSE de 22 mm con un strain de −9 %
publicaba «disfunción sistólica» a secas y ahora publica «disfunción sistólica severa». `FUN-VD-008`
pasó de criterio propio a **guía verificada**, así que sus filas salen **con corchete**.

**EL VALSALVA, CON UN SOLO DUEÑO PARA CUATRO SUPERFICIES.** El selector «Se modifica con Valsalva»
va al lado de «Ritmo», los dos a la mitad de la celda, y se habilita **sólo** con `clave === 'g3'`
—el mismo identificador en la ASE 2025 y en la ASE/EACVI 2016—. Las dos redacciones **no son la
misma cadena** y es a propósito: el informe dice «patrón restrictivo fijo, no modificable con
Valsalva» y el EN SUMA «grado III fijo (no modificable con Valsalva)».
⚠️ **LA LIMPIEZA LLEVA UNA GUARDA, Y ES LA LECCIÓN DE LAS REFERENCIAS QUE CONSERVABAN EL RESULTADO
DEL VALOR VIEJO**: `_diastResult` sobrevive a un cambio de pestaña y a una restauración, así que
ahora publica su `clave`, su `algoritmo` y su `ritmo`, y el sync limpia **únicamente** si coinciden
con los actuales. Sin coincidencia no toca nada. Y cuelga de la envoltura de `calcDiastol` y **no**
de `RECALC_MODULOS`, porque necesita un resultado fresco para poder limpiar (**P3A-f**).
**La relación E/A se conserva** en las frases (decisión de Maicol); lo que salió es la
**enumeración** de qué parámetros dieron positivos y el **operador** del corte. El grado III de la
ASE 2016 va **sin conteo**, y es una medición: esa rama llega por el **atajo `E/A ≥ 2`**, antes de
contar los tres criterios de la Figura 8B, así que un «(N/M)» publicaría un recuento que no decidió
nada.

**LAS DOS MITADES DEL COR TRIATRIATUM, LEÍDAS EN LOS PDF.** Gurvitz (hojas 49-51, folios e163 a
e165) para la membrana fenestrada, las dos cámaras, la orejuela y la mitral **distales**, el 0,1 %
y la clase **2a · B-NR**; Puchalski (hojas 66 y 67 del **original en inglés**, folios 195 y 196)
para la técnica, el Doppler color, las formas parciales, el septo por tres planos y el control tras
la resección. ⚠️ **EL >15 mmHg SE RESOLVIÓ LEYENDO, porque la orden se contradecía**: el folio e164
lo llama «**a previously proposed threshold**», así que el globo lo publica con ese encuadre y la
aplicación **no gradúa** el cor triatriatum ni cablea un solo número. **Sin tipos** y sin los cinco
autores que la orden prohíbe, barrido sobre **todo** el registro de globos.

**EL HCM.** `mch_ex_reduccion` queda como «Miectomía previa» y **conserva su id**, porque de él
cuelga su columna del Excel del Laboratorio, que tiene orden expresa de no tocarse; la
**alcoholización septal** pasa a un campo nuevo que **no es una exclusión**: el score se calcula y
se publica con su salvedad, de un **dueño único** que leen el informe, el EN SUMA y el resumen del
Laboratorio, con la misma guarda que la salvedad de la TV sostenida de al lado. Las otras tres
superficies que la enumeraban quedaron al día.

**Cobertura: TC-921 a TC-927**, los siete cayendo **0/7** contra `e24a81c` con el mismo archivo de
casos y **ninguno por excepción**. **DOCE casos adaptados, SIETE de ellos INVERTIDOS** —TC-918,
TC-453, TC-535 (E2) y (F2), TC-537 (C4), TC-526 (B4), TC-539 (C4) y (C5), TC-549 (A3)—: ocho de
esas condiciones afirmaban lo que esta tanda vino a cambiar, y **cuatro sostenían que la ASE 2025
no publica los cortes de moderada y de severa**. Los otros cinco son conteos (globos 144 → 148,
tarjetas sin ficha 70 → 74, botones de 44 px 66 → 68, campos de la MCH 30 → 31, nodos de los planos
19/14 → 20/15 y 16 → 17 en gris).
⚠️ **LO QUE LA MEDICIÓN EN EL NAVEGADOR ENCONTRÓ Y LA LECTURA NO**: dos de los cuatro globos nuevos
quedaron **sin la clase `vinfo-btn-44`** que sí usan sus vecinos inmediatos, así que medían 15×11
al lado de uno de 44. Corregido y vuelto a medir.
⚠️ **Y LA PRIMERA CORRIDA DE LA SONDA MIDIÓ SOBRE UN DENOMINADOR VACÍO**: los cuatro botones y los
dos selectores daban **0×0** porque sus pestañas estaban cerradas, y un 0×0 se lee igual que «el
control no está». Se midió qué ancestro esconde cada uno y se abren con los abridores de la app.
**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta. **17 de 17 bloques de JS inline parsean.**
**CHROME Y WEBKIT EN LOS OCHO CRUCES** (dos motores × 1369 y 390 px × los dos temas **reales**,
devueltos por la sonda), con **cero errores de consola y de página**, los dos selectores **al lado**
y a la mitad en los dos anchos, **cero** títulos cortados y **cero** desplazamiento horizontal.
⚠️ **CUATRO TRAMPAS DE ESTA CASA, PAGADAS OTRA VEZ**: el acento grave dentro de mis propios
comentarios en el cuerpo de un caso, **tres veces**; un `let` declarado dentro del `try` que **no
alcanza al `return`**; el registro de fichas que se llama **`EV_REG` y no `IND_REFS`**; y una escena
que no vaciaba sus insumos, así que el control negativo medía la escena anterior. El generador de
casos de esta tanda construye el acento grave con `chr(96)` y **asegura que el cuerpo no tenga
ninguno**.
**Línea base al cierre: suite 931/935**, en **DIECISIETE** lotes de 55 cubriendo los **935 casos
distintos** —contados con el patrón COMPLETO del id, **cero duplicados**—, con los **935
ejecutados** (55 de 55 en cada uno de los diecisiete), el md5 de `index.html` **idéntico** antes y
después (`5c283337`) y el pendrive `DISK_IMG` verificado **diecinueve** veces leyendo DICOMDIR —en
5 a 13 ms, con sus **343** archivos de `GEMS_IMG` declarados en cada control— más un toque previo
de 287 ms antes del primer lote.
Los rojos son **TC-376** y **TC-406**, dos de los de siempre —los dos fallan igual corridos
aislados—, y **TC-182** y **TC-903**, los dos intermitentes ya declarados, que **pasan 1/1 corridos
aislados**. **Ningún rojo nuevo**, y los siete casos nuevos y los trece adaptados en verde.
⚠️ **LA PASADA DIO 930/935 Y EL QUINTO ROJO ERA MÍO: TC-28**, que no está en ninguna lista de
intermitentes y falla **0/3 aislado**. Era **consecuencia autorizada** del punto 7 —exigía el
«(0/3 parámetros positivos)» en la frase de la diastólica normal, que la decisión de Maicol mandó
sacar— y **lo destapó la suite completa y no mi censo**: busqué los casos de la diastólica por sus
palabras (restrictivo, pseudonormal, grado III, `_diastResult`) y ése afirma su frase con una lista
de inclusión que dice «0/3 parámetros positivos», sin ninguna de esas palabras. Quedó **INVERTIDO**
—exige la frase **y** que el conteo ya no esté— y **cae contra `e24a81c`**.
⚠️ **NO SE REHIZO LA PASADA COMPLETA, y se declara con su motivo**: `index.html` **no cambió**
—mismo md5 antes y después de adaptar el caso—, y el único archivo que se movió fue el de casos, en
el cuerpo de **TC-28**. Se rehizo **su lote entero**, el 1, con el archivo de casos final: **55/55**,
con el md5 del árbol idéntico al abrir y al cerrar. Es el mismo criterio con que PANT-20 no rehizo
su pasada.
El mapa, en `docs/mapa/p3a-valsalva-strain-cortri.md`; lo declarado, en **P3A-a** a **P3A-m**; la
sonda, en `scripts/_probe_3a.mjs` con su cuerpo aparte; el corredor de lotes, en
`scripts/_lotes_3a.sh`.

**La tanda MEDIR-6 (2026-11-16) — el visor, el TRIV, la CIV, el TEER, la Tabla 4 y el cor
triatriatum.** OCHO commits. Sello **`v20261116-0358`**, md5 **`84a38aa2`**, **184.689** lineas.

**NUEVE PREMISAS DEL PEDIDO SE DIERON VUELTA AL MEDIRLAS, Y SEIS ERAN «YA ESTABA HECHO».** Es lo
que vale medir antes de tocar: **B1** tenia el corte en 75 y lo que faltaba era el operador, con
Cabrita 2013 y Brechot 2008 **ya citados**; **B2** estaba cumplido en sus dos mitades —el globo ya
decia «orientativo» y «50 neonatos» con sus folios, y el grado ya no conducia ninguna conclusion—;
**B5** ya tenia el ≥11 mm desde R2 y lo que faltaba era el **tethering**; **C2** ya se rotulaba
como criterio propio en cinco lugares; **E1** ya fallaba fuerte sin disco; y **A2** nunca estuvo
atada a una valvula. **A3** resulto tener **TRES** duenos y no dos, y **A5** no tenia ningun orden
comun entre sus cinco colecciones.

**BLOQUE A — EL VISOR (A1 a A5).** El bloque de calculados **viaja** a una ranura nueva de la
columna izquierda, despues de la imagen, con el **mismo dueno** que el cajon Doppler; por debajo de
**1024 px** vuelve al nivel del modal y el reacomodo cuelga del `resize` que el visor ya tenia.
La lista de VTI sale solo con la **aortica o la pulmonar** y lista solo las **libres**, con el
**indice real de `_medVtis`** — con el de la lista filtrada el boton asigna **otra medicion del
paciente**, en silencio, que es la trampa de `_vPickLista`—. El alias `'vci.vci' -> 'tri.vciDiam'`
cierra el tercer duplicado: **lo que se perdia no era un rotulo, de ese campo cuelga la PmAD**.
«Limpiar» borra la **estructura abierta** —`_dopLimpiar` y `_d2Limpiar` NO se tocan, las llaman
«Nuevo estudio» y el cierre de sesion— y en el cajon 2D se barre por **`_D2_FILAS_DE`** y no por el
prefijo, porque `vi.tsvi` se **dibuja** en el grupo de la aorta. Y «Borrar» saca **una por clic**
por su numero de llegada (`_medSello`, por vista), cancelando primero un gesto a medio hacer y sin
tocar la calibracion; **`medBorrar` queda intacta**, que es con la que la bateria arma sus escenas.
**A6 queda afuera por decision del medico** y va en su propio prompt (**M6-a**).

**BLOQUE B — LOS CINCO CAMBIOS CLINICOS.** El **TRIV** pasa a **≥ 75 ms** en los DOS lectores y en
las tres cadenas. ⚠️ **Y EL GLOBO SE DESMENTIA A SI MISMO**: decia «prolongado —mas de 75 ms—»
mientras su propia fuente, tres lineas mas abajo, cita el consenso como «normal menos de 75 ms,
**anormal 75 ms o mas**». La app leia su corte mas estricto que el documento del que sale.
El **indice de Celermajer** gana el encuadre de que en **adultos** se aplica por extension.
La **CIV** pierde la regla de **DDVI indexado > 32 mm/m²** —el archivo ya la declaraba como
criterio propio y decia que corregirla «es decision del medico»; **D2-a queda cerrado**— y con ella
se cae la contradiccion de que la misma tabla dijera «contraindicado» y «criterio de cierre» a la
vez. El **velo posterior** pasa a sus **cuatro tramos** con `_teerVpTramo` de dueno unico, y
⚠️ **los bordes se resolvieron HACIA ABAJO**: 7,0 es «complejo» y 5,0 «muy complejo» (**M6-b**).
La **coaptacion** queda con sus **dos cortes rotulados por procedimiento** —10 mm la reparacion
quirurgica, 11 mm el clip **y solo con tethering**—, el tethering **sin agregar ningun campo**
(se lee del Carpentier IIIb y del mecanismo, las dos puertas) y **fallando hacia no afirmar**; el
pie dice que son **criterios de exclusion de un estudio y no de una guia**, aplicados **por
extension** sobre el ETE, y separa la **longitud** de <2 mm de la **profundidad**. La **altura de
tenting** de 10 mm pasa a **criterio propio**.

**BLOQUE C — LA TABLA 4.** La casilla coronaria se parte en **tres** y se retira «el **mayor** de
las tres». ⚠️ **EL PUNTAJE PROPIO NO SE MUEVE**: los tres entran en `_hfaicosCvGrupo` —que era
`_hfaicosCvTerna` y mentia— y el grupo sigue sumando **2 en total**; el maximo sigue en **13**.
**C2 cerrado sin tocar una linea.**

**BLOQUE D — EL COR TRIATRIATUM**, con el molde de las otras variantes. ⚠️ **Es la primera que sube
al EN SUMA**, y por eso trae `sumaNota`: el ASIA y la RAC suben con su sigla sola porque la sigla
**es** el hallazgo, mientras que aca el lado y el gradiente que el medico escribe son parte de lo
que el EN SUMA dice. Hubo que agregarlo a **`OTR_VAR_IDS`**, que no es la misma lista que
`OTR_HALL`: de ella cuelga que su caja aparezca al marcar.

**BLOQUE E — EL PENDRIVE.** La comprobacion **lee DICOMDIR** en vez de listar —`ls` sobre un volumen
desmontado contesta **de cache**—, **mide cuanto tarda**, **declara cuantos archivos encontro** y
corta si son cero, y da un **toque previo** antes del primer lote. Medido: DICOMDIR en **4 a 13 ms**
y **341 archivos**. Y la mitad que ya estaba cumplida se verifico midiendola: **TC-181 da 1/1 con
el disco y 0/1 sin el**.

**Cobertura: TC-906 a TC-911**, los seis cayendo **0/6** contra su linea base y **ninguno por
excepcion**. **QUINCE casos adaptados** —TC-86, TC-101, TC-133, TC-170, TC-251, TC-264, TC-428,
TC-499, TC-507, TC-540, TC-549, TC-552, TC-553, TC-556, TC-648, TC-664 y TC-759— con **once
condiciones INVERTIDAS**, o sea que fallan por los dos lados. Ninguno se aflojo ni perdio
condiciones. ⚠️ **TC-535 no era de esta tanda**: falla con las mismas tres condiciones en los DOS
arboles y es un resto de **PANT-38**, que agrego el globo `clnk-guia` y dejo el censo en 65; se
movio a 66 (**M6-d**).
**Linea base al cierre: suite 914/919**, en **DIECISIETE** lotes cubriendo los **919 casos
distintos** —contados con el patron COMPLETO del id, **cero duplicados**—, en UNA sola pasada sobre
el arbol resellado, con los **919 ejecutados**, el md5 de `index.html` **identico** antes y despues
(`f4f277b0`) y el pendrive `DISK_IMG` verificado **diecinueve** veces leyendo DICOMDIR, con sus
**341** archivos declarados en cada control. Los rojos son **TC-376 y TC-406**, dos de los tres de
siempre; **TC-182** y **TC-551**, los dos intermitentes ya declarados; y **TC-903**, que queda
**caracterizado**: pasa **3 de 3 corrido aislado**, o sea sensibilidad de lote. **Ningun rojo
nuevo**, y los seis casos nuevos y los dieciseis adaptados en verde.
⚠️ **SON TRES PASADAS Y SOLO SE INFORMA LA ULTIMA, porque las dos primeras encontraron defectos
MIOS y el archivo cambio despues.** La primera dio **909/919** y destapo el peor: cinco casos
maduros en rojo de golpe —TC-74, TC-89, TC-91, TC-GR-07 y TC-692— por **un defecto real de mi B5**,
que contaba `c4` como dato faltante sin tethering y hacia caer de «APTO» a «falta 1 criterio» a
todo estudio sin tethering consignado. La segunda dio **913/919** y destapo **TC-95**, que fallaba
**0/3 aislado**: mi arreglo habia abierto un agujero en la direccion peligrosa —un **0 tipeado** en
la profundidad salia de la lista y el estudio decia «APTO» ignorando un error de carga—. Los dos
estan arreglados y es exactamente para esto que la suite se corre entera.
**25/25 MUTACIONES DIRIGIDAS MUERTAS**, en un worktree y **nunca** sobre el vivo, con el md5 del
vivo **identico** antes y despues, y las **25 anclas verificadas ANTES** de correr —lo que PANT-20
pago con una corrida entera—. Cubren los cinco cambios clinicos (B1 a B5), C1 y D1.
⚠️ **EL PRIMER BARRIDO DEJO DOS SOBREVIVIENTES Y LAS DOS ERAN HUECOS REALES**, cerrados con
condiciones nuevas y **sin aflojar una sola mutacion**: que el **grado de Celermajer NO conduce** la
conclusion —B2 lo verifico LEYENDO, y leer no es cubrir— y que el pie declara la **altura de
tenting** como criterio propio. ⚠️ **Y MEDIR EL PRIMERO ENSEÑO ALGO**: la conclusion **si** nombra
el indice y su grado, y eso **no** es conducirla, asi que lo que se compara es el RESTO del texto —
publicar un valor medido no es conducir una conclusion, y esta casa no retira un numero medido.
⚠️ **Cuatro anclas no emparejaron al verificarlas** y una fue por la **secuencia de escape**: el
archivo trae `\u2265` y no el signo, asi que el ancla necesitaba la secuencia literal.
**Semgrep 126 WARNING / 0 ERROR**, la linea base exacta. **Sin huerfanos nuevos.** **17 de 17
bloques de JS inline parsean.** **CERO `innerHTML`, `eval(` y `new Function` nuevos.** **CINCO
campos guardados nuevos** —los tres de la casilla partida y los dos del cor triatriatum— y **CERO
columnas de Excel**: TC-135, TC-479, TC-824 y TC-831 pasan **sin adaptar**, asi que las **457** no
se movieron.
⚠️ **LO QUE ESTA TANDA PAGO**: el **acento grave dentro de mis propios comentarios** en el cuerpo
de un caso, **tres veces** (TC-86, TC-101 y TC-499), por trigesima tanda seguida; y una trampa
nueva, **un rotulo de condicion partido en dos renglones dentro de una cadena simple**, que no es
JS valido. Las dos las caza `node --check`; lo que las previene es el barrido que **M6-e** deja
escrito: contar los acentos graves SIN barra invertida del cuerpo de cada caso y exigir uno.
El mapa, en `docs/mapa/medir6-triv-civ-teer-onco.md`; lo declarado, en **M6-a** a **M6-e**; el
corredor de lotes, en `scripts/_lotes_medir6.sh`; el barrido, en `scripts/_mut_medir6.py`.

**La tanda PANT-38 (2026-11-15) — el acomodo de Contractilidad, el menu de Documentos, CeiboLink
y tres arreglos chicos.** CINCO commits. Sello **`v20261115-1954`**, md5 **`ceb16d2d`**,
**184.278** lineas.

**BLOQUE 1 — EL ACOMODO.** El cuadro de «Limpiar» e «Incluir bull's eye en PDF» se muda al hueco
que ya estaba vacio debajo del territorio coronario. **Es un nodo que viaja, no una copia**:
`lv3dBotonesSync` lo manda a `#lv3d-slot-botones` en escritorio y lo devuelve a `#lv3d-fila`
—ANTES de `#lv3d-panel`— en 768 px o menos, con la guarda de `_vSlotSync` de MEDIR-4a.
⚠️ **EL 3D NO GANA NI PIERDE UN PIXEL, Y SALE DE UNA CUENTA**: hallazgos toma 220+150+16 = **386
px**, asi que el `1fr` del panel vale `total-386-16`, el mismo `total-220-150-32` de antes.
Medido: lienzo y canvas **597x334 en l=608** a 1369 px, identicos a la linea base. `align-items`
pasa de `stretch` a `start` —el comentario de «K2» defendia el `stretch` con un argumento que ya
no aplica: ese bloque no esta mas en esta fila—. Medido en los 16 cruces: el cuadro **no se
mueve** al abrir el 3D (0/0/0/0, contra dl **-671/-1168/-1808** y dh **+492/+769/+1127** en la
base), Hallazgos crece **112 -> 254** px con cinco hallazgos y **no iguala** al panel (604), y a
390 px todo es **identico a la base, caja por caja**.
⚠️ **LA SIEMBRA SE VERIFICA POR `contrEstado`**: la primera version de la sonda uso ids
inventados, `contrSetSegmento` los escribe igual, **nadie los lee**, y el texto cambiaba igual —o
sea que «no crece» era la siembra vacia y no el arreglo—.
**EL CORAZON, UN 23 % MAS GRANDE.** `LV3D_ESC` 26 -> **32**, el unico lugar donde se decide su
tamanio; **la regla del DDVI no se toca**. El factor sale del peor caso medido sobre `_lv3d.polis`
con DDVI 95 —donde la escala topa en 1,6—, con la diastole fantasma prendida, en tres vistas,
Coronarias (3099 poligonos contra 1800), cinco fases y doce giros: pasa de **48,6 % del ancho y
63,6 % del alto** a **59,8 % y 78,3 %**, sin salirse por ninguno de los cuatro bordes y con 33,3
px de aire arriba. El tope absoluto es **1,507** y se tomo **1,2308** por el grosor del trazo, el
halo de los rotulos y la brujula.
**LOS ROTULOS DE EJES.** Los cinco textos son los mismos; la brujula se corre de 58 a 72, el
rotulo se ancla con `textAlign` en vez de un offset fijo de 28 px, y el eje alineado con la camara
va debajo. Medido interceptando `fillText`: antes «Sep» salia en x[**-2**, 19.4] —cortado— y
«Punta» y «Lat» quedaban a **0,6 px**; y en «Punta a la izquierda» **«Punta» tambien se cortaba**,
lo que NO estaba reportado. Hoy los cinco dentro del canvas y cero pares que se pisen, en las tres
vistas y los dos tamanios. El contexto se restituye con `save`/`restore`: `textAlign` es estado
del contexto y una fuga asi es **estable**, o sea invisible para una prueba de idempotencia.
⚠️ **UN ERROR MIO QUE ENCONTRO LA SONDA Y NO LA LECTURA**: dije que solo un eje puede caer en el
centro porque los cinco son una base ortonormal. **Es falso** —son [+X, -X, +Y, -Y, +Z], y +X y -X
son el MISMO eje— asi que «Lat» y «Sep» caian juntos. En la version anterior no se superponian por
**pura casualidad numerica**: `cos(PI/2)` vale 6,1e-17 y no 0.

**BLOQUE 2 — EL MENU Y LA LISTA.** ⚠️ **LA CAUSA DEL RECORTE ES `.card{overflow:hidden}`, no un
contexto de apilamiento**: el `z-index:260` ya funcionaba —en la captura del medico el menu se
pinta por encima del EN SUMA— y el menu se cortaba en el borde SUPERIOR de la tarjeta del EN SUMA,
por eso la primera entrada se leia «electrica». Mismo defecto y mismo arreglo que el menu de
severidad valvular, con `:has()` para que la tarjeta vuelva a recortar al cerrarlo, mas
`max-height` con `overflow-y:auto`. **Medido por hit-testing y no por geometria** —«sobresale N
px» no cambia con el arreglo; lo que cambia es si se PINTA—: de **4 de 6** opciones alcanzables
(5 de 6 en seis cruces) a **6 de 6 en los 16**.
La lista pasa a una linea por documento; lo que cambia **no es el `flex:1`** del nombre, que se
conserva, sino su `min-width` de 140 a **0** y el texto que se corta con puntos suspensivos, con
el nombre entero en el `title`. Medido en catorce anchos de 390 a 2560, **cero regresiones**: a
1000 y 1200 px pasa de 102 y 91 px con 0 y 3 filas en linea a **62 px con 6 de 6**; a 800 y 900,
de 131 y 102 a **91**; a 390, de 116 a **101**.
⚠️ **POR DEBAJO DE 1000 px SIGUE ENVOLVIENDO Y SE DECLARA** en vez de prometer una linea que no
entra: ahi la grilla de Configuracion ya es de dos columnas y la fila mide entre 252 y 508 px.
⚠️ **DOS INTENTOS ANTERIORES METIERON REGRESIONES QUE ENCONTRO EL BARRIDO**: `flex-wrap:nowrap`
con una media query en 700 px rompia la banda 650–699 —y el ancho de la fila NO se deriva del
viewport: la grilla pasa de una a dos columnas cerca de los 780, asi que la misma fila mide 668 px
a 760 de viewport y 252 a 800—; y un piso de 140 px en el nombre rompia 650, 900, 1369 y 1440,
porque con `flex-wrap` el navegador arma las lineas con el **flex-basis** y no con el ancho minimo.

**BLOQUE 3 — CeiboLink.** «Descargar CeiboLink» deja de estar apagado y abre
`https://descargas.ceibomed.com` con **`rel="noopener noreferrer"`**: ⚠️ **es la primera vez que
esta app abre una direccion externa** —censado: cero `window.open` y cero `target="_blank"` en
todo el archivo antes de hoy— asi que esa linea es el patron que hereden las que vengan, y sin
`noopener` la pagina que se abre puede navegar a esta, con el estudio del paciente en pantalla y
sin guardar. «Como conectar el ecografo» pasa de **1549 caracteres en ocho parrafos a 473 en
tres** y el paso a paso se muda al **«?»** pegado a «Actualizar», con el mecanismo de los demas
globos (`clnk-guia` en `VINFO`). **Sin el codigo de seis digitos** —decision pendiente que el
propio panel declara— y **sin pasos del instalador de Windows**, que existe pero dice de si mismo
que compila y nada mas. **Nada se perdio**: las diez piezas del texto viejo estan, nueve en el
globo. ⚠️ **La marca de provisoriedad se REESCRIBIO en vez de copiarse**: «A confirmar con el
ecografo real» cae bajo la regla fija de que ningun texto de la app dice que algo esta «a
confirmar». La capa de comunicacion y los estados, intactos; el panel con los **mismos 4 controles
con id**.

**BLOQUE 4.** (a) La celda de la CIA pasa de «menos de 1 %» a **«1 %»**, que es lo que la ACC/AHA
2025 imprime en su folio e149 —«unroofed coronary sinus (1%)»; el «<1%» de esa oracion es el del
seno venoso inferior—. Se cambia en el generador y en el marcado, porque el marcado sale de
`_gen_p36tablas.py` y no se retipea, y la mutacion 21 de `_mut_p36.py` queda **invertida**.
(b) **P37-i CERRADO**: el deslizador «Apertura» y su nota se retiran en la rama «faltan datos» de
`wiPintar`, donde el `return` temprano nunca los tocaba; **no se toca `_wiSim.area`**, asi que al
reponer el dato el deslizador vuelve donde estaba.
⚠️ **(c) TC-390 ESTABA DESACTUALIZADO, NO EL CODIGO**, contra lo que la orden suponia, y la
evidencia es triple: la estenosis mitral **ya no es una severidad graduada** —lo declara el
archivo al lado de `emCategoria()`—, la sigla pelada hoy es «EM presente.» —lo afirma **TC-398 en
verde**, y **TC-42** tambien pasa— y **el desplegable no enciende `esqSevManual`**, que es una
regla escrita al lado de `sevSinApagaDesdeSelect`. Adaptado sin aflojarlo, con dos condiciones
**mas fuertes**.

**Cobertura: TC-904 y TC-905**, que caen contra `121bb99` por **7 y 10 condiciones** y **ninguno
por excepcion**. **NUEVE casos adaptados**: TC-390, TC-821, TC-471, TC-490, TC-500, TC-502,
TC-781, TC-833 y TC-842, con **siete condiciones INVERTIDAS**. Los cuatro conteos de `VINFO`
(**143 -> 144** y **69 -> 70**) son la consecuencia autorizada de la clave nueva.
⚠️ **DOS CONDICIONES NO SE PUEDEN MEDIR EN LA VENTANA DEL ARNES (756x469) y se declaran**: que el
cuadro viva en la ranura de arriba —ahi el ancho es **angosto** y vive en la fila **a proposito**,
que es el punto 4 del pedido— y que las **seis** opciones del menu sean alcanzables —con 469 px de
alto la primera queda arriba del borde—. La primera se mide llamando a `lv3dBotonesSync` en **sus
dos ramas**, que es el dueno; la segunda exige que **todas las que entran en la pantalla** lo
sean, y las seis las mide la sonda de dos motores con su ventana de 940.
**Semgrep 126 WARNING / 0 ERROR**, la linea base exacta. **17 de 19 bloques de JS inline parsean.**
**CHROME Y WEBKIT EN LOS 16 CRUCES** de cada bloque (1369 / 1920 / 2560 / 390 px x los dos temas
**reales**, devueltos por la sonda), con cero desplazamiento horizontal, cero textos recortados y
**cero errores de consola y de pagina**.
⚠️ **EL PENDRIVE `DISK_IMG` NO ESTABA MONTADO EN NINGUNO DE LOS 17 LOTES**, asi que los casos que
dependen de el **no prueban nada** en esta corrida y no son cobertura. Queda declarado.
⚠️ **LO QUE ESTA TANDA PAGO**: el **acento grave dentro de mis propios comentarios** en el cuerpo
de un caso —y al sacarlos con un bucle me lleve puestos los del runner, que si los necesita, y el
archivo dejo de parsear por otra razon—; **`__t.show` y `__t.esp` no existen** (los invente: el API
real es `set`, `val`, `limpiar`, `avInc`); **la barra invertida no sobrevive al template literal**,
asi que la clase de espacio llego como la letra «s» y «Constancia» salio «Con tancia»;
**`elementFromPoint` solo ve el viewport**, y el «?» de CeiboLink daba «FUERA» en los dieciseis
cruces por caer bajo el pliegue; y el **boton «What if» vive en la vista 2D**, no en el formulario.
El mapa, en `docs/mapa/pant38-contractilidad-documentos-ceibolink.md`; las sondas, en
`scripts/_probe_p38b1.mjs`, `_probe_p38b2.mjs`, `_probe_p38b3.mjs` y `_probe_p38tam_cuerpo.js`.

**La tanda MEDIR-5 (2026-11-15) — el visor: los siete hallazgos del medico, la barra unica, las
tablas nuevas y la guia de calibracion.** DIECISIETE commits. Sello **`v20261115-1535`**, md5
**`52cb231e`**, **184.022** lineas.
El medico probo MEDIR-4b en Safari, armo una demo y pidio tres añadidos. **Nada de esta tanda
escribe un campo del informe**, y es por construccion: `f[3]` de una fila es la ruta dentro de
`_dop`. El Excel queda en **457** columnas con **cero** campos guardados nuevos, medido.
**DE LOS DIEZ HALLAZGOS, SEIS ERAN DEFECTOS REALES Y TRES NO LO ERAN.** A5 es **por diseño** —la
fila exige el par completo porque `_simpMonoDeS` devuelve VFD, VFS y FEVI juntos—, A9 **no se
reprodujo** con una vista, y A10 **no existia**. Los otros siete quedaron cerrados.
⚠️ **A3 TENIA DOS CAUSAS Y LA SEGUNDA ERA LA QUE DE VERDAD TAPABA.** `#cine-ov` centraba el modal
vertical, asi que al crecer con el resultado el lienzo subia **106 px** y no volvia con «Limpiar».
Pero lo que tapaba los botones era **el `flex-shrink` que vale 1 por omision**: el modal encogia a
sus hijos en cascada y `#cine-lienzo` cedia hasta su `min-height:200px` mientras el canvas se
quedaba en 279, asi que el recorte se desbordaba **39 px arriba —33 de solape con la fila de
botones— y 39 abajo** sobre la barra del video. **Por eso `modalScrollY.desborda` daba 0**: el
encogimiento absorbia el crecimiento en vez de desplazar. Hoy el lienzo y la fila de paneles no
ceden: medido, **subio 0, volvio 0 y desborde 0/0**.
⚠️ **A1 ERA «ALGUNA VISTA» CONTRA «LA ACTIVA».** La visibilidad de cada cajon se decide por «alguna
vista» —con razon, porque `_medHerr` fuera de un manejador envuelto resuelve siempre contra
`_vistaA`— y la ranura era la de la activa: con la A en Doppler y la B en Distancia, el cajon del
VD medido en la B se dibujaba en la columna de la A, que mostraba **DOS** tablas mientras la B no
mostraba **ninguna**. Hoy cada cajon va a la ranura de la vista que lo tiene abierto, y entre dos
candidatas gana **la que esta a la vista** —lo destapo medir a 390 px, donde la app muestra una
vista por vez—. La tabla sigue siendo UNA y sigue moviendose: la decision de MEDIR-4a no se toca.
⚠️ **A8: `medReset` hacia `_medAreas = []`**, asi que el FAC del VD perdia la diastole al mover el
cuadro — y moverlo es OBLIGATORIO. Hoy sobreviven **solo** las dos areas del VD; la AI y la AD se
siguen borrando, que se miden en un cuadro.
**LA BARRA UNICA (B1).** Se va el nivel «Modo»: las tres filas de herramientas se emiten juntas,
con el grupo Doppler en el orden del pedido —Velocidad, VTI, Tiempo, FC—. La fila «Modo» **se
esconde y no se retira**, con la clase `cine-selviejo`: **diecinueve** usos del suite aprietan
`cine-g-*`. Y no rompe los cajones porque `medHerramienta` ya hacia
`_medGrupo = _MED_GRUPO_DE[_medHerr]`. ⚠️ **La fila Estructura no hubo que tocarla**: `_MED_EST_2D`
y `_MED_EST_DOP` **ya** estaban en el orden que B1 pide, y lo encontre midiendo en vez de creerle
al inventario, que me habia dado el orden de otra constante.
**LA TABLA (B2).** Sale el ✏️ y su trabajo lo hace **el propio numero**: tocar el valor abre la
misma escritura a mano, con el mismo atributo y la misma validacion. El guion tambien se toca.
«Borrar» pasa a ✕ y sigue borrando de a uno. Reusa `med-fbot`, que ya traia el area tactil medida:
**se ve de 22 px y se toca en 44**. ⚠️ **El reparto 46/20/34 sale de una medicion, por UN PIXEL**:
con 32 % la celda de acciones dejaba 90 px de contenido y los dos botones necesitan 91 —44 + 3 + 44,
porque 44 es el piso tactil global—, asi que envolvian y una fila con valor medía **89 px contra
45**. Hoy las cinco miden 45.
**LAS CUATRO VALVULAS (B4 a B7), EN UNA COLUMNA.** Las dos no entran y esta medido: dejan 40-46 px
donde hacen falta 91. **CATORCE campos nuevos**, todos reusando el rotulo exacto de la app.
⚠️ **MI CENSO HABIA DICHO QUE SEIS NO EXISTIAN, Y ESTABA MAL EN LOS SEIS**: busque las tres de la
tricuspide bajo la INSUFICIENCIA (`it_`) y viven bajo la ESTENOSIS (`et_`). La leccion: **un grep
por el id que uno imagina no es un censo; hay que buscar por el ROTULO que el medico lee.**
**LOS CALCULADOS, DEBAJO DE LA IMAGEN.** `#cine-calc` es hermano de `cine-biplano`. **Ninguna
formula se escribe ahi**: cada numero sale del dueño unico de la app. El contrato, medido: AVA
**1,5708**, DVI **0,50**, Vol. sistolico **69,115**, indexado **38,015**, GC **4,838 L/min** con FC
70, E/A **1,60**, E/e′ **10,0**, AVM por THP **1,00**, AVM por continuidad **3,456** y PmAD **3
mmHg**. El **DVI** es el unico sin dueño —esta en linea en `calcEADetalle`, que lee el DOM— y se
hace la misma cuenta sin cambiarla.
**LA FC (B8)** sale de `ao_fc` con `hemo_fc` de respaldo —son espejo— y alimenta el GC. Se pinta
**antes** del return temprano de `_dopRender`, porque es «fija debajo de cualquier imagen». Medido:
**cero controles** dentro del bloque, asi que la sola lectura es por construccion.
**LA GUIA DE CALIBRACION (B9)**, con sus **tres** ejes distinguidos. La rama del **tiempo sale sin
boton** a proposito: ese eje no se puede calibrar a mano, y un «Calibrar ahora» que no calibra nada
es peor que no ofrecerlo.
⚠️ **CUATRO DE LOS QUINCE CASOS QUE EL MEDICO PIDIO ADAPTAR NO ERAN ADAPTACIONES: ERAN DEFECTOS
MIOS.** Y es lo que vale de no adaptar a ciegas. (1) **La imagen que se guarda en la biblioteca
habia perdido la AVA, la AVM y los cocientes**: al mover los derivados fuera de `_dopFilas` se los
quite tambien a `_dopSeccionesGuardado` y a `_dopMetaGuardado`, o sea a un artefacto que circula
solo y puede llegar a un PDF firmado — contenido clinico perdido, no maquetado. Hoy se siguen
emitiendo con la marca `f[8] = 'calc'` y lo unico que los esconde es `_dopFilasPantalla`.
(2) **`vciCol: ''` hacia que la tricuspide contara como «ya tiene mediciones»** desde el arranque,
porque el predicado pregunta por `!= null`. (3) **Una vista con la etiqueta escrita y sin medicion
dibujada perdia la etiqueta** al capturar, porque el ruteo de C1 caia en la captura cruda.
**ONCE adaptados de verdad**, cada uno con su decision escrita donde vive la condicion: cinco
**INVERTIDOS** por B1, tres por el conteo de seis botones de C1 y tres por el inventario de filas.
**Once de los quince caen contra `2cd2ee9`**; **cuatro pasan en los dos arboles y se declara**,
porque su cambio fue de lectura o denominador y no una afirmacion.
**Cobertura: TC-899 a TC-903**, los cinco cayendo **0/5** contra `2cd2ee9` y **ninguno por
excepcion**. **17/17 MUTACIONES DIRIGIDAS MUERTAS**, en un worktree y nunca sobre el vivo, con el
md5 del vivo **identico** antes y despues.
⚠️ **EL PRIMER BARRIDO DEJO CUATRO SOBREVIVIENTES Y LAS CUATRO ERAN HUECOS DE COBERTURA**, cerrados
con condiciones nuevas y sin aflojar una sola mutacion. **La peor era mia y es una leccion de
metodo: una condicion que leia el TEXTO FUENTE de la funcion que mide** —si
`String(medSimpsonLimpiarTabla)` mencionaba `_vTodas`— **era tautologica, porque el comentario que
yo escribi dentro de esa funcion lo menciona.** Hoy se mide la conducta: se siembra en las dos
vistas y se exige que las dos queden vacias. Y TC-899 pasó a montar una segunda vista, que es lo
que lo hace probar A1 de verdad — al precio de volverse sensible al lote.
**Linea base al cierre: suite 892/911**, en UNA sola pasada con el archivo de casos DEFINITIVO,
sobre el arbol sellado, con el md5 de `index.html` **identico** antes y despues (`52cb231e`). Los
**19** rojos son los tres de siempre (TC-376, TC-390, TC-406), cinco intermitentes ya declarados
(TC-182, TC-557, TC-562, TC-706, TC-791), **diez de sensibilidad de lote verificados pasando 1/1
aislados** (TC-420, TC-502, TC-601, TC-702, TC-869, TC-892, TC-893, TC-895, TC-897 y TC-899) y
**TC-535**, que queda caracterizado y es preexistente: falla con «NO HAY jsPDF» —la CDN sin
cargar—, pasa **2 de 3** y pasa en `2cd2ee9`. **Ningun rojo nuevo**, y los cinco casos nuevos y los
quince adaptados en verde.
**Semgrep 126 WARNING / 0 ERROR**, la linea base exacta. **CELULAR: 36 ALTA**, y la cifra de este
archivo estaba mal — ver la advertencia del renglon de tamaño. **17 de 19 bloques de JS inline
parsean.** **CHROME Y WEBKIT EN LOS DIEZ CRUCES** (dos motores x 2560, 1920, 1440, 1000 y 390 px)
con resultados **identicos** y cero errores de consola y de pagina.
**D1 ya estaba cumplido** y se verifico midiendo: **cero ⓘ encima de una imagen** y exactamente
**uno** de metodo del Simpson, fuera de la imagen. **D2** no se toco. **D3** queda reportado: el
icono es `cine-maxi` (⛶, «Maximizar el visor») y **NO hay «Minimizar»**, excluido a proposito desde
MEDIR-1.
Lo declarado, en **M5-a** a **M5-q**; el mapa, en `docs/mapa/medir5-visor-barra-tablas.md`; la guia
manual para Safari, en `docs/GUIA_PRUEBA_MEDIR5.md` (**10** pasos).

**La tanda MEDIR-4b (2026-11-15) — el Simpson en dos pasos, los trazados entre vistas y el
resultado integrado.** CINCO commits. Sello **`v20261115-0555`**, md5 **`c875ae0f`**, **183.025**
líneas.
El médico probó MEDIR-4a y pidió el bloque que **M4a-f** dejó escrito. Se cerraron **los TRES
bloques —A, B y C—**. **Ningún campo del informe se escribe en esta tanda**: no se tocó
`_simpEscribirFEVI`, ni `medVtiDiametro`, ni `medVtiCargar`, ni el botón «¿Integrás la FEVI biplano
al informe?» — eso es MEDIR-4c. El Excel queda en **457** columnas con **cero** campos guardados
nuevos, **por construcción**: **cero `input`, `select` y `textarea` nuevos con `id`** y **cero ids
nuevos en el marcado**, contados sobre el diff.
⚠️ **TRES DE LAS CINCO HIPÓTESIS DE LA ORDEN RESULTARON FALSAS, Y UNA DE ELLAS CAMBIÓ QUÉ HABÍA QUE
HACER.** **H1** era media verdad: el cruce **sí** se calcula al vuelo —las nueve claves de una
sesión no incluyen el biplano y dos llamadas dan lo mismo— pero los trazados **NO se pierden**:
`simp` es un campo de la plantilla de vista y los dos pares **coexisten**, medido. **H2 es falsa**:
nada se «pide» en cada trazado —cero diálogos, y ni `_simpAceptar` ni `medSimpsonConfirmar` ni
`medSimpsonElegirVista` traen un `confirm` o un `prompt`—; lo que hay es un selector **persistente**,
y **el hueco real era otro**: la ventana era **opcional** y se podía cambiar **a mitad de un par**,
dejando los dos contornos del mismo par atribuidos a ventanas distintas. **H3 es falsa**: no hay
nada que localizar, `simp` se declara al lado de `medCalib` y `medCalibVel` y `window._simp` es un
**accesor** sobre la vista activa. **H4 confirmada.** **H5 confirmada en su mitad**, y las otras
dos funciones que la orden le cuelga —`medVtiDiametro` y `medVtiCargar`— **no son del Simpson**: son
las del VTI y el diámetro del cajón Doppler.
⚠️ **Y LA ORDEN NO NOMBRABA EL DEFECTO MÁS GRAVE, QUE LA LECTURA ENCONTRÓ Y LA MEDICIÓN CONFIRMÓ.**
`_vBiplanoDatos` cruzaba `pares[0]` de cada vista **POR POSICIÓN** —«el de la vista A hace de 4C y
el de la B de 2C»— y **no miraba `nombres` en ningún momento**: con `a4c` declarado en **las dos**
vistas seguía cruzando y publicaba **58,145 %**, *idéntica* a la del cruce correcto, **SIN UN SOLO
AVISO**; y como `_simpFilasVivas` **deduplica por rótulo**, la fila de la segunda vista
**DESAPARECÍA**. El médico veía **una** monoplanar y un «Biplano» armado con la misma ventana dos
veces. Es exactamente lo que la decisión provisoria (b) manda cerrar, así que el bloque B la
implementó **como un defecto a corregir** y no como una función nueva.
**BLOQUE A — LA VENTANA UNA VEZ, Y LA BARRA DE DOS PASOS.** `_simpIniciar` declara la ventana de la
ranura 0 con **`_simpVentanaLibre()`**, que le **pregunta a la otra vista** y no a un contador —con
un contador, cerrar la vista de la A4C y abrir otra dejaría a las dos en A2C— y recorre **las dos
ranuras** de cada vista. **`_simpVentanaBloqueada()`** cierra el hueco de H2: con un contorno
confirmado la ventana ya no se cambia, y el panel lo dice. Se endureció además
`medSimpsonElegirVista`, cuya condición exigía que la ranura **ya tuviera nombre**, así que una
ranura **con** contorno y **sin** nombre se renombraba igual — justo lo que sus dos líneas de
comentario dicen que no hay que hacer.
La barra es **`_simpPasoChip`** + `_simpPanel`: dos pasos con su tilde, **una** línea de instrucción
y **UN** botón «Listo». **El mecanismo de confirmar y avanzar no se inventó** —`medSimpsonConfirmar`
ya daba vuelta la fase—; lo nuevo es la barra y **`medSimpsonRehacer(f)`**, que rehace una fase
**sin perder la otra** (medido: se borra la diástole, la sístole sobrevive, y al retrazarla la FEVI
vuelve **exacta**).
⚠️ **LOS IDS VAN PREFIJADOS Y EL RUTEO POR `data-simp-pfx`, NO POR LA VISTA ACTIVA**: un id sin
prefijo quedaría **duplicado** con las dos vistas abiertas y el botón de la B se vería sin
responder, y `_V` fuera de un manejador envuelto es **siempre** `_vistaA`, así que un «Listo» que
mirara la vista activa confirmaría en la A estando parado en la B. **Un solo oyente delegado** para
las dos, porque el panel se repinta entero en cada confirmación.
⚠️ **Y «CONFIRMAR TRAZADO» NO SE RETIRÓ A SECAS, PORQUE ESO REINTRODUCÍA UN DEFECTO DOCUMENTADO**:
`_simpPanel` se dibuja **sólo** con la herramienta Simpson activa, así que con el contorno trazado y
sin confirmar, tocar «medir» en el cajón 2D escondía la barra **con su «Listo» adentro**, el médico
cambiaba de cuadro, `medReset` mataba el pendiente y lo trazado se perdía. Se conserva **con su
id** como botón de **RESCATE** y se emite **sólo** cuando la barra no está en pantalla para la vista
del pendiente: hay **un botón visible a la vez**. Medido en los dos estados, y **TC-257 quedó más
fuerte**: hoy exige exactamente **una** superficie en cada uno.
**BLOQUE B — LOS TRAZADOS CONVIVEN, Y DOS VENTANAS IGUALES NO SON UN BIPLANO.** **No hubo que
agregar almacenamiento**: `simp` ya era por vista. **CERO claves nuevas** en el navegador —la única
que aparece al trazar es `ecosmart_autosave`, el autoguardado de la app—. La calibración sigue
siendo por vista: puesta en la A, la B sigue en `null`. El cruce ahora exige que las dos ventanas
declaradas **difieran**, `_vBiplanoMismaVentana()` le da al panel su línea de **una sola oración**,
y el rótulo repetido se **DISTINGUE** («A4C» y «A4C · Vista B») en vez de descartarse — medido:
**DOS** filas monoplanares y cero biplano, y al corregir la ventana el biplano vuelve **con el mismo
número**. ⚠️ **Si una ventana NO está declarada no se bloquea**, y es a propósito: ese caso es el de
una sesión restaurada, y bloquear por no saber le quitaría al médico un biplano que hoy tiene
(**M4b-e**). La decisión **(a)** ya pasaba y queda medida; **(c)** y **(d)** sin cambios.
**BLOQUE C — EL RESULTADO INTEGRADO Y LAS NOTAS AL GLOBO.** **`_simpStat`** publica VFD, VFS y FEVI
**grandes** —medido por su tamaño computado: **20, 20 y 26 px**— con la clasificación de
**`FEVI_CATS`** (sin inventar un corte) y el indexado de **`getBSA()`**, que **no se dibuja** sin
peso o sin talla. La tabla de **tres filas** A4C / A2C / Biplano con sus ocho columnas en mL y mL/m²
**ya existía** desde MEDIR-2. El resultado va **fuera de la columna, después de los paneles y
centrado** (desbalance **0**), sin desborde de tabla, sin desplazamiento horizontal y sin un texto
cortado.
**`_SIMP_NOTAS_METODO` son NUEVE párrafos con las TRECE frases del censo del inventario**: las trece
**dentro** del globo ⓘ y **NINGUNA** en el panel, medido frase por frase. ⚠️ **Entre ellas
«ASE/EACVI 2015», que hasta hoy se imprimía EN LA PANTALLA** — un nombre de guía a la vista, que es
lo que este archivo deja **para el globo**. Viven en **una constante** y no repartidas en los tres
pintores, que es de donde venían: la misma nota estaba en `_simpUniTexto` y en `_vBiplanoPintar`
**con dos redacciones**. El ⓘ se emite **también** en `_simpUniTexto`, porque con un monoplanar ese
panel no se dibuja y las notas quedarían sin puerta. **Se quedan en el panel las DOS advertencias
que dependen de ESTE paciente** —que los cuatro trazados salieron de la misma imagen, y de qué
archivos salieron—: no son notas de método sino un hallazgo sobre los datos en pantalla, y
esconderlas sería tapar el único aviso de que el número de arriba **no** es un biplano (**M4b-b**).
Y se marca `integrada` en las dos vistas tras integrar, **leyendo lo que `_simpEscribirFEVI`
DEVUELVE** —esa función no se tocó—: sin la marca, el panel seguía diciendo «Todavía NO está en el
informe» después de integrarlo.
⚠️ **EL CONTRATO NUMÉRICO SE MIDE SOBRE INSUMOS SEMBRADOS Y NO SOBRE EL GESTO, Y ESO SE DESCUBRIÓ
MIDIENDO**: el mismo triángulo trazado con el ratón da un número **ligeramente** distinto según el
ancho de la ventana, porque las coordenadas de imagen salen de `getBoundingClientRect()` del canvas
y el redondeo a píxel entero cambia —**58,145 %** a 1500 px en una sonda y **58,218 %** en la otra,
los dos correctos—. «Los mismos trazados» quiere decir **los mismos `diamCm` y el mismo `Lcm`**.
TC-898 compara seis valores a seis decimales: VFD monoplanar **49,362027**, VFS **20,03344**, FEVI
**59,41528**; VFD biplano **43,875814**, VFS **18,327059**, FEVI **58,229699**, con **20** discos y
las dos clasificaciones en «normal». **Pasan en los dos árboles a propósito**: son una guarda de
regresión, no lo que discrimina (**M4b-a**).
**Cobertura: TC-896 a TC-898**, los tres cayendo **0/3** contra `74df0b6` con el mismo archivo de
casos y sólo el `index.html` distinto, por **42** condiciones y **NINGUNO por excepción**. **SEIS
casos adaptados**, ninguno borrado y ninguno aflojado: **TC-257** quedó **más fuerte**; **TC-190**
con tres condiciones y **TC-191** con una, las cuatro buscando en el globo lo que se mudó al globo;
**TC-237 INVERTIDA**; **TC-228 INVERTIDA en dos mitades y PARTIDA EN TRES**; y **TC-245** con su
ruta cambiada. **Cinco de los seis caen contra la base**; **TC-245 pasa en los dos árboles y se
declara** en **M4b-c**: su cambio es de **ruta** y de **denominador**, no una afirmación.
⚠️ **Y TC-228 DESTAPÓ UN DEFECTO REAL QUE MI CENSO NO VIO**: `medSimpsonSegundaVista` —el biplano
trazado **dentro** de una sola vista— dejaba la ranura 1 **sin declarar**, así que la etiqueta del
monoplanar decía «A4C» y la del biplano caía a «**2 vistas**»: la mitad de la app nombrando su
ventana y la otra mitad contando, sobre el mismo estudio. Cerrado con el mismo principio de A1, y
**sin usar `_simpVentanaLibre`**, que saltea la sesión en curso y devolvería la ventana que la
ranura 0 ya tiene (**M4b-d**).
⚠️ **EL ACENTO GRAVE DENTRO DE MIS PROPIOS COMENTARIOS, POR VIGESIMONOVENA TANDA SEGUIDA, SIETE
VECES.** Lo que lo caza **no** es `node --check` —pasa cuando lo que queda es JS válido— sino
**contar** los acentos graves del bloque y exigir el número exacto **antes** de insertar: esta vez
el guardián **abortó la inserción**. ⚠️ **Y DE AHÍ SALE UNA MEJORA DE MÉTODO**: el cuerpo de la
sonda vive en un **archivo aparte** (`_probe_medir4b_cuerpo.js`), leído con `readFile` y pasado como
texto, así que los acentos graves son simplemente código y el problema **no existe**. Es lo que esta
casa tendría que haber hecho hace veintiocho tandas.
⚠️ **Y LA VENTANA DEL ARNÉS MIDE 756 px**, o sea por debajo del corte de dos vistas, así que el
canvas de la vista B no tiene ancho útil y las coordenadas mapeadas salen **degeneradas**: la primera
versión de TC-897 trazaba con el ratón y daba `pendiente:false` en la B —un trazado que no entraba
sobre una vista que **sí** estaba abierta—. Se siembra con `_simpAceptar`, el patrón de TC-241,
**conservando el clic real del «Listo»**.
⚠️ **LOS TRES BLOQUES FUERON A UN SOLO COMMIT y no a tres**, contra lo que la orden pide, y se
declara en **M4b-g**: se escribieron juntos porque C depende del predicado de B y B del reparto de
A. **La verificación sí es por bloque.**
**25/25 MUTACIONES DIRIGIDAS MUERTAS**, en un worktree y **nunca** sobre el vivo, con el md5 del
vivo **idéntico** antes y después (`c875ae0f`) y las 25 anclas verificadas **antes** de correr. La
**04** es la que **M4a-f** dejó pendiente: «Listo» confirma pero no pasa a la sístole.
⚠️ **EL PRIMER BARRIDO DEJÓ DOS SOBREVIVIENTES Y DECÍAN COSAS DISTINTAS.** La **18** estaba **mal
escrita**: insertaba la **lectura** de una caché que nadie llenaba, así que la guarda no se
disparaba nunca y el cálculo seguía corriendo igual — una mutación que no cambia la conducta no
prueba nada; reescrita para que **llene** la caché, muere por `b1_sinCampoBiplano`. La **21** era un
**hueco real**: ningún caso pasaba por `medSimpsonSegundaVista` con la ranura 1 sin nombre, así que
el arreglo de **M4b-d** no tenía prueba. Se cerró con **tres** condiciones nuevas en TC-896 y la
mutación se reapuntó de TC-228 —que siembra `pares[1]` a mano y declara por el **selector**, otra
puerta— a TC-896. ⚠️ **Y el barrido tardó 34,8 min, por encima del tope de 25 que la orden fija**:
se declara.
**Línea base al cierre: suite 899/906**, en **DIECISIETE** lotes cubriendo los **906 casos
distintos** —contados con el patrón **completo** del id, **cero duplicados**—, en UNA sola pasada
sobre el árbol sellado, con los **906 ejecutados**, el md5 de `index.html` **idéntico** antes y
después (`c875ae0f`) y el pendrive `DISK_IMG` verificado **diecinueve** veces. Los rojos son
**TC-376, TC-390 y TC-406**, los tres de siempre; **TC-182** y **TC-551**, los dos sensibles al lote
ya declarados; **TC-753**, que tenía razón —`CLAUDE.md` todavía publicaba el sello anterior— y quedó
**verde** al actualizarlo; y **TC-147**, que **no está en ninguna lista** y quedó caracterizado:
**intermitente en los DOS árboles**, 1 de 3 en el vivo y **2 de 3 en la línea base**, así que es
**preexistente** y no de esta tanda. **Ningún rojo nuevo**, y los tres casos nuevos y los seis
adaptados en verde.
**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta, sin un aviso nuevo. **Sin huérfanos
nuevos.** **17 de 19 bloques de JS inline parsean**, idéntico a la línea base. **CELULAR: 59
hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta.
**CHROME Y WEBKIT EN LOS 32 CRUCES** —dos motores × ocho anchos (1500, 1440, 1369, 1368, 1280,
1000, 768 y 390) × los dos temas **reales**, devueltos por la sonda—, con **CERO errores de consola
y de página** y **UNA sola firma de valores en 24 de los 32**. Los otros ocho son **dos desvíos
caracterizados**: a 1369 px el centrado da **1 px** en vez de 0 —un redondeo, nada se corta— y a
390 px **el trazado de la vista B no se registra**, que es un **límite de la medición y no de la
app** —a ese ancho con dos vistas el canvas de la B no tiene ancho útil y las coordenadas mapeadas
salen degeneradas, el mismo problema que TC-897 sortea sembrando con `_simpAceptar`—. Declarados en
**M4b-j**.
⚠️ **EL A/B DEL PAPEL NO SE CORRIÓ COMO ARNÉS DE 121 ESCENAS, y se declara (M4b-i)**: lo que lo
sustituye es el **censo del diff** —cero funciones del papel tocadas, cero referencias a `fevi` o
`fevi_met`, y `_simpEscribirFEVI` sólo como llamada— y la **batería completa** con **TC-135**,
**TC-479**, **TC-824** y **TC-831** en verde, que son los casos que esta casa ya usa para fijar las
**457** columnas y los cero campos guardados nuevos.
Lo declarado, en **M4b-a** a **M4b-j**; el mapa, en `docs/mapa/medir4b-simpson-dos-pasos.md`; el
inventario del bloque 0 con las cinco hipótesis, en `docs/INVENTARIO_MEDIR4B.md`; las fichas de los
tres casos, en `docs/mapa/tests-fichas-896.md`; las sondas, en `scripts/_probe_medir4b0.mjs` y
`scripts/_probe_medir4b.mjs` (+ su cuerpo); la guía manual **para Safari**, en
`docs/GUIA_PRUEBA_MEDIR4B.md` (**10** pasos).

**La tanda MEDIR-4a (2026-11-15) — las dos vistas alineadas, el cierre por vista, el resultado
abajo, la casilla de Anahí retirada y «+ Vista» con imágenes fijas.** SEIS commits. Sello
**`v20261115-0250`**, md5 **`359755ea`**, **182.653** líneas.
El médico probó MEDIR-3 y pidió cinco bloques. Se cerraron **CUATRO —A, B, E y C—**, cada uno con
su commit y su verificación parcial; **el bloque D no se empezó** y queda declarado en **M4a-f**,
que es lo que la orden manda («lo primero que cae es D»). **Esta tanda NO escribe en ningún campo
del informe**: no se tocaron `_simpEscribirFEVI`, `medVtiDiametro` ni `medVtiCargar`, ni el botón
«¿Integrás la FEVI biplano al informe?» — eso es de la tanda siguiente. El Excel queda en **457**
columnas con **cero** campos guardados nuevos, por construcción: **cero `input`, `select` y
`textarea` nuevos con `id`**, y lo único que se RETIRA es un control sin `id`.
⚠️ **DOS PREMISAS DEL INVENTARIO DEL BLOQUE 0 SE DIERON VUELTA AL RE-MEDIRLAS, Y LA PRIMERA CAMBIÓ
EL DISEÑO DEL BLOQUE A.** (1) **`_dop` y `_d2` NO son estado por vista: son estado de MÓDULO**, uno
por overlay. Lo que aquella sonda medía eran los arreglos crudos de cada vista, que sí lo son. Y es
**a propósito**: su propio comentario dice que «el cajón acumula entre imágenes A PROPÓSITO —la
ecuación de continuidad lo exige: el VTI del TSVI y el de la válvula aórtica se miden en planos
distintos— y con DOS vistas abiertas esos dos planos pueden ser dos pantallas». **Partir la tabla
en una por vista dejaría a la AVA sin poder calcularse**, que es contenido clínico, así que se
**adaptó sin inventar**: la tabla sigue siendo una sola y se **muda a la columna de la vista que se
está midiendo**, y lo que distingue el origen de cada número es la **marca por fila que ya
existía** (`_dopSufOrigen`), que sólo aparece con más de un origen — medido: con una vista la fila
dice «TAPSE», con dos dice «TAPSE · A» y «VD basal · B». Declarado en **M4a-c**. (2) **El corte de
ancho es 1369 px y no 1368**: medido barriendo la ventana de 1500 a 1180, a 1369 la imagen mide
**300 px exactos** y a 1368 mide **299**, uno por debajo del piso que la orden fija.
**BLOQUE A — LA ALINEACIÓN, EL CIERRE POR VISTA Y EL RESULTADO ABAJO.** `_vPanelHTML` ya era la
única plantilla; lo que no era igual eran los botones. Hoy las dos barras tienen los **mismos
SIETE** en el **mismo** orden: **`cine-cerrar-v` se emite en las DOS**, última posición, mismo
rótulo y mismo índice, y **va en la barra y no en el encabezado** porque ahí la regla de
`.cine-barra` le fija los 44 px exactos —en el encabezado su piso táctil hacía el de la B **30 px
más alto**, y con él la barra y la imagen de la B arrancaban más abajo—. **«➕ Vista» y «Cerrar» se
mudaron al encabezado del modal** conservando sus ids, sus funciones y la clase `cine-grp-vista`
de la que cuelga el modo mínimo: en la barra eran dos botones más que en la B, así que a 1280 y
1180 la A envolvía en **tres** líneas contra las **dos** de la B, **38 px** de diferencia.
**`vistaCerrarUna(V)` cierra una vista cualquiera y, con una sola abierta, el visor.** La que
sobrevive pasa a ser `_vistaA` **conservando su prefijo y su `rot`**: no se renombran los ids del
panel, y **`rot` no se toca** porque de él sale la marca de origen de cada fila ya medida —
reescribirlo haría que las mediciones del médico dijeran que salieron de otra imagen—. Que el
rótulo que queda sea «Vista B» es la decisión provisoria, declarada en **M4a-a**.
⚠️ **LA VISTA QUE SOBREVIVE SE ACTIVA *ANTES* DE DESTRUIR EL PANEL**, y de eso depende que los
cajones no se vayan con él: desde esta tanda viven en la ranura de la vista activa, así que quitar
el panel de la A se llevaría los dos nodos **con sus oyentes delegados** y la tabla no volvería.
⚠️ **Y NO VA ENVUELTA EN `_vBind`**: ese `finally` repone la vista anterior, así que cerrando la
vista activa dejaría `_V` apuntando a la **destruida** y el clic siguiente escribiría en una imagen
que ya no está en el documento. (Hasta MEDIR-3 el de la B andaba por casualidad.)
⚠️ **`vistaBAbrir` TOMA EL PREFIJO LIBRE Y NO SIEMPRE `b-`**: desde que se puede cerrar la A, la
que queda puede ser la del `b-`, y montar otra con `b-` dejaría una treintena de ids **duplicados**
con el panel nuevo dibujado sin responder a un solo clic. **Medido: cero ids duplicados** en los
cuatro escenarios.
**`_vSlotSync()`** muda `cine-dop-slot` y `d2-cajon` a la ranura de `_V` —que ahora existe en las
dos vistas, prefijada— desde `_dopRender` y `_d2Render`, que es el único momento en que se sabe de
qué vista es el número que se va a dibujar. **No mueve nada si ya está en su ranura**, y no es una
optimización: mover un nodo que contiene al elemento **enfocado** le quita el foco, y los dos
render corren después de apretar un botón de adentro del propio cajón.
**`cine-biplano` y `cine-simp-uni` se quedan DEBAJO de los paneles**, centrados con margen
automático y 780 px de ancho máximo. Es una **reversión explícita** de una decisión de MEDIR-1, por
pedido del médico, y **sólo del resultado**: los dos cajones siguen mudándose a la columna.
**La columna baja a 340 px con dos vistas a partir de 1369 px**; por debajo, la fila envuelve y las
medidas bajan debajo de su imagen. **Los anchos medidos**: imagen **365 / 335 / 603 / 553** y
columna **340 / 340 / 603 / 553** a 1500, 1440, 1280 y 1180; y 339 a 1448, 315 a 1400, 301 a 1372 y
**300 exactos a 1369**. ⚠️ **Por debajo del corte el modal se desplaza** —342 px a 1280 y 303 a
1180—, inherente a apilar las dos mitades y declarado en **M4a-b**; **cero desplazamiento
horizontal** en los dieciséis cruces, y con una vista **cero** vertical en los cuatro anchos.
⚠️ **NO SE RECORTÓ NI SE AMPLIÓ LA IMAGEN**: el canvas sigue midiendo `cols × filas` en píxeles y
`_medPintar` sigue calzando el overlay contra `cine-recorte`, así que la calibración no se entera.
**BLOQUE B — NO NECESITÓ CÓDIGO PROPIO, Y ES MEDIBLE.** La disposición de una sola vista sale de la
**misma plantilla única** y del **mismo traslado del resultado** que el bloque A: la columna
arranca a la derecha del lienzo, los dos paneles de resultado están **fuera** de `.cine-col-der` y
**después** de `#cine-paneles`, el desbalance contra el modal es **0** y mostrando el resultado **el
panel no se mueve un píxel** (380 → 380 y 1050 → 1050). Declarado antes de commitear.
**BLOQUE E — SALE LA CASILLA DE ANAHÍ DE CADA FILA.** La tabla vuelve a **TRES** columnas con el
`colgroup` en **42 / 26 / 32 %** y el `colspan` del separador en **3**; el 10 % que deja la casilla
se reparte entre las tres y no se le da todo a una, porque con la columna en 340 px el nombre es el
que envuelve primero. `anahiCeldaHTML` y la clase `anahi-cel` se retiran **con su lápida** y el
oyente delegado deja de mirarla: le queda `.anahi-btn`. **Lo que NO se tocó**: los dos botones «Para
Anahí», el cartel con su aviso corto, el bloque de Configuración, el estado único y el nombre
único. **Nada se envía y nada se guarda**, que es lo que ya pasaba: la casilla nacía deshabilitada,
con candado y con `pointer-events:none`.
**BLOQUE C — «+ VISTA» OFRECE LOS CINELOOPS Y LAS IMÁGENES FIJAS.** El motivo escrito del filtro
viejo vale para el tipo `'doc'` y **no** vale para una fija, que es una imagen del paciente y se le
puede medir distancia, área y Doppler. **`_vEsFija(r)` es el único predicado** y lo leen la marca de
la miniatura, el texto del pie y la marca de la vista. **La deduplicación usa el criterio que el
bloque 0 dejó escrito**: la misma terna nombre + cuadros + bytes es el **mismo archivo** y se
muestra **UNA** vez; dos con igual nombre y distinto peso son **dos** y se distinguen con su
ordinal **«(1 de 2)»** y con su **peso**. ⚠️ **Y EL PICKER PUBLICA LA LISTA QUE DE VERDAD DIBUJÓ**
(`_vPickLista`): el índice que resuelve es de **su** lista, así que con un duplicado descartado
quien llama abriría el registro de al lado — **un dato del paciente equivocado, en silencio**.
**El Simpson queda bloqueado en una vista de imagen fija por una CUARTA capa de `medHerramienta`**,
la misma cadena que ya existe para Deformación con el módulo apagado y para Velocidad sobre un modo
M: cae a Distancia y sale un mensaje de **UNA** línea, con el botón **apagado y a la vista** y el
motivo en su título, mientras **Distancia, Área y las de Doppler siguen disponibles**.
⚠️ **EL PREDICADO ES UNA MARCA DE LA VISTA (`V.esFija`) Y NO UN CONTEO DE CUADROS, Y LA DIFERENCIA
ESTÁ MEDIDA**: **siete** casos del suite —TC-196, TC-227, TC-228, TC-237, TC-239, TC-241 y TC-245—
trazan Simpson sobre fixtures de **un** cuadro, porque el visor siempre lo permitió sobre una imagen
suelta del pendrive. Un predicado por `frags.length` los habría puesto rojos a los siete y habría
**sacado una función que el pedido no manda sacar**. **La marca se suelta en `_cineAbrir`**: el
objeto de la vista A sobrevive al cierre del visor y una marca pegada dejaría el Simpson bloqueado
sobre el cineloop **siguiente** — la trampa que `_clnkPorConfirmar` y `data-pop-mano` ya pagaron.
Lo que cuesta, declarado en **M4a-d**: por **otra** puerta —el pendrive, la tira— el Simpson sobre
una imagen de un solo cuadro sigue disponible, como antes de esta tanda.
**CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1500, 1440, 1280 y 1180 × los
dos temas **reales**, puestos por `ett_theme` + `loadTheme()` y **devueltos** por la sonda), con
**UNA sola firma de valores** y **CERO errores de consola y de página**: las dos imágenes a **0** px
de diferencia de altura y de alto, las dos barras a **0** y **0**, los sliders a **0**, mismo orden,
**7 y 7** botones con **2 y 2** líneas, **44 px exactos** y 118 de ancho los catorce, encabezados
con **0** botones, el peor contraste **5,96 de noche y 4,70 de día**, el resultado con desbalance
**0** contra el modal **y 0** contra el punto medio de los dos paneles, la tabla pasando de
`cine-panel` a `b-cine-panel` y volviendo, **42** botones táctiles, **CERO** por debajo de 44 px,
**CERO** pares de áreas solapadas, **CERO** valores de celda cortados, **CERO** textos recortados y
**CERO** desplazamiento horizontal. Los **cuatro escenarios de cierre** y el **bloque C de punta a
punta** se ejercitaron con el **gesto real** en los dos motores, con el mismo resultado.
⚠️ **WebKit de Playwright no es Safari, y se declara** — y el médico usa Safari. Chrome va por el
del sistema.
**Cobertura: TC-892 a TC-895 nuevos**, los cuatro cayendo contra `e7a1f3e` con el mismo archivo de
casos y sólo el `index.html` distinto, **por 44 condiciones (9 + 10 + 9 + 16) y CERO excepciones**.
**ONCE casos adaptados**, ninguno borrado y ninguno aflojado: **TC-882** con sus bloques (A), (D) y
(E) **INVERTIDOS**, **TC-886** con su (a) **INVERTIDO** y el disparador del cartel pasando de la
celda al **botón**, **TC-257** y **TC-888** con su conteo **INVERTIDO** —tres columnas y siete
botones—, **TC-249** con su `colspan`, y **TC-262, TC-883, TC-885, TC-887, TC-889 y TC-891** con
sólo el **filtro** de filas de su lector. **Los cinco primeros caen contra la base**; los seis del
filtro **pasan en los dos árboles** y se declaran: su cambio es un **denominador**, no una
afirmación.
⚠️ **OCHO CASOS LOS DESTAPÓ LA BATERÍA COMPLETA Y NO MI CENSO**, y las dos causas están en
**M4a-g**: el filtro `children.length >= 4` vivía en **seis** lectores distintos con seis nombres de
variable distintos, y **TC-257 y TC-888** afirmaban su conteo con la palabra «CUATRO» y «ocho» en su
rótulo y un `=== 4` / `=== 8` en el cuerpo, así que buscar «med-tabla» no los encontró.
**TRES MUTACIONES DIRIGIDAS, LAS TRES MUERTAS**, en un worktree y **nunca** sobre el vivo, con el
md5 del vivo **idéntico** antes y después (`359755ea`) y las tres anclas verificadas **antes** de
correr: el «Cerrar vista» de la A cerrando todo el visor mata **TC-893** por 7 condiciones, la barra
de la A con un botón más mata **TC-892** por 3, y la tabla que se queda en la columna de la A mata
**TC-893** por 3. **La cuarta que la orden pide —«Listo» no pasa a la sístole— es del bloque D y
queda con él.**
**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta, sin un aviso nuevo. **Sin huérfanos
nuevos.** **17 de 19 bloques de JS inline parsean**, idéntico a la línea base. **CELULAR: 59
hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta, medida con la
máquina sola.
**Línea base al cierre: suite 896/903**, en **DIECISIETE** lotes cubriendo los **903 casos
distintos** —contados nombre por nombre con el patrón completo del id, **cero duplicados**—, en UNA
sola pasada sobre el árbol sellado, con los **903 ejecutados y CERO salteados**, el md5 de
`index.html` **idéntico** antes y después (`359755ea`) y el pendrive `DISK_IMG` verificado
**diecinueve** veces: al abrir, en cada uno de los diecisiete lotes y al cerrar.
Los rojos son **TC-376, TC-390 y TC-406**, los tres de siempre, más **cuatro de sensibilidad de
lote, los cuatro caracterizados y los cuatro VERDES corridos aislados**: **TC-551** —el que `COR-f`
declara, que mide el chorro de la orejuela sin pausar la animación: **3 de 3** verde solo, y 1 de 2
en un lote de cinco—, **TC-557** —el que `TGA-h` declara—, **TC-562** y **TC-706** —éste declarado
como preexistente en PANT-32, junto con TC-182 y TC-791—. **Ningún rojo nuevo**, y **los cuatro
casos nuevos y los once adaptados en verde**.
⚠️ **ES LA SEGUNDA PASADA, Y LA PRIMERA NO SE INFORMA PORQUE FUE UN ERROR MÍO**: edité
`scripts/test_clinico.mjs` **mientras corría** —la trampa que este archivo documenta y que MEDIR-2
ya pagó por la misma puerta— así que los lotes de antes y los de después usaron archivos distintos.
Dio **894/903** y sirvió de **diagnóstico**: destapó **TC-257** y **TC-888**, los dos míos. Esta
casa no informa un número de una pasada hecha con un archivo de casos anterior.
⚠️ **Y TC-143 SALIÓ VERDE EN LA PASADA LIMPIA, PERO ES INTERMITENTE EN LOS DOS ÁRBOLES Y SE
DECLARA**: falla con «Chart is not defined», o sea Chart.js del CDN sin terminar de cargar. Medido
tres veces de cada lado con la CDN respondiendo 200: **3 de 3 verde en el árbol vivo** y **1 de 3 en
la línea base**. No es de esta tanda.
Lo declarado, en **M4a-a** a **M4a-h**; el mapa, en `docs/mapa/medir4a-vistas-cierre.md`; las
fichas de los cuatro casos, en `docs/mapa/tests-fichas-892.md`; las sondas, en
`scripts/_probe_medir4a.mjs`, `scripts/_probe_medir4cierre.mjs` y `scripts/_probe_medir4c.mjs`; la
guía manual, en `docs/GUIA_PRUEBA_MEDIR4A.md` (**12** pasos).

**La tanda MEDIR-3 (2026-11-14) — el panel del visor, los botones, la calibración de velocidad con
dos valores y el FAC del VD.** CUATRO commits. Sello **`v20261114-2057`**, md5 **`6545b13e`**,
**182.292** líneas.
El médico probó MEDIR-2 **en Safari** y pidió cambios al panel de medidas. Se **descartaron** la
tabla única con todos los datos y la biblioteca de medidas: no se construyen. **No** entran las dos
vistas, la casilla «A la app» ni escribir en ningún campo del informe — eso va en el prompt
siguiente. **Nada de esta tanda llega al papel**: no escribe un campo del informe, no toca el EN
SUMA, el PDF, el PPT ni el Excel —que queda en **457** columnas con **cero** campos guardados
nuevos, por construcción: **cero `input`, `select` y `textarea` nuevos con `id`**— y **las cuatro
rutas al informe quedan ejercitadas de verdad** y no sólo verificadas sobre el diff.
**LAS CINCO HIPÓTESIS DE LA ORDEN QUEDARON CONFIRMADAS, UNA CON MATIZ.** H1: `tablaCols` reparte
las filas por `f[6]` en **DOS tablas lado a lado** dentro de una columna de 310 px, y el cajón
desbordaba **179 px en Chrome y 181 en WebKit**. ⚠️ **Y NO ERA SÓLO EL REPARTO**: el cajón 2D, con
**UNA** tabla de cinco columnas, desbordaba **32 / 34 px** — las cinco columnas no entraban ni
solas. H2: `vi.tsvi` es alias de `ao.diam`, así que mover la fila no toca el valor compartido ni la
ruta `diam_tsvi`. **H3 con matiz**: el cero era el **primer clic**, asumido **sin preguntar su
valor**, y sólo se pedía el de la segunda marca. H4 y H5, confirmadas tal cual.
⚠️ **Y DOS PREMISAS DE LA ORDEN SE DIERON VUELTA, LAS DOS MEDIDAS ANTES DE TOCAR NADA.** (1) **El
punto A7 YA funcionaba** para el cambio de estructura: `_d2Filas()` devuelve `[]` sin grupo elegido
y las filas de un solo grupo cuando hay uno, así que ya se mostraba una tabla por estructura, la
anterior ya desaparecía, al volver ya reaparecía con su valor, y 2D → Doppler → 2D también. Lo que
**sí** quedaba apilado eran las dos tablas del reparto y la de «Mediciones sin asignar», y es lo que
esta tanda cerró; la condición nueva de TC-887 afirma lo que ya andaba **para que no se pierda**.
(2) **El punto B tenía dos culpables con nombre** —`cine-guardar` y `cine-med-cap`, por la clase
`cine-b-alto`— y además algo que la orden no nombraba: **el azul del modo no llegaba a 4,5:1**.
**A1 — EL NEGRO DE LOS COSTADOS PASA DE 228 px A CERO.** Vivía en `cine-lienzo`, que ocupa la
columna; hoy vive en **`cine-recorte`**, que tiene el tamaño de la imagen. El tope del modal sube de
**1180 a 1500 px** —1412 reales a 1440 de ventana—, con lo que la columna de la imagen pasa de 828 a
**990 px** y la de medición de 310 a **380** al mismo tiempo; el lienzo sube de `56vh` a `66vh` y su
acote de `−230px` a `−190px`.
⚠️ **NO SE RECORTÓ LA IMAGEN, NO SE LE HIZO ZOOM Y NO SE TOCÓ SU GEOMETRÍA**: el canvas sigue
midiendo `cols × filas` **en píxeles** y `_medPintar` sigue calzando el overlay contra
`cine-recorte`, así que `_medPunto` devuelve las mismas coordenadas de imagen y la calibración no se
entera. **Un archivo MÁS CHICO que la caja no se amplía**, y es a propósito: interpolar píxeles que
el ecógrafo no midió **es** hacerle zoom, que la orden prohíbe. Declarado en **M3-c**.
**A2 — EL SELECTOR QUEDA FIJO.** El `overflow` baja de `.cine-col-der` al **`.cine-der-scroll`**
nuevo, que envuelve el panel guía y la ranura de los cajones; `cine-side` es su **hermano** y lleva
`flex:0 0 auto`. ⚠️ **Y ESO NO ES DECORATIVO**: el valor inicial de un hijo flex es
`flex-shrink:1`, así que con la tabla larga el navegador le robaba alto al selector antes de
desplazar nada, y sin `min-height:0` en el scroller el desplazamiento vuelve a la columna.
**A3 — UNA MEDIDA POR FILA.** Se retira **`tablaCols`** con su lápida, y la tabla pasa de cinco
columnas a **CUATRO** con la unidad **dentro** del valor. Medido: `dopScrollX` y `d2ScrollX` en
**cero** y **cero** pares lado a lado en los ocho cruces. El nombre y la botonera **envuelven**, que
es el «se parte en dos renglones» del pedido. **Las mediciones sin asignar entran en la MISMA
tabla**, detrás de una fila separadora: no se retiran, porque `_dopCapturar` cae en ellas cuando
nadie armó un destino.
**A4 — EL VALOR EN 17 px Y PESO 700, LA UNIDAD EN 9,5, EL NOMBRE EN 10,5, Y NUEVE TEXTOS MOVIDOS A
UN GLOBO ⓘ.** Diálogo propio con `role="dialog"`, `aria-modal`, foco en «Entendido» y Escape con
`stopImmediatePropagation` —sin eso Escape cerraría **el visor**—, que **se destruye al cerrar**.
**Ninguno se perdió**, y el caso los busca uno por uno dentro del globo con `_medPanelInfo`; el
panel **no los imprime**, que es lo que distingue mover de duplicar. El texto **no pasa por el
marcado**: el botón lleva una clave y el texto vive en `_MED_INFO`.
**A5 — EL VI QUEDA SIVd, DDVI, PPd, SIVs, DSVI, PPs Y EL DIAM TSVI PASA A AORTA**, conservando la
clave `vi.tsvi`. ⚠️ **Y HUBO QUE ARREGLAR `_d2GrupoConDatos`, QUE DERIVABA EL GRUPO DEL NOMBRE DEL
CAMPO**: con la fila en Aorta, el punto de «ya tiene mediciones» habría salido en **VI**, donde ya
no hay ninguna fila que lo muestre, y de ese predicado cuelgan además el aviso de «Limpiar» y la
compuerta de guardado. Hoy el reparto vive **una** vez, en `_D2_FILAS_DE`, y lo leen las dos
funciones.
**A6 — SALE «VOLUMEN»**, y retirarlo **no toca ningún cálculo**: nunca llevó id de herramienta ni
entró en `_MED_HERRS`.
**B — LOS OCHO BOTONES EN 44 px EXACTOS Y 118 DE ANCHO, MISMA FILA.** Antes eran 44 y **56**:
`cine-b-alto` daba 56 px y el azul de acento a dos **acciones**. Hoy el único azul es `cine-medir`,
que es el modo, y al apagarlo **no queda ninguno**. ⚠️ **Y EL CONTRASTE DEL AZUL NO LLEGABA**:
blanco sobre el azul de noche da **3,21:1** —los otros siete dan de 13,2 a 15,9—. Hoy el rótulo lo
deriva **`_medTextoSobre`**, el mismo de MEDIR-2, y el peor caso pasa a **5,96 de noche y 4,70 de
día**. **No se tocó `.btn-primary` ni `--accent`**, que viven en la hoja global.
**C — LA CALIBRACIÓN TOMA DOS PUNTOS CON EL VALOR DE CADA UNO, EN m/s.** `_medCalVelDos` es **pura
y expuesta** y su cuenta sale de la **única** fórmula que lee la velocidad, para que no haya dos
modelos del mismo eje. Medido con el ejemplo literal del pedido: marcas en **0,5 y 1,0 m/s** dan
**0,5 cm/s por píxel**, el **cero en y=500** —o sea **fuera** del tramo marcado— y leen 50 y 100
cm/s en las dos alturas, **con el orden de las marcas sin cambiar nada**. Rechaza el mismo valor y
las marcas a menos de 5 px, con un mensaje de una línea. **La línea del cero se dibuja rotulada
«0»**, medida por píxeles —**742** de tinta en su banda y **cero** a 120 px, con su control
negativo—, y **se dibuja aunque no haya ninguna velocidad medida**: el cero ya no se marca, **sale**
de los dos valores. El **modo M** apaga la herramienta por **tres capas** y «Recalibrar vel.» se
conserva; con la escala del archivo no se pide calibrar, que ya era así.
⚠️ **`medCalVelP0` ES ESTADO POR VISTA Y NO UNA VARIABLE DE MÓDULO**: con las dos vistas abiertas,
calibrar en la A y empezar en la B compartirían el punto a medio marcar y el segundo clic de la B se
combinaría con el valor tipeado en la A. Se suelta en las **cinco** puertas.
**D — EL VD ENTRA AL GESTO DE ÁREA EN SUS DOS FASES**, porque el FAC sale de **dos** contornos y la
aplicación tiene que saber de cuál es cada uno. Su tabla da **tres** filas con los rótulos **exactos
de la app** más «FAC VD (%)» calculada, en cursiva y sin botones; la del FAC **no se dibuja hasta
tener las dos áreas** y con la sistólica mayor avisa en una línea. **NO escribe un solo campo**, y
se mide: el censo de **todos** los controles del documento fuera del visor es **idéntico** antes y
después, y `vd_fac` del formulario queda vacío. **Y no publica ningún corte clínico.**
**E — «Vmax pulmonar» TOMA LA BANDA DE `vp_vmax`, [0,2 – 8] m/s**, que es un **filtro contra errores
de tipeo y no un corte diagnóstico**, por el camino de `_dopNormalizar` que ya existía. Es la
primera de las dos preguntas que **M2-c** dejó abiertas. **Las dos de la IP quedan sin banda**:
`ip_vmax` e `ip_vtd` no tienen rango en ninguna de las dos tablas de la app, así que no hay nada
que prestarles — **M3-b**.
**CINCO DEFECTOS MÍOS QUE ENCONTRÓ LA MEDICIÓN Y NO LA LECTURA.** (1) `_medVelBloqueadaM` miraba
sólo `uy === CM`, así que bloqueaba Velocidad sobre **cualquier imagen 2D** y con eso **el cajón
Doppler dejaba de dibujarse**: `dopTablas` **2 → 0** en los ocho cruces. Modo M es `uy === CM` **y**
`ux !== CM`. (2) Dejé viva la cadena `else if` de `_d2Filas`, que **reasignaba** las filas con las
listas viejas: el dueño único valía sólo para el VI y el Diam TSVI **no se dibujaba** en Aorta — el
patrón de dos dueños, introducido al cerrarlo. (3) `_medFacVD(20, null)` devolvía **100 %**, porque
`Number(null)` es 0. (4) `_medInfoBoton` se llamaba **dos** veces para el mismo globo y la segunda
**sobrescribía** sus cinco textos. (5) El relleno de la celda era 5 px, así que la fila medía 32 y
dos botones de filas **consecutivas** tenían **cuatro pares** de áreas táctiles solapadas — la
cuenta de MEDIR-2 pagada en el otro eje: 22 + 11 + 11 = 44 exactos.
**DOS TRAMPAS DE ESCRITURA, LAS DOS DE ESTA CASA.** El **acento grave** dentro de mis propios
comentarios, por **vigesimosexta** tanda seguida: **seis** veces, en las dos sondas y en cuatro
casos, y lo único que lo caza es `node --check` porque lo que queda a veces es JS **válido**. Y la
**barra invertida** de una expresión regular que no sobrevive al template de una sonda —`/rgb\(/`
llega como un grupo—, cerrada **no usando ninguna expresión regular**.
**Cobertura: TC-887 a TC-891**, y **DIEZ adaptados** —TC-882, TC-883, TC-885, TC-257, TC-262,
TC-197, TC-249, más **TC-193, TC-251 y TC-256** que la batería destapó—, con **cinco condiciones
invertidas**. **Los QUINCE caen 0/15 contra `3e64801`** con el mismo archivo de casos y sólo el
`index.html` distinto, y **ninguno por excepción**.
⚠️ **TC-890 CAÍA POR EXCEPCIÓN Y HUBO QUE CERRARLO**: `_medCalVelP0` no existe en la línea base y un
acceso pelado tira `ReferenceError` que se lleva el caso entero —la condición «sin excepciones» sale
roja y las veinticuatro de abajo no llegan a evaluarse—. Es lo que TC-827 deshizo en PANT-37.
⚠️ **Y DOS CONDICIONES NO SE PUEDEN MEDIR EN LA VENTANA DEL ARNÉS (756×469)**: el ancho del modal se
mide por su **tope computado** —ahí se pinta en 728— y «los ocho en la misma fila» lleva su
**denominador**, con el solape de las líneas envueltas en su lugar. Es la lección de TC-244.
⚠️ **Y LOS CINCO CASOS NUEVOS SALIERON ROJOS SIN DIAGNOSTICAR NADA EN SU PRIMERA CORRIDA**, por no
devolver su IIFE: el runner dice «el caso no declara NINGUNA condición». Lo documenta la nota de
TC-753 y lo pagué igual.
**TRES MUTACIONES DIRIGIDAS, LAS TRES MUERTAS**, en un worktree y **nunca** sobre el vivo, con el
md5 del vivo **idéntico** antes y después y las tres anclas verificadas **antes** de correr: el cero
de la calibración vuelto al punto del clic mata **TC-890**, el Diam TSVI devuelto al VI mata
**TC-257**, y la tabla que no se restaura al volver a su estructura mata **TC-887**.
**CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES** (dos motores × 1440×900 y 1280×800 × los dos temas
**reales**, puestos por `ett_theme` + `loadTheme()` y **devueltos** por la sonda), con **UNA sola
firma de valores** salvo el contraste, que es por tema: el negro en **0** con el lienzo transparente
y el recorte negro, el modal con su tope en 1500, la columna en **380**, el canvas en **600×500**,
el scroller con los cajones y el selector afuera, los **ocho** botones en **44 px** con **un** azul
prendido y **cero** apagado, el peor contraste **5,96 / 4,70**, **una** tabla de **cuatro** columnas
con **cero** pares lado a lado y **cero** desborde, valor **17** y unidad **9,5**, área táctil de
fila **44** con **cero** solapes, **dos** globos ⓘ con sus cinco y cuatro textos, el VI en su orden
nuevo, el Diam TSVI **en Aorta** con el punto en Aorta y no en VI, A7 en sus dos formas, la
calibración dando **0,5** y **500**, el FAC en **40 %** con el censo **idéntico**, la banda
**[0.2,8]** y las dos de la IP en `null`, **cero** textos recortados, **cero** desplazamiento
horizontal y **CERO errores de consola y de página en los dos motores**.
⚠️ **WebKit de Playwright no es Safari, y se declara** — y el médico usa Safari. Chrome va por el
del sistema.
**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta, sin un aviso nuevo. **Sin huérfanos
nuevos.** **17 de 19 bloques de JS inline parsean**, idéntico a la línea base.
**CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta,
medida con la máquina sola. **Y LAS CUATRO RUTAS AL INFORME, EJERCITADAS DE VERDAD** y no sólo
verificadas sobre el diff: la sonda siembra la entrada de cada una por donde la app la toma y mira
el **campo**, con su denominador —los cuatro arrancan vacíos—: `diam_tsvi` **21.5** cargado **desde
la tabla de Aorta**, `itv_tsvi` **22.4**, `vti_tsvd` **18.6** y `fevi` **58**, en los **dos**
motores, con el alias cruzando al cajón Doppler.
**Línea base al cierre: suite 894/899**, en **DIECISIETE** lotes cubriendo los **899 casos
distintos** —contados nombre por nombre con el patrón completo del id, **cero duplicados**—, en UNA
sola pasada sobre el árbol sellado, con los **899 ejecutados**, el md5 de `index.html` **idéntico**
antes y después (`6545b13e`) y el pendrive `DISK_IMG` verificado **diecinueve** veces: al abrir, en
cada uno de los diecisiete lotes y al cerrar. Los rojos son **TC-376, TC-390 y TC-406**, los tres de
siempre, más **TC-182 y TC-551**, los dos intermitentes declarados — **los dos pasan 1 de 1 corridos
aislados**. **Ningún rojo nuevo**, y **los cinco casos nuevos y los diez adaptados en verde**.
⚠️ **ES LA SEGUNDA PASADA, Y LA PRIMERA NO SE INFORMA PORQUE EL ARCHIVO DE CASOS CAMBIÓ DESPUÉS**:
dio **891/899** con **TRES rojos más —TC-193, TC-251 y TC-256—**, y los tres eran **consecuencia
autorizada** de los bloques A4 y C que mi censo no vio y la batería sí. Dos esperaban textos que el
punto A4 **mudó al globo** —la leyenda de la marca de vista y la línea de qué incluye «Guardar
tabla»— y el tercero esperaba el `alert` del modo M, que **ya no salta porque la herramienta queda
apagada antes del gesto**, que es exactamente lo que el pedido pide. Los tres quedaron adaptados
—con la de TC-193 **invertida**— y **los tres caen 0/3 contra `3e64801`**. Esta casa no informa un
número de una pasada hecha con un archivo de casos anterior.

Lo declarado, en **M3-a** a **M3-g**; el mapa, en
`docs/mapa/medir3-panel-botones-calibracion.md`; el inventario del bloque 0 con las cinco
hipótesis, en `docs/INVENTARIO_MEDIR3.md`; las sondas, en `scripts/_probe_medir3.mjs` y
`scripts/_probe_medir3rutas.mjs`; la guía manual, en `docs/GUIA_PRUEBA_MEDIR3.md` (**14** pasos).

**La tanda MEDIR-2 (2026-11-13) — los cuatro rojos del visor, la tabla en cinco columnas, los
nombres del Doppler pulmonar, el Área por aurícula, Simpson indexado y la comunidad bloqueada.**
SIETE commits. Sello **`v20261113-1953`**, md5 **`08eb08c0`**, **181.730** líneas.
Continúa **MEDIR-1** y cierra sus **cuatro puntos pendientes** (5, 6, 7 y 8) más el bloque de
rojos y seguridad. **Nada de esta tanda llega al papel**: no escribe un campo del informe, no
toca el EN SUMA, el PDF, el PPT ni el Excel —que queda en **457** columnas con **cero** campos
guardados nuevos, por construcción: **cero `input`, `select` y `textarea` nuevos con `id`**—, y
**las tres rutas al informe quedan idénticas**, verificado sobre el diff: ninguna línea de
`medVtiCargar`, `medVtiDiametro` ni `_simpEscribirFEVI` se movió, y ningún `itv_tsvi`,
`vti_tsvd`, `diam_tsvi`, `tsvd_diametro` ni el campo `fevi` aparece en el diff.
**LOS CUATRO ROJOS DEL VISOR ERAN NUEVOS Y DEL REDISEÑO**, verificado corriéndolos contra
`ff8c585` con el MISMO archivo de casos: los cuatro pasan allá.
⚠️ **Y DOS RESULTARON DEFECTOS REALES DE ACCESIBILIDAD QUE MEDIR-1 INTRODUJO, así que se
arreglaron en la app en vez de aflojar el caso.** (1) **Contraste**: en tema claro el botón no
seleccionado del grupo Deformación iba con `--green` sobre el fondo del modal, **3,44:1**, por
debajo del 4,5 de esta casa — lo causó el rediseño al cambiar ese fondo de `--bg3` a
transparente. Hoy **`_medColorLegible` DERIVA** el color hasta alcanzar 4,5 mezclándolo contra
`--text`, igual que `_medTextoSobre` deriva el texto sobre relleno; medido, el peor caso pasa a
**4,70 de día y 5,30 de noche**. (2) **Área táctil**: los botones del selector medían **28 px y
nada más**; hoy se ven de 28 y se tocan en **44** por un `::after` absoluto —el patrón de PANT-2,
nunca un margen negativo—, con el hueco vertical de la fila subido a **16 px** porque 28 + 16 =
44 exactos: con los 3 px anteriores, dos áreas de 44 se **solapaban 13 px** y el toque habría
caído en la línea de arriba.
**LAS OTRAS CONDICIONES SE INVIRTIERON, con su motivo donde vive cada una**: la jerarquía visual
de la barra lateral vieja (grupo más grande, peso 700, filete, subitems sangrados) y los
separadores de la columna de acciones describían **lo que el punto 2 del pedido vino a cambiar**
—«una sola barra, todos del mismo formato»—, así que hoy el caso exige lo contrario y falla por
los dos lados. **TC-241** se adaptó al sucesor `cine-grp-med` y ganó dos condiciones nuevas.
⚠️ **TC-244 NO ESTABA ROTO: SU DENOMINADOR DEJÓ DE MORDER.** Acotaba `#cine-paneles` a **380 px
fijos** para forzar el cambio de ancho de la imagen; con el rediseño la imagen se lleva **todo**
el ancho del panel, así que en la ventana del arnés (**756×469**) el canvas queda acotado por su
**ALTO** (56vh = **315 px**) y 380 ya no lo toca. Medido a los dos lados: en `ff8c585` el lienzo
mide **570** px y el canvas baja de 315 a **256**; hoy el lienzo mide **694** y el canvas se
queda en 315. El tope pasa a derivarse del **70 % del ancho medido**, que muerde en cualquier
layout — o sea que quedó **más fuerte** que el número fijo.
⚠️ **TC-850 FALLABA SIEMPRE AISLADO, Y LA CAUSA NO ERA EL AZAR DEL CONECTOR FALSO.** El id de
equipo `eq_3f8a1c` es **fijo** en `_conector_falso.mjs`; lo que el caso esperaba era el **apodo**
«GE del consultorio», que no sale de la lista de imágenes sino del caché `_clnkNombreEq`, que
llena `_clnkCargarNombresEq` al leer `/v1/equipos`. O sea que el caso pasaba **sólo si algún caso
anterior del lote ya había abierto el panel**: dependencia de orden, no intermitencia. Hoy pide
la lista, toma el primer equipo **autorizado** y usa SU id y SU nombre con la misma regla que la
app —apodo, si no el AET, si no el id—, con un denominador que declara que el conector trajo
alguno. **Los dos intermitentes declarados, TC-182 y TC-551, pasan 2 de 2 corridos aislados.**
**SEMGREP VUELVE A 126 WARNING / 0 ERROR, la línea base exacta, y M1-d queda CERRADO.** Por
decisión del médico se reescribió la línea que disparaba `ceibo-xss-innerhtml-concat`: las tres
filas del selector se juntan con **`join`** en vez de concatenarse del lado derecho del
`innerHTML`, que es la **forma** que la regla empareja. La seguridad real no cambia ni cambiaba:
las tres salen de `_medSideFila`, que arma su marcado con constantes del archivo y pasa por
`escHtml` cada texto que viene de un dato. **Verificado por mutación: con la concatenación de
vuelta, Semgrep da 127.**
**LA TABLA DE MEDIDAS, EN CINCO COLUMNAS Y CON UN SOLO ARMADOR.** `_medTablaHTML(filas, pfx,
destino)` lo consumen los **dos** cajones —`_d2Render` y `_dopRender`—: con uno por cajón, el día
que una columna cambie de forma los dos pintarían distinto la misma fila. **Una fila es CALCULADA
cuando no tiene campo (`f[3]` en null)**, y ese criterio **no es nuevo**: es el que `_d2Filas` ya
declaraba para sacarles el ✏️. Van sin ningún botón, en cursiva y con la palabra «calculada».
**«Borrar» no es un camino nuevo**: es el mismo que `dopCorregir` / `d2Corregir` recorren con el
cuadro vacío, así que **no toca ni un corte ni una banda**, y **sólo se dibuja si la fila tiene
valor** — por eso no pregunta. **El ✏️ se conserva**: para el Diam TSVD es la única vía de
entrada.
**EL DOPPLER PULMONAR: «VP» MEDÍA LO MISMO QUE «Vmax EP», CONFIRMADO POR LECTURA ANTES DE TOCAR
NADA.** Las dos, velocidad pico de la válvula pulmonar en **m/s**, las dos con la herramienta
`vel`, y a **`pul.vp` no la leía NADIE** —ni un campo del informe, ni el Excel, ni el papel, ni
`_dopDerivados`—. Era la pregunta que **M1-b** dejó abierta. Se funden en **«Vmax pulmonar»**
conservando **`pul.vmaxEp`**, que es la **conectada** (de ella sale el gradiente), y `pul.vp` se
retira entero con su lápida. Su gradiente pasa a **«Grad Máx pulmonar»** por consecuencia: con el
rótulo viejo la tabla citaría una sigla que ya no existe en ninguna de sus filas. **«Vmax IP» se
abre en DOS**, «Vmax proto-diast. IP» (`pul.vmaxIp`, homóloga de **`ip_vmax`**) y «Vmax
telediastólica IP» (`pul.vmaxIpTd`, **nueva**, homóloga de **`ip_vtd`**), con los rótulos de la
app **palabra por palabra** —el caso los compara contra las etiquetas del formulario, no contra
un texto escrito en la prueba—.
⚠️ **NO SE INVENTÓ NINGUNA BANDA, Y ESTÁ MEDIDO**: ni `pul.vmaxEp` ni `ip_vmax` ni `ip_vtd` tienen
rango en `DCM_RANGO` ni en `CHM_RANGO`, así que el homólogo no tiene nada que prestar. Las dos que
sí la tienen —`pul.vtiPul` y `pul.diamTsvd`— la conservan, y el caso lo mide como control
positivo. **Quedan DOS preguntas para el médico en M2-c**, y la primera es si prestarle a «Vmax
pulmonar» la banda de `vp_vmax`, `[0,2 – 8]` m/s.
⚠️ **Y ESA MISMA MAGNITUD TIENE CUATRO NOMBRES FUERA DEL VISOR**, informado y no tocado:
`vp_vmax` («Vmax pulmonar (m/s) — Estenosis», el dueño), su espejo `ep_vmax` («Velocidad máxima
pulmonar»), «V. máx VP» en el PDF y «PV Vmax P» en la cabecera del importador de Excel.
**EL ÁREA, POR AURÍCULA.** Con la herramienta Área, la tercera fila del selector ofrece **AI** y
**AD** (`_MED_EST_AREA`), cada contorno se guarda con SU estructura —`_medAreas` pasa de
`{pts, cm2}` a `{pts, cm2, est}`—, se dibuja rotulado «Área de AI: … cm²» y el **panel guía**
publica una línea por aurícula. **NO ESCRIBE UN SOLO CAMPO, y se mide**: el caso censa **todos**
los `input`, `select` y `textarea` con `id` del documento fuera del visor, antes y después de
trazar, y exige que la cadena sea **idéntica**. Por eso el resultado va al panel guía y **no al
cajón 2D**, que es el que sí escribe campos. **Se publica la ÚLTIMA de cada estructura** —volver
a trazar es cómo el médico corrige un contorno— y los contornos **sin** estructura se **cuentan
aparte** para que no desaparezcan sin decirlo. **La estructura se suelta en `medApagar` y no en
`cineCerrar`**, donde lo medido se conserva a propósito; el caso mide las dos mitades.
**SIMPSON, EN mL Y mL/m².** La tabla pasa a siete columnas numéricas; la superficie sale de
**`getBSA()`**, el dueño único, y la tabla **dice de dónde sale** con su valor. **El cálculo no se
tocó** —lo indexado es una división de lo que `_simpFilasTabla` ya devolvía, y el caso compara los
cuatro valores en mL con y sin superficie— y **tampoco cuándo se integra al informe**. **Sin peso
o sin talla las tres columnas indexadas no se dibujan** y la tabla lo dice; **la FEVI no se
indexa**, que es un porcentaje. **«Volumen» sigue visible y apagado** con su leyenda.
**LA COMUNIDAD DE DESARROLLO DE IA, BLOQUEADA EN SUS SEIS PARTES.** **UN solo estado**
(`ANAHI_ON`, hoy `false`, leído sólo por `anahiActiva()`) y **UN solo nombre** (`ANAHI_NOMBRE`),
que las **cuatro** superficies **LEEN** en vez de tipear. La casilla con candado por fila, el
botón «Para Anahí» **pegado** a Exportar en la columna de Imágenes guardadas —el caso mide que la
distancia entre los dos sea exactamente 1— y dentro del menú de Exportar de Estudios guardados, y
el bloque de Configuración **sin un botón ni un campo**.
⚠️ **NINGUNO LLEVA `disabled`, Y ES MEDIDO**: un control deshabilitado **no emite click**, así que
el médico tocaría el único control que tiene que **explicarle** por qué está bloqueado y no
pasaría nada. Llevan `aria-disabled` y el candado, y el oyente de la casilla cuelga de la
**celda**. **Un solo oyente delegado** para todo el documento: las tablas y la columna se
repintan enteras.
**El cartel es PROPIO de la app**, con `role="dialog"`, `aria-modal`, el foco en «Entendido» y
Escape; **su texto es el exacto del médico** y el caso lo compara **carácter por carácter**. Todo
entra por `textContent` —el cuerpo no tiene un solo elemento hijo— y el overlay **se destruye al
cerrar**, así que no deja un id que los barridos de «Nuevo estudio» puedan alcanzar. Sale **la
primera vez de cada sesión de la página** —el «ya lo vi» vive **en memoria y no en disco**, que es
el pedido— y después va el aviso corto. **«Entendido» SÓLO cierra.**
**NADA SE ENVÍA Y NADA SE GUARDA**, medido instrumentando **`fetch` y `XMLHttpRequest.open`
ANTES de tocar nada**: **cero** llamadas en todo el camino, y las claves de `localStorage`
idénticas antes y después, con su denominador.
**Cobertura: TC-882 a TC-886**, los cinco cayendo **0/5 contra `671d52b`** —el cierre de MEDIR-1,
que es la línea base de ESTA tanda— **y ninguno por excepción**. De los **trece** (los cinco
nuevos y los ocho adaptados), **NUEVE caen contra `671d52b` por 78 condiciones y CERO
excepciones**, y los **CUATRO que pasan se declaran con su motivo**: **TC-236** y **TC-241** tienen
sus condiciones invertidas al **rediseño de MEDIR-1**, que ya está en esa base, así que discriminan
contra **`ff8c585`**, donde caen; **TC-244** cambió su **denominador** y **TC-850** la **fuente**
del dato, y las dos cosas valen igual a los dos lados. Ninguno quedó más débil.
⚠️ **Y TC-257 CAÍA POR EXCEPCIÓN contra esa base**: leía la **tercera** celda de la tabla, que en
la de dos columnas no existe, así que el `TypeError` cortaba antes de medir nada. Cerrado con
guarda —la lección de TC-827— y hoy cae por condiciones. **OCHO casos adaptados**:
**TC-208**, **TC-236**, **TC-241**, **TC-244** y **TC-850** del bloque A, más **TC-250**,
**TC-257** y **TC-262**, que la batería destapó y el censo no: afirmaban la tabla de **dos**
columnas y los nombres viejos de la pulmonar. Los ocho caen **0/8** contra `671d52b` con el mismo
archivo de casos. **Ninguno borrado y ninguno aflojado**; los de jerarquía y de inventario quedan
**invertidos**, o sea que fallan por los dos lados.
**13 mutaciones dirigidas sobre el propio trabajo, 12 muertas y 1 declarada**, en un worktree y
**nunca** sobre el vivo, con el md5 del vivo idéntico antes y después. ⚠️ **La que sobrevivió lo
hizo por la ESCENA y no por el código**: bajar el `row-gap` de 16 a 3 px no pone rojo a TC-208,
porque con Deformación abierta **ninguna fila envuelve** —tres botones chicos entran en los 310 px
de la columna— y el `row-gap` sólo actúa al envolver. Queda declarada en **M2-a**.
⚠️ **TRES COSAS QUE HICE MAL Y QUE COSTARON CORRIDAS.** (1) **Edité `test_clinico.mjs` mientras
la batería corría** y la tiré en el lote 6: informó «275 de 894» con un `SyntaxError`. Es la
trampa que este archivo documenta para el A/B, pagada por otra puerta. (2) El **acento grave**
dentro de mis propios comentarios, por **vigesimotercera** tanda seguida: **cinco** veces, en
cuatro casos distintos, y sólo lo caza `node --check`. (3) **Medí el diff contra `ff8c585`**, que
es la línea base de **MEDIR-1** y no de ésta: daba 978 y 200 y mezclaba las dos tandas.
**AL RETOMAR, LA VERIFICACIÓN DESTAPÓ TRES COSAS Y LAS TRES ESTÁN EN M2-g.**
⚠️ **(1) EL `row-gap` DE 16 px NO APLICABA, Y ERA UN DEFECTO REAL —no sólo una mutación que
sobrevivía por la escena—.** El marcado emitía `gap:3px` **en línea** y ese atajo fija los **dos**
ejes, así que le ganaba al `row-gap` de la hoja sin importar la especificidad: el hueco efectivo
seguía en **3 px** y con la fila **envuelta** había **TRES pares de áreas táctiles solapadas**, o
sea el toque cayendo en la línea de arriba. Es la misma trampa que la hoja del modo mínimo ya
documenta para `display`. Arreglado separando los ejes —`column-gap:3px` en línea, el vertical en
la hoja, **sin un solo `!important`**—, y medido en los ocho cruces: `row-gap` **16px** y **cero**
solapes, con su denominador (las líneas pasan de **3 a 5**, o sea que envolvió). **Y ASÍ LA
MUTACIÓN MUERE POR SUS DOS PUERTAS**: con el `row-gap` de la hoja en 3 px, y con el atajo `gap`
devuelto a la línea, la sonda vuelve a contar **tres** pares en los ocho cruces. La declaración de
M2-a queda corregida: esa mutación era **equivalente**, no sobreviviente por escena.
**15 mutaciones dirigidas, las 15 muertas**, en un worktree y **nunca** sobre el vivo, con el md5
del vivo idéntico antes y después (`3b0e2373`).
⚠️ **(2) «TC-882 Y TC-883 PASAN AISLADOS» ERA UNA MEDICIÓN VIEJA**, de antes de los bloques C y F,
y no se revalidó: corridos hoy fallan igual, y con ellos **TC-886**. Los tres eran defectos
**míos** y no de la app —el diagnóstico lo prueba: la tabla pinta sus cinco rótulos correctos—.
Dos causas: **`d2Modo` y `dopModo` ALTERNAN**, así que llamarlos a secas hereda el modo del caso
anterior y lo **apagan** (la trampa que PANT-22 pagó con el `avInc` del arnés), y **TC-882 buscaba
«Grad Máx EP»**, que el **bloque C de esta misma tanda** renombró a «Grad Máx pulmonar». Los tres
pasan a **asegurar** el modo y a **derivar** el rótulo del registro. **El lote 16 completo da
55/55.** Una medición anterior al cambio no vale como medición del cambio.
**(3) LAS TRES RUTAS AL INFORME, EJERCITADAS DE VERDAD** y no sólo verificadas sobre el diff: la
sonda siembra la entrada de cada una por donde la app la toma y mira el **campo**, con su
denominador —los cuatro arrancan vacíos—: `diam_tsvi` **21.5**, `itv_tsvi` **22.4**, `vti_tsvd`
**18.6** y `fevi` **58**, en los **ocho** cruces.
**CHROME Y WEBKIT COINCIDEN EN LOS OCHO CRUCES** (dos motores × 1440×900 y 1280×800 × dos temas
**reales**, puestos por `ett_theme` + `loadTheme()` y **devueltos** por la sonda), con **UNA sola
firma de valores**: el encabezado `Medida|Valor|Unid.|Medir y Borrar|Anahí` en los dos cajones,
**ocho** filas con **una** calculada en cursiva y sin botones, las casillas bloqueadas, **una**
«Vmax pulmonar» y **cero** «VP», las dos de la IP, **once** botones de selector de **28 px** con
área táctil de **44**, `row-gap` **16px**, **cero** solapes —y cero tras restituir el ancho—, las
dos estructuras del Área, «Volumen» apagado con su leyenda, el cartel con su título y su
«Entendido» y el foco en `anahi-ok`, el bloque de Configuración sin botones ni campos, **cero**
desplazamiento horizontal, **cero** textos recortados y **CERO errores de consola y de página en
los dos motores**. El peor contraste es **5,30 de noche y 4,70 de día** en los ocho.
⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema.
⚠️ **Y LA PRIMERA CORRIDA DE ESA SONDA MIDIÓ SOBRE UN DENOMINADOR VACÍO EN SU ÚLTIMO BLOQUE, POR
LA MISMA TRAMPA DEL TOGGLE**: `d2Modo` apagaba el modo que el bloque anterior había dejado puesto,
así que la celda no existía y el cartel daba **false** sobre un cartel que sí funciona.
**Línea base al cierre: suite 889/894**, en **DIECISIETE** lotes cubriendo los **894 casos
distintos** —contados nombre por nombre con el patrón completo del id, **cero duplicados**—, en
UNA sola pasada sobre el árbol sellado, con los **894 ejecutados**, el md5 de `index.html`
**idéntico** antes y después (`3b0e2373`) y el pendrive `DISK_IMG` verificado **diecinueve** veces.
Los rojos son **TC-376, TC-390 y TC-406**, los tres de siempre, más **TC-182 y TC-551**, los dos
intermitentes declarados —**los dos pasan 2 de 2 corridos aislados**—. **Ningún rojo nuevo**, y
**los cinco casos nuevos y los ocho adaptados en verde**. **Semgrep 126 WARNING / 0 ERROR**, la línea base exacta. **Sin
huérfanos nuevos.** **17 de 19 bloques de JS inline parsean**, idéntico a la línea base.
**CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta,
medida con la máquina sola.
Lo declarado, en **M2-a** a **M2-g** —con **M1-a** y **M1-d** CERRADOS—; el mapa, en
`docs/mapa/medir2-tabla-anahi.md`; la sonda de dos motores, en `scripts/_probe_medir2.mjs`; la
guía manual, en `docs/GUIA_PRUEBA_MEDIR2.md` (**12** pasos).

**La tanda ECO-CONECTOR-5 (2026-11-13) — ver lo que espera, diálogos propios, vista previa y
elegir imágenes en la galería.** OCHO commits. Sello **`v20261112-2150`**, md5 **`f381026b`**,
**180.952** líneas.
El médico probó ECO-CONECTOR-4 con CeiboLink **real** y aparecieron **seis huecos de uso**, los seis
confirmados leyendo el código antes de tocar nada. **Nada de esto llega al papel**: no escribe un
campo del informe, no toca el EN SUMA, el PDF, el PPT ni el Excel, que queda en **457** columnas con
**cero** campos guardados nuevos — medido en el navegador en los DOS árboles, con su detector de que
son dos: **1132** controles con id, **1004** que entran al censo del estudio, **457** columnas y
**381** claves del mapa del Laboratorio, **los cuatro idénticos a los dos lados**.
**«VER LO QUE ESPERA»: HASTA HOY LA ÚNICA FORMA ERA RECARGAR LA PÁGINA**, o sea perder el estudio en
pantalla: el médico tenía que elegir entre sus imágenes y su trabajo. `_clnkAvisadas` vive en memoria
y el sondeo no vuelve a ofrecer lo ya avisado. `clnkRevisarImagenes(forzar)` cambia **dos cosas y
nada más**: ignora esa lista y no entra por la rama de ACTUALIZAR el cartel abierto. **Lo que NO
cambia**: la guarda de no superponerse a otra pregunta sigue valiendo, y la cuarentena sigue afuera
porque la lista del contrato §3.8 no la expone.
⚠️ **Y SI NO HAY NADA, LO DICE, DISTINGUIENDO TRES MOTIVOS** —el conector no responde, hay otra
pregunta en pantalla, no hay nada esperando—: con un solo mensaje, un aviso postergado se lee como
que las imágenes se perdieron. Con un **equipo por decidir** manda a decidir, que es la decisión que
desbloquea esas imágenes.
**EL PANEL SE ACTUALIZA SOLO.** `clnkRefrescar`, agrupado en **400 ms** —una tanda de tres imágenes
confirma de a una, así que sin agrupar serían tres lecturas por el mismo gesto— y **sin pedir nada si
la tarjeta no está a la vista**, medido por la **caja** del nodo y no por un `style.display`: la
tarjeta se puede esconder por su pestaña, por el Modo Básico o por el interruptor, y mirar un solo
estilo deja los otros dos afuera.
⚠️ **MEDIDO: `clnkAccionEquipo` YA LLAMABA A `clnkLeerEstado()`**, así que permitir, bloquear y
olvidar un equipo ya se actualizaban antes de esta tanda. Los enganches nuevos son **seis**, no
nueve: los tres sumideros, confirmar, descartar y asignar desde «Sin estudio».
**LA FECHA DEL AVISO.** `_clnkCuando` devuelve la frase **entera** —«a las 23:43», «ayer a las
23:43», «el 07/11 a las 09:12»— y no sólo la hora, porque con «ayer, 23:43» el texto diría «a las
ayer». ⚠️ **LA COMPARACIÓN ES POR DÍA DE CALENDARIO LOCAL Y NO RESTANDO 24 HORAS**: un día después de
un cambio de hora, restar 86.400.000 ms cae en el mismo día o en el anteayer, así que «ayer» se diría
mal dos veces por año — y una prueba que reste lo mismo que el código no lo ve nunca.
**EL MODAL GANA UN CUERPO, UN QUINTO BOTÓN Y UNA PREGUNTA QUE SE ESPERA.** ⚠️ **ECO-CONECTOR-4 DEJÓ
ESCRITO POR QUÉ LA PREGUNTA ERA UN `confirm` NATIVO, Y ESA RAZÓN SE RESOLVIÓ EN VEZ DE IGNORARSE**:
decía «al volver no habría a qué estado regresar», y ahora sí hay — `clnkAvisoPreguntar` guarda el
título, el texto, el **cuerpo como un fragmento de DOM** —así vuelve con sus oyentes— y los cinco
botones con sus manejadores, pregunta, y repone todo. Si el modal no estaba abierto, se cierra al
contestar. Cerrar con la ✕ resuelve con la cadena vacía y quien llama toma el **lado seguro**.
⚠️ **EL QUINTO BOTÓN SE INTERCALA EN EL ARREGLO Y NO SE PASA UN BOTÓN VACÍO EN SU LUGAR, Y ESO LO
DESTAPÓ UN CASO**: `clnkAvisoAbrir` reparte por POSICIÓN, así que con un cuarto vacío el «Cancelar»
del pendrive caía en el quinto y el cuarto quedaba como un hueco escondido.
**LOS DOS PESOS, CON EL SEGUNDO DECLARADO COMO ESTIMACIÓN.** El factor es **4** y sale de **DOS**
mediciones: el multicuadro sintético de 512×512 por 60 cuadros monocromo da **15,0 → 3,66 MB
(÷4,1)** y el del médico —1016×708 en color por 171 cuadros— da **351,9 → 54,3 MB (÷6,48)**, medido
otra vez en esta tanda sobre este árbol y con el archivo al tamaño de verdad: dio **exactamente lo
mismo** que ECO-CONECTOR-4. Se toma el divisor más chico, que da la estimación más grande: pasarse
por exceso hace que el médico espere más de lo que ocupa; por defecto le promete un espacio que no
alcanza. **Lo que cuesta, declarado: ese archivo se estima en 88,0 MB y ocupa 54,3 — un 62 % de
más.**
**EL UMBRAL ES ADAPTATIVO, Y LO MEDIDO CORRIGE LA PROPUESTA DE LA ORDEN.** `navigator.deviceMemory`
**existe** en el Chrome de la batería y devuelve **32**; **pero el techo que decide si la pestaña se
cae no es ése**: es el del **montón de JavaScript**, **4192 MB** en esta máquina de 32 GB. Una
pestaña no se muere cuando se acaba la RAM, se muere cuando el montón pasa su techo — y reservar «una
fracción de la RAM» sin mirar el montón daría **8 GB de presupuesto sobre un techo de 4**. Y
`performance.memory` es **sólo de Chrome**, así que hay respaldo: 256 MB de montón por GiB.
La cuenta: `presupuesto = min(techo×0,5, RAM×0,25)`, `tope duro = presupuesto÷1,8`, `pregunta =
duro÷4`, con piso en los dos. **La tabla medida**: la máquina real da **291 / 1164 MB**; con la
memoria sustituida, 32 GiB da 569/2276, 8 GiB 142/569, 4 GiB 71/284, 2 GiB 36/142, 1 GiB 24/71 —ahí
mandan los dos pisos— y sin dato lo mismo que 4 GiB. **Los dos valores de ECO-CONECTOR-4 —192 y 768
MB— caen dentro del rango**: no es un salto, es la misma política con el número sacado del equipo.
⚠️ **DEL FACTOR DEL PICO HAY DOS MEDICIONES Y LAS DOS SON CORRECTAS**: ECO-CONECTOR-4 midió **622,5
MB** de pico para 351,9 de píxeles (factor **1,77**) y esta tanda, sobre el mismo archivo y el mismo
camino, midió **403 a 459 MB sobre la base** en tres corridas (factor **1,15 a 1,30**), con el montón
pasando de 27,2 a 451,3 MB y la conversión tardando **1,4 s**. Miden cosas distintas: una incluye los
crudos todavía vivos y la otra el delta después de soltarlos. **Se usa el más alto** porque el factor
entra en un DENOMINADOR: el más grande da el tope más chico, y equivocarse por prudencia cuesta una
pregunta de más mientras equivocarse por optimismo cuesta la pestaña. Declarado en **EC5-b**.
⚠️ **LAS CUATRO FUNCIONES DE TOPE NO SE LLAMAN EN CÍRCULO**: las dos «…Crudo» calculan su número sin
mirar al otro, y las dos públicas los ordenan. Escrito de la forma natural —cada una llamando a la
otra— la pila se va al infinito y el bloque de JS entero deja de servir.
**UN SOLO MENSAJE AL FINAL.** Eran **dos** cuadros nativos y medido sobre el archivo podían ser
**tres**. `_dstAviso` junta los textos **dentro** de una tanda y `dstResumen` los emite una vez, con
un solo botón; **fuera** de una tanda llama al `alert` de siempre, así que importar desde la pestaña
Imágenes **no cambia**. Arriba del tope duro el aviso va al resumen y no a un cartel propio: no hay
nada que decidir.
**LA VISTA PREVIA. ⚠️ MIRAR NO ES DECIDIR, y es la invariante de todo el bloque**: no persiste, no
confirma, no borra y no agrega nada al estudio. **No hay una sola llamada** a `confirmar`, a
`CeiboImg`, a `CeiboCine`, a `clnkbGuardar` ni a `imgSlots`. Medido de **SEIS formas** y con control
**positivo**. De a una y en serie; la marca foto/video, el peso y la hora salen de la lista **sin
bajar un byte**; **la miniatura cuesta 1.035 bytes** —medido: seis son 6.210 y **treinta son
31.050**, con el montón volviendo a +0,1 MB de la base al cerrar—.
⚠️ **HAY DOS PUERTAS Y LAS DOS SE DECLARAN**: la lista del contrato da el tamaño del **archivo**, no
los píxeles sin comprimir —ese número vive en la cabecera—, así que hay una puerta antes de bajar y
otra después de leerla. Las dos terminan en la marca, el peso y «Mirar igual».
⚠️ **UN SOLO CUADRO PARA LA MINIATURA**: `_dcmCrudoUnCuadro` copia el descriptor declarando UN cuadro
y apuntando a los píxeles del primero —`subarray` no copia bytes— y le pasa eso al **mismo**
convertidor. **Y PUBLICA CUÁNTOS CONVIRTIÓ, porque si no «uno solo» no se puede medir**: la miniatura
se ve igual con uno o con los 171 y la única diferencia es el pico, que con un fixture de unos MB
queda dentro del ruido. Lo destapó el barrido.
⚠️ **NO HAY VISTA PREVIA PARA UN EQUIPO EN CUARENTENA**, y no por un filtro: la lista del contrato
§3.8 **no expone** esas imágenes. Seguridad por construcción, y una limitación declarada en
**EC5-e**.
**LA GALERÍA: ELEGIR, ELIMINAR Y ADJUNTAR. ⚠️ `CeiboImg.quitar` NO EXISTÍA**: medido en la Tarea 0,
los **catorce** métodos de ese almacén y ninguno quita un slot. Respeta el orden de `indice()`
—slots y después esquemas—, borra el registro si no queda nada, **no toca el estudio** y **no puede
alcanzar las copias en otros estudios**, que es cierto por construcción.
⚠️ **SI EL ESTUDIO ESTÁ ABIERTO, LA IMAGEN TAMBIÉN SALE DEL FORMULARIO, Y SIN ESTO VOLVÍA**:
`CeiboImg.guardar` reemplaza el juego con lo que haya en `imgSlots`, así que borrar del disco y
guardar después **reescribía la imagen** — el borrado se deshacía solo y en silencio. Se saca **por
su CONTENIDO y no por su índice**: `imgSlots` tiene huecos y no lleva los esquemas.
⚠️ **EL MARCADO SE REUSA Y NO SE DUPLICA**, que es lo que la Tarea 0 fue a medir: la galería **ya**
tenía un modo elegir —el del PPT— con su `.ig-img-th.sel`, su `.ig-img-ord` y su enrutado del toque.
Los dos modos son **excluyentes**: el toque sobre una miniatura tiene UN solo significado. Y **acá sí
entran los cineloops**, al contrario que en el mazo.
**ADJUNTAR COPIA Y NO MUEVE**, siempre. Las fijas por la **puerta única** `mediosImportar`; los
cineloops por la **cola**, con `_cinePuedeGuardar`, que es el MISMO predicado del importador de
DICOM. **Los esquemas no se copian y se CUENTAN para poder decirlo**: un esquema lo dibuja la app con
los datos de SU estudio. Las tres funciones reciben la lista **por parámetro**, que es lo que permite
que «Adjuntar a…» del visor las reuse con una lista de UNA entrada.
**EXPORTAR REUSA EL SOBRE DEL BACKUP**, así que el archivo se vuelve a importar con el importador que
ya existe; el nivel se elige solo, el tamaño se muestra **antes** y el aviso dice que trae imágenes
de pacientes y que el nombre puede estar **dibujado sobre** la imagen. ⚠️ **EL TOPE SON 460 MB Y NO
512, medido**: `BK_TOPE_BYTES` vale 482.344.960. ⚠️ **Y VA LA FICHA COMPLETA DEL ESTUDIO DE ORIGEN**,
que es más de lo que el médico eligió: el mapa `medios` está indexado por uuid y el importador adjunta
cada bloque al estudio que importa. Estructural del formato, el aviso lo dice, declarado en
**EC5-f**. **«Importar» llama a `mediosPick(true)`** —la MISMA función del menú de Guardados, cero
código nuevo— y **«Desde imágenes guardadas»** lleva a la galería en modo elegir y copia con el mismo
botón de la decisión 7b.
**LA MEMORIA, MEDIDA.** Treinta miniaturas retienen **31.050 bytes** y el montón vuelve a **+0,1 MB**
de la base. Copiar un cineloop de **20,5 MB** de un estudio a otro pica **+1,0 MB** y vuelve a
**−0,4**. ⚠️ **EXPORTAR UNA SELECCIÓN CON ESE CINELOOP DEJA 20,8 MB RETENIDOS** después de forzar el
recolector **y** de esperar los 4,6 s de la revocación de la URL del objeto: **no se pudo atribuir a
un dueño** y **no se declara como fuga** — se declara el número, con la hipótesis y qué falta medir,
en **EC5-c**.
⚠️ **Y EL CINELOOP DE ESA PRUEBA HUBO QUE REHACERLO**: la primera versión usaba cuadros de un color
plano y 120 cuadros daban **0,1 MB**, o sea que «un cineloop grande» no era grande y la medición no
decía nada. Con ruido píxel a píxel el JPEG no comprime y da los 20,5 MB que pesa un cineloop de
verdad.
**Cobertura: TC-872 a TC-881**, los diez cayendo **0/10** contra `5a9f0ca` **por su denominador
declarado y NINGUNO por excepción**, verificado en un worktree con el mismo archivo de casos y sólo el
`index.html` distinto, leyendo el motivo de cada rojo uno por uno. **NUEVE casos adaptados** —TC-847, TC-852,
TC-859, TC-861, TC-862, TC-863, TC-864, TC-865 y TC-866—, cada uno con su decisión escrita donde vive
la condición, **ninguno borrado y ninguno aflojado**; **ocho de los nueve caen contra la línea base**
por sus condiciones nuevas y ninguno por excepción. ⚠️ **TC-863 pasa en los dos árboles y se
declara**: su adaptación **amplió** la lectura —el modal O los toasts— en vez de reemplazarla, así
que no quedó más débil; simplemente no es lo que discrimina. **TC-865 quedó MÁS FUERTE**: mide los
ROTULOS de los botones en vez de las mayúsculas que explicaban cuál botón nativo era cuál.
⚠️ **EL CONTESTADOR DE LA PREGUNTA VIVE EN EL PRELUDIO, Y POR QUÉ AHÍ**: el cuerpo de un caso es una
CADENA que se evalúa **en el navegador**, así que una función de nivel de módulo de `test_clinico.mjs`
no existe ahí — la primera versión declaró los cinco ayudantes arriba y los diez casos habrían caído
con «_ec5Modal is not defined», un rojo que no apunta a su propia causa.
⚠️ **Y UN CASO QUE DISPARE LA PREGUNTA Y NO LA CONTESTE CUELGA LA BATERÍA ENTERA**: la promesa queda
esperando un clic que nadie da. Lo pagó **TC-862**, que colgó su lote al primer intento. El
contestador cubre **además** el `confirm` nativo, para que un caso adaptado no cuelgue contra la línea
base — eso también lo pagó una corrida.
**56/56 MUTACIONES DIRIGIDAS MUERTAS** en **3,9 min**, en un worktree y **nunca** sobre el vivo, con
el md5 del vivo **idéntico** antes y después (`f381026b`), **cero sobrevivientes y cero que no
aplicaran**, y las 56 anclas verificadas **ANTES** de correr. Las **ocho** que la orden pide son la 01
a la 08, en su orden.
⚠️ **EL PRIMER BARRIDO DEJÓ OCHO SOBREVIVIENTES Y SE REPARTIERON EN TRES CLASES.** **SIETE huecos
reales de cobertura**, cerrados con condiciones nuevas y **sin aflojar una sola mutación**: que el
detalle del **resumen** entre por `textContent` —ahí van nombres de archivo del ecógrafo y nombres de
estudio que escribió una persona—; que **cerrar la pregunta con la ✕** no abra el archivo, porque los
casos siempre apretaban un botón y nunca cerraban; **cuál de los dos topes gana** con los ganchos al
revés —se cumple de dos formas y la condición no distinguía cuál—; que el tope se calcule sobre el
**pico** y no sobre los píxeles, que la tabla no podía ver porque todos los valores escalan juntos;
que la miniatura convierta **un** cuadro, que necesitó que la función publique cuántos; que los dos
modos de la galería sean **excluyentes**; y que **cancelar** la exportación no genere archivo.
**UNA que mi propia escena neutralizaba**, y es la cuarta vez que esta casa lo paga: TC-876 (F)
llamaba a `_dcmCrudoNuevoLote()` antes de probar que el **sumidero** abre la tanda solo. **Y UNA mal
dirigida**: la del resumen apuntaba a dos casos que no abren el resumen con un payload.
**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta, sin un aviso nuevo. **Sin huérfanos
nuevos.** **17 de 19 bloques de JS inline parsean**, idéntico a la línea base. **CELULAR: 59
hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta, medida con la
máquina sola.
⚠️ **CUATRO TRAMPAS DE ESCRITURA, LAS CUATRO DE ESTA CASA.** (1) El **acento grave** dentro de mis
propios comentarios, por **vigesimosegunda** tanda seguida: **siete** veces, en casos, en una sonda y
en los parches. Lo caza `node --check` y nada más. (2) Diagnósticos que leían un `const` declarado
**dentro del `try`**, fuera de alcance en el `return`: dos `ReferenceError` que tiraban el caso entero
en vez de una condición. (3) Las **cifras del diff contadas de memoria**: este archivo decía «1.896 y
116» con «1.586 no comentario» y «cuatro `innerHTML`», y las cuatro eran falsas — es el error que
PANT-18 y ECO-CONECTOR-2 ya pagaron. (4) Una **medición sobre un denominador vacío**: la primera
corrida de la sonda de línea base midió sobre «hay que vincular» porque `vinculado:true` del conector
falso **no alcanza** — el token es de EcoSmart y hay que pasar por el flujo real.
⚠️ **Y DOS COSAS QUE LA ORDEN SUPONÍA Y NO SE REPRODUJERON.** La **línea base no era 873/879 con seis
rojos**: es **876/879** con **tres** —TC-376, TC-390 y TC-406—, y los tres intermitentes que la orden
nombra (TC-182, TC-551, TC-850) salieron **verdes**. Y el **tope del backup son 460 MB y no 512**.
**Línea base medida al abrir: suite 876/879**, los 879 ejecutados en dieciséis lotes, md5 idéntico
antes y después (`6f25d43d`) y el pendrive `DISK_IMG` verificado **dieciocho** veces, con los **tres**
rojos de siempre: TC-376, TC-390 y TC-406.
**Línea base al cierre: suite 884/889**, en **DIECISIETE** lotes cubriendo los **889 casos
distintos** —contados nombre por nombre con el patrón completo del id, **cero duplicados**—, en UNA
sola pasada sobre el árbol sellado, con los **889 ejecutados**, el md5 de `index.html` **idéntico**
antes y después (`f381026b`) y el pendrive `DISK_IMG` verificado **diecinueve** veces: al abrir, en
cada uno de los diecisiete lotes y al cerrar. Los rojos son **TC-376, TC-390 y TC-406**, los tres de
siempre, más **TC-551 y TC-764**, los dos intermitentes que la orden declara — **los dos pasan 2 de
2 corridos aislados**, así que son sensibilidad de lote y no de esta tanda. **Ningún rojo nuevo**, y
**los diez casos nuevos y los nueve adaptados en verde**.
⚠️ **ES LA SEGUNDA PASADA, Y LA PRIMERA NO SE INFORMA PORQUE EL ARCHIVO DE CASOS CAMBIÓ DESPUÉS**:
dio **885/889** con **TC-847** rojo —el noveno adaptado, que fallaba también **aislado** y que su
propio comentario de ECO-CONECTOR-3 anunciaba: «se pone roja si alguien agrega una quinta [salida]
sin declararla»—. Esta casa no informa un número de una pasada hecha con un archivo de casos
anterior.
⚠️ **Y A TC-847 LO DESTAPÓ LA BATERÍA COMPLETA Y NO MI CENSO**: busqué los casos que miran los
botones del modal por `clnkav-b4`, y ése los recorre con una lista propia. Es el modo de falla que
este archivo ya documenta una decena de veces.
Lo declarado, en **EC5-a** a **EC5-l** —doce, sin ids repetidos—; el mapa, en
`docs/mapa/ec5-previa-galeria.md`; las fichas, en `docs/mapa/tests-fichas-872.md`; la guía manual, en
`docs/GUIA_PRUEBA_EC5.md` (**14** pasos).

**La tanda ECO-CONECTOR-4 (2026-11-12) — confirmar solo lo que entró, los archivos pesados con
decisión del médico, ver antes de asignar y los cineloops a la vista.** CINCO commits. Sello
**`v20261112-1639`**, md5 **`6f25d43d`**, **179.130** líneas.
El médico probó ECO-CONECTOR-3 con CeiboLink **real** y aparecieron cuatro cosas. La primera era
grave y las otras tres eran de uso. **Nada de esto llega al papel**: no escribe un campo del
informe, no toca el EN SUMA, el PDF, el PPT ni el Excel, que queda en **457** columnas con **cero**
campos guardados nuevos.
**EL DEFECTO SE REPRODUJO Y SE CERRÓ, Y LA HIPÓTESIS DE LA ORDEN ERA CORRECTA PARA UN SUMIDERO DE
LOS TRES.** El médico adjuntó dos imágenes y un DICOM sin comprimir de **351,9 MB**; EcoSmart
rechazó el grande con un cartel; al guardar, CeiboLink pasó a decir «sin imágenes esperando». El
archivo **rechazado se confirmó y se borró allá**. `dstAGuardado` y `dstABandeja` **ya confirmaban
bien** —acumulan en `confirmar[]` recién cuando la escritura devuelve ok—; el roto era
`dstAlActual`, el único que delega en `mediosImportar`, **que no devolvía nada**, y un rechazo
vuelve sin lanzar. Eso cambió dónde había que mirar: el riesgo no es «los tres están mal», es «hay
un camino que delega en una función sin veredicto».
**SE ARREGLÓ EN EL ORIGEN.** `mediosImportar` y `dcmImgImportar` devuelven `{n, ok, no, res[]}` con
`res[i]` paralelo a `files[i]`: ENTRÓ o NO ENTRÓ, con el motivo. **Arranca en NO ENTRÓ** a
propósito —una copia de más en el conector se borra sola a las 24 h, una imagen borrada sin copia
no vuelve—.
⚠️ **UN SEGUNDO HUECO QUE LA ORDEN NO NOMBRABA: LA RESERVA DEL SLOT NO ES LA IMAGEN PUESTA.**
`imgCompressLoad` es asíncrona y puede no llegar a poner el slot por dos caminos —`_imgGen` cambió
o `_imgComprimir` falló—, y hasta esta tanda las dos puertas tomaban la reserva por éxito. Hoy
devuelve una promesa de «el slot quedó puesto» y las dos la **esperan**; los otros siete llamadores
ignoran el valor y siguen igual, verificado uno por uno.
**EL TOPE DEJA DE RECHAZAR Y PASA A PREGUNTAR.** `DCM_CRUDO_MAX` (192 MB) es el umbral de la
pregunta y `DCM_CRUDO_DURO` (768 MB) el del «ni preguntes». `_dcmCrudoPreguntar` vive en **un**
lugar y por eso alcanza a las dos puertas que convierten píxeles crudos. ⚠️ **ES UN `confirm`
NATIVO Y NO EL MODAL DE LA APP, y está medido por qué**: cuando esto corre el modal de CeiboLink
**ya está abierto** mostrando el progreso, así que abrirlo encima lo pisaría y al volver no habría
a qué estado regresar — es lo que esta app ya hace para el tamaño de un video. Lo que cuesta,
declarado: los botones se ven «Aceptar» y «Cancelar», así que el texto dice `Aceptar = ABRIR IGUAL`
y `Cancelar = DEJARLO ESPERANDO`.
**EL FALLO POR MEMORIA NO PUEDE VOLVERSE UN ÉXITO.** El bucle de conversión entero va dentro de un
`try`: quedarse sin memoria **lanza** —`createImageData` y `toDataURL`—, y esa excepción subía hasta
`dcmImgImportar`, que la contaba como fallo del archivo… pero por el camino del estudio abierto el
id ya se anotaba igual. Hoy es un NO ENTRÓ explícito y los cuadros ya comprimidos se **sueltan**.
**«SIN ESTUDIO» MUESTRA MINIATURAS Y LAS ABRE.** El `thumb` son ~4 KB y lo escribe `dstABandeja`
con los píxeles ya en la mano; los cineloops usan su `poster`. ⚠️ **Un `<button>` y no un `div` con
`onclick`**, para que lo alcance la regla táctil global de 44 px. El cineloop va a `_cineAbrir`, el
visor de siempre; para la fija **no hay visor reutilizable** —`igImgVisorAbrir` está atado a
`uuid` + `idx` de un estudio guardado y la bandeja no tiene estudio—, así que se usó el molde de
`_docVer`: es el mismo razonamiento con que ECO-CONECTOR-3 no reusó `igItemHTML`. **Las dos acciones
operan sobre el ENVÍO ENTERO y lo dicen**, que es la invariante que `clnkbAsignar` ya tenía medida.
**Mirar no escribe en ninguna base, no toca `imgSlots`, no encola y no confirma.**
**LOS CINELOOPS SE VEN EN «IMÁGENES GUARDADAS».** `CeiboCine.indice()` va **con cursor** —`listar`,
`uso` y `recolectar` usan `getAll()`, que es el pico de más de cien MB que esta casa documenta— y
**sólo los `tipo:'loop'`**: esa base guarda también el original de cada fija DICOM, que ya está en
la galería. Entran en «Todas» y «Videos»; **no** en «Imágenes» ni en **«⭐ De interés»** —la
estrella se guarda por slot con `CeiboImg.marcar(uuid, idx, …)` y un cineloop no tiene idx, así que
ese filtro devuelve **exactamente** lo que devolvía antes—; **no** entran al mazo del PPT, con el
motivo a la vista. **No suman a `totalImgs` ni a `mostradas`**: `n` identifica a UNA imagen en el
visor y en el PPT, y correrlo cambiaría el número de todas las imágenes guardadas del médico.
**LA MEMORIA, MEDIDA CON EL ARCHIVO DEL MÉDICO AL TAMAÑO DE VERDAD.** Un multicuadro sin comprimir
de **1016×708 en color por 171 cuadros = 351,9 MB** de píxeles, bajado por loopback: **convierte
los 171 cuadros en 1,6 s**, con un **pico de 622,5 MB**, soltando los crudos y dejando 54,3 MB de
JPEG. De ahí sale el tope duro: a 768 MB el pico rondaría 1,2 GB. ⚠️ **EL FIXTURE VA EN COLOR, y no
es un detalle**: la primera versión era monocroma y daba **117,3 MB**, un tercio de lo que el médico
recibió — tres muestras por píxel es la única forma de que 1016×708×171 pese 351,9 MB.
**Y LA PROPIEDAD DE LAS MINIATURAS SE MIDIÓ DE FORMA DETERMINISTA**, porque los deltas de heap en el
rango de diez MB quedan dentro del ruido de `performance.memory` incluso con el recolector forzado:
lo que la lista de la bandeja devuelve pesa **117.961 bytes contra 11.404.380** de los registros
completos —**97 veces más chica**— y el índice de la galería **78.825 contra 15.205.840** en disco
—**193 veces más chico**—, con 6 miniaturas y 4 celdas de cineloop pintadas.
⚠️ **DOS DEFECTOS PROPIOS QUE ENCONTRÓ LA REVISIÓN DEL DIFF Y NO UNA PRUEBA**: `hayDatosSinGuardar`
**no existe** —es `_hayAlgoSinGuardar`—, y el `typeof` lo tapaba, así que el aviso de «tenés cambios
sin guardar» no se disparaba **nunca**; y un `arguments[1]` donde ya había un parámetro con nombre.
⚠️ **Y UN TERCERO, REAL, QUE DESTAPÓ EL BARRIDO DE MUTACIONES**: `_noD` escribía el motivo pero
**no bajaba `ok` a false**, así que el desmarcado de un cineloop que no se pudo guardar —que corre
DESPUÉS de haberlo marcado como entrado— **no desmarcaba**, y se le confirmaba el borrado al
conector igual. Su hermano en `mediosImportar` sí lo hacía: era una inconsistencia entre las dos
puertas que ninguna prueba de las primeras veía. **Es para esto que está el barrido.**
**Cobertura: TC-862 a TC-871**, los diez cayendo **0/10** contra `12d27ce` **por su denominador
declarado y NINGUNO por excepción**, verificado en un worktree con el mismo archivo de casos y sólo
el `index.html` distinto. **UN caso adaptado, TC-861 (G), con su condición INVERTIDA**: afirmaba que
el tope **rechaza**, y eso dejó de ser cierto por orden del médico; hoy exige que el mensaje de
rechazo por tamaño **ya no esté** y que el mismo descriptor imposible **dispare la pregunta**, así
que puede fallar por los dos lados y quedó más fuerte. **Ninguno borrado y ninguno aflojado.**
**40/40 MUTACIONES DIRIGIDAS MUERTAS** en **2,7 min**, en un worktree y **nunca** sobre el vivo, con
el md5 del vivo **idéntico** antes y después (`6f25d43d`), **cero sobrevivientes y cero que no
aplicaran**, y las 40 anclas verificadas **ANTES** de correr. Las **seis** que la orden pide son la
01 a la 06, en su orden.
⚠️ **EL PRIMER BARRIDO DEJÓ CINCO SOBREVIVIENTES Y SE REPARTIERON EN TRES CLASES.** **Un defecto
REAL de la app** —el `_noD` de arriba—. **Tres huecos de cobertura**, cerrados con condiciones
nuevas y sin aflojar una sola mutación: que el aviso cuente las imágenes **puestas** y no las
clasificadas; que el sumidero de la bandeja **guarde** la miniatura —los bloques escribían el
registro a mano con `clnkbGuardar` y no pasaban por `dstABandeja`—; y que los cineloops **no sumen**
al conteo de imágenes del pie. **Y una mal dirigida**: anulaba el rechazo duro de
`_dcmCrudoRechazo`, pero la escena usaba un DICOM comprimido en RLE, que se rechaza mucho antes
—en `_dcmImgLeer`— y nunca llega a esa función; hoy el orden se mide con un descriptor que es **las
dos cosas a la vez**, 12 bits por muestra **y** por encima del tope.
⚠️ **CUATRO TRAMPAS DE ESCRITURA, LAS CUATRO DE ESTA CASA, Y UNA ES NUEVA DE ESTA TANDA.** (1) El
**acento grave** dentro de mis propios comentarios, por **vigesimoprimera** tanda seguida: siete
veces, en casos y en una sonda; el generador los cuenta antes de insertar nada y `node --check` caza
el resto. (2) Una **colisión de nombre**: el parámetro `ctx` de `_dcmCrudoAFrags` chocaba con el
`let ctx` del contexto 2D del canvas ochenta líneas más abajo, y el bloque de JS **entero** dejaba
de parsear — el navegador lo descarta en silencio y la app arranca sin 110.000 líneas; lo cazó
`check_js_inline.py`. (3) La **barra invertida** de una expresión regular no sobrevive al template
literal: `/\d+/` llega como `/d+/` y busca la letra «d», así que TC-863 daba rojo sobre un mensaje
que **sí** decía los MB; se cerró **no usando ninguna expresión regular**. (4) **NUEVA: un JPEG de
22 bytes no es decodificable.** Esta casa lo usa para medir bytes, pero `new Image()` lo rechaza, así
que `_imgComprimir` y `dstThumb` devuelven vacío y el caso mide un hueco; se genera uno de verdad
con un canvas, que es la única forma de tener bytes JPEG válidos sin meter un binario en un
repositorio público.
⚠️ **Y TRES VECES EN ESTA TANDA LA TRAMPA DEL ÁMBITO LÉXICO, LA MISMA QUE `_imgEditado` Y
`_cinePendientes` YA DOCUMENTAN**: `_igImgFiltro`, `_igImgPpt` y `_imgUuidActual` son `let` de nivel
de script, así que `window.<nombre> = …` crea una propiedad **nueva** que no los tapa. Las dos
primeras se cambian **apretando su botón y su casilla**, con el `aria-pressed` como denominador del
gesto; la tercera no se puede escribir, así que se sustituyen las **funciones** que la leen —ésas sí
son propiedades de `window` de verdad, verificado con una sonda antes de confiar en ello—.
⚠️ **Y UNA EXCEPCIÓN PREEXISTENTE QUE SE SORTEÓ SIN TOCARLA**: cinco de los diez casos y la sonda de
memoria reventaban con «reading 'add'» al llamar a `showTab` justo después de escribir en
IndexedDB. Es **P30-d**: esa función lee el `window.event` **global**, que en ese momento es el
`success` de la transacción, cuyo `target` no tiene `classList`. Un turno del bucle de eventos lo
limpia. **No es de esta tanda y no se toca.**
⚠️ **Y UNA COSA QUE HICE MAL Y COSTÓ UNA CORRIDA DE LÍNEA BASE ENTERA**: la lancé sobre el árbol
vivo y **seguí editando `index.html`**. La guarda de md5 del arnés lo dijo, pero la corrida no
valía: se rehízo en un **worktree sobre `12d27ce`**, que es un árbol quieto. Una línea base no se
mide sobre un archivo que se está editando.
**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta, sin un aviso nuevo. **Sin huérfanos
nuevos.** **17 de 19 bloques de JS inline parsean**, idéntico a la línea base. **Cero `innerHTML`,
`eval(` y `new Function` nuevos**, **cero** claves y contraseñas, **cero** direcciones nuevas y
**cero** llamadas de red nuevas. **UN solo id nuevo** —`clnkb-ver`, que el visor crea al vuelo— y
**cero `input`, `select` y `textarea` nuevos con `id`**, que es lo que deja todo esto fuera del
censo del estudio y del Excel **por construcción**. **CELULAR: 59 hallazgos a 360 px y 67 a 390, con
18 ALTA en cada ancho** — la línea base exacta.
**EL CENSO, MEDIDO EN EL NAVEGADOR EN LOS DOS ÁRBOLES, con su detector de que son dos**: **381**
claves en el mapa del Excel del Laboratorio, **1132** controles con `id` y **959** que entran al
censo del estudio — **los tres idénticos a los dos lados**, con las cinco funciones de la tanda
diciendo SÍ en uno y NO en el otro, que es lo que impide informar un «idéntico» medido dos veces
sobre el mismo árbol (lo que PANT-37 pagó con `_probe_ec2dos.mjs`).
**Línea base medida sobre `12d27ce` en un worktree: suite 863/869**, en **DIECISÉIS** lotes, con los
**869 ejecutados**, el md5 **idéntico** antes y después (`e262aa4d`) y el pendrive `DISK_IMG`
verificado **dieciocho** veces. Los rojos son **TC-376, TC-390 y TC-406**, los tres de siempre, más
**TC-182, TC-551 y TC-850**, los tres intermitentes.
⚠️ **POR TRIGÉSIMA SÉPTIMA VEZ SEGUIDA EL RENGLÓN QUE SE ENCONTRÓ ESTABA BIEN**, y se verificó de
las dos formas que esta casa manda: `git show 12d27ce:index.html` da **178.520** líneas,
**12.930.920** bytes y el md5 **`e262aa4d`**, los tres idénticos a lo que el renglón decía, y el
sello del pie coincidía con el que `CLAUDE.md` publicaba.
El diff de ECO-CONECTOR-4 son **683 líneas agregadas y 73 quitadas** en `index.html`, medido con
`git diff --numstat` contra `12d27ce` **sobre el árbol ya sellado**, de las que **627** no son
comentario.
Lo declarado, en **EC4-a** a **EC4-j** —con **EC3-f CERRADO** por esta tanda—; el mapa, en
`docs/mapa/ec4-confirmar-pesados.md`; la guía manual, en `docs/GUIA_PRUEBA_EC4.md` (**12** pasos).

**La tanda ECO-CONECTOR-3 (2026-11-12) — el destino único de las imágenes, el estudio guardado, el
cineloop entero, la bandeja y el DICOM sin comprimir.** SEIS commits. Sello **`v20261112-1355`**,
md5 **`e262aa4d`**, **178.520** líneas.
ECO-CONECTOR-2 dejó el aviso, adjuntar al estudio abierto, la bandeja y la regla de paciente. El
médico lo probó con CeiboLink de verdad y salieron **siete huecos de uso**, todos confirmados
leyendo el código. Esta tanda los cierra y unifica la lógica. **Nada de esto llega al papel**: no
escribe un campo del informe, no toca el EN SUMA, el PDF, el PPT ni el Excel, que queda en **457**
columnas con **cero** campos guardados nuevos.
**UNA PREGUNTA, CUATRO SALIDAS, TRES SUMIDEROS, Y NINGUNO ESCRITO DOS VECES.** Hasta esta tanda
había **dos** entradas de imágenes que decidían el destino solas y de dos maneras distintas: el
aviso de CeiboLink preguntaba entre tres salidas, y «Importar imágenes y videos» de Guardados metía
los archivos en el formulario abierto **sin preguntar y sin guardarlos en ningún lado**. Hoy las dos
usan `dstPreguntar` y las dos terminan en `dstAlActual`, `dstAGuardado` o `dstABandeja`.
`clnkAdjuntarAlEstudio` y `clnkAdjuntarABandeja` **perdieron su cuerpo** y delegan: con dos cuerpos
parecidos, «parecidos» es cómo una imagen entra distinto según de dónde vino.
⚠️ **LA MARCA DE «PREGUNTAR» VIAJA EN UN ATRIBUTO DEL INPUT Y NO EN UNA VARIABLE DE MÓDULO**, por el
mismo motivo por el que `origen` viaja por parámetro: el selector de archivos es asíncrono y el
médico puede abrir uno desde Guardados y otro desde la pestaña Imágenes. Con una variable
compartida, el segundo gesto heredaría la marca del primero. **Se consume al leerla.**
⚠️ **LA PESTAÑA IMÁGENES NO PREGUNTA**, y es la decisión 1 con todas las letras: ahí el médico ya
está parado adentro de un estudio. Preguntar en ese gesto sería el cuadro de diálogo que se aprende
a cerrar sin leer, y el que se aprende a cerrar sin leer es el que no protege el día que importa.
**EL AVISO CUENTA POR TIPO, SE ACTUALIZA Y SE POSTERGA.** `_clnkAvisoTexto` arma la frase en un solo
lugar —usado por la apertura y por la actualización—, así que los números no pueden decir una cosa
al abrir y otra al refrescarse. `_clnkAvisoGrupo` guarda el grupo que está en pantalla y, con más
imágenes del mismo equipo dentro de la ventana de dos minutos, el **mismo cartel** pasa a decir los
números nuevos con el título «Llegaron más». `CLNK_AV_BLOQUEANTES` pasa de cuatro a **seis**: entran
el **visor de cineloop** y el **selector de estudio**.
⚠️ **LAS ACCIONES SE REARMAN PRIMERO Y EL TÍTULO DESPUÉS, Y LO CAZÓ UN CASO Y NO LA LECTURA:**
rearmar llama a `dstPreguntar`, que **reescribe** el título y el texto con los suyos, así que al
revés el «Llegaron más» se perdía en el acto y el médico veía el mismo cartel con números nuevos sin
una sola señal de que algo había cambiado. Lo destapó **TC-853 (F)**.
**`CeiboImg.agregar(uuid, imgs)` VIVE DENTRO DE `CeiboImg`, Y NO ES UNA CUESTIÓN DE ORDEN**: la
**allowlist** de campos y el `get` **antes** del `put` que conserva los esquemas son invariantes de
ese almacén, y una segunda copia a veinte mil líneas de distancia es cómo se pierde un esquema el
día que la lista cambie. **Al final y no intercalado**, porque `indice()` y `marcar()` acuerdan que
el índice recorre primero los slots y después los esquemas: agregar al final deja quietos los
índices de lo que ya estaba —las estrellas y las notas del médico siguen sobre la misma imagen— y
empuja a los esquemas, que no tienen índice propio.
**EL SELECTOR REUSA LOS DUEÑOS DEL ORDEN Y DE LA ETIQUETA DE MES —`getInformes`, `igCmpFecha` y
`igMesLbl`— Y NO `igItemHTML`, y la decisión está medida**: esa función emite 34 líneas con **ocho**
manejadores en línea que en modo elegir hacen lo que no hay que hacer, y su contenedor es un id fijo
que ya está en pantalla. Reusar el pintor obligaba a enhebrar un modo por `igPintar`,
`aplicarFiltros` e `igImgSync`, o sea a tocar la pantalla que el médico usa todos los días para una
ventana de elegir. Lo que sí se reusa es de donde podrían divergir las dos listas.
⚠️ **NI UN SOLO `id` EN SUS CAMPOS**: el censo del estudio y el Excel recorren `input[id]`, así que
un campo con id entraría a las 457 columnas y a «Nuevo estudio» sin tener nada que ver con el
paciente. Se alcanza por referencia.
**SI EL ESTUDIO ELEGIDO ES EL QUE ESTÁ ABIERTO SE TRATA COMO «ACTUAL», Y LA RAZÓN ESTÁ MEDIDA**:
mandarlo por el camino del guardado escribiría en disco imágenes que el formulario no tiene, y al
guardar después, `CeiboImg.guardar` **reemplaza** `imgs` con lo que haya en `imgSlots` — o sea que
las recién escritas **desaparecerían**.
**EL BOTÓN «💾 Guardar» DEL VISOR EXISTE Y ESTÁ ESCONDIDO, Y ÉSE ERA EL DEFECTO.** Vive en
`cine-guardar` y la regla `#cine-ov.cine-min [id$="cine-guardar"]` lo oculta en el **modo mínimo**,
que es el modo en el que el visor **siempre** abre: sólo aparece después de apretar «📏 Medir». Eso
explica exactamente por qué el médico veía «Medir», «Capturar» y los controles de medición y no un
botón de guardar, y por qué un cineloop importado desaparecía al cerrar el visor. **Se deja
inofensivo** —guardar ya no depende de él, `_cineEncolar` es idempotente, y retirarlo obliga a
adaptar tres casos maduros para cero ganancia—. Declarado en **EC3-e**.
**EL DESTINO ES LA DECISIÓN DE GUARDAR.** `dcmImgImportar` encola cada cineloop que importa y, si el
estudio ya tiene uuid y el ajuste está encendido, lo escribe en el acto. Con el ajuste **apagado** se
encola igual: `imgPersistir` sale antes de llegar a la cola, así que no se escribe nada —lo que el
ajuste promete— y la cola le sirve a «Nuevo estudio» para avisar. **El peso se dice**, en MB.
**LA TIRA MUESTRA LO ADJUNTADO QUE TODAVÍA NO ESTÁ EN DISCO**, con la clase `cinepend`, su peso y la
nota «sin guardar», y se reabre desde ahí. Hasta esta tanda esa tira **sólo leía el disco**: un
cineloop recién adjuntado no se veía en ninguna parte —no ocupa casilla— y no había **una sola**
forma de volver a abrirlo.
**SE CIERRA EL HUECO DEL RETURN TEMPRANO (decisión 6).** La confirmación vivía en el `.then` de
`CeiboImg.guardar`, que está **debajo** de `if (!vivas.length && !_imgEditado)`: un estudio con
**sólo** un cineloop de CeiboLink guardaba el cineloop y **nunca** confirmaba. Hoy el camino del
return temprano espera la escritura de los cineloops y confirma, y el camino normal espera **las
dos**. ⚠️ **Y SÓLO SI NO FALLÓ NINGUNO**: `_clnkPorConfirmar` es una lista de ids **sin mapa** a cada
cineloop, así que confirmar «los que salieron» pediría borrar también el que no salió. **No
confirmar de más cuesta que una copia sobreviva su plazo; confirmar de más cuesta la imagen.**
**LA BANDEJA GUARDA EL CINELOOP ENTERO, Y VA A SU PROPIA BASE POR UNA RAZÓN MEDIDA SOBRE EL
ARCHIVO**: `CeiboCine.recolectar(uuidsVivos)` **borra todo registro cuyo `uuid` no sea el de un
estudio vivo**, y lo llama la limpieza que corre después de cualquier operación que cambie el
conjunto de estudios. Un registro de bandeja ahí adentro lo destruiría el primer barrido, en
silencio. Darle un uuid de estudio falso es peor: lo haría aparecer en la tira de ese estudio y en
su PDF. **Se retiró `_clnkbBytesADataURL`**, que guardaba el **primer cuadro** y después confirmaba
el borrado: los demás cuadros dejaban de existir en todo el mundo.
**ESTÁ VISIBLE EN GUARDADOS** —el bloque «🗂 Sin estudio» dentro de «Imágenes guardadas», con
cantidad por tipo, equipo, fecha y **peso**— y cada envío **se asigna** a un estudio con la misma
pregunta adaptada. ⚠️ **El envío sale de la bandeja sólo si entró ENTERO**: uno partido entre la
bandeja y un estudio es peor que uno entero en el lugar equivocado, que al menos se puede volver a
asignar. **Sin espacio no se guarda, no se confirma y se dice con los números.**
**EL DICOM SIN COMPRIMIR ENTRA POR EL MISMO CAMINO, Y NO HAY LECTOR NUEVO NI BIBLIOTECA.** Las dos
sintaxis nativas pasan a `ok:true`; `_dcmImgLeer` gana el recorrido **implícito** —sin campo VR:
etiqueta más longitud de 4 bytes—, su propio salto de secuencia, el pixel data **sin encapsular** y
**siete** elementos del grupo 0028 que con el comprimido no hacían falta porque el JPEG se describe
a sí mismo. `_dcmCrudoAFrags` dibuja cada cuadro y lo codifica a JPEG en `d.frags`, así que de ahí
en adelante es **indistinguible** de uno comprimido. ⚠️ **La ventana de 16 bits es UNA para todo el
archivo**: con una por cuadro un cineloop **parpadea**, porque cada cuadro se normaliza a su propio
máximo y el brillo salta entre latidos. **El tope son 192 MB de píxeles crudos** y se rechaza
**antes de tocar un canvas**, diciendo el tamaño; los formatos ajenos se siguen rechazando **por su
nombre** y —desde CeiboLink— diciendo que la imagen **sigue esperando**. **La BE queda afuera**: su
dataset va en orden de bytes invertido y nada del recorrido lo contempla.
⚠️ **CINCO HIPÓTESIS DE LA ORDEN RESULTARON FALSAS O INCOMPLETAS, las cinco medidas.** (1) **El
botón de guardar del visor EXISTE** —está escondido en el modo mínimo—. (2) **Un estudio guardado
viejo SIEMPRE tiene uuid**: `_sanearIds` lo asigna de forma perezosa en el borde del store, por
donde pasan todas las lecturas, y **fuerza una escritura** cuando lo hace; el camino sin uuid queda
cubierto como borde y **lo dice**. (3) **`CeiboImg.leer(uuid)` devuelve el ARRAY de imágenes y no el
registro**, y no trae los esquemas: tres de mis casos medían sobre **0/0** por eso, y los esquemas
se cuentan por `indice()`. (4) **`_uuidValido` no exige la forma de un uuid**: pide de 8 a 64
caracteres de `[A-Za-z0-9-]`, así que `'no-es-un-uuid'` **pasa**. (5) **La bandeja no podía ir a
`ceibomed_cine`**, por el recolector.
⚠️ **Y UNA TRAMPA DEL ÁMBITO LÉXICO QUE COSTÓ UN CASO EN VERDE SOBRE EL HUECO QUE VENÍA A CERRAR**:
`_imgEditado` es un `let` de otro bloque, así que `window._imgEditado = false` crea una propiedad
**nueva** que no lo tapa. La marca de un caso anterior seguía puesta y la medición se iba por el
camino normal. Se vacía con **`imgVaciar`**, que es la puerta que lo apaga, y el denominador se mide
**por la conducta**: que `imgPersistir` salga por el return temprano.
**Cobertura: TC-852 a TC-861**, los diez cayendo **0/10** contra `bff56dc` **por su denominador
declarado y NINGUNO por excepción**, verificado en un worktree con el mismo archivo de casos y sólo
el `index.html` distinto. **TRES casos adaptados** —**TC-179**, con su condición **INVERTIDA**
más una nueva; **TC-184**, con **tres** condiciones nuevas porque el aviso de «se guarda al guardar
el estudio» pasó del botón del visor al **importador**; y **TC-847**, con tres cambios que lo dejan
**más fuerte**—, los tres cayendo también contra la línea base, o sea que siguen discriminando;
ninguno borrado y ninguno aflojado. **TC-161, TC-233 y TC-850 pasan SIN adaptar.**
⚠️ **Y A TC-184 LO DESTAPÓ LA CORRIDA COMPLETA, NO EL CENSO**: pasaba aislado y salía rojo en su
lote, porque el paso 1 —el del toggle apagado— ahora **también** encola y dejaba la cola con una
entrada que el paso 2 contaba como suya. Es el modo de falla que este archivo ya documenta una
decena de veces.
**35/35 MUTACIONES DIRIGIDAS MUERTAS** en **1,4 min**, en un worktree y **nunca** sobre el vivo, con
el md5 del vivo **idéntico** antes y después (`e262aa4d`), **cero sobrevivientes y cero que no
aplicaran**, y las 35 anclas verificadas **ANTES** de correr. Las **siete** que la orden pide son la
01 a la 07, en su orden.
⚠️ **EL PRIMER BARRIDO DEJÓ SIETE SOBREVIVIENTES Y SE REPARTIERON EN DOS CLASES.** **Seis huecos
reales de cobertura**, cerrados con condiciones nuevas y **sin aflojar una sola mutación**: que
olvidar el grupo al cerrar **protege al aviso de equipo nuevo** —el daño no estaba donde se veía:
con el aviso cerrado la rama de actualización no corre, pero el de equipo nuevo pone el booleano en
verdadero y **no** pone grupo, así que un grupo viejo le reescribe el título encima y el médico
pierde la pregunta que desbloquea sus imágenes—; que la imagen **preexistente** conserve su índice,
que «quedan tres» no podía ver; que el cineloop se encole **al importarlo** y no sólo al llamar a la
cola a mano; que la bandeja **no confirme** cuando la escritura falla **teniendo algo que escribir**;
que la **ventana de 16 bits estire el rango**, medido decodificando el cuadro producido y mirando su
máximo; y que el mensaje que **el médico lee** nombre el formato, que es otra cosa que el nombre
crudo que devuelve el lector. **Una mal escrita y equivalente**: la de los píxeles crudos se
insertaba **antes** de la línea que los suelta, así que esa línea la deshacía.
⚠️ **Y POR CUARTA VEZ EN DOS TANDAS UNA ESCENA NEUTRALIZÓ SU PROPIA MUTACIÓN POR EL MISMO MOTIVO**:
el aviso **no vuelve por las mismas imágenes en la misma sesión**, y la suite corre los 869 casos en
UNA página. Para que la rama de actualización se ejercite, el grupo tiene que **existir** —sus ids
sin avisar— y tiene que poder **crecer**. El conector falso terminó con tres escenas de ids propios:
`unaSuelta`, `unaSuelta2` y `mixto2`.
**EL CENSO, MEDIDO EN EL NAVEGADOR EN LOS DOS ÁRBOLES Y CON SU TRAMPA DECLARADA**: **381** claves en
el mapa del Excel del Laboratorio, **1132** controles con `id` y **959** que entran al censo del
estudio — **los tres idénticos a los dos lados**. El selector de estudio guardado agrega **un**
control y **cero** con `id`, así que el conteo con ids no se mueve.
⚠️ **Y LA PRIMERA CORRIDA DE ESA SONDA MIDIÓ DOS VECES EL ÁRBOL VIVO**: su ruta por omisión es la
absoluta del árbol real, así que correrla **desde** el worktree no alcanza. Los números salían
idénticos —que es lo que la prueba quería afirmar— y lo delató el campo que pregunta si los cuatro
ids nuevos EXISTEN: en el supuesto árbol base decían que sí. Es el mismo defecto que PANT-37 pagó
con `_probe_ec2dos.mjs`, y es por lo que ese campo está en la sonda.
**LA MEMORIA, MEDIDA con el caso NUEVO** —un multicuadro **sin comprimir** de 512×512 por 60
cuadros, 15,7 MB de píxeles crudos que además hay que **dibujar** cuadro por cuadro y codificar a
JPEG—: sobre una base de **27,1 MB**, adjuntarlo al **estudio abierto** pica en **72,2 MB** y vuelve
a **30,8** tras «Nuevo estudio», con **3,7 MB** retenidos por la cola —los 60 cuadros ya
comprimidos—. A la **bandeja** pica en **92,8-94,1 MB** y vuelve a **30,9**: lo guardado vive en
disco y no en memoria, y leer el registro completo trae esos mismos 3,7 MB. **Los 15,7 MB de píxeles
crudos se sueltan** en los dos caminos.
⚠️ **Y EL RETENIDO POR LA COLA SE MIDIÓ MAL LA PRIMERA VEZ, por la misma trampa del ámbito léxico**:
`_cinePendientes` es un `let` de nivel de script, así que `window._cinePendientes` es `undefined` y
la sonda publicaba **0 MB** retenidos sobre una cola que **sí** tenía el cineloop.
**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta, sin un aviso nuevo —el de más sobre la
línea histórica de 125 sigue siendo el falso positivo de **EC1-j**, el nombre de la clave del
token—. **Sin huérfanos nuevos.** **17 de 19 bloques de JS inline parsean**, idéntico a la línea
base. **CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base
exacta, medida con la máquina sola.
**Línea base al cierre: suite 866/869**, en **DIECISÉIS** lotes cubriendo los **869 casos
distintos** —contados nombre por nombre con el patrón completo del id, **cero duplicados**—, en UNA
sola pasada sobre el árbol sellado, con los **869 ejecutados**, el md5 de `index.html` **idéntico**
antes y después (`e262aa4d`) y el pendrive `DISK_IMG` verificado **dieciocho** veces: al abrir, en
cada uno de los dieciséis lotes y al cerrar. Los rojos son **TC-376, TC-390 y TC-406**, los tres de
siempre. **Ningún rojo nuevo**, y **los diez casos nuevos y los tres adaptados en verde**.
⚠️ **ES LA SEGUNDA PASADA, Y LA PRIMERA NO SE INFORMA PORQUE EL ARCHIVO DE CASOS CAMBIÓ DESPUÉS**:
dio **864/869** con dos rojos más, **TC-184** —que era mío y quedó adaptado— y **TC-764**. Esta casa
no informa un número de una pasada hecha con un archivo de casos anterior.
⚠️ **Y TC-764 SE CARACTERIZÓ COMO MANDA ESTA CASA, Y ES PREEXISTENTE**: pasa aislado, y corrido en
**su** lote —el 15— contra `bff56dc`, con el mismo archivo de casos y la misma composición de lotes,
sale **rojo igual**. No es de esta tanda; en la pasada final salió verde.
Lo declarado, en **EC3-a** a **EC3-j**; el mapa, en `docs/mapa/ec3-destino-unico.md`; las fichas, en
`docs/mapa/tests-fichas-852.md`; la guía manual, en `docs/GUIA_PRUEBA_EC3.md` (**14** pasos).

**La tanda ECO-CONECTOR-2 (2026-11-12) — el panel compacto, el sondeo, el aviso, la bandeja y la
regla de paciente.** CINCO commits. Sello **`v20261112-0158`**, md5 **`ec482b6d`**, **177.121** líneas.
ECO-CONECTOR-1 dejó la tarjeta y la capa de comunicación; faltaba que EcoSmart **avisara** de las
imágenes que el ecógrafo manda y las **incorporara**. Y el médico, que vio el panel en pantalla, lo
quiso **más compacto**. **Nada de esta tanda llega al papel**: no escribe un campo del informe, no
toca el EN SUMA, el PDF, el PPT ni el Excel, y el Excel queda en **457** columnas con **cero**
campos guardados nuevos.
**EL PANEL PASÓ DE 1195 A 456 PÍXELES**, medido con el mismo arnés en los dos árboles y a 1440 px:
un **62 % menos**. La cabecera son dos renglones —la luz con el interruptor y «Actualizar», y los
tres números— y debajo quedan **cuatro secciones plegables cerradas**. El tercer estado que la
orden pide —dos equipos, uno esperando decisión, «Equipos» abierta sola— mide **712 px**, todavía
por debajo del panel viejo con un solo equipo.
⚠️ **LOS PLEGABLES SON `<details>` NATIVOS, y eso es toda la accesibilidad del panel**: abren con
Enter y con Espacio, se anuncian al lector de pantalla y son enfocables, **sin una línea de JS** ni
un `aria-expanded` que mantener al día. El molde es el de `.pop-farm`, que es el desplegable que
esta app ya usa para los fármacos del posoperatorio. **El `summary` lleva sus 44 px A MANO**: la
regla táctil global de este archivo empareja `button, [role=button], .btn, …, [onclick]` y un
`summary` no es ninguno de ésos, así que sin eso el renglón que el médico toca mediría ~26 px.
No se le pone `role=button` para que la regla lo alcance: eso le quitaría su semántica propia.
⚠️ **Y EL HUECO DE LA COLUMNA DE AL LADO ERA LA GRILLA, NO UN DEFECTO.** `.cfg-grid` es una grilla
de dos columnas con `align-items:start`: la fila se alinea a la tarjeta más alta y debajo de la más
baja queda el blanco. Medido, **pasó de 859 a 120 px a 1440**, y con eso dejó de ser un problema
propio: **120 es el MENOR de las cuatro filas** de dos columnas de Config —las otras miden 271, 270
y 349—. **No se movió nada**, y la decisión está medida: mover la tarjeta sólo trasladaría el
desparejo a otra fila y cambiaría un orden que el médico ya conoce.
**EL SONDEO SON QUINCE SEGUNDOS, Y DE AHÍ SALE EL NÚMERO.** `GET /v1/estado` no lleva token,
devuelve ~150 bytes y el contrato dice textualmente que se puede consultar «cada pocos segundos»:
cuatro pedidos por minuto a loopback no se miden en ninguna parte, y el aviso llega como máximo 15 s
después de que el ecógrafo terminó de mandar. Con 5 s correría doce veces por minuto mientras el
médico escribe, sin un solo beneficio clínico; con 60 s el médico llega antes que el aviso y
concluye que esto no funciona. **La lista de imágenes sólo se pide si el estado dice que hay algo.**
Sólo con la pestaña a la vista —el mismo oyente de `visibilitychange` que ya apagan la vista 2D y
el 3D de la mitral—, y al **volver** a la vista se sondea en el acto.
**EL AVISO NO DICE UN SOLO DATO DEL PACIENTE, Y NO PODRÍA AUNQUE QUISIERA**: la lista del contrato
§3.8 no los trae —`vista` queda en `null` a propósito, porque el candidato natural era texto libre
donde entra un nombre— y los datos del paciente viven **sólo** adentro del archivo DICOM, que recién
se baja cuando el médico aprieta «Adjuntar». Dice cuántas, de qué equipo y a qué hora.
⚠️ **EL MODAL ES PROPIO Y NO UN MODO MÁS DEL DE «NUEVO ESTUDIO», Y SE MIDIÓ POR QUÉ**: aquél tiene
los tres `onclick` **escritos en el marcado**, así que un modo más obliga a reasignar los tres
manejadores al abrir. Eso pone en riesgo las dos salidas que ese modal protege —«Nuevo estudio» y
«Cerrar sesión», las que evitan perder un estudio— y deja abierta la posibilidad de que queden
puestos los manejadores del aviso cuando el médico apriete «Nuevo estudio». Un molde copiado cuesta
veinte líneas de marcado; un manejador cruzado ahí cuesta un estudio.
**LA AGRUPACIÓN ES UNA VENTANA DESLIZANTE DE DOS MINUTOS**, y es lo único que se puede hacer con lo
que el contrato entrega: no hay campo de estudio ni de serie, así que sólo quedan `equipo` y
`recibida`. Un estudio sale del ecógrafo en una tanda continua, y dos minutos cubren un envío lento
de veinte imágenes a seis segundos cada una sin alcanzar nunca el hueco que hay entre dos pacientes.
**Deslizante y no un bloque fijo**: con un bloque desde la primera, un envío de treinta se partiría
en dos avisos. ⚠️ **El límite se declara (EC2-d)**: dos pacientes seguidos del mismo equipo con
menos de dos minutos entre medio salen en UN aviso, y no hay forma de distinguirlos.
**ADJUNTAR VA POR LA PUERTA ÚNICA `mediosImportar`, DE A UNA Y EN SERIE.** Sin lector DICOM nuevo:
lo que cambia es de dónde salen los bytes. De a una por tres motivos medidos —un cineloop pesa 16 MB
y tres a la vez son 48 MB de buffers vivos; esa función puede abrir un `confirm` y un `alert`, que
en paralelo se apilan sobre el mismo médico; y el orden de los slots es el orden del PDF—.
⚠️ **CONFIRMAR VA DENTRO DEL `ok` DE LA ESCRITURA Y NO EN `guardarInforme`, Y ESA ES LA DECISIÓN DE
FONDO.** Confirmar **borra** en el conector, así que la condición no puede ser «el médico apretó
Guardar» sino «la imagen quedó escrita»: `imgPersistir` devuelve `false` por tres caminos que no son
una decisión del médico —el guardado de imágenes apagado, la base bloqueada y una reimpresión en
curso— y en los tres la imagen NO está en disco. Confirmar ahí la borraría del conector sin que
exista en ninguna parte. **Y si confirmar falla, NO se da por borrado**: el id se queda y se
reintenta; un 404 sí lo saca, sin alarmar. El `verificada: false` se le dice al médico.
⚠️ **`_clnkPorConfirmar` SE VACÍA EN «NUEVO ESTUDIO»**, desde `imgVaciar`. Un id que sobreviviera
haría que el guardado del paciente SIGUIENTE **borrara del conector** una imagen que no entró a
ningún estudio, y confirmar es irreversible. Es la misma trampa que el D-10 y el D-11 pagaron con
`data-pop-mano` y `data-espejo`.
**LA BANDEJA VIVE EN UNA BASE PROPIA, `ceibomed_bandeja`, Y LA ORDEN PIDE JUSTIFICARLO.** Tres
razones medidas: todo lo que recorre `ceibomed_img` lo hace **por uuid de estudio**, así que un
registro con uuid inventado aparecería en «Imágenes guardadas» y sumaría a los bytes; la fuga que
`imgRestaurar` pagó fue exactamente «un registro de esa base llegó al formulario de otro paciente»,
y con una base distinta eso **no es alcanzable** —no hay una sola ruta de código que lleve de esta
base a `imgSlots`—, o sea seguridad por construcción y no por filtrado; y la alternativa obliga a
filtrar en **cinco** lectores maduros, que es el argumento con que este archivo sacó los esquemas a
su propia lista. **Lo que cuesta, declarado en EC2-b**: no entra al respaldo.
**LA REGLA DE PACIENTE ES UN SOLO PREDICADO QUE FALLA CERRADO.** `clnkEstudioTieneImagenes()` mira
las DOS cosas —la marca `origen` de los slots y la lista por confirmar—, y la segunda cubre el
**cineloop**, que entra por su puerta y puede no dejar slot de imagen. En el modal de cierre se
**mantienen las tres salidas** y no se inventa ningún bloqueo: lo único que cambia es que «Guardar y
continuar» queda deshabilitada —porque el guardado la va a rechazar igual— y que el texto dice que
las imágenes **no se pierden**, que siguen esperando hasta su plazo. **El estado del botón se repone
en las dos ramas**, porque el modal se reusa.
**TRES HIPÓTESIS DE LA ORDEN RESULTARON FALSAS, las tres medidas.** (1) **`_dcmImgLeer` no leía
ningún dato del paciente**: devolvía fabricante, modelo, cuadros, filas, columnas y los fragmentos,
y nada más. Los seis ayudantes que ECO-CONECTOR-1 conservó venían del panel de Orthanc, que sacaba
esos datos de la **API REST en JSON**, no del archivo. Se agregaron **cuatro `if`** al bucle que ya
recorre el dataset, con el mismo molde que las dos líneas de al lado: no es un lector nuevo, que la
orden prohíbe. **El `PatientID` NO se lee, a propósito**: en un ecógrafo de hospital es el número de
historia clínica y no una cédula. (2) **Esta app NO TIENE NINGUNA BARRA DE PROGRESO**: cero
componentes de barra, y lo que usa para un trabajo largo son `toast('⏳ …')`. El progreso es el texto
del propio modal más el toast de cierre. (3) **El campo `origen` está en la lista cerrada del
guardado pero su VALOR se normaliza** a `visor`/`estudio`, así que `ceibolink` **no sobrevive** —se
dejó así y queda declarado en **EC2-a**, porque las dos pantallas que lo consumen reparten por el
par cerrado y un tercer valor haría desaparecer la imagen de «Imágenes guardadas»—.
**DOS DEFECTOS QUE DESTAPARON LOS CASOS VIEJOS Y LA LECTURA NO.** (1) **El piso en bytes del aviso
de espacio daba «casi sin lugar» sobre un conector VACÍO**: con un tope chico, 1 MB libre es menos
que los 32 MB del piso, así que TC-841 recibía «usó 0 KB de 0 KB» con el aviso rojo puesto. Hoy el
piso manda sólo si el tope es grande frente a él. (2) **Sin vincular, el panel dejaba de decir la
versión del conector**, que el panel anterior imprimía en los dos estados: es el dato que dice si el
conector es **viejo**, y de él dependen las dos partes que el panel esconde contra un 1.0.
**Cobertura: TC-842 a TC-851**, los diez cayendo **0/10** contra `8afba18` **por su denominador
declarado y NINGUNO por excepción**, verificado en un worktree con el mismo archivo de casos y sólo
el `index.html` distinto. **SEIS casos adaptados** —TC-833, TC-834, TC-837, TC-838, TC-839 y
TC-841—, cada uno con su decisión escrita donde vive la condición, ninguno borrado y ninguno
aflojado; **tres quedaron MÁS FUERTES**. **TC-161 pasa SIN adaptar**, porque los diecinueve ids de
ECO-CONECTOR-1 se conservaron a propósito, el del renglón de la ayuda incluido —hoy es el `summary`—.
**48/48 MUTACIONES DIRIGIDAS MUERTAS** en **5,4 min**, en un worktree y **nunca** sobre el vivo,
con el md5 del vivo **idéntico** antes y después (`ec482b6d`), **cero sobrevivientes y cero que no
aplicaran**, y las 48 anclas verificadas **ANTES** de correr.
⚠️ **EL PRIMER BARRIDO DEJÓ OCHO SOBREVIVIENTES Y SE REPARTIERON EN TRES CLASES**, que es
exactamente para lo que el barrido está. **SEIS huecos reales de cobertura**, cerrados con
condiciones nuevas y **no aflojando ninguna mutación**: la escena «vinculado pero el módulo
apagado» —el bloque que apagaba el módulo borraba el token a la vez, así que el token faltante
salvaba a la mutación—; que el sincronizador no **apile** temporizadores, que ahora se mide
contando los que se crean; que la confirmación sólo corra si la escritura **salió bien**, que
necesitó sustituir el escritor porque con la casilla apagada la escritura sale antes de tocar la
base; que el predicado de la regla **falle cerrado**; y las dos del aviso que no se superpone.
**TRES mutaciones mal dirigidas o mal escritas**: una **equivalente** —poner el atributo de
abierto en el marcado, que el escondido borra antes de la primera lectura—, una que usaba una
propiedad de CSS que ese contenedor **no interpreta** —y la condición mide el orden del DOM
justamente para no depender del estilo—, y una que llamaba a **una variable que no existe**, así
que el `catch` se la tragaba entera. Y **DOS que sobrevivían por la ESCENA y no por el código**.
⚠️ **Y TRES VECES EN ESTA TANDA UNA ESCENA NEUTRALIZÓ SU PROPIA MUTACIÓN POR EL MISMO MOTIVO**: el
aviso **no vuelve por las mismas imágenes ni por el mismo equipo en la misma sesión**, y la suite
corre los 859 casos en UNA página, así que un bloque que reusa una escena ya avisada recibe «no
hay nada que avisar» y mide otra cosa. El conector falso terminó con una escena de **un id
suelto** y un **tercer equipo pendiente**, los dos con ids que no aparecen en ninguna otra.
⚠️ **UNA COSA QUE YO MISMO HICE MAL Y COSTÓ UNA CORRIDA DE 900 SEGUNDOS**: un caso que sustituía
el `confirm` devolviendo **no** «para que no descarte nada por accidente» **neutralizaba** la
mutación que hace que cerrar el aviso descarte; y **sin** sustituirlo, un `confirm` nativo cuelga
el caso hasta el tope del runner.
**CHROME Y WEBKIT COINCIDEN EN LOS VEINTE CRUCES** (dos motores × 1440, 1280, 1000, 768 y 390 px ×
dos temas **reales**, puestos por `ett_theme` + `loadTheme()` y **devueltos** por la sonda: diez
«día» y diez «noche»), con **cero errores de consola y de página en los dos motores**, los tres
plegables **cerrados** en los veinte, los **seis** renglones que se tocan en **44 px exactos** y
**cero** por debajo, los veinticinco nodos estáticos **intactos** tras cinco repintados, y el apodo
malicioso entrando como texto en `bdi` sin ejecutar nada. **WebKit de Playwright no es Safari, y se
declara.** Chrome va por el del sistema.
**LA MEMORIA, MEDIDA (EC2-e):** con una imagen de 16,8 MB el pico es **80,4 MB** sobre una base de
27; con DOS, **128,7 MB**. **El pico de la descarga NO se acumula** —el camino de a una suelta el
buffer de la anterior, que era el riesgo— pero **lo retenido por slot sí crece: 21,4 MB por
imagen**, que son el `dataURL` en base64 más el `_orig` que `imgCompressLoad` guarda para el
selector de calidad. **No se agregó ningún tope**, y es una decisión: ese retenido es el mismo que
la app ya tiene con el pendrive, así que un tope cambiaría también la carga manual, que esta tanda
tiene prohibido tocar. Queda como pregunta de diseño.
**Semgrep 126 WARNING / 0 ERROR, idéntico en los DOS árboles** —el aviso de más sobre la línea
histórica de 125 sigue siendo el falso positivo de EC1-j, el **nombre** de la clave del token—.
**Sin huérfanos nuevos.** **17 de 19 bloques de JS inline parsean**, idéntico a la línea base.
**Cero `innerHTML`, `eval(` y `new Function` nuevos** —la única aparición de `innerHTML` en el diff
es el comentario que declara que el nombre del equipo entra por `textContent`—, **cero claves**,
**cero direcciones nuevas** y **cero llamadas de red nuevas**: todo pasa por `clnkPedir`.
**CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta,
medida con el **mismo script en los dos árboles** y con la máquina sola.
⚠️ **Y CON `--todo` SON 401 y 409, TAMBIÉN IDÉNTICOS EN LOS DOS ÁRBOLES.** Queda escrito porque la
primera lectura de esta tanda fue con esa bandera y los 401 se leyeron como si la tanda hubiera
agregado 342 hallazgos: la diferencia son los de severidad **BAJA**, que el script esconde por
omisión. El número que esta casa informa es el de **sin** la bandera.
**EXCEL Y CAMPOS DEL ESTUDIO IDÉNTICOS, MEDIDOS EN EL NAVEGADOR EN LOS DOS ÁRBOLES**: **381**
claves en el mapa del Excel del Laboratorio y **1007** campos que viajan dentro de cada estudio,
los mismos números a los dos lados. Y **CERO** de los controles de esta tanda entra a ese censo:
los tres con prefijo `cfg-` quedan fuera por las dos listas a la vez, y la sección de la bandeja
no tiene un solo `input`.
**Línea base al cierre: suite 856/859**, en **DIECISÉIS** lotes cubriendo los **859 casos
distintos** —contados nombre por nombre con el patrón completo del id, **cero duplicados**—, en
UNA sola pasada sobre el árbol sellado, con los **859 ejecutados**, el md5 de `index.html`
**idéntico** antes y después (`ec482b6d`) y el pendrive `DISK_IMG` verificado **dieciocho** veces:
al abrir, en cada uno de los dieciséis lotes y al cerrar. Los rojos son **TC-376, TC-390 y
TC-406**, los tres de siempre. **Ningún rojo nuevo**, y **los diez casos nuevos y los seis
adaptados en verde**.
⚠️ **ES UN ROJO MENOS QUE LA LÍNEA BASE, Y SE DECLARA PARA QUE NADIE LO LEA COMO UN ARREGLO
SILENCIOSO:** la medición de la línea base en este mismo arnés dio **845/849** con **TC-551**
rojo, que es uno de los intermitentes que este archivo documenta —pasa corrido aislado—. En la
pasada de cierre salió **verde**. No se tocó nada suyo: es el mismo intermitente, del otro lado.
Lo declarado, en **EC2-a** a **EC2-j**; el mapa, en `docs/mapa/ec2-aviso-bandeja.md`; las fichas,
en `docs/mapa/tests-fichas-842.md`; la guía manual, en `docs/GUIA_PRUEBA_EC2.md` (**12** pasos).

**La tanda ECO-CONECTOR-1 (2026-11-11) — el panel de CeiboLink reemplaza al de Orthanc.** CINCO
commits. Sello **`v20261111-2208`**, md5 **`60ed9c1c`**. La conexión directa con Orthanc —que
nunca le funcionó al médico y además le pedía instalar y administrar un servidor DICOM— **se
retira entera** y en su lugar va la tarjeta de **CeiboLink**, el programa local que recibe las
imágenes del ecógrafo por DICOM y las entrega a EcoSmart por un canal de loopback. Orthanc sigue
existiendo pero **adentro** de CeiboLink: el médico no lo ve y no hay ninguna ruta del canal que
lo exponga. **Nada de esta tanda llega al papel**: no escribe un campo, no guarda nada y no toca
el informe, el PDF, el PPT ni el Excel.
⚠️ **EL ARCHIVO QUEDÓ MÁS CHICO AUNQUE SE ESCRIBIERON 1.018 LÍNEAS**: el panel retirado era más
grande que el que lo reemplaza. 1.093 quitadas contra 1.018 puestas.
**Lo que salió, medido sobre el archivo**: la tarjeta «Conexión por red (DICOM)» con su campo de
dirección editable, «Verificar conexión» y el instructivo de arranque; el botón «🔍 Buscar en
Orthanc» de la pestaña Imágenes; el overlay con la lista de estudios y sus filtros por nombre y
fecha; el bloque JS del módulo; y las **cuatro** claves de `localStorage`. **Cero** apariciones
del puerto de la API de Orthanc, de cada id del panel, de cada clave y de cada función del módulo;
las once menciones que quedan son **lápidas en comentarios**.
⚠️ **Y DOS LÁPIDAS MÍAS TRAÍAN LOS LITERALES QUE EL CASO VIGILA** —el puerto viejo y el nombre de
un ayudante retirado—, así que TC-832 salió rojo contra mi propio comentario. **Una búsqueda sobre
el archivo no distingue un comentario de una lectura**: se reescribieron.
**LA DIRECCIÓN ES UNA CONSTANTE EN UN SOLO LUGAR Y NO UN CAMPO**, y eso es la diferencia de fondo
con el panel viejo: el médico no tiene por qué saber qué poner, y un campo editable es además una
forma de mandar el token a cualquier parte. Para las pruebas **no se agregó ningún campo ni
ninguna clave persistida**: se honra `window.__clnkBaseTest`, que no la escribe ningún control de
la app, no se persiste, y **sólo vale si lo que trae es loopback con puerto** — o sea que el
tráfico de este módulo **no puede salir de la máquina ni con la variable puesta**, que es la
propiedad que importa y no «el médico no va a tocarla».
**UNA sola función para TODAS las llamadas**, `clnkPedir`: con una por ruta, el día que cambie la
cabecera o el tiempo de espera habría que acordarse de los nueve lugares, y lo que es peor, **el
token se leería en nueve lugares en vez de uno**. Lleva el `Authorization` **sólo cuando quien
llama lo pide** —así una ruta nueva no lo hereda por descuido—, el `Content-Type` **sólo si hay
cuerpo** —en un GET agrega el pedido previo de CORS sin ninguna necesidad— y el **token de
generación** `_clnkGen`, el mismo recurso que tenía el panel retirado.
⚠️ **EL MENSAJE DE FALLO DE RED NOMBRA DOS CAUSAS, Y NO ES REDUNDANCIA**: el navegador da el
**mismo** `TypeError` si el conector está apagado y si algo lo bloquea, y no hay forma de
distinguirlos desde la página —es a propósito del navegador—. Con «CeiboLink no responde» a secas,
el médico que acaba de negarle a Chrome el permiso de red local se pone a reinstalar un programa
que está perfectamente encendido. Y **se mide contra un puerto CERRADO de verdad**, no simulado.
**EL TOKEN vive en `localStorage` por decisión del médico** —vincula una sola vez por navegador—
y **nunca sale de ahí**: se lee en **tres** lugares, se escribe en **uno**, y no va a un toast, ni
a un registro, ni a un mensaje de error, ni a un atributo del DOM, ni a la URL, ni al hash.
⚠️ **Y NO LO EXPORTA NADA, MEDIDO**: ninguna función de este archivo recorre `localStorage` —cero
`localStorage.key(`, cero `localStorage.length`, cero `Object.keys(localStorage)`— y `_bkExportar`
saca los estudios y los medios de IndexedDB sin tocarlo. Si alguna vez se agrega un exportador que
sí lo recorra, **estas dos claves tienen que quedar excluidas**.
**TODO lo que viene del conector entra con `textContent`**: cero `innerHTML` nuevos, y la única
aparición en el diff es el comentario que lo declara. ⚠️ **EL APODO Y EL AET VAN ADEMÁS EN UN
`bdi`, Y ESO NO ES LO MISMO QUE ESCAPAR**: `textContent` impide que se **ejecute**, `bdi` impide
que se **lea al revés**. Con un *bidi override* sin cerrar, **la fila del equipo A se puede leer
con el nombre y la dirección del equipo B**, y ésa es justo la fila donde el médico decide
permitir o bloquear. El contrato dice que el conector rechaza esos caracteres, **pero validar no
es escapar** y una versión futura puede dejar de rechazarlos: el aislamiento va de este lado.
**«Copiar» lleva el valor en un atributo y el manejador por delegación**, nunca interpolado en un
`onclick` —ahí el escape no protege, porque el parser decodifica la entidad ANTES de compilar el
manejador—, y **el id del equipo se busca recorriendo y no con un selector armado por
concatenación**: lo da el conector, así que metido en un selector de atributo puede romperlo.
**Los colores van con las variables que EXISTEN**: `--green`, `--red` y `--amber`, cada una con su
respaldo. ⚠️ **`--ok` y `--bad` NO EXISTEN en esta app**, y escribirlas da el mismo defecto que
POP-B pagó con `--amber` y PANT-13 con `--card`.
⚠️ **UN DEFECTO REAL QUE DESTAPÓ LA SUITE Y LA LECTURA NO: esconder las partes que dependen del
conector BORRABA el marcado de «Ajustes».** Los otros dos bloques los pinta el JS entero, pero el
de ajustes es **estático** —sus dos campos, su botón y su renglón de avisos viven en el HTML—, así
que el `textContent = ''` se llevaba los campos del documento **para siempre**, con la tarjeta
visible y sin ellos, y **no volvían** porque el repintado los busca por id y no los crea.
**Se vio en el LOTE y no aislado**: TC-833 los perdía del censo y TC-840 reventaba con «Cannot set
properties of null», porque el que los borraba era el caso **ANTERIOR**. Es el mismo modo de falla
que PANT-30 pagó con el barrido de `-aviso` y el botón del aviso.
⚠️ **EL TERCER ENGANCHE DE REPINTADO NO TIENE REEMPLAZO, Y SE DECLARA.** Dos sí —el del cambio de
modo y el de mostrar Config—; el del cambio de pestaña era para el botón de la pestaña Imágenes, y
**CeiboLink no pone ningún control fuera de su tarjeta**, así que no hay una segunda superficie
que pueda desincronizarse. Queda su lápida, y TC-833 fija que hoy no hay nada afuera.
**Cobertura: TC-832 a TC-841**, los diez cayendo **0/10** contra `e9fb2d0` y **NINGUNO por
excepción**. ⚠️ **Y LA PRIMERA CORRIDA CAÍA POR `ReferenceError`, NUEVE VECES EL MISMO**: el
módulo no existe en ese árbol, así que el primer acceso lanzaba y **las condiciones de abajo
salían en falso sin haber medido nada** —y una excepción tapa a la siguiente—. Hoy los nueve
declaran como denominador que el árbol tenga el módulo, que es exactamente lo que PANT-37 tuvo que
deshacer en TC-827.
**SEIS casos de Orthanc decididos uno por uno, y ninguno borrado en silencio**: **TC-220**
(sucesor TC-838), **TC-221** (sucesor TC-833) y **TC-222** (sin sucesor: CeiboLink no lista
estudios) **RETIRADOS**; **TC-223 REESCRITO conservando su número** para cubrir los seis ayudantes
conservados y que la advertencia del `PatientID` siga en el archivo; **TC-230** (sucesor TC-833) y
**TC-231** (sucesor TC-841) **RETIRADOS**. Cada retiro deja su motivo y su sucesor **en el lugar
donde vivía el caso**. **TC-161 adaptado**: sus ids pasan de treinta a cuarenta y nueve y su lista
de secciones que no se pueden perder, de siete a ocho.
⚠️ **Y TC-223 ERA EL ÚNICO ROJO DOCUMENTADO DE LA SUITE —fallaba por la fecha— y AHORA PASA**: la
versión adaptada no depende de la fecha de hoy. **No es un rojo que se arregló en silencio**: está
declarado acá y en el commit.
**3/3 MUTACIONES MUERTAS**, en un worktree y **nunca** sobre el vivo, con el md5 del vivo
**idéntico** antes y después (`60ed9c1c`) y las tres anclas verificadas **ANTES** de correr: el
apodo como HTML mata TC-837 por **seis** condiciones, el token en un aviso mata TC-835 por **tres**
y el 401 que no borra el token mata TC-836 por **dos**.
**El conector FALSO es un servidor de verdad y no un `fetch` sustituido**, que es lo que hacían los
casos retirados: un `fetch` sustituido **no puede probar CORS**, ni el `Authorization` que viaja,
ni que el navegador trate un 404 distinto de un 503 — lo único que prueba es que la app llama a la
función que le pusimos. ⚠️ **Y su código y su token se generan AL AZAR en cada arranque**: la
primera versión los traía como constantes, y aunque eran valores inventados, **este repositorio es
público** y su regla es que no entra ningún token ni código de vinculación al código ni a las
pruebas.
**Línea base al cierre: suite 845/849**, en **DIECISÉIS** lotes cubriendo los **849 casos
distintos** —contados nombre por nombre con el patrón completo del id, **cero duplicados**—, en UNA
sola pasada sobre el árbol sellado, con los **849 ejecutados**, el md5 de `index.html` **idéntico**
antes y después (`60ed9c1c`) y el pendrive `DISK_IMG` verificado **dieciocho** veces. Los rojos son
**TC-376, TC-390 y TC-406**, tres de los cuatro de siempre —**TC-223, el cuarto, pasó a verde**—,
más **TC-753**, que tenía razón: `CLAUDE.md` todavía publicaba el sello anterior. **Ningún rojo
nuevo atribuible a la tanda**, y **los diez casos nuevos y los dos adaptados en verde**. **TC-551
y TC-557, los dos intermitentes declarados, salieron verdes.**
⚠️ **DOS COSAS CAMBIARON DESPUÉS DE ESA PASADA, Y SE DECLARAN EN VEZ DE INFORMAR UN NÚMERO QUE NO
CORRESPONDE.** (1) `CLAUDE.md` y los documentos de esta tanda se escribieron después, así que
**TC-753 se volvió a correr y quedó VERDE**: el estado real es **846/849**, con los tres rojos de
siempre y nada más. Ninguno de esos archivos es `index.html`, cuyo md5 sigue siendo el que la
suite midió. (2) El conector falso pasó a generar su código y su token **al azar** después de la
pasada —por la regla del repositorio público—, así que **se rehizo su lote entero, el 16, y dio
24/24**. Lo que NO se rehizo es la pasada completa: `index.html` no cambió, y el único archivo que
se movió sólo lo usan los diez casos de esta tanda.
**Semgrep 126 WARNING / 0 ERROR**, **un** aviso sobre la línea base de 125, identificado por diff
de hallazgos entre los dos árboles: es `ceibo-hardcoded-generic-secret` sobre
`var CLNK_TOKEN = 'ett_ceibolink_token'`, y es un **falso positivo** —la regla empareja porque el
nombre dice «TOKEN» y recibe una cadena, pero la cadena es **el nombre de la clave** y no el
token—. Queda declarado en **EC1-j**; renombrar la constante lo silenciaría, al precio de volver a
sellar y rehacer la suite.
**Sin huérfanos nuevos.** **17 bloques de JS inline y todos parsean.** **CELULAR: 59 hallazgos a
360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta, medida con el mismo script
en los dos árboles y con la máquina sola.
Lo declarado, en **EC1-a** a **EC1-j**; el mapa, en `docs/mapa/ceibolink-panel.md`.

**La tanda PANT-37 (2026-11-11) — el «What if» de la estenosis aórtica.** SEIS commits. Sello
**`v20261111-1450`**, md5 **`3f5893e7`**. La tarjeta de **estenosis aórtica de la vista 2D** gana un botón
**«What if»** con su ⓘ, que se pinta de **azul** sólo cuando la estenosis es **discordante** y
abre un panel flotante que simula qué pasaría si el flujo aumentara. Lo que mueve es **el dibujo
2D y su propio panel**: no escribe un campo, no guarda nada y no toca el informe, el PDF, el PPT
ni el Excel.
⚠️ **CUATRO HIPÓTESIS DE LA ORDEN RESULTARON FALSAS, las cuatro medidas en el inventario del
commit 1 y ninguna «arreglada» inventando.** (1) **El dibujo 2D no tiene aorta ni chorro aórtico
anterógrado**: `updJet` dibuja **tres** chorros y los tres son de **regurgitación**, y por debajo
del velo aórtico —cuyas bisagras están en `y≈171-178` y sus puntas en `y≈188-191`— lo dibujado es
la **aurícula izquierda**; un chorro anterógrado de 20 unidades cae en la **aurícula derecha**.
En su lugar la Vmax simulada va como **rótulo dentro del lienzo**, con halo, más el chip «Dibujo
según What if». (2) **No tiene frecuencia del paciente**: `S.dur` nace en **2,6 s** y nadie la
escribe nunca. (3) **No hay ningún panel arrastrable** en la app que sirviera de patrón —lo
arrastrable son lienzos que giran un 3D—, así que el arrastre se portó de la demo. (4) **«Siempre
visible» es cierto DENTRO de su tarjeta**, y la tarjeta sólo existe con la pastilla prendida o con
veredicto protésico.
⚠️ **Y UNA PRECISIÓN QUE ORDENÓ LA TANDA ENTERA:** la tarjeta que la demo aprobada refleja es el
`<li>` de la columna «Estenosis» de la **vista 2D**, no una tarjeta del formulario de Válvulas.
**Ningún corte se retipea**: la situación la decide `eaGradoCalculado()`, que ya devuelve `gVel`,
`gGrad` y `gAva`, y los cortes de las gráficas y de las dos líneas de lectura salen de
`EA_BANDAS.gmedSevMin`, de la banda `moderada` de `EA_BANDAS.vmax` y de `AVA_SEVERA_MAX`.
⚠️ **EL GRADIENTE PUEDE SER `null` ESTANDO CARGADO** —por debajo de `gmedModMin` esa función se
abstiene—, así que la condición va con `gGrad !== 'severa'`: con `=== 'moderada'`, una estenosis
de 0,8 cm² y gradiente de 12 mmHg —el bajo flujo más claro que hay— se leería como **concordante**.
Lo fija la mutación 10.
⚠️ **LA SIMULACIÓN ENTRA ENTRE `v2dEstado()` Y `S`, NUNCA DENTRO DE `v2dEstado()`**, que alimenta
también las tarjetas y la tabla de cavidades. **Y lo que entra son RAZONES y no valores
absolutos**, lo que da una propiedad medible: con el panel abierto y **nada movido** las dos
razones valen 1 y el **dibujo es idéntico al real**, verificado por el atributo `d` de sus dos
trazos a una fase fija.
**Medido con el área fija:** al duplicar el volumen sistólico el flujo se duplica **exacto**
(180 → 360 mL/s), el gradiente se **cuadruplica** exacto (25 → 100 mmHg) y la Vmax se **duplica**
exacta (3,2 → 6,4 m/s), con el área, el área indexada y el DVI sin moverse. **La frecuencia no
entra en el flujo** —el flujo es el de la eyección—, pero sí mueve el latido del dibujo y la línea
de lectura, la única que pasa a L/min (4,4 a 65 lpm, 7,5 a 110).
**La ley del área que se abre es una función PURA expuesta** —`wiAreaEn(a0, m, q0, q)`— y se
**prueba sola** con el par publicado de la guía europea de eco de estrés: área **0,79 → 1,22 cm²**
con flujo **183 → 370 mL/s** implica una pendiente de **0,2299** cm² por cada 100 mL/s y un área
proyectada a 250 mL/s de **0,9441 → 0,94 cm²**, que es el número que la orden pide; la misma
función reproduce el par de origen y sus dos topes (0,15 y 2,50).
**El tope del volumen sistólico es VDF − 2 mL**, el margen mínimo para que el ventrículo del
dibujo no se cierre a un punto: con VDF 120 el deslizador topa en **118** y en **98 %** en modo
FEVI, y el volumen simulado **nunca pasa del VDF**.
**Los dos SUPUESTOS** —0,30 s y 70 lpm— aparecen sólo si el estudio no trae el dato, van rotulados
«supuesto» y **no se guardan**: editar el tiempo de eyección a 400 ms mueve el flujo de 180 a 135
mL/s y `tango_te` y `ao_fc` siguen **vacíos**.
**Las TRES restituciones** —la ✕, «Volver a lo medido» y «Nuevo estudio»— devuelven el dibujo
real, las tres por el mismo camino y colgadas de `v2dCerrar`, que es el embudo de las cuatro
puertas de la vista 2D.

**Cobertura: TC-825 a TC-831**, los siete cayendo contra `f1412a2` por **74 condiciones** y
**CERO por excepción** —todo acceso va por un ayudante con guarda que devuelve una forma vacía y
no `null`—, con **TC-471**, **TC-500** y **TC-502** adaptados. Medido en un worktree con el
**mismo** archivo de casos y sólo el `index.html` distinto: **10/10 en el árbol vivo y 1/10 en el
anterior**, y el único que pasa en los dos es **TC-502**, que es una adaptación de un caso viejo
y no un caso de esta tanda.
⚠️ **Y ESO HUBO QUE VERIFICARLO CON EL ARCHIVO DE CASOS FINAL, PORQUE LA CORRIDA GUARDADA ERA DE
UNA VERSIÓN ANTERIOR Y TC-827 TODAVÍA CAÍA POR EXCEPCIÓN.** Le quedaban **tres** accesos pelados
fuera de los ayudantes —el deslizador de volumen leído para sacarle su mínimo y su máximo, el
**padre** del campo supuesto y la tarjeta del globo—, y contra el árbol anterior esos nodos no
existen: el `TypeError` cortaba **antes de medir nada** y el caso declaraba **cero** condiciones.
**No lo encontró el censo sino la corrida contra la línea base**, que es para lo que está, y el
primero de los tres tapaba al segundo y el segundo al tercero —una excepción esconde a la
siguiente—, así que lo que los cerró fue **barrer el bloque entero** buscando el patrón en vez
de perseguirlos de a uno.
⚠️ **Y al arreglarlo, el acento grave dentro de mi propio comentario**, por **decimoctava** tanda
seguida, con la agravante que PANT-31 dejó escrita: lo que quedaba era JS **válido**, así que
`node --check` **pasó**. Lo cazó `check_backticks.py`.
⚠️ **TC-502 SALÍA VERDE AISLADO Y ROJO EN LA SUITE, y la causa es de lote**: su censo de
globos contaba los `[data-vinfo]` de toda la página, así que el globo nuevo entraba o no según
si un caso anterior había dejado abierta la vista 2D. Hoy saltea los que viven dentro de
`#v2d-ov`, y el conteo del registro —**142 → 143** con la clave `wi-aplica` exigida por
nombre— vive en **TC-825 (A5b)**, que además declara que esa clave está en `VINFO` y **no** en
`VINFO_REF`.
**41/41 MUTACIONES DIRIGIDAS MUERTAS** en **5,9 min**, en un worktree y **nunca** sobre el vivo,
con el md5 del vivo **idéntico** antes y después (`3f5893e7`), **cero sobrevivientes y cero que no
aplicaran**, y las 41 anclas verificadas **ANTES** de correr.
⚠️ **EL PRIMER BARRIDO DEJÓ SIETE SOBREVIVIENTES Y LOS SIETE ERAN HUECOS REALES**, cerrados con
condiciones nuevas y **no aflojando una mutación**: las **tres escenas de situación** que faltaban
—sólo-Vmax-severa, sólo-gradiente-severo y el gradiente de 12 mmHg con el operador abstenido—, la
regla de CSS del panel leída de `document.styleSheets`, y el `display` **computado** del panel
recién nacido y del panel cerrado.
⚠️ **Y LA MUTACIÓN 05 ERA EQUIVALENTE**: sacarle la clase `btn` al botón **no** le saca el piso de
44 px, porque ese piso lo pone la regla global `button, [role=button], .btn, … { min-height:44px }`
del archivo. Se reescribió para atacar el piso por estilo en línea, que es lo que la condición
mide de verdad.
**A/B contra `f1412a2`, con el PDF y el PPT generados de verdad: 121 escenas, 148.572 claves y
55.297 celdas de Excel, con CERO diferencias de superficie firmada** —informe en los tres estilos,
EN SUMA, las **457** columnas clave por clave, los campos, el Laboratorio, el PDF en sus seis
plantillas y el PPT—. **Las 484 de pantalla son TRES hechos y no cuatro claves**, contados uno por
uno: el globo nuevo, que se cuenta **dos veces** (`_vinfoN` **142 → 143** en las 121 y
`_p9_denom.nGlobos` **142 → 143**, su única clave que cambia), y el rótulo de Vmax del dibujo,
que suma **exactamente 61 caracteres a la firma del SVG en las 121 escenas** (`_v2dFirma` y
`_v2dFirmaN`, delta constante). **Ninguna otra clave difiere.**
**CHROME Y WEBKIT COINCIDEN EN LOS VEINTE CRUCES** (dos motores × 1440, 1280, 1000, 768 y 390 px ×
dos temas **reales**, puestos por `ett_theme` + `loadTheme()` y **devueltos** por la sonda: diez
«día» y diez «noche»), con **UNA sola firma de valores** sobre todo lo que se mide: el botón en
**44 px de alto** y **azul** en los veinte —`rgb(47,111,224)` de día y `rgb(79,142,247)` de noche,
que es el azul de cada tema—, la situación **discordante** con su oración idéntica, el panel
**flotante** a 1440, 1280 y 1000 px y **en el flujo** a 768 y 390, **dentro de la pantalla** en los
veinte, de **300 / 300 / 284 / 714 / 336** px de ancho, **TAPA 0** del dibujo en los veinte, sus
**siete** filas, sus **tres** gráficas con **22** nodos cada una y **cero** negros, **cero**
controles por debajo de 30 px con los seis llevando su área táctil de 44, **cero** textos
recortados, **cero** desplazamiento horizontal y **CERO errores de consola y de página en los dos
motores**.
⚠️ **LOS 284 PX DE 1000 SON EL ARREGLO, NO UN DEFECTO**: ahí el panel **se angosta** al hueco que
le queda a su derecha en vez de correrse sobre el dibujo (**P37-f**).
⚠️ **La única diferencia entre motores es de métrica de fuente**: el botón mide **68 px en Chrome
y 70 en WebKit**. **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema.
**Semgrep 125 WARNING / 0 ERROR**, la línea base exacta. **Sin huérfanos nuevos.** **Excel 457** y
**cero campos guardados nuevos**. **17 de 19** bloques de JS inline parsean. **CELULAR: 59
hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea base exacta, medida con el
**mismo script en los dos árboles** y con la máquina sola.
**Línea base al cierre: suite 836/844**, en **DIECISÉIS** lotes cubriendo los **844 casos
distintos** —contados nombre por nombre con el patrón **completo** del id, **cero duplicados**—,
en UNA sola pasada sobre el árbol sellado, con los **844 ejecutados**, el md5 de `index.html`
**idéntico** antes y después (`3f5893e7`) y el pendrive `DISK_IMG` verificado **dieciocho** veces:
al abrir, en cada uno de los dieciséis lotes y al cerrar. Los rojos son **TC-223, TC-376, TC-390 y
TC-406**, los cuatro de siempre; **TC-358, TC-551 y TC-557**, los tres intermitentes que la orden
declara; y **TC-233**, que **no está en ninguna lista** y quedó caracterizado y declarado en
**P37-j**. **Ningún rojo nuevo atribuible a la tanda**, y **los siete casos nuevos y los tres
adaptados en verde**.
⚠️ **ESTA ES LA SEGUNDA PASADA LIMPIA, Y LA HUBO QUE REHACER PORQUE EL ARCHIVO DE CASOS CAMBIÓ
DESPUÉS DE LA PRIMERA**: los tres accesos pelados de TC-827 y la tarjeta de TC-826 se cerraron
**después** de aquella corrida, y esta casa no informa un número de una pasada hecha con un
archivo de casos anterior.
⚠️ **Y LAS DOS PASADAS NO TIENEN LOS MISMOS ROJOS, que es lo que hay que mirar y no el total**:
la primera dio **838/844** con **TC-502** —que era mío, salía verde aislado y rojo en su lote, y
hoy está adaptado y verde— y con **TC-551 verde**; la segunda da 836 con TC-551 y TC-233 rojos.
Los cuatro de siempre y los siete casos nuevos se comportan igual en las dos.
Lo declarado, en **P37-a** a **P37-j**; el mapa, en `docs/mapa/pant37-what-if.md`; el inventario,
en `docs/INVENTARIO_P37.md`; las fichas, en `docs/mapa/tests-fichas-825.md`; la guía manual, en
`docs/GUIA_PRUEBA_PANT37.md` (**10** pasos).

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
