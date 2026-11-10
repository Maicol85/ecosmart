# Trazabilidad de los resumenes de PANT-29

Una fila por **frase** de cada resumen nuevo o ampliado, con el documento de control de donde
sale, la fila de ese documento, la hoja del PDF y el **folio impreso comprobado**. Esta tanda
**no trae ni una cifra clinica nueva**: todo sale de lo que PANT-28 leyo en imagen y dejo
verificado, o —en congenitas— de lo que se lee en imagen en el commit 6.

Reglas de folio, tal como los documentos de control las dejaron comprobadas hoja por hoja:

| documento | regla de folio |
|---|---|
| **ASE 2020 de imagen multimodal en atletas** (Baggish, *JASE* 2020;33(5):523-549) | folio = hoja + 522 |
| **Japp 2016** (*JACC* 2016;67(25):2996-3010) | folio = hoja + 2995 |
| **AHA 2018** de miocardiopatia chagasica (Nunes, *Circulation* 2018;138:e169-e209) | folio = **e** + hoja + 168 |
| **ASE 2020 de anomalias coronarias** (Frommelt, *JASE* 2020;33(3):259-294) | folio = hoja + 258 |

⚠️ **NINGUNO DE LOS RESUMENES LLEVA LA CITA EN PANTALLA**, y es lo que el estilo del sector
manda: medido hijo por hijo, los cinco resumenes que `ref-miocard` ya tenia **no tienen linea de
fuente**. La trazabilidad vive en este documento. La ficha de coronarias si la lleva, porque
**ya la tenia**, y se conserva.

---

## 1 · Corazon de atleta — frente a la miocardiopatia dilatada

En `ref-miocard`, con el molde del sector. **845 caracteres de textContent y 6 vinietas**
(techo: 850 y 7, el de la amiloidosis). Fuente de todo: `docs/CONTROL_ATLETA_P28.md`.

| frase del resumen | numeros | fila | documento | hoja | folio |
|---|---|---|---|---|---|
| la dilatacion del VI es un hallazgo normal en el atleta de resistencia | — | **A12** | ASE 2020 atletas | 7 | **529** |
| DDVI hasta 70 mm en varones (media 55) y 66 mm en mujeres (media 48) | 70 / 55 / 66 / 48 mm | **A13** | ASE 2020 atletas | 7 | **529** |
| el engrosamiento por ejercicio es leve, 11-13 mm, y hasta 15 mm en atletas negros | 11-13 mm · 15 mm | **A22** | ASE 2020 atletas | 13 | **535** |
| FEVI de 45 a 55 % fisiologica en el asintomatico con VI dilatado si la diastolica es normal y hay dilatacion del VD y de ambas auriculas | 45-55 % | **A43** | ASE 2020 atletas | 14 | **536** |
| a favor del atleta: sin insuficiencia cardiaca; peptido natriuretico, ECG, diastolica, strain y reserva contractil normales; remodelado inverso con el desentrenamiento | 7 de los 8 rasgos | **A38** | Japp 2016 | 4 | **2999** |
| a favor de patologia: diastolica alterada, alteraciones regionales de la motilidad, strain global menos negativo, reserva contractil alterada | 4 de los 5 rasgos | **A42** | ASE 2020 atletas | 14 | **536** |
| el tamanio del VI y de la AI no separa por si solo el ejercicio de la enfermedad | — | **A44** | ASE 2020 atletas | 14 | **536** |

**Lo que se dejo afuera por extension, y donde sigue verificado**: el VO2 pico alto y la
funcion diastolica del VI como octavo y cuarto rasgo de A38; la regla de la compania (A40); la
funcion diastolica preservada o supranormal (A24); el espesor que raramente supera 12-13 mm
(A19); el ventriculo derecho (A27) y la auricula izquierda (A28); todo el bloque de ECG (A30 a
A37); y lo que separa de la hipertrofica y de la arritmogenica (A46 a A48), que **ya vive en
`ref-miocard`** en los resumenes de MCH y MCA.

---

## 2 · Miocardiopatia chagasica

En `ref-miocard`, con el mismo molde. **846 caracteres de textContent y 5 vinietas**. Fuente de
todo: `docs/CONTROL_CHAGAS_P28.md`.

| frase del resumen | numeros | fila | documento | hoja | folio |
|---|---|---|---|---|---|
| cerca de 1,2 millones de personas con miocardiopatia chagasica en los paises endemicos de America Latina | 1,2 millones | **H1** | AHA 2018 | 3 | **e171** |
| el 60 a 70 % queda asintomatico toda la vida | 60-70 % | **H9** | AHA 2018 | 6 | **e174** |
| eco, lo mas comun: alteraciones segmentarias inferior e inferolateral basales y del apex, con contraccion septal preservada; aneurisma del VI; disfuncion diastolica; trombo mural apical | 4 de los 8 hallazgos de la Tabla 3 | **H20** | AHA 2018 | 12 | **e180** |
| aneurisma apical en el 2,0 a 8,6 % de los asintomaticos y en el 24 a 64 % con afectacion miocardica moderada a grave | 2,0-8,6 % · 24-64 % | **H23** | AHA 2018 | 12 | **e180** |
| estadios A, B1, B2, C y D (Tabla 1) | cinco estadios | **H16** | AHA 2018 | 7 | **e175** |
| puntaje de Rassi: NYHA III-IV 5, cardiomegalia 5, motilidad 3, TV no sostenida 3, bajo voltaje 2, varon 2 | 5/5/3/3/2/2 | **H42** | AHA 2018 | 22 | **e190** |
| categorias bajo 0-6, intermedio 7-11, alto 12-20 | 0-6 / 7-11 / 12-20 | **H42** | AHA 2018 | 22 | **e190** |
| mortalidad a 5 anios del 2 %, 18 % y 63 % | 2 / 18 / 63 % | **H42** | AHA 2018 | 22 | **e190** |

**Lo que se dejo afuera por extension, y donde sigue verificado**: el vector y el control
vectorial (H3, H4); las cuatro formas cronicas (H6); la fisiopatologia (H7, H8); toda la fase
aguda (H11 a H14); la forma indeterminada (H15); la mortalidad por estadio (H17); el BENEFIT
(H18, H45, H46); los cuatro hallazgos restantes de la Tabla 3 (H20); la Tabla 4 de pronostico
(H29); todas las arritmias y la conduccion (H30 a H41); el modelo de ictus (H48 a H51); el
desfibrilador (H52); el tratamiento antitripanosomico (H53 a H55); y la Tabla 7 de seguimiento
(H56 a H58).

⚠️ **NINGUN PUNTAJE SE APLICA A UN PACIENTE.** El de Rassi se publica como lo que su fuente
imprime —variables, puntos, categorias y mortalidad— y la app no lo calcula, no lo guarda y no
lo lleva a ninguna superficie del paciente. Es lo mismo que PANT-28 ya habia decidido para la
ficha grande.
