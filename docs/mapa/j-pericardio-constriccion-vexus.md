# Tanda J — pericardio y taponamiento, constricción y VEXUS (2026-10-24)

Mapa **por nombre de función y de constante**, no por número de línea: la línea cambia en cada
edición y el nombre no. Siete commits: `87a17f9` · `f883476` · `4f081cd` · `c7d07b2` · `b4ff8ec`
· `4326c2e` · el de cobertura y documentación.

---

## 1 · Dónde vive cada cosa

| Lo que buscás | Dónde está |
|---|---|
| El corte de plétora de VCI del **pericardio** | `DPT_VCI_PLETORA_MM` (20 mm, estricto), leída por `dptPletora()` |
| El corte de plétora de VCI del **HTP** | `_htp2022Core`, su `vciD > 21`. **Es otro corte, de otra guía, y no se tocó** |
| El corte de la **duración del colapso auricular derecho** | `DPT_COL_AD_DUR_SIG` (0,34, estricto) |
| El campo donde se carga esa duración | `dpt_col_ad_dur`, banda `(0, 1]` por `_dptFrac()` |
| La frase del colapso auricular derecho | `dptEstado()`, el `otros.push` de `dpt_col_ad` |
| El rótulo del campo en pantalla | el `<label>` de `dpt_col_ad`, «Colapso AD — diastólico (Tabla 17)» |
| El corte del **cociente de la vena suprahepática** | `CVR_HEP_COC_MIN` (0,78, estricto) |
| El campo del cociente | `cvr_hep_coc`, banda `(0, 5]`, leído en `cvrDatos().hepCoc` |
| La lectura del cociente en pantalla | el span `cvr-coc-eval`, escrito por `cvrSync()` |
| El corte de VCI de **VEXUS** | `VEXUS_VCI_MM` (20 mm), con **dos operadores**: ver abajo |
| Las tres Evidencias nuevas | `_indDerrPeri()`, `_indConstr()` y `_indVexus()`, registradas en `IND_SECS` |
| Las dos referencias nuevas | `escPeri2025` y `vexus2020`, en `IND_REFS` |
| La ficha de Referencias de constricción | el `<div id="ref-constriccion">`, abierta por `toggleRef('constriccion')` |

---

## 2 · El taponamiento (commit 1)

**ESC 2025 de miocarditis y pericarditis, Tabla 17, folio impreso 62** del original en inglés
(DOI 10.1093/eurheartj/ehaf192), leída en imagen. Tres filas movieron la app:

| Lo que la app decía | Lo que la Tabla 17 publica | Qué quedó |
|---|---|---|
| Colapso de AD **sistólico (≥1/3 del ciclo)** | «Diastolic collapse of the RA» | **diastólico**, en las cuatro superficies |
| — (no existía) | «Duration of diastolic collapse of the RA as a ratio of the cardiac cycle length >0.34» | campo nuevo `dpt_col_ad_dur`, corte estricto |
| Plétora con **>21 mm** y colapso <50 % | «dilatation >20 mm and <50% reduction» | **>20 mm**; el colapso <50 % no se movió |

⚠️ **La Tabla 17 NO menciona el colapso de la aurícula izquierda ni el del ventrículo izquierdo.**
Se mantienen, se describen y pasaron al chip «CRITERIO DE ECOSMART» del módulo. La plétora y la
fase del colapso auricular derecho **salieron** de ese chip, porque ya siguen a la guía.

⚠️ **La duración va entre PARÉNTESIS y no entre comas**, y lo destapó el A/B: `signos` se publica
como una enumeración separada por comas, así que «…aurícula derecha de 0,35 del ciclo, por encima
de 0,34 y variación respiratoria…» se leía como si «por encima de 0,34» fuera un signo más.

⚠️ **Dos cortes de VCI en la misma app, y es deliberado.** El del pericardio sale de la Tabla 17 y
el del HTP de la categoría C de la ESC/ERS 2022, que es otra guía y que esta orden excluía. El
comentario que vivía sobre `dptPletora` decía lo contrario —«el MISMO criterio que la categoría
C»— y esa unificación era justo lo que hacía marcar plétora un milímetro tarde.

**Ningún camino concluye taponamiento.** Eso lo retiró el R6 y esta tanda no lo repuso.

---

## 3 · La constricción (commit 3)

**Qué salió:** `CVR_DISCLAIMER` —«El diagnóstico definitivo de constricción requiere correlación
clínica e invasiva»—, que se publicaba **siempre** en la pantalla, en el informe firmado bajo el
patrón restrictivo y en dos ramas de la hoja del PDF. Y con él, «Se recomienda cateterismo
cardíaco derecho e izquierdo simultáneo para diagnóstico definitivo», que era la misma conducta
escrita dentro de una frase clínica de la rama `mixto`.

**Por qué:** la guía lo condiciona. Apartado **11.9.3, folio 63**: el cateterismo «sólo debe
considerarse si la imagen multimodal no invasiva no es concluyente». **Recommendation Table 24,
folio 64**: Clase **IIa · Nivel C** con esa misma condición. La app pedía de más, y en el papel.

**Qué entró:** el cociente de inversión diastólica espiratoria de la vena hepática, `cvr_hep_coc`,
con corte **>0,78** (apartado 11.9.3: sensibilidad 87 %, especificidad 91 %). Son criterios de la
Clínica Mayo que la ESC cita; **Welch 2014 no está en la biblioteca**, así que se cita la ESC 2025.

⚠️ **La Figura S1 del suplemento lo redondea a >0,8** (hoja 6, nota c). Se usa el 0,78 —el valor
del texto, el que trae esos dos porcentajes— y el redondeo **se declara**: al lado del campo, en la
ficha de Referencias y en el ⓘ de la Evidencia. Entre 0,78 y 0,80 las dos cifras de la misma guía
dan resultados distintos, y callarlo sería elegir una sin decirlo.

⚠️ **El cociente NO vota.** Las reglas de conteo no tienen fuente y la orden las excluía: una fila
votante movería `nC`, `nR` y con ellos `clave`. Cuantifica la fila que ya existe. Medido: con el
cociente en 0,77, 0,78 y 0,79 el conteo da 6/6/6 y el veredicto no se mueve.

**Los chips.** El **e′ lateral de 10 cm/s** y el **E/e′ de 15** no son cortes de esta distinción:
son criterios mayores del HFA-PEFF (**Pieske 2019, folio 3303**, leído en imagen: «septal e′<7
cm/s, or lateral e′<10 cm/s» y «average septal–lateral E/e′ ratio ≥15»). Las **reglas de conteo**
no tienen fuente. El **engrosamiento de >3 mm** del selector de TC/RMC tampoco. Los tres se
declaran y no se citan.

**El e′ medial en tres tramos** (>8 / 6–8 / <6) es del R2 y **no se tocó**: medido en 9, 7 y 5.

---

## 4 · VEXUS (commit 5)

**Beaubien-Souligny et al., Ultrasound J 2020;12(1):16, Figura 1, página 3**, columna **VExUS C**,
leída en imagen. El artículo usa **dos operadores distintos** y la app usaba uno solo:

| Grado | Lo que la Figura 1 pide | Lo que la app hacía |
|---|---|---|
| 0 | VCI **< 2 cm** | igual |
| 1 | VCI **≥ 2 cm**, patrones normales o leves | igual |
| 2 | VCI **> 2 cm**, un patrón severo | usaba `≥ 2 cm` |
| 3 | VCI **> 2 cm**, dos o más patrones severos | usaba `≥ 2 cm` |

⚠️ **En los 20,0 mm exactos CON vasos severos la figura no tiene fila** —el grado 1 pide patrones
normales o leves y el 2 pide más de 2 cm—. Se elige el **grado menor**, que es el lado que no
afirma de más: un grado inflado es el que dispara la descongestión. Medido: 19 → 0 siempre;
20 → 1 siempre, también con uno y con dos vasos severos; 21 → 1, 2 y 3 según cuántos severos.

**Las frases de conducta salieron** de la pantalla, del informe firmado y de la hoja del PDF:
«Monitorizar evolución. Considerar balance hídrico.», «Evaluar necesidad de descongestión.» y
«Considerar descongestión activa — diuréticos o ultrafiltración según contexto clínico. Reevaluar
con tratamiento.». El artículo **no da pasos por grado** —censado— y no se cita ninguna otra
fuente para ellos. Viven sólo en la Evidencia, con el chip «Criterio de EcoSmart».

⚠️ **Lo que NO se tocó:** «Riesgo de injuria renal aguda aumentado» y «Alta asociación con injuria
renal aguda (AKI)» no son conductas, son la asociación que el artículo mide.

---

## 5 · Las tres Evidencias (commits 2, 4 y 6)

Formato **compacto**, el que dejó el AJ6 en la Evidencia de Fallot: recomendaciones arriba, una
fila de una línea por dato, la prosa larga en el ⓘ, dos columnas en pantalla ancha.
Lo que el médico contesta **no se guarda**: `_indClin` es un const de módulo que `indicAbrir()`
limpia al abrir.

| Sección | Compuerta (un solo dueño) | Qué publica |
|---|---|---|
| `_indDerrPeri` · «Derrame pericárdico y taponamiento» | `dptEstado().hayDerrame` | las tres filas de la Recommendation Table 12 (folio 43), todas Clase I · Nivel C |
| `_indConstr` · «Constricción pericárdica — diagnóstico» | `cvrEstado().espEval` | imagen multimodal Clase I · Nivel C y cateterismo Clase IIa · Nivel C condicionado (Table 24, folio 64) |
| `_indVexus` · «Congestión venosa sistémica — VExUS» | `vexusEstado().score !== null` | lo que el artículo mide, **sin clase ni nivel**, y las tres conductas con chip |

⚠️ **Ninguno de los tres títulos es prefijo de otro ni de los veinticuatro anteriores**, que es lo
que `IND_SECS` necesita para no dejar una sección sin probar. Verificado.

⚠️ **Lo que NO se escribió, y por qué:**
- **No hay umbral automático de taponamiento.** La guía dice en el folio 62 que el diagnóstico es
  clínico, con confirmación por ecocardiografía, y ninguna tabla fija un número de signos de eco.
  Entra como pregunta al médico. Reponer el conteo acá sería publicar por la puerta de atrás la
  regla que el R6 sacó del módulo.
- **No hay tabla de recomendaciones propia del derrame ni del taponamiento.** Censadas las
  veintisiete de la guía: la única que los alcanza es la 12.
- **Las filas de TRATAMIENTO de la Tabla 24** —antiinflamatorios y pericardiectomía, las dos
  Clase I · Nivel C— no se publican: dependen de la inflamación pericárdica y de la respuesta al
  tratamiento, que la app no registra. Serían filas que ningún dato del estudio puede mover.
- **Para VEXUS no hay clase ni nivel**, porque la fuente es un artículo original y no los publica.

⚠️ **Las filas sin fuente van SIN corchete**: los colapsos de AI y VI, el e′ lateral, el E/e′, el
recuento de criterios y las tres conductas de VEXUS. Citar una fuente verificada al lado de algo
que esa fuente no dice la haría respaldarlo.

---

## 6 · Dos trampas que esta tanda pagó

⚠️ **`\s` dentro de un template literal se come la barra, y el regex pasa a borrar las eses.**
Las sondas inyectan su código como un template literal, así que `/\s+/g` escrito ahí llega a la
página como `/s+/g`: «Constricción» se vuelve «Con tricción» y una búsqueda por prefijo no
encuentra nada. El síntoma fue «NO HAY SECCIÓN» sobre secciones que existían. Va `/\\s+/g`.

⚠️ **El panel de Evidencia hay que ABRIRLO antes de contestar una pregunta.** Quien engancha el
oyente de los botones `[data-ind-clin]` es `_indClinCablear()`, y a esa la llama `indicAbrir()`,
**no** `indicRender()`. Sin abrir, un `b.click()` no escribe nada en `_indClin`, los bloques de
recomendación salen vacíos y el caso lo lee como «no emite» — que es exactamente el mismo texto
que da una Evidencia sana sin contestar. **Un rojo que parece verde.**
Y `indicAbrir()` **limpia** las respuestas anteriores: se abre una vez por bloque y después se
repinta con `indicRender()`.

⚠️ **La bibliografía de la sección imprime el texto completo de la referencia**, que nombra las
filas con su clase y su nivel. Buscar «Clase I · Nivel C» o «cateterismo» en el `textContent` de
la sección da positivo sobre la bibliografía **aunque no se haya emitido una sola recomendación**.
Las condiciones comparan la frase ENTERA.

---

## 7 · La ficha de los casos

`docs/mapa/tests-fichas-532.md` — TC-532, el caso de esta tanda.

---

## ⚠️ La tanda AJ7 cerró J-a y J-b (24/10/2026)

- Las **dos últimas conductas** salieron del informe y del PDF, y **no tuvieron el mismo
  destino**: «requiere correlación clínica e imagenológica» ya estaba en la Evidencia con su
  Clase I · Nivel C; «Considerar RMC con gadolinio» **se retira y no va a Evidencia**.
- La **compuerta de la Evidencia** de constricción pasa a mirar los datos propios —e′ medial y
  lateral, rebote septal, patrón venoso hepático y su cociente—. Lo que eso cuesta está medido:
  `PENDIENTES.md` → **AJ7-c**.
- El **aviso de la VCI** se arma con `join` y Semgrep vuelve de **127 a 124 WARNING**. El texto
  es el mismo byte por byte y el corte no cambia.
- La **población del estudio** —145 pacientes de cirugía cardíaca, 706 valoraciones— sale a su
  propia línea y primera.

**`docs/mapa/aj7-correcciones.md` § 4.**

---

## ⚠️ La tanda A movió textos de esta zona (2026-10-27)

No cambió ningún dato clínico. Movió notas de trabajo al globo ⓘ y a `docs/fuentes/FUENTES.md`,
dejó una sola cita al final de cada bloque, sacó las mayúsculas de en medio y dejó cada contenido
una sola vez por sección. **Lo que esta tanda hizo está en `docs/mapa/a-evidencia-textos.md`**, y
el caso que lo fija es **TC-537** (ficha en `docs/mapa/tests-fichas-537.md`).

---

## ⇢ La tanda C1 (2026-10-28) movió los CUATRO rótulos de VExUS

Los textos de `VEXUS_INTERP` se revisaron contra la **Figura 7 de Rola 2021**, leída en imagen:
el grado 0 dejó de afirmar que la presión venosa central es normal, el grado 1 pasó a «en
riesgo» (el rótulo «At risk» de la figura, que **discrepa** del «hallazgos leves» del texto de
la página 8), el grado 2 perdió la injuria renal aguda y el grado 3 **no se tocó**. Y la
Evidencia dejó de publicar conducta por grado.

**Todo eso vive en `docs/mapa/c1-hemodinamica.md` § 1.** Antes de tocar un rótulo de VExUS,
leerlo: la discrepancia del grado 1 entre el texto y la figura está documentada ahí, y «corregir»
el grado 1 a «leve» sería deshacerla.

---

## ➜ La tanda «C2» (2026-10-28) — los dos textos largos al globo ⓘ

Puntero. El relato vive en **`docs/mapa/c2-pulmon-constriccion-forrester.md`** §3.

Los dos bloques de letra chica de constricción vs restricción —el del cociente hepático, con el
0,78, su sensibilidad, su especificidad, el apartado 11.9.3 y la Figura S1; y el «Criterio de
EcoSmart», con los dos cortes del HFA-PEFF, el folio 3303 y las reglas de conteo sin fuente—
pasaron a las tarjetas **`cvr-coc`** y **`cvr-ecosmart`**, con su contenido íntegro. En pantalla
quedó una línea corta en cada lugar.

**Ningún corte, recuento, veredicto ni lectura cambió**, medido a los dos lados de 0,78.
