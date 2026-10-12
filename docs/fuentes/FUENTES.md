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
**Ruta en disco, verificada el 2026-10-11:**
`~/Desktop/EcoSmart_Biblioteca_Fuentes/04_Valvulopatias/2025 ESC:EACTS Guidelines for the management of valvular heart Disease. .pdf`
— 102 páginas, original inglés, **el que se cita**. ⚠️ **El nombre `ehaf194.pdf` que decía este
registro NO existe en disco**: `ehaf194` es el identificador del artículo (el DOI acaba en
`eurheartj/ehaf194`) y se seguía usando como si fuera el archivo. El nombre real lleva dos puntos
y un espacio antes de `.pdf`; en `bash` hay que entrecomillarlo. La traducción SEC está en el mismo
directorio como `Praz_2025_Valvulopatias.pdf` y **no se usa para citar**.
**Offset re-verificado contra el pie impreso** (no por aritmética): PDF 41 → 4675, PDF 48 → 4682.
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
| **§10.2.1, enunciado de severidad de la EM** (PDF 46) | **4680** | *«An MVA of ≤1.5 cm2 in conjunction with clinical factors (symptoms, high risk of thromboembolism, or haemodynamic decompensation) is indicative of clinically severe MS»* — **la palabra de la guía es «clinically severe»**. En la misma columna, §10.2.3 escribe *«MVA <1.5 cm2»* con `<` y nombra la *«low-gradient severe MS»* (gradiente medio < 10 mmHg) |
| **§10.2.1**, el ETE en el candidato (PDF 46) | **4680** | *«Transoesophageal echocardiography should be systematically performed in PMC candidates to exclude LA thrombus»* |
| **Figura 14** y su **nota ^c** (PDF 47) | **4681** | título *«Management of clinically severe rheumatic mitral stenosis (mitral valve area ≤1.5 cm2)»*; la nota ^c lista las anatómicas [*«echocardiographic score >8, Cormier score 3 (calcification of MV of any extent as assessed by fluoroscopy), severe TR»*] y las clínicas (*«old age, history of commissurotomy, NYHA class IV, permanent AF, severe PH»*), y define *«Favourable = absence of unfavourable characteristics»* |
| **Recommendation Table 8** (PDF 48) | **4682** | las **seis** filas de intervención en la EM reumática y degenerativa, con su clase y su nivel — ver la tabla de abajo. Su nota ^c repite las características desfavorables como *«the presence of several of the following»* y remite a la Table S3 suplementaria |
| **§10.3.2**, la degenerativa (PDF 48) | **4682** | *«Degenerative MS is not amenable to PMC because commissural fusion is absent»*; y en el folio 4681-4682, que en el anciano con MAC *«surgery is technically challenging and high risk»*, con descalcificación extensa y parche *«in selected patients at experienced centres»* y mortalidad reportada *«<5%»* |
| Tabla 8 de contraindicaciones de la comisurotomía, con sus notas ^a y ^b | **4682** | las **siete** contraindicaciones; la nota ^b es la que la traducción mutiló |
| §14.4.2.1, PPM | 4698 | *«established definitions are lacking»* para el PPM mitral y tricuspídeo |
| **Recommendation Table 17**, disfunción de prótesis | **4700** | **no publica cortes ecocardiográficos** de severidad protésica: dice «significant valve dysfunction» y deja la cuantificación a la ASE |

⚠️ **SIGUE SIN HABER UNA TABLA DE SEVERIDAD DE ESTENOSIS MITRAL EN ESTE DOCUMENTO** (re-leído el
2026-10-11 para el panel de Evidencia). Lo que hay es un **enunciado** en prosa —folio 4680— y no
una tabla con bandas: *«An MVA of ≤1.5 cm2 in conjunction with clinical factors (symptoms, high
risk of thromboembolism, or haemodynamic decompensation) is indicative of clinically severe MS»*.
Del gradiente medio sólo dice que *«reflect its consequences and have prognostic value»* y, más
abajo en la misma columna, nombra la *«low-gradient severe MS (MVA <1.5 cm2, mean gradient
<10 mmHg)»* como un grupo difícil de tratar — **ninguna de las dos cosas es un corte**. Por eso el
cuadro «Categoría EM» de Válvulas cita **sólo ASE 2023** y el panel cita a la ESC para el ÁREA y a
la ASE 2023 para las dos bandas del gradiente.

⚠️ **Y EL DOCUMENTO SE CONTRADICE CONSIGO MISMO EN EL OPERADOR DEL ÁREA.** El enunciado del folio
4680 y el título de la Figura 14 (folio 4681) dicen **`≤ 1,5 cm²`**; el §10.2.3, en la MISMA
columna del folio 4680, escribe *«clinically severe rheumatic MS (MVA <1.5 cm2)»* con `<` estricto.
La app usa `<=`, que coincide con dos de los tres lugares y con la Tabla 1 de la ASE 2023. **Queda
declarado y NO corregido**: mover un operador es cambiar un corte.

⚠️ **Y OTRA VEZ EN «VARIAS», A UNA PÁGINA DE DISTANCIA.** La nota ^c de la **Recommendation
Table 8** (folio 4682) define las características desfavorables como *«the presence of **several**
of the following»*, sin número; la nota ^c de la **Figura 14** (folio 4681) dice *«**Favourable** =
absence of unfavourable characteristics for PMC»*, o sea CERO. Son dos definiciones distintas del
mismo concepto en el mismo documento. El panel no elige entre ellas: con «Una» publica las filas
que aplican en cada lectura.

⚠️ **EL «echocardiographic score >8» REMITE A MATERIAL QUE NO ESTÁ.** La nota ^c del folio 4682
escribe el corte y manda a *«Supplementary data online, Table S3»* para la definición de la escala,
y ese material **no está en el archivo de la biblioteca**. Consecuencia para el panel: el corte se
publica **«según la guía»** y **NO se atribuye a Wilkins ni a ninguna escala concreta**. Lo que sí
se verificó del artículo de Wilkins 1988 está en su propia entrada.

⚠️ **El «may apply» de §9.2.2 NO es un corte nuevo.** En la Figura 10 el corte sigue siendo
≥ 40 mm²; el ≥ 30 mm² **cuelga de que el orificio sea elíptico** (y/o bajo flujo). Dar el ≥ 30 mm²
pelado publicaría un corte incondicional que la guía no da.

⚠️ **El valve-in-valve mitral es la fila TRANSVENOSA.** La Table 17 tiene **dos** filas de ViV con
la misma clase y nivel (IIa · B) y sólo una es mitral: «transfemoral in the aortic position» **no**,
«transcatheter transvenous mitral or tricuspid» **sí**.

⚠️ **Dos filas concurrentes y ninguna domina.** Un sintomático con riesgo quirúrgico intermedio o
alto cumple reoperación **I · C** y ViV mitral **IIa · B**: la primera tiene mejor clase, la segunda
mejor nivel. La guía no dice cuál prevalece — **se publican las dos**.

#### Recommendation Table 8, folio 4682 — las seis filas con su clase y su nivel

Transcripción literal del original inglés, verificada el 2026-10-11. Las cinco primeras son de la
estenosis **reumática**; la sexta es la única de la **degenerativa**.

| # | Literal en inglés | Clase | Nivel |
|---|---|---|---|
| 1 | *«PMC is recommended in symptomatic patients in the absence of unfavourable characteristics for PMC.»* | **I** | **B** |
| 2 | *«PMC is recommended in any symptomatic patients with a contraindication or at high risk for surgery.»* | **I** | **C** |
| 3 | *«MV surgery is recommended in symptomatic patients who are not suitable for PMC.»* | **I** | **C** |
| 4 | *«PMC should be considered as initial treatment in symptomatic patients with suboptimal anatomy but no unfavourable clinical characteristics for PMC.»* | **IIa** | **C** |
| 5 | *«PMC should be considered in asymptomatic patients without unfavourable clinical and anatomical characteristics for PMC, and: • High thromboembolic risk (history of systemic embolism, dense spontaneous contrast in the LA, new-onset or paroxysmal AF), and/or • High risk of haemodynamic decompensation (SPAP >50 mmHg at rest, need for major NCS, pregnant or desire for pregnancy).»* | **IIa** | **C** |
| 6 | *«TMVI may be considered in symptomatic patients with extensive MAC and severe MV dysfunction at experienced Heart Valve Centres with expertise in complex MV surgery and transcatheter interventions.»* | **IIb** | **C** |

⚠️ **LA FILA 3 NO DEFINE «not suitable for PMC»** — es un juicio del Heart Team. El panel la deriva
de «características clínicas desfavorables» y **lo declara en la propia fila**: sin eso, una
derivación de la aplicación se leería como texto de la guía. No se deriva de la anatomía, porque la
fila 4 rutea la anatomía subóptima con clínica favorable a comisurotomía y no a cirugía.

#### Tabla 8, folio 4682 — las siete contraindicaciones, literales

*«MVA >1.5 cm2»* ^a · *«LA thrombus»* ^b · *«More than mild MR»* · *«Severe or bi-commissural
calcification»* · *«Absence of commissural fusion»* · *«Severe concomitant AV disease, or severe
combined tricuspid stenosis and regurgitation requiring surgery»* · *«Concomitant CAD requiring
bypass surgery»*.

Nota ^a: *«PMC may be considered in patients with MVA of >1.5 cm2 with symptoms that cannot be
explained by another cause and if the anatomy is favourable»*. Nota ^b: *«When the thrombus is
located in the LA appendage, PMC may be considered in patients with contraindications to surgery or
those without urgent need for intervention, in whom OAC can be safely given for 1–3 months,
provided repeat TOE confirms resolution of thrombus»*.

**Fe de erratas leída y CONFIRMADA** (`ehag625`, EHJ, 2026-08-06): **un solo cambio**, «NYHA class
II–V» → «II–IV» en la §9.2.4.2 (IM secundaria ventricular). **No toca la estenosis mitral ni
ninguna cifra que use el panel.** El PDF de la biblioteca **ya incluye la corrección**: medido el
2026-10-11, el folio 4677 dice «NYHA class II–IV» y la cadena «II–V» no aparece en el documento.
Una segunda errata en *Eur J Cardiothorac Surg* 2026;68(7):ezag193 (párrafo duplicado sobre
anticoagulación en el embarazo). **Ninguna toca un umbral.**

### `aseVr2017` — ASE 2017, regurgitación valvular nativa
Zoghbi WA, Adams D, Bonow RO, et al. *J Am Soc Echocardiogr* 2017;30(4):303-371.
doi:10.1016/j.echo.2017.01.007.
**Ruta CONFIRMADA (2026-10-07):** `~/Desktop/EcoSmart_Biblioteca_Fuentes/04_Valvulopatias/Zoghbi_2017_Regurgitacion_Valvular.pdf`
(69 páginas; decía «ruta probable» hasta que se abrió). **Folio = página del PDF + 302.**

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

#### Tabla 14 — IT, «Grading the severity of chronic TR by echocardiography», folio 350

Leída en texto completo el **2026-10-07** (PDF pág. 48; pie impreso «350 Zoghbi et al» como
control). **La tabla está en cm y cm²** — transcribirla sin convertir mueve el umbral dos órdenes
de magnitud, igual que advierte la Tabla 8.

| Parámetro (fila de la tabla) | Leve | Moderada | Severa |
|---|---|---|---|
| **VCW (cm)** | `<0.3` | `0.3-0.69` | `$0.7` (≥0,7) |
| **EROA (cm²)** | `<0.20` | `0.20-0.39` | `$0.40` (≥0,40) |
| **RVol (2D PISA) (mL)** | `<30` | `30-44` | `$45` (≥45) |
| **CWD jet** (cualitativo) | Faint/partial/parabolic | Dense, parabolic or triangular | Dense, often triangular |
| PISA radius (cm) | `#0.5` (≤0,5) | `0.6-0.9` | `>0.9` |
| Color flow jet area (cm²) | no definido | no definido | `>10` |

En las unidades de la app: **VC `<3` / `3-6,9` / `≥7` mm · EROA `<20` / `20-39` / `≥40` mm² ·
Vol-R `<30` / `30-44` / `≥45` ml.**

- La nota `k` de la tabla dice *«There are little data to support further separation of these
  values»* sobre las bandas intermedias de EROA y RVol.
- *«a TR VCW >0.7 cm identifies severe TR and is a marker of worse prognosis»* (folio 350, texto).
- **Los signos en negrita de la tabla son «specific for their TR grade»** — la tabla NO publica una
  regla de recuento de votos. La aritmética de `calcIT_ESC` (`severa >= 1` basta, `moderada >= 2`)
  es **criterio de la app**, no de esta guía. Queda declarado.

⚠️ **De acá sale la divergencia de la vena contracta tricuspídea en 7,0 exacto**: la guía da
`≥0,7 cm` severa y `calcIT_ESC` aplicaba `<= 7` moderada. La EROA y el volumen regurgitante
**coinciden exactamente** con esta tabla.

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
**Ruta en disco, ENCONTRADA el 2026-10-11:**
`~/Desktop/EcoSmart_Biblioteca_Fuentes/04_Valvulopatias/2009_Echo-Assessment-of-Valve-Stenosis_note_added.pdf`
— 23 páginas. **Folio = página del PDF, sin offset**, verificado contra el pie impreso: la p. 12
dice «12 Baumgartner et al» y la p. 17 dice «Baumgartner et al 17». Este registro decía «NO está en
la biblioteca — ruta no registrada» y era falso: estaba, con otro nombre.

- **p. 13** — *«Hence, the use of T1/2 in degenerative calcific MS may be unreliable and should be
  avoided»*. ⚠️ **Es más fuerte que «puede no ser confiable»: dice que DEBE EVITARSE**, y así va en
  el bloque 3 del panel (orden de Maicol: sin suavizar).
- **p. 12** — *«In the particular case of degenerative MS, planimetry is difficult and mostly not
  reliable because of the orifice geometry and calcification present»*. O sea que en la
  degenerativa calcificada las DOS fuentes de área habituales están limitadas, cada una por su
  motivo. El THP se acorta por la disfunción diastólica del anciano (misma p. 13); la planimetría,
  por la geometría del orificio.
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

### `esc2025vc` · MATERIAL SUPLEMENTARIO — `ehaf194_supplementary_data.pdf` (verificado 2026-10-12)

**Ruta en disco:**
`~/Desktop/EcoSmart_Biblioteca_Fuentes/04_Valvulopatias/ehaf194_supplementary_data.pdf`
— 7 páginas. Es el *Supplementary data online* al que la guía remite; **no tiene folio de revista**,
así que se cita por **página del PDF**, que acá coincide con la impresa (el pie de la p. 5 dice
«ESC Guidelines 5»).

⚠️ **ESTE ARCHIVO SÍ ESTÁ EN LA BIBLIOTECA, Y EL PANEL AFIRMA DOS VECES QUE NO.** La nota de detalle
de la estenosis mitral dice «La definición de esa escala vive en su material suplementario
(Table S3), **que no está en el documento consultado**», y un comentario de `index.html` lo repite.
Las dos frases quedaron del 2026-10-11, cuando era cierto. **Decisión de Maicol (2026-10-12): no se
tocan en esta tanda** — son contenido clínico del panel y van a una tanda de textos. Anotado en
`docs/PENDIENTES.md`.

#### Tabla S3, p. 5 — los dos scores de la comisurotomía percutánea

Título: *«Echocardiographic scores used for assessing the feasibility of percutaneous mitral
commissurotomy: Wilkins score and Cormier score»*. Pie único de la tabla, debajo de las dos mitades
y con la lista de abreviaturas de las dos: **«© ESC/EACTS 2025. Reproduced from⁶»**.

| Mitad | Encabezado literal | Superíndice | Qué da |
|---|---|---|---|
| Wilkins | *«Assessment of **MVA** according to the Wilkins score⁴»* | **4** | 4 componentes (`Mobility`, `Thickening`, `Calcification`, `Subvalvular thickening`) × grados **1 a 4**, con su descriptor |
| Cormier | *«Assessment of **MV anatomy** according to the Cormier score⁵»* | **5** | los grupos **1, 2 y 3** |

**La frase del total, literal:** *«The total score is the sum of the four items and ranges between
4 and 16.»*

⚠️ **EL ENCABEZADO DE LA MITAD DE WILKINS DICE «MVA», QUE EN ESTE MISMO DOCUMENTO ES LA SIGLA DEL
ÁREA** (`MVA, mitral valve area`, en el pie de la tabla y en la Tabla S2). La mitad de Cormier, dos
renglones más abajo, dice `MV anatomy`. Es **probable error del documento**: el score puntúa
ANATOMÍA, no área. **Por eso la tarjeta del panel titula «Score de Wilkins (Tabla S3)» y NO traduce
ese encabezado** — traducirlo publicaría «valoración del área mitral según el score de Wilkins», que
es falso. Decisión de Maicol (2026-10-12). Anotado en `docs/PENDIENTES.md`.

⚠️ **LA TABLA S3 NO DA EL CORTE «> 8».** Ese corte lo ponen las dos notas ^c de la guía (abajo). La
Tabla S3 sólo **define** las dos escalas.

⚠️ **LOS GRADOS SON 1 A 4 Y EL TOTAL 4 A 16, Y ESO NO ES LO QUE DICE EL ARTÍCULO ORIGINAL.**
`wilkins1988` (abajo) tiene verificado **0 a 4 por ítem y 0 a 16 el total** (Tabla 2, p. 300). Los
dos son ciertos **de su propio documento**: la Tabla S3 reproduce la escala con otro origen. El panel
muestra hoy los **dos** rangos —4 a 16 en la tarjeta del término, 0 a 16 en la nota de guías previas—
y eso queda **declarado y sin corregir** por decisión de Maicol (2026-10-12).

#### Lista de referencias, p. 7 — las tres que importan acá

- **4** — Bonow RO, O'Gara PT, Adams DH, Badhwar V, Bavaria JE, Elmariah S, et al. *2019 AATS/ACC/SCAI/STS
  expert consensus systems of care document: operator and institutional recommendations and
  requirements for transcatheter mitral valve intervention…* **J Am Coll Cardiol 2020;76:96-117.**
  doi:10.1016/j.jacc.2019.12.002 → la que la Tabla S3 asigna al **score de Wilkins**.
- **5** — Bouleti C, Iung B, Himbert D, Brochet E, Messika-Zeitoun D, Detaint D, et al.
  *Reinterventions after percutaneous mitral commissurotomy during long-term follow-up, up to 20
  years: the role of repeat percutaneous mitral commissurotomy.* **Eur Heart J 2013;34:1923-30.**
  doi:10.1093/eurheartj/eht097 → la que asigna a **Cormier**.
- **6** — Vahanian A, Beyersdorf F, Praz F, Milojevic M, Baldus S, Bauersachs J, et al. *2021
  ESC/EACTS Guidelines for the management of valvular heart disease.* **Eur Heart J
  2022;43:561-632.** doi:10.1093/eurheartj/ehab395 → la guía **de la que la Tabla S3 declara estar
  reproducida**. Ver la salvedad de la sección «ESC/EACTS 2021» de este archivo: **nombrarla acá no
  la registra como fuente verificada**.

#### Las dos notas ^c — los literales que sostienen el «> 8» y el «grupo 3»

- **Figura 14, nota ^c, folio 4681** (PDF 47): *«Favourable = absence of unfavourable characteristics
  for PMC defined by unfavourable anatomical characteristics [echocardiographic score >8, Cormier
  score 3 (calcification of MV of any extent as assessed by fluoroscopy), severe TR] or unfavourable
  clinical characteristics (old age, history of commissurotomy, NYHA class IV, permanent AF, severe
  PH) (for the definition of scores see Supplementary data online, Table S3).»*
- **Recommendation Table 8, nota ^c, folio 4682** (PDF 48): *«Unfavourable characteristics for PMC can
  be defined by the presence of **several** of the following characteristics: clinical characteristics
  (old age, history of commissurotomy, NYHA class IV, permanent AF, severe PH); anatomical
  characteristics [echocardiographic score >8, Cormier score **group** 3 (calcification of MV of any
  extent as assessed by fluoroscopy), severe TR] (for the definition of scores see Supplementary data
  online, Table S3).»*

⚠️ **LAS DOS NOTAS SE CONTRADICEN Y SÓLO UNA DICE «VARIAS».** La de la Tabla 8 dice *«several of the
following»* **sin dar número**; la de la Figura 14 dice *«absence of unfavourable characteristics»*,
o sea **ninguna**. Por eso las tarjetas de los dos términos atribuyen el «varias» **sólo a la nota
^c de la Recommendation Table 8**, y no a «las notas c»: afirmar que las dos lo dicen sería falso.
La sección de estenosis mitral ya declara esta contradicción en su detalle, con las dos citas.
Diferencia menor entre las dos: la Figura 14 escribe `Cormier score 3` y la Tabla 8
`Cormier score group 3`.

#### Los DOS TÉRMINOS del glosario del panel — fuente, página y referencia

| Término (`IND_TERMINOS`) | Fuente | Página | Referencia que la tabla le asigna |
|---|---|---|---|
| `cormier` — Clasificación de Cormier | ESC/EACTS 2025, material suplementario, **Tabla S3**; más las notas ^c de la Figura 14 (folio 4681) y de la Tabla 8 (folio 4682) | **p. 5** | **cita 5** del suplemento — Bouleti C, et al. *Eur Heart J* 2013;34:1923-30 |
| `score_eco` — Score ecocardiográfico | igual | **p. 5** | **cita 4** — Bonow RO, et al. *J Am Coll Cardiol* 2020;76:96-117. Y la tabla declara estar **reproducida de la guía ESC/EACTS 2021** (cita 6) |

**Los 16 descriptores y las frases de las dos tarjetas están en español con palabras propias**, sin
copia literal ni traducción palabra por palabra: la guía es de la ESC, su contenido no se reproduce
sin permiso y EcoSmart es comercial. Se verificaron uno por uno contra el original inglés de arriba
y los **aprobó Maicol el 2026-10-11**, con cuatro ajustes suyos («valvas» en lugar de «velos»,
«brillo ecográfico aumentado», la redacción del grupo 3, y la salvedad de «UNA de varias
características desfavorables, y la guía no dice cuántas bastan»). Lo que impide que cambien sin
volver a pasar por acá son las anclas literales de **TC-451**.

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
- ⚠️ **Y LA TABLA S3 DE LA ESC/EACTS 2025 GRADÚA 1 A 4 CON TOTAL 4 A 16** (ver la entrada del
  material suplementario, más arriba). O sea que los selectores coinciden con la Tabla S3 y no con
  el original. **Los dos rangos son ciertos de su propio documento** y el panel muestra hoy los dos:
  4 a 16 en la tarjeta del término `score_eco`, 0 a 16 en la nota de guías previas de la sección.
  **Declarado y sin corregir** por decisión de Maicol (2026-10-12); anotado en
  `docs/PENDIENTES.md`. Antes de «unificarlos», leer esto: unificar es elegir a qué documento
  desmentir.

### `asePandian2023` — ASE 2023, cardiopatía reumática
Pandian NG, Kim JK, Arias-Godinez JA, et al. *J Am Soc Echocardiogr* 2023;36(1):3-28.
doi:10.1016/j.echo.2022.10.009.
**Ruta:** `.../04_Valvulopatias/Reumatic Disease.pdf` (nombre del archivo tal cual, con la
errata «Reumatic»). **Folio = PDF + 2.**

- **Tabla 1** «Classification of Mitral Stenosis Severity», **p. 8** — área valvular
  **> 2,5 / 2,5-1,6 / ≤ 1,5 cm²** · THP < 100 / 100-149 / **≥ 150 ms** · gradiente medio
  < 5 / 5-9 / **≥ 10 mmHg**, con su nota «a una frecuencia cardíaca de 60-80 lpm» · presión pulmonar
  sistólica < 30 / 30-49 / **≥ 50 mmHg**.
- **Puntos clave, p. 10** — *«Severe rheumatic MS is indicated by MVA ≤ 1.5 cm², PHT ≥ 150 msec, and
  transmitral mean gradient ≥ 10 mmHg»*. Define la EM **reumática** como gradiente medio > 4 mmHg
  más cambios morfológicos típicos.
- ✅ **DE ACÁ SALEN LOS TRES CORTES DE LA REGLA DE ESTENOSIS MITRAL DE ECOSMART** (2026-10-11).
  La Tabla 1 del folio 8 es la **única fuente** que la app cita para esta regla, y cada constante
  tiene su número y su borde:

  | Constante | Valor | Borde | De dónde sale |
  |---|---|---|---|
  | `AVM_SEVERA_MAX` | 1,5 cm² | `<=` | Tabla 1, columna «severe»: `≤ 1,5 cm²` |
  | `EM_GMEDIO_ELEVADO_MIN` | 5 mmHg | `>=` | Tabla 1, banda media del gradiente: `5-9 mmHg` |
  | `EM_GMEDIO_SIGNIF_MIN` | 10 mmHg | `>=` | Tabla 1, banda alta del gradiente: `≥ 10 mmHg` |

  La nota de la tabla —**«a una frecuencia cardíaca de 60-80 lpm»**— es una condición de la
  medición que la app **no verifica**: no recoge la FC del Doppler transmitral. Queda dicho.
  ⚠️ **El operador del área ya estaba discutido en esta misma entrada** (el cuerpo de la p. 7
  dice `<` y la Tabla 1 publica `≤`): **manda la Tabla 1**, y por eso el borde de
  `AVM_SEVERA_MAX` es `<=`. No se movió en esta tanda.
  ⚠️ **El «> 4 mmHg» de la p. 10 NO es un corte de severidad y dejó de gobernar nada.** Es la
  definición de EM **reumática** de la WHF que esa página cita, y hasta el 2026-10-11 era el
  único corte vivo del gradiente en la app (`EM_GMEDIO_SIGNIF = 4`, borde `>`). Se reemplazó por
  las dos bandas de la Tabla 1, que es la normativa. La **banda `< 5`** no clasifica.
  ⚠️ **La nomenclatura «significativa / no significativa»** que publica el informe sale de este
  documento; los rótulos «Leve / Moderada / Severa» de la Tabla 1 **no se usan para la EM**
  porque la app dejó de graduarla en escalera (28/09). El valor guardado interno sigue siendo
  `em_grado='severa'`, que es otra cosa que la palabra impresa.
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

### `aseDiast2025` — ASE 2025, función diastólica del VI y diagnóstico de HFpEF (verificada 2026-10-12)

**Documento.** Nagueh SF, Sanborn DY, Oh JK y cols. *Recommendations for the Evaluation of Left
Ventricular Diastolic Function by Echocardiography and for Heart Failure With Preserved Ejection
Fraction Diagnosis: An Update From the American Society of Echocardiography.*
**J Am Soc Echocardiogr 2025;38:537-69.** Ruta en disco:
`~/Desktop/EcoSmart_Biblioteca_Fuentes/02_Diastolica/Left-Ventricular-Diastolic-Function.pdf`
(33 páginas; `Nagueh_2025_Diastolica.pdf`, en la misma carpeta, es **el mismo archivo**, byte por
byte el mismo tamaño).

**Regla de folio: folio = página 1-based del PDF + 536.** Comprobado contra el pie impreso: PDF 1 →
537 (primera del artículo, que va de 537 a 569), PDF 16 → 552, PDF 17 → 553, PDF 18 → 554, PDF 19 →
555, PDF 21 → 557, PDF 27 → 563.

**Las figuras salen como TEXTO VECTORIAL**, así que las Figuras 2, 3, 4, 5, 6 y 8 se leyeron en su
contenido y no por lo que el cuerpo dice de ellas. (Las Figuras 17, 18 y 19 de la **BSE 2024** son
imágenes: de ahí sólo se leyó la prosa que las describe, y está anotado donde se las cita.)

#### Lo verificado, por folio

| Folio | Qué | Literal del corte |
|---|---|---|
| **553** · Figura 2 | **Diagnóstico de disfunción diastólica**, dos pasos. Paso 1: e' septal **≤6** o lateral **≤7** o promedio **≤6,5** cm/s. Paso 2, cuatro marcadores: E/e' promedio **>14**, LARS **≤18 %**, **E/A ≤0,8 o ≥2**, LAVi **>34** ml/m². Regla: e' reducida + **≥1** marcador, o e' conservada + **≥2** | el LAVi lleva nota: se excluye primero la AI grande del atleta, la de la anemia, la de la FA o el flutter y la de la valvulopatía mitral; y agrega que un índice de masa del VI > 95 g/m² en mujeres o > 115 en hombres también es compatible con disfunción diastólica |
| **553** · Tabla 6 | **e' por edad** para relajación alterada, los nueve con **`<`**: septal 20-39 <7 · 40-65 <6 · >65 <6; lateral <10 · <8 · <7; promedio <9 · <7 · <6,5 | es **opcional**: la Figura 3 remite a ella «en lugar de» sus propios valores |
| **553** · Key Point 2 | los mismos tres cortes de e' escritos con **`<`**: septal <6, lateral <7, promedio <6,5 | **contradice a las Figuras 2 y 3, que escriben `≤`** |
| **553** · prosa | E/A ≥2, E/e' promedio **>14** y LARS **<18 %** son compatibles con PAI elevada | el `<18 %` del LARS **contradice** el `≤18 %` de las dos figuras y el del folio 554 |
| **554** · Figura 3 | **ALGORITMO DE LA PAI EN RITMO SINUSAL.** Tres variables principales: (1) e' reducida septal ≤6 / lateral ≤7 / promedio ≤6,5; (2) **E/e' septal ≥15 o lateral ≥13 o promedio ≥14**; (3) **IT ≥2,8 m/s o PSAP ≥35 mmHg**. Ramas: las tres → PAI elevada → **E/A <2 grado 2 · E/A ≥2 grado 3**; todas normales → función diastólica normal y PAI normal; **e' reducida sola** → E/A ≤0,8 grado 1, E/A >0,8 al segundo paso; **IT sola, E/e' sola, o dos cualesquiera** → segundo paso | **los cortes de la figura son `≥`** donde la Figura 2, la prosa del 553 y la Tabla 7 del 557 usan `>` |
| **554** · Figura 3, segundo paso | **S/D venoso pulmonar ≤0,67 o LARS ≤18 % o LAVi >34 ml/m²**; **como alternativa, TRIV ≤70 ms**; si no hay ninguno disponible o fiable, métodos suplementarios. ≥1 presente → PAI elevada (y se gradúa por E/A); ninguno → PAI normal, y eco de esfuerzo diastólico si hay síntomas | la figura escribe «Alternatively» sobre el TRIV: **es alternativa, no par** |
| **554** · pie de la Figura 3 | **NO se aplica** con FA, asistencia ventricular, HP no cardíaca, trasplante, constricción pericárdica, **IM primaria grave**, **estenosis mitral de cualquier grado** ni **calcificación del anillo moderada o grave**; y por nota al pie, tampoco con **plástica, recambio ni TEER mitral** | el recuadro interno de la figura abrevia «MAC, MR, MS» |
| **554** · prosa | el S/D ≤0,67 equivale a una fracción de llenado sistólico ≤40 %; el LARS ≤18 % es muy específico y poco sensible; el TRIV ≤70 ms es compatible con PAI elevada; y el LAVi entra **en la segunda etapa** —a diferencia de las guías de 2016— porque correlaciona flojo con la PAI y tiene otras causas de agrandamiento | |
| **555** · Parámetros suplementarios | IP telediastólica ≥2 m/s o PAP diastólica ≥16 mmHg; **onda L ≥50 cm/s**; IM diastólica y terminación precoz del llenado; Ar pulmonar de amplitud >35 cm/s con Ar-A >30 ms; caída de E/A ≥50 % con Valsalva | |
| **555** · §12, Informe | todo informe debe traer el **grado** y el estado de la **presión de llenado**; y **si el que informa no puede determinar el grado, igual tiene que decir si la PAI es normal o elevada** | es el respaldo del estado (a) de la app |
| **557** · Tabla 7 | **Indicadores en poblaciones especiales.** FA: TDE <160 ms con FEVI deprimida, aceleración de la E ≥1.900 cm/s², TRIV ≤65 ms, TDE de la D venosa ≤220 ms, E/Vp ≥1,4, **E/e' septal ≥11**, IT >2,8. Taquicardia sinusal: TRIV ≤70 ms, fracción sistólica ≤40 %, E/e' promedio >14. MCH: E/e' >14, Ar-A ≥30 ms, IT >2,8, LAVi >34 **sin regla de conteo**. Miocardiopatía restrictiva: E/e' >14, TDE <140 ms, E/A >2,5, TRIV <50 ms. HP: E/A ≥2 poscapilar, ≤0,8 precapilar. **Estenosis mitral: TRIV <60 ms, A mitral >1,5 m/s, TRIV/T E-e' <4,2.** IM: TRIV <60 ms, Ar-A ≥30 ms, TRIV/T E-e' <5,6, E/e' >14 **sólo con FE deprimida**. CAM moderada/grave: E/A <0,8 normal, >1,8 elevada, 0,8-1,8 por TRIV. Asistencia ventricular y trasplante, con sus propios cortes | la regla de conteo de la MCH **NO LA DA LA GUÍA**: lo que hay es la lista de parámetros |
| **558** · Figura 4 | **CAM moderada o grave**: E/A <0,8 → PAI normal; >1,8 → elevada; 0,8-1,8 → TRIV ≥80 ms normal, <80 ms elevada | |
| **559** · Figura 5 | **Trasplante en ritmo sinusal**: E/e' promedio <7 normal, >14 elevada; entre 7 y 14, E/SR IVR ≤200 cm normal y >200 elevada; sin SR IVR, IT ≤2,8 normal y >2,8 elevada | |
| **560** · Figura 6 | **HP no cardíaca**: E/A ≤0,8 con E ≤50 cm/s → PAI normal; E/A ≥2 con e' reducido → elevada; en el medio, **E/e' LATERAL** <8 normal, >13 elevada y **8-13 indeterminado**, con el LARS (≤18 % elevada, >18 % normal) como desempate | **acá sí hay casilla «indeterminado»** |
| **563** · Figura 8 | **FA**: paso 1 con E ≥100 cm/s, **E/e' septal >11**, IT >2,8 o PSAP >35, TDE ≤160 ms. ≥3 → elevada; ninguno o 1 → normal; 2 → paso 2 con LARS <18 %, S/D <1, IMC >30: 2 o 3 → elevada, ninguno → normal, **1 solo o no disponibles → indeterminado** | **acá también hay «indeterminado»**; y el LARS del paso 2 es **<18 %**, no el <16 % de la BSE |

#### La FIBRILACIÓN AURICULAR — Figura 8, folio 563 (verificada 2026-10-12)

Leída en el ORIGINAL (PDF página 27 de `Left-Ventricular-Diastolic-Function.pdf`, folio 563), con
la figura como texto vectorial. **El tercer parámetro del segundo paso ES el IMC** —el reporte
anterior lo marcaba como posible error de lectura y no lo era—: la figura escribe
`BMI > 30 kg/m2` y el cuerpo del artículo lo explica en el mismo folio, al listar la obesidad
entre las comorbilidades que elevan la probabilidad pretest de HFpEF.

| Paso | Parámetros, con el operador impreso | Regla |
|---|---|---|
| **1** | Onda E **≥ 100 cm/s** · E/e' **SEPTAL > 11** · IT **> 2,8 m/s** o PSAP **> 35 mmHg** · TDE **≤ 160 ms** | «3 or more of above» → PAI **elevada** · «None or 1 of above» → **normal** · «2 of above» → paso 2 |
| **2** | LARS **< 18 %** · S/D venoso pulmonar **< 1** · IMC **> 30 kg/m²** | «2/3 or 3/3» → **elevada** · «None» → **normal** · «1 only or not available or not reliable» → **indeterminado** |

**La figura NO da límite de frecuencia cardíaca ni exclusiones propias.** Lo único que el texto
del folio 563 pide es promediar varios ciclos y elegir latidos representativos de la frecuencia
media; menciona además que el registro simultáneo de E y e' con sonda de doble Doppler es más
exacto que promediar ciclos distintos, y que la menor variabilidad latido a latido del llenado
mitral acompaña a la presión elevada. Ninguna de esas tres cosas es un corte.

⚠️ **LOS OPERADORES DE LA FIGURA 8 NO SON LOS DE LA FIGURA 3.** La Figura 3 (ritmo sinusal,
folio 554) escribe la IT y el E/e' con **≥**; la Figura 8 los escribe con **>**. No es una
contradicción interna de la guía —son dos algoritmos distintos para dos poblaciones distintas—,
pero sí el motivo por el que la app NO comparte constantes entre las dos ramas: una IT de 2,80
es POSITIVA en ritmo sinusal y NEGATIVA en FA, y las dos cosas son correctas.

⚠️ **EL E/e' DE LA FA ES EL SEPTAL, Y UNO SOLO.** En ritmo sinusal la Figura 3 ofrece tres cortes
por sitio como alternativas (septal ≥15, lateral ≥13, promedio ≥14); en FA la Figura 8 da **un**
corte y lo califica de septal. La **Tabla 7 del folio 557** —indicadores en poblaciones
especiales— repite «E/e' septal ≥ 11» para la FA, con `≥` donde la figura escribe `>`: gana la
figura del algoritmo que la app ejecuta, que es la Figura 8.

⚠️ **EL S/D VENOSO PULMONAR SÍ ES EVALUABLE EN FA.** El corte de la Figura 3 es **≤ 0,67** y el
campo `venp_sd` es un `<select>` de «<1 / >1», así que en ritmo sinusal queda declarado no
evaluable; el corte de la Figura 8 es **< 1**, que es exactamente lo que esa opción dice. Es el
mismo campo con dos cortes distintos, y uno cae justo en el borde de la opción.

### `bseDiast2024` — BSE 2024, FIBRILACIÓN AURICULAR · Figura 19, pág. 39 (verificada 2026-10-12)

**Documento.** Robinson S y cols., *Echo Research & Practice* 2024;11:16. Ruta en disco:
`~/Desktop/EcoSmart_Biblioteca_Fuentes/02_Diastolica/Robinson_2024_Diastolica_BSE.pdf`
(55 páginas; **se pagina por «Page N of 55», no por folio de revista**).

⚠️ **LA FIGURA 19 ES UNA IMAGEN DENTRO DEL PDF**: el texto extraído sólo trae el pie. Se leyó
renderizando la página 39 y mirando las cajas, y cada corte se cruzó contra la prosa de las
págs. 37-40, que los nombra uno por uno con su justificación.

| Paso | Parámetros, con el operador impreso | Regla |
|---|---|---|
| **1** | E/e' **septal > 11** · onda E **≥ 100 cm/s** · TDE **≤ 160 ms** · IT **> 2,8 m/s** | **≥3 positivos** → presión elevada · **≥3 negativos** → normal · «Insufficient STEP 1 criteria for decision» → paso 2 |
| **2** | LARS **< 16 %** · IMC **> 30 kg/m²** · S/D venoso pulmonar **< 1** | **≥2 positivos** → elevada · **≥2 negativos** → normal · «Insufficient STEP 2 criteria» → **indeterminada** |

**Frecuencia cardíaca, y son DOS cosas.** El encabezado de la figura dice «Heart rate <100 bpm;
ideally use index beat method», y la pág. 37 lo explica: con menos de 100 lpm —idealmente menos
de 90— se pueden tomar los parámetros de un solo latido si los dos R-R previos difieren menos de
60 ms. El **pie de la figura** es otra cosa: excluye el algoritmo con «atrial fibrillation with
rapid average ventricular rate at rest (> 120 bpm)». Una es una condición de MEDICIÓN y la otra
una EXCLUSIÓN; la app las distingue en su aviso ámbar.

**Las otras exclusiones del pie:** cardiopatía congénita compleja, trasplante cardíaco,
hepatopatía terminal, estenosis mitral —o calcificación anular que la produzca—, prótesis mitral,
estenosis aórtica grave e insuficiencia mitral o tricuspídea graves.

**El algoritmo se usa en TODO paciente en FA, con la FEVI que sea** («For use in all AF patients,
irrespective of LV systolic function»), y la pág. 37 agrega que en FA **la relajación del VI no
se puede evaluar con exactitud**: por eso este algoritmo contesta sólo por la presión de llenado
y no gradúa.

⚠️ **EL LARS BAJA A 16 % EN FA, Y LA GUÍA DICE POR QUÉ** (pág. 40): sin contracción auricular el
strain de reservorio es sistemáticamente menor que en ritmo sinusal, así que el corte de 18 % no
sirve. Un LARS de 17 % es **positivo para la ASE 2025 y negativo para la BSE** sobre el mismo
paciente. No se unifican.

⚠️ **LA FIGURA 19 NO TIENE PSAP NI LAVi.** Su tercer criterio es la velocidad de la IT a secas
(la pág. 38 agrega el cuidado de no medirla tras un R-R corto, que la subestima). El volumen
auricular no aparece en ninguno de los dos pasos.

⚠️ **UNA ERRATA DE LA PROSA, DECLARADA.** La pág. 37 escribe «When ≤ 3 are negative, LVFP are
considered normal», que con cuatro criterios es la condición contraria a la que puede querer
decir; la figura escribe **«≥3 criteria negative»**. Gana la figura. La misma prosa escribe la
onda E con `>` donde el encabezado de su propia sección y la figura escriben `≥ 100 cm/s`.

### `aseDiast2016` — ASE/EACVI 2016, FIBRILACIÓN AURICULAR · folio 295 (verificada 2026-10-12)

**Documento.** Nagueh SF y cols., *J Am Soc Echocardiogr* 2016;29:277-314. Ruta en disco:
`~/Desktop/EcoSmart_Biblioteca_Fuentes/02_Diastolica/LV-Diastolic-Function-ASE-EACVI-2016.pdf`
(38 páginas). **Regla de folio: folio = página 1-based del PDF + 276** (PDF 7 → 283, PDF 19 →
295).

⚠️ **ESTA GUÍA NO TIENE ALGORITMO DE FA, Y ESO ES EL HALLAZGO.** Su sección E del folio 295
enumera parámetros «sugestivos» de presión de llenado elevada y **no da ninguna regla de conteo**
ni figura de decisión para la fibrilación auricular. Las Figuras 24-27 que cita son ejemplos de
registros, no algoritmos.

| Parámetro | Corte | Condición que la guía le pone |
|---|---|---|
| Velocidad de la IT | **> 2,8 m/s** | Key Point 1, sin condición |
| TDE mitral | **≤ 160 ms** | Key Point 2: **con FEVI deprimida** |
| Aceleración pico de la onda E | ≥ 1.900 cm/s² | Key Point 3: «en pacientes con chorro de IT incompleto» |
| TRIV | ≤ 65 ms | ídem |
| TD de la onda D de la vena pulmonar | ≤ 220 ms | ídem |
| E/Vp | ≥ 1,4 | ídem |
| E/e' | **≥ 11** | ídem. **No especifica el sitio** |

Cierra pidiendo promediar varios ciclos con intervalos R-R apareados para la E y la e', y anota
que la menor variabilidad del llenado mitral con el ciclo acompaña a la presión elevada.

**Tres de esos siete no tienen campo en esta app** —la aceleración de la onda E, el TD de la onda
D venosa y el E/Vp— y quedan declarados no evaluables, con el motivo en su propio rótulo.

#### Las contradicciones internas, declaradas

La ASE 2025 **se contradice consigo misma en cuatro cortes**, y no es una lectura: los dos signos
están impresos en el mismo documento.

| Corte | Figura del algoritmo | Texto / tabla | Qué usa la app |
|---|---|---|---|
| e' septal / lateral / promedio | Fig 2 y 3 (553-554): **≤6 / ≤7 / ≤6,5** | Key Point 2 (553) y Tabla 6 (553): `<` | **la figura** |
| LARS | Fig 2 y 3: **≤18 %** | prosa del 553: `<18 %` (el 554 vuelve a escribir `≤18 %` dos veces) | **la figura** |
| E/e' | Fig 3 (554): **≥14** (y ≥15 / ≥13 por sitio) | Fig 2 (553), prosa del 553 y Tabla 7 (557): `>14` | **la Figura 3** |
| Velocidad de la IT | Fig 3 (554): **≥2,8** | Fig 2, Tabla 7 (557) y Fig 8 (563): `>2,8` | **la Figura 3** |

**Criterio de la app, escrito en el comentario de cada constante:** gana **la figura del algoritmo
que la app ejecuta**, que es la **Figura 3** — lo que la app publica es presión de llenado y grado,
que es el producto de la Figura 3 y no el de la Figura 2.

#### Dos subsunciones que son álgebra, no observaciones

1. **El e' promedio ≤6,5 nunca decide solo con los dos anillos.** Para que (ep+el)/2 ≤ 6,5 con
   ep > 6 y el > 7 haría falta una suma ≥ 13,02, o sea un promedio ≥ 6,51. Imposible.
2. **El E/e' promedio ≥14 tampoco, usando los tres cortes como alternativas.** Para cruzarlo con
   el septal < 15 y el lateral < 13 haría falta ep+el = E/7 siendo ep+el > E/15 + E/13 = 28E/195;
   y 1/7 = 195/1365 < 196/1365 = 28/195. **Imposible por 1/1365.**

Las dos están medidas en `scripts/_probe_diast2025.mjs` y quedan declaradas en el código.

#### Lo que NO se usó de este documento

El **estudio de validación** `New-algorithm-for-estimating-left-ventricular-filling-pressure.
Circ-2025.pdf` de la misma carpeta **no se abrió ni se citó**: es un estudio, no una guía.

### Registradas SIN folio → NO verificadas al estándar del repo

Están en `IND_REFS`, pero su `full` **no tiene tabla ni página**. Sirven como referencia general;
**no se les puede colgar un corte** hasta leerlas y anotar folio.

| Clave | Documento | Ruta en disco | Qué hay que saber |
|---|---|---|---|
| `esc2023mioc` | ESC 2023, miocardiopatías | `.../11_Miocardiopatias/Arbelo_2023_Miocardiopatias.pdf` (probable) | sin folio |
| `esc2024ao` | ESC 2024, enfermedades aórticas y arteriales periféricas | `.../06_Aorta/Mazzolai_2024_Aorta.pdf` (probable) | incluye la tabla de recomendaciones modificadas, **donde los umbrales de 2014 quedan degradados a Clase IIa**; sin folio |
| `fop2019` | Pristipino C, et al. Documento de posición europeo sobre foramen oval permeable. *Eur Heart J* 2019;40:3182 | **no está en la biblioteca** al 2026-10-01 | ⚠️ **metodología GRADE: no usa las clases I/IIa/IIb de la ESC** — el nivel va en el `txt` con vocabulario GRADE, sin traducir a clases |

### ⚠️ «ESC/EACTS 2021» NO EXISTE EN ESTE REGISTRO — CERO ENTRADAS (censado 2026-10-11)

No está en `IND_REFS`, no tiene ruta en disco y nadie la leyó en texto completo. **No se le puede
colgar ningún corte ni nombrarla en un encabezado**, igual que las de arriba.
La guía valvular de la ESC que este repo SÍ verificó es la **ESC/EACTS 2025** (`esc2025vc`).

⚠️ **LA TARJETA DEL `score_eco` LA NOMBRA, Y NO ES UNA CUARTA VIOLACIÓN DE ESTA REGLA.** Lo que esa
tarjeta dice es que **la Tabla S3 declara estar reproducida** de la guía de 2021, y la referencia que
da es la **cita 6 del propio suplemento**, copiada de su lista. No se le cuelga ningún corte, no
encabeza nada y no entró a `IND_REFS`. La distinción es la misma que la casa ya aplica con la nota de
guías previas: **un documento nombrado en prosa va con su referencia** —porque un documento sin su
cita se lee como «hay una cita que no encontrás»— y eso no lo vuelve una fuente verificada. Al
2026-10-12 la ESC/EACTS 2021 **sigue en cero entradas verificadas en texto completo**.

Este archivo ya había retirado ese sello dos veces —el rótulo de la severidad integrada de IM
pasó de «(ESC 2021)» a «(ASE 2017)», y el de la EM dejó de decir «Severidad EM integrada
(ESC 2021)»— y el 2026-10-11 se retiró una tercera: el encabezado del cuadro de Válvulas decía
**«Categoría EM (ESC/EACTS 2021 · ASE 2023)»** y hoy dice **«Categoría EM (ASE 2023, Tabla 1)»**.
El comentario de `AVM_SEVERA_MAX` también la nombraba y se corrigió.

**Lo que QUEDA citando ESC/EACTS 2021 y NO se tocó** (fuera del alcance de esa tanda, cada uno es
contenido clínico de otro módulo y decisión de Maicol):

| Dónde | Qué dice | Qué habría que hacer |
|---|---|---|
| Pestaña Referencias, tarjeta de IT | encabezado visible «🟡 IT — Insuficiencia Tricuspídea (ESC 2021)» | decidir si pasa a ASE 2017 (`aseVr2017`, Tabla 14, folio 350, verificada) o a ESC/EACTS 2025 |
| Tarjeta del score de Wilkins / CMP | encabezado visible «CRITERIOS ANATÓMICOS ESC 2021» | la ESC/EACTS 2025 tiene la **Tabla 8 del folio 4682** verificada para contraindicaciones de la CMP; hay que leer si cubre estos criterios antes de reetiquetar |
| Pestaña Referencias, tarjeta de EM | prosa: «ESC/EACTS 2021 usa el mismo corte y lo llama…» | ver el reporte sin cambios de la tanda del 2026-10-11 |
| Comentario de la estenosis tricuspídea | «la EAE/ASE 2009 y la ESC/EACTS 2021 no gradúan la ET» | es un comentario, no una cita publicada |

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
