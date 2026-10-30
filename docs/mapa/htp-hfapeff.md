# HTP y HF-PEFF — la tanda «E» (2026-10-22)

> ⚠️ **LA EVIDENCIA DEL HFA-PEFF PREGUNTA EL RESULTADO DEL PASO 3 DESDE LA TANDA AJ3
> (23/10/2026): `docs/mapa/aj3-ett-avanzado.md` → «(B) El resultado del paso 3».** La fila
> `hfpeff.p3res` aparece sólo con «Paso 3 = Realizada», su marca nunca es `warn` ni `alarm`
> —si lo fuera, `_indFilaHTML` dejaría de plegar la nota y el ⓘ desaparecería—, y sus dos líneas
> por resultado van dentro de la rama de puntaje intermedio. **No toca el informe, el EN SUMA, el
> puntaje ni la hoja del PDF.** Los folios de Pieske 2019 están en `docs/fuentes/FUENTES.md` →
> «La tanda AJ3».

Mapa de las dos zonas que la tanda E tocó: la **valoración ecocardiográfica de probabilidad de
hipertensión pulmonar** (ESC/ERS 2022) y el **score HFA-PEFF** (Pieske 2019), las dos dentro de
la pestaña de Hemodinámica.

**Ningún corte, operador, fórmula ni regla de conteo cambió.** Lo que cambió es cómo se muestran
los signos, qué sale al papel, cuándo el informe habla, y dónde viven las recomendaciones.

---

## 1 · Las piezas, por nombre

| Pieza | Qué es | Dónde |
|---|---|---|
| `HTP_SIGNOS` | los **once signos** de la Tabla 10, uno por entrada: clave, categoría, rótulo, corte y la casilla que lo marca (o `null`) | antes de `_htp2022Core` |
| `HTP_EST_TXT` | los tres estados: `auto`, `manual`, `sinDatos` | ídem |
| `HTP_CAT_TXT` | los rótulos de A, B y C | ídem |
| `_htp2022Signos(S)` | **PURA**: devuelve una entrada por signo con `presente` y `estado` | ídem |
| `_htp2022Core(S)` | el veredicto. Desde el E1 **deriva** `catA/catB/catC` del OR de los signos de cada categoría | ídem |
| `htpTablaPintar()` | escribe **sólo** `textContent`, el `data-htp-estado` y el `checked` de las cinco automáticas | tras `calcHTP2022` |
| `htpApSync()` | el dueño ÚNICO de las dos casillas de la AP (R2-E3). **No se tocó.** | ídem |
| `amiloTextoHTP()` | la hoja del PDF: sólo los signos **presentes** | zona de `amiloTexto*` |
| `_indHTP()` | la sección de Evidencia de HTP | tras `_indTEP` |
| `hfapeffScore(soloEco, src)` | el puntaje. Desde el E3 cada criterio lleva un campo `val` **aditivo** | zona HFA-PEFF |
| `hfapeffConclusion(r)` | la conclusión, **descriptiva**, con «provisoria» calculada | ídem |
| `amiloTextoHFAPEFF()` | la hoja del PDF: **una sola tabla** agrupada por dominio | ídem |
| `_indHFPEFF()` | la sección de Evidencia de HF-PEFF | tras `_indHTP` |
| `escErs2022`, `hfaPeff2019` | las dos entradas bibliográficas nuevas del panel | `IND_REFS` |

---

## 2 · La tabla de signos de HTP

Once filas agrupadas en A, B y C, con **tres columnas**: el signo, el corte tal como figura en la
Tabla 10, y el ESTADO del mecanismo.

| clave | cat | signo | corte | de dónde sale |
|---|---|---|---|---|
| `a1` | A | Cociente VD/VI — diámetro basal o área | > 1,0 | `vdViEstado(S)` |
| `a2` | A | Aplanamiento del septo interventricular | IEVI > 1,1 en sístole y/o diástole | casilla `htp2022_a3` |
| `a3` | A | Cociente TAPSE/PAPs | < 0,55 mm/mmHg | `tapse` / `psap_calc` |
| `b1` | B | Tiempo de aceleración del TSVD | < 105 ms | `tvia` |
| `b2` | B | Muesca mesosistólica del flujo pulmonar | presente | casilla `htp2022_b1muesca` |
| `b3` | B | Velocidad de regurgitación pulmonar diastólica temprana | > 2,2 m/s | casilla `htp2022_b2` |
| `b4` | B | Diámetro de la arteria pulmonar | > 25 mm | casilla `htp2022_b3`, auto con `ip_ap_diam` |
| `b5` | B | Diámetro de la AP frente a la raíz aórtica | AP > raíz aórtica | casilla `htp2022_b3ao`, auto con `ip_ap_diam` y `ao_sin` |
| `c1` | C | Diámetro de la VCI con colapso inspiratorio disminuido | > 21 mm con colapso < 50 % en inspiración profunda | `vci_diam` + `vci_col` |
| `c2` | C | Colapso de la VCI con inspiración superficial | < 20 %, con VCI > 21 mm | casilla `htp2022_c_col20` |
| `c3` | C | Área de la AD, telesistólica | > 18 cm² | `ad_area` |

**Los tres estados.** `auto` = lo decide un cálculo sobre campos cargados · `manual` = la casilla
la marca el médico · `sinDatos` = es automático y sus insumos no están.

### Cinco cosas que no son obvias

- ⚠️ **`presente` sale de donde salía y el `estado` es lo único nuevo.** Las dos casillas de la AP
  son automáticas en la PANTALLA —`htpApSync` las escribe y las bloquea— pero su `presente` sigue
  leyéndose de la CASILLA y no del cálculo: un estudio **archivado** no pasó por `htpApSync`, así
  que recalcularlas le cambiaría el resultado a lo que ya está en disco.
- ⚠️ **El OR es término por término el de HEAD.** `catC` conserva la condición compartida
  `vciD > 21` de las dos formas del colapso, que es como la Tabla 10 escribe esa celda. A/B contra
  HEAD: cero diferencias en los cuatro badges y en la probabilidad.
- ⚠️ **Las cinco casillas automáticas van SIN `id`.** El recolector del estudio barre `input[id]`,
  así que una casilla sin id no viaja con el estudio y no puede agregar una clave ni una columna
  de Excel. Van `disabled` y las escribe el cálculo: eso es lo que «se ve bloqueado» quiere decir.
- ⚠️ **El marcado es ESTÁTICO y el pintor sólo escribe `textContent`.** Armarla por `innerHTML`
  destruiría las seis casillas con id en cada repintado y haría saltar el ruleset local por
  concatenar datos en un sink.
- ⚠️ **`htpTablaPintar` va en las TRES columnas**: la cola de `calcHTP2022`, `RECALC_MODULOS` y el
  final de `limpiarCampos` —su barrido genérico no alcanza a un `<td>` ni saca un `disabled`—.

### Una trampa que cazó la medición y no la lectura

El `white-space:nowrap` de la columna del criterio dejaba la tabla en **487 px con x=31 a 360 px
de viewport** mientras `scrollWidth` del documento seguía en 360: la página **no desbordaba**
porque un ancestro la recortaba, o sea que el médico no veía las columnas de la derecha **y no
podía desplazarse**. Sin él mide **298 px a 360 y 328 a 390**. El envoltorio con `overflow-x:auto`
queda como red.

---

## 3 · El informe de HTP con la VRT «no medible»

La Figura 5 (folio 28) pone «O no se puede medir» en la MISMA fila que el ≤ 2,8 —es su nota ᵃ—
así que sin signos de otras categorías la guía da probabilidad **BAJA**. Hasta el E2 el informe
firmado se quedaba **mudo** en ese caso (la compuerta preexistente, fila 99 de la Lista).

⚠️ **Lo que distingue los dos caminos es `vrtSel`, no `vrtCat`**: «no medible» elegida en el
desplegable y «automático» sin IT cargada dan el mismo `vrtCat` y son cosas distintas.

| escena | antes | ahora |
|---|---|---|
| «no medible» **ELEGIDA**, 0 signos | 0 líneas | **1 línea**: «…probabilidad baja (VRT no medible; sin signos adicionales).» |
| automático **sin IT** | 0 | 0 — no se afirma sobre un estudio sin datos |
| formulario vacío | 0 | 0 |
| «no medible» con 2 signos | 2 | 2 — IDÉNTICA |
| VRT baja / VRT alta | 1 | 1 — IDÉNTICAS |
| discrepancia de VRT | 1 | 1 — IDÉNTICA, con su salvedad |

⚠️ **No se escribió ninguna frase nueva**: la línea que ya existía produce ese texto con esos
datos. El literal del pedido —«Probabilidad baja de HTP (VRT no medible, sin signos
ecocardiográficos adicionales)»— dice lo mismo con otro envoltorio, y redactarlo aparte habría
dejado DOS formatos para la misma afirmación en el mismo informe. **Declarado.**

---

## 4 · La hoja del PDF de HTP

Sólo los signos **presentes**, agrupados por categoría, con su corte al lado. Sin signos, la
redacción que la app ya tenía: «Sin signos adicionales.» — la misma que el informe narrativo
publica, así que el papel y el informe no pueden decirlo de dos maneras.

Hasta el E2 imprimía las tres categorías siempre («A · Ventrículos: sin datos») y de los signos
listaba **sólo los seis manuales marcados**: los cinco automáticos no salían por ningún camino,
así que un paciente cuya probabilidad INTERMEDIA la sostenían dos signos calculados publicaba en
el papel firmado «A: sin datos · B: signo presente · C: sin datos» **sin decir cuál**.

---

## 5 · La conclusión de HF-PEFF

**Descriptiva.** Salieron las dos recomendaciones —«Se recomienda completar el score y, según
resultado, ecocardiografía de esfuerzo y/o cateterismo cardíaco derecho» y «Se recomienda
ecocardiografía de esfuerzo y/o cateterismo cardíaco derecho para confirmación diagnóstica», que
son la MISMA con dos redacciones— y también «Investigar causas alternativas de disnea», por el
mismo criterio. Las tres ideas pasaron a la Evidencia.

**«Provisoria» se calcula con los máximos posibles, no con una tabla fija**: cada dominio sin
datos puede aportar hasta 2 puntos, así que se pregunta si la CATEGORÍA del puntaje actual y la de
`total + techo` son la misma. Con una tabla escrita a mano habría que mantenerla sincronizada con
los cortes de `hfapeffInterp`.

| dominios faltantes | parcial | conclusión |
|---|---|---|
| 1 | 0 | provisoria |
| 1 | 1 | provisoria |
| 1 | **2** | **DEFINITIVA** (intermedia) — 2, 3 y 4 caen todos en la zona intermedia |
| 1 | 3 | provisoria |
| 1 | 4 | provisoria |
| 2 | 0 · 1 · 2 | provisoria |

⚠️ **La protección de la rama ≤1 no se pierde**, y es lo que hace seguro el formato nuevo: un
parcial de 0 o 1 con un dominio faltante SIEMPRE sale «provisoria» —puede llegar a 2 o 3—, así que
la frase nunca afirma un descarte sobre datos que no están.

---

## 6 · La hoja del PDF de HF-PEFF

**Una sola tabla**, con el puntaje ARRIBA y debajo un bloque por dominio con una fila por
parámetro: criterio con su corte · valor del paciente · peso · la marca `CUMPLE`.

Hasta el E3 eran TRES bloques con los mismos datos —«Puntaje por dominio», «Valores del paciente»
y «Criterios cumplidos»—: el valor de cada parámetro salía en el segundo y su criterio en el
tercero, así que auditar un punto obligaba a cruzar dos listas de la misma hoja, y los criterios
que NO se cumplen no aparecían en ninguna.

- ⚠️ **Los cortes no se reescriben de este lado**: la etiqueta de cada fila es el `txt` que
  `hfapeffScore` ya arma, que es el mismo que puntúa y el que publica la pantalla —y los de e′ y
  LAVI dependen de la edad y del ritmo—.
- ⚠️ **La marca es la palabra `CUMPLE` y no un símbolo**: `amiloSanPDF` borra lo que cae fuera de
  WinAnsi **sin aviso**, que es la trampa que el símbolo del sexo del trabajo H ya pagó.
- ⚠️ **«Puntaje parcial: falta completar algún dominio.» salió de la hoja**: la conclusión ya dice
  «(puntaje parcial: falta el dominio X)» y NOMBRA cuál, así que las dos juntas lo decían dos veces.

**La PANTALLA no cambia**, medido: cuatro columnas y el mismo número de criterios y de medidas en
las cuatro escenas; lo único que se mueve es el texto del pie, que ES la conclusión. Con FEVI
reducida el hash del HTML es idéntico.

---

## 7 · Las dos secciones de Evidencia

Las dos son **cuestionarios**: LEEN del mismo dueño que firma el papel y PREGUNTAN lo que el
algoritmo necesita y el eco no da. Las recomendaciones van en `r.bloques`, que el marco pinta
**VISIBLE** —`notas` se dibuja dentro del «Ver detalle», que nace plegado: la lección que el
trabajo H pagó mirando la captura—.

### HTP — `_indHTP`

Compuerta: VRT medible **o** algún signo presente (la misma que `_indCIA` ya aplica).
Preguntas: `htp.riesgo` (factores de riesgo o entidades asociadas a HAP o HPTEC) y
`htp.sintomas`. **Las dos salen del algoritmo y no se agrega ninguna.**

| probabilidad | factores | paso que publica |
|---|---|---|
| ALTA | con o sin | **Clase I** — estudio posterior y cateterismo derecho si está indicado |
| INTERMEDIA | sí | **Clase I** — cateterismo derecho |
| INTERMEDIA | no | **Clase IIa** — seguimiento ecocardiográfico |
| INTERMEDIA | — | «Lo que falta contestar» |
| BAJA | sí | **Clase IIa** — seguimiento ecocardiográfico |
| BAJA | no | **Clase IIa** — buscar un diagnóstico alternativo |
| cualquiera | — | **Clase IIa · Nivel B** — considerar otras pruebas según el cuadro clínico |
| INTERMEDIA + síntomas | — | **Clase IIb · Nivel C** — prueba de esfuerzo cardiopulmonar |

⚠️ **Con probabilidad ALTA no se pregunta nada para el paso principal**, y es de la fuente: la
columna derecha de la Figura 5 lleva «Sí/No» en las dos cajas.
⚠️ **La Figura 5 publica CLASE pero no NIVEL**, así que sus líneas no llevan ninguno. Las que sí
lo llevan salen de la «Recomendaciones - tabla 2» del folio 36.
⚠️ **La cita va con el título impreso completo, «Recomendaciones - tabla 2»**, y no con la forma
corta que el resto de la app usa: ese documento numera APARTE sus «Tabla» y sus «Recomendaciones -
tabla», y las dos series se pisan en los números bajos. Es la regla que el trabajo H dejó escrita.

### HF-PEFF — `_indHFPEFF`

Compuerta: algún dominio con datos **y** la FEVI no reducida (el mismo `gate` que retira la hoja
del PDF). Preguntas: `hfpeff.paso3` y `hfpeff.pll`.

| puntaje | paso que publica |
|---|---|
| ≥ 5 | diagnóstico establecido (folio 3304 y Figura 3, folio 3305) |
| 2 – 4 | paso 3: prueba de esfuerzo diastólica o medición hemodinámica invasiva |
| 2 – 4 + paso 3 hecho + presión elevada | el diagnóstico se puede confirmar (folio 3305) |
| 2 – 4 + paso 3 hecho + presión normal | seguir la evaluación durante el ejercicio (folio 3305) |
| ≤ 1 | muy improbable; investigar causas alternativas (folio 3304) |
| incompleto | la guía admite calcularlo igual, y sugiere resonancia si el volumen auricular, el índice de masa o el espesor no se pueden medir por eco |

⚠️ **Ninguna línea lleva clase ni nivel, y es de la fuente**: Pieske 2019 es un consenso y no
publica ninguno. La guía ESC 2021 de insuficiencia cardíaca lo nombra y repite en prosa los mismos
pasos, también sin clase ni nivel propios —censada—, y además declara que el rendimiento
diagnóstico de los scores ha variado entre cohortes. **Declarado.**

---

## 8 · Las fichas de Referencias

- **`ref-htp`** gana una tabla de catorce filas —las tres bandas de VRT y los once signos— con su
  corte y su folio, más la regla de conteo por categoría.
- **`ref-hfapeff`** es NUEVA: hasta el E4 el HFA-PEFF **no tenía entrada** en Referencias, así que
  los veinte cortes que la app aplica no estaban publicados en ninguna parte consultable. Lleva
  las tres bandas, la regla de suma, los veinte criterios con su peso y su folio, el chip
  **CRITERIO DE ECOSMART** sobre el puntaje provisorio, y las dos salvedades del original.
- Entró en `REF_SUBTAB.fun`, que pasa de 2 a 3 entradas. El censo de la pestaña pasa de 31 a 32.

---

## 9 · Las trampas de esta tanda

1. **`IND_SECS` es un `const` de módulo y NO una propiedad de `window`.** Leerlo por `window` deja
   las siete condiciones de Evidencia en rojo sobre un árbol perfecto. Es la trampa de `ECO_AYUDA`,
   pagada otra vez. El identificador **pelado** sí se ve.
2. **La sección de HTP nace CERRADA y vive en la pestaña Hemodinámica**: sin abrirla la tabla mide
   0×0 y «cero scroll horizontal» sale sobre una pantalla que no está dibujada. La sonda la abre
   por el gesto y **aborta** si no hay geometría.
3. **El `white-space:nowrap` que recortaba la tabla en silencio** (§2).
4. **Un `assert` que falla en un script de edición no aplica NADA**, porque la escritura va al
   final: una tanda de reemplazos quedó sin aplicar y la medición siguiente lo delató. **Verificar
   con `grep` o remidiendo que la edición quedó.**
5. **El prefijo del SEED de TC-322 va SIN tilde**: ese caso normaliza los acentos antes de buscar
   la sección, así que «Hipertensión pulmonar» con tilde no matchea.
6. **El acento grave dentro del cuerpo de un caso**, seis veces en TC-517, con el archivo que
   documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea exacta mientras
   `node --check` apuntaba a la apertura del template, 90 líneas antes. **Correr los dos.**
7. **El `\s` se cocina dentro del cuerpo de un caso**: llega al motor como la letra `s` y borra
   todas las eses del texto. Se normaliza con `split`.
8. ⚠️ **LA CELDA DEL VALOR DEL PANEL DE EVIDENCIA LLEVA `white-space: nowrap`.** El marco espera
   ahí una CIFRA —«> 3,4 m/s», «2 de 3», «ninguno»—, así que un valor largo **no envuelve**:
   ensancha la TABLA de la sección y con ella **todas** sus filas quedan cortadas por la derecha.
   Pasó con la lista de nombres de los signos: **928 px contra los 788 de su caja, la ÚNICA de las
   cincuenta secciones del panel que recortaba**. El nombre va en la NOTA, que es la tercera celda
   y sí envuelve.
   ⚠️ **NINGUNA MEDICIÓN NUMÉRICA LO VEÍA**: el cuerpo del panel no desbordaba (818 = 818) y la
   página tampoco, porque el recorte lo hacía el `overflow:hidden` del propio `<details>`. **Lo
   destapó MIRAR la captura**, que es para lo que están.

---

## 10 · TC-517 — la ficha

**54 condiciones** en once grupos (a a k), con seis denominadores y ocho controles negativos.
**Verificado que sabe fallar contra el inicio de la tanda en un worktree aparte: 37 de las 54 en
rojo, y NINGUNA por excepción** — las 17 que pasan son los controles y lo que esta tanda no mueve.

| grupo | qué fija |
|---|---|
| a | la tabla de signos: once filas, tres columnas, A/B/C, el reparto 3-5-3, los estados, los cortes, el vaivén de la AP en los dos sentidos, «Nuevo estudio» sin casillas bloqueadas, y el conteo por categoría |
| b | el PDF de HTP con sólo los presentes, y el control sin signos |
| c | el informe con la VRT «no medible» elegida, la automática sin IT y el formulario vacío |
| d | la pantalla de HF-PEFF, sin moverse |
| e | el PDF de HF-PEFF: una tabla, el puntaje arriba, el valor y el peso, la marca `CUMPLE`, sin la frase repetida |
| f | la conclusión: completo, parcial definitivo, parcial provisorio con uno y con dos dominios, la rama ≤1, y «se recomienda» fuera de las tres superficies **y del EN SUMA** |
| g | las dos fichas de Referencias con su folio y el chip |
| h | las dos secciones de Evidencia, sus preguntas, el bloque visible, la ausencia de clase/nivel en HF-PEFF y los dos controles negativos |
| i | «Nuevo estudio» y las cinco casillas sin `id` |
| j | la regla de maqueta (el cuerpo de un caso no puede cambiar el ancho de la ventana: la sonda mide lo renderizado) |
| k | los controles: Excel en 440, el informe ajeno, el TEP, el VD, la aorta, el FOP, la hemodinámica y las claves del veredicto |

**Arnés: `scripts/_probe_e.mjs`** (A/B de solo lectura con `--file`), once grupos: `htpinv`,
`htptab`, `htpinf`, `htppdf`, `hfconcl`, `hfpdf`, `refs`, `evid`, `maq`, `captura`, `ctrl`.

---

## Puntero — la tanda «AJ2» (2026-10-23)

Lo que esa tanda movió de esta zona está en **`docs/mapa/aj2-correcciones.md`**, con los doce
commits, sus dependencias y las doce trampas. En una línea, lo que toca acá:

- **HTP**: `htpVrtSinDatos` es el dueño del estado «sin datos», que NO es «no medible»; la hoja del
  PDF y la pantalla son un solo dueño por construcción (`amiloTextoHTP` lee el mismo nodo).
- **TEP**: `tepVeredicto` + `TEP_VD_SIGNIF_MIN` gobiernan las tres superficies; el cuadro pasa a
  tres grupos y el TAPSE/PSAP sale una sola vez; el rótulo del score en `/6`.
- **Otros / orejuela / ateroma**: la orejuela publica la medición y no la juzga; el ateroma no
  afirma un riesgo embólico que su escala no publica, su grosor completa el grado, y los dos
  aportan su línea al EN SUMA.
- **Referencias**: los dos buscadores tratan guión = espacio = nada (`_buscaCompacta`), con el
  punto decimal intacto.
- **Aorta**: `aoSegGrado` devuelve un solo grado, `'dilatada'`, **y el corte no se movió**.
- **Diastólica**: la frase de «no clasificable» describe en vez de pedir un campo.

---

## ⇢ La tanda C1 (2026-10-28): una casilla sin marcar dice «sin evaluar»

La celda de estado de la tabla de signos decía «marcado a mano — ausente» sobre una casilla que
**nadie marcó**. Hoy los tres estados de `_htp2022Signos` se leen distinto, y el cambio alcanza
también a la fila de categoría de la Evidencia.

⚠️ **Ningún conteo se movió**: `catA`, `catB`, `catC`, `nCat` y `prob` salen de `_htp2022Core`,
que esa tanda no toca.

**Los tres estados y quién publica cada sufijo: `docs/mapa/c1-hemodinamica.md` § 2.**

---

## → La TANDA CORRECCIONES (2026-10-30) — puntero

Vive en **`docs/mapa/cor-correcciones.md`**, en archivo propio. Lo que esta zona perdió o ganó:

- **§ 1** · el informe de la orejuela publica las medidas con mayúscula y **sin veredicto de
  aptitud**; «no apto para cierre percutáneo (trombo presente)» se fue y el hecho pasó a la
  Evidencia con Meier 2014, folio 1401. Incluye el **barrido 1c** de veredictos del papel
  firmado, con su denominador.
- **§ 2** · **un solo corte de 75 ms** para el TRIV: `DT_TRIV_HTP_PANEL` se retiró. Y las tres
  formas de la frase de elementos a favor de hipertensión pulmonar, con `vdDisfPresente()` como
  dueño único de «VD disfuncionante».
- **§ 3** · la grilla de VD/AD en **tres columnas de seis**, sin la fila 7, con el VD/VI y su
  selector en una fila.
- **§ 4** · la raíz de AI/VI **leída** en la pantalla de Marfan sin escribirse, y el mensaje del
  índice de Turner nombrando lo que falta.
- **§ 5** · «Incluir en el PDF» **independiente de Config** y con el estudio sin guardar, como
  interruptor. El inventario 5a está medido generando el PDF de verdad.
- **§ 6** · el dibujo de la orejuela **portado de la demo**: aurícula izquierda, VPSI, sin el
  triángulo del VI, trombo adentro, dos capas de silueta y «Manga de viento».

---

## → La TANDA AJUSTES-1 (2026-10-30) — puntero

Vive en **`docs/mapa/aj1-orejuela-pdf-ensuma.md`**, en archivo propio. Lo que esta zona
perdió o ganó:

- **la frase del gradiente AD-VD subestimado deja de ser «sin fuente verificada»**: el rótulo
  pasa a «CRITERIO DE ECOSMART, respaldado en parte por la ASE 2025», con los folios 164 y 165
  leídos en imagen y las TRES salvedades escritas al lado —la fuente habla de falla
  **significativa**, el folio 164 nombra el gradiente ventrículo derecho-arteria pulmonar y no el
  de aurícula derecha a ventrículo derecho, y el «probablemente» es del médico—.
- **la frase del papel no cambia**, y el otro criterio de esa zona —el corte de 75 ms del TRIV—
  sigue sin fuente verificada.

