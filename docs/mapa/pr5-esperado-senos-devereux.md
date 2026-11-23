# PR5 — el valor esperado de los senos de Valsalva, las tres colas del BF/BG y el folio del cor triatriatum

> Tanda **PR5**, 2026-11-23. Línea base **`b005504`** (cierre de P13 + P13-B, sello
> `v20261122-2251`, md5 `8524699a`). Mapa armado sobre el árbol de cierre de la tanda.
> **No guarda números de línea a propósito**: la línea cambia en cada edición, el nombre de la
> función no.

---

## 1 · Dónde vive cada cosa

| Qué | Nombre | Zona |
|---|---|---|
| La ecuación de Devereux 2012, **pura y expuesta** | `aorPredSenosCm(edad, bsa, sx)` | aorta, junto a `AO_ST_MM` |
| La superficie corporal de **DuBois**, dueño único | `aorBsaDuBois(peso, talla)` | idem |
| El desvío, el multiplicador y la edad mínima | `AOR_DEV_SEE` · `AOR_DEV_Z` · `AOR_DEV_EDAD_MIN` | idem |
| La lectura de **este** paciente | `aorEspSenos(src)` | idem |
| El formato, **un decimal y un solo dueño** | `aorEspMmTxt(mm)` · `aorEspZTxt(z)` | idem |
| La línea de pantalla | `aorEspPintar()` → nodo `#ao-esp` | idem · la llama `calcAorta()` |
| Los cinco bloques de evidencia | `AOR_DEV_EVID` · `_aorDevEvidPintar(fr, conPaciente)` | antes de `evTarjetaAo` |
| El globo del campo de senos | `evTarjetaAo()` → clave `ao-card` | Evidencia |
| La entrada de Referencias | `evRefPintar('ao2')` → `#ref-ao2-cuerpo` | Evidencia |
| La oración del papel | un `inf.push` propio, después del bloque 12 de la aorta | emisor del informe |

**La ecuación tenía DOS copias y esta tanda dejó UNA.** Vivía escrita dentro de `mfsZCalc` —el Z
de la raíz de la tarjeta de Marfan— y hoy esa función la llama. `MFS_Z_SEE`, `MFS_Z_EDAD_MIN` y
`mfsZBsaDuBois` **conservan su nombre** porque los leen las siete reglas de Marfan, su tarjeta y
la batería, pero ya no escriben el número: leen el dueño. **Sus valores no se movieron** —0,261 y
15—, y lo fija TC-1029 (C1) comparándolos contra el literal.

⚠️ **El Z de aorta y el de Marfan son el MISMO número**, y eso se mide: TC-1029 (C4) exige que
`aorEspSenos(null).z` y `mfsZCalc(null).z` coincidan sobre el mismo paciente. Medido: **+2,65232**
en los dos.

---

## 2 · La ecuación y su fuente

```
senos (cm) = 2,423 + 0,090 × (edad/10) + 0,461 × BSA − 0,267 × sexo     [1 = varón, 2 = mujer]
SEE = 0,261 cm     ·     por encima de lo esperado = medido − esperado > 1,96 × SEE (5,1156 mm)
Z = (medido − esperado) / SEE
```

**Devereux RB y col., Am J Cardiol 2012;110:1189-94**, manuscrito de catorce hojas. Se cita por
**hoja** con su pie impreso —ese pie dice «Devereux et al. Page N», la numeración del manuscrito y
no la de la revista—. Releído en el PDF de la biblioteca por esta tanda:

- **Hoja 13, Tabla 1** · «Model with Body Surface Area: Dependent Variable Aortic Root Diameter
  (cm)»: Intercept **2.423**, Age (decade) **0.090**, Body Surface Area (m2) **0.461**, Gender
  Male **−0.267** y Female **−0.534**. Los dos coeficientes del sexo son exactamente el término
  `−0,267 × sexo` con 1 y 2, y TC-1029 (B1) lo mide: la diferencia entre los dos sexos con la
  misma edad y superficie es **2,67 mm**.
- **Hoja 4** · «The standard errors of the estimate, upon which calculation of z-scores is based,
  were 0.261 and 0.215 cm» —0,261 es el del modelo con superficie—, y el criterio: «Aortic
  dilatation can be recognized when the difference between observed sinuses of Valsalva diameter
  and the value predicted for age, gender and body size >1.96 standard errors of the estimate».
- **Hoja 2** · la población: «individuals who were **non-obese, normotensive, non-diabetic** and
  free of clinically overt cardiovascular disease or aortic valve disease», y la salvedad de la
  Introducción: «it is **uncertain whether use of BSA as the measure of body size under-recognizes
  aortic dilatation in obese individuals**».
- **Hoja 1** · «Among **1,207** apparently normal individuals ≥15 years old (54% female)».

⚠️ **El 0,261 aparece DOS veces en el artículo y son dos cosas distintas.** En la Tabla 1 es el
**error estándar del INTERCEPTO** y en la hoja 4 el **error estándar de la ESTIMACIÓN**, que es el
que se usa. Coinciden por casualidad, y por eso el código cita la hoja 4 y no la Tabla 1.

⚠️ **El artículo publica además una graduación por Z y NO se implementó.** La hoja 4 dice: «For
convenience, mild, moderate and severe aortic dilatation can be recognized by positive z-score
values from these models of 1.97–3.0, 3.01–4.0 and >4.0, following a previously-reported
convention». La orden no la pide, esta aplicación no gradúa el seno con este cálculo, y graduar es
decisión del médico → **PR5-c**.

---

## 3 · La superficie corporal: DuBois y no `getBSA`

`getBSA()` es **Mosteller** —`sqrt(peso × talla / 3600)`— y la usan el índice cardíaco, la masa
indexada y diez cálculos más. El artículo normativo es **DuBois**, y este cálculo usa DuBois.

**Eso se aparta de la letra de la orden a propósito, con dos motivos medidos.** (a) Con `getBSA` el
esperado de la pantalla de aorta y el Z de la tarjeta de Marfan saldrían de **dos superficies
distintas del mismo paciente**, que es justo lo que el dueño único viene a evitar. (b) El precio
está medido y es **invisible**: entre las dos fórmulas el esperado cambia **0,02 a 0,07 mm** en los
cinco pares de peso y talla probados —menos que la décima de milímetro que se publica—.
**`getBSA` NO SE TOCA.** Declarado en **PR5-b**.

---

## 4 · Cuándo se publica y cuándo no

`aorEspSenos` devuelve **`null`** —y entonces no se publica nada en ninguna superficie, sin un
texto de «falta tal dato»— si falta la edad, si falta el sexo, si falta el peso o la talla, o si la
edad es **menor de 15 años**. Los 15 **exactos** sí se calculan: es el piso de la población.

El **diámetro** no está en esa lista: el esperado se publica sin él, y lo que no sale es la
diferencia. Y el diámetro entra por **`vPlaus('ao_sin')`**, la misma ventana de plausibilidad
(10 a 90 mm) que usa la cápsula de al lado: un 900 mm tipeado **no** produce una diferencia que el
informe firmado publique.

⚠️ **ESTO NO GRADÚA NADA Y NO MUEVE UN SOLO VOTO.** El grado del seno de Valsalva lo sigue
decidiendo `aoSegGrado` con `AO_DIL_MM` —40 mm en el varón y 36 en la mujer— y su segunda puerta
por índice de dimensión aórtica. Lo fija TC-1030 (D1): con 42 mm en un varón la cápsula sigue
diciendo «Dilatada (≥40mm)».

⚠️ **CONVIVE CON EL NOMOGRAMA QUE EL GLOBO YA PUBLICA**, que es de otra fuente —ASE/EACVI 2015
(Lang), Figura 13, que reimprime a Roman 1989—, tiene sus tres gráficos por edad y vive sólo dentro
del globo. **No se retira**: retirar contenido clínico es decisión del médico → **PR5-a**.

---

## 5 · Las tres superficies

**Pantalla** · un `<div id="ao-esp">` dentro del `.fg` del campo, que **nace escondido**:
«Esperado para edad, sexo y superficie corporal: 35,1 mm · medido 42,0 mm, +6,9 mm (z +2,65)».
Descriptiva: sin color de alarma, sin badge, sin la palabra «dilatada» y sin nombrar ninguna guía.
⚠️ **Es un `div` y NO un control**: el censo del estudio y el Excel recorren `input[id]` y
`select[id]`, así que un campo con id entraría a las **457** columnas por existir. Y el id no
termina en `-aviso`, `-badge`, `-arrow` ni `-ref-fuente` y no arranca con ninguno de los nueve
prefijos que `limpiarCampos` barre, verificado uno por uno.

**Informe y PDF** · **UNA** oración: «Senos de Valsalva 42,0 mm (esperado 35,1 mm para edad, sexo y
superficie corporal).» Va al informe con un `inf.push` y **el PDF la imprime por el mismo lugar**
—lee `informe_texto`—, así que un solo emisor cubre las dos superficies y no pueden divergir.
**NADA en el EN SUMA.**
⚠️ **Es una oración PROPIA y no una cláusula de las cinco ramas de arriba**, por dos motivos: la
regla fija del 03/11 —el informe va en oraciones separadas, una por tema— y que el seno se nombra
en **cinco** redacciones distintas según lo que haya cargado, así que enchufar el paréntesis en
cada una serían cinco copias y la que se olvide es la que se ve.

**Globo ⓘ y Referencias → Aorta** · los cinco bloques de `AOR_DEV_EVID`, leídos por el **mismo**
pintor. El globo agrega arriba la lectura de **este** paciente; Referencias no, porque es material
de consulta y no habla de nadie.

---

## 6 · Los cinco bloques y sus folios

Cada fuente **en su propia oración y por lo que ella dice**: ninguno de estos textos dice que dos
fuentes difieren, ni las compara, ni afirma que algo no se encontró. Es la regla fija del 04/11.

1. **De dónde sale el cálculo** — Devereux 2012, su población, su técnica, su ecuación y su
   criterio de 1,96 SEE, con las hojas 2, 4 y 13.
2. **Criterio de EcoSmart** — usar este cálculo como ayuda en pantalla y publicar el esperado en el
   informe es decisión de esta aplicación, y el grado no lo decide este número.
3. **Lo que dice la ESC 2024** — borde anterior a borde anterior en telediástole (apartado 5.4.1,
   folio **3562**; Clase I · Nivel C, Tabla 4, folio **3566**); considerar indexar a la superficie
   corporal junto con nomogramas, z-score u otros métodos de indexación, sobre todo en tamaños
   corporales bajos (recomendación 5.4, Clase IIa · Nivel B, Tabla 3, folio **3565**); dilatación
   por encima de 2 desviaciones estándar del esperado (folio **3603**); y que corregir por
   superficie corporal puede subestimar la dilatación en el sobrepeso (folio **3603**).
4. **Lo que dice la ACC/AHA 2022** — umbrales absolutos pensados para talla y superficie promedio,
   que se ajustan en personas notablemente más bajas o más altas (folios **e344** y **e345**); es
   razonable indexar una raíz o una ascendente dilatadas a la talla o a la superficie en el informe
   (Clase 2a · Nivel C-LD, folio **e350**); es razonable medir de borde anterior a borde anterior,
   perpendicular al eje del flujo (Clase 2a, folio **e350**); y el z-score no se usa típicamente en
   el adulto (folio **e344**).
5. **Lo que este cálculo no cubre** — la población de Devereux no incluyó personas con obesidad, y
   el propio artículo señala que no se sabe si la superficie corporal subestima la dilatación en
   ellas (hoja 2).

**Las dos reglas de folio, comprobadas por esta tanda en cada folio de la orden**:

| Fuente | Regla | Comprobada en |
|---|---|---|
| ESC 2024 de aorta, edición inglesa | folio = hoja + **3537** | 3562 → hoja 25 · 3565 → 28 · 3566 → 29 · 3603 → 66 |
| ACC/AHA 2022 de aorta (Isselbacher) | folio = «e» + hoja + **333** | e344 → hoja 11 · e345 → 12 · e350 → 17 |

La de la ESC es la misma con la que este archivo ya cita la Figura 5 en el folio 3563 (hoja 26).

---

## 7 · Las tres colas del bloque BF/BG que salieron (TAREA 2)

Las tres vivían dentro del `if (_eaDiscordante && _eaR)`, que **es** el bloque BF/BG, y cada una
dejó su lápida en su rama. **PR4-b queda cerrado.**

| Rama | Lo que salió |
|---|---|
| `bfbg_paradojal` | «Considerar score de calcio valvular por TAC para confirmar severidad.» |
| `bg_flujo_normal` | «Considerar medición incorrecta del TSVI o pseudo-severidad.» |
| `bfbg_clasica_flujo_normal` | «revisar el diámetro del tracto de salida y el trazado de las integrales velocidad-tiempo antes de dar la severidad por establecida.» |

**Se conserva** «No configura la forma clásica de bajo flujo / bajo gradiente», que es DESCRIPCIÓN
y es lo único que distingue esa rama de la clásica; y el aviso de proximidad al umbral de 50 %, que
es una salvedad sobre la medición y no una conducta.

⚠️ **LA LÍNEA DE DISCORDANCIA DE GRADO NO ES DE ESTE BLOQUE Y NO SE TOCÓ.** «Revisar el diámetro
del tracto de salida y el trazado de las integrales velocidad-tiempo.» vive **fuera**: su puerta es
`_eaR.discordanciaGrado && !_eaDiscordante`, o sea la pastilla que no coincide con las mediciones
**sin** escenario discordante. TC-1034 (D1) la monta y exige que **siga en pie**.

⚠️ **LAS TRES, A DIFERENCIA DE LA DE LA DOBUTAMINA DE PR4, NO TIENEN SU CONTENIDO EN LA
EVIDENCIA.** Censado: ni el score de calcio valvular por TAC, ni la revisión del TSVI, ni el repaso
de las integrales aparecen en ninguna sección del panel ni en ninguna ficha de Referencias. Se
retiran igual porque es orden expresa, y **no se escriben en la Evidencia**: eso es contenido
clínico nuevo y lo decide el médico → **PR5-d**.

⚠️ **El volumen latido se RECALCULA del TSVI y pisa lo que se escriba en `vol_lat`** —es el volumen
latido automático—, así que para mover el flujo hay que mover el área del tracto y su integral, y
mantener el área valvular severa eligiendo la integral aórtica. Es lo que TC-1034 hace:

| Escena | Ø TSVI | VTI TSVI | VTI Ao | AVA | VL indexado |
|---|---|---|---|---|---|
| bajo flujo | 20 mm | 15 cm | 59 cm | 0,80 cm² | **24 ml/m²** |
| flujo normal | 24 mm | 16 cm | 90 cm | 0,80 cm² | **37 ml/m²** |

---

## 8 · El cor triatriatum (TAREA 3)

El umbral del **gradiente medio estimado por la membrana por encima de 15 mmHg** vive en el folio
**e165** —no en el e164— , en el **texto de apoyo de la recomendación 5** (resección en el
asintomático con obstrucción grave, clase 2a · nivel C-LD), y **no tiene clase ni nivel propios**:
la clase es de la recomendación, no del número. Con síntomas por obstrucción la resección es clase
1 · nivel B-NR (recomendación 3, folio e163).

La ficha `otr-cortri` dice ahora las dos cosas, y su línea de **fuente** gana los folios **e163 a
e165** y **195 y 196**, que es el único lugar donde esta casa publica un folio.

⚠️ **NO HABÍA NINGUNA CLASE PEGADA AL 15**, y se verificó midiendo la **ORACIÓN** que lo contiene y
no una ventana de caracteres: con 80 a cada lado se captura el «clase 2a, nivel B-NR» de la oración
**anterior**, que es la de la recomendación diagnóstica del transesofágico y **tiene que quedar**.
Es la condición (B1) de TC-1033, con (C1) como control de que esa clase sigue.

⚠️ **El autor y el año no se tocaron.** La ficha sigue diciendo «ACC/AHA 2025 (Gurvitz)», que es lo
que la **regla fija del 2026-11-06** de `CLAUDE.md` manda: el título oficial impreso y el copyright
de la guía dicen 2025, y el «2026» del pie de las hojas interiores es el año del número de
*Circulation* (2026;153:e115-e251).

---

## 9 · Cobertura

| Caso | Qué fija |
|---|---|
| **TC-1029** | la ecuación con los cuatro números de la orden, el margen de 5,1156 mm, el término del sexo, la década, y los **cuatro** dueños únicos |
| **TC-1030** | la línea no aparece con edad 14, sin sexo ni sin superficie; los 15 exactos sí; sin diámetro sale el esperado y no la diferencia; y la cápsula no se movió |
| **TC-1031** | la frase en el informe **y en el PDF generado de verdad**, una sola vez, con sus dos controles negativos, y ausente del EN SUMA |
| **TC-1032** | las **19** cifras y folios en el dueño, en el globo y en Referencias, y **cero** en el papel |
| **TC-1033** | el folio e165, el e164 ausente, ninguna clase pegada al 15, y lo que se conserva |
| **TC-1034** | las tres colas ausentes en las **cuatro** ramas, cero números perdidos, lo que se conserva, y la línea de discordancia en pie |

**Los seis caen contra `b005504`** con el mismo archivo de casos y sólo el `index.html` distinto,
**por sus condiciones y ninguno por excepción**.
⚠️ **Eso último costó una guarda**: la primera versión de TC-1030 accedía a `aorEspSenos` pelado y
contra la línea base tiraba `ReferenceError`, que **se lleva el caso entero** y deja las
condiciones de abajo sin evaluar — un rojo que no apunta a su causa. Es la lección de TC-827.

El barrido es `scripts/_mut_pr5.py`, con `--anclas` para verificar que las **18** emparejan **antes**
de correr. **Tres de las dieciocho no revierten nada: la aplican de más** —la 07, la 08 y la 15—,
porque las condiciones que las matan son **controles negativos**, y un control negativo que ninguna
mutación puede romper no prueba nada.
⚠️ **La 03 no puede ser «`MFS_Z_SEE = 0.261` escrito a mano»**: sería **equivalente**, porque la
condición compara los VALORES y los dos darían 0,261. Para cubrir el dueño único hay que moverle el
valor.

---

## 10 · Las sondas

| Sonda | Qué mide |
|---|---|
| `scripts/_probe_pr5.mjs` (+ su cuerpo) | la ecuación, la línea de pantalla, los tres casos de no-aplica, el informe, el EN SUMA, el globo y Referencias |
| `scripts/_probe_pr5b.mjs` (+ su cuerpo) | las cuatro ramas del BF/BG y la ficha del cor triatriatum |

⚠️ **Las dos abren la pestaña CLICKEANDO su botón y no llamando a `showTab`**: esa función lee el
`window.event` **global** y revienta con «reading classList» cuando ese global es el `success` de
una transacción de IndexedDB. Es **P30-d**, preexistente y declarada.
⚠️ **Y `secToggle` es un TOGGLE**: llamarlo a secas **cierra** la sección si ya estaba abierta. Se
asegura el estado por `aria-expanded`, que es el denominador del gesto. La primera corrida midió el
globo en **0 caracteres** por las dos cosas a la vez.
