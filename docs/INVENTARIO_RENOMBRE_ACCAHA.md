# El nombre de la guia americana de congenitas del adulto — lectura en imagen

**Tanda PANT-17, commit 1 (2026-11-06).** Documento de **solo lectura**: no cambia una linea de la
aplicacion. Su unico trabajo es dejar escrito **lo que esta impreso** en el PDF, para que la
decision de renombrar o no se tome sobre una medicion y no sobre un recuerdo.

**Archivo leido:** `08_Cardiopatias_congenitas/gurvitz-et-al-2025-2025-acc-aha-hrs-isachd-scai-guideline-for-the-management-of-adults-with-congenital-heart-disease-a.pdf`
(la copia **sin** el sufijo `-2`, que es la que la orden manda usar). **137 hojas.**
Renderizado con PyMuPDF a **200 ppp** la hoja 1 y a **260 ppp** la tira de cabecera y pie de la
hoja 35.

---

## 1. La hoja 1, leida en imagen a 200 ppp

**El titulo grande, palabra por palabra:**

> 2025 ACC/AHA/HRS/ISACHD/SCAI Guideline for the Management of Adults With Congenital Heart
> Disease: A Report of the American College of Cardiology/American Heart Association Joint
> Committee on Clinical Practice Guidelines

**Subtitulo:** «Developed in Collaboration With and Endorsed by the Heart Rhythm Society,
International Society for Adult Congenital Heart Disease, and Society for Cardiovascular
Angiography and Interventions».

**Primer autor y cargo:** Michelle Gurvitz, MD, MS, FACC, Chair. Veintiocho miembros del comite
de redaccion en total.

**El apartado AIM vuelve a escribir el ano en el titulo entrecomillado:** «The "2025
ACC/AHA/HRS/ISACHD/SCAI Guideline for the Management of Adults With Congenital Heart Disease"
provides recommendations…», y declara que reemplaza a la «2018 AHA/ACC Guideline».

**La cita sugerida que la propia hoja imprime** («The American Heart Association requests that
this document be cited as follows»):

> Gurvitz M, Krieger EV, Fuller S, Davis LL, Kittleson MM, Aboulhosn JA, Bradley EA, Buber J,
> Daniels CJ, Dimopoulos K, Egbe A, Geoffrion TR, John A, Khairy P, Kim YY, Kreutzer J, Lewis MJ,
> Menachem JN, Moore JP, Osteen KA, Parikh PB, Saidi A, Salciccioli KB, Schunder RL, Valente AM,
> Wald RM. **2025** ACC/AHA/HRS/ISACHD/SCAI guideline for the management of adults with congenital
> heart disease: a report of the American College of Cardiology/American Heart Association Joint
> Committee on Clinical Practice Guidelines. *Circulation*. **2026**;153:e115-e251.
> doi: 10.1161/CIR.0000000000001402

**Copyright:** «(c) **2025** by the American College of Cardiology Foundation and the American
Heart Association, Inc.»

**Pie de la hoja 1:** «*Circulation*. 2026;153:e115-e251. DOI: 10.1161/CIR.0000000000001402»
(izquierda) y «February 24, 2026   **e115**» (derecha).

## 2. La hoja interior (hoja 35), leida en imagen a 260 ppp

**Cabecera:** «Gurvitz et al» (izquierda) — «**2026 ACHD Guideline**» (derecha).

**Pie:** «*Circulation*. 2026;153:e115-e251. DOI: 10.1161/CIR.0000000000001402» (izquierda) —
«February 24, 2026   **e149**» (derecha).

**Contenido visible en la tira:** la franja roja «Recommendations for Atrial Septal Defect
(Continued)», que confirma que la hoja 35 es la de las recomendaciones de la comunicacion
interauricular, como el indice de lectura de la orden afirma.

## 3. La regla de folio, comprobada en el pie impreso

**folio = hoja + 114**, comprobada en las **dos** hojas leidas:

| Hoja | Folio impreso en el pie | hoja + 114 |
|---:|---|---:|
| 1 | e115 | e115 |
| 35 | e149 | e149 |

## 4. La conclusion, y por que el commit se para

El ano **2026** aparece **solo** en datos de la REVISTA —el volumen y las paginas de
*Circulation*, la fecha de publicacion del numero y la cabecera corrida de cada hoja— y el ano
**2025** aparece en el **titulo oficial**, en el titulo entrecomillado del apartado AIM, en la
**cita sugerida por la propia AHA** y en la linea de copyright.

La orden del medico fija la condicion con todas las letras: «Si el **titulo oficial** dice 2026:
se renombra. Si el titulo dice 2025 y **solo la cabecera o el pie** dicen 2026: NO renombres
nada». Es el segundo caso, asi que **no se renombro ninguna cadena** y la aplicacion sigue
diciendo «ACC/AHA 2025», que es como la nombra su propio titulo y su propia cita sugerida.

## 5. El censo, medido igual (para que la proxima tanda no lo repita)

Lo que habria que cambiar el dia que el medico decida renombrar igual:

| Donde | Cadena | Apariciones |
|---|---|---:|
| `index.html` | `ACC/AHA 2025` | **197** |
| `index.html` | `2025 ACC/AHA` | **2** |
| `index.html` | `Gurvitz` (sin ano al lado) | 10 |
| `index.html` | `AHA/ACC 2025`, `ACC/AHA 2025/26`, `Gurvitz 2025`, `Gurvitz et al., 2025`, `ACHD 2025` | **0** cada una |
| `scripts/test_clinico.mjs` | `ACC/AHA 2025` | **6** |
| `docs/` (no se renombran: solo se cuentan) | `ACC/AHA 2025` | **100** |

**Las otras guias con ano 2025 que NO se tocarian nunca**, contadas para que nadie las barra por
error con una sustitucion global: `ESC/EACTS 2025` **175**, `ASE 2025` **236**, `ESC 2025` **37**.

## 6. Lo que este documento NO decide

No propone renombrar ni no renombrar: aplica la condicion que la orden del medico escribio. Si el
medico prefiere que la aplicacion nombre la guia por el ano de publicacion de la revista en vez de
por el de su titulo, esa es una decision suya y no de esta tanda. Queda en `PENDIENTES.md` como
**P17-e**.
