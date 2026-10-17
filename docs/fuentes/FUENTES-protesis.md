<!-- registro armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Fuentes verificadas — PRÓTESIS valvular

Separado de `docs/fuentes/FUENTES.md` (válvula nativa) porque son **claves distintas de `IND_REFS`
a propósito**: las entradas nativas tienen pie de tabla nativo y reusarlas acá le pondría pie de
tabla equivocado a una cita protésica. Las reglas de folio están en `FUENTES.md`.

**Cobertura hoy: prótesis MITRAL.** La aórtica tiene la clave registrada (`aseProtAo`) pero **sin
ningún corchete que la invoque** — ver el final de este archivo.

---

### `ahaProtM2020` — ACC/AHA 2020, prótesis valvular
Mismo documento, **clave distinta a propósito**: el `full` de `ahaVc2020` enumera las tablas de IM y
EM **nativas** y no menciona prótesis. Reusarlo le pondría pie de tabla nativa a una cita protésica.

- **§11.8.2** «Intervention for Prosthetic Valve Stenosis», **p. e152** — reintervención quirúrgica
  en la estenosis severa sintomática de prótesis biológica o mecánica, salvo riesgo alto o
  prohibitivo (**Clase 1 · Nivel B-NR**); antagonista de la vitamina K razonable en la estenosis
  significativa de prótesis biológica atribuida a trombosis (**Clase 2a · Nivel B-NR**).
- **§11.9.3** «Intervention» de la regurgitación protésica, **p. e154** — cirugía ante hemólisis
  intratable o insuficiencia cardíaca por fuga transvalvular o periprotésica (**Clase 1 · B-NR**);
  cirugía razonable en el asintomático con regurgitación protésica severa y riesgo operatorio bajo
  (**Clase 2a · B-NR**); cierre percutáneo de la fuga periprotésica con hemólisis intratable o
  NYHA III-IV, riesgo alto o prohibitivo y anatomía apta, en centro de referencia (**Clase 2a · B-NR**).
- ⚠️ Su fila de **valve-in-valve percutáneo está escrita para la prótesis AÓRTICA** y no se cita
  para la mitral.

### `aseProtM2024` — ASE 2024, prótesis (posición MITRAL)
Zoghbi WA, Jone PN, Chamsi-Pasha MA, et al. *J Am Soc Echocardiogr* 2024;37(1):2-63.
doi:10.1016/j.echo.2023.10.004.
**Ruta probable:** `.../05_Protesis_valvulares/Zoghbi_2024_Protesis.pdf`. **Folio = PDF + 1.**

- **Tabla 11** «Doppler findings suggestive of prosthetic mitral valve stenosis», **p. 27** —
  velocidad pico < 1,9 / 1,9-2,5 / ≥ 2,5 m/s · gradiente medio ≤ 5 / 6-10 / > 10 mmHg · VTI
  prótesis/VTI TSVI < 2,2 / 2,2-2,5 / > 2,5 · EOA ≥ 2,0 / 1-2 / < 1 cm² · THP < 130 / 130-200 / > 200 ms.
- **Tabla 12** «TTE findings suggestive of significant prosthetic MR in mechanical valves with
  normal PHT», **p. 28** — velocidad pico ≥ 1,9 m/s (S 90 %, E 89 %) · relación VTI ≥ 2,5 (S 89 %,
  E 91 %) · gradiente medio ≥ 5 mmHg (S 90 %, E 70 %). Con la velocidad pico y la relación VTI
  elevadas a la vez, la especificidad *«is close to 100 %»*.
- **Tabla 13** «Echocardiographic criteria for severity of prosthetic mitral valve regurgitation»,
  **p. 30** — vena contracta < 0,3 / 0,3-0,69 / ≥ 0,7 cm · volumen regurgitante < 30 / 30-59 /
  ≥ 60 mL · fracción regurgitante < 30 / 30-49 / ≥ 50 % · EROA < 0,20 / 0,20-0,39 / ≥ 0,40 cm².
  Nota †† — esos cuantitativos *«are less well validated than in native MR»*. Nota § — define la
  periprotésica por **dehiscencia o balanceo**.
- **Tabla 7** «Doppler parameter criteria of aortic valve and mitral valve PPM», **p. 20** — mitral
  indexada, **IMC < 30**: normal > 1,2 · moderado 1,2-0,91 · severo ≤ 0,90 cm²/m²; **IMC ≥ 30**:
  normal > 1,0 · moderado 1,0-0,76 · severo ≤ 0,75 cm²/m².
- **p. 10** — define el PPM mitral **sin estratificar por IMC**: *«Moderate mitral PPM is defined as
  < 1.2 cm²/m², and severe mitral PPM is defined as ≤ 0.9 cm²/m²»*. **Contradice a la Tabla 7 para
  IMC ≥ 30** (una EOA indexada de 1,1 cm²/m² es *moderada* por el texto y *normal* por la tabla).
  **La calculadora usa la Tabla 7**; la sección publica las tres voces declarando cuál está aplicada.
- **p. 10** prohíbe el THP para el área: *«calculation of EOA using the pressure half-time method is
  frequently inaccurate and leads to overestimation of EOA»*.
- **p. 11** — volumen y fracción regurgitantes por comparación de flujos no sirven acá: *«mitral
  inflow cannot be measured using Doppler because of the mitral prosthesis»*.
- ⚠️ **La Tabla 9 NO es de esta sección.** Es «Potential role of CT in various complications of
  prosthetic **AORTIC** valves» (**p. 26**), y el corte de **145 UH** para trombo vs pannus vive ahí
  dentro, **descrito para la posición aórtica**. Usarlo en mitral es extrapolación de posición, no
  una cita. **No se encontró fuente con cortes de TC para trombo vs pannus mitral** en las tres
  leídas, así que el punto se omite.

### `aseProtAo` — ASE 2024, prótesis (posición AÓRTICA)
Mismo documento que `aseProtM2024`, **clave separada a propósito**: su pie dice **«Tabla 5 — prótesis
aórtica quirúrgica»**, así que colgarle las Tablas 7/11/12/13 le pondría pie de tabla **aórtica** a
citas **mitrales**. Y sus cortes **no son los de válvula nativa**.
⚠️ **Registrada y hoy sin ningún corchete que la invoque**, y eso es un hallazgo, no un descuido: el
`guia:` de `eaProtNarrativa` es **código muerto** — los únicos accesos a ese retorno son `.frase`,
`.resumen` y `.salvedades`; `.guia` tiene cero lectores, aunque dos comentarios del archivo afirmen
que `_eaProtPintar` lo consume (no lo consume: lee `N.salvedades` y nada más).

---

## La tanda PRO (2026-10-17) — lo verificado en el PDF original

**Regla de folio de la ASE 2024: folio = hoja + 1**, comprobada en el **pie impreso** de las hojas
22, 26, 32 y 38 (→ 23, 27, 33 y 39). **Regla de folio de la VARC-3: folio = hoja + 1824**,
comprobada en el pie impreso de las hojas 22 y 23 (→ 1846 y 1847).

⚠️ **EL TEXTO EXTRAÍDO DE LA ASE 2024 CODIFICA `≥` COMO `$` Y `≤` COMO `#`.** Quien la lea sin
saberlo invierte **todos** los operadores. Es la misma trampa que la ASE 2023 ya tiene escrita.
Las seis tablas de abajo se leyeron con ese reemplazo hecho; **ninguna hizo falta renderizarla**.

### `aseProt2024` — Zoghbi et al., JASE 2024;37(1):2-63

**Tabla 8 — «Parameters for evaluation of the severity of prosthetic aortic valve regurgitation»,
folio 23, hoja 22. VERIFICADA, texto completo.**

| parámetro | Mild | Moderate | Severe |
|---|---|---|---|
| Jet width in central jets, % LVOT diameter (CD)‡ | Narrow (**≤25 %**) | Intermediate (26 %-64 %) | Large (≥65 %) |
| VC width, cm (CD) | <0,3 | 0,3-0,6 | >0,6 |
| VC area, cm² (2D/3D CD)§ | <0,10 | 0,10-0,29 | ≥0,30 |
| Circumferential extent of PVL, % (CD) | <10 | 10-29 | ≥30 |
| Jet density (CW) | Incomplete or faint | Dense | Dense |
| Jet deceleration rate (PHT), ms (CW)# | Slow (>500) | Variable (200-500) | Steep (<200) |
| Diastolic flow reversal in the descending aorta (PW) | Absent or brief early diastolic | Intermediate | **Prominent, holodiastolic** (sin cifra) |
| Regurgitant volume, mL/beat | <30 | 30-59 | ≥60 |
| Regurgitant fraction, % | <30 | **30-50** | **≥50** |

Notas verificadas: ‡ «Parameter applicable to central jets and less accurate in eccentric jets;
Nyquist limit of 50 to 60 cm/sec»; § el área de VC se mide por planimetría en eje corto;
«Circumferential extent of PVL best not to be used alone but in combination with VC width and/or
area»; # «Influenced by LV compliance».

⚠️ **LA FILA DE LA FRACCIÓN REGURGITANTE SE SUPERPONE EN EL 50** («30-50» y «≥50»). La desambigua la
VARC-3 (abajo), que escribe «40 to <50» y «≥50».

**Tabla 11 — «Doppler findings suggestive of prosthetic mitral valve stenosis», folio 27, hoja 26.
RE-VERIFICADA.** Define el **THP normal** que usa el PRO1: columna «Normal» del PHT = `<130` ms.
Las cinco filas: velocidad pico `<1,9 / 1,9-2,5 / ≥2,5` m/s · gradiente medio `≤5 / 6-10 / >10` mmHg ·
`VTI_PrMv/VTI_LVOT` `<2,2 / 2,2-2,5 / >2,5` · EOA `≥2,0 / 1-2 / <1` cm² · PHT `<130 / 130-200 / >200` ms.

**Tabla 12 — «Transthoracic echocardiographic findings suggestive of significant prosthetic MR in
mechanical valves with normal PHT», folio 28, hoja 27. RE-VERIFICADA.** Su **título es la condición
entera** del PRO1. Filas: velocidad pico mitral `≥1,9` m/s (sens. 90 %, esp. 89 %) ·
**`VTI_PrMV/VTI_LVOT ≥ 2,5` (sens. 89 %, esp. 91 %)** · gradiente medio `≥5` mmHg (sens. 90 %,
esp. 70 %) · velocidad máxima del jet de IT `>3` m/s (80 %, 71 %) · volumen sistólico del VI por 2D
o 3D más del 30 % por encima del sistémico por Doppler · convergencia sistólica en el VI hacia la
prótesis.

**Tabla 13 — «Echocardiographic criteria for severity of prosthetic mitral valve regurgitation»,
folio 30, hoja 29. VERIFICADA, texto completo.** VC width `<0,3 / 0,3-0,69 / ≥0,7` cm · RVol
`<30 / 30-59 / ≥60` mL · RF `<30 / 30-49 / ≥50` % · EROA `<0,20 / 0,20-0,39 / ≥0,40` cm², más área
de jet, convergencia, densidad, contorno y flujo venoso pulmonar.
⚠️ **ESA TABLA NO PUBLICA UN PARÁMETRO DE EXTENSIÓN CIRCUNFERENCIAL DE LA FUGA PARAVALVULAR
MITRAL** —censada entera—, a diferencia de la Tabla 8 de la aórtica. Nota †† verificada: «These
quantitative parameters are less well validated than in native MR».

**Tabla 15 — «Parameters for prosthetic pulmonary valve stenosis», folio 33, hoja 32. VERIFICADA.**
⚠️ **SÓLO DOS COLUMNAS: «Normal» y «Possible obstruction». NO HAY COLUMNA DE SEVERA.**

| | Normal | Possible obstruction |
|---|---|---|
| Velocidad pico, bioprótesis | <3,2 m/s | **≥3,2 m/s** |
| Velocidad pico, homoinjerto | <2,5 m/s | **≥2,5 m/s** |
| Gradiente medio, bioprótesis | <20 mmHg | **≥20 mmHg** |
| Gradiente medio, homoinjerto | <15 mmHg | **≥15 mmHg** |

Nota * verificada: «Measurements assume normal RV stroke volume».

**Tabla 16 — «Echocardiographic evaluation of severity of prosthetic pulmonary valve regurgitation»,
folio 34, hoja 33. VERIFICADA.** Jet width / anillo pulmonar: **≤25 %** leve · **26 %-50 %**
moderada · **>50 %** severa. Más densidad del jet, tasa de desaceleración, flujo sistólico pulmonar
comparado con el sistémico y reverso diastólico en la AP distal.
⚠️ **ESA TABLA NO TRAE FRACCIÓN REGURGITANTE NI THP**, y su nota dice «Cutoff values for regurgitant
volume and fraction are not well validated». El corte de la FR está en la **PROSA del folio 35
(hoja 34)**, verificado literal: «A regurgitant fraction <30% is considered mild, and >50% is
considered severe» —o sea **sin banda moderada definida**, que queda por complemento—.

**Tabla 19 — «Doppler parameters suggestive of prosthetic TV stenosis», folio 36, hoja 35.
VERIFICADA.** Un umbral único por tipo, sin graduar:

| parámetro | Bioprotésica | Mecánica |
|---|---|---|
| Velocidad pico de E, m/s | ≥2,1 | ≥1,9 |
| Gradiente medio, mmHg | ≥9 | ≥6 |
| PHT, ms | ≥200 | ≥130 |
| EOA, cm² | <1,5 | <2,0 |
| DVI (VTI_PrTV/VTI_LVOT)* | ≥3,3 | ≥2,1 |

Nota * verificada: «Assessed in the absence of AR or TR. Upper limits of normal DVI vary by valve
size and type».

**Tabla 21 — «Echocardiographic grading of TR after TVR or TV repair», folio 39, hoja 38.
VERIFICADA.** VC width `<0,3 / 0,3-0,69 / ≥0,7` cm **o ≥2 jets moderados** · radio de PISA
`≤0,5 / 0,6-0,9 / >0,9` cm · EROA `<0,20 / 0,20-0,39 / ≥0,40` cm² · RVol `<30 / 30-44 / ≥45` mL, más
área del jet en color, zona de convergencia, onda de CW, llenado tricuspídeo y flujo de vena
hepática. Nota § verificada: «EROA and RVol from 2D PISA need further validation of cutoffs».

### `varc3_2021` — Généreux et al., Eur Heart J 2021;42(19):1825-1857 · DOI 10.1093/eurheartj/ehaa799

**Tabla 16 — «Criteria for prosthetic aortic valve regurgitation», folio 1846, hoja 22. VERIFICADA,
texto completo.** Publica **las dos escalas en la misma tabla**, con sus dos filas de encabezado
(«Three-class grading scheme»: None/Trace · Mild · Moderate · Severe — «Five-class grading scheme»:
None/Trace · Mild · Mild-moderate · Moderate · Moderate-severe · Severe), que es la equivalencia que
Maicol fijó: leve = leve y leve-moderada · moderada = moderada y moderada-severa · severa = severa.

| parámetro (5 clases) | None/Trace | Mild | Mild-mod | Moderate | Mod-severe | Severe |
|---|---|---|---|---|---|---|
| **Reverso diastólico en aorta descendente proximal (PW)** | Absent | Absent or brief early diastolic | Intermediate | Intermediate | **Holodiastolic (EDV 20 a <30 cm/s)** | **Holodiastolic (EDV ≥30 cm/s)** |
| Extensión circunferencial de la fuga, % | no cuantificable | <5 | 5 a <10 | 10 a <20 | 20 a <30 | ≥30 |
| Ancho de vena contracta, mm | no cuantificable | <2 | 2 a <4 | 4 a <5 | 5 a <6 | ≥6 |
| Área de vena contracta, mm² | no cuantificable | <5 | 5 a <10 | 10 a <20 | 20 a <30 | ≥30 |
| Jet width, % del Ø del TSVI | Narrow (<5) | Narrow (5 a <15) | Interm. (15 a <30) | Interm. (30 a <45) | Large (45 a <60) | Large (≥60) |
| PHT, ms | Slow (>500) | Slow (>500) | Variable (200 a <500) | Variable | Variable | Steep (<200) |
| Volumen regurgitante, mL/latido | <15 | <15 | 15 a <30 | 30 a <45 | 45 a <60 | ≥60 |
| Área del orificio regurgitante, mm² | <5 | <5 | 5 a <10 | 10 a <20 | 20 a <30 | ≥30 |
| **Fracción regurgitante, %** | <15 | <15 | 15 a <30 | 30 a <40 | **40 a <50** | **≥50** |
| E/A ratio | <1,0 | <1,0 | <1,0 | ≥1,5 | ≥1,5 | ≥1,5 |

⚠️ **LAS DOS BANDAS DEL REVERSO EMPIEZAN CON LA PALABRA «Holodiastolic»**, así que la VARC-3 **sí
exige** que el flujo sea holodiastólico: la compuerta de la app se conserva.
⚠️ **COLAPSADA A TRES CLASES, la extensión circunferencial y el área de vena contracta de la VARC-3
COINCIDEN con la Tabla 8 de la ASE 2024** (<10 / 10-30 / ≥30 % y <0,10 / 0,10-0,30 / ≥0,30 cm²), y
el **ancho de vena contracta NO**: la VARC-3 pone el borde leve/moderada en 4 mm y la ASE 2024 en
3 mm. Manda la ASE 2024, que es la más nueva.
Nota g verificada: la extensión circunferencial se mide como la suma de las longitudes
circunferenciales de la vena contracta de cada jet —sin el espacio no regurgitante entre jets—
dividida por la circunferencia del borde externo de la válvula.

---

## Cambios de evidencia — tanda PRO (commits 1 a 3)

| dato | valor antes | valor ahora | fuente | commit | fecha |
|---|---|---|---|---|---|
| Cociente VTI prótesis mitral / TSVI, cuándo apoya | toda prótesis mitral, sin mirar el THP | **sólo prótesis MECÁNICA con THP normal (<130 ms)**; biológica no se publica; mecánica con THP ≥130 o sin THP, número pelado | ASE 2024 T12 folio 28 (hoja 27) + T11 folio 27 (hoja 26) | PRO1 | 17/10/2026 |
| Jet/TSVI de la IAo con PRÓTESIS, borde de leve | `< 25 %` (corte nativo) | **`≤ 25 %`** | ASE 2024 T8 folio 23 (hoja 22) | PRO2 | 17/10/2026 |
| Fracción regurgitante de la IAo con PRÓTESIS, borde de severa | `> 50 %` (corte nativo, ESC/EACTS 2025) | **`≥ 50 %`** | ASE 2024 T8 folio 23 + VARC-3 T16 folio 1846 (desambigua) | PRO2 | 17/10/2026 |
| Reverso diastólico de la TAVI, velocidad telediastólica | `≥ 20 cm/s` → **severa** (único nivel, citaba ASE 2019) | **`≥ 30` severa · `20 a <30` moderada** | VARC-3 T16 folio 1846 (hoja 22) | PRO3 | 17/10/2026 |
| Cita del reverso de la TAVI | ASE 2019 | **VARC-3 2021** (la ASE 2024 no da cifra) | VARC-3 T16 · ASE 2024 T8 | PRO3 | 17/10/2026 |

**Lo que NO se movió, y está medido:** los cortes de la válvula NATIVA (jet/TSVI `<25` y FR `>50`,
`IA_VMAX_TD_SEVERA = 20` cm/s de la ESC/EACTS 2025), la regla de «dos o más de cuatro» de la
prótesis mitral, los cuatro criterios de la Tabla 11 con sus operadores, los otros cuatro
parámetros de la fuga de la TAVI, el PPM, el valve-in-valve y el deterioro estructural.

---

## La tanda PRO-B (2026-10-17) — la fuga paravalvular de la prótesis QUIRÚRGICA

**Las dos reglas de folio, comprobadas otra vez en el PIE IMPRESO** (no por aritmética):
ASE 2024 **folio = hoja + 1** (hoja 22 → pie «23», hoja 29 → pie «30»).
⚠️ Con el reemplazo `$`→`≥` y `#`→`≤`, que esta guía necesita siempre.

### `aseProt2024` — Tabla 8, folio 23, hoja 22 · RE-VERIFICADA en el PDF original

Los **cuatro cortes que el motor aplica**, leídos otra vez antes de extenderlo a la prótesis
quirúrgica. **Ninguno se movió**:

| parámetro | leve | moderada | severa |
|---|---|---|---|
| Circumferential extent of PVL, % (CD) | `<10` | `10-29` | `≥30` |
| VC width, cm (CD) | `<0,3` | `0,3-0,6` | `>0,6` |
| VC area, cm² (2D/3D CD) | `<0,10` | `0,10-0,29` | `≥0,30` |
| Jet deceleration rate (PHT), msec (CW) | Slow (`>500`) | Variable (`200-500`) | Steep (`<200`) |

Frases verificadas literales de esa tabla y sus notas:
- el título dice **«prosthetic aortic valve regurgitation»**, sin abrir ramas por tipo de prótesis;
- la nota `*` distingue, **en mecánicas Y en biológicas**, «immobile occluder (valvular
  regurgitation)» de **«dehiscence or rocking (paravalvular regurgitation)»** — o sea que la tabla
  cubre la prótesis **quirúrgica** y no sólo la percutánea;
- la nota de la extensión circunferencial: «best not to be used alone but in combination with VC
  width and/or area», que es exactamente la integración del motor;
- la fila del reverso dice **«Diastolic flow reversal in the descending aorta (PW)»** y su columna
  de severa es «Prominent, holodiastolic», **sin una sola cifra**.

### `aseProt2024` — Tabla 13, folio 30, hoja 29 · RE-VERIFICADA en el PDF original

| parámetro | leve | moderada | severa |
|---|---|---|---|
| VC width, cm | `<0,3` | `0,3-0,69` | `≥0,7` |
| RVol, mL/beat | `<30` | `30-59` | `≥60` |
| RF, % | `<30` | `30-49` | `≥50` |
| EROA, cm² | `<0,20` | `0,20-0,39` | `≥0,40` |
| Color flow jet area | Small, central (`<4 cm²` o `<20 %` del área de la AI) | Variable | Large central (`>8 cm²` o `>50 %`) |
| Flow convergence | None or minimal | Intermediate | Large |
| Jet density (CW) | Incomplete or faint | Dense | Dense |
| Jet contour (CW) | Parabolic | Usually parabolic | Early peaking: triangular |
| Pulmonary venous flow | Systolic dominance | Systolic blunting | Systolic flow reversal |

⚠️ **LOS CUATRO CUANTITATIVOS Y EL JET SOBRE ÁREA AURICULAR COINCIDEN DÍGITO POR DÍGITO CON LOS
QUE `IM_CORTES` YA APLICA**, así que la tanda **no movió un solo corte de la mitral**.
⚠️ **ESA TABLA NO PUBLICA UN PARÁMETRO DE EXTENSIÓN CIRCUNFERENCIAL** —censada entera—, a
diferencia de la Tabla 8. Por eso la mitral **no lo ofrece**: tomarlo prestado de la Tabla 8 o de
la VARC-3 sería traerlo de una tabla de **otra válvula**.
⚠️ **TRES PARÁMETROS DE ESA TABLA NO TIENEN CAMPO EN LA APP** —convergencia, densidad y contorno
del chorro— y eso queda **declarado, no inventado**. Nota `††` verificada: «These quantitative
parameters are less well validated than in native MR».

### La diferencia entre la ASE 2024 y la VARC-3 en el ancho de vena contracta

Colapsada a tres clases, la **extensión circunferencial** y el **área de vena contracta** de la
VARC-3 (Tabla 16, folio 1846) **coinciden** con la Tabla 8; el **ancho de vena contracta NO**: la
VARC-3 pone el borde leve/moderada en **4 mm** y la ASE 2024 en **3 mm**. **Manda la ASE 2024**,
que es la más nueva, y es el que el motor aplica. Queda anotado para que mover ese número no deje
el otro atrás.

### El rótulo «aorta descendente»

Las **dos** guías escriben el mismo territorio y **ninguna** dice abdominal:
- **ASE 2024, Tabla 8, folio 23**: «Diastolic flow reversal in the **descending aorta** (PW)».
- **VARC-3, Tabla 16, folio 1846**: «Diastolic flow reversal in **proximal descending** aorta
  (PW Doppler)».

---

## Cambios de evidencia — tanda PRO-B (commits 1 a 5)

| dato | valor antes | valor ahora | fuente | commit | fecha |
|---|---|---|---|---|---|
| Rótulo del campo del reverso diastólico de la TAVI | «Velocidad tele-diastólica **aorta abdominal** (cm/s)» | «Velocidad tele-diastólica **aorta descendente** (cm/s)» | ASE 2024 T8 folio 23 + VARC-3 T16 folio 1846 | PRO-B2 | 17/10/2026 |
| Fuga paravalvular de la prótesis aórtica **quirúrgica** | **no existía**: ningún campo, ninguna frase, ningún veredicto | los cuatro cortes de la **Tabla 8** por el motor único, con tres campos nuevos y dos prestados | ASE 2024 T8 folio 23 (hoja 22) | PRO-B3 | 17/10/2026 |
| Distribución de la fuga de la TAVI en el **Laboratorio**, reverso de 20 a 29 cm/s | **Severa** (segunda copia de los cortes, anterior al PRO3) | **Moderada** — lee al dueño | VARC-3 T16 folio 1846 (vía PRO3) | PRO-B3 | 17/10/2026 |
| Distribución de la fuga de la TAVI en el **Laboratorio**, extensión circunferencial de 0 % | **Leve** | **Sin RPV** — el cero medido es ausencia, no gravedad | criterio del motor (`nula`) | PRO-B3 | 17/10/2026 |
| Origen de la regurgitación de la prótesis **mitral** | **no se registraba**: el grado salía sin decir si era central o paravalvular | selector `vm_pvl_origen` y una oración propia; **ningún corte movido** | ASE 2024 T13 folio 30 (hoja 29) | PRO-B4 | 17/10/2026 |

**Lo que NO se movió, y está medido:** los cuatro cortes de la Tabla 8 (el motor ya los aplicaba),
los cuatro de la Tabla 13 (`IM_CORTES` ya los aplicaba), `IM_CORTES.jet_prot`, los dos bordes del
PRO2, el cociente VTI del PRO1, el reverso del PRO3, `IA_VMAX_TD_SEVERA` (20 cm/s, un solo nivel,
en nativa y en SAVR), el PPM, el valve-in-valve, y la tricúspide y la pulmonar protésicas, que
siguen en «No graduada» hasta el PRO-C.

---

## La tanda PRO-C (2026-10-17) — las prótesis TRICÚSPIDE y PULMONAR

Las cuatro tablas estaban transcritas desde la tanda PRO; esta tanda **re-verificó en el PDF
original cada operador que aplica**, con el folio comprobado en el pie impreso de cada página.
Regla de folio del documento: **folio = hoja del PDF + 1**.
⚠️ **El texto extraído de la ASE 2024 codifica `≥` como `$` y `≤` como `#`**: quien lo lea sin
saberlo invierte TODOS los operadores. Lo de abajo está traducido y verificado.

### `aseProt2024` — Tabla 19, folio 36, hoja 35 · RE-VERIFICADA

**«Doppler parameters suggestive of prosthetic TV stenosis».** Un umbral único por tipo, **sin
graduar** —no hay columnas de leve/moderada/severa—:

| parámetro | Bioprosthetic | Mechanical |
|---|---|---|
| Peak E velocity, m/sec | **≥ 2.1** | **≥ 1.9** |
| Mean gradient, mm Hg | **≥ 9** | **≥ 6** |
| PHT, msec | **≥ 200** | **≥ 130** |
| EOA, cm² | **< 1.5** | **< 2.0** |
| DVI (VTI_PrTV/VTI_LVOT)* | **≥ 3.3** | **≥ 2.1** |

Nota * verificada, literal: «**Assessed in the absence of AR or TR.** Upper limits of normal DVI
vary by valve size and type.» — es la compuerta que la app implementa retirando el DVI con IT o
IAo moderada o mayor.
⚠️ **EL AEO ES EL ÚNICO PARÁMETRO CON OPERADOR `<`**: los otros cuatro suben y él baja. Un juego
único de operadores habría puesto su valor exacto del lado equivocado en las dos columnas.

### `aseProt2024` — Tabla 15, folio 33, hoja 32 · RE-VERIFICADA

**«Parameters for prosthetic pulmonary valve stenosis».** ⚠️ **DOS COLUMNAS, Y NINGUNA ES
«SEVERA»**: son «Normal» y «Possible obstruction».

| parámetro | Normal | Possible obstruction |
|---|---|---|
| Peak velocity, bioprosthesis | < 3.2 m/sec | **≥ 3.2 m/sec** |
| Peak velocity, homograft | < 2.5 m/sec | **≥ 2.5 m/sec** |
| Mean gradient, bioprosthesis | < 20 mm Hg | **≥ 20 mm Hg** |
| Mean gradient, homograft | < 15 mm Hg | **≥ 15 mm Hg** |

Nota * verificada: «Measurements assume normal RV stroke volume. Accurate CW Doppler may be
challenging because of the position of the homograft or bioprosthetic valve». Sus otras entradas
son **cualitativas** (estructura y movimiento valvular, flujo laminar, turbulencia por color) o de
**comparación seriada** con un estudio basal, así que la app implementa los dos cuantitativos.
⚠️ **ESA TABLA NO PUBLICA COLUMNA PARA UNA PRÓTESIS MECÁNICA NI PERCUTÁNEA.** La **Tabla 22** del
mismo documento (folio 39, hoja 38) enumera las percutáneas pulmonares como una familia aparte
—«Melody valve», «Edwards SAPIEN valve», «Harmony transcatheter pulmonary valve»—. Los dos
estados quedan **sin graduar** y la app lo dice.

### `aseProt2024` — Tabla 21, folio 39, hoja 38 · RE-VERIFICADA

**«Echocardiographic grading of TR after TVR or TV repair».** Sus cuatro semicuantitativos y
cuantitativos, verificados:

| parámetro | Mild | Moderate | Severe |
|---|---|---|---|
| VC width, cm* | < 0.3 | 0.3-0.69 | **≥ 0.7 or ≥ 2 moderate jets** |
| PISA radius, cm† | ≤ 0.5 | 0.6-0.9 | > 0.9 |
| EROA, cm²§ | < 0.20 | 0.20-0.39 | ≥ 0.40 |
| RVol, mL§ | < 30 | 30-44 | ≥ 45 |

Más cinco cualitativos: área del jet en color, zona de convergencia, onda de CW (densidad y
forma), llenado tricuspídeo y **flujo de vena hepática**.
⚠️ **TRES DE SUS CUATRO CUANTITATIVOS COINCIDEN DÍGITO POR DÍGITO CON `IT_CRIT`** —la tabla que
la app ya aplica, de la ASE 2017 (Zoghbi), Tabla 14, folio 350—: VC `<3 / 3-<7 / ≥7` mm, EROA
`<20 / 20-<40 / ≥40` mm² y RVol `<30 / 30-<45 / ≥45` ml. Y la onda de CW mapea a las tres
opciones de `it_densidad`. **Por eso esta tanda no movió un solo corte de la insuficiencia
tricuspídea**, y está medido: el grado sale idéntico con morfología nativa y con las dos prótesis.
El **radio de PISA** no es criterio propio en la app (vota por la EROA) y el **flujo de vena
hepática** no tiene campo: los dos quedan declarados, no inventados.
Nota § verificada: «EROA and RVol from 2D PISA need further validation of cutoffs».

### `aseProt2024` — Tabla 16 (folio 34, hoja 33) y la PROSA del folio 35 (hoja 34) · RE-VERIFICADAS

**Tabla 16 — «Echocardiographic evaluation of severity of prosthetic pulmonary valve
regurgitation».** Verificada entera: estructura valvular, tamaño del VD, **tamaño del jet por
Doppler color** (`jet width ≤25 % / 26 %-50 % / >50 % of pulmonary annulus`), **densidad del jet
por CW** (incomplete or faint / dense / dense), **tasa de desaceleración por CW** (slow /
variable / steep, early termination), flujo sistólico pulmonar comparado con el sistémico y
**reverso diastólico en la AP principal distal** (none / present / present).
⚠️ **NO TRAE FRACCIÓN REGURGITANTE NI THP.** Su nota verificada dice: «Cutoff values for
regurgitant volume and fraction are not well validated».

**Prosa del folio 35, verificada literal:**
- «A color jet width **>50 %** of the prosthesis annulus suggests severe PR.»
- «Reversal of flow in the distal main PA by PW Doppler is **suggestive of at least moderate PR**.»
- «In a study comparing CMR with echocardiography, a **PHT <95 msec** and a slope >4.9 m/sec²
  indicated a need for pulmonary valve intervention.»
- «A **regurgitant fraction <30 % is considered mild, and >50 % is considered severe**.»

**Lo que la app ya aplica de esa tabla, sin mover nada**: el tamaño del jet lo produce `ip_ancho`
con sus tres opciones cualitativas, la densidad y la tasa de desaceleración las combina
`ip_senal` en sus tres, y el reverso es `ip_reversion`. **La fracción regurgitante no tiene
campo** y queda declarada.

### `asePercVR2019` — Zoghbi et al., JASE 2019;32(4) · el THP de la IP severa · VERIFICADO

**«Guidelines for the Evaluation of Valvular Regurgitation After Percutaneous Valve Repair or
Replacement», hoja 33, folio impreso 463** —comprobado en el pie de la página, «Zoghbi et al ·
463»; regla de folio de ESE PDF: folio = hoja + 430—. Literal: «Rapid deceleration of the PR CW
Doppler velocity waveform with a **pressure half-time of <100 ms** has been shown to have good
sensitivity and specificity for predicting severe PR».
✅ **Eso le da fuente verificada al `IP_PHT_SEVERA = 100` que la app ya aplicaba** con su `<`
estricto, y el corte **no se movió**. Lo que sigue siendo criterio de la app —declarado como tal
en su propio comentario— es la **regla de integración** «el peor de los signos cargados»:
ninguna de las dos guías publica una escala cuantitativa que integre los cuatro signos de la IP.
⚠️ **LA ASE 2024 NOMBRA 95 ms Y NO 100, Y CON OTRO SIGNIFICADO**: su prosa del folio 35 lo cita
como el umbral de un estudio que «indicó necesidad de intervención», no como corte de severidad,
y su Tabla 16 **no publica THP**. Se conserva el corte de la ASE 2019, que es el publicado como
criterio de severidad, y la diferencia queda declarada.

---

## Cambios de evidencia — tanda PRO-C (commits 1 a 4)

| dato | valor antes | valor ahora | fuente | commit | fecha |
|---|---|---|---|---|---|
| Obstrucción de la prótesis **tricúspide** | **no se graduaba**: sólo `PROT_SIN_GRADO_TXT` | cinco criterios con umbral único por tipo, veredicto binario «hallazgos sugestivos de estenosis» | ASE 2024 **T19 folio 36** (hoja 35) | PRO-C2 | 17/10/2026 |
| Compuerta del **DVI** tricuspídeo | no existía (el campo no se leía con ningún corte) | se **retira** con IT o IAo moderada o mayor | nota * de la T19, folio 36 | PRO-C2 | 17/10/2026 |
| Obstrucción de la prótesis **pulmonar** | **no se graduaba**: sólo `PROT_SIN_GRADO_TXT` | dos criterios por tipo, veredicto único «posible obstrucción» —**nunca «severa»**— | ASE 2024 **T15 folio 33** (hoja 32) | PRO-C3 | 17/10/2026 |
| Prótesis pulmonar **mecánica**, **percutánea** y **tipo sin elegir** | `PROT_SIN_GRADO_TXT` genérico | tres motivos propios, cada uno nombrando por qué la guía no da columna | T15 folio 33 + T22 folio 39 | PRO-C3 | 17/10/2026 |
| Fuente del `IP_PHT_SEVERA = 100` de la IP severa | el comentario declaraba que **ninguna guía** lo publicaba | **verificada**: ASE 2019, folio 463 (hoja 33). **El corte no se movió** | ASE 2019 folio 463 | PRO-C3 | 17/10/2026 |

**Lo que NO se movió, y está medido:**
- los **cuatro cortes de `IT_CRIT`** (la Tabla 21 coincide dígito por dígito) y el grado de la IT,
  idéntico con morfología nativa y con las dos prótesis, con el borde del 7 separando igual;
- los **cuatro signos de la IP** y su regla de integración, con el grado idéntico en las tres
  morfologías y el borde del THP separando en 99 / 100;
- los **cuatro cortes de la estenosis tricuspídea NATIVA** (`ET_CRIT`), su operador y su veredicto
  binario;
- la prótesis **mitral** (la regla de «dos o más de cuatro» y su umbral), la **aórtica**, la
  **TAVI**, la **fuga paravalvular** del PRO-B, el **PPM**, el **valve-in-valve**, el **cociente
  VTI** del PRO1 y el **reverso** del PRO3;
- y el **Excel en 440 columnas**, clave por clave, con el formulario vacío, con un escenario ajeno
  y en los tres estudios de la población.

---

## Lo que la tanda «CORTOS» le volvió a leer a la ASE 2024 (2026-10-17)

### Tabla 19 — folio 36 (hoja 35): el DVI y su nota `*`, transcritos otra vez

Pie, literal: «VTI_PrTV, VTI through the prosthetic TV. **\*Assessed in the absence of AR or TR.
Upper limits of normal DVI vary by valve size and type.**»

- ⚠️ **EL ASTERISCO ESTÁ SÓLO EN LA FILA DEL DVI.** La nota alcanza a ese parámetro y a ninguno
  más: lo que la app hace —retirar el DVI con IT o IAo moderada o mayor, y nada más— queda
  **confirmado** contra la fuente. Reportado sin tocar nada.
- ⚠️ **EL DENOMINADOR DEL DVI ES EL TRACTO DE SALIDA IZQUIERDO**, con todas las letras:
  `DVI (VTI_PrTV/VTI_LVOT)`. El rótulo de la app —«DVI — VTI prótesis / VTI TSVI»— **coincide con
  la tabla**. Sorprende, y es lo que la fuente escribe.
- ⚠️ **LA APP NO CALCULA EL DVI**: `vt_dvi` es un campo que **tipea el médico**, con su `oninput`
  al pintor y sin ninguna fórmula detrás. No hay dos copias de nada, y la segunda parte de la nota
  —«los límites superiores normales varían con el tamaño y el tipo de válvula»— es la razón por la
  que un cociente consignado por otro laboratorio entra tal cual.
- **El título sigue diciendo «suggestive of» y la tabla sigue sin publicar una regla de
  integración.** Desde el CORTOS4 la app pide **dos o más** positivos —`VT_PROT_OBSTR_MIN = 2`, el
  mismo número que `VM_PROT_OBSTR_MIN` de la mitral— y con UNO publica un **hallazgo aislado** que
  no sube al papel. Es **criterio de EcoSmart**, declarado en la cápsula, y cierra `PRO-C1` por
  decisión de Maicol.
- **La velocidad pico de E se aplica en cm/s**: 2,1 m/s = **210 cm/s** y 1,9 m/s = **190 cm/s**. El
  valor del borde no se movió; la unidad es la del campo que lo recibe, que es Doppler **pulsado**.

### Tabla 16 — folio 34 (hoja 33): los dos rótulos de la IP protésica

- «jet width **≤25% of pulmonary annulus**» / «**26%-50% of pulmonary annulus**» / «**>50% of
  pulmonary annulus**».
- «**Diastolic flow reversal in the distal main PA**».
- Los dos rótulos de la app decían «del TSVD» y «en las ramas de la arteria pulmonar». **Sólo el
  texto cambió** (CORTOS5), en las **tres** superficies que lo publican: la `<option>`, el rótulo de
  la casilla y la fila del cuadro con el `rotulo` que entra en la discordancia. Cierra `PRO-C4`.

**Lo que NO se movió en esta tanda, y está medido:** los cinco cortes de la Tabla 19 y los dos de
la Tabla 15 (sólo la unidad de uno), los cuatro de `IT_CRIT`, los cuatro signos de la IP, la
prótesis **mitral** con su regla de dos o más y sus cuatro cortes, la **fuga paravalvular** del
PRO-B, la **TAVI**, el **PPM**, el **valve-in-valve**, el cociente VTI del PRO1, el reverso del
PRO3, y el **Excel en 440 columnas**.
