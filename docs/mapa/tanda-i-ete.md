# Mapa — la tanda «I»: la ETE alineada a las fuentes, sus Referencias y su Evidencia (22/10/2026)

Cinco commits. Qué toca cada uno, qué pieza tiene nombre propio, y las trampas que costaron una
medición falsa. **Ningún corte se movió salvo el borde de 5 mm del ateroma**, que se alinea con la
escala que la app ya citaba.

| commit | zona | se revierte |
|---|---|---|
| `61fe68d` I-E1 | textos y rangos de la ETE | solo |
| `cf7e36e` I-E2 | fichas de Referencias | solo, pero deja TC-330 en rojo |
| `33b0d78` I-E3 | tres secciones de Evidencia | solo, pero deja TC-322 en rojo |
| `fce0fab` I-E4 | notas de la ET y sección de IP en Fallot | solo, pero deja TC-518 en rojo |
| (este) I-E5 | TC-518, documentación y sello | solo |

⚠️ **EL 2 CUELGA DEL 1 POR UNA PIEZA Y NO POR SU TEXTO**: el globo `wilk-score` que el 1 crea en
`VINFO` apunta a `ref-em`, y lo que el 2 escribe dentro de esa ficha es lo que ese globo manda a
leer. Revertir el 2 sin revertir el 1 deja el botón «Ver referencia» llevando a una ficha que ya no
dice lo que el globo anuncia — inocuo, y no se nota.
⚠️ **EL 3 CUELGA DEL 2 POR LAS CLAVES DE BIBLIOGRAFÍA**: `aseEte2013`, `aseEte2020`, `tamburino2010`
y `guiaRegurgNativa` nacen en el 2 y las tres secciones del 3 las citan. Revertir el 2 sin revertir
antes el 3 deja tres secciones citando claves que `IND_REF_IDX` no conoce.
⚠️ **EL 4 NO CUELGA DE NINGUNO** y toca dos zonas que los tres anteriores no tocan.

---

## 1 · El score de Wilkins publica su TRAMO y nada más (E1)

**Dueño único: `WILK_TRAMO`**, un objeto congelado con los tres tramos (`<= 8` / `9 a 11` / `> 11`),
que reemplaza a `WILK_TXT_FAV`, `WILK_TXT_NOFAV` y `WILK_9_11`. **Las claves de banda y el
`dataset.banda` NO cambian**, así que nada que lea la banda se mueve.

Lo leen las **cuatro** superficies que publicaban el veredicto:

| superficie | función |
|---|---|
| badge de la pestaña ETE | `calcWilkins` |
| badge de Calculadoras | `cxWilkins` |
| hoja del PDF de ETE (y lo que el estudio guarda en `am-txt-wilk`) | `amiloTextoWilkins` |
| las tres barras del Laboratorio | `labEteRender` |

El título del gráfico del Laboratorio pasa de «Candidatos a valvuloplastia» a **«Distribución del
score de Wilkins»**: era el único rótulo que afirmaba una indicación sobre una cohorte.

**La salvedad anatómica SE MANTIENE y gana su fuente** (EAE/ASE 2009, apartado B.2.1, folio 14). Lo
que salió de ella es el cierre «la decisión requiere integrar la clínica… y la evaluación del equipo
tratante», que era una conducta redactada por la app.

⚠️ **`ref-em` ES HTML ESTÁTICO Y NO PUEDE INTERPOLAR LA CONSTANTE.** Lo que ata la ficha al código
es **TC-330**, y ata los NÚMEROS (8 y 11), no el texto.

---

## 2 · La orejuela: el hecho, y los dispositivos con su fabricante (E1)

Salen del papel firmado «Hallazgo que contraindica cardioversión eléctrica.» y las dos líneas de
«ATENCIÓN» de la hoja del PDF. **El cruce no se pierde**: la hoja de la orejuela sigue imprimiendo el
estado del trombo. El badge pasa de la conducta a **«Confirmado»**.

| constante | valor | fuente |
|---|---|---|
| `OAI_VEL_ALTA` / `OAI_VEL_MEDIA` / `OAI_VEL_BAJA` | 40 y 20 cm/s | ASE/SCA 2013, folio 954 |
| `OAI_AMULET_MIN` / `OAI_AMULET_MAX` | 11 y 31 mm | Abbott, zona de anclaje del Amplatzer Amulet |
| `OAI_FAB_FECHA` | `21/10/2026` | fecha de consulta del dato de fabricante |

⚠️ **LOS RÓTULOS «estasis leve» Y «estasis severa» LLEVAN EL CHIP CRITERIO DE ECOSMART**: la guía da
los números y **no** esos nombres. Y **no distingue ritmo sinusal de fibrilación auricular**, así que
la app tampoco.
⚠️ **LA LÍNEA DE ELEGIBILIDAD DEJÓ DE FUSIONAR DOS DISPOSITIVOS.** Decía «rango de los dispositivos
(17-32 mm)», que no es el rango de ninguno de los dos: hoy nombra la **zona de anclaje del Amulet**,
con los dos números saliendo de sus constantes. La tabla de dimensionamiento del WATCHMAN FLX Pro
(IFU 51245861-01 rev. A, 2023-07) **no se pudo leer y no se cita**.

---

## 3 · La reparabilidad mitral lista factores DESFAVORABLES (E1)

| constante | valor | qué es |
|---|---|---|
| `REPAR_COAPT_MM` | 10 | distancia de coaptación de 1 cm o más |
| `REPAR_ANGULO_GR` | 45 | ángulo posterolateral mayor de 45 grados |
| `REPAR_TENTING_CM2` | 2,5 | área de tenting por encima de 2,5 cm² |
| `TEER_TENTING_MM` | 10 | ALTURA de tenting < 10 mm — **criterio de TEER, no de la Tabla 7** |

Fuente: **Tabla 7 de `GUIA_008.pdf`, hoja 25** (ese PDF no lleva folio impreso), «Características
desfavorables por ETT para reparación de válvula mitral en IM secundaria». El veredicto pasó de
«compatible con plastia» a **descriptivo**: «Factores desfavorables presentes: …» o «Sin factores
desfavorables de los evaluados.».

⚠️ **EL ÁREA DE TENTING LA TABLA LA ESCRIBE COMO UN RANGO** —«> 2,5-3 cm²»— y la app aplica su
**extremo BAJO**, que es el lado que no deja de marcar. Un corte único donde la fuente da un rango es
una DECISIÓN y no una lectura: queda declarado en la ficha, en el pie de la pantalla, en el rótulo
del campo y en `PENDIENTES.md`.
⚠️ **CON IM PRIMARIA NO HAY VEREDICTO**, y sus cifras llevan el chip CRITERIO DE ECOSMART: esa tabla
es de IM **secundaria** y ninguna fuente de la biblioteca da cifras equivalentes para la primaria.
El mecanismo se le pregunta a **`imEsSecundariaIM`**, que lo lee de `teer_tipo_im` o de la respuesta
del panel; sin mecanismo consignado tampoco se concluye.
⚠️ **LAS CUATRO FILAS GANARON SU `else`**, así que borrar el dato las devuelve a la raya — y
**`calcETE` entró en `RECALC_MODULOS`** y en el `onchange` de `teer_tipo_im`: el mecanismo vive en
otra tarjeta y sin eso la pantalla se quedaba con el gesto anterior.

---

## 4 · El ateroma aórtico y sus DOS escalas (E1 y E2)

`ateroGradoPorGrosor(mm)` + `ATERO_GRADO_RANGO` son el dueño del grado **por espesor**. El grado 3
pasa a «Ateroma de 3 a 5 mm» y el 4 a «de más de 5 mm», en la `<option>`, la descripción de pantalla,
el informe y las seis plantillas del PDF. **El grado consignado y sus cinco opciones no se tocan.**

⚠️ **LAS DOS ESCALAS NO CORTAN EN EL MISMO SITIO Y SE REPORTAN LAS DOS.** La de la **ASE** (Nicoara,
folio 716) corta el grado 4 **por encima de 5 mm**; la **ESC 2024** (Tabla 14, folio 71) corta en
**4 mm**. **Un ateroma de 4,5 mm es grado 3 por la ASE y grado 4 por la ESC.** La app aplica la de la
ASE y publica la otra al lado.
⚠️ **EL SOLAPE DE LOS 3 mm EXACTOS SE RESUELVE AL GRADO MENOR**, que es el lado que no afirma de más.
⚠️ **`ao_grosor_placa` ERA UNA LECTURA MUERTA.** Hoy tiene fila propia y publica el grado que le
corresponde por su espesor; **no escribe `ao_grado_atero`**, que sigue siendo el único que viaja al
informe, al PDF, al PPT y al Excel.

---

## 5 · Las fichas de Referencias (E2)

| ficha | qué publica |
|---|---|
| `ref-em` | la escala de Wilkins (EAE/ASE 2009 Tabla 5, folio 14), lo que halló la serie original (Wilkins 1988, folios 300 y 307) y la salvedad del apartado B.2.1 |
| `ref-im` | reparabilidad quirúrgica (Tabla 7, hoja 25) y los cortes de TEER, cada uno con su documento |
| `ref-oai` | los dos cortes de vaciamiento con su folio y los dispositivos con su fabricante |
| `ref-ao` | las dos escalas de ateroma, comparadas |

⚠️ **«EVEREST II» ERA UNA ATRIBUCIÓN EQUIVOCADA Y DEJABA UN CRITERIO SIN CITAR.** El registro de
*Eur Heart J* 2010;31:1382-1389 que publica los cortes anatómicos del TEER es de **Tamburino y
cols.** —un registro italiano de práctica real con MitraClip— y **no** el EVEREST II. Está en la
biblioteca; su Tabla 1, folio 1386, se verificó en imagen. **El corte no se movió: hoy se cita.**
⚠️ **BUSCAR POR EL NOMBRE DEL ENSAYO NO ENCUENTRA SU ARTÍCULO**: ese PDF se llama «Percutaneos Mitral
Valve repair withe the mitraclip system», y el censo que concluyó «no está en la biblioteca» había
buscado «EVEREST».

---

## 6 · Las tres secciones de Evidencia de la ETE (E3)

`IND_SECS` pasa de 20 a 23 secciones y `IND_REFS` gana cinco entradas.

| función | compuerta | bloques |
|---|---|---|
| `_indETETrombo` | trombo **CONFIRMADO** | cardioversión (ESC 2024 FA, Tabla 15, folio 3355) · comisurotomía (ESC/EACTS 2025, Tabla 8, folio 4682) |
| `_indReparMV` | al menos una de las tres medidas | Tabla 7, sin clase ni nivel |
| `_indAtero` | `ao_grado_atero` entre 1 y 5 | prevención primaria y secundaria (ESC 2024 Tabla 33 folio 71 · AHA/ASA 2021 folio e398) |

⚠️ **LAS RECOMENDACIONES VAN EN EL BLOQUE VISIBLE Y NO EN `notas`**, que el marco pinta dentro del
«Ver detalle», que nace PLEGADO.
⚠️ **DOS PREMISAS DE LA ORDEN ERAN FALSAS Y SE DECLARAN:** la anticoagulación de al menos cuatro
semanas tras la cardioversión **sí** lleva Clase I · Nivel B en la Tabla 15 (la orden la daba como
«texto sin clase»), y la Tabla 7 escribe el tenting como un rango.
⚠️ **LAS DOS GUÍAS DEL ATEROMA COINCIDEN EN QUÉ HACER Y NO EN EL NÚMERO**: LDL por debajo de
**55 mg/dL** la europea y de **70 mg/dL** la estadounidense. Las dos se publican con su fuente y **no
se promedian**.
⚠️ **«SEVERA O COMPLEJA» SE PREGUNTA Y NO SE DERIVA DEL GRADO**: la app gradúa con la escala de la
ASE y la guía que publica las recomendaciones usa la suya, que corta en 4 mm.
⚠️ **SER CANDIDATO A COMISUROTOMÍA SE PREGUNTA Y NO SE DERIVA**, y hay dos motivos: es una decisión
clínica y no un hallazgo del eco, y **`_indFilaOrigen` NO dibuja los botones cuando el valor viene
del estudio**, así que una propuesta derivada no se podría corregir.

---

## 7 · Las tres notas al pie de la tabla de estenosis tricuspídea (E4)

`ET_REC_2025` gana **`nota_cx`** (común a las dos filas) y una **`n`** por fila. Las dos filas siguen
en **Clase I · Nivel C**: ningún corte, ninguna clase y ningún nivel se movieron.

| nota | qué dice | dónde se publica |
|---|---|---|
| ᶜ `nota_cx` | esa cirugía es, habitualmente, el **REEMPLAZO** de la válvula tricúspide | en las dos filas. **No estaba en ningún lado de la app** |
| ᵈ `sint.n` | con estenosis **AISLADA** se puede intentar la valvuloplastia percutánea con balón | fila del sintomático |
| ᵉ `cx_izq.n` | se puede intentar si la comisurotomía mitral percutánea se puede hacer sobre la mitral | fila de la cirugía izquierda |

Fuente: **ESC/EACTS 2025, Recommendation Table 10, folio 4688**, leída EN IMAGEN a 300 ppp.

⚠️ **EL RENGLÓN GENÉRICO DE `notas` SE COMPONE DESDE LAS MISMAS TRES CONSTANTES.** Decía lo mismo con
otras palabras —«la valvuloplastia con balón no está en el cuerpo de la tabla: vive en sus notas al
pie…»— y dos redacciones de la misma afirmación en la misma sección son dos cosas que se separan en
la primera edición. **TC-518 (a7) lo fija por los dos lados**: exige que las tres constantes estén y
que el texto viejo ya no esté.

---

## 8 · La insuficiencia pulmonar en Fallot reparada: DOS guías que no coinciden (E4)

**`_indTdFIP()`**, sección 24 de `IND_SECS`, título «Tetralogía de Fallot reparada — insuficiencia
pulmonar». **Compuerta: `tdfConclusion()` devuelve algo**, que es el dueño de «el módulo de Fallot
tiene datos» — acá no se vuelve a escribir esa condición.

### Las tres diferencias entre las dos guías

| | ACC/AHA 2025 (folio e182) | ESC 2020 (folio e50) |
|---|---|---|
| qué es «disfunción valvular pulmonar» | IP moderada: fracción regurgitante por RMC **> 25 %**, o PSVD **> 2/3** de la sistémica | IP **GRAVE**: FR por RMC «> 30-40 %», u obstrucción al menos moderada con **velocidad pico > 3 m/s** |
| cuántos criterios en el asintomático | **DOS** de cinco | **UNO** de cuatro |
| criterios propios | FEVD ≤ 46 %, FEVI ≤ 50 %, VTDVD ≥ 2× VTDVI | PSVD **> 80 mmHg** |

### ⚠️ EL 80 ml/m² APARECE EN LAS DOS Y NO ES EL MISMO CRITERIO

La estadounidense escribe «RV end-systolic volume index **>80** mL/m²», con operador **estricto**; la
europea escribe «VTSVDi **≥ 80** ml/m²», con el valor **incluido**. Por eso el criterio americano
lleva **constante propia** (`TDF_IP_ACC.vtsvdi`) y **no reusa `TDF_VTSVDI_MIN`**: compartirla haría
que un cambio de operador en una guía moviera la otra sin que nadie se entere.

**Medido, con método resonancia y la misma escena** (asintomático, caída de la capacidad de
ejercicio, FEVD 40 %, FR > 40 %):

| volumen telesistólico indexado | estadounidense | europea |
|---|---|---|
| 80,0 por RMC | **2** de cinco | **2** de cuatro |
| 81 por RMC | **3** de cinco | **2** de cuatro |
| 81 por ecocardiografía 3D | **2** de cinco | **1** de cuatro |

La tercera fila es el control del método: **con método distinto de resonancia el volumen se declara y
NO vota en ninguna de las dos**, que es la regla que el módulo de congénitas ya aplicaba.

### Las constantes

| constante | valor | de quién |
|---|---|---|
| `TDF_IP_ACC.rf_min` | 25 % | nota * de la tabla estadounidense |
| `TDF_IP_ACC.vtsvdi` | 80 ml/m², **estricto** | recomendación 10 |
| `TDF_IP_ACC.fevd` / `.fevi` | 46 % / 50 % | recomendación 10 |
| `TDF_IP_ACC.n_min` | 2 | recomendación 10 |
| `TDF_IP_ESC.psvd_min` | 80 mmHg | tercera fila de la tabla europea |
| `TDF_IP_ESC.vmax_min` | 3 m/s | nota ᵈ |
| `TDF_IP_ESC.rf_min` | 40 % | nota ᶜ, **extremo ALTO** del rango «> 30-40 %» |
| `TDF_VTDVDI_MIN` / `TDF_VTSVDI_MIN` | 160 / 80 ml/m² | **exportados a `window`** para que `_indUmb` los lea |

⚠️ **EL EXPORT NO ES DECORATIVO.** La regla 4 de la cabecera del panel es que los umbrales se leen por
`window.X` con `_indUmb` y **sin literal de respaldo**. Sin el export, `_indUmb` devuelve `null`,
`_ge(v, null)` da `false` y el criterio volumétrico europeo **deja de votar en silencio** — que es lo
que le pasó a `UMBRAL_FAC_VD_SEVERA` y lo que `_vtAssertUmbrales` comprueba al arrancar desde
entonces.

### Lo que se PREGUNTA, y por qué son cinco y no tres

`tdfip.rf` · `tdfip.rvsp23` · `tdfip.progvd` · `tdfip.progvi` · `tdfip.progit`.

⚠️ **LA PROGRESIÓN SE PREGUNTA Y NO SE DERIVA**: «progresivo» compara este estudio con los anteriores,
y un ecocardiograma aislado no lo sabe.
⚠️ **Y SON DOS PREGUNTAS DE PROGRESIÓN VENTRICULAR Y NO UNA**: la europea pide el deterioro del
ventrículo **DERECHO** y la estadounidense dice «ventricular», que incluye los dos. Con una sola, un
deterioro aislado del VI haría votar a la europea un criterio que su tabla no escribe.
**Ninguna de las cinco viaja con el estudio** (medido: cero campos con prefijo `tdfip.`).

### Lo que NO se puede evaluar se DECLARA y no se inventa

«RV end-diastolic volume ≥ 2× LV end-diastolic volume»: el volumen del VD se **transcribe** de la
resonancia y está **indexado**, mientras que el del VI lo mide este ecocardiograma y está en
mililitros. Comparar los dos sería un cociente entre dos métodos y dos unidades. Va en `clinica`, y
**la línea del asintomático dice cuántos criterios no se pudieron evaluar**, así que el conteo nunca
se presenta como completo. Lo mismo con la fila I·C del implante percutáneo: se publica y se declara
que la app no registra si el tracto de salida es nativo.

---

## 9 · Las trampas de esta tanda

1. ⚠️ **UN `<div>` SIN CERRAR ROMPE LA MAQUETA DE TODA LA APP Y NINGÚN A/B DE TEXTO LO VE.** En la
   ficha `ref-em` del commit 2: un tag sin cerrar **no lanza**, el parser re-anida todo lo que viene
   después, y **tres casos de zonas completamente ajenas** informaron geometría 0×0 (TC-254, TC-259 y
   TC-274). El informe, el EN SUMA, las 440 columnas del Excel y las seis plantillas del PDF salían
   **IDÉNTICAS**. Se bisecó en worktrees. **Un A/B de texto no mide estructura.**
2. ⚠️ **`indicAbrir` LIMPIA LAS RESPUESTAS CLÍNICAS ANTES DE PINTAR**, así que contestar tres
   preguntas con tres llamadas sueltas deja viva **sólo la última**. La primera medición informó el
   bloque de cardioversión **VACÍO** con las tres contestadas: era la sonda, no la app. El ayudante
   `evidRespN` abre UNA vez y contesta todas.
3. ⚠️ **Y POR LO MISMO, UNA LECTURA DEL OBJETO DESPUÉS DE CERRAR EL PANEL PIERDE LA RESPUESTA.** Las
   escenas del borde de 80 ml/m² se midieron primero con `sec()` y salieron las dos guías en «Lo que
   falta», que se lee igual que «el criterio no cuenta» sobre un borde que **sí** separa. Se mide por
   el **pintado**.
4. ⚠️ **`ip_grado` NACE EN «Sin insuficiencia»**, así que ese token **no distingue** «no hay
   insuficiencia pulmonar» de «nadie la evaluó» — la misma trampa que `it_grado` y
   `_indITEvaluada`. Sin eso la fila publicaba esa negación sobre un formulario en el que nadie midió
   nada. **Lo cazó MIRAR la captura.**
5. ⚠️ **Y EL PRIMER PREDICADO QUE LA CORRIGE ESTABA MAL POR EL OTRO LADO**: incluía `ip_reversion`,
   que es un **CHECKBOX**, y `sv()` devuelve su `.value`, que vale **«on» SIEMPRE** —marcado o no—.
   Queda fuera del predicado.
6. ⚠️ **EL TEXTO EXTRAÍDO DEL PDF ESTADOUNIDENSE DESALINEA LAS CELDAS DE CLASE RESPECTO DE SU FILA.**
   Leído así, la recomendación 13 sale como Clase **2b** y es **2a**, verificado renderizando a
   600 ppp. **Las cuatro se leyeron en imagen.**
7. ⚠️ **`ET_REC_2025` ES UN `const` DE MÓDULO Y NO UNA PROPIEDAD DE `window`** —la trampa de
   `ECO_AYUDA`—: leerlo por `window` da `undefined` y siete condiciones de TC-518 salían rojas sobre
   un árbol perfecto. El identificador **pelado** sí se ve.
8. ⚠️ **Y EL CENTINELA TIENE QUE SER SOBRE EL TIPO Y NO SOBRE LA VERDAD**: contra el árbol anterior
   `ET_REC_2025` **sí existe** —lo que no existen son sus tres notas—, así que un guardia por `!!ER`
   deja pasar un `undefined.indexOf` que **mata la corrida entera**, y el caso probaría que el árbol
   es distinto y no que sabe medir.
9. ⚠️ **`_labExcelRow` / el grupo `ctrl` corrido JUNTO con `sup` informa una clave de `localStorage`
   de más** (`ett_pdf_plantilla`), que la deja el PDF del otro grupo. **Remedir con los MISMOS grupos
   antes de sospechar.**
10. ⚠️ **ME COMÍ EL ACENTO GRAVE** en comentarios míos dentro del cuerpo de un caso y del template de
    la sonda. `scripts/check_backticks.py` da la línea exacta en el cuerpo de un `caso(...)`; **no
    alcanza el template inyectado de una sonda**, y ésos los dio `node --check`. **Correr los dos.**

---

## 10 · Cobertura: TC-518

**33 condiciones** en diez grupos, con tres denominadores y cinco controles negativos.

| grupo | qué afirma |
|---|---|
| (a1)–(a7) | las tres notas de la ET, publicadas con la fila que las usa y compuestas desde un solo dueño |
| (b1)–(b4) | la sección nueva existe, ningún título es prefijo de otro, y se despierta con un campo propio |
| (c1)–(c4) | los dos bloques separados, cada uno con SU folio, y la franja de 26 a 40 % que los separa |
| (d1)–(d3) | el borde de 80 ml/m² por los dos lados, y el control del método |
| (e1)–(e2) | los criterios que son de una sola guía |
| (f1)–(f3) | lo que no se puede evaluar, declarado |
| (g1)–(g2) | el grado de IP que nace en «Sin insuficiencia» |
| (h1)–(h4) | los umbrales exportados y las dos entradas de bibliografía |
| (i1)–(i3) | nada firmado se mueve y las respuestas no viajan |
| (j1) | denominador del andamio: todos los campos entraron y todos los botones se encontraron |

**Verificado que sabe fallar contra el inicio de la tanda en un worktree aparte: 30 de las 33 en
rojo, y NINGUNA por excepción.** Las tres que pasan son exactamente (i1), (i2) e (i3) — o sea lo que
esta tanda **no** mueve.

**Arnés: `scripts/_probe_i.mjs`**, con los grupos `wilk`, `oai`, `repar`, `atero`, `evid`, `et4`,
`tdfip`, `cap4`, `sup` y `ctrl`.

---

## ⚠️ La tanda E reemplazó los rangos de la orejuela por las tablas del manual (27/10/2026)

- Los **dos PDF se abrieron** y las catorce filas quedaron verificadas: `OAI_AMULET_TABLA` (8
  filas, Tabla 2 del IFU FDA P200049, hoja 19, folio 15) y `OAI_WATCH_TABLA` (6 filas, Tabla 78
  del IFU 52212467-01 rev. A de 2025-09, hoja 26). **La reserva de la I-E1 de que la tabla del
  WATCHMAN «no se pudo leer» dejó de ser cierta**: el documento que se leyó es otro y más nuevo.
- **La orejuela dejó de juzgar**, y la premisa de que «seguía sin juzgar» era falsa: juzgaba en
  `oai-notas`, en el badge `oai-elegibilidad` y —el hallazgo más grande— **en el emisor del
  informe**, que conservaba los rangos viejos `17 a 31` y `≤ 32` escritos a mano.
- **Ni una fecha de consulta** en pantalla ni en el ⓘ: `OAI_FAB_FECHA` se retiró.

**`docs/mapa/e-carpentier-tricuspide-orejuela.md` § 7.**
