# Control de las diez secciones de congénitas (PANT-17b, commit 2)

Documento de **solo lectura**. La columna «está en la app» y la de «pregunta que la cubre» están
**MEDIDAS** sobre los registros `*_PREG` del árbol `a2137a6`, extrayendo de cada entrada su guía,
su clase, su nivel y sus folios del propio campo `rec`. La columna «hoja y folio» dice de dónde
sale el dato: **«leído»** cuando una tanda anterior lo verificó en imagen y la app ya lo cita, y
**«del índice, A VERIFICAR»** cuando viene del índice de lectura previa de esta orden y todavía no
se abrió la hoja.

---

## 0. Lo primero: CINCO de las diez secciones YA ESTÁN EN EL TOPE

Medido: no hay ninguna constante de tope en el código (ver el inventario del formato, § 5); el
tope es la convención de las órdenes y hoy el máximo existente es **14** preguntas.

| sección | preguntas hoy | lugar libre |
|---|---|---|
| CIA | **14** | **ninguno** |
| CIV | **14** | **ninguno** |
| Eisenmenger | **14** | **ninguno** |
| Fontan | **14** | **ninguno** |
| Fallot reparada (VD) | **14** | **ninguno** |
| Defecto del septo AV | 13 | 1 |
| Coartación | 13 | 1 |
| Ductus | 13 | 1 |
| Ebstein | 12 | 2 |
| Conexión venosa pulmonar anómala parcial | 9 | 5 |
| Estenosis supravalvular aórtica | 8 | 6 |
| Estenosis subaórtica | 7 | 7 |
| Ventana aortopulmonar | 6 | 8 |
| Transposición | 19 (por situación) | — |

⚠️ **Eso cambia el alcance de los commits 4 y 5**, y es un hallazgo medido y no una estimación: en
CIA, CIV, Eisenmenger, Fontan y Fallot reparada **no entra ninguna recomendación más** sin pasar el
tope, así que lo que falte en esas cinco va a `P17b-c` con su hoja y su folio, que es lo que la
orden manda hacer cuando no entran todas.

---

## 1. CIA — ACC/AHA 2025, hoja 35, folio e149 (leído por PANT-17) · ESC 2020, hoja 30, folio 592

| recomendación del índice | clase | está en la app | pregunta que la cubre | hoja y folio |
|---|---|---|---|---|
| ACC n.º 5 · cerrar con Qp:Qs ≥1,5, VD dilatado, sin HAP | 1 B-R | **sí** | «Qp:Qs de 1,5 o más» + «Dilatación del ventrículo derecho» + «Resistencia vascular pulmonar de 2 unidades Wood o menos» | leído · e149 |
| ACC n.º 6 · preferir el cierre percutáneo en la ostium secundum aislada | 1 B-NR | **sí** | «Comunicación interauricular tipo ostium secundum aislada» | leído · e149 |
| ACC n.º 7 · cerrar ante embolia paradójica probada o muy sospechada | 1 C-EO | **sí** | «Evidencia o sospecha firme de embolia paradójica» | leído · e149 |
| ACC n.º 13 · no cerrar con fisiología de Eisenmenger | 3: Harm C-LD | **sí** | «Fisiología de Eisenmenger» | leído · e149 |
| nota al pie · «enfermedad significativa del VI» = presión de AI ≥15 mmHg | — | **sí** | «Enfermedad significativa del ventrículo izquierdo» | leído · e149 |
| **ACC n.º 1 · definir el defecto con RMC, ETE o TC** | 1 B-NR | **no** | — | del índice, A VERIFICAR |
| **ACC n.º 2 · evaluar el riesgo con especialistas en HP en la CIA no reparada con HAP** | 1 B-NR | **no** | — | del índice, A VERIFICAR |
| **ACC n.º 3 · buscar HAP** | 1 C-EO | **no** | — | del índice, A VERIFICAR |
| ESC · cerrar con sobrecarga de volumen del VD y sin HAP | I B | **sí** | «Dilatación del ventrículo derecho» (línea de referencia) | leído · 592 |
| ESC · el dispositivo como método de elección si la anatomía es apta | I C | **sí** | «Comunicación interauricular tipo ostium secundum aislada» | leído · 592 |
| ESC · en el anciano no apto para dispositivo, sopesar riesgo y beneficio de la cirugía | I C | **sí** | «Paciente de edad avanzada no apto para el cierre con dispositivo» | leído · 592 |
| ESC · no cerrar con Eisenmenger, RVP ≥5 UW o desaturación con el ejercicio | III C | **sí** | «Desaturación con el ejercicio (saturación arterial por debajo del 90 %)» | leído · 592 |
| **ESC · con signos no invasivos de PAP alta, medir la RVP de forma invasiva** | I C | **no** | — | del índice, A VERIFICAR |
| **ESC · con enfermedad del VI, prueba con balón antes de decidir** | I C | **no** | — | del índice, A VERIFICAR |

**Faltan 5 y no entra ninguna: la sección está en 14.** → `P17b-c`.

---

## 2. CIV — ACC/AHA 2025, hojas 39 y 40, folios e153 y e154 · ESC 2020, hoja 33, folio 595

| recomendación del índice | clase | está en la app | pregunta que la cubre | hoja y folio |
|---|---|---|---|---|
| ACC n.º 2 · descartar obstrucción del TSVD o VD de doble cámara antes de reparar una perimembranosa | 1 B-NR | **sí** | «Obstrucción del tracto de salida del ventrículo derecho o ventrículo de doble cámara» | leído · e153 |
| ACC n.º 4 · cerrar con Qp:Qs ≥1,5, dilatación significativa del VI y sin HAP | 1 B-NR | **sí** | «Qp:Qs de 1,5 o más» + «Dilatación significativa o progresiva del ventrículo izquierdo» + «Sin evidencia de hipertensión arterial pulmonar» | leído · e153, e154 |
| ACC n.º 10 · no cerrar con Eisenmenger | 3: Daño B-NR | **sí** | «Fisiología de Eisenmenger» | leído · e154 |
| ESC · cerrar con sobrecarga de volumen del VI y sin HAP | I C | **sí** | «Dilatación significativa o progresiva del ventrículo izquierdo» (referencia) | leído · 595 |
| ESC · no cerrar con Eisenmenger o HAP severa con desaturación en el ejercicio | III C | **sí** | «Desaturación con el ejercicio, con resistencia vascular pulmonar de 5 unidades Wood o más» | leído · 595 |
| **ACC n.º 1 · buscar HAP** | 1 B-NR | **no** | — | del índice, A VERIFICAR |
| **ACC n.º 3 · seguimiento por especialistas en congénitas y en HP con HAP** | 1 C-LD | **no** | — | del índice, A VERIFICAR |
| **ACC n.º 9 · no cerrar con Qp:Qs <1,5 sin otra indicación** | 3: Sin beneficio B-NR | **no** | — | del índice, A VERIFICAR |

**Faltan 3, una de ellas de CLASE III, y no entra ninguna: la sección está en 14.** → `P17b-c`,
con la clase III nombrada primero, que es la prioridad que la orden fija.

---

## 3. Estenosis subaórtica — ACC/AHA hoja 52, folio e166 · ESC hoja 41, folio 603

| recomendación del índice | clase | está en la app | pregunta que la cubre | hoja y folio |
|---|---|---|---|---|
| ACC n.º 2 · reparación quirúrgica con síntomas atribuibles | 1 C-EO | **sí** | «Síntomas atribuibles a la estenosis subaórtica, espontáneos o en la prueba de esfuerzo» | leído · e166 |
| ACC · síntomas dudosos que exigen una prueba | 2b C-EO | **sí** | «Síntomas dudosos, que no se pueden atribuir a la lesión sin una prueba» | leído · e166 |
| ESC · hipertrofia marcada, disfunción sistólica, caída de la presión en el esfuerzo | IIa C | **sí** | tres preguntas propias | leído · 603 |
| ESC · prueba normal con riesgo quirúrgico bajo; progresión de la insuficiencia aórtica | IIb C | **sí** | dos preguntas propias | leído · 603 |
| **ESC · cirugía con síntomas y gradiente medio Doppler ≥40 mmHg, o insuficiencia aórtica severa** | **I C** | **no** | — | del índice, A VERIFICAR (ESC hoja 41, folio 603) |
| sin filas de clase III en ninguna de las dos | — | — | — | — |

**Falta 1, de CLASE I de intervención, y entran 7: es la primera candidata del commit 4.**

---

## 4. Estenosis supravalvular aórtica — ACC/AHA hoja 55, folio e169 · ESC hoja 40, folio 602

| recomendación del índice | clase | está en la app | pregunta que la cubre | hoja y folio |
|---|---|---|---|---|
| ACC n.º 1 y n.º 2 · imagen aórtica y coronaria basal en Williams | 1 C-LD | **sí** | «Falta la imagen basal de la aorta o de las coronarias (resonancia, tomografía)» | leído · e169 |
| ACC n.º 3 · reparación con síntomas y/o disfunción sistólica del VI | 1 B-NR | **sí** | «Síntomas atribuibles a la obstrucción» + «Disfunción sistólica del ventrículo izquierdo atribuible a la estenosis» | leído · e169 |
| ACC n.º 4 · revascularización coronaria ante estenosis ostial con isquemia | 1 C-LD | **sí** | «Síntomas de isquemia con estenosis de los ostios coronarios» | leído · e169 |
| ESC · cirugía con gradiente <40 y al menos uno de tres | I C | **sí** | «Cirugía necesaria por enfermedad coronaria significativa o por enfermedad valvular» | leído · 602 |
| **ESC · cirugía con síntomas y gradiente medio ≥40 mmHg** | **I C** | **no** | — | del índice, A VERIFICAR (ESC hoja 40, folio 602) |
| sin filas de clase III en ninguna de las dos | — | — | — | — |

**Falta 1, de CLASE I de intervención, y entran 6.**

---

## 5. Defecto del septo auriculoventricular — ACC/AHA hojas 42 y 43, folios e156 y e157 · ESC hoja 35, folio 597

| recomendación del índice | clase | está en la app | pregunta que la cubre | hoja y folio |
|---|---|---|---|---|
| ACC n.º 1 · buscar HAP | 1 C-LD | **sí** | «Sin reparar, o con cortocircuito residual después de una reparación previa» | leído · e156 |
| ACC n.º 3 · reparación con obstrucción del TSVI y síntomas o FEVI <50 % | 1 B-NR | **sí** | «Obstrucción del tracto de salida del ventrículo izquierdo» + «Síntomas atribuibles a esa obstrucción» | leído · e156 |
| ACC n.º 4 · cirugía valvular ante IAV izquierda severa | 1 B-NR | **sí** | «Síntomas atribuibles a la regurgitación de la válvula auriculoventricular» | leído · e157 |
| ACC n.º 5 · cerrar con Qp:Qs ≥1,5 y/o dilatación, sin HAP | 1 C-LD | **sí** | «Dilatación auricular o ventricular significativa o progresiva» | leído · e157 |
| ACC n.º 8 · no cerrar con Eisenmenger o RVP >10 UW | 3: Daño C-LD | **sí** | «Fisiología de Eisenmenger» | leído · e157 |
| ESC · no reparar el completo con Eisenmenger o HAP con desaturación | III C | **sí** | «Desaturación con el ejercicio» | leído · 597 |
| ESC · cierre quirúrgico del parcial con sobrecarga del VD | I C | **sí** | «Sobrecarga significativa de volumen del ventrículo derecho» | leído · 597 |
| ESC · cirugía ante insuficiencia AV moderada a severa sintomática | I C | **sí** | «Síntomas atribuibles a la regurgitación…» (su `tramo` declara la diferencia de grado) | leído · 597 |
| ESC · cirugía ante IAV izquierda severa asintomática con DTSVI ≥45 y/o FEVI ≤60 % | I C | **sí** | el bloque fijo la publica; la condición vota por los campos del estudio | leído · 597 |
| **ACC n.º 2 · manejo con expertos en HP cuando hay HAP** | 1 C-LD | **no** | — | del índice, A VERIFICAR |

**Falta 1, de CLASE I (manejo), y entra 1: es la segunda candidata del commit 4.**

---

## 6. Las cinco del commit 5, en una línea cada una

| sección | preguntas | lo que el índice agrega y la app no tiene | entra |
|---|---|---|---|
| Transposición | 19, por situación | las filas de imagen y de evaluación invasiva de los cuatro escenarios | según situación |
| Ebstein | 12 | el estudio electrofisiológico ante preexcitación asintomática (ACC n.º 1) y la ablación de vía de alto riesgo (n.º 7) están; falta la fila del cirujano con experiencia de la ESC | 2 |
| Fontan | 14 | **en el tope**: imagen y laboratorio anual, cateterismo en el candidato, comité antes del trasplante | **ninguno** → `P17b-c` |
| Conexión venosa pulmonar anómala parcial | 9 | **ACC n.º 8, de CLASE III: no operar con VD normal y Qp:Qs <1,5** | 5 |
| Eisenmenger | 14 | **en el tope**: tres de CLASE III —no anticoagular de rutina, no cerrar ningún cortocircuito, los cables endocárdicos pueden ser dañinos— | **ninguno** → `P17b-c` |

⚠️ **Y una del índice que ya está resuelta y declarada**: la ACC/AHA n.º 11 de Eisenmenger —no
cerrar ningún cortocircuito intracardíaco ni vascular— la publica hoy la **ventana
aortopulmonar**, sin su clase, y eso está en `P17-d` por decisión de PANT-17.

---

## 7. Lo que este documento NO dice

No dice que una guía esté mejor o peor que la otra, ni las compara: cada fila cita lo que **esa**
guía publica, con su hoja y su folio. Y no afirma ninguna hoja que no se haya abierto: las filas
marcadas «del índice, A VERIFICAR» son exactamente las que los commits 4 y 5 tienen que leer en
imagen antes de escribir una sola palabra.
