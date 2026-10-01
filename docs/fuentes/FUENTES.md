<!-- registro armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Registro de fuentes verificadas

**Antes de abrir un PDF de una guía, mirá acá.** Si el dato ya está verificado —documento, folio y la
frase que lo respalda— **no lo releas**.

**«Verificada» = texto completo leído, con documento, año, tabla y página.** Título o resumen no
cuentan. **Lo que no se pudo abrir NO se cita**, aunque el dato sea de conocimiento corriente.

**Fuente de esto:** la constante `IND_REFS` de `index.html` (el registro vivo, que **manda** si hay
desacuerdo — `grep -n 'IND_REFS' index.html`) y `docs/historial/CLAUDE_historial_2026-10-01.md`.

> ⚠️ **En este pase NO se abrió ningún PDF.** Todo se transcribió de `IND_REFS` y del historial,
> donde quedó asentada la verificación original (2026-09-29 / 09-30). Las **rutas en disco** se
> confirmaron sólo por nombre de archivo, no abriendo el documento: dicen «ruta probable».

---

## Reglas de folio — la trampa más cara del repo

El folio que se cita es **la página impresa de la revista**, no la del visor de PDF. Cada documento
tiene su propio offset y **dos de ellos están expresados en bases distintas**, que es exactamente
cómo se equivoca un folio sin que nada chille:

| Documento | Regla de folio | Comprobación |
|---|---|---|
| **ESC/EACTS 2025** (`ehaf194.pdf`, inglés) | folio = página **1-based** del PDF **+ 4634** | PDF 38 → 4672 · 39 → 4673 · 40 → 4674 · 41 → 4675 |
| **ACC/AHA 2020** (Otto) | folio = índice **0-based** del PDF **+ 72** | idx 55 → e127 (con e126 y e128 a los costados) |
| **ACC/AHA 2020**, misma cosa dicha al revés | folio = página **1-based + 71** | así lo escribe `IND_REFS` en `ahaProtM2020` |
| **ASE 2024 prótesis** (Zoghbi) | folio = página del PDF **+ 1** | — |
| **ASE 2023 Pandian** (reumática) | folio = página del PDF **+ 2** | PDF 6 → 8 · PDF 7 → 9 · PDF 10 → 12 |
| **ESC/EACTS 2025 traducción SEC** (español) | página impresa = página de PDF **− 1** | no sirve para citar: no tiene folios 4.6xx |

⚠️ **Las dos filas de la ACC/AHA son la MISMA regla** (`idx0 + 72` ≡ `pág1 + 71`). No son dos
offsets en conflicto; si en algún momento parecen contradecirse, es que se mezclaron las bases.

⚠️ **El `+ 2` de Pandian estuvo escrito como `+ 3`** en una versión anterior del registro y era
falso. Los folios citados abajo igual están bien, porque se leyeron **del pie impreso** y no de la
aritmética. Moraleja: el folio se verifica mirando el pie de la página, no sumando.

⚠️ **Citar siempre la ESC/EACTS 2025 inglesa (`ehaf194.pdf`).** La traducción de la SEC **omite
palabras**: se comió «appendage» en la nota ^b de la Tabla 8 y eso dio vuelta un hallazgo entero —el
reporte era falso y el panel tenía razón. **Una traducción no cierra un hallazgo de wording.**
Además, su **Material suplementario Tabla S3** —donde vive la definición de la «puntuación
ecocardiográfica > 8» y la de Cormier— **no está incluido** en el archivo en disco.

⚠️ **Los folios «p. 44» y «p. 52»** que aparecen en notas viejas del historial para las Tablas 6 y 8
de la ESC/EACTS 2025 son de **la traducción española**. Los folios de revista son **4674-4675** y
**4682**. No son el mismo número con otro offset: son otra edición.

### Dos trampas al buscar dentro de un PDF
- **El guión de fin de línea da falsos negativos** — «contrain- dication» (ACC/AHA 2020, p. e114).
  Des-hifenar antes de comparar; este error casi hizo reportar como inventada una cita verdadera.
- **Hay tablas que son IMÁGENES** (Baumgartner 2009, Wilkins 1988): el texto extraído trae título y
  notas al pie y **ni un valor**. Renderizar la página — si no, parece que la tabla no existe.

---

## Los documentos, por clave de `IND_REFS`

### `esc2025vc` — ESC/EACTS 2025, valvulopatías
Praz F, et al. *Eur Heart J* 2025;46(44):4635-4736. doi:10.1093/eurheartj/ehaf194.
**Ruta:** `~/Desktop/EcoSmart_Biblioteca_Fuentes/04_Valvulopatias/ehaf194.pdf` (original inglés —
**el que se cita**). La traducción SEC está en el mismo directorio como `Praz_2025_Valvulopatias.pdf`
(ruta probable, 125 páginas, numeración propia) y **no se usa para citar**.
**Folio = PDF 1-based + 4634.** Esta entrada la comparten seis secciones del panel, así que no lleva
páginas de lesión en el `full`: cada sección cita su propia tabla en su texto.

| Qué | Folio | Dato verificado |
|---|---|---|
| Tabla 4, recomendaciones revisadas, fila del TEER | 4647 | la fila que cambió de clase para el TEER |
| **Figura 4**, evaluación por imagen de la IAo (PDF 25) | **4659** | recuadro **«Criteria for severe AR»** — semicuantitativos: *«Vena contracta >6 mm»*, *«PHT <200 ms»*, *«Large central jet (≥65% of LVOT diameter)»*, *«Holodiastolic flow reversal in descending aorta (EDV ≥20 cm/s)»*; cuantitativos: *«EROA ≥30 mm2»*, *«RVol ≥60 mL/beat»*, *«RF >50% (echo)»*, *«RF >40% (CMR)»* |
| §11.2.2, parámetros adicionales de la IAo | 4663 | el único VTI de la sección aórtica es el cociente TSVI/válvula (índice adimensional) — es de la **estenosis**, no del flujo reverso |
| **Figura 10**, criterios ecocardiográficos de IM | **4672** | rama «Quantitative»: *«EROA ≥40 mm2 (or ≥30 mm2 if elliptical regurgitant orifice area)»* |
| **§9.2.2 «Evaluation»** | **4675** | en IM secundaria pueden aplicar cortes más bajos *«because of the potential elliptical regurgitant orifice and/or the low-flow state»*; menciona EROA ≥30 mm² y/o VolR ≥45 mL por impacto en desenlaces |
| Tabla 6 de Recomendaciones, IM primaria | 4674-4675 | recomendaciones de intervención en IM primaria |
| Figura 12, tipos de IM secundaria | 4676 | define el tipo con cuatro criterios unidos por **Y**, más criterios clínicos que la app no recoge |
| Tabla 7 | 4678 | — |
| Recommendation Table 7 | 4679 | — |
| Figura 14 | 4681 | — |
| Tabla 8 de Recomendaciones **y** Tabla 8 de contraindicaciones de la comisurotomía, con sus notas ^a y ^b | **4682** | las contraindicaciones de la CMP; la nota ^b es la que la traducción mutiló |
| §14.4.2.1, PPM | 4698 | *«established definitions are lacking»* para el PPM mitral y tricuspídeo |
| **Recommendation Table 17**, disfunción de prótesis | **4700** | **no publica cortes ecocardiográficos** de severidad protésica: dice «significant valve dysfunction» y deja la cuantificación a la ASE |

⚠️ **El «may apply» de §9.2.2 NO es un corte nuevo.** En la Figura 10 el corte sigue siendo
≥ 40 mm²; el ≥ 30 mm² **cuelga de que el orificio sea elíptico** (y/o bajo flujo). Dar el ≥ 30 mm²
pelado publicaría un corte incondicional que la guía no da.

⚠️ **El valve-in-valve mitral es la fila TRANSVENOSA.** La Table 17 tiene **dos** filas de ViV con
la misma clase y nivel (IIa · B) y sólo una es mitral: «transfemoral in the aortic position» **no**,
«transcatheter transvenous mitral or tricuspid» **sí**.

⚠️ **Dos filas concurrentes y ninguna domina.** Un sintomático con riesgo quirúrgico intermedio o
alto cumple reoperación **I · C** y ViV mitral **IIa · B**: la primera tiene mejor clase, la segunda
mejor nivel. La guía no dice cuál prevalece — **se publican las dos**.

**Fe de erratas leída** (`ehag625`, EHJ, 2026-08-06): «NYHA class II–V» → «II–IV» en §9.2.4.2 (IM
secundaria). Una segunda en *Eur J Cardiothorac Surg* 2026;68(7):ezag193 (párrafo duplicado sobre
anticoagulación en el embarazo). **Ninguna toca un umbral.**

### `aseVr2017` — ASE 2017, regurgitación valvular nativa
Zoghbi WA, Adams D, Bonow RO, et al. *J Am Soc Echocardiogr* 2017;30(4):303-371.
doi:10.1016/j.echo.2017.01.007.
**Ruta probable:** `.../04_Valvulopatias/Zoghbi_2017_Regurgitacion_Valvular.pdf`.

- **Tabla 8** «Grading the severity of chronic MR by echocardiography», **p. 332** — IM severa:
  vena contracta **≥ 0,7 cm** (> 0,8 cm en biplano), AEOR por PISA 2D **≥ 0,40 cm²**, volumen
  regurgitante **≥ 60 ml**, fracción regurgitante **≥ 50 %**.
- ⚠️ **Los cortes están en cm² y cm, no en mm² y mm.** Transcribirlos sin convertir mueve el umbral
  dos órdenes de magnitud.

**Folio = página del PDF + 302** (PDF 9 → 311 · PDF 30 → 332 · PDF 38 → 340), leído del pie impreso.

| Qué | Folio | Dato verificado |
|---|---|---|
| **Definición general de fracción regurgitante** | **311** | *«RF is then derived as the RVol divided by the SV through the regurgitant valve. Thus, RVol = SV_RegValv − SV_CompValv; RF = RVol/SV_RegValv»* |
| **Tabla 14**, métodos de cuantificación de la IAo | **339** | *«SV method: RVol = SV_LVOT − SV_MV»* — en la IAo la válvula regurgitante es la aórtica y su SV se mide en el **TSVI** |
| Tabla de severidad de la **IAo**, cuatro columnas | 340 | VCW `<0.3` / `0.3-0.6` / `>0.6` cm · jet/TSVI `<25` / `25-45` / `46-64` / `≥65` % · RVol `<30` / `30-44` / `45-59` / `≥60` ml · RF `<30` / `30-39` / `40-49` / `≥50` % · EROA `<0.10` / `0.10-0.19` / `0.20-0.29` / `≥0.30` cm² |
| Figura 25, algoritmo de integración de la IAo | 344 | los cuatro grados, con «Specific Criteria for Severe AR» y «for Mild AR» |
| Método directo por CMR | 341 | *«RF (reverse volume/forward volume * 100%)»* — el denominador es el flujo anterógrado **total** |

⚠️ **De acá sale el hallazgo de la fracción regurgitante de la IAo** (`docs/PENDIENTES.md`): el
denominador de la app es `volR + vsv` y el de la fuente es `vsv` solo, porque en la IAo el volumen
sistólico del TSVI **ya contiene** el regurgitante. **Reportado, no corregido.**

⚠️ **Esta tabla tiene CUATRO columnas**, no tres: existe la banda intermedia que el `select`
`ia_sev_final` llama «Moderada-severa» y que `calcIA_ESC` nunca emite.

### `ahaVc2020` — ACC/AHA 2020, valvulopatías (válvula nativa)
Otto CM, Nishimura RA, Bonow RO, et al. *Circulation* 2021;143:e72-e227.
doi:10.1161/CIR.0000000000000923.
**Ruta:** `~/Desktop/AHA 2020 Valvulopatias.pdf` (⚠️ podría ser un **extracto parcial**, no la guía
completa — **no verificado**, no se abrió en este pase).
**Folio = idx 0-based + 72 ≡ pág 1-based + 71.**

| Qué | Folio | Dato verificado |
|---|---|---|
| Tabla 17, «Stages of Chronic Primary MR» | e121 | estadios de la IM primaria crónica |
| Recomendaciones de intervención en IM primaria | e124 | — |
| **§7.3.1** | **e127** | *«the recommended definition of severe secondary MR is now the same as for primary MR (ERO ≥0.4 cm2 and regurgitant volume ≥60 mL)»* |
| IM secundaria | e129 | — |
| Tabla 16, «Stages of MS» | e113 | estadios de la estenosis mitral; **excluyó el gradiente medio** como criterio de severidad |
| Recomendaciones de EM reumática | e116 | — |
| «contrain-dication to PMBC» | e114 | la que da falso negativo por el guión de fin de línea |

⚠️ **No tiene criterio indexado ni esquema de «tres de cuatro» en la mitral**, lo que deja al
≥ 20 mm/m² de la app **sin corroboración de una segunda guía**.

### Prótesis valvular → `docs/fuentes/FUENTES-protesis.md`

Las claves `ahaProtM2020`, `aseProtM2024` y `aseProtAo` viven en ese archivo: son claves separadas de
sus hermanas nativas a propósito, y los cortes protésicos **no son los de válvula nativa**.


### `eaeAseEst2009` — EAE/ASE 2009, estenosis valvular (Baumgartner)
Baumgartner H, Hung J, Bermejo J, et al. *J Am Soc Echocardiogr* 2009;22(1):1-23.
**⚠️ NO está en `~/Desktop/EcoSmart_Biblioteca_Fuentes/` al 2026-10-01** — ruta en disco **no
registrada**. Se leyó, pero de dónde no quedó asentado.

- **Tabla 9** «Recommendations for classification of mitral stenosis severity», **p. 17** — área
  valvular **> 1,5 cm² leve · 1,0-1,5 cm² moderada · < 1,0 cm² SEVERA**; gradiente medio
  < 5 / 5-10 / > 10 mmHg y presión pulmonar < 30 / 30-50 / > 50 mmHg, los dos como **signos de
  apoyo**: *«cannot be considered as surrogate markers of the severity of MS»* (**p. 16**).
- **Tabla 8, p. 17** — el área por tiempo de hemipresión es **220/T½**; la constante se discute en
  la **p. 13**.
- **No define «estenosis mitral muy severa»**: cero apariciones en el documento.
- ⚠️ **Es la única fuente primaria verificada que gradúa la EM en leve / moderada / severa**, y
  **discrepa** con las otras dos en el corte central: severa es **< 1,0 cm²** acá y **≤ 1,5 cm²** en
  Pandian y la ACC/AHA. La sección lo dice **con las dos citas**, que es la regla.
- Fe de erratas JASE 2023;36(4):445 — su Tabla 8 debía decir «directly proportional to MVA».
  **No mueve cifras.**
- ⚠️ **Sus tablas son imágenes dentro del PDF.** Renderizar la página; el texto extraído no trae
  los valores.

### `wilkins1988` — Wilkins 1988, score de la válvula mitral
Wilkins GT, Weyman AE, Abascal VM, Block PC, Palacios IF. *Br Heart J* 1988;60(4):299-308.
doi:10.1136/hrt.60.4.299.
**⚠️ NO está en `~/Desktop/EcoSmart_Biblioteca_Fuentes/` al 2026-10-01** — ruta no registrada.
Es un **escaneo de 1988**: las tablas son imágenes, hay que renderizar.

- **Tabla 2, p. 300** — los cuatro componentes (movilidad, engrosamiento valvular, engrosamiento
  subvalvular, calcificación) se gradúan **de 0 a 4** y el total va **de 0 a 16**.
- **p. 307** — *«All patients with a total echocardiographic score > 11 had a suboptimal result
  while all those with a score < 9 had an optimal result. The score failed to predict outcome in
  those with scores of 9 to 11»*.
- ⚠️ **EL CORTE DE 8 NO ESTÁ EN ESTE ARTÍCULO.** Wilkins no menciona ningún 8: separa en `< 9`
  óptimo y `> 11` subóptimo, con la banda **9-11 declarada no predictiva**. El «> 8» que usa la app
  es de la **ESC/EACTS 2025**, que lo publica **sin atribuírselo a Wilkins**.
- ⚠️ **Los selectores de la app dicen «(1-4)» y la escala del original es 0-4.**

### `asePandian2023` — ASE 2023, cardiopatía reumática
Pandian NG, Kim JK, Arias-Godinez JA, et al. *J Am Soc Echocardiogr* 2023;36(1):3-28.
doi:10.1016/j.echo.2022.10.009.
**Ruta probable:** `.../04_Valvulopatias/Reumatic Disease.pdf` (nombre del archivo tal cual, con la
errata «Reumatic»). **Folio = PDF + 2.**

- **Tabla 1** «Classification of Mitral Stenosis Severity», **p. 8** — área valvular
  **> 2,5 / 2,5-1,6 / ≤ 1,5 cm²** · THP < 100 / 100-149 / **≥ 150 ms** · gradiente medio
  < 5 / 5-9 / **≥ 10 mmHg**, con su nota «a una frecuencia cardíaca de 60-80 lpm» · presión pulmonar
  sistólica < 30 / 30-49 / **≥ 50 mmHg**.
- **Puntos clave, p. 10** — *«Severe rheumatic MS is indicated by MVA ≤ 1.5 cm², PHT ≥ 150 msec, and
  transmitral mean gradient ≥ 10 mmHg»*. Define la EM **reumática** como gradiente medio > 4 mmHg
  más cambios morfológicos típicos.
- **p. 8** — la ecuación de continuidad para el área mitral *«is not well validated and is
  infrequently used»* y *«should not be used when significant aortic or mitral regurgitation is
  present»*.
- **p. 11** — IM reumática severa: vena contracta ≥ 0,7 cm · área de vena contracta ≥ 0,40 cm² ·
  volumen regurgitante ≥ 60 ml · fracción regurgitante ≥ 50 % · orificio regurgitante ≥ 0,40 cm².
- **Puntos clave, p. 12** — cociente VTI mitral/aórtico *«> 1.4 suggests severe MR and < 1 indicates
  mild MR»* en ausencia de IAo moderada o severa, listado entre los **semicuantitativos**.
- ⚠️ **Se contradice consigo misma en el operador del área**: el cuerpo de la **p. 7** dice *«less
  than 1.5 cm2»* (`<` estricto) y la **Tabla 1 de la p. 8** publica `≤ 1,5`. **MANDA LA TABLA 1**,
  que es la normativa y la que coincide con las otras dos guías. Queda dicho para que nadie
  «corrija» el operador con ese párrafo en la mano.
- ⚠️ **Es de cardiopatía REUMÁTICA, y eso acota dónde se la puede citar.** Sus cortes de estenosis
  son para la **EM reumática** (la sección del panel ya tiene compuerta por etiología) y sus
  cuantitativos de regurgitación para la **IM reumática**. Prestársela a una estenosis degenerativa
  o a una insuficiencia de otro mecanismo le atribuiría un alcance que no tiene.
- Fe de erratas JASE 2023;36(4):445 — corrige prosa sobre el THP en la p. 8. **No mueve ninguna
  cifra citada.**
- ⚠️ **El mismo documento dice lo CONTRARIO para la aórtica** (folio 20): con IAo y EAo coexistentes
  la continuidad sí se usa. No se mezcla con la regla mitral del folio 8.

### `esc2020guch` — ESC 2020, cardiopatías congénitas del adulto
Baumgartner H, De Backer J, Babu-Narayan SV, et al. *Eur Heart J* 2021;42(6):563-645.
doi:10.1093/eurheartj/ehaa554.
**Ruta probable:** `.../08_Cardiopatias_congenitas/Baumgartner_2020_Cardiopatias_Congenitas.pdf`.
**Edición vigente:** no existe una guía ESC de congénitas del adulto posterior; la próxima está
agendada para **2028**. Hay un resumen en `.../10_Material_de_apoyo/Resumen_ESC_2020_Congenitas.pdf`
(un resumen **no sirve** para verificar).

### `escGuchCiv` — ESC 2020, sección de comunicación interventricular
**Clave aparte, y el motivo NO es la edición** (es la misma ESC 2020). Lo que impide unificar es más
grave: **el criterio que esa sección de la app publica no es el de la tabla de la guía.** Tres
divergencias verificadas contra la recomendación de CIV (**§4.2.4**):

| La app dice | La guía dice |
|---|---|
| cierre por «síntomas atribuibles al shunt» | sobrecarga de volumen del VI y sin HAP, **independientemente de los síntomas** (Clase I · Nivel C) — esa fórmula **no figura** |
| Qp/Qs como criterio general | aparece como **> 1,5** (con `>`, no `≥`) y **sólo** dentro de los escenarios con HP establecida: RVP 3-5 UW → IIa, ≥ 5 UW → IIb |
| DDVI indexado **> 32 mm/m²** | **no está en la guía** — cero coincidencias en el documento completo |

⚠️ **Y el «ESC 2023 GUCH» que el código repite en cinco lugares es un error**: en 2023 la ESC no
publicó ninguna guía de congénitas del adulto. Los cinco lugares: el encabezado de la cascada de
conducta, el comentario de `CIV_QPQS_CIERRE` y los tres `crit` de `CIV_CONDUCTAS`.
**Reportado, NO corregido** — tocar los `crit` es contenido clínico (imprime la tarjeta de
Congénitas, el PDF y el PPT) y es decisión de Maicol. Hasta resolverlo, **el nivel de evidencia no
se publica** y la referencia no se unifica con sus hermanas.

### Registradas SIN folio → NO verificadas al estándar del repo

Están en `IND_REFS`, pero su `full` **no tiene tabla ni página**. Sirven como referencia general;
**no se les puede colgar un corte** hasta leerlas y anotar folio.

| Clave | Documento | Ruta en disco | Qué hay que saber |
|---|---|---|---|
| `esc2023mioc` | ESC 2023, miocardiopatías | `.../11_Miocardiopatias/Arbelo_2023_Miocardiopatias.pdf` (probable) | sin folio |
| `esc2024ao` | ESC 2024, enfermedades aórticas y arteriales periféricas | `.../06_Aorta/Mazzolai_2024_Aorta.pdf` (probable) | incluye la tabla de recomendaciones modificadas, **donde los umbrales de 2014 quedan degradados a Clase IIa**; sin folio |
| `fop2019` | Pristipino C, et al. Documento de posición europeo sobre foramen oval permeable. *Eur Heart J* 2019;40:3182 | **no está en la biblioteca** al 2026-10-01 | ⚠️ **metodología GRADE: no usa las clases I/IIa/IIb de la ESC** — el nivel va en el `txt` con vocabulario GRADE, sin traducir a clases |

### `ecosmart` — criterio propio de la aplicación
**NO es bibliografía** y no se usa para otra cosa. Texto fijo, sin firma ni fecha por decisión de
Maicol:
> «Criterio EcoSmart: decisión clínica de la aplicación cuando la evidencia no ofrece un único corte
> aplicable.»

Una **banda de plausibilidad** es un rango de lo medible, no un criterio: va **sin cita**. Un
corchete sobre «no pude verificar» se lee como si hubiera un criterio detrás.

## Lo que falta y lo que no se pudo abrir

En `docs/fuentes/PENDIENTES_FUENTES.md`: las fuentes que **no se pudieron verificar** (Hatle 1979,
Lancellotti 2013, la Tabla S3 suplementaria de la ESC/EACTS 2025, los cortes de TC mitrales), las que
**faltan** para aórtica, tricúspide, pulmonar y congénitas, y el **procedimiento** para incorporar
una fuente nueva al registro.
