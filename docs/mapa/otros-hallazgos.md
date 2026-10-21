# La pestaña OTROS — ASIA, variantes, RAC, test de burbuja, derrame y líneas B

Mapa de los commits **CORTOS10 a CORTOS13** (2026-10-17). La PARTE 1 de esa tanda —prótesis,
diastólica, Laboratorio y PDF— está en `docs/mapa/cortos-arreglos.md`. Lo que ya existía en esa
pestaña —pericardio, masas, módulo pulmonar básico y avanzado— sigue en
`docs/mapa/congenitas-otros.md`.

---

## 1 · La regla de los ocho hallazgos: una casilla y una caja

**Decisión de Maicol.** Cada elemento lleva **una casilla** y **una caja de nota** al lado, con la
misma regla para los ocho:

| estado | qué sale al informe |
|---|---|
| casilla **apagada** | **nada**, aunque la caja tenga texto escrito |
| casilla encendida, caja **vacía** | el **texto por defecto** del hallazgo |
| casilla encendida, caja **escrita** | el texto por defecto **+ la nota**, en la MISMA oración |

- Es el patrón que `pul_consol_nota` ya usa en la sección de al lado, y es lo que hace que **una
  caja escrita y olvidada con la casilla apagada no pueda entrar al informe firmado**.
- **La nota no se envuelve en nada por código:** el médico escribe lo que quiere —el `placeholder`
  del campo sugiere el formato— y la app no le pone paréntesis ni comillas a un texto clínico que
  no redactó.

### El dueño único: `OTR_HALL`

| `id` | `def` (lo que va al informe) | `suma` (EN SUMA) |
|---|---|---|
| `otr_asia` | Aneurisma del septum interauricular | **ASIA** |
| `otr_var_eustaquio` | Válvula de Eustaquio prominente | — |
| `otr_var_chiari` | Red de Chiari prominente | — |
| `otr_var_lipo` | Hipertrofia lipomatosa del septum interauricular | — |
| `otr_var_tendones` | Falsos tendones en el ventrículo izquierdo | — |
| `otr_var_lambl` | Excrecencias de Lambl | — |
| `otr_var_senocor` | Seno coronario dilatado | — |
| `otr_rac` | Arteria circunfleja retroaórtica | **RAC** |

- **La tabla es la única copia de cada frase.** El rótulo de la casilla en pantalla es el nombre
  corto; la oración del papel sale de acá.
- `suma: null` es lo que deja a las **seis variantes anatómicas** fuera del EN SUMA: son estructuras
  normales prominentes y no un hallazgo que cambie la conducta. Es la decisión de la orden.
- `otrHallazgos(src)` devuelve **datos y no HTML**, con `src` opcional para leer un estudio
  archivado, y `[]` sin ninguna casilla encendida — así el informe de hoy no cambia ni un byte
  mientras nadie toque nada.

### Dónde viven y qué sale en el papel

- **TRES bloques** en la tarjeta de «Pericardio y Masas», **separados de «Masas»**: septum
  interauricular (ASIA), variantes anatómicas (las seis) y anomalías coronarias (RAC). No son la
  misma pregunta, y una masa intracardíaca no es una variante anatómica.
- Las ocho oraciones van en el **bloque 13** de `generarInforme`, **debajo** del derrame y de las
  masas, **una oración aparte por hallazgo**.
- **No hay `estiloPick`:** las ocho son el nombre del hallazgo más lo que el médico escribió, y no
  hay una versión «narrativa» de un nombre propio. Salen iguales en los tres estilos, igual que la
  oración de la masa intracardíaca.

**Medido con clics y teclas reales** (`scripts/_probe_cortos.mjs`, grupo `otros`):

| escena | informe | EN SUMA |
|---|---|---|
| ASIA sola | `Aneurisma del septum interauricular.` | `ASIA.` |
| ASIA con nota | `Aneurisma del septum interauricular (de 15 mm por 12 mm en eje L y T).` | `ASIA.` |
| nota **sin** la casilla | — | — |
| una variante | `Red de Chiari prominente.` | — |
| RAC | `Arteria circunfleja retroaórtica.` | `RAC.` |

---

## 2 · El test de burbuja (CORTOS11)

### Inventario — dónde se cargaba y dónde se carga

| Dónde | Qué | Escala |
|---|---|---|
| sección **FOP** de «CC frecuentes» | `fop_contraste` + `fop_burbujas` | `pocas` <5 · `moderado` 5-20 · `abundante` >20 |
| pestaña **Referencias**, ficha «Test de Burbujas» | los cortes | grados 0 / I <10 / II 10-30 / III >30, y 3 / 4-5 / >5 latidos |
| **Laboratorio** | barra «Paso de burbujas con contraste» | lee `fop_burbujas` |
| pestaña **Otros** (desde el CORTOS11) | el hallazgo a nivel de estudio | <10 / 10-30 / >30, las de Referencias |

⚠️ **LA DUPLICACIÓN DEL MÓDULO FOP ES PREEXISTENTE, ESTÁ DECLARADA Y NO SE TOCÓ.** Unificar los
`value` de ese `<select>` dejaría a cada estudio guardado con un valor que su selector ya no ofrece
—`selectedIndex -1`, la trampa que `et_grado` pagó— y cambiaría el texto del módulo FOP y las
barras del Laboratorio, que esta orden no autoriza. Está en `docs/PENDIENTES.md`.

### Los cinco controles y su frase

- `otr_burb` (casilla «Se realiza test de burbuja») gobierna el bloque entero; `otr_burb_pasaje`
  decide si se preguntan los tres detalles. **Sin pasaje no se pregunta nada más.**
- **El texto del papel sale de la `<option>` ELEGIDA**, no de un mapa paralelo: es la regla que el
  selector del S/D venoso pulmonar ya pagó con un ternario que imprimía el signo contrario. Por eso
  los rótulos de las opciones son exactamente las palabras que van al papel: «entre 10 y 30», «con
  Valsalva», «antes del tercer latido».

| escena | informe | EN SUMA |
|---|---|---|
| pasaje, con los tres detalles | `Se realiza test de burbuja, se observa pasaje de burbujas (entre 10 y 30), con Valsalva, antes del tercer latido.` | `Test de burbuja positivo.` |
| sin pasaje | `Se realiza test de burbuja, no se observa pasaje de burbujas.` | `Test de burbuja negativo.` |
| pasaje sin consignar | `Se realiza test de burbuja.` | — |

- **El informe NO interpreta:** no dice «intracardíaco» ni «intrapulmonar». Esa lectura está en la
  ficha de Referencias que el globo abre, y es del médico.
- **Al EN SUMA no se inventa un nombre de grado:** positivo o negativo, que es la decisión de la
  orden. Qué dice la fuente de Referencias sobre los grados está en el inventario de arriba —0, I,
  II y III por cantidad— y los nombres los decide Maicol.
- `otrBurbUI` gobierna el `display` de los dos envoltorios y entra en **`RECALC_MODULOS`** y al
  final de `limpiarCampos`: el barrido genérico desmarca la casilla pero **ningún barrido toca el
  `display`**, así que sin esa línea los cuatro selectores del paciente anterior quedaban a la
  vista sobre un formulario recién limpiado.

---

## 3 · Los cuatro globos ⓘ nuevos

| clave de `VINFO` | dónde | qué muestra |
|---|---|---|
| `otr-burbujas` | casilla del test de burbuja (Otros) | las **dos tablas** de la ficha «Test de Burbujas»: latidos y cantidad |
| `otr-rac` | casilla de la RAC (Otros) | la ficha «Anomalías coronarias congénitas» |
| `oai-ref` | sección de la orejuela (ETE) | la ficha «OAI — Orejuela Izquierda y Cierre Percutáneo» |
| `pul-balik` | campo Balik del módulo pulmonar | la fórmula, qué mide, su fuente y su **alcance** |

- **Los tres primeros CLONAN los nodos de la ficha** (`_otrRefClon`), no copian su texto: una copia
  sería una segunda versión que se separa de la primera el día que una se toque, que es el defecto
  que los siete `title` de legado de la mitral ya pagaron. `cloneNode(true)` deja la ficha intacta
  en su pestaña, y no hay `innerHTML` con datos.
- `modo: 'tablas'` clona **sólo** los `<table>` con el encabezado que cada uno tiene justo encima.
  La selección es **estructural** y no por el texto de un rótulo: un `<table>` es un `<table>`
  aunque mañana cambie su título.
- ⚠️ **EL GLOBO DE LA OREJUELA VA EN UNA FILA DEL CUERPO Y NO DENTRO DEL `<h2>` DEL ACORDEÓN:** ese
  encabezado ya es un control con `onclick`, y un botón dentro de otro no es marcado válido —el
  navegador lo saca del padre al parsear—, que es la lección del globo del panel de Evidencia.
- **El registro pasa de 30 a 34 entradas.** Ninguna de las cuatro está en la pestaña Válvulas, así
  que lo que TC-472 afirma de esa pestaña no cambia; TC-471 cuenta el registro y se adaptó.

---

## 4 · La ficha de anomalías coronarias (CORTOS12)

**La entrada existe porque la fuente está VISTA.** La orden la condicionaba a encontrarla en la
biblioteca:

- **ASE 2020** — Frommelt et al, «Recommendations for Multimodality Assessment of Congenital
  Coronary Anomalies», *J Am Soc Echocardiogr* 2020;33(3):259-294, DOI 10.1016/j.echo.2019.10.011.
- **Regla de folio comprobada en el PIE IMPRESO de cuatro páginas: folio = hoja del PDF + 258**
  (hoja 1 → 259, 6 → 264, 8 → 266, 9 → 267).
- **Folio 266 (hoja 8), literal:** «anomalous CA can arise from the opposite sinus and course
  anterior to the pulmonary artery (PA), posterior to the aorta (retro-aortic), or between them
  (interarterial) … AAOCA with an interarterial course is associated with increased risk for
  cardiac [events]».

La ficha publica **eso y nada más**: los tres trayectos y cuál es el de riesgo aumentado. **No
gradúa, no recomienda conducta y no dice que el trayecto retroaórtico sea «benigno»** — la fuente
dice cuál es el de riesgo y eso es lo que se publica. Lo que no se leyó, no se cita.

---

## 5 · El derrame pericárdico en el papel (CORTOS13)

- El `<select>` guarda «Derrame severo (>20mm)» y el informe **firmado** imprimía ese token tal
  cual: al lado del derrame **pleural** del módulo pulmonar, «Derrame severo» no dice de qué derrame
  habla.
- Un dueño único (`_periTxt`) lo escribe, y lo leen el **cuerpo** y el **EN SUMA**.
- ⚠️ **EL `value` DEL SELECTOR NO SE TOCA.** Es lo que viaja en `campos`, lo que exporta el Excel
  («Pericardio») y lo que leen los estudios guardados: cambiarlo dejaría a cada uno con un valor que
  su propio selector ya no ofrece.
- **Medido:** `Derrame pericárdico severo (>20mm).` en los dos, y con la cláusula hemodinámica
  `Derrame pericárdico moderado (10-20mm), sin compromiso hemodinámico.`; en narrativo, «Se observa
  derrame pericárdico severo…».
- ⚠️ **«Engrosamiento / calcificación» NO SE TOCA y se declara:** no empieza con «Derrame», así que
  el dueño lo devuelve igual. Nombrarle el pericardio es redactar una frase clínica que esta orden
  no autoriza.

---

## 6 · La separación de las líneas B (CORTOS13)

- `pul_lineasb_sep`, con las **dos separaciones que la orden dicta**: ≈ 7 mm y ≈ 3 mm. Aparece con
  las líneas B en «Sí», y sin consignar la oración sale **idéntica** a la de hoy.
- ⚠️ **SIN FUENTE EN LA BIBLIOTECA, y se declara.** Barrido de los **seis** PDF de ecografía
  pulmonar por «B7», «B3», «7 mm», «3 mm», «interlobular» y «septal thick», y barrido global por
  «B7» y «7 mm apart»: **cero**. El único documento que nombra «B3 lines» es el protocolo BLUE
  (Lichtenstein, *Chest* 2008, hoja 3) y **no da ninguna separación en milímetros**.
- Por eso las dos opciones son **descriptivas y nada más**: dicen la separación que el médico midió
  y **no la interpretan** —ni «septal» ni «vidrio deslustrado»—, no llevan cita y el dato **no tiene
  globo**.
- **Medido:** `Líneas B de distribución difusa, con separación aproximada de 7 mm.` y, sin
  consignar, `Líneas B de distribución difusa.`

---

## 7 · La fórmula de Balik ya tiene fuente verificada (CORTOS13)

Cierra `Y3b-5`. **No es el artículo original** —que no está en la biblioteca— **sino una guía que la
publica con su alcance**:

- «International evidence-based recommendations for point-of-care lung ultrasound — 2025 focused
  update of the 2012 recommendations» (Volpicelli et al, *Intensive Care Med* 2026,
  DOI 10.1007/s00134-026-08487-2), enunciado **D6_11**, **hoja 19** del PDF.
- **Literal:** «A practical semi-quantification method involves performing a lateral transverse view
  over the costophrenic angle in the supine patient. Once the maximum space occupied by the effusion
  is visualized, the maximal distance (D) between parietal and visceral pleura should be measured.
  The following formula can be used to estimate the approximate volume (V): **V (ml) = D (mm) ×
  20**. This formula has been **validated in critically ill patients in intensive care units
  undergoing invasive ventilation**. In other settings where the patient can be examined in a
  sitting position, other methods based on multiplanar acquisition may offer greater accuracy.»
- Es **exactamente** lo que la app calcula (`_balikVol`, ml = mm × 20) y **no se movió ni un
  número**. Ese documento es *online first* y **no tiene folio impreso**, así que se cita por
  enunciado y hoja.
- El **alcance** —validada en pacientes críticos bajo ventilación invasiva— va en el globo del
  campo, que es donde el médico lo necesita.

---

## 8 · Lo que viaja, lo que no, y el Excel

- **Los 21 campos nuevos de Otros viajan con el estudio** (las casillas como `<id>__chk`, que es lo
  que el recolector guarda y lo que el restaurador genérico repone). Medido: las 21 claves aparecen
  con su valor.
- **SIN COLUMNAS NUEVAS DE EXCEL: 440**, medido clave por clave. Ninguna columna nombra ASIA, la
  RAC, el test de burbuja ni la separación de las líneas B.
- **Nada se guarda en el navegador:** cero claves de `localStorage` o `sessionStorage` que nombren
  estos hallazgos.
- **«Nuevo estudio» los limpia:** el barrido genérico desmarca las casillas y vacía las cajas, y
  `otrBurbUI` cierra los dos envoltorios del test de burbuja.

---

## 9 · Las trampas de esta parte

1. **UN BOTÓN DENTRO DE UN `<h2>` CON `onclick` NO ES MARCADO VÁLIDO** y el navegador lo saca del
   padre al parsear: el globo de la orejuela va en una fila del cuerpo.
2. **`camposGuardados()` DE LA SONDA NO DEVUELVE LAS CLAVES**, sólo el conteo y el hash: la primera
   lectura informó «cero campos nuevos» sobre 21 que sí viajan. Hace falta un helper que las liste.
3. **UN ACENTO GRAVE DENTRO DE `SONDA2` NO LO CAZA `check_backticks.py`** —su cobertura es el cuerpo
   de un `caso(...)` y el de la sonda inyectada—: lo dio `node --check`. **Correr los dos.**
4. **EL CLIC REAL SOBRE UNA CASILLA EXIGE ABRIR SU SECCIÓN:** las tres secciones de Otros nacen en
   `display:none` y lo que está ahí no tiene geometría, así que el clic aborta —que es lo correcto—
   y sin mirar el aborto las escenas salen «sin cambios», indistinguible de «el cableado no
   funciona».


---

## ⚠️ La separación de las líneas B se RETIRÓ, y el test de burbuja tiene UN dueño (ARR, 18/10/2026)

- **`pul_lineasb_sep` ya no existe** —ni el selector, ni su envoltorio, ni la cláusula «con
  separación aproximada de …»—: entró en el CORTOS13 y salió por la **misma falta de fuente** que
  las dos veces quedó declarada. La oración vuelve a «Líneas B de distribución difusa / focal.».
  El resto del CORTOS13 se conserva: el **derrame pericárdico** del papel y la **fuente de Balik**.
- **El test de burbuja y el aneurisma del septum de esta pestaña se espejan con el módulo FOP** y
  comparten su escala; con el módulo FOP integrado al informe, **los dos hallazgos de acá se
  callan** para no publicar dos oraciones del mismo hecho. →
  `docs/mapa/fop-burbuja-unificado.md`

---

## → La tanda «P» (2026-10-18): Referencias con subpestañas, buscador y «Ver referencia»

La pestaña **Referencias** pasó a **cinco subpestañas** (Dimensiones · Función · Válvulas · Aorta ·
Otros hallazgos) con un **buscador** y, en las tarjetas ⓘ que tienen entrada, un botón **«Ver
referencia»** con su «Volver». La subpestaña **Aorta** sumó la **tabla de umbrales de cirugía**
verificada contra la ESC 2024, y la entrada **vieja del VD** (`ref-vd`, ASE 2015, con la onda S′
tipeada en «≥ 10») **se retiró**: la que corresponde es `ref-vd2`, derivada del dueño.

**No cambió ningún cálculo, corte, operador ni texto del informe**, y el Excel quedó en 440
columnas idéntico.

**Está todo en `docs/mapa/referencias-subpestanas.md`**: el reparto (`REF_SUBTAB`), el índice del
buscador y su normalización, el mapeo `VINFO_REF` con las cinco tarjetas que no llevan botón, la
tabla `AO_CX_T` con su folio por fila y su sondeo del dueño, y nueve trampas medidas.

---

## ⚠️ LA REORGANIZACIÓN DE PESTAÑAS — trabajo «B» (2026-10-21)

Las pantallas de esta zona **cambiaron de lugar**. Nada de lo que este mapa documenta —cortes,
operadores, fórmulas, textos clínicos, ids— se movió; lo que cambió son las puertas:

- **Pericardio y masas** salió de «Otros» a su propia pestaña del rail (`#tab-pericardio`).
- **Otros** quedó con dos sub-pestañas: «Test de burbuja» y «Variantes anatómicas» (el ASIA, las
  seis estructuras normales prominentes y la RAC).
- **El eco pulmonar** —básico y avanzado— quedó en UNA pestaña del rail, y el texto del avanzado
  pasó de una hoja aparte del PDF al **cuerpo del informe**.
- **Calculadoras** es hoy la primera sub-pestaña de **Referencias**.
- **CC frecuentes** y **CC complejas** se abren con un solo botón, «C. Congénitas».
- El **Fonocardiograma** salió de la app (copiado a `docs/para-cardiosalud/fonocardiograma/`).
- La única palabra que cambió es la frase de **Balik**, que ahora nombra la fórmula.

**El mapa de todo eso es `docs/mapa/pestanas-reorganizacion.md`**, con la tabla «qué se movió»,
las tres cosas que `showTab` hace y que condicionan cualquier barra de sub-pestañas, el drawer
móvil y sus `data-mod`, y las seis trampas de medición.

---

## El trabajo «D» (2026-10-22) — el foramen oval: puntero

La tanda del **FOP** vive en `docs/mapa/fop-burbuja-unificado.md` → «El trabajo D». Lo que toca
de esta zona:

- **`otr_asia_lado`** («Se abomba hacia»: AD, AI o ambos) nace en **Otros · Variantes
  anatómicas**, al lado de `otr_asia`, y es su **dueño único**. Decide el corte del aneurisma
  del septum: 10 mm hacia un lado, **15 mm de excursión total** con «ambos lados» (Silvestry
  2015, folio 916). Sin consignar manda el de 10, que es el que la app aplica desde siempre.
- **`otr_burb_lat`** (3 a 6 latidos, con el **3 por defecto**) nace en **Otros · Test de
  burbuja**, dentro de `otr-burb-pos`, y también es dueño único (Silvestry 2015, folio 931).
  Su primera opción es el 3 y la vacía va última: `limpiarCampos` hace `selectedIndex = 0`.
- La sección del FOP de «CC frecuentes» pasa a **tres columnas** —Anatomía, Shunt y Contexto
  clínico— y **lee** esos dos datos en dos `<span>` de solo lectura. **Sin dibujo.**
- La ficha **«Foramen Oval Permeable — ASIA, shunt y cierre»** entra en Referencias ·
  **Otros hallazgos**, pegada a la del test de burbuja; la de **Test de Burbujas** gana la
  **fuente** de su tabla de tiempos, y **ni un corte de esa tabla se movió**.
- La conclusión, el informe y el EN SUMA del FOP son **descriptivos**: sin «ESC», sin indicación
  de cierre y **sin el ACV criptogénico**, que pasa al PDF como «Motivo del estudio».

---

## ⚠️ LA TANDA «D2» (21/10/2026) — ver `docs/mapa/d2-correcciones.md`

- La oración del **ASIA** de esta pestaña pasa a publicar la **excursión con su lado**, leída de
  `asiaExcFrase`: decía «Aneurisma del septum interauricular 16.», donde el 16 era la caja de
  detalle del médico y la app no nombraba la excursión por ningún camino. **La caja de detalle no
  se toca** y va después de la frase.
- **`otr_asia_lado` vuelve a VACÍO** cuando el ASIA pasa a «No», por los dos gestos.
- **`otr_burb_lat` nace sin consignar**: la opción vacía pasa al primer lugar.
