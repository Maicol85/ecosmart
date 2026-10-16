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


### eteQuirurgica2020 — ASE/SCA/STS 2020, la orientación de la vista del cirujano

**Documento:** Nicoara A, Skubas N, Ad N, et al. *Guidelines for the Use of Transesophageal
Echocardiography to Assist with Surgical Decision-Making in the Operating Room: A Surgery-Based
Approach*. J Am Soc Echocardiogr 2020;33(6). Archivo:
`14- ETE/TEE-Surgical-Decision-Making_June2020.pdf`.

⚠️ **LA REGLA DE FOLIO DE ESTE DOCUMENTO ES «página del PDF + 691», NO «+ 1».** Comprobado en el
pie impreso de TRES páginas: PDF 1 → **692**, PDF 4 → **695**, PDF 5 → **696**. Con el «+1» la cita
habría apuntado al folio 5, que en esa revista es otro artículo.

⚠️ **EL TEXTO NO SALE CON `pdftotext`** —devuelve 0 bytes— y se leyó con `pymupdf`. Lo mismo pasa
con los otros tres PDF de la carpeta `14- ETE`.

**VERIFICADO, folio 695 (PDF página 4):** la válvula mitral se orienta con la válvula aórtica
arriba, en la posición de las 12, mirada desde la aurícula izquierda o desde el ventrículo
izquierdo; e incluir la aórtica, el tabique interauricular o la orejuela en el volumen 3D ayuda a
orientarse, porque **el tabique interauricular queda junto a la comisura MEDIAL y la orejuela
junto a la LATERAL**. Parafraseado; no se copia el literal.

**Qué sostiene:** la corrección de los rótulos AL y PM de la vista quirúrgica de la mitral
(tanda Y3-1, 2026-10-16). En ese dibujo la orejuela está a la izquierda y A1/P1 también, así que
ahí va **AL**; PM queda a la derecha, del lado de A3/P3. Hasta esa tanda decían lo contrario, en
las DOS copias —el SVG de pantalla y el canvas que viaja al PDF—.

**Lo que este documento NO dice, y por eso no se citó para otra cosa:** no publica ningún corte de
severidad, ningún score ni ninguna regla de integración que esta app aplique.

---

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

#### Tabla 8 — IM, «Grading the severity of chronic MR», folio 332 — RE-LEÍDA el 2026-10-13

Leída en texto completo para contestar UNA pregunta: **¿los cortes de EROA, Vol-R y FR son los
mismos para PISA y para continuidad?** La respuesta es **a medias**, y la mitad que no lo es
importa.

| Fila de la tabla, LITERAL | ¿Califica el método? | Leve | Moderada | Severa |
|---|---|---|---|---|
| `EROA, 2D PISA (cm2)` | **SÍ — dice «2D PISA»** | `<0.20` | `0.20-0.29` · `0.30-0.39` | `$0.40` (≥0,40) |
| `RVol (mL)` | **no** | `<30` | `30-44` · `45-59` | `$ 60` (≥60) |
| `RF (%)` | **no** | `< 30` | `30-39` · `40-49` | `$50` (≥50) |

- ⚠️ **El Vol-R y la FR no están calificados por método**, así que sus cortes valen para los dos
  caminos sin ninguna salvedad.
- ⚠️ **El de la EROA SÍ está calificado**: la fila dice textualmente «EROA, 2D PISA (cm²)». La guía
  **no publica una banda propia** para una EROA obtenida por el método volumétrico.
- **Folio 312** define la fórmula general, que es exactamente la que usa la continuidad de la app:
  *«EROA can be calculated using the VTI of the regurgitant jet (VTI_RegJet) recorded by CWD as
  EROA = RVol/VTI_RegJet»*, dentro del apartado **b. Quantitative volumetric method**. O sea: la
  guía da la FÓRMULA para las dos y la BANDA sólo para una.
- **Consecuencia, declarada en `docs/PENDIENTES.md`:** aplicar la banda de la EROA de PISA a la
  EROA por continuidad es **criterio EcoSmart**, no una lectura de este documento. Es el lado
  conservador —no mueve ningún número y usa la misma `IM_CORTES` que ya existía— y es lo que la
  decisión de Maicol del 2026-10-13 pide («usando para continuidad el EROA, el Vol-R y la FR por
  continuidad en lugar de los de PISA»).
- ⚠️ **La tabla tiene CUATRO columnas de cuantitativos**, no tres: la moderada se subdivide
  (`0.20-0.29` / `0.30-0.39`), y la nota ‡‡ lo dice —*«Quantitative parameters can help subclassify
  the moderate regurgitation group»*—. `calcIM_ESC` tiene **tres** bandas y funde las dos del medio.
  Pre-existente, no se tocó.
- La nota ††: *«Discrepancies among EROA, RF, and RVol may arise in the setting of low or high flow
  states»* — es la guía diciendo que los tres pueden discordar, que es lo que la fila
  `im-discordancia` publica.
- ⚠️ **La tabla NO publica una regla de recuento de votos.** El pie dice *«Bolded qualitative and
  semiquantitative signs are considered specific for their MR grade»* y la nota * pide un
  *«integrated approach that weighs the strength of each echocardiographic measurement»*. La
  aritmética de `_imIntegrar` (`severa >= 1` basta, `moderada >= 2`) y la regla del **peor de los
  dos métodos** son **criterio de la app**. Queda declarado, igual que ya está declarado para la
  Tabla 14 de la IT.

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

### Las CINCO TARJETAS de los globos ⓘ de la mitral — fórmula y folio (verificadas 2026-10-14)

Las cinco se verificaron **en el PDF original**, que es la condición de parada de la tanda D1: si una
fórmula de la app difiriera de la guía, esa parte se dejaba sin hacer. **Ninguna difiere.**

| Tarjeta | Fórmula que la app aplica | Fuente verificada |
|---|---|---|
| **EROA por PISA** | `EROA = 2π·r²·V_aliasing ÷ Vmax del chorro` | ASE 2017 (Zoghbi), **folio 312**, literal: *«EROA = (6.28 × r² × Va)/PeakV_RegJet, where PeakV_RegJet is the peak velocity of the regurgitant jet by CWD»*. 6,28 = 2π |
| **Vol-R por PISA** | `Vol-R = EROA × VTI del chorro` | ASE 2017, **folio 312**: *«RVol = EROA × VTI_RegJet»* |
| **FR por PISA** | `FR = Vol-R ÷ (Vol-R + Vol eyectado TSVI)` | ASE 2017, **folio 311**: *«RVol = SV_RegValv − SV_CompValv; RF = RVol/SV_RegValv»*. En la IM la válvula regurgitante es la mitral, y su SV **es** `Vol-R + SV del TSVI`: el denominador de la app ES el de la guía |
| **EROA por continuidad** | `EROA = Vol-R ÷ VTI del chorro` | ASE 2017, **folio 312**, apartado *b. Quantitative volumetric method*: *«EROA = RVol/VTI_RegJet»* |
| **Vol-R por continuidad** | `Vol-R = Vol mitral/latido − Vol eyectado TSVI` | ASE 2017, **folio 311** (la misma definición general) |
| **FR por continuidad** | `FR = Vol-R ÷ Vol mitral/latido` | ASE 2017, **folio 311** |
| **Vol eyectado del TSVI** | `π·(Ø/20)² × VTI`, con el Ø en **mm** | EAE/ASE 2009 (Baumgartner), **folio 13**, §B.1.4 — es el **numerador** de la ecuación de continuidad de abajo |
| **AVm por THP** | `AVm = 220 ÷ THP` | EAE/ASE 2009, **folio 12**, §B.1.3: *«MVA is derived using the empirical formula: MVA ≈ 220/T½»*. También en la Tabla 8, p. 17 |
| **AVm por continuidad** | `AVm = Vol eyectado TSVI ÷ VTI mitral (CW)` | EAE/ASE 2009, **folio 13**, §B.1.4 |

⚠️ **LA ECUACIÓN DE CONTINUIDAD MITRAL SE LEYÓ RENDERIZANDO, y hay que decirlo.** El texto extraído
de ese PDF devuelve `'MVA \x02 \x05\x01' / 'D2' / '4\x02\x01' / 'VTIAortic' / 'VTImitral\x02'`, o
sea los glifos partidos y sin el símbolo. Renderizada a 700 dpi dice, literal:

> **MVA = π (D²/4) (VTI_Aortic / VTI_mitral)** — *«where D is the diameter of the LVOT (in cm) and
> VTI is in cm»*

**La app usa `π·(d/20)²·vti` con el diámetro en MILÍMETROS, que es exactamente `(π/4)·(d/10)²`:
COINCIDE con la guía, π/4 y conversión de mm a cm incluidas.** Es lo que la orden pedía verificar
antes de escribir la tarjeta del volumen eyectado, y es por lo que esa parte **no** se detuvo.

⚠️ **TRES SALVEDADES QUE LAS TARJETAS PUBLICAN, las tres literales de la fuente.**

- **PISA:** ASE 2017, folio 312 — *«since the PISA calculation provides an instantaneous peak flow
  rate, the EROA calculated by this approach may not be [representative]»*; la tarjeta lo dice en
  palabras propias: con un chorro que no ocupa toda la sístole la EROA sale sobreestimada.
- **THP:** EAE/ASE 2009, **p. 13** — *«the use of T1/2 in degenerative calcific MS may be unreliable
  and should be avoided»*. ⚠️ **Es más fuerte que «puede no ser confiable»: dice que DEBE EVITARSE**,
  y así va en la tarjeta, sin suavizar.
- **Continuidad mitral:** EAE/ASE 2009, **folio 14, §B.1.4** — *«The continuity equation cannot be
  used in cases of atrial fibrillation or associated significant MR or AR»*.
  **Folio comprobado en el pie impreso** de la página («14 · Baumgartner et al»), que es la regla
  de folio de este documento: folio = página del PDF, sin offset.
  ⚠️ **LA APP RETIRA EL VOTO CON IM O IAo SIGNIFICATIVA Y *NO* CON FIBRILACIÓN AURICULAR**
  (`emContMotivoNoVota` mira `im_grado` e `ia_grado` y nada más). **Sigue siendo así y es una
  decisión**: el 15/10/2026 (W1-7) entró **sólo un AVISO** de pantalla —`EM_CONT_FA_TXT`, en
  `#em-cont-fa-aviso`, ámbar, que sale cuando el ritmo efectivo es fibrilación auricular **y** hay
  un AVm por continuidad calculado— y el voto, el grado y las cuatro superficies firmadas quedaron
  **sin tocar**, medido. Cambiar cuándo vota un método es contenido clínico. El aviso publica la
  salvedad **de la guía**, que es lo que el médico necesita saber para leer el número; no afirma que
  la app la aplique. `docs/PENDIENTES.md` → **D1-4 y W1-7, los dos CERRADOS** en lo que la orden
  autorizaba, con el voto declarado como pendiente clínico.
  ⚠️ **LA ESC/EACTS 2025 NO LO CONTRADICE, y está censado el PDF completo.** Sus **tres** menciones
  de la ecuación de continuidad hablan de **flujo transmitral aumentado por IM** —Tabla 9, pág. 55:
  *«Continuity equation unreliable (increased transmitral flow)»*— y de flujos desiguales en
  valvulopatía múltiple (pág. 54); **ninguna nombra la fibrilación auricular** para el área mitral.
  O sea que la guía más nueva no deroga la salvedad: simplemente no la repite.

⚠️ **LA BANDA DE LA EROA POR CONTINUIDAD SIGUE SIENDO CRITERIO ECOSMART**, y la tarjeta lo dice: la
fila de la Tabla 8 está calificada «EROA, 2D PISA (cm²)» y la guía **no publica una banda propia**
para la EROA obtenida por el método volumétrico. Ya estaba declarado desde el 2026-10-13; lo nuevo es
que ahora se lee desde la app.

**Ninguna tarjeta copia una guía literalmente**: las nueve fórmulas son notación y los textos son
palabras propias.


### Las ONCE TARJETAS de los globos ⓘ de la tanda D2 — fórmula y folio (verificadas 2026-10-14)

Cuatro nuevas y siete reescritas. **Ninguna fórmula de la app difiere de su guía**, que es la
condición de parada de esta tanda. El mapa de la zona es `docs/mapa/valvulas-ia-it-pantalla.md`.

#### Las CUATRO nuevas

| Tarjeta | Fórmula que la app aplica | Fuente verificada |
|---|---|---|
| **IAo — EROA por PISA** | `EROA = 2π·r²·V_aliasing ÷ Vmax del chorro` | ASE 2017 (Zoghbi), **folio 312** — la misma fórmula general de PISA ya registrada arriba |
| **IAo — Vol-R** | `Vol-R = EROA × VTI del chorro` | ASE 2017, **folio 312**: *«RVol = EROA × VTI_RegJet»* |
| **IAo — FR** | `FR = Vol-R ÷ Vol eyectado del TSVI` | ASE 2017, **folio 311** (*«RF = RVol/SV_RegValv»*) + **Tabla 14, folio 339**, que da el método de la IAo: *«SV method: RVol = SV_LVOT − SV_MV»*. En la aórtica la válvula regurgitante **es** la aórtica y su SV se mide en el TSVI, así que el denominador es `vsv` SOLO y no `volR + vsv` como en la mitral |
| **IT — EROA y Vol-R** | las mismas dos de arriba, con la Vmax y el VTI de la IT | ASE 2017, **folio 312**; los cortes, **Tabla 14, folio 350** |
| **EAo — AVA por continuidad** | `AVA = π·(Ø/2)² × VTI_TSVI ÷ VTI_Ao`, con el Ø en cm | EAE/ASE 2009 (Baumgartner), **folio 6** y **folio 7** — ver abajo |
| **ET — AVT por continuidad** | `AVT = π·(Ø_TSVD/20)² × VTI_TSVD ÷ VTI_entrada` | EAE/ASE 2009, **Tabla 10 y su texto, folio 19** — ya registrada en «Estenosis TRICUSPÍDEA» más abajo |

⚠️ **LA FRACCIÓN REGURGITANTE DE LA IT NO EXISTE, NI EN LA APP NI EN SU TABLA.** `calcIT_ESC`
produce `eroa` y `volR` y nada más, e `itRefPintar` publica tres filas: vena contracta, EROA y
Vol-R. Y la **Tabla 14 del folio 350 no tiene fila de RF**: sus parámetros son VCW, EROA, RVol,
densidad del chorro por CW, radio PISA y área del jet color (ver su transcripción completa más
arriba). Por eso la columna 3 de esa lesión tiene DOS casillas y la tarjeta publica DOS fórmulas.
`docs/PENDIENTES.md` → **D2-1**.

#### La ecuación de continuidad AÓRTICA — leída RENDERIZANDO (2026-10-14)

El texto extraído de ese PDF pierde los operadores (`AVA  VTIAV  CSALVOT  VTILVOT`), así que la
página se renderizó. **Folio = página del PDF, sin offset**, comprobado en el pie impreso de la
página 7: «Baumgartner et al · 7 · Volume 22 Number 1».

> **Folio 6** — *«SV_AV = SV_LVOT»*, y de ahí **`AVA × VTI_AV = CSA_LVOT × VTI_LVOT`**, con el
> pie *«Solving for AVA yields the continuity equation»* y el cociente
> **`AVA = (CSA_LVOT × VTI_LVOT) / VTI_AV`**.
>
> **Folio 7** — **`CSA_LVOT = π (D/2)²`**, *«where D is diameter»*, y las tres mediciones que la
> ecuación exige: velocidad del chorro por CW, diámetro del TSVI y velocidad del TSVI por pulsado.

**La app coincide:** `_avaContinuidad(dMm, vtiTsvi, vtiAo)` hace `π·(d/20)² · t / a`, y `d/20` es
`(d/10)/2`, o sea el radio en cm del diámetro en mm. **No se movió ninguna operación.**

#### Las SIETE reescritas — ningún corte se movió

Sus textos largos vivían en el `title` de cada fila y se verificaron **contra la constante que la
app aplica**, no contra el recuerdo:

| Tarjeta | Cortes del texto | Constante de la app | Fuente |
|---|---|---|---|
| `im-vc` | 3 y 7 mm | `IM_CORTES.vc` | ASE 2017, Tabla 8, folio 332 |
| `im-jet-ai` | 20 y 40 % nativa · 20 y 50 % prótesis | `IM_CORTES.jet_nat` / `jet_prot` | ASE 2017 folio 332 · ASE 2024 Tabla 13 pág. 30 |
| `im-onda-e` | 120 cm/s | `UMBRAL_ONDA_E_APOYO_IM` | ASE 2017, Tabla 8, folio 332 |
| `im-vti-ratio` | 1,4 nativa · 2,5 prótesis | los dos umbrales de `calcIM_ESC` | ASE 2023 folio 12 · ESC/EACTS 2025 Figura 10 folio 4672 · ASE 2024 Tabla 12 pág. 28 |
| `prot-eoa` | 1,0 cm² | `VM_PROT_EOA_OBSTR_MAX` | ASE 2024, Tabla 11, pág. 27 |
| `prot-dvi` | 2,2 y 2,5 | `VM_PROT_DVI_NORMAL_MAX` / `_SIGNIF_MIN` | ASE 2024, Tabla 11, pág. 27 |
| `prot-ppm` | 1,2 / 0,90 y 1,0 / 0,75 cm²/m² | `VM_PROT_PPM_CORTES` | ASE 2024, Tabla 7, pág. 20 |

Las cuatro entradas de prótesis están transcritas en `docs/fuentes/FUENTES-protesis.md`.

⚠️ **LO QUE LA TARJETA NO REPITE NO SE PERDIÓ:** bajó a la pestaña «Referencia clínica» de la app,
en los bloques «Salvedades de los parámetros de apoyo» y «Prótesis mitral — ASE 2024». El detalle
del EOA, el DVI y el PPM mitrales **no estaba en ninguna otra superficie** antes de esta tanda.


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

### Estenosis AÓRTICA — los cortes por variable y por grado (verificados 2026-10-13)

**Prioridad aplicada** (la que fijó la orden): ESC/EACTS 2025 → ESC/EACTS 2021 → guía ASE/EACVI de
estenosis valvular → ACC/AHA. ⚠️ **La ESC/EACTS 2021 NO está en la biblioteca** (cero entradas
verificadas, ver la sección de más abajo), así que la segunda fuente real es la **EAE/ASE 2009**.

#### ESC/EACTS 2025 — folio 4663, §8.2.1 y §8.2.2 (PDF 29)

**Folio verificado en el pie impreso**, no por aritmética: la página termina en «4663».
Publica **sólo el grado SEVERO**, literal:

> *«High-gradient AS [mean gradient ≥40 mmHg, V max ≥4.0 m/s, AVA ≤1 cm² (or ≤0.6 cm²/m²)] is
> considered severe irrespective of LV function and flow conditions.»*

Y para el índice adimensional, en §8.2.2:

> *«The ratio of the LVOT to the AV Doppler jet velocity time integral (VTI, dimensionless index or
> velocity ratio) does not require calculation of LVOT area and may assist evaluation when other
> parameters are equivocal (<0.25 suggests that severe AS is highly likely).»*

⚠️ **NO publica banda de leve ni de moderada para ninguna variable.** Habla de «Non-severe AS» y de
«moderate stenosis» sin darles cortes. Por eso los dos grados inferiores salen de la 2009.
⚠️ **La planimetría por TC o RM tiene un corte PROPIO y distinto: 1,2 cm²** (nota ^f de la Figura 6,
folio 4664). No es el de la planimetría ecocardiográfica y **no se aplicó**.

#### EAE/ASE 2009 (Baumgartner) — **Tabla 3, p. 10**, «Recommendations for classification of AS severity»

**Folio = página del PDF, sin offset**, verificado en el pie impreso («10 Baumgartner et al»).
⚠️ **La tabla es una IMAGEN dentro del PDF**: el texto extraído trae el título y las notas al pie y
**ni un valor**. Se leyó **renderizando la página a 230 dpi**.

| Parámetro | Aortic sclerosis | Mild | Moderate | Severe |
|---|---|---|---|---|
| Aortic jet velocity (m/s) | ≤2.5 | 2.6–2.9 | 3.0–4.0 | >4.0 |
| Mean gradient (mmHg) | — | <20 (<30ᵃ) | 20–40ᵇ (30–50ᵃ) | >40ᵇ (>50ᵃ) |
| AVA (cm²) | — | >1.5 | 1.0–1.5 | <1.0 |
| Indexed AVA (cm²/m²) | — | >0.85 | 0.60–0.85 | <0.6 |
| Velocity ratio | — | >0.50 | 0.25–0.50 | <0.25 |

`ᵃ`ESC Guidelines · `ᵇ`AHA/ACC Guidelines.

⚠️ **EL GRADIENTE MEDIO TRAE DOS JUEGOS Y HAY QUE ELEGIR.** La columna sin superíndice es la de
**AHA/ACC** y la del paréntesis con `ᵃ` es la de la **ESC de 2009**. Se usa la de **AHA/ACC**, porque
su corte severo —40— es el que la **ESC/EACTS 2025 publica hoy**; tomar la columna ESC de 2009
pondría el corte severo en 50 y contradiría a la guía vigente, que es la primera de la prioridad.

⚠️ **«Velocity ratio» ES el DVI** de la app («DVI (ratio TSVI/Ao)»): el cociente de los dos VTI. La
misma p. 10 lo llama *«the dimensionless velocity ratio»* en el texto de la columna derecha.

#### Lo que la app aplica, variable por variable y grado por grado

| Variable | Sin / se abstiene | Leve | Moderada | Severa | Fuente del corte |
|---|---|---|---|---|---|
| **Vmax** | `<2,6` → `'sin'` | `2,6` a `<3,0` | `3,0` a `<4,0` | **`≥4,0`** | 2009 p.10 · severa ESC 2025 f.4663 |
| **G. medio** | `<20` → **se abstiene** | — | `20` a `<40` | **`≥40`** | 2009 p.10 (AHA/ACC) · severa ESC 2025 f.4663 |
| **AVA continuidad** | `≥1,5` → `'sin'` | — | `>1,0` y `<1,5` | **`≤1,0`** | ESC 2025 f.4663 · 2009 p.10 |
| **AVA planimetría** | `≥1,5` → **se abstiene** | — | `>1,0` y `<1,5` | **`≤1,0`** | ídem (los mismos predicados) |
| **AVA indexada** | `>0,85` → **se abstiene** | — | `>0,6` y `≤0,85` | **`≤0,6`** | 2009 p.10 · severa ESC 2025 f.4663 |
| **DVI** | `>0,50` → **se abstiene** | — | `0,25` a `0,50` | **`<0,25`** | ESC 2025 f.4663 · 2009 p.10 |

⚠️ **RE-VERIFICADO EL 2026-10-15 (tanda F, bloque F2), ANTES DE PUBLICAR EL GRADO DEL AVA
INDEXADA EN LA PANTALLA DE VÁLVULAS.** Lo que esa tanda hace es MOSTRAR el grado con el que el
criterio ya votaba desde el 2026-10-13: no mueve ningún corte ni ningún operador. Los dos números
que publica la fila salen de `EA_AVAI_SEV_MAX = 0.6` (`≤`, severa) y `EA_AVAI_MOD_MAX = 0.85`
(`≤`, moderada), que son exactamente los de la fila de arriba. **No hizo falta reabrir ningún
PDF**: el corte severo ya estaba verificado en la ESC/EACTS 2025, folio **4663**, con el folio
comprobado en el pie impreso, y el de moderada en la Tabla 3 de la EAE/ASE 2009, p. 10. Lo que sí
se midió por sus **tres tramos y su borde exacto** —0,55 · **0,60** · 0,61 · 0,93— es que la
pantalla publica el mismo grado que el voto.

⚠️ **NINGUNA VARIABLE SALVO LA Vmax VOTA «LEVE», Y NO ES UN OLVIDO.** La banda «Mild» de las otras
cinco **no tiene cota inferior que la separe de lo NORMAL**: un gradiente de 3 mmHg, un DVI de 0,9,
un área de 3,5 cm² y un AVA indexada de 1,8 son los de un corazón sano y caen todos en esa columna.
La propia p. 10 dice, en el texto de al lado: *«A normal AVA in adults is ∼3.0–4.0 cm²»*. Votar
'leve' ahí pondría «EAo leve.» en el informe firmado de todo paciente al que se le mida el área.
**La Vmax es la única con techo de normalidad publicado** —la columna «Aortic sclerosis», `≤2,5`—
y por eso es la única que puede votar esa banda. Las otras cinco devuelven `null`, que es «este
criterio no se pronuncia». Declarado en `docs/PENDIENTES.md`.

⚠️ **LA GUÍA NO APLICA LOS MISMOS CORTES A LAS TRES FORMAS DE MEDIR EL AVA**, y la orden pedía
verificarlo. La Tabla 3 escribe «AVA (cm²)» sin calificar el método, pero el **§B.2.3 de la p. 8**
dice que la planimetría mide el área **anatómica** y cierra con: *«as stated previously, effective,
rather than anatomic, orifice area is the primary predictor of outcome»*; y la presenta como *«an
acceptable alternative when Doppler estimation of flow velocities is unreliable»* — o sea una
alternativa, no un votante paralelo. **Se aplican los de la Tabla 3 porque son los únicos publicados
para planimetría ecocardiográfica**, y como el área anatómica es sistemáticamente mayor que la
efectiva, con esos cortes la planimetría tiende a SUBESTIMAR la severidad, que es la dirección
conservadora para una variable que sólo puede agravar.

⚠️ **EL `'sin'` DEL AVA POR CONTINUIDAD NO SE COPIÓ A LA PLANIMETRÍA.** El AVA por continuidad es el
único de los seis criterios que **afirma ausencia** de estenosis (`≥1,5` → `'sin'`); es su
comportamiento vigente y el médico lo confirma en su reporte. Un área **anatómica** de 2,0 cm² no
puede afirmar lo mismo, por lo que acaba de decirse.

#### Estenosis TRICUSPÍDEA — **Tabla 10, p. 19** de la misma guía

**Folio verificado en el pie impreso** («Baumgartner et al 19»). Tabla también **leída de la imagen**.

> **Specific findings** — Mean pressure gradient **≥5 mmHg** · Inflow time-velocity integral
> **>60 cm** · T½ **≥190 ms** · Valve area by continuity equation ᵃ **≤1 cm²**
> **Supportive findings** — Enlarged right atrium ≥moderate · Dilated inferior vena cava

Nota `ᵃ`: *«Stroke volume derived from left **or** right ventricular outflow. In the presence of more
than mild TR, the derived valve area will be underestimated. Nevertheless, a value ≤1 cm² implies a
significant haemodynamic burden imposed by the combined lesion.»*

Y el texto de la misma página: *«the continuity equation should provide a robust method for
determining the effective valve area as **SV divided by the tricuspid inflow VTI as recorded with
CWD**»*.

**La fórmula de la app es exactamente ésa** y **no se tocó**: `π · (Ø_TSVD/20)² · VTI_TSVD /
VTI_entrada`, con el diámetro en **mm** (el `/20` pasa a cm y saca el radio en un paso) y los dos VTI
en **cm**. Verificada por recálculo a mano de tres casos, que coincide dígito por dígito con la app.

✅ **EL CRITERIO «Inflow time-velocity integral >60 cm» VOTA DESDE EL 2026-10-13** (decisión de
Maicol: «si está en la guía, vota»). Hasta ese día el campo existía (`et_vti_diast`) y se usaba
sólo como denominador del área; era el punto **A-5** de `docs/PENDIENTES.md`, que queda cerrado.

**La EAE/ASE 2009 escribe `>` ESTRICTO**, y eso se leyó de la IMAGEN de la tabla —es un bitmap
dentro del PDF y el texto extraído se come los glifos `≥`/`≤`, que es la trampa que este archivo ya
documenta para Baumgartner 2009 y Wilkins 1988—, con el folio comprobado en el **pie impreso** de la
página («Baumgartner et al 19»). Los cuatro renglones, tal como están impresos:

| hallazgo específico | corte impreso |
|---|---|
| Mean pressure gradient | **≥5 mmHg** |
| Inflow time-velocity integral | **>60 cm** |
| T½ | **≥190 ms** |
| Valve area by continuity equation ᵃ | **≤1 cm²** |

O sea que la guía escribe los cuatro con cuidado y **el del VTI es el único estricto**.

### ⚠️ EL OPERADOR DEL VTI DE ENTRADA SE DIO VUELTA EL 2026-10-14, Y GANA LA GUÍA MÁS NUEVA

**Decisión de Maicol («VTI de entrada mayor o igual a 60»).** La app aplica **`>= 60 cm`** desde esa
fecha, así que **60,0 exactos SÍ afirman**, y antes no.

La fuente es la **ASE 2023** — Pandian et al, *Echocardiographic Evaluation of Rheumatic Heart
Disease*, JASE enero 2023 — **folio 16**, verificado en el **encabezado impreso** de la página
(«16 · Pandian et al · Journal of the American Society of Echocardiography · January 2023») y leído
**renderizando la página a 600 dpi**:
> «TS is considered to be severe if the mean gradient is **≥5 mmHg, inflow VTI ≥60 cm, PHT ≥190 ms,
> and TVA ≤1 cm²**. TS is considered to be mild with a TVA **>1.5 cm²**…»

Los cuatro con el igual, y la **misma oración distingue los glifos**: dos renglones más abajo escribe
`>1.5 cm²` con un `>` pelado. O sea que el `≥` de los cuatro primeros es deliberado.

⚠️ **EL TEXTO EXTRAÍDO DE ESE PDF NO SIRVE PARA LEER EL OPERADOR, Y NO ES PORQUE SEA UNA IMAGEN.**
La fuente codifica `≥` como **`$`** y `≤` como **`#`**, así que `pdftotext` devuelve «the mean
gradient is $5 mmHg, inflow VTI $60 cm, PHT $190 ms, and TVA #1 cm2». Quien lo lea así concluye que
la guía no escribe operador. Hay que **renderizar**, igual que con Baumgartner 2009 y Wilkins 1988,
pero por otra causa: allá la tabla es un bitmap, acá es la codificación de la fuente.

**Los otros tres cortes siguen saliendo de la EAE/ASE 2009** —coinciden en los cuatro valores y en
tres de los cuatro operadores— así que `ET_CRIT_FUENTE` **suma** «ASE 2023» y no reemplaza nada.

⚠️ **Y NO HAY UNA GUÍA MÁS NUEVA QUE LO CONTRADIGA.** Censadas las dos de 2025 de la biblioteca
—ESC/EACTS 2025 y Praz 2025—: **ninguna nombra el VTI de entrada tricuspídeo** como criterio; las
únicas apariciones de «VTI» en ellas son las listas de abreviaturas. Verificado por barrido de los
dos PDF completos.

⚠️ **LA ESC/EACTS 2025 NO LO CONTRADICE: NO LO NOMBRA.** Su §12.2 (**folio 4688**) publica un solo
número para la estenosis tricuspídea entera:
> «A mean diastolic transvalvular gradient of **>5 mmHg** at a normal heart rate indicates severe TS.»

No menciona el VTI de entrada, y tampoco el T½ ni el área que la app ya votaba desde antes, así que
su silencio no distingue a este criterio de los otros tres. Por eso esta parte **no se detuvo**.
⚠️ Y de paso: esa guía escribe el gradiente con **`>5`** donde la app aplica **`>=5`**, lo que
`index.html` ya declara en su propio comentario. **No se tocó** — es otra fuente y otro trabajo.

#### Fuente SECUNDARIA — el Word de criterios de Cowork

`~/Desktop/EcoSmart_Biblioteca_Fuentes/EcoSmart_Criterios_Academicos_1-18.md`, §7.3.6. **Coincide con
el original en los cuatro cortes de severidad** (gradiente medio ≥40, Vmáx ≥4,0, AVA ≤1,0, AVA
indexada ≤0,6) y en el de la planimetría por TC/RMC (1,2 cm²). **No publica cortes de leve ni de
moderada** para la EAo, así que esos dos grados salen sólo del original de 2009. No hubo que
reportar ninguna divergencia.

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

- ✅ **Y DE ACÁ SALE EL OPERADOR DEL VTI DE ENTRADA TRICUSPÍDEO** desde el 2026-10-14 (**folio 16**,
  verificado en el encabezado impreso, leído renderizando a 600 dpi): *«TS is considered to be severe
  if the mean gradient is ≥5 mmHg, inflow VTI ≥60 cm, PHT ≥190 ms, and TVA ≤1 cm²»*. Ver la sección
  «Estenosis TRICUSPÍDEA» más arriba, donde está la comparación con la EAE/ASE 2009.
  ⚠️ **El texto extraído de este PDF codifica `≥` como `$` y `≤` como `#`**, así que `pdftotext` no
  sirve para leer sus operadores. Hay DOS copias del artículo en la biblioteca —`Reumatic
  Disease.pdf` (28 págs.) y `ASE Enf Reumatica.pdf` (26 págs.)— con el **mismo texto** en esa página;
  la regla de folio `PDF + 2` vale para las dos.

### ⚠️ «Estenosis mitral severa de BAJO GRADIENTE» — ESC/EACTS 2025, **folio 4680** (verificado 2026-10-14)

Leído renderizando la página, con el folio comprobado en el **encabezado impreso**:
> «Treatment of patients with **low-gradient severe MS (MVA <1.5 cm², mean gradient <10 mmHg)** is
> challenging, because these patients are often older and have unfavourable anatomy.»

**Dónde se usa:** reemplaza a la atribución «la propia ESC 2021» que tenía la tarjeta «Referencia
clínica» de la estenosis mitral — **este archivo no tiene ninguna entrada de ESC/EACTS 2021**, así
que esa cita no estaba verificada al estándar de la casa. El concepto es el mismo y acá sí tiene
documento, folio y frase.

⚠️ **ESA GUÍA ESCRIBE `<1.5` ESTRICTO Y LA APP APLICA `≤1,5`.** El corte de la app sale de la ASE
2023 (arriba) y de la ACC/AHA 2020, y **no se tocó**. La frase sólo sostiene que la estenosis severa
de bajo gradiente existe y se gradúa por el área, que es lo que el texto de la ayuda afirma.

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

### Los NOMBRES de los rangos de área de la estenosis mitral, guía por guía (verificados 2026-10-14)

Censo pedido para decidir cómo rotular las categorías del Laboratorio. **Las cuatro guías de la
biblioteca se abrieron de nuevo y el folio está comprobado en el pie impreso**, no por aritmética.

| Guía | Folio | Cómo rotula los rangos de ÁREA | Gradiente medio |
|---|---|---|---|
| **ASE 2023** (Pandian), Tabla 1 «Classification of Mitral Stenosis Severity» | **8** (pág. 6 del PDF; folio = pág + 2) | **«Progressive»**, que agrupa **«(Mild)»** `>2,5` y **«(Moderate)»** `2,5–1,6`, y **«Severe»** `≤1,5` | `<5` / **`5–9`** / **`≥10`**, «at a heart rate of 60-80 beats per minute» |
| **EAE/ASE 2009** (Baumgartner), Tabla 9 «Recommendations for classification of mitral stenosis severity» | **17** (sin offset; pie «Baumgartner et al 17») | **«Mild»** `>1,5` · **«Moderate»** `1,0–1,5` · **«Severe»** `<1,0` | `<5` / `5–10` / `>10`, como **«Supportive findings»** |
| **ESC/EACTS 2025**, §10.2.1 y título de la Figura 14 | **4680** / **4681** | un solo corte: `MVA ≤1,5 cm²` = **«clinically severe MS»**. **No publica bandas por área.** | no las usa como grado |
| **ACC/AHA 2020** (Otto), Tabla 16 «Stages of MS» | **e113** (pie impreso «e113»; folio = idx 0-based + 72) | estadio **B «Progressive MS»** `>1,5` · estadios **C/D «severe MS»** `≤1,5` | el texto dice que `≤1,5` «typically corresponds to a transmitral mean gradient of >5 mm Hg to 10 mm Hg at a normal heart rate» |

**Las tres premisas con que se pidió el trabajo, medidas:**

1. ⚠️ **«La ESC llama *clínicamente significativa* a ≤1,5» es FALSO.** La guía escribe
   **«clinically severe MS»** (folio 4680, literal arriba). Barrido del PDF completo: *«clinically
   significant»* aparece **12 veces y NINGUNA sobre la estenosis mitral** —son fuga paravalvular,
   IM funcional y trombosis de prótesis—.
2. ✅ **«La EAE/ASE 2009 llamaba *moderada* a 1,0–1,5 y *severa* a <1,0» es CIERTO**, verificado
   **renderizando** la Tabla 9: sus valores son una imagen y el texto extraído no los trae.
3. ⚠️ **«La ACC/AHA llama *muy severa* a ≤1,0» es FALSO: esa categoría NO EXISTE para la EM.**
   Censo del documento completo: *«very severe»* aparece **11 veces y ninguna sobre la mitral**
   —son estenosis aórtica o títulos de la bibliografía—; *«moderate MS»* sólo en referencias
   bibliográficas. Sus nombres son «Progressive» y «severe».

**Por qué las categorías del Laboratorio llevan el RANGO y no un nombre de guía.** El mismo
**1,2 cm²** es **«moderada»** para la EAE/ASE 2009 y **«severa»** para la ASE 2023, la ACC/AHA 2020
y la ESC/EACTS 2025. Y el **1,6–2,5 cm²** que la ASE 2023 llama «Progressive (Moderate)» es, para
la EAE/ASE 2009, **«Mild»**. Un rótulo con nombre de grado habría que atribuirlo a una guía, y
cualquiera de las cuatro desmiente a otra. Por eso los rótulos son «Significativa, AVm ≤1,0 cm²» y
«Significativa, AVm >1,0 a ≤1,5 cm²», que es lo que la app midió. **Ningún corte se movió.**

⚠️ **UNA DIFERENCIA ENTRE LAS DOS FUENTES DEL GRADIENTE, DECLARADA Y NO TOCADA.** La app aplica
`≥5` y `≥10`, que son los de la **ASE 2023** —`5–9` y `≥10`, los mismos operadores—. La **EAE/ASE
2009** escribe `5–10` y `>10`, así que para ella un **10 exacto** es la banda intermedia y para la
ASE 2023 es significativa. La app sigue a la ASE 2023, que es más nueva y es la que la regla
vigente cita. `docs/PENDIENTES.md` → L5.

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
| **555** · Parámetros suplementarios, literal del inciso b | «the presence of an L-wave velocity **$50 cm/s** is an indicator of both impaired LV relaxation and elevated LAP» (el `$` es el glifo de `≥` en la fuente del PDF). La nota ‡ de la Figura 3 lo escribe igual: `mitral inflow L-wave velocity $ 50 cm/s` | **operador `>=`, verificado en los DOS lugares**; es `ASE_ONDAL_SUPL` |
| **554** · Figura 3, caja del segundo paso | `If none available or reliable use Supplemental methods‡` — y la prosa del mismo folio: «Supplemental Parameters: these can be relied on in the absence of the three parameters in the section above» | **ésa es la ÚNICA puerta** a los suplementarios: segundo paso sin NINGUNO de sus parámetros |
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

⚠️ **EL S/D VENOSO PULMONAR SÍ ES EVALUABLE EN FA, Y DESDE EL 2026-10-12 TAMBIÉN EN RITMO
SINUSAL.** El corte de la Figura 3 es **≤ 0,67** y el de la Figura 8 es **< 1**: es el mismo campo
con dos cortes distintos. El `<select>` tiene desde entonces tres opciones —«≤0,67», «>0,67 y <1» y
«≥1»— precisamente porque con las dos de antes («<1» / «>1») el ≤ 0,67 era inexpresable: un S/D de
0,9 es «<1» y no lo cumple. El tramo del medio es lo que separa los dos cortes.
⚠️ **Y DESDE EL 2026-10-13 NO HAY OPCIONES DE LEGADO.** Las dos del selector viejo vivían ocultas
para que un estudio guardado conservara su valor; se eliminaron por decisión del médico —no hay
ningún estudio guardado con el S/D cargado— y porque **Safari las mostraba**: esconder una
`<option>` con `hidden` termina siendo un `display:none`, y un desplegable nativo no está obligado
a respetar el layout de sus propias opciones. Los cortes y sus operadores **no se tocaron**.

### `bseDiast2024` — BSE 2024, RITMO SINUSAL · Tabla 2 y Figuras 17 y 18 (verificadas 2026-10-12)

**Documento.** Robinson S y cols., *Echo Research & Practice* 2024;11:16. Ruta en disco:
`~/Desktop/EcoSmart_Biblioteca_Fuentes/02_Diastolica/Robinson_2024_Diastolica_BSE.pdf`
(55 páginas; **se pagina por «Page N of 55», no por folio de revista**: el folio es la página
1-based del PDF, sin offset).

**Fuente secundaria consultada y CRUZADA:** `COMPARATIVA_funcion_diastolica_2016_2024_2025.md`
del Escritorio. Cada corte se verificó en el original; la comparativa coincide en todos los que
esta tanda usa (su fila 5 ya escribe el strain con `≥` y con «o», igual que las figuras).

---

#### Tabla 2 (pág. 13) — e′ septal y lateral por EDAD y SEXO

Es una tabla de **TEXTO** en el PDF, no una imagen. Pie literal: «Any value below that stated
within the table is suggestive of impaired LV relaxation».

| Edad | 18-40 M | 18-40 F | 41-65 (ambos) | > 65 (ambos) |
|---|---|---|---|---|
| **e′ septal** | < 7,0 | < 8,0 | < 5,0 | < 4,0 |
| **e′ lateral** | < 9,0 | < 11,0 | < 6,0 | < 5,0 |

- **El operador es `<` en los ocho valores**: un e′ septal de 5,0 exacto a los 50 años es NORMAL.
- **La combinación es un OR**: alcanza con que UNO de los dos anillos caiga bajo su corte. No hay
  corte de promedio — la tabla no lo da.
- **El sexo sólo mueve el corte en 18-40 años.** En 41-65 y en > 65 la tabla tiene una sola
  columna («All»), así que ahí la falta de sexo no impide valorar el e′.
- **La tabla arranca en los 18 años** y no tiene fila pediátrica: por debajo de esa edad no hay
  corte y la app no extrapola el del adulto joven.
- ⚠️ **ESTOS CORTES NO SON LOS DE LA ASE 2025.** La Tabla 6 del folio 553 de la ASE corta en 40 y
  65 años y no mira el sexo (≤6 / ≤7 / ≤6,5, y < 6 septal para > 65). El «5,0» coincide por
  casualidad. Medido con el mismo e′ (septal 6,5 / lateral 8,5): ALTERADO a los 30 años y NORMAL
  a los 50.

**Prosa de la pág. 13, verificada y relevante:** «an e′ below the age-specific cut-off is
therefore considered an indicator of impaired LV relaxation. However, due to the wide range of
normal e′ […] a value greater than the age-specific cut-off does not confirm normal LV
relaxation.» Es lo que respalda que el e′ **no** se consulte del lado de la presión elevada.

---

#### E/e′ — pág. 14 (texto, no figura)

«an average of septal and lateral E/e′ > 14 is highly specific for a PCWP of > 15 mmHg»; y,
aparte, «Where only a single site measure is possible or valid, a lateral ratio > 13 or septal
ratio > 15 may be used».

⚠️ **NO SON TRES ALTERNATIVAS EN OR**, a diferencia de la Figura 3 de la ASE 2025: los cortes por
sitio **reemplazan** al promedio cuando falta un anillo. Con los dos anillos manda el promedio y
nada más.

---

#### Figura 17 (pág. 36) — FEVI normal · **LEÍDA DE LA IMAGEN**

⚠️ **ES UNA IMAGEN DENTRO DEL PDF**: el texto extraído sólo trae el pie. Se leyó renderizando la
página 36 a 200 dpi y mirando las cajas, y cada corte se cruzó contra la prosa de las págs. 35-36.

Banda de variables principales, **literal de la figura**:
`Avg E/e' >14  —  LA volume >34 mL/m²  —  TR velocity >2.8 m/s`

| Rama | Condición | Resultado |
|---|---|---|
| izquierda | **2 o 3 criterios negativos** | → paso del e′ por edad |
| derecha | **2 o 3 criterios positivos** | → **Impaired diastolic function with elevated filling pressures** |
| centro | **sólo 2 disponibles, 1 positivo y 1 negativo** | → strain de la AI |

**Strain de la AI (rama del centro), cajas de la figura en orden:**
1. `Assess LA strain: pump strain ≥14% OR reservoir strain ≥30%` → **Sí** → paso del e′.
2. `LARs <18%` → **Sí** → presión elevada.
3. `Assess supplementary parameters: Ar-A duration >30 ms · L-wave >20 cm/s` → **≥1 positive** →
   presión elevada; **No** → paso del e′.

**Paso del e′:** `Assess relaxation by age-specific e'` → `Normal e'` → **Normal diastolic
function**; `e' <LLN` → **Impaired diastolic function with normal filling pressures** (y de ahí
una caja que sugiere eco de esfuerzo si está clínicamente indicado).

⚠️ **LA FIGURA Y LA PROSA NO DICEN LO MISMO EN EL STRAIN, Y LOS DOS TEXTOS ESTÁN IMPRESOS.** La
caja dice `pump strain ≥14% OR reservoir strain ≥30%`; la prosa de la pág. 35 dice «high-normal
values of LARs (> 30%) and LAPs (> 14%)» — con `>` y con «and». **Gana la figura**, que es el
algoritmo que la app ejecuta.

⚠️ **Y LA BANDA GRIS DE LA PROSA TIENE UN HUECO QUE LA FIGURA CIERRA.** La prosa manda a los
suplementarios «when LARs falls within a range of 19–29%», o sea que deja sin rama el tramo
18,0-19,0. La figura no tiene bandas: pregunta `LARs <18%` y si la respuesta es no va a los
suplementarios.

⚠️ **LA FIGURA 17 NO DIBUJA NINGUNA CAJA DE «INDETERMINADA».** Ese estado sale de la **prosa del
folio 36**: «in those with one positive and one negative key variable and where LA strain
analysis is not possible, the assessment of LVFP is indeterminate».

**El orden es PRESIÓN primero y e′ al final** (folio 35): «the assessment of LVDF in those with
normal systolic function must start with the assessment of LVFP».

**Exclusiones (pie de la Figura 17):** «severe MR/MS or MAC or MV replacement or repair».

---

#### Figura 18 (pág. 38) — FEVI reducida o cardiopatía conocida · **LEÍDA DE LA IMAGEN**

Entrada, literal de la caja: `LVEF <50% OR GLS <16% OR known myocardial disease` →
`Diastolic function is impaired, assess filling pressure`.

Las **mismas tres variables principales** y la misma regla de 2 o 3. El e′ **no se consulta**:
pág. 37, «As impaired relaxation has been established, age-specific e′ are not considered».

**Strain de la AI de ESTA figura (cortes distintos de los de la 17):**
1. `LARs <18% OR LAPs <8%` → **Sí** → presión elevada.
2. `LARs ≥24% OR LAPs ≥14%` → **Sí** → presión normal.
3. `Assess supplementary parameters: Ar-A duration >30 ms · L-wave >20 cm/s · PV S/D ratio <1 ·
   DT_E <150 ms` → **≥1 positive** → elevada; **No** → normal.

⚠️ **EL 24 Y EL 8 NO EXISTEN EN LA FIGURA 17**, y el 18 coincide por casualidad: las dos ramas no
comparten constantes. ⚠️ **Y EL TDE DE ESTA FIGURA ES `< 150`**, no el `≤ 160` de la Figura 19 de
la FA de esta misma guía.

⚠️ **EL S/D VENOSO PULMONAR SÍ VOTA ACÁ.** El corte es `< 1`, que es exactamente lo que dice la
opción del `<select>` de la app — al revés que en la Figura 3 de la ASE 2025, cuyo `≤ 0,67` ese
control no puede expresar.

**Dos cajas finales y ninguna indeterminada dibujada**; la indeterminada sale de la prosa de la
pág. 37: «LV relaxation is therefore impaired but with indeterminate LVFP».

**Exclusiones (pie de la Figura 18):** «LBBB, RV apical pacing or resynchronisation pacing (CRT);
LV assist devices».

---

#### Zona gris de FEVI y GLS — pág. 35 (texto)

«Systolic function is considered impaired when either LVEF is < 50% or absolute GLS < 16%,
whereas LVEF ≥ 55% and GLS ≥ 18% are consistent with normal systolic function. There exists,
therefore, a grey-zone of LVEF (50–54%) and GLS (16.0–17.9%)», y la guía **no la resuelve con un
número**: «LVEF and GLS cannot provide binary normal/abnormal cut-offs for systolic function».

---

#### Sin grados

La BSE **abandonó los grados I-III** (pág. 48, recogido también por la comparativa). Ninguna de
sus cuatro categorías lleva número.

#### Strain de la AI y onda L — RE-VERIFICADO el 2026-10-12 renderizando las dos páginas

La tanda que les dio campo volvió a leer las Figuras 17 y 18 **de la imagen**, a 200 dpi, antes de
cablear nada. **No se movió ni un corte ni un operador** respecto de lo registrado arriba: las
cajas dicen literalmente lo que esa lectura anotó. Queda la tabla junta, que es como se usa:

| Figura | Caja | Literal impreso | En la app |
|---|---|---|---|
| **17** (pág. 36) | strain, lado normal | `Assess LA strain: pump strain ≥14% OR reservoir strain ≥30%` | `BSE_LAPS_NORMAL` 14 (`>=`) **OR** `BSE_LARS_NORMAL` 30 (`>=`) |
| **17** | strain, lado elevado | `LARs <18%` | `BSE_LARS_ELEVADA` 18 (`<`) |
| **17** | suplementarios | `Assess supplementary parameters: Ar-A duration >30 ms · L-wave >20 cm/s` → `≥1 positive` | `BSE_ARA_SUPL` 30 (`>`) · `BSE_ONDAL_SUPL` 20 (`>`) |
| **18** (pág. 38) | strain, lado elevado | `LARs <18% OR LAPs <8%` | `BSE_FR_LARS_ELEV` 18 (`<`) **OR** `BSE_FR_LAPS_ELEV` 8 (`<`) |
| **18** | strain, lado normal | `LARs ≥24% OR LAPs ≥14%` | `BSE_FR_LARS_NORM` 24 (`>=`) **OR** `BSE_FR_LAPS_NORM` 14 (`>=`) |
| **18** | suplementarios | `Ar-A duration >30 ms · L-wave >20 cm/s · PV S/D ratio <1 · DT_E <150 ms` → `≥1 positive` | los cuatro, con `BSE_FR_TDE_SUPL` 150 (`<`) |

**«LAPs» es el strain de CONTRACCIÓN** (*pump strain*), que en la app es `ai_strain_ct`. Las dos
figuras escriben sus cortes sobre la MAGNITUD, así que la app usa el **valor absoluto**
(`diastStrainAbs`): los ecógrafos dan ese strain negativo. El LARS no pasa por ahí.

⚠️ **El 14 de la Figura 18 coincide con el de la 17 por casualidad**, igual que el 18 del lado
elevado: el 8 y el 24 no existen en la Figura 17. Las dos figuras **no comparten ni una
constante**, y la Figura 19 de la FA tampoco (LARS < 16).

#### Strain de CONDUCTO — NO ENTRA EN NINGÚN ALGORITMO (censado 2026-10-12)

Barrido de los dos PDF completos buscando `conduit`. En la **BSE 2024**, 13 apariciones y
**todas** son el *volumen* de conducto en la sección de fisiología de la pág. 7 («LA conduit
volume = LVSV − LA reservoir volume»); el strain de conducto no aparece. En la **ASE 2025**, 3
apariciones y las tres están en la **pág. 10 del PDF (folio 546)**: el protocolo de adquisición
(«Use R-R gating method to provide reservoir, conduit, and contractile LA strain values») y la
tabla de abreviaturas (`LAScd = S_CD, LA conduit strain`). **Ningún algoritmo lo usa**, así que el
campo `ai_strain_cd` es de registro: se guarda con el estudio, no vota y no tiene columna de Excel.

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

#### Licencia de acceso abierto — VERIFICADA EN EL PDF (2026-10-13)

Leida en el pie de la **pagina 1** del PDF, literal: «© The Author(s) 2024. Open Access  This
article is licensed under a **Creative Commons Attribution 4.0 International License**, which
permits use, sharing, adaptation, distribution and reproduction in any medium or format, **as long
as you give appropriate credit to the original author(s) and the source, provide a link to the
Creative Commons licence, and indicate if changes were made**. The images or other third party
material in this article are included in the article's Creative Commons licence, unless indicated
otherwise in a credit line to the material. […] To view a copy of this licence, visit
http://creativecommons.org/licenses/by/4.0/.»

**Si exige atribucion: si.** Las tres condiciones son credito al autor y a la fuente, enlace a la
licencia, e indicar si hubo cambios. Las imagenes del articulo —las Figuras 17, 18 y 19 entre
ellas— **estan incluidas** en esa licencia, porque ninguna lleva una linea de credito aparte.

⚠️ **O SEA QUE REPRODUCIR LA FIGURA SERIA LEGITIMO, Y AUN ASI EL DIBUJO DE LA APP ES PROPIO.** Lo
que la app dibuja tiene otra disposicion, otras palabras —no copia el literal de ninguna caja— y
los valores del paciente adentro, que el original no tiene. El pie de cada diagrama nombra la
figura, la pagina, la licencia y declara que es un redibujo, que cubre las tres condiciones.

#### Las tres figuras, caja por caja y flecha por flecha — RE-LEIDAS DE LA IMAGEN (2026-10-13)

Renderizadas a 200 dpi para dibujar el diagrama de la ventana. **No se movio ni un corte ni un
operador** respecto de lo registrado arriba: lo que esta lectura agrega es la TOPOLOGIA, que la
tabla de cortes no guarda.

**Figura 17 (pag. 36) — entrada «Normal LV systolic function».** De la banda de tres variables
salen TRES ramas: `2 or 3 criteria negative` (izquierda), `Only 2 criteria available: 1 positive and
1 negative` (centro) y `2 or 3 criteria positive` (derecha). La del centro baja a
`Assess LA strain: pump strain >=14% OR reservoir strain >=30%`; su **si** va al paso del e' y su
**no** a `LARs <18%`, cuyo **si** va a la casilla roja y cuyo **no** va a
`Assess supplementary parameters`, de donde `>=1 positive` va a la roja y `No` al paso del e'. El
paso del e' (`Assess relaxation by age-specific e'`) tiene dos salidas: `Normal e'` →
**Normal diastolic function** y `e' <LLN` → **Impaired diastolic function with normal filling
pressures**, que a su vez apunta a una caja de eco de esfuerzo. La rama derecha va directo a
**Impaired diastolic function with elevated filling pressures**. ⚠️ **No hay ninguna caja de
indeterminada dibujada**: ese estado sale de la prosa del folio 36.

**Figura 18 (pag. 38).** Entrada `LVEF <50% OR GLS <16% OR known myocardial disease` →
`Diastolic function is impaired, assess filling pressure` → la misma banda de tres variables con
las mismas tres ramas. La del centro baja a `Assess LA strain` → `LARs <18% OR LAPs <8%` (**si** →
roja) → `LARs >=24% OR LAPs >=14%` (**si** → normal) → `Assess supplementary parameters` (cuatro
criterios; `>=1 positive` → roja, `No` → normal). **No hay paso del e'** y **no hay caja de
indeterminada dibujada**.

**Figura 19 (pag. 39).** Encabezado `Atrial Fibrillation / For use in all AF patients, irrespective
of LV systolic function / Heart rate <100 bpm; ideally use index beat method`. Banda `STEP 1` con
sus cuatro criterios y tres salidas: `>=3 criteria negative`, `Insufficient STEP 1 criteria for
decision` y `>=3 criteria positive`. La del medio baja a la banda `STEP 2`, que tiene sus tres
salidas: `>=2 STEP 2 criteria negative`, `Insufficient STEP 2 criteria` y `>=2 STEP 2 criteria
positive`. Las casillas finales son **Normal filling pressures**, **Indeterminate filling
pressures** e **Impaired diastolic function with elevated filling pressures**.
⚠️ **LA BANDA DEL PASO 2 ES MAS ANGOSTA QUE LA DEL PASO 1, Y NO ES UN DETALLE DE MAQUETA**: las dos
flechas largas —la de «>=3 negativos» y la de «>=3 positivos»— bajan POR FUERA de ella hasta sus
casillas. Si se dibuja con las dos bandas del mismo ancho, esas dos lineas cruzan por encima del
paso 2 y el diagrama dice que pasaron por ahi.

### `aseDiast2016` — ASE/EACVI 2016, RITMO SINUSAL · Figura 8 del folio 290 (verificada 2026-10-12)

**Documento.** Nagueh SF y cols., «Recommendations for the Evaluation of Left Ventricular Diastolic
Function by Echocardiography: An Update from the ASE and the EACVI», *J Am Soc Echocardiogr*
2016;29:277-314. Ruta en disco:
`~/Desktop/EcoSmart_Biblioteca_Fuentes/02_Diastolica/LV-Diastolic-Function-ASE-EACVI-2016.pdf`
(38 páginas). **Regla de folio: folio = página 1-based del PDF + 276.** Comprobada en el pie
impreso de cinco páginas (PDF 1 → 277, PDF 2 → 278, PDF 14 → 290, PDF 15 → 291, PDF 16 → 292), no
por aritmética.

⚠️ **SON DOS ALGORITMOS Y ESTÁN EN LA MISMA FIGURA.** El pie de la Figura 8 (folio 290) los separa
con todas las letras: «(A) Algorithm for diagnosis of LV diastolic dysfunction in subjects with
normal LVEF. (B) Algorithm for estimation of LV filling pressures and grading LV diastolic function
in patients with depressed LVEFs and patients with myocardial disease and normal LVEF after
consideration of clinical and other 2D data.» La figura se leyó **renderizada a 230 dpi**, no sólo
por texto extraído: el orden de lectura del PDF mezcla las cajas de las dos mitades.

#### El corte entre FEVI normal y deprimida — folio 285

La guía lo escribe una sola vez y con número: «patients with normal LVEF (**≥50%**)». Verificado en
la imagen de esa línea, porque el extractor de texto convierte el `≥` en `$`. En la app es
`UMBRAL_FEVI_NORMAL`, que ya valía 50 y gobierna la banda de la FEVI en toda la suite.

#### Figura 8A — FEVI normal · diagnóstico de disfunción diastólica

| Variable | Corte | Operador |
|---|---|---|
| E/e′ promedio | > 14 | `>` |
| e′ anular | septal < 7 cm/s **o** lateral < 10 cm/s | `<` los dos |
| Velocidad de la IT | > 2,8 m/s | `>` |
| Volumen indexado de la AI | > 34 ml/m² | `>` |

**Regla de conteo, con el denominador que importa (folio 281, repetido en su Key Point 2):** «LV
diastolic function is normal if more than half of the **available** variables do not meet the cutoff
values. LV diastolic dysfunction is present if more than half of the available parameters meet these
cutoff values. The study is inconclusive if half of the parameters do not meet the cutoff values.»

**Las tres casillas de la figura, con su nombre exacto:** `Normal Diastolic function`,
`Indeterminate` y `Diastolic Dysfunction`. **Ninguna lleva grado**, y no hay flecha de la tercera
hacia la 8B.

⚠️ **EL DENOMINADOR ES «LAS DISPONIBLES» Y LA GUÍA LO EJEMPLIFICA CON TRES.** Folio 281: «a
60-year-old patient with a septal e′ velocity of 6 cm/sec, septal E/e′ ratio of 10, LA maximum volume
index of 30 mL/m², but no recorded TR signal has normal diastolic function». Tres disponibles, una
positiva → menos de la mitad → normal.

⚠️ **LA 8A NO TIENE ATAJOS DE FLUJO MITRAL.** La E/A y la onda E no son insumos suyos por ninguna
puerta: son el primer paso de la 8B.

#### Figura 8B — FEVI deprimida (o enfermedad miocárdica) · presión de llenado y grado

**Paso 1, flujo mitral.** `E/A ≤ 0.8 + E ≤ 50 cm/s` → LAP normal, grado I · `E/A ≤ 0.8 + E > 50 cm/s`
**o** `E/A > 0.8 - <2` → al paso 2 · `E/A ≥ 2` → ↑LAP, grado III.
⚠️ **Los dos operadores del atajo son INCLUSIVOS (`≤` y `≥`)**, a diferencia de los cuatro criterios,
que son estrictos. No es teórico: un E/A de 0,800 se alcanza con enteros (E 40 / A 50) y una E de
50,0 clavada es el valor que más se tipea.

**Paso 2, tres criterios:** `Average E/e' > 14` · `TR velocity > 2.8 m/s` · `LA Vol. index > 34 ml/m²`.

**Las cuatro salidas de la caja, textuales:**

| Situación | Casilla de la figura |
|---|---|
| 2 de 3 o 3 de 3 positivos | `↑ LAP · Grade II Diastolic Dysfunction` |
| 2 de 3 o 3 de 3 negativos | `Normal LAP · Grade I Diastolic Dysfunction` |
| Sólo 2 disponibles: 1 positivo y 1 negativo | `Cannot determine LAP and Diastolic Dysfunction Grade` |
| Sólo 1 de 3 disponible | el pie: `LAP indeterminate if only 1 of 3 parameters available` |

⚠️ **«1 POSITIVO SOBRE TRES» ES LA RAMA DE «2 DE 3 NEGATIVOS», Y LA PROSA LO ESCRIBE DOS VECES.**
Folio 286: «If all three parameters are available for interpretation and only one of three meets the
cutoff value, then LAP is normal and there is grade I diastolic dysfunction.» Key Point 5 del folio
287: «If only one of three available variables meets the cutoff value, then LAP is normal and grade I
diastolic dysfunction is present. In case of 50% discordance or with only one available variable,
findings are inconclusive to estimate LAP.»

⚠️ **EL MISMO NUMERADOR CON OTRO DENOMINADOR CAMBIA DE CASILLA:** 1 y 1 sobre DOS disponibles es
«cannot determine»; 1 sobre TRES es grado I.

⚠️ **LA 8B NO MIRA EL e′ POR NINGUNA PUERTA.** Sus insumos son el flujo mitral y los tres criterios.

⚠️ **NO HAY NINGÚN CORTE DE «e′ PROMEDIO».** El folio 281 da septal < 7 y lateral < 10, y nada más.
El `e' promedio < 8` que la app usaba de desempate no está en este documento.

#### El S/D venoso pulmonar — tres compuertas, no una

Pie de la Figura 8 (folio 290): «Pulmonary vein S/D ratio <1 applicable to conclude elevated LAP in
patients with **depressed LV EF**». Folio 286: «In patients in whom **one of the three main criteria
is not available**, the ratio of pulmonary vein peak systolic to peak diastolic velocity ... **< 1**
supports the presence of elevated LV filling pressures». Key Point 6 del folio 287 repite las dos.
Y el folio 287 dice por qué no con FEVI normal: «Because the pulmonary venous S/D ratio often is <1
in healthy young individuals, this index is of little value in patients with normal LVEF».

⚠️ **SÓLO HABLA DEL LADO POSITIVO.** «A ratio < 1 is consistent with increased LAP»; del ≥ 1 no dice
nada, así que un «>1» no es un criterio negativo.

#### El E/e′ por sitio — folio 281, REGISTRADO Y NO APLICADO

«It is recognized that at times only the lateral e′ or septal e′ velocity is available and clinically
valid and in these circumstances a **lateral E/e′ ratio > 13** or a **septal E/e′ > 15** is
considered abnormal.» La app compara el cociente de un anillo solo contra el corte del promedio
(> 14). Está declarado en `docs/PENDIENTES.md` → A1 y **no se tocó**: es un umbral clínico.

#### El TDE y el TRIV — NO ENTRAN EN NINGUNO DE LOS DOS ALGORITMOS

Censo de los dos PDF completos: en la página de la Figura 8 (folio 290) **no aparece ni una vez** la
palabra `DT`, `IVRT` ni `deceleration`. Todas las menciones de IVRT del documento caen en poblaciones
especiales —FA, estenosis mitral, IM, miocardiopatía restrictiva, taquicardia sinusal— y en la
Tabla 6 del folio 296, que es otra cosa. Del TDE, el folio 286 dice lo contrario de usarlo como paso:
con E/A ≥ 2 y DT > 160 ms por una E > 120 cm/s, «the writing group recommends using **only the E/A
ratio** in the classification scheme».

#### Lo que la guía NO dice, y la orden preguntaba

- **Un paciente con FEVI normal y disfunción diagnosticada por la 8A NO se gradúa con la 8B.** No
  hay flecha entre las dos casillas ni frase que lo mande. La condición de entrada a la 8B es la
  **enfermedad miocárdica**, que es un juicio clínico sobre datos 2D, no el resultado de la 8A.
- **El algoritmo no está validado**, y lo declara: folio 286, «The proposed algorithm is based on
  expert consensus and has not been validated.»

#### La comparativa, como fuente secundaria

`~/Desktop/EcoSmart_Biblioteca_Fuentes/COMPARATIVA_funcion_diastolica_2016_2024_2025.md` **coincide
con el original en todo lo verificado acá**: los dos algoritmos y su población, los cuatro cortes de
la 8A, los tres de la 8B, los dos atajos con sus operadores, la regla de conteo de las dos figuras,
el e′ que no vota en la 8B y el S/D sólo con FEVI deprimida. **Cero discrepancias.**

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


### Las EXCLUSIONES de los algoritmos de función diastólica — LAS TRES GUÍAS (verificadas 2026-10-14)

Leídas en el texto COMPLETO de cada PDF, con el folio comprobado y sin copia literal en la app. Las
tres escriben la MISMA lista para la válvula mitral, con diferencias de grado que están anotadas.

| Guía | Dónde lo dice | Qué excluye |
|---|---|---|
| **ASE 2025** | pie de la **Figura 3**, **folio 554** (PDF 18) | insuficiencia mitral **primaria grave**, estenosis mitral de **cualquier grado**, calcificación del anillo (**MAC**) **moderada o grave**; y, por su nota ¶, **reparación, reemplazo y TEER mitral**. Además, fuera de la mitral: fibrilación auricular, trasplante cardíaco, HTP no cardíaca, constricción pericárdica y asistencia ventricular |
| **BSE 2024** | pie de la **Figura 17**, **pág. 36** | *«severe MR/MS or MAC or MV replacement or repair»* |
| **BSE 2024** (FA) | pie de la **Figura 19**, **pág. 39** | cardiopatía congénita compleja, trasplante, hepatopatía terminal, **estenosis mitral o MAC que produzca estenosis mitral significativa**, **prótesis mitral**, estenosis aórtica severa, **insuficiencia mitral** o tricuspídea **severa**, y FA con frecuencia ventricular media en reposo **> 120 lpm** |
| **ASE/EACVI 2016** | **folio 286** (PDF 10), en prosa | *«significant mitral valve disease (at least moderate mitral annular calcification [MAC], any mitral stenosis or mitral regurgitation [MR] of more than moderate severity, mitral valve repair or prosthetic mitral valve)»*, más fibrilación auricular, asistencia ventricular, bloqueo de rama izquierda y ritmo de marcapaso ventricular |

**Reglas de folio comprobadas en el pie impreso:** ASE 2025 = página del PDF **+ 536** · ASE/EACVI
2016 = página **+ 276** · BSE 2024 = la página del PDF, **sin offset** (se pagina por «Page N of
55»).

⚠️ **LA FIGURA 8 DE LA ASE 2025 —LA DE FIBRILACIÓN AURICULAR, FOLIO 563— NO REPITE LAS
EXCLUSIONES.** Su pie entero es *«Algorithm for estimation of mean LAP with atrial fibrillation.
BMI, Body mass index; Pulm, pulmonary.»*, censado el PDF completo. Por eso la app cita igual la
Figura 3 en los dos ritmos de esa guía: es donde la guía lo dice.

⚠️ **Y LA FIGURA 18 DE LA BSE —la vía de función sistólica deprimida, pág. 38— NO LISTA LAS
EXCLUSIONES MITRALES.** Su pie nombra *«LBBB, RV apical pacing or resynchronisation pacing (CRT);
LV assist devices»*, y nada más. Es la Figura 17 la que las escribe para el ritmo sinusal.

⚠️ **LA ASE 2025 EXCLUYE LA ESTENOSIS MITRAL DE CUALQUIER GRADO Y LA BSE SÓLO LA SEVERA.** La app
avisa con **cualquier** estenosis consignada, que es el lado conservador y el de la guía más nueva.
Lo mismo con la MAC: la ASE y la 2016 piden «moderada o al menos moderada» y la app no tiene campo
de anillo —lo más cercano es la morfología «Calcificada», que describe la VALVA—, así que el motivo
se escribe con esas palabras y no con las de la guía.

⚠️ **LAS TRES EXCLUYEN LA PLASTIA O REPARACIÓN MITRAL Y LA ASE 2025 ADEMÁS EL TEER, Y LA APP NO LOS
PUEDE DETECTAR.** `vm_morf` tiene NUEVE opciones y ninguna es plastia, anuloplastia ni reparación —
censadas una por una el 2026-10-14. Queda en `docs/PENDIENTES.md` → X2.

### `aseVd2025` — ASE 2025, cavidades derechas (verificada 2026-10-12)

**Mukherjee M, et al. «Echocardiographic Assessment of the Right Heart: Guidelines and Standards
from the American Society of Echocardiography». J Am Soc Echocardiogr 2025;38(3):141-186.**
Ruta en disco, **abierta y leída**: `~/Desktop/EcoSmart_Biblioteca_Fuentes/03_VD_y_corazon_derecho/
Echocardiographic-assessment-of-Right-Heart.-JASE-2025.pdf` (46 páginas).

**Regla de folio: folio = página del PDF + 140.** Comprobada en el pie impreso de tres páginas
distintas, no por aritmética: PDF 5 → «Mukherjee, M et al 145», PDF 8 → «148 Mukherjee, M et al»,
PDF 18 → «158 Mukherjee, M et al».

> ⚠️ **No está en `IND_REFS`.** La clave `aseVd2025` es el nombre con el que este registro la
> identifica; el panel de Evidencia no la cita porque esta tanda no toca el panel. Si algún día se
> le cuelga una fila del panel, hay que registrarla ahí también.

#### Pared del VD (RVWT) — el corte y cómo se mide

| Dato | Valor | Dónde, literal |
|---|---|---|
| Normal | **< 5 mm** | Key Point del **folio 144**: «The normal value for RVWT is <5 mm» |
| Graduación | `< 0,5 cm` normal · `≥ 0,5 a ≤ 0,7` leve · `> 0,7 a ≤ 0,9` moderada · `> 0,9` severa | **Tabla 1, folio 145** («Summary of reference limits…»), fila `RVWT, cm` |
| Repetido | `< 0,5` normal / `≥ 0,5` anormal | **Tabla 6, folio 169** («RV diastolic function assessment»), bloque «Morphologic assessment» |

⚠️ **EL OPERADOR DEL HALLAZGO ES `≥` Y NO `>`.** La guía da el NORMAL (`< 5 mm`), así que a **5,0 mm
exactos ya está del lado anormal**. El recuerdo corriente de «> 5 mm» deja el 5,0 del lado normal, y
5 es un valor que se tipea entero.

**Cómo se mide** (folios 144 y 148, los dos textos coinciden y se complementan): vista **subcostal**,
en **telediástole**, cara **anteromedial de la pared libre**, a mitad de camino entre el anillo
tricuspídeo y los músculos papilares —el folio 148 lo dice como «el tercio inicial del VD entre el
anillo tricuspídeo y los papilares»—, **excluyendo trabéculas, músculo papilar y grasa pericárdica**.
Por 2D y/o **modo M**, con la salvedad de que «M-mode images can be confounded by the angle of
insonation». Si la subcostal es técnicamente difícil —pared libre fina y trabeculación prominente—,
la guía admite la **paraesternal eje largo**.

**Dos advertencias del documento, las dos en el folio 144:**
- el engrosamiento es **inespecífico**: también aparece en miocardiopatías infiltrativas y
  hereditarias, no sólo en HTP;
- **Recomendación 3: «RVWT should be reported if abnormal.»** Es el respaldo de que la hipertrofia
  entre al informe firmado aunque sea el único dato del VD cargado.

⚠️ **LA GUÍA NO ESCRIBE «HIPERTROFIA DEL VD» AL LADO DEL CORTE.** Lo que escribe es «increased
RVWT» / «abnormal». La equivalencia con RVH la hace el propio documento en otros lugares —la
Figura 4 del folio 172 («the right ventricle initially responds to increased afterload by
increasing RVWT») y el folio 173, que lista `RVH` entre los signos ecocardiográficos del grupo 1—,
y la palabra «hipertrofia» en la app es **decisión de Maicol**. **La app NO gradúa la pared** aunque
la Tabla 1 la gradúe: informa hipertrofia sí o no.

#### Índice de Tei / RV MPI — DOS cortes, uno por método

| Método | Normal | Graduación (Tabla 1, folio 145) |
|---|---|---|
| **DTI** (el campo de la app) | **< 0,55** → alterado `≥ 0,55` | `<0,55` · `≥0,55 a <0,62` · `≥0,62 a <0,70` · `≥0,70` |
| **Doppler pulsado** | **< 0,40** → alterado `≥ 0,40` | `<0,40` · `≥0,40 a <0,49` · `≥0,49 a <0,57` · `≥0,57` |

Literal del **folio 158**: «A normal RV MPI is <0.40 by the PW Doppler method and <0.55 by the TDI
method», repetido en el Key Point del **folio 159**.

⚠️ **LOS DOS CORTES NO SE UNIFICAN Y NO SE INTERCAMBIAN.** La propia guía explica por qué: «these
two methods result in different reference values due to inherent differences in acquisition and
time interval calculation, leading to only **moderate inter-method correlation**» (folio 158).
Aplicar el 0,40 a un valor medido por DTI mueve el corte un 27 %.

**Es ADIMENSIONAL** — nota al pie de la Tabla 3, **folio 156**: «RV MPI is a dimensionless index».
Por eso se tipea como cociente. ⚠️ El Key Point del folio 159 lo escribe como «<0.40 **ms**» y
«<0.55 **ms**»: es un error del documento, contradicho por su propia Tabla 3 y por la fórmula
—`(IVRT + IVCT)/ET`, un cociente de tiempos—.

**Fórmulas** (folio 158): `RV MPI = (IVRT + IVCT)/ET` o `RV MPI = (TCO − ET)/ET`, con TCO el
intervalo de cierre-apertura tricuspídeo. Por Doppler pulsado el ET sale del TSVD y el TCO del
llenado tricuspídeo o del jet de IT —**imágenes distintas, así que la guía pide latidos con R-R
parecidos**—; por DTI los tres intervalos salen de **un solo latido** pulsando el anillo
tricuspídeo lateral.

#### Las advertencias del Tei — folio 159

Todas en el mismo párrafo, y es el respaldo del cartel ámbar de la app:
- **Dependencia de la carga.** Precarga aumentada y congestión derecha («such as fluid overload»)
  **alargan** IVCT e IVRT y **SUBEN** el índice; la precarga reducida los acorta; la HTP y la
  poscarga aumentada también lo suben **«regardless of RV systolic function»**.
- **«Severe TR may decrease IVRT without affecting IVCT.»** O sea: con IT severa el índice se va
  hacia el lado tranquilizador. Es por esto que el cartel de la app sale **también con un Tei
  normal**: lo que se advierte es la validez de la medición, no la dirección del veredicto.
- **«Varying R-R intervals, such as in patients with atrial fibrillation (AF), can lead to variable
  ET and TCO measurements.»** El sujeto de la advertencia es el **R-R variable**; la FA es el
  ejemplo que la guía da.
- **Recomendación 1:** «Although RV MPI is a practical tool with prognostic value in PH, it is **not
  recommended as the sole quantitative method** for evaluating RV function, because of load
  dependency.»

⚠️ **LO QUE LA GUÍA NO DICE: no habla de «seudonormalización del Tei con presión de la AD
elevada».** Barrido del PDF completo buscando `Tei`, `MPI`, `myocardial performance`, `wall
thickness`, `RVWT`, `RVH` y `hypertroph` → ninguna coincidencia dice eso. Para la congestión
derecha describe lo **contrario** (el índice sube). La app no lo afirma, y el cartel nombra sólo
las dos advertencias que la guía escribe Y la app puede detectar: **IT severa** (`it_grado === '4'`)
y **ritmo irregular** (`diast_ritmo === 'fa'`).

#### Lo que NO se usó de este documento

La Tabla 1 trae los límites de **todo** el corazón derecho —dimensiones de AD, RVOT, áreas,
volúmenes 3D, TAPSE, S′, FAC, FEVD 3D, strain, E/A, e′/a′, E/e′, TDE, TRV, PSVD, PAD, AccT— y
**esta tanda no tocó ninguno**: los cortes que la app ya aplica para TAPSE (17 mm), S′ (9,5 cm/s) y
FAC (35 %) vienen de la ASE 2015 y **no se compararon ni se movieron**. La **Tabla 6 del folio 169**
(función diastólica del VD) tampoco se usó más allá de confirmar el corte de la pared: los cortes
diastólicos de la app salen de la ASE 2010 y cambiarlos es otra tanda. Queda en
`docs/PENDIENTES.md`.

### `escErs2022` — ESC/ERS 2022, hipertensión pulmonar (verificada 2026-10-15)

**Humbert M, Kovacs G, Hoeper MM, et al. «Guía ESC/ERS 2022 sobre el diagnóstico y el
tratamiento de la hipertensión pulmonar».** Ruta en disco, **abierta y leída**:
`~/Desktop/EcoSmart_Biblioteca_Fuentes/03_VD_y_corazon_derecho/Humbert_2022_Hipertension_Pulmonar.pdf`
(129 páginas).

**Regla de folio: folio = página del PDF − 1.** Comprobada en el pie impreso: PDF 29 → «28»,
PDF 42 → «41».

⚠️ **ES LA TRADUCCIÓN ESPAÑOLA Y EL ORIGINAL INGLÉS NO ESTÁ EN LA BIBLIOTECA**, censados los 70
PDF. Este archivo ya documenta que la traducción de la SEC se comió una palabra en la ESC/EACTS
2025 y dio vuelta un hallazgo entero. Acá lo que se cita son **números y nombres de columna**, no
una frase de wording, y los dos cortes que la app aplica (`> 1,0` y `< 0,55`) están además
confirmados por la **ASE 2025**, que es un documento independiente y en inglés. Aun así: antes de
cerrar un hallazgo de REDACCIÓN sobre esta guía hay que conseguir la inglesa.

#### Tabla 10, folio 28 — «Signos ecocardiográficos adicionales indicativos de hipertensión pulmonar»

Las tres columnas se leyeron **por coordenadas** (`pdfplumber`, `x0` de cada palabra) y no por el
orden en que el extractor devuelve el texto: los encabezados caen en x≈316 (A), x≈389 (B) y x≈467
(C), y cada renglón se asignó a su columna por esa x. Sin eso, el orden de lectura mezcla las tres.

| Categoría | Signo | Corte y operador |
|---|---|---|
| **A · Ventrículos** | Diámetro basal VD/VI o cociente del área | **> 1,0** |
| **A · Ventrículos** | Aplanamiento del septo interventricular | IEVI > 1,1 en sístole y/o diástole |
| **A · Ventrículos** | **Cociente TAPSE/PAPs** | **< 0,55 mm/mmHg** |
| **B · Arteria pulmonar** | TA del TSVD | < 105 ms y/o muesca mesosistólica |
| **B · Arteria pulmonar** | Regurgitación pulmonar diastólica temprana | > 2,2 m/s |
| **B · Arteria pulmonar** | **Diámetro de la AP** | **> diámetro de la RAÍZ AÓRTICA** |
| **B · Arteria pulmonar** | **Diámetro de la AP** | **> 25 mm** |
| **C · VCI y AD** | Diámetro de la VCI | > 21 mm con colapso inspiratorio disminuido |
| **C · VCI y AD** | Área de la AD telesistólica | > 18 cm² |

La nota ^a de la tabla: tienen que estar presentes signos de **al menos dos categorías** para
mover el nivel de probabilidad (concuerda con `nCat >= 2` de `_htp2022Core`).

⚠️ **EL COCIENTE TAPSE/PAPs ES DE LA CATEGORÍA A Y LA APP LO CUENTA EN LA C.** Medido por
coordenadas: «Cociente TAPSE/PAPs < 0,55 mm/mmHg» arranca en **x0 = 316**, la columna de
«A: Ventrículos»; los dos renglones del diámetro de la AP arrancan en **x0 = 389**, la de
«B: Arteria pulmonar». En `_htp2022Core` el cociente está dentro de `catC`, junto a la VCI y el
área de la AD, y el rótulo de la pantalla de Avanzado lo dice («C · VCI / AD … TAPSE/PSAP < 0.55»).
**NO se corrigió**: mover un signo de categoría cambia `nCat` en las escenas donde A ya es positiva
y C lo es sólo por el cociente, o sea cambia la **probabilidad de HTP publicada**, que es una regla
de integración clínica. `docs/PENDIENTES.md` → **G1-1**.

⚠️ **«RA» EN ESA TABLA ES LA RAÍZ AÓRTICA, NO LA AURÍCULA DERECHA.** La lista de abreviaturas del
pie lo escribe: «AD: aurícula derecha; … **RA: raíz aórtica**». O sea que la comparación que la
guía pide es **arteria pulmonar contra raíz aórtica**. En la app la raíz aórtica es **`ao_sin`**
(«Ao sinusal», pestaña AI/VI, acordeón `sacc-aorta`); los otros dos segmentos de ese bloque son
`ao_st` (sinotubular) y `ao_tub` (tubular/ascendente), y en el módulo de ETE/TAVI están además
`ete_tavi_sv` (seno de Valsalva), `ete_tavi_ust` y `ete_tavi_ao_asc`. **Esta tanda no conecta
ninguna**: el campo nuevo del diámetro de la AP queda preparado y la comparación la hace el prompt
de HTP.

#### Folio 41 — tabla de estratificación de riesgo en hipertensión arterial pulmonar

| Riesgo | TAPSE/PAPs |
|---|---|
| Bajo | **> 0,32 mm/mmHg** |
| Intermedio | **0,19 – 0,32 mm/mmHg** |
| Alto | **< 0,19 mm/mmHg** |

⚠️ **ACÁ ESTÁ EL 0,32 QUE LA PANTALLA DE TEP USA, Y NO ES UN CRITERIO DE TEP.** `calcTEP` publica
«TAPSE/PSAP N — conservado (>0.32)». El número existe y está publicado, pero su fuente lo define
como el **umbral de BAJO RIESGO en hipertensión arterial pulmonar**, no como un signo de
tromboembolia. Por eso **no se agregó la frase «probabilidad de TEP»** que la orden ofrecía: sería
atribuirle al 0,32 un significado que ninguna fuente leída le da. Es la PARADA declarada de esa
parte. `docs/PENDIENTES.md` → **G1-2**.

⚠️ **EL 0,36 NO APARECE EN ESTA GUÍA.** Barrido del PDF completo buscando `0,36`: cero
coincidencias. La **ASE 2025, folio 180**, escribe sin embargo «The ESC/ERS guidelines recommend a
TAPSE/PASP <0.36 mm/mmHg as suggestive of PH, with a ratio of <0.19 mm/mmHg indicating a 1-year
mortality risk of >20%»: la segunda mitad sí está en esta tabla (el 0,19); la primera no se
encontró en la traducción española. Queda declarado y el corte de 0,36 que aplica la app se
sostiene en la literatura de insuficiencia cardíaca (abajo), no en esta guía.

### `aseVd2025` — lo que esta tanda (G1) le agregó

Misma fuente y misma regla de folio que la entrada de más arriba (**folio = página del PDF + 140**).

#### Pared del VD — la GRADUACIÓN, que hasta hoy estaba leída y no aplicada

**Tabla 1, folio 145**, fila `RVWT, cm`. Leída del texto extraído con la codificación que esa
fuente usa (**`$` = `≥` y `#` = `≤`**, la misma trampa que este archivo ya documenta para la
Tabla 10 de la EAE/ASE 2009), y validada por una fila VECINA de la misma tabla que la tanda
anterior ya había leído **renderizando**: `TissueDopplerRVMPI <0.55 $0.55to<0.62 $0.62to<0.70
$0.70`, que coincide exactamente con lo registrado entonces.

| Grado | Valor (cm, como lo imprime la tabla) | En mm, que es la unidad del campo |
|---|---|---|
| Normal | `< 0,5` | **< 5** |
| Leve | `≥ 0,5 a ≤ 0,7` | **≥ 5 a ≤ 7** |
| Moderada | `> 0,7 a ≤ 0,9` | **> 7 a ≤ 9** |
| Severa | `> 0,9` | **> 9** |

⚠️ **COINCIDE EXACTAMENTE CON EL «5-7-9» QUE EL MÉDICO RECORDABA**, y la guía que lo publica es la
ASE 2025. **La ASE 2010 (Rudski) NO ESTÁ EN LA BIBLIOTECA** —censo de los 70 PDF—, así que no se
pudo cotejar con ella; la **ASE/EACVI 2015** (`Lang_2015_Cuantificacion_Cavidades.pdf` y
`Chamber-quantification...ASE-2015.pdf`) sí está y **no publica grados de RVWT**.

⚠️ **EL CORTE DE HIPERTROFIA NO SE MOVIÓ: sigue siendo `≥ 5 mm`**, que es el complemento exacto
del «normal < 5 mm» del Key Point del folio 144. La graduación entra **sólo en la fila del cuadro
de referencias**; el informe narrativo y el EN SUMA siguen diciendo «hipertrofia del ventrículo
derecho (pared de N mm)» y «HVD», sin grado, porque cambiar una frase del informe firmado no está
autorizado en esta orden. `docs/PENDIENTES.md` → **G1-3**.

#### FEVD por 3D — el corte

**Tabla 1, folio 145**, fila `3D RVEF, %`: normal **`> 45`**; leve `≤45 a <39`; moderada
`≤39 a ≥32`; severa `<32`.

⚠️ **LA APP APLICA SÓLO EL CORTE, NO LA GRADUACIÓN**, y es deliberado: lo que esta orden pide para
la FEVD es que su fila aparezca con el dato, no que gradúe. La fila dice normal `> 45 %` o
disfunción `≤ 45 %`. ⚠️ **Y EL OPERADOR ES `>` Y NO `≥`**: el comentario que vivía al lado del
campo decía «otro corte (≥45 %)» y la tabla escribe `>45`, así que **45,0 exactos están del lado
anormal**. Ese comentario no gobernaba nada —la FEVD no se evaluaba en ninguna parte— y se
corrigió. `docs/PENDIENTES.md` → **G1-4**.

#### Relación VD/VI

**Tabla 8, folio 173**, fenotipo «Group 1 Pre-capillary pulmonary arterial hypertension»:
*«Dilated right heart: **RV/LV >1**, dilated RA (≥19 cm²), RVH»*. Coincide con la categoría A de
la Tabla 10 de la ESC/ERS 2022 (`> 1,0`), que es el corte que `_htp2022Core` ya aplicaba.

⚠️ **CONVIVE CON EL `≥ 0,9` DE LA PANTALLA DE TEP Y NO SE UNIFICAN.** Son dos campos distintos y
dos preguntas distintas: `vd_vi` (pestaña VD/AD) alimenta la probabilidad de HTP con el `> 1,0` de
las dos guías de arriba, y `tep_vdvi` (pantalla de TEP) alimenta el puntaje de sobrecarga aguda
con `≥ 0,9`. La cascada de `calcTEP` ya usa `tep_vdvi` primero, después `vd_bas/ddfvi` y sólo al
final `vd_vi`. **No se tocó ninguno de los dos.** `docs/PENDIENTES.md` → **G1-5**.

#### Diámetro de la arteria pulmonar

**Tabla 1, folio 145**, fila `PA, cm`: normal **`< 2,5`**; leve `≥2,5 a ≤3,0`; moderada
`>3,0 a ≤3,5`; severa `>3,5`. Y **Tabla 8, folio 173**: *«Dilated PA >25 mm»*.
Coincide con el `> 25 mm` de la Tabla 10 de la ESC/ERS 2022.

⚠️ **EL CAMPO NUEVO NO APLICA NINGUNO DE ESOS CORTES, Y ES LA ORDEN.** `ip_ap_diam` es un dato de
entrada: no vota el grado de la insuficiencia pulmonar, no cambia ningún texto y no tiene fila de
referencia. Lo único que lleva es una **banda de plausibilidad `[5, 80] mm`**, que no es un
criterio: el piso en 5 caza el diámetro tipeado en CENTÍMETROS —2,5 por 25— y el techo en 80 deja
entrar con margen el aneurisma de arteria pulmonar, muy por encima del `>3,5 cm` que la tabla
llama severo. Es el mismo criterio y el mismo trato que `VD_NUEVOS_BANDA` y que
`ET_BANDA_INSUMO.tsvd_diametro` (`[5, 60]`).

#### TAPSE/PSAP — el cociente, sus cortes y lo que cada fuente dice

| Qué | Valor | Dónde, leído en el original |
|---|---|---|
| Signo de HTP, categoría A | **< 0,55 mm/mmHg** | ESC/ERS 2022, **Tabla 10, folio 28** |
| Sanos | **0,5 – 0,7 mm/mmHg** | ASE 2025, **folio 152** |
| Desacoplamiento VD-AP y mayor mortalidad, en HTP | **0,3 – 0,4 mm/mmHg** | ASE 2025, **folios 152 y 173** |
| Sugestivo de HTP, atribuido a la ESC/ERS | **< 0,36 mm/mmHg** | ASE 2025, **folio 180** |
| Mortalidad a 1 año > 20 % | **< 0,19 mm/mmHg** | ASE 2025, **folio 180**; ESC/ERS 2022, **folio 41** |
| Riesgo en HAP: bajo / intermedio / alto | **> 0,32 · 0,19–0,32 · < 0,19** | ESC/ERS 2022, **folio 41** |

Literal del folio 152 (ASE 2025): *«the TAPSE/PASP ratio generally falls within the range of
0.5–0.7 mm/mmHg … However, in PH, a TAPSE/PASP ratio in the range of 0.3-0.4 mm/mmHg is associated
with RV-PA uncoupling as validated by pressure-volume loops and is linked to an increased mortality
risk.»* Y su Recomendación del folio 152: *«TAPSE/PASP ratio is a noninvasive physiologic index of
RV-PA coupling that reflects RV contractile response to pulmonary afterload.»*

**Los tres tramos que la app publica** (decisión de Maicol) y lo que respalda a cada uno:

| Tramo | Texto de la app | Respaldo |
|---|---|---|
| `< 0,36` | «mal pronóstico en IC con FEVI reducida y preservada» | ver el párrafo de abajo |
| `≥ 0,36 y < 0,55` | «elemento de probabilidad para HTP» | ESC/ERS 2022, Tabla 10, folio 28 (`< 0,55`) |
| `≥ 0,55` | «acoplamiento VD-AP normal» | el complemento del anterior, y los 0,5–0,7 de sanos del folio 152 |

⚠️ **EL 0,36 EN INSUFICIENCIA CARDÍACA NO SE PUDO LEER EN SU FUENTE PRIMARIA, Y HAY QUE DECIRLO.**
El origen del corte es **Guazzi M, Bandera F, Pelissero G, et al. «Tricuspid annular plane systolic
excursion and pulmonary arterial systolic pressure relationship in heart failure: an index of right
ventricular contractile function and prognosis». Am J Physiol Heart Circ Physiol 2013;305:H1373-
H1381** (cohorte mixta de 293 pacientes), y el metaanálisis **Heart Fail Rev 2024 (PMC10904417)**
reporta que con ese corte el cociente se asocia de forma independiente con la mortalidad por
cualquier causa (HR ajustado agrupado 2,84) y que la observación vale en FEVI reducida y en FEVI
preservada. **Ninguno de los dos está en la biblioteca del Escritorio**: el metaanálisis se leyó en
línea y el original de Guazzi sólo a través de él. Por la regla de la casa —«verificada» = texto
completo leído, con documento, año, tabla y página— **el 0,36 en IC NO está verificado al estándar
del repo**, y por eso la tarjeta ⓘ **no lo cita**: cita sólo lo que salió de los dos PDF.
El número que la app aplica no se inventó acá —está publicado y la ASE 2025 lo nombra en su folio
180—, pero la ATRIBUCIÓN clínica de ese tramo queda declarada. `docs/PENDIENTES.md` → **G1-6**.

⚠️ **LOS OTROS TRES USOS QUE LA ORDEN PEDÍA NO ENTRARON EN LA TARJETA, por lo mismo**: el corte de
**IC con fracción levemente reducida** (la orden decía «alrededor de 0,46»; el metaanálisis de 2024
registra **0,34** para ese fenotipo, de Rosa 2020, así que además el número de la orden no se
confirma), el de **terapia de resincronización** (≈ 0,45) y la **mediana de 0,406** de la
reparación o reemplazo tricuspídeo por catéter. Los tres aparecen en resúmenes y en títulos, y
ninguno se leyó en su texto completo. `docs/PENDIENTES.md` → **G1-7**.

### Parámetros complementarios de la función diastólica (verificados 2026-10-12)

Esta entrada cubre lo que la tanda del 2026-10-12 leyó de los **tres** documentos a la vez: el
**S/D venoso pulmonar**, los **parámetros suplementarios** de la ASE 2025 y el **E/e′ por sitio**
de la ASE/EACVI 2016. Los folios y los offsets son los de las entradas de cada guía más arriba
(ASE 2025 = página del PDF + 536 · ASE/EACVI 2016 = página + 276 · BSE 2024 = página).

#### El S/D venoso pulmonar — CINCO lecturas y DOS cortes

El mismo campo se lee con dos cortes distintos. Cada uno verificado en su original:

| Dónde vota | Guía · folio/página | Corte | Operador | Frase verificada |
|---|---|---|---|---|
| Segundo paso, **ritmo sinusal** | ASE 2025 · folio 554 | **≤ 0,67** | `<=` | prosa: «The corresponding value for pulmonary vein systolic velocity–to–diastolic velocity ratio of ≤0.67 is equal to ≤40% systolic filling fraction and is therefore recommended»; caja de la Figura 3: «Pulmonary Vein S/D ≤0.67 or LARS ≤ 18% or LAVi > 34 mL/m2» |
| **Fibrilación auricular** | ASE 2025 · folio 563, Figura 8 | **< 1** | `<` | caja del paso 2: «Pulm vein S/D ratio <1» |
| **FEVI reducida** (Figura 18) | BSE 2024 · pág. 37 | **< 1** | `<` | «In addition to Ar-A duration > 30 ms and L-wave velocity > 20 cm/s, **a PV S/D ratio < 1** and MV E deceleration time < 150 ms are accurate indicators of elevated LVFP … when LV systolic function is impaired» |
| **Fibrilación auricular** (Figura 19) | BSE 2024 · pág. 40 | **< 1** | `<` | «decreased LA compliance (common in AF) and increased LAP causes a reduction in PV D velocity, leading to **a reduction in the PV S/D ratio to below 1**» |
| **FEVI deprimida** | ASE/EACVI 2016 · folios 286, 287 y 290 | **< 1** | `<` | folio 286: «In patients in whom one of the three main criteria is not available, the ratio of pulmonary vein peak systolic to peak diastolic velocity … **< 1** supports the presence of elevated LV filling pressures»; Key Point 6 del folio 287: «In patients with depressed LVEFs, pulmonary vein S/D ratio may be used if one of the three main parameters is not available. A ratio < 1 is consistent with increased LAP»; pie de la Figura 8 del folio 290: «Pulmonary vein S/D ratio <1 applicable to conclude elevated LAP in patients with depressed LV EF» |

⚠️ **NINGUNO DE LOS CINCO CONTRADICE LO QUE PEDÍA LA ORDEN DE LA TANDA**, y el S/D de la FA de la
ASE 2025 se verificó explícitamente porque la orden lo nombraba como dudoso: la Figura 8 del folio
563 escribe `<1`, no `≤0,67`.

⚠️ **EL ≤ 0,67 NO SALE DE UN ESTUDIO DE CORTE, SALE DE UNA EQUIVALENCIA.** El folio 554 lo deriva
de la fracción de llenado sistólico: «a systolic filling fraction … of ≤40% has good accuracy in
identifying patients with elevated mean LAP. The corresponding value for pulmonary vein systolic
velocity–to–diastolic velocity ratio of ≤0.67 is equal to ≤40% systolic filling fraction».

⚠️ **Y EL MISMO FOLIO LIMITA SU USO EN DOS DIRECCIONES**: «The ratio is most reliable in patients
with LV systolic dysfunction and **should not be considered in normal subjects with normal
echocardiographic results**, when the ratio can be ≤ 0.67. In patients with normal LVEF, the ratio
can be >0.67 despite elevated LV filling pressures». La ASE/EACVI 2016 dice lo mismo en el folio
287 («Because the pulmonary venous S/D ratio often is <1 in healthy young individuals, this index
is of little value in patients with normal LVEF») y en el 286 («In healthy young people (<40 years
of age), pulmonary venous S/D ratio can be <1»). Esas dos salvedades son las que sostienen que la
Figura 8A de la ASE 2016 **no** mire el S/D, y no están implementadas como aviso: `docs/PENDIENTES.md`.

#### Los parámetros suplementarios de la ASE 2025 — folio 555 y nota ‡ de la Figura 3

**Dónde entran:** la caja del segundo paso de la Figura 3 (folio 554) dice «If none available or
reliable use Supplemental methods‡», y la prosa del folio 555 lo repite: «Supplemental Parameters:
these can be relied on **in the absence of the three parameters in the section above**».

**La nota ‡ de la Figura 3 (folio 554), literal y completa:** «PR end-diastolic velocity ≥ 2 m/s,
PA diastolic pressure ≥ 16 mm Hg, mitral inflow L-wave velocity ≥ 50 cm/s, Ar-A duration > 30 ms,
and/or a decrease in mitral E/A ratio of ≥50% with Valsalva maneuver.» Son CINCO.

| Suplementario | Folio | Corte | Operador | Estado en la app |
|---|---|---|---|---|
| Velocidad telediastólica de la IP | 555a y nota ‡ | **≥ 2 m/s** | `>=` | implementado (`ip_vtd`) |
| PAP diastólica | 555a y nota ‡ | **≥ 16 mmHg** | `>=` | implementado (el campo que publica `calcIP`) |
| Onda L del llenado mitral | 555b y nota ‡ | **≥ 50 cm/s** | `>=` | implementado (`onda_l`) |
| Ar−A **con** amplitud de la Ar | 555d · nota ‡ (sólo el Ar−A) | **> 30 ms** y **> 35 cm/s** | `>` los dos | implementado con AND |
| Caída de la E/A con Valsalva | 555e y nota ‡ | ≥ 50 % | `>=` | **NO**: la app no registra la maniobra |
| IM diastólica · terminación precoz | 555c | — | — | **NO**: son hallazgos de forma de onda, sin corte |

⚠️ **EL INCISO (a) SON DOS CAMINOS CON UN «or», NO UN PAR.** Literal: «An end-diastolic velocity
≥2 m/s **or** pulmonary artery (PA) diastolic pressure ≥16 mm Hg is consistent with elevated LAP in
the absence of pulmonary disease.»

⚠️ **LA NOTA ‡ Y EL INCISO (d) NO DICEN LO MISMO, Y LOS DOS TEXTOS ESTÁN IMPRESOS.** La nota ‡
nombra sólo «Ar-A duration > 30 ms»; el folio 555d escribe la condición entera: «This stage is
diagnosed on the basis of **a high amplitude (>35 cm/s) and long duration** of pulmonary vein Ar
velocity, **along with** an Ar-A duration >30 ms». La app exige el **AND**, que es lo que escribe la
prosa y es el lado conservador: pide más evidencia para afirmar presión elevada, no menos. Con el
criterio de la nota ‡ sola, un Ar−A de 31 ms con una Ar de 20 cm/s afirmaría presión elevada.

⚠️ **Y EL INCISO (d) DESCRIBE UN ESTADIO CON LA PAI MEDIA NORMAL.** Literal: «there is an early
stage when **LVEDP is elevated but mean LAP is normal**. This stage is diagnosed on the basis of…».
O sea que como marcador es de **LVEDP** y no de la PAI media, que es lo que la Figura 3 estima. Se
implementa igual porque la nota ‡ lo lista como suplementario de ESE algoritmo y porque el §12 del
folio 555 manda informar el aumento aislado de la LVEDP («An isolated increase in LVEDP should be
reported, as it predisposes patients to elevated mean LAP with exercise, faster heart rate, or
increased afterload»). Queda declarado en `docs/PENDIENTES.md`.

⚠️ **EL CORTE DE LA ONDA L ES ≥ 50 Y NO EL > 20 DE LA BSE.** El folio 555b lo escribe dos veces, y
las dos con `≥`: «leading to blood flow into the left ventricle with peak velocity ≥ 50 cm/s» y
«Therefore, the presence of an L-wave velocity ≥50 cm/s is an indicator of both impaired LV
relaxation and elevated LAP». El mismo inciso aclara de dónde viene el 40: «It was initially
described in normal healthy young individuals with bradycardia with peak velocity <40 cm/s».

⚠️ **EL §12 DEL FOLIO 555 OBLIGA A NOMBRARLOS EN EL INFORME CUANDO DECIDEN**: «LARS, pulmonary vein
S/D ratio or systolic filling fraction, mitral inflow A duration, pulmonary vein Ar duration, and/or
IVRT **should be included in the report if relied on** to arrive at the conclusions pertaining to
diastolic function grade and mean LAP». Lo que la app hace hoy es nombrarlos en la ventana del 🧭 y
en la `via`; en el informe firmado el único que se nombra es el de la BSE por `_bseDetalles`. Está
declarado en `docs/PENDIENTES.md`.

#### El E/e′ por SITIO de la ASE/EACVI 2016 — folio 281

**La oración entera, que es la que decide la lectura:** «It is recognized that **at times only the
lateral e′ or septal e′ velocity is available** and clinically valid and in these circumstances a
**lateral E/e′ ratio > 13 or a septal E/e′ > 15** is considered abnormal. **The latter sentence
applies to laboratories that acquire only septal or lateral velocities.**»

| Caso | Corte | Operador |
|---|---|---|
| Los **dos** anillos medidos | promedio **> 14** | `>` |
| **Sólo** el septal | septal **> 15** | `>` |
| **Sólo** el lateral | lateral **> 13** | `>` |

⚠️ **ES UN REEMPLAZO Y NO UN «OR DE TRES ALTERNATIVAS».** Las dos mitades de la regla están en la
misma oración —«at times only … is available»— y la frase que la cierra dice para quién es: el
laboratorio que no mide los dos anillos. **Con los dos anillos manda el promedio y nada más.**
La **ASE 2025 sí** los usa como alternativas simultáneas, y eso está impreso en su Figura 3 del
folio 554: «Increased E/e': septal ≥ 15 **or** lateral ≥ 13 **or** average ≥ 14». Son dos guías y
dos lecturas del mismo trío de números; no se unifican.

⚠️ **Y LOS OPERADORES TAMPOCO SON LOS MISMOS.** La ASE 2016 escribe los tres con `>` estricto
—«average E/e′ ratio > 14» en el enunciado de las cuatro variables y en el Key Point 1 del folio
281— y la Figura 3 de la ASE 2025 los escribe con `≥`. Un E/e′ de **14,00 exacto es NEGATIVO en la
ASE 2016 y POSITIVO en la ASE 2025**, y ese valor se alcanza con enteros (E 98 con e′ 7,0).

#### El e′ anular de la ASE/EACVI 2016, para no confundirlo con el E/e′

El mismo folio 281 da los cortes del **e′** (que es otra variable): «annular e′ velocity (septal
e′ < 7 cm/sec, lateral e′ < 10 cm/sec)», en **OR** entre los dos anillos y **sin corte de
promedio**. Ya estaba verificado en la entrada de `aseDiast2016`; se repite acá porque la cercanía
de los dos tríos de números es la trampa de esta zona.

#### El IMC en la fibrilación auricular — no es un corte nuevo

El `BMI > 30 kg/m2` del paso 2 de la Figura 8 (folio 563) ya estaba verificado. Lo que esta tanda
agrega no es un corte sino una lectura: **el operador es `>` estricto**, así que el 30 exacto es
negativo, y por eso el redondeo del IMC a un decimal es lo que hace que el paciente de 86,7 kg con
170 cm caiga del lado que la guía describe.

---
### `hfaPeff2019` — HFA-PEFF, Pieske et al. · ✅ **VERIFICADA EN EL ORIGINAL** (2026-10-14)

**Fuente primaria:** Pieske B, Tschöpe C, de Boer RA, Fraser AG, Anker SD, Donal E et al.
*How to diagnose heart failure with preserved ejection fraction: the HFA-PEFF diagnostic algorithm
— a consensus recommendation from the Heart Failure Association (HFA) of the European Society of
Cardiology (ESC).* **Eur Heart J 2019;40(40):3297-3317**, DOI 10.1093/eurheartj/ehz641.

**En disco:** `~/Desktop/EcoSmart_Biblioteca_Fuentes/02_Diastolica/HFA PEFF Pieske ESC 2019.pdf`,
21 páginas. **Leído en texto completo el 2026-10-14.**

⚠️ **ESTA ENTRADA DECÍA «EL ORIGINAL NO ESTÁ EN LA BIBLIOTECA» Y ESO DEJÓ DE SER CIERTO.** El
censo de los 89 archivos del 2026-10-13 **no estaba mal**: el archivo entró al disco el **13/10 a
las 18:55**, después de ese censo. Lo que cambió es el disco, no la lectura. Por eso los cortes
pasan de «no verificados al estándar del repo» a **verificados**: documento, año, folio y tabla.

**Regla de folio: folio = página del PDF + 3296**, comprobada en el **pie impreso** de las páginas
1, 8, 9 y 10 (PDF 8 → 3304, PDF 9 → 3305, PDF 10 → 3306), no por aritmética sobre el rango.

| Dónde | Folio | PDF |
|---|---|---|
| Criterios funcionales (e′ por edad, E/e′, IT, PSAP, GLS) y **LAVI por ritmo** | **3303** | 7 |
| IMVI, RWT, espesor de pared, **péptidos** y la regla del puntaje | **3304** | 8 |
| **Figura 3** — el algoritmo que la app ejecuta | **3305** | 9 |

⚠️ **LA FIGURA 3 ES UNA IMAGEN.** El texto extraído de esa página trae el cuerpo del artículo y
**ninguno** de los cortes de la tabla. Se leyó renderizando la página a **600 dpi** con un `clip`
por celda. Quien la busque con `pdftotext` va a concluir que la figura no dice nada.

#### ⚠️ LAS TRES CONTRADICCIONES INTERNAS DEL ARTÍCULO

El artículo **se contradice consigo mismo** en tres lugares y en los tres **los dos textos están
impresos**. Decisión de Maicol del **13/10/2026: cuando el texto y la Figura 3 difieren, gana la
FIGURA** — es el algoritmo que esta app ejecuta y el que el lector tiene delante al auditar.

| Criterio | TEXTO (verbatim) | FIGURA 3 (verbatim) | Quedó |
|---|---|---|---|
| NT-proBNP menor en FA | «Minor criterion: NT-proBNP 375–660 pg/mL» (f. 3304) | «NT-proBNP 365-660 pg/ml» (f. 3305) | **365** |
| IMVI menor | «Minor criterion: LVMI ≥115 g/m² in men or ≥95 g/m² in women» (f. 3304) | «LVMI > 115/95 g/m² (m/w)» (f. 3305) | **`>`** |
| LAVI y e′ por edad | los publica con su corchete (f. 3303) | no los separa | **se aplican** |

⚠️ **EL IMVI *MAYOR* NO ESTÁ EN CONFLICTO:** el texto escribe «Major criterion: LVMI ≥149 g/m² in
men or ≥122 g/m² in women and RWT >0.42» (f. 3304) y la figura escribe «LVMI ≥ 149/122 g/m² (m/w)
and RWT > 0,42 #» (f. 3305) — **los dos con `≥`**. La app usaba `>` y estaba mal.

⚠️ **LA MARCA `#` DE LA FIGURA NO ESTÁ EXPLICADA EN NINGUNA PARTE.** No aparece en el pie de la
Figura 3 («Step 2 (E): Echocardiographic and natriuretic peptide heart failure with preserved
ejection fraction workup and scoring system») ni en el texto de los folios 3303-3305. **No se
implementa**, decisión (4) de la orden.

#### Los criterios, con su frase verificada

**Funcionales, folio 3303** — los cuatro encabezados están impresos como «Major criterion» /
«Minor criterion» con su corte:
- e′: «septal e′<7 cm/s; or lateral e′<10 cm/s [subjects aged <75 years]» y «septal e′<5 cm/s; or
  lateral e′<7 cm/s [subjects aged ≥75 years]». **Son dos renglones alternativos con su corchete
  de edad, o sea un REEMPLAZO y no una suma** — la redacción no es ambigua.
- E/e′: «average septal–lateral E/e′ ratio ≥15» (mayor) y «average septal–lateral E/e′ ratio 9-14»
  (menor).
- «Tricuspid regurgitation peak velocity or pulmonary arterial systolic pressure — Major
  criterion: TR peak velocity >2.8 m/s · Major criterion: Pulmonary artery systolic pressure
  >35 mmHg», y la prosa de la misma página lo explica: «A TR peak velocity >2.8 m/s indicates
  increased PASP and is an indirect marker of LV diastolic dysfunction». La Figura 3 las imprime en
  **un solo renglón** — «TR velocity > 2.8 m/s (PASP > 35 mmHg)» — y por eso la app las vota como
  **un criterio con dos vías, que cuenta una sola vez**.
- GLS: «Minor criterion: GLS < 16%».

**LAVI por ritmo, folio 3303** — los cuatro renglones están impresos: mayor «>34 mL/m² [in sinus
rhythm]» y «>40 mL/m² [in atrial fibrillation]»; menor «29-34 mL/m² [in sinus rhythm]» y «34–40
mL/m² [in atrial fibrillation]». El fundamento está en el folio 3304: «We therefore recommend
separate cut-offs for LAVI in SR vs. AF».

**Morfológicos, folio 3304** — «Major criterion: LVMI ≥149 g/m² in men or ≥122 g/m² in women and
RWT >0.42» y «Minor criterion: LVMI ≥115 g/m² in men or ≥95 g/m² in women or RWT >0.42 or LV
end-diastolic wall thickness ≥12 mm».

**Péptidos, folio 3304** — los cuatro renglones impresos: mayor «NT-proBNP >220 pg/mL; or BNP >80
pg/mL [in sinus rhythm]» y «NT-proBNP >660 pg/mL or BNP >240 pg/mL [in atrial fibrillation]»;
menor «NT-proBNP 125–220 pg/mL; or BNP 35–80 pg/mL [in sinus rhythm]» y «NT-proBNP 375–660 pg/mL;
or BNP 105–240 pg/mL [in atrial fibrillation]» — **éste último es el que la Figura 3 contradice**.
⚠️ **El corte del PASO 1 (cribado) es OTRO y no se usa acá:** BNP ≥ 35 o NT-proBNP ≥ 125 pg/mL.

**La regla del puntaje, folio 3304**, verbatim: «Within each domain, a major criterion scores 2
points or a minor criterion 1 point… Each domain can contribute maximally 2 points… Major and
minor criteria are not additive in a single domain. Points are added only when they come from
different domains.» Bandas: «A total score ≥5 points is considered to be diagnostic of HFpEF,
while a score of ≤1 point is considered to make a diagnosis of HFpEF very unlikely… Patients with
an intermediate score (2–4 points) need further evaluation.» Techo **6**.

⚠️ **Y NO ASIGNA CLASE NI NIVEL DE EVIDENCIA.** Es un *consensus recommendation* de la Heart
Failure Association, autodescrito como tal, no una guía de práctica de la ESC. A estos cortes **no
se les puede colgar un `Clase I · Nivel B`**.

#### La fuente SECUNDARIA, que ya no hace falta para verificar

`~/Desktop/EcoSmart_Criterios_Academicos_COMPLETO_1-18.docx` → **Sección 13 — Score HFA-PEFF**. Es
el Word de criterios de Cowork, y la orden lo admite como **secundario**. Su propia nota de
procedencia dice que el HTML del *European Heart Journal* se truncó en el criterio menor de LAVI y
que el resto se leyó en la copublicación idéntica del *Eur J Heart Fail* 2020;22(3):391-412.

**§13.3 — dominio biomarcador, transcrito:**

| Peso | Ritmo sinusal | Fibrilación auricular |
|---|---|---|
| **Mayor (2 puntos)** | NT-proBNP **> 220** pg/ml, o BNP **> 80** pg/ml | NT-proBNP **> 660** pg/ml, o BNP **> 240** pg/ml |
| **Menor (1 punto)** | NT-proBNP **125 a 220** pg/ml, o BNP **35 a 80** pg/ml | NT-proBNP **375 a 660** pg/ml, o BNP **105 a 240** pg/ml |

Justificación que el Word cita *verbatim* del original: «For diagnosing HFpEF, we hence recommend
values in patients with AF that are three times higher than used for patients in SR.»
⚠️ **El corte del PASO 1 (cribado) es OTRO y no se usa acá:** BNP ≥ 35 o NT-proBNP ≥ 125 pg/ml.

**§13.4 — regla de puntuación**, *verbatim*: «Within each domain, a major criterion scores 2 points
or a minor criterion 1 point… Each domain can contribute maximally 2 points… Major and minor
criteria are not additive in a single domain. Points are added only when they come from different
domains.» Máximo **6** puntos, dos por dominio. Bandas: **≥ 5** «considered to be diagnostic of
HFpEF» · **2 a 4** «need further evaluation» · **≤ 1** «diagnosis of HFpEF very unlikely».

⚠️ **Y NO ASIGNA CLASE NI NIVEL DE EVIDENCIA.** Es un *consensus recommendation* de la Heart Failure
Association, autodescrito como tal, no una guía de práctica de la ESC. Así que a estos cortes **no
se les puede colgar un `Clase I · Nivel B`**.

#### Lo que la app usa hoy, comparado criterio por criterio (al 2026-10-14)

**COINCIDE con el original en los VEINTIDÓS criterios**, tras la tanda del 2026-10-14. Medido por
los **dos lados de cada corte** con teclas reales (`scripts/_probe_hfcrit.mjs`, grupos `I`, `B`,
`T`, `L`, `E`, `O`; cobertura en **TC-467**, 36 condiciones):

| Dominio | Qué se verificó | Resultado |
|---|---|---|
| Funcional | e′ por edad (74 / 75 / 76 con el mismo par de anillos) | corte en `>= 75`, **reemplaza** y no suma |
| Funcional | E/e′ 8 / 9 / 14 / 15 | mayor `>= 15`, menor `9-14` cerrado |
| Funcional | IT 2,7 / 2,8 / 2,9 y PSAP 35 / 36 / 44 | **un criterio, dos vías, cuenta UNA vez** |
| Funcional | GLS 15,9 / 16,0 / 16,1 | `< 16` estricto |
| Morfológico | LAVI en los dos ritmos, ocho bordes | `>34` / `29-34` · `>40` / `34-40` |
| Morfológico | IMVI en su valor **exacto** (149,000 y 122,000) | mayor **`>=`**, menor `>` |
| Morfológico | RWT 0,416 / 0,420 / 0,424 | `> 0.42` estricto |
| Morfológico | pared 11,9 / 12,0 / 12,1 | `>= 12` |
| Humoral | los ocho cortes por sus dos lados | mayores `>`, menores rango cerrado |
| Total | 0 / 1 / 2 / 4 / 5 / 6 | `≤1` · `2-4` · `≥5` |

**TRES COSAS QUE ESA TANDA CORRIGIÓ** y que esta entrada declaraba como diferencias abiertas:

| Qué | Antes | Hoy | Por qué |
|---|---|---|---|
| **PSAP > 35 mmHg** | no votaba | **vota**, en el mismo renglón que la velocidad de IT | f. 3303 y Figura 3 |
| Operador del IMVI **mayor** | `> 149` / `> 122` | **`>= 149` / `>= 122`** | texto y figura coinciden en `≥` |
| NT-proBNP menor en FA | `375-660` | **`365-660`** | gana la Figura 3 |

El operador del IMVI **menor** se deja en `>` a propósito: ahí texto y figura **sí** difieren y
gana la figura, que es lo que la app ya tenía.

⚠️ **LA PSAP DE LA APP ES UN DERIVADO, NO UNA MEDICIÓN.** `psap_calc` es `readonly` y vale
`(4·VRT² + PmAD).toFixed(0)`: deriva de la misma velocidad de IT, **se vacía sin ella** —así que
«PSAP sola» no es un estado alcanzable— y se **redondea a entero**. El detalle está en
`docs/mapa/hfapeff-criterios.md` → §5.

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

## PRÓTESIS valvular — los criterios de la ASE 2024, criterio por criterio (W2-B, 2026-10-15)

**Documento:** Zoghbi WA, Jone PN, Chamsi-Pasha MA y cols. *Guidelines for the Evaluation of
Prosthetic Valve Function With Cardiovascular Imaging: A Report From the American Society of
Echocardiography.* J Am Soc Echocardiogr 2024;37(1):2-63. doi:10.1016/j.echo.2023.10.004.
Archivo: `05_Protesis_valvulares/Zoghbi_2024_Protesis.pdf` (62 páginas; hay una segunda copia del
mismo documento, `ASE Evaluacion protesis valvular.pdf`, con otro `md5` por metadatos).

**Regla de folio: folio = página del PDF + 1**, **comprobada en el pie impreso** y no por
aritmética: PDF 1 → 2, PDF 18 → 19, PDF 26 → 27.

⚠️ **EL TEXTO EXTRAÍDO PIERDE LOS OPERADORES Y HAY QUE RENDERIZAR.** La fuente del PDF codifica
`≥` como **`$`** y `≤` como **`#`**: `pdftotext` devuelve «Peak velocity … $2.5» y «Mean gradient
… #5». **Las Tablas 5, 7, 11, 12 y 13 se leyeron RENDERIZANDO** a 400 dpi; los operadores de abajo
son los de la imagen.

### Tabla 11, folio 27 — «Doppler findings suggestive of prosthetic mitral valve stenosis»

| Parámetro | Normal | Posible estenosis | Sugiere estenosis significativa |
|---|---|---|---|
| Velocidad pico, m/s `‡§` | `<1.9` | `1.9-2.5` | `≥2.5` |
| Gradiente medio, mmHg `‡§` | `≤5` | `6-10` | `>10` |
| VTI prótesis / VTI TSVI `‡§` | `<2.2` | `2.2-2.5` | `>2.5` |
| AEO (*EOA*), cm² | `≥2.0` | `1-2` | `<1` |
| THP (*PHT*), ms | `<130` | `130-200` | `>200` |

Notas: `*` vale para mecánicas **y** biológicas, y la exactitud diagnóstica es mejor cuando la
mayoría de los parámetros son normales o anormales a la vez. `†` la columna del medio obliga a
mirar más de cerca y a pensar en flujo aumentado, taquicardia o PPM. **`‡` esos tres parámetros
también están alterados con IM protésica significativa** —y el THP y el AEO **no** llevan esa
marca—. `§` algunas bioprótesis pueden tener cortes algo más altos; la guía **no publica cuáles**,
así que eso queda sin implementar.

⚠️ **La banda del medio del gradiente tiene un HUECO IMPRESO** (`≤5` y después `6-10`): un 5,5 no
cae en ninguna columna del original. La app lo resuelve **por complemento**.

**Folio 10** — el reparo del método del THP, verificado: calcular el AEO por el tiempo de
hemipresión es **frecuentemente inexacto y lleva a sobreestimar** el AEO, sobre todo en válvulas
normales; el AEO indexado de una prótesis mitral se calcula mejor **por la ecuación de
continuidad**. Esa misma página define el PPM mitral **sin** estratificar por IMC y **contradice a
la Tabla 7** para IMC ≥ 30: la app aplica la **tabla**, que es la que estratifica.

### Tabla 12, folio 28 — IM protésica significativa en válvulas mecánicas **con THP normal**

Velocidad pico `≥1.9 m/s` (S 90 % / E 89 %) · **relación VTI `≥2.5` (S 89 % / E 91 %)** ·
gradiente medio `≥5 mmHg` (S 90 % / E 70 %) · Vmax del chorro de IT `>3 m/s` (80 % / 71 %) ·
volumen sistólico del VI por 2D/3D más de un 30 % mayor que el sistémico por Doppler. Con la
velocidad pico y la relación VTI elevadas a la vez, la especificidad se acerca al 100 %.
**Implementado: sólo el cociente VTI.** Los otros cuatro quedan declarados.

### Tabla 13, folio 30 — severidad de la regurgitación mitral protésica

Vena contracta `<0.3 / 0.3-0.69 / ≥0.7` cm · volumen regurgitante `<30 / 30-59 / ≥60` mL ·
fracción regurgitante `<30 / 30-49 / ≥50` % · EROA `<0.20 / 0.20-0.39 / ≥0.40` cm².
Área del jet en color: leve «pequeño, central, habitualmente < 4 cm² o < 20 % del área de la AI»,
severa «grande y central, habitualmente > 8 cm² o > 50 %», **moderada «variable»**.
Flujo venoso pulmonar: dominancia sistólica / embotamiento sistólico / inversión sistólica.
Nota **`††`**: esos parámetros cuantitativos están **menos validados** que en la IM nativa.

⚠️ **LOS CUATRO CORTES CUANTITATIVOS COINCIDEN NÚMERO POR NÚMERO CON LOS DE LA NATIVA** (ASE 2017,
Tabla 8, folio 332). **Ningún paciente cambia de grado** por el régimen. Lo único distinto es el
área del jet, que la app ya conmutaba.

### Tabla 7, folio 20 — «Doppler parameter criteria of aortic valve and mitral valve PPM»

| | Normal | Moderado | Severo |
|---|---|---|---|
| **AEO aórtica**, IMC `<30` | `>0.85` | `0.85-0.66` | `≤0.65` cm²/m² |
| **AEO aórtica**, IMC `≥30` | `>0.70` | `0.70-0.56` | `≤0.55` cm²/m² |
| **AEO mitral**, IMC `<30` | `>1.2` | `1.2-0.91` | `≤0.90` cm²/m² |
| **AEO mitral**, IMC `≥30` | `>1.0` | `1.0-0.76` | `≤0.75` cm²/m² |

Nota `*`: la estructura y la motilidad de la válvula son normales y el AEO medido está dentro de
1 SD del AEO de referencia. **La tabla no abre ramas por tipo de prótesis**, así que la fila
aórtica vale también para la TAVI.

### Tabla 5, folio 19 — parámetros Doppler de la prótesis en posición aórtica

Bloque «todas las prótesis aórticas»: velocidad pico `<3 / 3-4 / ≥4` m/s · AT/tiempo de eyección
`<0.32 / 0.32-0.37 / >0.37` · tiempo de aceleración `<80 / 80-100 / >100` ms.
Bloque SAVR: gradiente medio `<20 / 20-34 / ≥35` mmHg · DVI `>0.35 / 0.25-0.35 / <0.25`.
**AEO**: la tabla la expresa en **desviaciones estándar respecto del valor de referencia del
MODELO implantado** —«reference ± 1 SD», «1 SD smaller», «2 SDs smaller»—, así que **no es
evaluable** sin marca y modelo; está declarado en la app.
Bloque TAVI: **cambio respecto de un basal post-implante** —gradiente `≥20 mmHg`, DVI `≥0.2` o
`≥40 %`, AEO `≥0.6 cm²` o `≥50 %`—, que la app **no gradúa** porque no elige ese basal.
Nota de integración: para decir «significativa» hacen falta **un parámetro dependiente del flujo
y uno independiente** del flujo.

### Tabla 8, folio 23 — regurgitación paravalvular aórtica

Extensión circunferencial `<10 / 10-29 / ≥30 %` · vena contracta `<0.3 / 0.3-0.6 / >0.6` cm ·
área de la vena contracta `<0.10 / 0.10-0.29 / ≥0.30` cm². **Implementada sólo en el módulo
TAVI**; una SAVR con jet paravalvular no tiene dónde cargarla (W1-12, pide campos nuevos).

### Lo que esta tanda NO pudo atribuir, y por qué

- **El 20 % y el 40 % del jet/AI NATIVO.** La ASE 2017, Tabla 8, folio 332, y el folio 333
  publican severa **por encima del 50 %** del área de la aurícula y **no publican ni el 20 ni el
  40** —censado el PDF entero—. El 20/40 viene de guías previas que este repo no tiene
  verificadas. **El número no se tocó** (decisión de Maicol); lo que se corrigió es el rótulo, que
  ya no se lo atribuye a la ASE 2017.
- **Los cortes de la ayuda `#ref-pao`** seguían atribuidos a «ESC 2021 · VARC-3», y
  **«ESC/EACTS 2021» tiene CERO entradas en este registro**. La línea del PPM se reescribió con la
  Tabla 7 y su folio; el resto de esa tarjeta queda como estaba y declarado.

---

## La tanda G2 (2026-10-15) NO ESTABLECE NINGÚN CORTE CLÍNICO — por qué no lleva citas nuevas

El G2 es Excel, importador y Laboratorio. **No mueve un solo umbral, ni un operador, ni una regla
de integración, ni una frase del informe firmado**, así que no hay nada que verificar contra una
guía y **ninguna de sus piezas lleva corchete**.

Lo que cada pieza nueva usa, y de dónde sale:

| Pieza del G2 | Qué número usa | Fuente |
|---|---|---|
| Columna `TAPSE/PSAP (mm/mmHg)` | **ninguno**: publica la división `TAPSE / PSAP` | es aritmética; el valor lo da `vdTapsePsapRed`, el dueño del **G1** |
| Columna `Diámetro arteria pulmonar (mm)` | **ninguno**: publica el valor tipeado | el campo y su banda `[5, 80]` mm nacieron en el **G1** |
| Las cuatro asociaciones | **ninguno**: Spearman y Kruskal-Wallis no llevan corte | las pruebas ya estaban en el módulo |
| Tabla de válvulas binaria | **ninguno**: reparte lo que el token guardado dice | los tokens binarios son del 2026-10-13 (EM) y del 2026-10-05 (ET) |

⚠️ **LOS TRES TRAMOS DEL COCIENTE SIGUEN SIENDO LOS DEL G1, CON SU RESERVA INTACTA.** El `0,55`
está verificado —ESC/ERS 2022, Tabla 10, folio 28— y el **`0,36` NO está verificado al estándar
de la casa**: nace de Guazzi 2013, que **no está en la biblioteca**, y se leyó a través de un
metaanálisis en línea. El G2 **no los usa para nada**: la columna del Excel publica el número y
no su tramo, y Spearman trabaja por rangos. La reserva vive donde ya estaba —la tarjeta ⓘ del
cociente la dice en voz alta— y en `docs/PENDIENTES.md` → **G1-6** y **G1-7**.

⚠️ **Y LA COMPARACIÓN «AP > RAÍZ AÓRTICA» SIGUE SIN CONECTAR**, que es lo que la Tabla 10 de la
ESC/ERS 2022 pide en su categoría B. El G2 le dio columna de Excel al diámetro, no un criterio:
`docs/PENDIENTES.md` → **G1-11**.

---

## Lo que falta y lo que no se pudo abrir

En `docs/fuentes/PENDIENTES_FUENTES.md`: las fuentes que **no se pudieron verificar** (Hatle 1979,
Lancellotti 2013, la Tabla S3 suplementaria de la ESC/EACTS 2025, los cortes de TC mitrales), las que
**faltan** para aórtica, tricúspide, pulmonar y congénitas, y el **procedimiento** para incorporar
una fuente nueva al registro.

---

## Derechos de autor de la ASE 2025 y de la ASE/EACVI 2016 — VERIFICADOS EN EL PDF (2026-10-13)

Leídos para la tanda de los diagramas de flujo de esas dos guías. **Ninguna de las dos es de
acceso abierto**, a diferencia de la BSE 2024 (CC BY 4.0, ver arriba).

### ASE 2025 — Nagueh SF y cols., J Am Soc Echocardiogr 2025;38(7):537-69

Texto EXACTO del pie de la **página 1** del PDF (`Nagueh_2025_Diastolica.pdf`), que además
confirma la regla de folio (página 1 → folio **537**, o sea folio = página del PDF + 536):

> «0894-7317/$36.00
> Copyright 2025 Published by Elsevier Inc. on behalf of the American Society of
> Echocardiography.
> https://doi.org/10.1016/j.echo.2025.03.011»

### ASE/EACVI 2016 — Nagueh SF y cols., J Am Soc Echocardiogr 2016;29(4):277-314

Texto EXACTO del pie de la **página 1** del PDF (`LV-Diastolic-Function-ASE-EACVI-2016.pdf`), que
confirma la regla de folio (página 1 → folio **277**, o sea folio = página del PDF + 276):

> «0894-7317/$36.00
> Copyright 2016 by the American Society of Echocardiography.
> http://dx.doi.org/10.1016/j.echo.2016.01.011»

### Qué implican, y qué se hizo

- **¿Acceso abierto?** NO, ninguno de los dos.
- **¿Con qué licencia?** Ninguna licencia pública. Aviso de copyright reservado, de Elsevier en
  nombre de la ASE (2025) y de la ASE (2016).
- **¿Permiten adaptaciones?** No lo dicen. No hay concesión de derechos de ningún tipo.
- **¿Uso comercial?** Tampoco lo dicen. No hay concesión.
- **Barrido del PDF completo** buscando `Creative Commons`, `creativecommons`, `CC BY`,
  `open access`, `This is an open` y `under the terms of`: **cero coincidencias en los dos**. La
  única aparición de «permission» en los dos documentos es un «Reprinted with permission from
  Klein et al.» en una figura ajena de la ASE 2025 (página 26), que es lo contrario de una
  licencia abierta: es una figura de terceros reproducida con permiso individual.

**NINGUNO DE LOS DOS AVISOS PROHÍBE EXPRESAMENTE lo que esta tanda hace**, así que las dos guías
siguieron adelante y **no hubo que parar ninguna**. Lo que esos avisos reservan es la **obra** —su
expresión: la disposición gráfica, el texto literal de las cajas, la tipografía, los colores—. Lo
que la app dibuja NO es esa obra:

- **disposición propia**: cinco columnas verticales, una por cadena de decisión, contra el reparto
  horizontal del original;
- **palabras propias en todas las cajas**: ni un rótulo copia el literal de la figura;
- **sólo la lógica de decisión que la app ya implementa** —cortes y operadores, que son datos
  clínicos y no expresión—;
- **los valores de ESTE paciente adentro**, que el original no tiene.

El pie de los cuatro dibujos lo declara con el texto que fijó la orden, y **no atribuye ninguna
licencia Creative Commons**, que es lo que corresponde a la BSE 2024 y lo que NO corresponde a
estas dos:

> «Lógica según el algoritmo de la Figura N, ASE 20XX, folio X; dibujo propio, no es una
> reproducción de la figura. […] artículo NO de acceso abierto, así que no se reproduce ninguna
> figura ni el texto de sus cajas.»

TC-462 lo fija por los dos lados: los cuatro pies declaran el folio, que el dibujo es propio y que
el artículo no es de acceso abierto, y **ninguno** nombra una licencia Creative Commons; el de la
BSE 2024 **sí** sigue atribuyendo su CC BY 4.0.

---

## Las cuatro figuras de la ASE, caja por caja y flecha por flecha (2026-10-13)

Leídas del texto de su propia página para la tanda de los diagramas. **Ni un corte ni un operador
se movieron**: lo verificado es que la app ya los implementaba bien.

### Figura 3 — ASE 2025, ritmo sinusal (folio 554 = página 18 del PDF)

Literal de la caja del algoritmo:

- `1. Reduced e' velocity: septal ≤6 or lateral ≤ 7 or average ≤ 6.5 cm/s *`
- `2. Increased E/e': septal ≥ 15 or lateral ≥ 13 or average ≥ 14`
- `3. Increased TR velocity ≥ 2.8 m/s or PASP ≥ 35 mm Hg`
- `All normal` → `Normal DF` / `Normal LAP`
- `Reduced e' only` → `E/A ≤ 0.8` → `Grade 1` · `E/A > 0.8` → segundo paso
- `Increased TR/PASP only or Increased E/e' only or Any 2 abnormal variables` → segundo paso
- `3 of the above` → `Increased LAP` → `E/A < 2` → `Grade 2` · `E/A ≥ 2` → `Grade 3`
- Segundo paso: `Pulmonary Vein S/D ≤0.67 or LARS ≤ 18% or LAVi > 34 mL/m2`,
  `Alternatively IVRT ≤ 70 ms`, `If none available or reliable use Supplemental methods‡`
- `≥1 present` → `Increased LAP` · `None` → `Normal LAP` + `Diastolic Exercise Echo If symptomatic`
- Nota ‡ del pie: `PR end-diastolic velocity ≥ 2 m/s, PA diastolic pressure ≥ 16 mm Hg, mitral
  inflow L-wave velocity ≥ 50 cm/s, Ar-A duration > 30 ms, and/or a decrease in mitral E/A ratio
  of ≥50% with Valsalva maneuver.`

### Figura 8 — ASE 2025, fibrilación auricular (folio 563 = página 27 del PDF)

- Paso 1: `1. Mitral E velocity ≥ 100 cm/s` · `2. Septal E/e' ratio > 11` ·
  `3. TR velocity > 2.8 m/s or PASP > 35 mm Hg` · `4. DT ≤160 ms`
- `3 or more of above` → `Elevated LAP` · `None or 1 of above` → `Normal LAP` ·
  `2 of above` → paso 2
- Paso 2: `LARS <18%` · `Pulm vein S/D ratio <1` · `BMI > 30 kg/m2`
- `2/3 or 3/3` → `Elevated LAP` · `None` → `Normal LAP` ·
  `1 only or not available or not reliable` → `Indeterminate`

⚠️ **DOS GUARDAS DE LA APP SON MÁS CONSERVADORAS QUE LA FIGURA, y se conservan tal cual** (son de
HEAD y esta tanda no las toca): el «None or 1 of above» de la app exige además que no haya ningún
criterio **sin medir**, y el «None» del paso 2 exige los **tres** medidos. Con criterios sin medir
la app no afirma y publica «Datos insuficientes», que es la caja punteada del dibujo.

### Figura 8 — ASE/EACVI 2016 (folio 290 = página 14 del PDF)

**8A, FEVI normal**: `In patients with normal LV EF` · `1-Average E/e' > 14` ·
`2-Septal e' velocity < 7 cm/s or Lateral e' velocity <10 cm/s` · `3-TR velocity > 2.8 m/s` ·
`4-LA volume index >34ml/m2`; `>50% positive` → `Diastolic Dysfunction`; `50% positive` →
`Indeterminate`; `<50% positive` → `Normal Diastolic function`.

**8B, FEVI deprimida**: `Mitral Inflow` → `E/A ≤ 0.8 + E ≤ 50 cm/s` ·
`E/A ≤ 0.8 + E > 50 cm/s or E/A > 0.8 - <2` · `E/A ≥ 2`; los tres criterios
`1-Average E/e' > 14` · `2-TR velocity > 2.8 m/s` · `3-LA Vol. index>34ml/m2`;
`2 of 3 or 3 of 3 Positive` → `↑ LAP / Grade II Diastolic Dysfunction`;
`2 of 3 or 3 of 3 Negative` → `Normal LAP / Grade I Diastolic Dysfunction` + `If Symptomatic`
`Consider CAD, or proceed to diastolic stress test`; `When only 2 criteria are available`:
`1 positive and 1 negative` → `Cannot determine LAP and Diastolic Dysfunction Grade`; y el pie
`(*: LAP indeterminate if only 1 of 3 parameters available. Pulmonary vein S/D ratio <1 applicable
to conclude elevated LAP in patients with depressed LV EF)`.

⚠️ **EL DIBUJO DE LA 8B FUNDE LAS DOS ENTRADAS A «Cannot determine» EN UNA SOLA CAJA**, porque es
una sola casilla de la figura: la sub-caja «1 positive and 1 negative» de los dos criterios
disponibles y el pie «only 1 of 3 parameters available». El título de la caja nombra las dos y el
renglón de resultado de la ventana dice cuál fue.

---

### VSFVI automático y volumen latido del VI — por qué NO llevan cita (F1, 2026-10-15)

Los dos campos automáticos de la pestaña AI/VI (`vauto-vsfvi` y `vauto-vol-lat`) calculan
`VDFVI × (1 − FEVI/100)` y `VDFVI − VSFVI`. **No llevan corchete, y es deliberado**: no son un
criterio ni un corte, son **álgebra de la definición de fracción de eyección**
(`FEVI = (VDF − VSF) / VDF × 100`, despejada). Un corchete sobre una identidad aritmética se lee
como si hubiera una guía detrás eligiendo un número, que es lo contrario de lo que pasa acá. Es
la misma regla por la que una banda de plausibilidad va **sin cita**.

**No hizo falta abrir la ASE/EACVI 2015 de cuantificación de cámaras.** La relación entre los dos
volúmenes y la FEVI no es un dato que una guía aporte, y la app ya la implementa en el panel del
**VI 3D** con las mismas dos guardas desde antes de esta tanda. Lo que **sí** sale de la ASE/EACVI
2015 —y no se tocó— son los cortes del **VSFVI indexado** por sexo que clasifica `vsfviInterp`
(Tabla 2 y Tabla suplementaria 3, método biplano de discos; varón normal ≤31 ml/m², mujer ≤24),
que ya estaban registrados en el comentario de esa función.

### El GASTO CARDÍACO del PDF — qué frecuencia cardíaca usa (F1, 2026-10-15)

No hay ninguna guía detrás: el gasto es `área TSVI × VTI TSVI × FC`, y lo que esta tanda decide es
**de dónde sale la FC**. Hasta hoy, sin FC cargada el PDF suponía **70 lpm** y lo marcaba con un
`*` que **no tiene pie de página en ningún lado del documento** —censo del archivo, cero
apariciones de una nota que lo explique—. Hoy sin FC usable no hay fila. La banda de la FC
(`HEMO_FC_BANDA = [20, 250]`, exclusiva en los dos extremos) es una **banda de plausibilidad** y
por eso va sin cita, igual que las demás.

---

## La tanda «G3» (2026-10-15) — por qué NO lleva ninguna cita nueva

Las tres partes de esta tanda son de **disposición, de reparto y de mensaje**, y ninguna
establece un corte clínico.

- **La FAC visible y su mensaje «requiere …»** no tocan la cuenta ni el corte. Siguen siendo
  `UMBRAL_FAC_VD_NORMAL = 35 %` y `UMBRAL_FAC_VD_SEVERA = 25 %`, de la ASE 2015 y del criterio
  de la app, ya registrados. El texto que se agrega nombra las dos áreas que faltan: no afirma
  nada clínico.
- **El diámetro de la arteria pulmonar** cambia de lugar en la pantalla y nada más. Su banda
  `IP_AP_BANDA = [5, 80]` mm es **de plausibilidad y no de severidad**, así que va sin cita
  —regla de la casa: un rango de lo medible no es un criterio—; su registro del G1, con la
  Tabla 1 de la ASE 2025 (folio 145) como referencia de lo que ese diámetro significa, no se
  tocó.
- **El selector de la relación VD/VI** publica el MISMO corte que ya aplicaba el campo
  numérico: `VD_VI_HTP_MIN = 1,0`, borde `>`, de la **ESC/ERS 2022, Tabla 10, folio 28**
  (categoría A, «Ventrículos») y de la **ASE 2025, Tabla 8, folio 173** («Dilated right heart:
  RV/LV >1»). Las dos entradas ya están verificadas y **no se movió ni el número ni el
  operador**: el borde exacto 1,00 sigue cayendo del lado no alterado, y el selector corta
  igual para que los dos controles no puedan discrepar.
- **El PPT estadístico y la mini-tabla del PDF de auditoría** cambian cómo PUBLICAN lo que ya
  contaban. Las dos estenosis binarias salen de decisiones de la app ya registradas —la mitral
  del 2026-10-13 y la tricuspídea del 2026-10-05— y ningún conteo se movió.
- **El mensaje del importador** es texto de interfaz sobre columnas calculadas. Los datos de
  origen que nombra se leyeron del propio código, no de una guía.

---

## La tanda «Z» (2026-10-15) — el cociente TAPSE/PSAP, uso por uso

> Todo lo de esta sección se leyó en el **texto completo** del PDF que está en la biblioteca del
> Escritorio. Lo que no se pudo verificar, y lo que se verificó y **no** se usó, está más abajo.

### Por qué la ESC/ERS 2022 se cita por NÚMERO DE TABLA y no por folio

La biblioteca tiene **sólo la traducción de la SEC** (`Humbert_2022_Hipertension_Pulmonar.pdf`).
Las entradas anteriores de este archivo citaban «folio 28» y «folio 41» para esta guía, y **los
dos números se re-verificaron en el Z y siguen siendo correctos para ESE documento**: la Tabla 10
está en el folio 28 y la Tabla 16 en el 41.

⚠️ **LO QUE NO SE PUDO COMPROBAR ES LA PAGINACIÓN DEL ORIGINAL INGLÉS, porque no está en la
biblioteca.** La orden del médico advierte que difiere, y no hay con qué verificarlo acá. Por eso
la **tarjeta del globo** —que es lo que el médico lee— cita por **número de tabla**, que es lo
único que vale en las dos ediciones; este archivo conserva además el folio de la traducción, que
es el documento que sí se leyó. Un folio que el lector no puede comprobar en el documento que
tiene delante parece verificable y no lo es.

⚠️ Es un primo de la trampa que `ecosmart/CLAUDE.md` ya documenta para la ESC/EACTS 2025 —allá la
traducción de la SEC se comió una palabra y dio vuelta un hallazgo entero—, con la diferencia de
que **acá no se detectó ninguna palabra faltante**: lo único declarado es que la paginación no
coincide, y eso no se midió sino que se tomó de la orden.

### Los CINCO usos que la tarjeta publica

| Uso | Población | Corte | Resultado | Fuente | Dónde se leyó |
|---|---|---|---|---|---|
| (i) | Hipertensión pulmonar | **< 0,55** | signo de la categoría **A: Ventrículos** | ESC/ERS 2022, **Tabla 10** | «Signos ecocardiográficos adicionales indicativos de hipertensión pulmonar»; el renglón dice «Cociente TAPSE/PAPs < 0,55 mm/mmHg». Folio 28 de la traducción de la SEC |
| (ii) | Hipertensión arterial **pulmonar**, riesgo | **> 0,32** bajo · **0,19-0,32** intermedio · **< 0,19** alto | mortalidad estimada a **un año** < 5 %, 5-20 % y > 20 % | ESC/ERS 2022, **Tabla 16** | «Evaluación completa del riesgo en la hipertensión arterial pulmonar (modelo en tres niveles)», fila «Ecocardiografía». Folio 41 de la traducción |
| (iii) | Adultos sanos / hipertensión pulmonar | **0,5 a 0,7** / **0,3 a 0,4** | rango habitual / desacoplamiento VD-AP y más mortalidad | **ASE 2025** (Mukherjee), **folios 152 y 173** | folio 152: «the TAPSE/PASP ratio generally falls within the range of 0.5–0.7 mm/mmHg» y «in PH, a TAPSE/PASP ratio in the range of 0.3-0.4 mm/mm Hg is associated with RV-PA uncoupling». Folio 173: la fila de la tabla. **Los dos folios comprobados en el pie impreso** (PDF 12 → 152, PDF 33 → 173) |
| (iv) | Terapia de resincronización | **< 0,45** | más mortalidad por cualquier causa, **HR 1,44** | **Stassen J, y col., ESC Heart Failure 2022** | n = 807; el corte sale de **análisis de splines**; HR 1,437 (IC 95 % 1,145-1,805; p = 0,002) en multivariable, mientras el TAPSE < 17 mm **no** fue independiente (HR 1,237; p = 0,061) |
| (v-a) | Insuficiencia cardíaca con fracción preservada, **hospitalizada** | **< 0,45** | más muerte o reingreso por insuficiencia cardíaca | **Wang J, y col., Clinical Cardiology 2024** (47:e24308) | n = 414 analizados de 648; el corte es el **óptimo por curva ROC** para muerte por cualquier causa; asociación independiente con el compuesto muerte o rehospitalización por IC |
| (v-b) | Insuficiencia cardíaca **aguda** con FEVI **> 40 %** | **< 0,38** | más mortalidad a largo plazo, **HR 2,21** | **Burgos LM, y col., Arch Peru Cardiol Cir Cardiovasc 2025;6(2):83-89** | n = 361 de 465; seguimiento mediano 20,9 meses; HR 2,21 (IC 95 % 1,26-3,81; p = 0,005) ajustado |

**La tarjeta no lleva ninguna nota de verificación ni reserva**: eso es estado interno del proceso
y vive acá y en `docs/PENDIENTES.md`. Lo que el médico lee en la tarjeta son los cortes que la app
puede respaldar, y nada más.

### VERIFICADA Y NO USADA — la serie de embolia pulmonar

**Lyhne MD, y col. «Right ventricular-pulmonary artery coupling for prognostication in acute
pulmonary embolism». Eur Heart J Acute Cardiovasc Care 2024;13:817-825.** Está en la biblioteca
(`13_Tromboembolia_pulmonar/zuae120.pdf`) y **se leyó**: registro **RIETE**, **4.478 pacientes**
(1.326 de riesgo bajo, 2.425 intermedio-bajo y 727 intermedio-alto), con **TAPSE/PASP < 0,44** y
**< 0,34** en los de riesgo intermedio-alto (aOR 4,37; IC 95 % 1,27-15,0) asociados a mortalidad a
30 días.

**Decisión de Maicol (15/10/2026): NO entra en la tarjeta.** Queda registrada acá como **fuente
disponible y no usada**, para que la próxima tanda que la necesite no tenga que volver a buscarla
ni vuelva a creer que falta.

### LO QUE SIGUE SIN PODERSE CITAR

- **El 0,36 en insuficiencia cardíaca.** Nace de **Guazzi M, y col., Am J Physiol Heart Circ
  Physiol 2013;305:H1373-H1381**, que **no está en la biblioteca**; se leyó sólo a través del
  metaanálisis de Heart Fail Rev 2024, en línea. Por la regla de la casa **no está verificado**.
  ⚠️ **Y desde el Z ese corte ya no se aplica en ninguna parte**: el tramo de 0,36 de la fila del
  Doppler tricuspídeo se retiró con su constante. La app dejó de afirmar en pantalla lo que la
  tarjeta se negaba a afirmar. `docs/PENDIENTES.md` → G1-6 queda **cerrado por retiro**, no por
  verificación.
- **La discrepancia que anotó Cowork, confirmada.** La **ASE 2025, folio 180**, escribe «The
  ESC/ERS guidelines recommend a TAPSE/PASP <0.36 mm/mm Hg as suggestive of PH» — y **la Tabla 10
  de la ESC/ERS 2022 no tiene ese número**: corta en **0,55**, y su Tabla 16 en 0,19 y 0,32.
  Barrido el PDF completo de la traducción: **el 0,36 no aparece en ninguna de las dos tablas**.
  O sea que la atribución de la ASE 2025 **no se pudo confirmar en el documento que esta
  biblioteca tiene**. No se corrige nada: se reporta.
- **El 0,46 de la IC con fracción levemente reducida** y el **0,406 de la reparación tricuspídea
  por catéter** siguen apareciendo **sólo en resúmenes**, sin texto completo leído. No se citan.

### El 0,32 de la pantalla de TEP — lo que cambió del diagnóstico, y lo que NO

El número está publicado y verificado: es el umbral de **riesgo bajo en hipertensión arterial
pulmonar** de la **Tabla 16**, no un criterio de tromboembolia. Eso ya estaba dicho (G1-2). Lo que
el Z agrega es una **medición nueva**: ese corte **participa de un VEREDICTO** en esa pantalla.
Ver `docs/PENDIENTES.md` → **Z4-TEP**.

---

## La tanda Z5 — la Tabla 11 completa, criterio por criterio, y qué NO dice la guía (2026-10-15)

**Documento:** Zoghbi WA *et al.*, *Guidelines for the Evaluation of Prosthetic Valve Function
With Cardiovascular Imaging*, J Am Soc Echocardiogr 2024;37(1).
Archivo: `05_Protesis_valvulares/Zoghbi_2024_Protesis.pdf`.
**Regla de folio: folio = página 1-based del PDF + 1**, comprobada en el pie impreso de cuatro
páginas (PDF 23 → 24, PDF 24 → 25, PDF 25 → 26, PDF 26 → 27).

### Tabla 11, folio 27 — leída RENDERIZANDO a 400 dpi

⚠️ **EL TEXTO EXTRAÍDO NO SIRVE PARA LEER LOS OPERADORES, y no es porque sea una imagen:** la
fuente del PDF codifica `≥` como **`$`** y `≤` como **`#`**, así que el extractor devuelve
«`$2.5`» y «`#5`». Hay que renderizar la página.

| Parámetro | Normal* | Possible stenosis† | Suggests significant stenosis*† | nota ‡ |
|---|---|---|---|---|
| Peak velocity, m/sec | `<1.9` | 1.9-2.5 | `≥2.5` | sí |
| Mean gradient, mm Hg | `≤5` | 6-10 | `>10` | sí |
| VTI(PrMv)/VTI(LVOT) | `<2.2` | 2.2-2.5 | `>2.5` | sí |
| EOA, cm² | `≥2.0` | 1-2 | `<1` | **no** |
| PHT, msec | `<130` | 130-200 | `>200` | **no** |

- **Nota `*`** — para válvulas mecánicas o biológicas; la exactitud diagnóstica es mejor cuando la
  mayoría de los parámetros son normales o anormales, respectivamente.
- **Nota `†`** — los valores intermedios motivan una evaluación más detallada: flujo aumentado,
  frecuencia cardíaca elevada o desajuste prótesis-paciente.
- **Nota `‡`** — esos parámetros **también** son anormales con regurgitación protésica
  significativa. **Marca tres: velocidad pico, gradiente medio y DVI. NO marca el AEO ni el THP.**
- **Nota `§`** — algunas prótesis biológicas pueden mostrar cortes algo más altos.

### Folio 24, prosa — los CUATRO criterios principales

Verificado en el texto corrido de la página cuyo pie impreso dice «24»: los criterios principales
para el diagnóstico de estenosis mitral significativa son un **gradiente medio `>10` mmHg a
frecuencia normal, un THP `>200` ms, un DVI `>2,5` y un AEO `<1` cm²`**.

⚠️ **ESA ENUMERACIÓN OMITE LA VELOCIDAD PICO**, que la Tabla 11 sí incluye. Es la única diferencia
entre la tabla y la prosa, y es la que decide **quién vota** en la app: la velocidad pico se
muestra con su banda y no entra en el conteo.
⚠️ **Los cuatro cortes coinciden letra por letra entre la prosa y la tabla**, así que no hubo
ninguna contradicción que dirimir y **ningún corte se movió**.

### Lo que la guía NO publica, y por eso el umbral es criterio EcoSmart

**No hay regla de integración.** Censado en el Z y re-verificado acá: la nota `*` habla de
**confianza** diagnóstica y no define un umbral de conteo; la prosa del folio 24 dice **cuáles**
son los criterios y no **cuántos** hacen falta; **no hay figura de algoritmo** para la estenosis
protésica mitral —las tres que existen son la 13 (velocidad pico aórtica), la 16 (IAo protésica) y
la 21 (IM protésica)—; y los Key Points del folio 29 no agregan ninguna.

Por eso el umbral de **dos o más** es **decisión de Maicol** y la tarjeta ⓘ lo declara como
criterio EcoSmart, con la nota de la guía al lado. **No se le atribuye a la ASE 2024.**

### Lo que esta tanda NO agregó

- **Ninguna cita nueva** en el panel de Evidencia.
- **Ningún corte nuevo**: los cuatro de la mitral y los dos juegos del DVI aórtico ya estaban
  verificados y registrados (ESC/EACTS 2025 folio 4663 y EAE/ASE 2009 Tabla 3 para la nativa;
  ASE 2024 Tabla 5 para la prótesis).
- **Ninguna fuente nueva en la biblioteca.**

## La tanda Z6 — la nota `‡` de la Tabla 11 y la Tabla 12, leídas en el original (2026-10-15)

**Documento:** Zoghbi WA *et al.*, *Guidelines for the Evaluation of Prosthetic Valve Function With
Cardiovascular Imaging*, J Am Soc Echocardiogr 2024;37(1).
Archivo: `05_Protesis_valvulares/Zoghbi_2024_Protesis.pdf`.
**Regla de folio: folio = página 1-based del PDF + 1**, comprobada otra vez en el pie impreso de la
página del PDF 26, que dice «27».

### La nota `‡` de la Tabla 11, folio 27 — qué marca y qué NO marca

Leída **renderizando la página a 400 dpi** —la fuente del PDF codifica `≥` como `$` y `≤` como `#`,
así que el texto extraído no sirve para los operadores— y confirmada además en el texto extraído,
que sí conserva los marcadores de nota:

| Parámetro de la Tabla 11 | ¿lleva `‡`? |
|---|---|
| Peak velocity, m/sec | **sí** |
| Mean gradient, mm Hg | **sí** |
| VTI(PrMv)/VTI(LVOT) — el DVI | **sí** |
| EOA, cm² | no |
| PHT, msec | no |

La nota dice, parafraseada: **esos parámetros también resultan anormales en presencia de una
regurgitación protésica significativa.** Habla de regurgitación **«significativa»**, sin graduarla.

⚠️ **ESO ES LO QUE DECIDIÓ LA RAMA DEL Z6-1.** La orden autorizaba retirar el gradiente medio del
voto —con el mismo umbral que la app ya aplica al DVI— si la guía hablaba de regurgitación
«significativa», «moderada o mayor» o sin precisar grado, y la obligaba a parar si hablaba **sólo de
regurgitación severa**. Dice «significativa», así que se aplicó. La **velocidad pico** lleva la misma
marca y **no se tocó**: no vota (la prosa del folio 24 la omite de los criterios principales), de
modo que retirarla no cambiaría ningún veredicto y sólo le quitaría al médico la banda que la tabla
sí publica.

### La Tabla 12, folio 28 — el gradiente con el THP normal

**Título, parafraseado:** hallazgos ecocardiográficos transtorácicos sugestivos de regurgitación
protésica mitral significativa **en válvulas mecánicas con THP normal**. Sus cuatro filas:

| Hallazgo | Sensibilidad | Especificidad | Comentario de la tabla |
|---|---|---|---|
| Velocidad pico mitral `≥ 1,9` m/s | 90 % | 89 % | considerar también flujo alto y PPM |
| VTI(PrMV)/VTI(LVOT) `≥ 2,5` | 89 % | 91 % | el error de medición crece en fibrilación auricular |
| **Gradiente medio `≥ 5` mmHg** | **90 %** | **70 %** | **a frecuencias fisiológicas; considerar flujo alto y PPM** |
| Velocidad máxima del chorro de IT `> 3` m/s | 80 % | — | — |

Su nota `*` atribuye los datos a Olmos *et al.* y agrega que, con la velocidad pico **y** el DVI
elevados y el THP normal, la especificidad se acerca al 100 %.

El pie de la **Figura 20, folio 29**, razona igual sobre un caso: un cociente de VTI de 3 alerta
sobre una regurgitación concomitante **en ausencia de estenosis**, inferida de un THP normal.

⚠️ **LA AFIRMACIÓN DE COWORK QUEDA VERIFICADA, CON UNA ACOTACIÓN QUE LA GUÍA PONE Y LA ORDEN NO
TENÍA.** Es cierto que con el THP normal un gradiente medio de 5 mmHg o más orienta a regurgitación
y no a estenosis — pero el título de la Tabla 12 dice **«in mechanical valves»** con todas las
letras. La app lo aplica sólo a las prótesis **mecánicas**; con una biológica el gradiente cuenta
como hasta hoy. Extenderlo sería aplicar un corte fuera del alcance de su fuente.

⚠️ **Y SÓLO SE RETIRA LO QUE ESTÁ POR ENCIMA DE LA BANDA NORMAL DE LA TABLA 11** (`≤ 5` mmHg). El 5
exacto es el único punto donde las dos tablas se pisan —la 11 lo llama normal y la 12 arranca en
`≥ 5`— y se conserva la lectura de la Tabla 11, que es la que esta pantalla publica.

### Lo que esta tanda NO agregó

- **Ninguna cita nueva** en el panel de Evidencia.
- **Ningún corte nuevo ni movido**: los cinco de la Tabla 11 y los dos juegos del DVI aórtico siguen
  exactamente donde estaban.
- **Ninguna fuente nueva en la biblioteca.**
- **Ningún texto nuevo en el informe firmado.** La guía propone además *mostrar* que el hallazgo
  orienta a regurgitación; la orden lo prohíbe expresamente y queda como propuesta en
  `docs/PENDIENTES.md`.

### La tanda Y1 — la vista 2D no lleva ninguna cita

El esquema 2D es **cualitativo** y **de sólo lectura**: no aplica ningún corte propio, no gradúa
nada y no afirma nada que la app no haya publicado antes. Todo lo que muestra —grados, categorías de
cavidades, geometría y veredictos protésicos— lo calcularon y lo citaron otras funciones, cada una
con su fuente registrada en este archivo. **Por eso no lleva ni una cita: no hay en la vista una
sola afirmación clínica propia que citar.** Es el mismo criterio con que el panel de Evidencia
declara que una banda de plausibilidad va sin cita.


---

## Las tandas «Y1b» y «Y2» (2026-10-16) — por qué NO llevan ninguna cita nueva

El **Y1b** es tamaño, estilo y disposición de la vista 2D: no toca un corte, un grado ni un texto
clínico, así que no hay nada que citar.

El **Y2** agrega a cada tarjeta de esa vista el «porqué» de su grado, y **todo lo que publica lo
LEE de la pantalla de Válvulas**: el nombre del criterio sale de su propio rótulo, el valor con su
unidad y su redondeo del span que la app ya pintó, el grado del nodo que su fila ya publica, la
línea «Decide» del renglón integrado, el aviso de discordancia de su propio nodo y el fundamento
del cajón del ajuste manual. **No hay un solo corte nuevo, ninguna banda nueva y ninguna frase
clínica nueva**: los únicos textos que esta tanda escribe son los rótulos de interfaz «Ver
criterios», «Ocultar criterios», «Decide: », «Fundamento: », «no vota» y «decide». Por eso ninguna
fila de ninguna tarjeta lleva corchete de cita: lo que afirma ya lo afirma la pantalla, con la
fuente que esa pantalla declara.

### Lo único que se volvió a verificar en el original: el DVI protésico aórtico

Pedido como control de solo lectura. **ASE 2024 (Zoghbi), Tabla 5 — «Doppler parameters of
prosthetic valves in the aortic valve position», folio 19** (página 18 del PDF; folio = página + 1,
**comprobado en el pie impreso**: «Journal of the American Society of Echocardiography · Volume 37
Number 1 · Zoghbi et al · 19»). La fila `DVI` publica, en sus tres columnas:

> Normal `>0.35` · Possible stenosis `0.25-0.35` · Suggests significant stenosis `<0.25`

y la nota de la tabla declara que la estenosis significativa pide **al menos un parámetro
dependiente del flujo y uno independiente del flujo**. Coincide carácter por carácter con
`EA_PROT_CRIT.savr_dvi_normal_min` (0,35, estricto) y `savr_dvi_signif_max` (0,25), que son los que
la app aplica desde el W2-B. **No se movió ningún corte.** La medición de qué valor compara cada
consumidor está en `docs/PENDIENTES.md` → **Y2-7**.

---

## La tanda «Y1c» (2026-10-16) — por qué NO lleva ninguna cita nueva

Es **sólo presentación**. La vista 2D pasa de ventana flotante a panel en línea, el botón gana un
estado prendido, el dibujo recupera su alto y se corrigen dos defectos de maquetación. Censado y
medido contra HEAD:

- **Ningún corte, ninguna banda, ninguna regla de integración y ningún grado se movieron.** A/B
  con el **PDF, el PPT y el PDF de auditoría generados de verdad**, en cuatro escenas: informe en
  los tres estilos, EN SUMA, grados, cápsulas, Laboratorio y las **440 columnas del Excel clave
  por clave** salen **idénticos**, con **0 diferencias**.
- **El texto de las tarjetas, de la tabla de cavidades y de la nota tampoco cambia**: A/B en ocho
  escenas por dos motores, **0 diferencias**, con las listas «Ver criterios» abriendo igual.
- Lo único que se agrega a la pantalla es el **`title`** de la línea de fase, que repite palabra
  por palabra el texto que esa misma línea ya imprime («contracción isovolumétrica», «eyección»,
  «relajación isovolumétrica», «llenado ventricular», «contracción auricular»). No es una
  afirmación clínica nueva: es el mismo rótulo, disponible para un lector de pantalla cuando el
  renglón se recorta.
- Las dos decisiones de esta tanda —los 240 px de la columna central y los 220×300 del lienzo—
  salen de **medir la app**, no de una guía: 218,25 px es lo que pide el texto de fase más largo a
  11 px de tipografía, y 196×300 es lo que ocupa el dibujo con el `viewBox` que `fitView` produce.
  Una medida de maquetación **no lleva cita**, igual que una banda de plausibilidad.

El panel sigue sin publicar una sola cita, como el Y1 ya dejó escrito: el dibujo es cualitativo y
su nota al pie lo dice.

---

## La AURÍCULA IZQUIERDA por volumen indexado — la tanda «H» (2026-10-16)

### `aseCamaras2015` — ASE/EACVI, cuantificación de cavidades

**Lang RM, Badano LP, Mor-Avi V, et al. «Recommendations for Cardiac Chamber Quantification by
Echocardiography in Adults: An Update from the American Society of Echocardiography and the
European Association of Cardiovascular Imaging.» J Am Soc Echocardiogr 2015;28:1-39.**

En disco: `01_VI_y_camaras/Lang_2015_Cuantificacion_Cavidades.pdf` (**la traducción al
español**) y `Chamber-quantification.-Guidelines-and-standards.-ASE-2015.pdf` (**el original
inglés**, 53 páginas).

⚠️ **SE CITA DEL INGLÉS**, por la regla de la casa que la ESC/EACTS 2025 dejó escrita con todas
las letras: una traducción no cierra un hallazgo de wording.
⚠️ **Y LA REGLA DE FOLIO DE ESTE PDF NO ES «PÁGINA + 1»: ES «PÁGINA».** Comprobado en el pie
impreso —la página 11 del PDF termina con `Lang et al` y el número **11**, y la 10 arranca con
**10** `Lang et al`—. La regla «+1» que traía la orden corresponde al PDF en español, que pagina
distinto.

#### El volumen indexado de la AI — Tabla 4, folio 10, VERIFICADO EN TEXTO COMPLETO

La tabla se titula literalmente «Normal ranges and severity partition cutoff values for
2DE-derived LV EF and LA volume», y su fila `Maximum LA volume/BSA (mL/m2)` publica:

| | Normal | Levemente anormal | Moderadamente anormal | Severamente anormal |
|---|---|---|---|---|
| **Varón** | `16–34` | `35–41` | `42–48` | `>48` |
| **Mujer** | `16–34` | `35–41` | `42–48` | `>48` |

⚠️ **LAS DOS COLUMNAS IMPRIMEN LOS MISMOS CUATRO VALORES**, así que esta clasificación **no se
separa por sexo** —a diferencia de la masa indexada y de los volúmenes del VI, que sí—. Un
«corte por sexo» para la AI sería inventado.

**NINGÚN CORTE SE MOVIÓ.** Los cuatro son exactamente los que la app ya aplicaba (`<=34` normal,
`<=41` leve, `<=48` moderada, `>48` severa), en sus dos copias —la cápsula de AI/VI y el bloque 4
de `generarInforme`—, y lo que esta tanda hizo fue darles **un solo dueño** (`AI_VOL_BANDAS` +
`aiVolClasificar`). Medido por los seis bordes con la superficie corporal fijada en 2,00 exacta:
34,0 normal · 34,1 leve · 41,0 leve · 41,1 moderada · 48,0 moderada · 48,1 severa.

El mismo documento respalda, en su prosa del folio 28, el límite superior de normalidad:
el valor normal alto del volumen de AI por eco 2D es de **34 mL/m²**, que es
`UMBRAL_LAVI_DILATADO` y es además el corte que las tres guías de función diastólica ya usan
como criterio morfológico (ver `aseDiast2025`, `bseDiast2024` y `aseDiast2016` en este archivo).

#### Lo que esta tanda NO citó, y por qué

Las otras dos preguntas de la aurícula —«¿el diámetro AP marca dilatación?» (`>= 40 mm`) y «¿el
área?» (`> 20 cm²`)— **no se tocaron** y su registro sigue siendo el que ya tenían. La tanda del
2026-09-27 ya había retirado de ahí una graduación por diámetro que la guía **no publica**.

### Las dos correcciones del PDF — SIN NINGUNA CITA NUEVA

Ni el «%» del colapso de la VCI ni el símbolo del sexo tienen fuente clínica: son **notación**.
El primero alinea el PDF con lo que el informe narrativo, el PPT y la propia `<option>` de la
pantalla ya escribían; el segundo es una decisión de presentación de Maicol. **No se agregó
ningún corchete al panel de Evidencia por esta tanda.**

---

## La tanda «Y3b + Wilkins + I» (2026-10-16) — una CONFIRMACIÓN y dos ausencias

### El score de Wilkins: los cortes se CONFIRMARON y no se movieron

La unificación de las dos calculadoras **no cambió ningún corte**. Los tres siguen siendo los que ya
están verificados en este archivo:

- `≤ 8` favorable y `> 11` no favorable → **`wilkins1988`**, artículo original, **p. 307**;
- `9-11` «El score no predice el resultado» → el mismo artículo, misma página, que es el literal del
  que sale `WILK_9_11`;
- el `> 8` que la app muestra en el panel de Evidencia sigue atribuido **«según la guía»** y **no** a
  Wilkins, porque la ESC/EACTS 2025 lo publica sin atribuírselo y remite a su Supplementary Table S3,
  que **no está en la biblioteca** (ver la entrada de `wilkins1988` y la de la Tabla S3).

**Esta tanda no agrega ninguna cita.**

### ⚠️ La fórmula de BALIK no está en la biblioteca

La app convierte la separación pleural en volumen con `ml = mm × 20` (`_balikVol`) desde antes de esta
tanda, y lo publica en el informe y en el EN SUMA. **Censada la biblioteca completa** —las dieciocho
subcarpetas más una búsqueda de texto en los PDF candidatos—: **no hay un solo documento que contenga
la fórmula ni el nombre**.

Lo que **sí** hay es otro método, verificado de paso:

| Clave | Documento | Folio | Qué dice |
|---|---|---|---|
| `boraEteCriticos2024` | Bora V, Pulijal SV. *Transesophageal Echocardiography in Critical Care*. **Current Pulmonology Reports** 2024;13:152-172 | **167** | el **método de Capper**: volumen = área de sección máxima × longitud axial, medidas avanzando la sonda; y que las líneas B **de tres o más** indican edema o enfermedad intersticial |

⚠️ **EL MÉTODO DE CAPPER NO SIRVE PARA REEMPLAZAR A BALIK EN ESTA APP**: pide dos medidas que no
tienen campo. Así que la fórmula de Balik **se reusó tal cual, NO se escribió de memoria y NO se le
agregó entrada**: queda **sin verificar al estándar de la casa**, declarada en
`docs/PENDIENTES.md` → Y3b-5. Para cerrarlo hace falta Balik M, et al. *Intensive Care Med* 2006 en
la biblioteca.

### ⚠️ El protocolo POCUS pulmonar tampoco está, y las dos separaciones de líneas B quedaron SIN HACER

La orden pedía verificar qué significan las separaciones de **≈3 mm** y **≈7 mm** de las líneas B y
**cómo las rotula la fuente**, sin inventar nada si no estaba. **No hay ningún protocolo de ecografía
pulmonar en la biblioteca.** La única mención de líneas B es la de `boraEteCriticos2024`, folio 167,
que habla de **tres o más** por espacio y **no menciona ninguna separación en milímetros**.

El selector sigue ofreciendo **focal** y **difuso**, como hasta hoy, y la oración del informe no
cambió. `docs/PENDIENTES.md` → Y3b-6.

---

## La tanda «J» (2026-10-16) — por qué NO lleva ninguna cita nueva

Las cuatro partes se midieron y **ninguna agrega, mueve ni retira un corte clínico**, así que no
hay nada que verificar contra una guía:

* **J1 — la AI con volumen que no se puede indexar.** No es un corte nuevo: es un **estado**. Los
  cuatro cortes del volumen indexado siguen siendo los de **ASE/EACVI 2015 (Lang), Tabla 4, folio
  10**, verificados en texto completo en la tanda H, y `aiVolClasificar` —su único dueño— no se
  tocó. Lo que entra es la frase que **declara** la medición sin clasificarla, y la guía no tiene
  nada que decir sobre un paciente al que no se le midieron el peso y la talla.
  ⚠️ La frase nueva **no afirma ni niega dilatación**, así que tampoco invoca a esa tabla. La
  única cláusula con contenido de guía es «la guía lo gradúa sólo por volumen indexado», que es
  exactamente lo que la rama de `aiGeoMedido` ya decía desde la tanda H y que esa Tabla 4
  respalda: el diámetro AP y el área no tienen bandas de grado en ella.
* **J2 — la UNA línea de la AI en el PPT.** Elige **cuál de tres valores ya medidos se publica**
  y no clasifica nada. Las bandas de plausibilidad que usa (`ai_area [3,60]`, `ai_diam [10,90]`)
  son las que ya existían vía `_labRango`, y **son rangos de lo medible, no criterios**: por la
  regla de la casa van **sin cita**.
* **J3 — la identificación del paciente.** Es administrativo, no clínico.
* **J4 — la disposición del panel de frases.** Es maqueta.

**Ninguna entrada de este archivo se modificó**, y la única que esta tanda consulta —
`aseCamaras2015`— queda como la dejó el H.

---

## La tanda K (2026-10-16) — por qué NO lleva ninguna cita nueva

Los seis commits son **disposición, corrección de dibujo y un defecto de estado**. No entra ni un
corte, ni una banda, ni una regla de integración, ni una frase del informe firmado:

- **K0a** limpia el lienzo entero y acota el largo del chorro. `M3D_JET_LEN_MAX = 3.6` es un
  **parámetro de DIBUJO**, elegido midiendo el recorte en 360 orientaciones, no un umbral
  clínico: el esquema es cualitativo y su pie lo dice. Va **sin cita**, por la misma regla con la
  que una banda de plausibilidad va sin corchete.
- **K0b** y **K2** mueven bloques de pantalla.
- **K0c** reproduce la brújula de `docs/3d/2b_demo_mitral_vistas_ete.html`, que es material propio
  de la app. Sus cinco ejes —anterior, posterior, lateral, medial y auricular— son nomenclatura
  anatómica corriente, y **el único hecho con fuente es de qué lado cae lo lateral**, que ya está
  citado: ASE/SCA/STS 2020 (Nicoara et al, JASE 33:6), **folio 695**, la entrada del Y3-1. Lo que
  esta tanda hace es darle a ese hecho **un dueño único** (`M3D_ORIENT`), no cambiarlo.
- **K1** corrige de qué depende que el bull's eye entre al PDF. Los colores y los nombres de la
  escala de motilidad no se tocaron: siguen saliendo de `CONTR_MOTILIDAD`.
- **K3** reordena controles que ya existían y no mueve un solo valor.

⚠️ **LA TABLA «REFERENCIA DE COLORES» QUE SE RETIRÓ NO ERA UNA FUENTE Y ADEMÁS DISCREPABA DEL
DUEÑO:** su «Normal» decía `#2a2f3f` donde `CONTR_MOTILIDAD[0].color` es `#22C55E`. Lo que queda
en pantalla (`#contr-leyenda`) deriva del dueño.

---

## La tanda «L» — la AURÍCULA y el VENTRÍCULO izquierdos, dato por dato (2026-10-16)

### `aseCamaras2015` — ASE/EACVI 2015 (Lang RM y col.), leída en el ORIGINAL inglés

Archivo: `EcoSmart_Biblioteca_Fuentes/01_VI_y_camaras/Chamber-quantification.-Guidelines-and-standards.-ASE-2015.pdf`
(53 hojas). **DOI `10.1016/j.echo.2014.10.003`, leído en el pie de la hoja 1 del propio
documento** — no hizo falta buscarlo afuera.

⚠️ **REGLA DE FOLIO, COMPROBADA EN EL PIE IMPRESO Y NO POR ARITMÉTICA:** en el **cuerpo** de la
guía el folio **coincide** con la hoja del PDF (la hoja 7 dice «Lang et al 7»; la 10, «10 Lang et
al»; la 17, «Lang et al 17»). En el **APÉNDICE no**: la hoja 47 lleva el folio **39.e8** y la 53
el **39.e14**. El que cite una tabla suplementaria por su número de hoja apunta a otro lugar.

| Dato | Tabla o figura | Folio | Hoja | Lo que dice, literal |
|---|---|---|---|---|
| Volumen AI indexado | Tabla 4 | 10 | 10 | `Maximum LA volume/BSA (mL/m2)` 16-34 · 35-41 · 42-48 · >48, **los mismos valores en las dos columnas de sexo** |
| FEVI (ASE) | Tabla 4 | 10 | 10 | varón 52-72 · 41-51 · 30-40 · <30; mujer 54-74 · 41-53 · 30-40 · <30 |
| Masa indexada, límite normal | Tabla 6 | 17 | 17 | `LV mass/BSA (g/m2)` mujeres **43–95**, hombres **49–115** (método lineal) |
| Espesor parietal relativo | Tabla 6 | 17 | 17 | `Relative wall thickness (cm)` 0,22–0,42 (M) y 0,24–0,42 (H) |
| Los cuatro cuadrantes | Figura 6 | 17 | 17 | «concentric remodeling (normal LV mass with increased RWT ≥ 0.42) or normal geometry (RWT ≤ 0.42)… increased LV mass can have either concentric (RWT ≥ 0.42) or eccentric (RWT ≤ 0.42) hypertrophy» |
| Gravedad de la hipertrofia | Tabla supl. 3 | 39.e8 | 47 | `LV mass/BSA (g/m2)` H 49–115 · 116–131 · 132–148 · >148; M 43–95 · 96–108 · 109–121 · >121 |
| Volumen telediastólico indexado | Tabla supl. 3 | 39.e8 | 47 | H 34–74 · 75–89 · 90–100 · >100; M 29–61 · 62–70 · 71–80 · >80 |
| Volumen telesistólico indexado | Tabla supl. 3 | 39.e8 | 47 | H 11–31 · 32–38 · 39–45 · >45; M 8–24 · 25–32 · 33–40 · >40 |
| Diámetro diastólico | Tabla supl. 3 | 39.e8 | 47 | H 4,2–5,8 · 5,9–6,3 · 6,4–6,8 · >6,8 cm; M 3,8–5,2 · 5,3–5,6 · 5,7–6,1 · >6,1 cm |
| Diámetro sistólico | Tabla supl. 3 | 39.e8 | 47 | H 2,5–4,0 · 4,1–4,3 · 4,4–4,5 · >4,5 cm; M 2,2–3,5 · 3,6–3,8 · 3,9–4,1 · >4,1 cm |
| Diámetro AP de la AI | Tabla supl. 9 | 39.e14 | 53 | `AP dimension (cm)` mujeres **2,7–3,8**, hombres **3,0–4,0** |

**Lo verificado coincide dígito por dígito con lo que la app aplica** en el volumen indexado de
la AI, la masa indexada y su gravedad, el espesor parietal relativo, los cuatro cuadrantes y los
dos volúmenes indexados del VI. Los que **no** coinciden están abajo.

### Lo que quedó «por verificar», con el motivo

* **El área de la AI (> 20 cm²).** Esta guía **no publica ningún corte de área**: en el folio 25
  dice que el diámetro AP «should not be used as the sole measure of LA size» y que, con la
  literatura de volúmenes, informar el área es **innecesario**; su Tabla suplementaria 9 da el
  área **indexada** como media ± DE, no un corte. El 20 cm² viene de la edición 2006 y la app lo
  declara como criterio propio. **No se le puso fuente** y la tarjeta no publica línea de fuente
  para esa barra.
* **Las categorías de FEVI de la app (≥ 50 / 40-49 / 30-39 / < 30, iguales en los dos sexos).**
  No son las de esta guía, que corta por sexo en 52 y 54 y usa bandas 41-51 y 41-53. No se
  encontró en la biblioteca un documento que publique esta partición, así que la ficha queda «por
  verificar» y la barra sale sin fuente.

### Lo que la app aplica distinto de la guía (declarado, NO corregido)

| Dato | La guía | La app | Dónde queda |
|---|---|---|---|
| Diámetro AP de la AI | techo normal **4,0 cm** en el varón y **3,8** en la mujer | un corte único de **40 mm** para los dos | `PENDIENTES.md` → L-1 |
| Diámetro diastólico del VI | por sexo, techo normal 5,8 (H) y 5,2 cm (M) | **58 y 65 mm** sin sexo, con respaldo por volumen indexado | `PENDIENTES.md` → L-2 |
| FEVI | por sexo, 52 y 54 % | **50 %** para los dos, y bandas distintas | `PENDIENTES.md` → L-3 |
| Diámetro sistólico del VI | cuatro bandas por sexo | **no lo clasifica en ninguna superficie** | `PENDIENTES.md` → L-4 |
| Espesor parietal relativo | la Figura 6 escribe `≥ 0,42` y `≤ 0,42`, que **se solapan en el 0,42 exacto** | el 0,42 cae del lado concéntrico | `PENDIENTES.md` → L-5 |

### Lo que esta tanda NO cita

Ninguna barra ni ninguna entrada de Referencias publica una fuente que no esté en la tabla de
arriba. Los límites de dibujo de cada barra (`lo` y `hi`) **no llevan fuente a propósito**: son
el rango de lo medible que el gráfico encuadra, no un criterio — la misma regla que esta casa
aplica a las bandas de plausibilidad.

---

## La tanda «M» (2026-10-16) — AD/VCI, VENTRÍCULO DERECHO y AORTA

Dieciséis fichas nuevas (`DIM-AD-001`, `VCI-001`, `VCI-002`, `DIM-VD-001` a `004`, `FUN-VD-001`
a `006` y `AOR-001` a `003`). **Diez verificado · cuatro parcial · dos por verificar.**

### Las dos guías, con su regla de folio comprobada en el pie impreso

| | documento | archivo | regla de folio |
|---|---|---|---|
| **ASE 2025** | Mukherjee M y col., *Guidelines for the Echocardiographic Assessment of the Right Heart in Adults…*, ASE, J Am Soc Echocardiogr 2025;38(3):141-186 · DOI **10.1016/j.echo.2025.01.006** (leído en el pie de la hoja 1 del propio PDF) | `03_VD_y_corazon_derecho/Echocardiographic-assessment-of-Right-Heart.-JASE-2025.pdf` (46 hojas) | **folio = hoja + 140**, comprobado en tres pies: hoja 5 → «145», hoja 20 → «160», hoja 24 → «164» |
| **ASE/EACVI 2015** | Lang RM y col., *Recommendations for Cardiac Chamber Quantification by Echocardiography in Adults*, J Am Soc Echocardiogr 2015;28:1-39 · DOI 10.1016/j.echo.2014.10.003 | `01_VI_y_camaras/Chamber-quantification.-Guidelines-and-standards.-ASE-2015.pdf` (53 hojas) | en el **cuerpo**, folio = hoja (hoja 32 → pie «32 / Lang et al»); en el **apéndice** no |

⚠️ **LA ASE 2025 CODIFICA `≥` COMO `$` Y `≤` COMO `#` EN SU TEXTO EXTRAÍDO.** La Tabla 1 sale
como «RVWT, cm · <0.5 · $0.5 to #0.7 · >0.7 to #0.9 · >0.9». Hay que traducirlos para leerla, y
quien no lo sepa lee los operadores al revés.

### Los once datos verificados, uno por uno

| ficha | dato | lo que dice el original | tabla o figura · folio · hoja |
|---|---|---|---|
| `VCI-002` | PmAD estimada | «If the IVC diameter is normal and collapses ≥50% … the RAP is normal (3 mm Hg)… An enlarged IVC diameter that does not collapse <50% with a sniff suggests an elevated RAP (15 mm Hg)… In indeterminate cases, an intermediate value of 8 mm Hg» + Key Point «RAP values of 3, 8, or 15 mm Hg are assigned using an IVC diameter cutoff of 2.1 cm» | Presión auricular derecha · **160** · 20 |
| `DIM-VD-002` | Diámetro medio | «a diameter >41 mm at the base and **>35 mm at the midlevel** … indicates RV dilatation» y la Tabla 8, fila «RV mid diameter (mm): 19-35» | Tabla 8 y §7.1 · **20** y 17 · 20 y 17 |
| `DIM-VD-004` | Pared libre | Tabla 1, fila `RVWT, cm`: `<0.5 · ≥0.5 a ≤0.7 · >0.7 a ≤0.9 · >0.9` | Tabla 1 · **145** · 5 |
| `FUN-VD-001` | TAPSE | «generally, **TAPSE < 17 mm** is highly suggestive of RV systolic dysfunction» | §8.2 · **19** · 19 |
| `FUN-VD-002` | Onda S′ | «An S′ velocity **< 9.5 cm/sec** measured on the free-wall side indicates RV systolic dysfunction» | §8.4 · **20** · 20 |
| `FUN-VD-004` | FEVD por 3D | Tabla 1, fila `3D RVEF, %`: normal `>45` | Tabla 1 · **145** · 5 |
| `FUN-VD-005` | Índice de Tei por DTI | Tabla 1, fila `Tissue Doppler RV MPI`: normal `<0.55` (la del Doppler pulsado es `<0.40`) | Tabla 1 · **145** · 5 |
| `FUN-VD-006` | Tiempo de aceleración pulmonar | Tabla 1, fila `RVOT AccT, ms`: normal `>105` | Tabla 1 · **145** · 5 |
| `AOR-002` | Nomogramas de los senos de Valsalva | las tres ecuaciones con su SEE y su r, **leídas de la imagen** (ver abajo) | Figura 13 · **32** · 32 |
| `AOR-003` | Dimensiones normales de la raíz por sexo | Tabla 14: senos 3,4 ± 0,3 (H) y 3,0 ± 0,3 cm (M); indexados 1,7 ± 0,2 y 1,8 ± 0,2 cm/m²; unión sinotubular 2,9 ± 0,3 y 2,6 ± 0,3; aorta ascendente proximal 3,0 ± 0,4 y 2,7 ± 0,4; anillo 2,6 ± 0,3 y 2,3 ± 0,2 | Tabla 14 · **32** · 32 |

### La Figura 13, leída de la IMAGEN y medida

El texto extraído de la hoja 32 trae el pie de la figura y la Tabla 14, pero **ninguna de las
tres ecuaciones**: están dentro del bitmap. Se renderizó la página a **500 ppp** y se leyeron los
tres paneles:

| panel | rótulo impreso | ecuación | SEE | r | P |
|---|---|---|---|---|---|
| A | «Children and adolescents» | y = 1.02 + 0.98x | 0.18 | 0.93 | < .0005 |
| B | «Adults 20-39 years» | y = 0.97 + 1.12x | 0.24 | 0.71 | < .0005 |
| C | «Adults >40 years» | y = 1.92 + 0.74x | 0.37 | 0.40 | < .0005 |

Ejes: X «Body Surface Area (m²)», Y «Sinuses of Valsalva (cm)». Pie de la figura, literal: «The
95% confidence intervals for aortic root diameter at sinuses of Valsalva on the basis of BSA in
children and adolescents (A), adults aged 20 to 39 years (B), and adults aged ≥40 years (C).
Reprinted with permission from Roman et al.¹⁹⁵». Fuente original: **Roman MJ, Devereux RB,
Kramer-Fox R, O'Loughlin J. Am J Cardiol 1989;64:507-512.**

⚠️ **LA GUÍA NO DICE CÓMO SE CONSTRUYE LA BANDA**, sólo «95% confidence intervals». Se comprobó:
calibrando los dos ejes con sus marcas impresas y leyendo el borde dibujado columna por columna,
a superficie corporal 2,0 y 2,2 m² los bordes caen a **0,003 a 0,063 cm** de `ecuación ± 1,96 ×
SEE` en los paneles B y C. A 1,8 m² el rótulo «SEE = …» corta la lectura del borde superior: esa
fila no sirve, y hay que saberlo antes de creerle.

⚠️ **EL RANGO DE SUPERFICIE CORPORAL QUE CADA PANEL DIBUJA, MEDIDO EN LA IMAGEN:** A de **0,20 a
2,02**, B de **1,29 a 2,53** y C de **1,32 a 2,40** m². La app lo guarda redondeado **hacia
adentro** (0,25-2,00 · 1,30-2,50 · 1,30-2,40), que es el lado conservador.

⚠️ **LA GUÍA SE CONTRADICE EN EL LÍMITE DE 40 AÑOS, y los dos textos están impresos:** el cuerpo
del folio 32 escribe los tres estratos como «<20, **20 to 40**, and >40 years» y el pie de la
Figura 13 dice «adults aged **≥40** years (C)»; el rótulo dentro del gráfico C dice «>40».
Decisión de Maicol: **los 40 exactos van al B**.

⚠️ **DERECHOS: la imagen NO se reproduce.** Su pie dice «Reprinted with permission from Roman et
al.», o sea derechos del editor y de los autores originales. Lo que se usa son las ecuaciones y
los errores estándar —datos numéricos— citando a Lang 2015 y a Roman 1989, y el dibujo de la app
es propio: otros ejes, la unidad en milímetros y el punto del paciente adentro.

### Lo que quedó «parcial» o «por verificar», con el motivo

| ficha | estado | por qué |
|---|---|---|
| `DIM-AD-001` · área de la AD | parcial | la app corta en **18 cm²** y la **Tabla 1 (folio 145)** y el Key Point (folio 143) de la ASE 2025 cortan en **19**. El 18 SÍ está en esa guía, pero en otro contexto: el folio **164** lo nombra como *signo de PAD elevada* («RA area > 18 cm2»), no como límite de normalidad del tamaño. |
| `VCI-001` · diámetro de la VCI | parcial | la guía escribe «A normal IVC diameter is **≤2.1 cm**» y la app aplica **`< 21`**: a 21,0 mm exactos la guía dice normal y la app dilatado. |
| `DIM-VD-001` · diámetro basal | parcial | el **41** está verificado (Tabla 8, folio 20: «25-41»; §7.1, folio 17: «>41 mm … indicates RV dilatation»), pero **la banda «leve hasta 45» no está en esa guía**: la Tabla 1 de la ASE 2025 corta leve en **4,4 cm**. |
| `FUN-VD-003` · FAC | parcial | el **35 %** está verificado (§8.3, folio 19: «RV FAC < 35% indicates RV systolic dysfunction»); **el 25 % de «disfunción severa» no está en ninguna de las dos guías** — la Tabla 1 de la ASE 2025 gradúa `≤35 a >29 · ≤29 a >22 · ≤22`. |
| `DIM-VD-003` · diámetro longitudinal | por verificar | la app usa **86 mm** y **no está en ninguna de las dos**: Lang 2015, Tabla 8, folio 20 da «59-**83**» y la ASE 2025, Tabla 1, folio 145 da «< **8,2** cm». |
| `AOR-001` · cortes por segmento | por verificar | son **criterio propio de EcoSmart** por decisión de Maicol. El corte de 40 mm **no se le atribuye a ninguna guía** y la ficha no publica fuente. |

### Lo que esta tanda NO cita

Ninguna barra, tabla ni entrada de Referencias publica una fuente que no esté arriba. El corte de
40 mm de la raíz aórtica sale **sin línea de fuente**, y los cinco cortes por segmento de
`ref-ao2` salen **sin corchete**. Los límites de dibujo de cada barra y los ejes del nomograma no
llevan fuente: son el rango que el gráfico encuadra, no un criterio.
