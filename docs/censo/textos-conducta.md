# Censo — los textos de CONDUCTA y de DATO FALTANTE que la app muestra hoy

**Tanda «Y3f», 2026-10-20. Es una LISTA: no se cambió ni un texto.** La orden pide el
inventario para que Maicol decida cuáles se retiran y cuáles pasan a la pestaña Evidencia.

Armado por censo automático sobre `index.html` y revisado a mano. **Cubre los literales de
cadena del archivo** —que es donde viven estos textos— y por eso no incluye los que se
componen por partes en tiempo de ejecución; esos quedan declarados abajo.

| Qué | Cuántos |
|---|---|
| **(a) recomiendan o sugieren CONDUCTA** | **73** |
| **(b) piden COMPLETAR un dato** | **175** |
| **TOTAL listado abajo** | **248** |
| descartadas por ser fragmentos de código y no textos (no se listan) | 3 |

⚠️ **ESTA TABLA DECÍA 76 / 175 / 251 Y LAS FILAS DE ABAJO SON 73 / 175 / 248.** El resumen se
escribió antes de contar las filas y quedó contradiciendo a su propia lista. Lo que vale es la
lista: **se contó con un barrido sobre las filas del archivo**, no a ojo. Queda anotado porque
un censo que se contradice consigo mismo es peor que no tenerlo.

⚠️ **LA COLUMNA «dónde sale» SE DERIVA DE LA FUNCIÓN QUE LO ARMA**, no de haber seguido cada
texto hasta la pantalla: lo que está en `generarInforme` va al informe y al EN SUMA, lo que
está en un armador de PDF va al papel, y el resto es pantalla. Es una heurística declarada;
el texto exacto y la función sí están verificados, que es lo que hace falta para decidir.

⚠️ **LO QUE ESTE CENSO NO ALCANZA, declarado:** los textos que se arman concatenando
fragmentos en tiempo de ejecución (por ejemplo «falta: » más la lista de criterios que
`teerEstado` nombra uno por uno), los que vienen de una tabla de datos indexada por clave, y
los `<option>` que dicen «— no evaluado —», que son VALORES de un selector y no un pedido.

⚠️ **LAS QUE SALEN DEL PANEL DE EVIDENCIA YA ESTAN DONDE CORRESPONDE**, y van marcadas: esa
pestaña es justamente el lugar donde la orden del Y3f manda poner los umbrales y las
conductas. Se listan igual para que el inventario sea completo.

---

| tipo | texto (exacto) | función que lo arma | área | dónde sale |
|---|---|---|---|---|
| conducta | Sin criterios de intervención por los datos cargados — seguimiento clínico y por imagen | `fopC` | Congénitas | pantalla |
| conducta | BSE 2024: el algoritmo de FA no se recomienda con frecuencia ventricular media en reposo >  | `diastFcAvisoSync` | Función diastólica | pantalla |
| conducta |  mm, sin dilatación — seguimiento anual (la bicúspide es hereditaria: corresponde ofrecer cribado a familiares de primer grado) | `otroDiam` | Otros | pantalla |
| conducta | Ecocardiograma anual con valoración del tamaño del ventrículo derecho y del Qp/Qs. La resonancia es el método de referencia para cuantificar el shunt cuando el eco no … | `vdCat` | Ventrículo derecho | pantalla |
| conducta | Shunt moderado — considerar cierre | `eteQpQsInterp` | Válvula tricúspide | pantalla |
| conducta | Shunt significativo — evaluar cierre según sobrecarga de VD y resistencia pulmonar | `eteQpQsInterp` | Válvula tricúspide | pantalla |
| conducta | Optimizar GDMT previo. Evaluar Heart Team. | `C` | — | pantalla |
| conducta | Anatomía favorable. Evaluar Heart Team. | `C` | — | pantalla |
| conducta | Un criterio no cumplido. Discutir en Heart Team con imagen multimodal (ETE 3D + TC). | `C` | — | pantalla |
| conducta |  criterios no cumplidos. Evaluar cirugía o Heart Team. | `C` | — | pantalla |
| conducta | para SAVR la guía define «bajo» en una nota al pie —STS-PROM y EuroSCORE II por debajo del 4 % Y evaluación del Heart Team—; en las filas del asintomático dice «riesgo… | `EC` | — | pantalla | pantalla (Evidencia — ahí corresponde) |
| conducta | sin clase asignada en 2025. Lo graduado es que la MODALIDAD se decida por Heart Team incorporando la expectativa de vida y el manejo a lo largo de la vida (Clase I · N… | `EC` | — | pantalla | pantalla (Evidencia — ahí corresponde) |
| conducta | Cirugía de la válvula mitral RECOMENDADA en el paciente sintomático con insuficiencia mitral primaria severa considerado operable por el Heart Team. | `EC` | — | pantalla | pantalla (Evidencia — ahí corresponde) |
| conducta | TEER A CONSIDERAR en el paciente sintomático con insuficiencia mitral primaria severa anatómicamente apto y con riesgo quirúrgico alto según el Heart Team. | `EC` | — | pantalla | pantalla (Evidencia — ahí corresponde) |
| conducta | Sin gradiente significativo - seguimiento clinico y por imagen | `_ds` | — | pantalla |
| conducta | Ventriculo sistemico normal - seguimiento anual | `_ds` | — | pantalla |
| conducta | Seguimiento clinico y por imagen | `_ds` | — | pantalla |
| conducta | Control periodico | `_ds` | — | pantalla |
| conducta | La decisión entre cierre transcatéter y cierre quirúrgico de una fuga periprotésica clínicamente significativa la toma el Heart Team. Evalúa el riesgo del paciente, la… | `_imAssertUmbrales` | — | pantalla | pantalla (Evidencia — ahí corresponde) |
| conducta | Evaluación por Heart Team RECOMENDADA en la insuficiencia cardíaca aguda (NYHA III o IV) por trombosis obstructiva de prótesis MECÁNICA, para decidir entre re-reemplaz… | `_imAssertUmbrales` | — | pantalla | pantalla (Evidencia — ahí corresponde) |
| conducta | Candidato a cirugía (Heart Team) | `_indIA` | — | pantalla (Evidencia) |
| conducta |  mm, pero esa fila exige riesgo quirúrgico BAJO y el consignado no lo es: la decisión vuelve al Heart Team. | `_indIAModalidad` | — | pantalla (Evidencia) |
| conducta | TAVI PUEDE CONSIDERARSE en el paciente sintomático con insuficiencia aórtica severa no elegible para cirugía según el Heart Team, si la anatomía es apta. | `_indOrigenAssert` | — | pantalla (Evidencia) |
| conducta | Heart Team con experiencia en patología tricuspídea: Clase I C antes de cualquier intervención. Es fila nueva de la 2025 y no depende del escenario. | `_indVT` | — | pantalla (Evidencia) |
| conducta | ; hallazgo que requiere correlación clínica y control evolutivo. | `_periHemo` | — | pantalla |
| conducta | → Continuar con pruebas genéticas del gen TTR para diferenciar ATTR wild-type (senil, sin mutación) de ATTR mutante (hereditario). Derivar a consulta especializada en … | `actualizarAlgoritmo` | — | pantalla |
| conducta | → El diagnóstico de amiloidosis cardíaca requiere biopsia con tipificación del amiloide, generalmente BEM (biopsia endomiocárdica). No se puede asumir ATTR sin biopsia… | `actualizarAlgoritmo` | — | pantalla |
| conducta | Posiblemente apto — evaluar Heart Team | `area` | — | pantalla |
| conducta | Probabilidad intermedia con los datos disponibles. Se recomienda completar el score y, según resultado, ecocardiografía de esfuerzo y/o cateterismo cardíaco derecho. | `avisoFevi` | — | pantalla |
| conducta | probabilidad intermedia de HFpEF. Se recomienda ecocardiografía de esfuerzo y/o cateterismo cardíaco derecho para confirmación diagnóstica. | `avisoFevi` | — | pantalla |
| conducta |  cm²: una contraindica el procedimiento y otra no. Conviene resolverlo antes de decidir. | `avmDiscordantes` | — | pantalla |
| conducta | Ventana aortopulmonar con shunt invertido (derecha a izquierda) — fisiología de Eisenmenger: el cierre está CONTRAINDICADO; derivar a unidad de cardiopatías congénitas… | `banda` | — | pantalla |
| conducta | Seguimiento ecocardiográfico anual, vigilando la progresión del gradiente y de la insuficiencia aórtica secundaria. Derivación a cirugía cardíaca de congénitas del adu… | `banda` | — | pantalla |
| conducta | Seguimiento ecocardiográfico anual con evaluación de los ostios coronarios. Derivación a cirugía cardíaca de congénitas del adulto ante gradiente medio ≥ | `banda` | — | pantalla |
| conducta | La anatomía se consignó como NO apta, así que esta fila queda sin cumplir su condición. Se publica igual porque la aptitud anatómica la evalúa el Heart Team con imagen… | `base` | — | pantalla |
| conducta | Esta fila exige además que la anatomía y las características de la prótesis sean aptas, y eso no está contestado. La guía no dice cuál de las dos filas prevalece: la v… | `base` | — | pantalla |
| conducta | La guía no dice cuál de las dos filas prevalece: la vía la elige el Heart Team. | `base` | — | pantalla |
| conducta | La vía de intervención se decide por evaluación del Heart Team. | `cerrar` | — | pantalla |
| conducta |  + E(x.derivacion) :  | `conv` | — | pantalla |
| conducta | <div style="font-size:11px;color:#fca5a5;background:rgba(127,29,29,.22);border:1px solid #7f1d1d;border-radius:7px;padding:6px 8px;margin-bottom:6px;">🔴 <b>El archivo … | `conv` | — | pantalla |
| conducta | Complicación grave. Derivar a centro especializado. | `critFontan` | — | pantalla |
| conducta | ecocardiográficamente. Se recomienda cateterismo cardíaco derecho e izquierdo simultáneo  | `cvrFrases` | — | pantalla |
| conducta | 1,5–2,0 — moderado, considerar cierre (n= | `deBase` | — | pantalla |
| conducta | La modalidad se decide por evaluación del Heart Team sobre las características clínicas, anatómicas y del procedimiento, incorporando el manejo a lo largo de la vida y… | `det` | — | pantalla |
| conducta | SAVR o TAVI para el resto de los candidatos a bioprótesis aórtica, según evaluación del Heart Team. | `det` | — | pantalla |
| conducta | condición en la que el Chi² pierde validez — conviene confirmarlo con un test exacto de Fisher. | `detChi` | — | pantalla |
| conducta | Morfología consignada BICÚSPIDE: la recomendación Clase I A de TAVI está escrita para la válvula tricúspide y no se aplica acá. El resto de los candidatos entra por ev… | `edad` | — | pantalla |
| conducta | ❌ Estudio positivo para isquemia. Se recomienda correlación con coronariografía y evaluación por cardiología intervencionista. | `eeUpdateResult` | — | pantalla (marcado) |
| conducta | Control cada 6-12 meses en centro especializado en hipertensión pulmonar y cardiopatías congénitas del adulto. Ecocardiograma anual. Saturación de oxígeno en cada visita. | `eisenEstado` | — | pantalla |
| conducta | Esta fila exige que la enfermedad coronaria sea NO COMPLEJA, y eso no se evalúa en esta aplicación. La guía tampoco dice cuál de las dos filas prevalece: la vía la eli… | `fal` | — | pantalla |
| conducta | La decisión entre cierre transcatéter y cierre quirúrgico es del Heart Team (Clase I · Nivel C): evalúa el riesgo del paciente, la morfología de la fuga y la experienc… | `fal` | — | pantalla |
| conducta | Conviene trazar las dos fases igual.</div> | `fila` | — | pantalla |
| conducta | Bronquitis plástica — complicación grave. Derivar a centro especializado. | `fontanComplicaciones` | — | pantalla |
| conducta | Ductus grande no restrictivo — considerar cierre | `htp` | — | pantalla |
| conducta |  mm/m² (>23) y factores de riesgo — considerar cirugía de la aorta (ESC 2024, Clase IIa) | `maxAo` | — | pantalla |
| conducta |  con factores de riesgo — considerar cirugía de la aorta (ESC 2024, Clase IIa desde  | `maxAo` | — | pantalla |
| conducta |  mm en que los factores de riesgo pasan a indicar cirugía (ESC 2024, Clase IIa) | `maxAo` | — | pantalla |
| conducta | El mecanismo consignado es SECUNDARIO (funcional). Las filas de esta sección son las de la insuficiencia mitral PRIMARIA y no gobiernan esa situación: la conducta en l… | `modRep` | — | pantalla |
| conducta | Clase IIa — considerar cirugía | `notaFall` | — | pantalla |
| conducta | ## Notas ETE / Heart Team | `notas` | — | pantalla |
| conducta | Sin criterios de reintervención por los datos cargados — seguimiento clínico y por imagen.  | `obstrModerada` | — | pantalla |
| conducta | Considerar cirugía — Clase IIa | `pill` | — | pantalla |
| conducta | Eco basal recomendado. Control clínico durante el tratamiento. Eco al finalizar si hay síntomas. | `pisoFarm` | — | pantalla |
| conducta |  sin gradiente significativo — seguimiento clínico y por imagen | `postRep` | — | pantalla |
| conducta | Una sola vena anómala rara vez genera un shunt significativo — seguimiento clínico. | `q` | — | pantalla |
| conducta | Sin criterios de intervención por los datos cargados — seguimiento anual. | `q` | — | pantalla |
| conducta | Paciente post-reparación de coartación de aorta. Seguimiento anual obligatorio.  | `sit` | — | pantalla |
| conducta | la fila exige que la anatomía y las características de la prótesis sean aptas. La evalúa el Heart Team con imagen dedicada | `t12vti` | — | pantalla |
| conducta | Función del ventrículo sistémico conservada — seguimiento anual | `tgaConclusion` | — | pantalla |
| conducta | Disfunción leve del ventrículo sistémico — seguimiento anual y vigilancia de la progresión | `tgaConclusion` | — | pantalla |
| conducta |    Si la dejás, el importador la saltea igual, pero conviene borrarla. | `tipoDe` | — | pantalla |
| conducta | + columnas conviene inmovilizar la cabecera (en Excel: Vista → Inmovilizar fila | `tipoDe` | — | pantalla |
| conducta | , hallazgo que amerita control evolutivo del calibre aórtico. | `vx` | — | pantalla |
| dato faltante | No evaluadas. | `amiloTextoAlgoritmo` | Amiloidosis | pantalla |
| dato faltante | no ingresado | `amiloTextoCardioOnco` | Amiloidosis | pantalla |
| dato faltante | Sin parámetros calculados: faltan datos de entrada. | `amiloTextoHemo` | Amiloidosis | pantalla |
| dato faltante | El grado de dilatación auricular no se informa: la guía lo gradúa sólo por volumen indexado, que requiere el volumen de AI y la superficie corporal. | `aiIdx` | Aurícula izquierda | pantalla |
| dato faltante | parcial — falta la depresión del ST; sin interpretación | `cxDuke` | Calculadoras | pantalla |
| dato faltante | Diámetro telesistólico del VI: no se pudo cargar la banda de plausibilidad — recargar la aplicación | `cxMudo` | Calculadoras | pantalla |
| dato faltante | FEVI: no se pudo cargar la banda de plausibilidad — recargar la aplicación | `cxMudo` | Calculadoras | pantalla |
| dato faltante | El umbral de FEVI no está disponible — recargar la aplicación | `cxMudo` | Calculadoras | pantalla |
| dato faltante | . No consta una comunicación interauricular en este estudio: la cianosis obliga a buscarla | `fopC` | Congénitas | pantalla |
| dato faltante | No consta la situación clínica (síntomas y capacidad de ejercicio), que es de lo que dependen las indicaciones de intervención de la ESC 2020 en la anomalía de Ebstein | `fopC` | Congénitas | pantalla |
| dato faltante | BSE 2024: completar edad y sexo en Paciente para valorar el e′ (Tabla 2, pág. 13). | `diastBseEprimaAvisoSync` | Función diastólica | pantalla |
| dato faltante |  sin evaluar | `diastFAEvaluarASE2016` | Función diastólica | pantalla |
| dato faltante | Completar en «Calculadora de Riesgo CV» | `hfaicosPublicarBasal` | HFA-PEFF | pantalla |
| dato faltante | Las medidas del tracto de salida alcanzan rango de criterio, pero no consta la evaluación de la motilidad regional del ventrículo derecho, que los criterios Task Force… | `mcaConclusion` | Miocardiopatías | pantalla |
| dato faltante | Hay aneurisma regional del ventrículo derecho pero no consta ninguna medición del tracto de salida ni la fracción de acortamiento, que los criterios Task Force exigen … | `mcaConclusion` | Miocardiopatías | pantalla |
| dato faltante | Miocardiopatía arritmogénica limítrofe (Task Force 2010: 3 puntos) — completar criterios diagnósticos | `mcaConclusion` | Miocardiopatías | pantalla |
| dato faltante |  — categoría de arritmias sin puntuar: no consta la morfología de la taquicardia ventricular | `mcaConclusion` | Miocardiopatías | pantalla |
| dato faltante | No constan el Qp/Qs ni la medición del ventrículo derecho: sin ninguno de los dos no se puede valorar la repercusión hemodinámica de la conexión anómala. | `vdCat` | Ventrículo derecho | pantalla |
| dato faltante | sin consignar — es una de las contraindicaciones de la tabla | `imSevTxt` | Válvula mitral | pantalla |
| dato faltante | [ETE_CORTES] falta la fila de  | `ETE_GID_MAP` | Válvula tricúspide | pantalla |
| dato faltante | >No consta</option><option value= | `eteTecnicaHuecos` | Válvula tricúspide | pantalla (marcado) |
| dato faltante | >No evaluado</option><option value= | `eteTecnicaHuecos` | Válvula tricúspide | pantalla (marcado) |
| dato faltante | >No evaluada</option><option value= | `eteTecnicaHuecos` | Válvula tricúspide | pantalla (marcado) |
| dato faltante | No ingresado | `C` | — | pantalla |
| dato faltante | "><em>2 a 4 — zona gris, completar estudio</em></div> | `U` | — | pantalla |
| dato faltante | <div class="hfp-sub" style="margin-top:7px;">Faltan datos en algún dominio: el puntaje es parcial.</div> | `U` | — | pantalla |
| dato faltante | presión elevada, falta la E/A para graduar | `_a25` | — | pantalla |
| dato faltante | Falta el Qp/Qs atribuible, el borde o el VD basal que deciden la rama | `_civConducta` | — | pantalla |
| dato faltante | Criterios parciales: falta la HTA, gradiente limitrofe o istmo hipoplasico - completar evaluacion | `_ds` | — | pantalla |
| dato faltante | HTP no evaluada | `_ds` | — | pantalla |
| dato faltante | Falta la edad, que es de lo que depende la indicacion - completar | `_ds` | — | pantalla |
| dato faltante | No consta el ACV criptogenico ni la edad: la conducta depende de ellos | `_ds` | — | pantalla |
| dato faltante | No consta si hay sintomas, de lo que dependen las indicaciones de intervencion | `_ds` | — | pantalla |
| dato faltante | La rama que afirma "conservada" exige que se haya medido - completar la evaluacion | `_ds` | — | pantalla |
| dato faltante | No constan sintomas ni capacidad de ejercicio, de lo que dependen las indicaciones | `_ds` | — | pantalla |
| dato faltante | Alcanza el umbral pero no consta el riesgo quirurgico, del que depende la indicacion | `_ds` | — | pantalla |
| dato faltante | La conducta del FOP la decide el CONTEXTO CLINICO —ACV criptogenico y edad—, no la anatomia: por eso las filas «sin contexto» y «sin edad» no son relleno sino el aviso… | `_ds` | — | pantalla |
| dato faltante | EAo severa por AVA con bajo gradiente - falta el volumen latido indexado para definir la forma. | `_eaFundCola` | — | pantalla |
| dato faltante | Descargar el manual en PDF | `_eeArranqueGates` | — | pantalla |
| dato faltante | no atribuible: hay más de un shunt con datos, o faltan los flujos del TSVI y del TSVD | `_indDAP` | — | pantalla (Evidencia) |
| dato faltante | No se pudo cargar el umbral de área de esta válvula, y es el que define la primera contraindicación del procedimiento. | `_indEMAlarma` | — | pantalla (Evidencia) |
| dato faltante | Umbral de área valvular (recargar la aplicación) | `_indEMAlarma` | — | pantalla (Evidencia) |
| dato faltante | banda de plausibilidad no disponible — recargar la aplicación | `_indIA` | — | pantalla (Evidencia) |
| dato faltante | banda de plausibilidad de peso y talla no disponible — recargar la aplicación | `_indIA` | — | pantalla (Evidencia) |
| dato faltante | requiere el diámetro telesistólico | `_indIA` | — | pantalla (Evidencia) |
| dato faltante |  mm. Falta el riesgo quirúrgico para saber si corresponde considerar el reemplazo concomitante (Clase IIa · Nivel C exige riesgo bajo). | `_indIAModalidad` | — | pantalla (Evidencia) |
| dato faltante | requiere el VTI de la prótesis por CW y el VTI del TSVI | `_indProtM` | — | pantalla (Evidencia) |
| dato faltante | umbral no disponible — recargar la aplicación | `_indSinUmbral` | — | pantalla (Evidencia) |
| dato faltante | sin consignar — el grado de insuficiencia tricuspídea se elige en la pestaña Válvulas | `_itSev` | — | pantalla |
| dato faltante | Sí · No · No evaluada | `_labXlsEtiq` | — | pantalla |
| dato faltante | Septum móvil · No aumentada · No evaluada | `_labXlsEtiq` | — | pantalla |
| dato faltante | Sí · No · No evaluado | `_labXlsEtiq` | — | pantalla |
| dato faltante | Presente · Ausente · No evaluado | `_labXlsEtiq` | — | pantalla |
| dato faltante | Sí · No · No consta | `_labXlsEtiq` | — | pantalla |
| dato faltante | Completar los parámetros de función diastólica para clasificar. | `_mapa` | — | pantalla |
| dato faltante | en este estudio no consta la evaluación de la válvula aórtica en ese sentido. | `_morfVA` | — | pantalla |
| dato faltante | Evaluación ecocardiográfica de sobrecarga VD aguda (TEP): criterios incompletos (McConnell / signo 60-60 / tabique en D no evaluados) — no se emite orientación diagnós… | `_omit` | — | pantalla |
| dato faltante | Puntaje parcial: falta completar algún dominio. | `_rot` | — | pantalla |
| dato faltante | Sin conclusión: faltan datos del centellograma o de las proteínas monoclonales. | `a` | — | pantalla |
| dato faltante | falta el dato, o no lo aporta el ecocardiograma | `amb` | — | pantalla |
| dato faltante | Completar mediciones | `area` | — | pantalla |
| dato faltante | — faltan datos en Hemodinámica | `asc` | — | pantalla |
| dato faltante | No permite descartar ni confirmar HFpEF; completar los datos faltantes. | `avisoFevi` | — | pantalla |
| dato faltante | Cargar el volumen de la aurícula izquierda. | `bVol` | — | pantalla |
| dato faltante | La estenosis es severa, el procedimiento requiere un sustituto valvular, el paciente está asintomático y ninguno de los criterios contestados se cumple. La guía reserv… | `balon` | — | pantalla |
| dato faltante | FOP con ACV criptogénico — falta la edad del paciente, de la que depende la indicación: el cierre percutáneo es Clase IIa por debajo de los 60 años | `banda` | — | pantalla |
| dato faltante | . No consta si hubo ACV criptogénico, que es el dato del que depende la indicación de cierre | `banda` | — | pantalla |
| dato faltante |  — la conducta depende del contexto clínico (ACV criptogénico, edad): no consta en este estudio | `banda` | — | pantalla |
| dato faltante | FOP sin estudio de contraste con burbujas — el shunt no fue interrogado; completar con solución salina agitada y maniobra de Valsalva si el contexto clínico lo justifica | `banda` | — | pantalla |
| dato faltante | Umbral de severidad no disponible: recargar la aplicación. Sin él no se puede decir qué valor cae en qué fila. | `banda` | — | pantalla |
| dato faltante | faltan datos o no se alcanza el N mínimo. NO se corrió ninguna prueba, así que no hay  | `bloqueAsoc` | — | pantalla |
| dato faltante |  mm; falta la superficie corporal (peso y talla) para indexarlo y aplicar el umbral de 8 mm/m² | `bsa` | — | pantalla |
| dato faltante | falta la superficie corporal | `bsa` | — | pantalla |
| dato faltante | completar péptidos → | `btn` | — | pantalla |
| dato faltante | no consta resonancia, que el ecocardiograma no evalúa | `c` | — | pantalla |
| dato faltante |  — volúmenes de VD por resonancia, no evaluados por ecocardiografía | `c` | — | pantalla |
| dato faltante | Hallazgos sugestivos pero score <8 o criterios cualitativos insuficientes. Evaluar en contexto clínico. Completar estudio. | `calcETT` | — | pantalla |
| dato faltante | — (completar VCI) | `calcPSAP` | — | pantalla |
| dato faltante | Falta el sexo:  | `cambian` | — | pantalla |
| dato faltante | Cargar el sexo | `cambian` | — | pantalla |
| dato faltante | Espesor parietal no ingresado. | `cat` | — | pantalla |
| dato faltante |  — sin consignar | `catTxt` | — | pantalla |
| dato faltante | sin consignar — se elige en la pestaña Válvulas | `catTxt` | — | pantalla |
| dato faltante |  · sin evaluar:  | `cel` | — | pantalla |
| dato faltante | — completar VCI | `cerrarSesionReal` | — | pantalla (marcado) |
| dato faltante | — completar Diám. y VTI del TSVD | `cerrarSesionReal` | — | pantalla (marcado) |
| dato faltante | &mdash; completar la velocidad | `cerrarSesionReal` | — | pantalla (marcado) |
| dato faltante | >— no evaluado —</option><option value= | `cerrarSesionReal` | — | pantalla (marcado) |
| dato faltante |  selected>— no evaluado —</option><option value= | `cerrarSesionReal` | — | pantalla (marcado) |
| dato faltante | <p style="font-size:11px;color:var(--text2);margin:0 0 14px;">Verificá y corregí si hace falta las severidades del estudio. Lo que confirmes acá queda cargado en la ta… | `cloneSel` | — | pantalla |
| dato faltante | No se dibuja el ventrículo: falta cargar el DDVI o el VDFVI. | `col` | — | pantalla |
| dato faltante | Para completar el panel falta cargar:  | `col` | — | pantalla |
| dato faltante | . No consta con qué método se midieron: el umbral de la guía está validado sobre resonancia, así que el criterio no puede darse por cumplido | `cruza` | — | pantalla |
| dato faltante | : no es un archivo DICOM (le falta la marca «DICM» en el byte 128) | `dcmImgPick` | — | pantalla |
| dato faltante | requiere el DDVI y la superficie corporal (peso y talla) | `ddviIdx` | — | pantalla |
| dato faltante | TV no evaluada | `detalle` | — | pantalla |
| dato faltante | falta el tipo | `detalle` | — | pantalla |
| dato faltante | Cargar el diámetro de los senos de Valsalva. | `diam` | — | pantalla |
| dato faltante | Cargar la edad para elegir el gráfico que corresponde. | `diam` | — | pantalla |
| dato faltante | Score HCM Risk-SCD no calculado, faltan datos:  | `donde` | — | pantalla |
| dato faltante | . Los dos hallazgos que la ESC 2023 valora dentro de esta banda no constan:  | `donde` | — | pantalla |
| dato faltante | . El modelo no está validado en algunas poblaciones y no consta si este paciente pertenece a ellas:  | `donde` | — | pantalla |
| dato faltante | . Sin evaluar:  | `donde` | — | pantalla |
| dato faltante | Factores mayores de la AHA/ACC 2020: ninguno evaluado | `donde` | — | pantalla |
| dato faltante |  factor mayor sin evaluar | `donde` | — | pantalla |
| dato faltante |  factores mayores sin evaluar | `donde` | — | pantalla |
| dato faltante | , pero quedan factores mayores sin evaluar: clase no establecida | `donde` | — | pantalla |
| dato faltante | . No consta resonancia, que es uno de los factores mayores de la AHA y el eco no evalúa | `donde` | — | pantalla |
| dato faltante | falta la onda E y la onda A tricuspídeas, las dos dentro de su banda de plausibilidad.</p> | `dtvdAlgoRender` | — | pantalla |
| dato faltante | No consta si la taquicardia ventricular fue sostenida o no sostenida. Los criterios Task Force 2010 no lo requieren —cuentan las dos por igual— pero sin ese dato no pu… | `evOk` | — | pantalla |
| dato faltante | Cargar el área de la aurícula derecha. | `evTarjetaAD` | — | pantalla |
| dato faltante | Cargar el diámetro diastólico, el septum y la pared posterior. | `evTarjetaGeo` | — | pantalla |
| dato faltante | Falta el gradiente medio o la Vmax aórtica para saber si se trata de una estenosis severa de alto gradiente. | `fal` | — | pantalla |
| dato faltante |  y no se pudo verificar: no cargó la banda de plausibilidad del VSFVI. Recargar la aplicación. | `fal` | — | pantalla |
| dato faltante |  Para estimar las presiones pulmonares por la insuficiencia pulmonar falta la PmAD (diámetro y colapso de la VCI). | `faltaPmad` | — | pantalla |
| dato faltante | Sin evaluación pericárdica cargada — completar el módulo Derrame pericárdico / Taponamiento de esta pestaña. | `fila` | — | pantalla |
| dato faltante | faltan datos | `fila` | — | pantalla |
| dato faltante | <button type="button" class="btn btn-primary" id="cine-vti-cargar" style="padding:4px 10px;font-size:11px;margin-top:6px;">→ Cargar los VTI en el informe</button> | `gm` | — | pantalla |
| dato faltante | «0» no distingue «sin insuficiencia» de «válvula no evaluada». Acá se cuentan sólo los grados  | `gradoBloque` | — | pantalla |
| dato faltante | <b>leve a severa</b> y el resto se informa aparte como «sin IT o no evaluada». <b>No se promedia el  | `gradoBloque` | — | pantalla |
| dato faltante | esa pregunta, no sobre todos los foramen: un «no consta» no es un «no», y contarlo como tal subdeclararía el hallazgo. | `gradoBloque` | — | pantalla |
| dato faltante | . Completar cociente E/A para determinar grado. | `graduarElevada` | — | pantalla |
| dato faltante | . La distinción entre IIIa (reversible con Valsalva) y IIIb (fija) requiere la maniobra de Valsalva, no registrada. | `graduarElevada` | — | pantalla |
| dato faltante | completar los parámetros del segundo paso (Vol AI, LARS, S/D o TRIV). | `graduarElevada` | — | pantalla |
| dato faltante | falta el PESO y la TALLA del paciente (pestaña Paciente): sin superficie corporal no hay índice | `lb` | — | pantalla |
| dato faltante | falta el gasto cardíaco — Swan, PiCCO, o TSVI + VTI + FC en Hemodinámica | `lb` | — | pantalla |
| dato faltante | Cargar el diámetro de la vena cava inferior y su colapso. | `lec` | — | pantalla |
| dato faltante | ⚠️ No hay diagrama para capturar: falta cargar el DDVI o el VDFVI. | `lv3dCapturar` | — | pantalla |
| dato faltante | Síndrome de Turner — falta el índice de tamaño aórtico (mm/m²): en Turner el umbral se indexa por superficie corporal, porque la talla baja hace que un diámetro absolu… | `maxAo` | — | pantalla |
| dato faltante |  — sin diámetro aórtico registrado; completar seno y ascendente | `maxAo` | — | pantalla |
| dato faltante |  (sin evaluar:  | `maxAo` | — | pantalla |
| dato faltante |  — falta la medida de la aorta (raíz y ascendente, en Paciente → Aorta torácica): la conducta de la aortopatía no se puede establecer sin ella | `maxAo` | — | pantalla |
| dato faltante | : presencia de trombo no evaluada. | `mec` | — | pantalla |
| dato faltante | Sin IT o no evaluada | `modSev` | — | pantalla |
| dato faltante | — regurgitación paravalvular no evaluada | `nar` | — | pantalla |
| dato faltante | No concluible — falta el síndrome | `notaFall` | — | pantalla |
| dato faltante | No concluible — falta el índice (Turner) | `notaFall` | — | pantalla |
| dato faltante | No concluible — falta el diámetro | `notaFall` | — | pantalla |
| dato faltante | Cargar las dos áreas del ventrículo derecho. | `num` | — | pantalla |
| dato faltante | . No consta la situación clínica: con síntomas la indicación sería Clase I | `obstrModerada` | — | pantalla |
| dato faltante | . No consta la situación clínica, que es lo que define la indicación Clase I | `obstrModerada` | — | pantalla |
| dato faltante | Protocolo VEXUS no aplicado: falta la medición de la vena cava inferior. | `opt` | — | pantalla |
| dato faltante | (hacen falta los tags computados de Orthanc 1.11 o superior):  | `orthancPanelCerrar` | — | pantalla |
| dato faltante | ⚠️ Posiblemente apto — faltan datos | `pctDe` | — | pantalla |
| dato faltante | Falta el síndrome | `pill` | — | pantalla |
| dato faltante | Falta el índice indexado | `pill` | — | pantalla |
| dato faltante | Falta el diámetro | `pill` | — | pantalla |
| dato faltante | no evaluados | `pill` | — | pantalla |
| dato faltante | No evaluados | `pill` | — | pantalla |
| dato faltante | Sin consignar | `pill` | — | pantalla |
| dato faltante | — completar el peso del paciente | `popDosisDilucion` | — | pantalla |
| dato faltante | no se pudo cargar la banda de plausibilidad de  | `porQue` | — | pantalla |
| dato faltante |  — recargar la aplicación | `porQue` | — | pantalla |
| dato faltante | no se pudo cargar la banda de plausibilidad de peso y talla — recargar la aplicación | `porQue` | — | pantalla |
| dato faltante | requiere el diámetro telesistólico, peso y talla | `porQue` | — | pantalla |
| dato faltante | Superficie corporal: no se pudo cargar la banda de plausibilidad de peso y talla — recargar la aplicación | `porQue` | — | pantalla |
| dato faltante |  con criterios parciales — completar la evaluación antes de concluir | `postRep` | — | pantalla |
| dato faltante |  con gradiente limítrofe — completar con angio-RMN o angio-TC y evaluar gradiente invasivo | `postRep` | — | pantalla |
| dato faltante |  con istmo hipoplásico respecto de la aorta descendente y gradiente no significativo — completar con imagen | `postRep` | — | pantalla |
| dato faltante |  — sin gradiente registrado; completar con Doppler de aorta descendente e imagen | `postRep` | — | pantalla |
| dato faltante | No constan la FEVI ni el diámetro telesistólico del ventrículo izquierdo, que son los criterios ventriculares de cirugía valvular | `q` | — | pantalla |
| dato faltante | No se gradúa la severidad: el criterio de la ESC 2020 es el gradiente MEDIO y no consta | `q` | — | pantalla |
| dato faltante | Ostios coronarios no evaluados en este estudio — en la estenosis supravalvular su evaluación es parte del estudio | `q` | — | pantalla |
| dato faltante | Falta el umbral de la guía | `recEt` | — | pantalla |
| dato faltante | El umbral de severidad de la estenosis tricuspídea no está disponible: recargar la aplicación. Sin él esta sección no puede decir si el gradiente medio alcanza el crit… | `recEt` | — | pantalla |
| dato faltante | — (ninguno evaluado) | `ro` | — | pantalla |
| dato faltante | Sin criterio — falta la anomalía regional de la motilidad, que el Task Force exige además del umbral | `ro` | — | pantalla |
| dato faltante | Falta la edad del familiar — el criterio exige <35 años | `ro` | — | pantalla |
| dato faltante | No graduada: falta el tipo de prótesis pulmonar | `set` | — | pantalla |
| dato faltante | DSAV con hipertensión pulmonar severa — falta la resistencia vascular pulmonar para decidir sobre el cierre. | `sint` | — | pantalla |
| dato faltante | no consta en este estudio. La regurgitación protésica se evalúa mejor por ETE, sobre todo en las mecánicas | `t12vti` | — | pantalla |
| dato faltante | requiere el AEO por continuidad y la superficie corporal | `t12vti` | — | pantalla |
| dato faltante | No consta la situación clínica, de la que dependen las indicaciones de intervención | `tgaConclusion` | — | pantalla |
| dato faltante | No consta la función del ventrículo sistémico, que es lo que gobierna el pronóstico en esta cardiopatía — completar la evaluación | `tgaConclusion` | — | pantalla |
| dato faltante | Completar parámetros para clasificación automática | `txt` | — | pantalla |
