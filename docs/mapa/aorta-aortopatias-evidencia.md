# Aorta torácica — las citas por aortopatía, la coartación por gradiente medio y el motor de Evidencia

Mapa del **trabajo «H»** (2026-10-21). Lo que vive acá es la zona de la **aorta torácica y las
aortopatías**: a qué tabla de la ESC 2024 pertenece cada umbral, la coartación, la válvula
bicúspide en Evidencia, el Ehlers-Danlos vascular y el **motor de Evidencia de aorta**, que
arranca en el corte de dilatación de la guía y no en 45 mm.

Lo que NO vive acá: los **cortes descriptivos** de los cinco segmentos (`AO_SEGS`, `AO_REF`,
`aoSegDil`, el «40 mm o más» del seno) → `docs/mapa/corazon-derecho-ase2025.md` y
`docs/mapa/evidencia-derecho-aorta.md`; la **tabla de cirugía aórtica** de la pestaña Referencias
→ `docs/mapa/referencias-subpestanas.md`; el **dibujo y los seis tipos de la VAB** →
`docs/mapa/vab-bicuspide.md`; el **mecanismo del panel** (filas, controles, `_indOrigen`,
`_indClin`, numeración de citas) → `docs/mapa/panel-evidencia.md`.

---

## 1 · La regla de folio, comprobada en ONCE hojas

**ESC 2024 de enfermedad arterial periférica y aórtica** (Mazzolai, edición española de la SEC):
**folio = hoja del PDF − 1**, comprobado en el **encabezado impreso** de las hojas 72, 77, 81,
112, 113, 114, 115, 117, 120, 121 y 122 — no por aritmética.

⚠️ **ESE DOCUMENTO TIENE DOS SERIES DE TABLAS Y SE PISAN EN 1-18.** Las de recomendación se
imprimen **«Recomendaciones - tabla N»** y van de **1 a 70**; las de datos se imprimen
**«Tabla N»** y van de **1 a 18**; y además hay una tercera serie, **«tabla de evidencia N»**, que
la propia guía nombra en sus pies. Medido sobre el PDF completo: el solapamiento entre las dos
primeras es **exactamente 1 a 18**.
**La app las cita en forma CORTA («Tabla 62 · folio 114») y eso es inequívoco para esta zona**,
porque todas las que usa —38, 57, 58, 59, 60, 62, 63, 65, 66, 67, 68, 69— están **por encima de
18**. Quien cite una tabla de 1 a 18 de este documento tiene que decir de qué serie es.

⚠️ **Y ESA FORMA CORTA ES LA QUE USAN LAS CUATRO SUPERFICIES, PORQUE LA LARGA LAS DESINCRONIZABA.**
La primera versión de este trabajo escribió «Recomendaciones-tabla 63» en el panel de Evidencia y
«Tabla 62» en la pantalla, el informe y el manual: dos formas de la misma cita en la misma app.
**Lo cazó TC-512 con cinco condiciones en rojo**, no la lectura. Se unificó a la corta, que es
además la que usa la tabla de cirugía de Referencias —que esta orden no toca— y la que usa el
prompt. La forma impresa queda registrada en `docs/fuentes/FUENTES.md`.

---

## 2 · Las citas por síndrome — `MARFAN_FTE`

`MARFAN_FTE` es el **dueño único** de la tabla que corresponde a cada aortopatía, y existe porque
la app atribuía **TODOS** sus umbrales a «la Tabla 62», que es **sólo del Marfan**:

| clave de `marfan_sindrome` | tabla y folio | dónde se lee |
|---|---|---|
| `marfan` | **Tabla 62 · folio 114** | pantalla, ⓘ, informe, EN SUMA, manual |
| `lds` (Loeys-Dietz) | **Tabla 66 · folio 116** | idem |
| `turner` | **Tabla 58 · folio 111** | idem |
| `ehat` (ACTA2 u otra hereditaria) | **Tabla 38 · folio 80** | idem |
| `eds` (Ehlers-Danlos vascular) | **Tabla 59 y apartado 10.1.2.4 · folio 112** | idem |
| `otro` | **Tabla 38 · folio 80** | idem |

Se declara **al lado del valor** y lo leen `marfanEstado` (el texto del informe), `marfanSync`
(el badge y el «Fundamento» de la pantalla) y el EN SUMA. **Una sola copia**: antes el literal
«(ESC 2024, Clase I desde 50 mm …)» estaba escrito en cada rama, y el EN SUMA decía
**«(ESC 2020)»** — que es la guía de cardiopatías congénitas del adulto, no la de aorta.

⚠️ **`MARFAN_FTE` VA DECLARADA ANTES DE `marfanEstado` Y `marfanSync`.** Es un `const` de módulo:
declarada después, las dos funciones la nombran en su **zona muerta** y el `ReferenceError`
**aborta el `<script>` COMPLETO** — la app con cero pestañas con geometría. Es la trampa que este
repo ya pagó con `AI_AREA_BANDAS` y con `QV_NOTA['esten:pulmonar']`.

### La clase y el nivel van CON la tabla

`UMBRAL` lleva hoy, por síndrome, el umbral de Clase I, el de Clase IIa, **el nivel de cada uno**
y **qué clase corresponde con factores de riesgo**:

| síndrome | Clase I | con factores | nivel |
|---|---|---|---|
| Marfan | **50 mm** (I · B) | **45 mm** → IIa · C | Tabla 62 |
| Loeys-Dietz | — | ver §3 | Tabla 66 |
| ACTA2 / no sindrómica | **55 mm** (I · B) | **50 mm** → **IIb · B** | Tabla 38 |

⚠️ **EL `cx_iib` NO ES NUEVO Y ESO ES LO QUE EVITÓ UNA CONTRADICCIÓN.** La primera versión dejaba
la clave en `cx_iia` y cambiaba sólo el texto: el badge de la pantalla decía «Clase IIa» mientras
el «Fundamento», tres renglones más abajo, decía «Clase IIb» **del mismo paciente**. La clave se
**deriva** de `u.cFr` y reusa la que ya existía.

---

## 3 · Loeys-Dietz — DOS filas, y la de arriba es IIa y no I

**Verificado en la Tabla 66 (folio 116), sus dos filas:**
- **Clase IIa · Nivel C** — reemplazo de la raíz aórtica con el diámetro **por encima de 45 mm**.
- **Clase IIb · Nivel C** — **adaptar el umbral al gen** subyacente teniendo en cuenta las
  características de riesgo alto; con ellas el umbral baja a **40 mm o más**.

O sea que las **dos** lecturas que traía el pedido son ciertas y pertenecen a **filas distintas**.
Lo que la app decía —«Clase I desde 45 mm»— no está en esa tabla.

⚠️ **EL OPERADOR DE LA FILA DE ARRIBA ES ESTRICTO: 45 mm EXACTOS NO LA CRUZAN.** Medido por sus
dos lados (45 → `sin_indicacion` con la banda del gen según factores; 46 → `cx_iia`).
⚠️ **Y LA BANDA DEL GEN ARRANCA EN 40 CON `>=`**: 39 no alcanza ninguna de las dos.

---

## 4 · La coartación — el criterio de sospecha es el gradiente MEDIO

**Figura 44, folio 120**, leída en el original. Su lista de «Sospecha de (re)coartación: cualquiera
de los siguientes» incluye, literal, **«Gradiente medio > 20 mmHg a través de la región de CoA en
la ecografía Doppler»** — **estricto** — junto al gradiente de presión no invasivo brazo-pierna
> 20 mmHg, el estrechamiento > 50 %, el flujo diastólico abdominal anterógrado, el flujo
diastólico retrógrado en la aorta descendente y el flujo colateral > 30 % en RMC.

**La app usaba el gradiente MÁXIMO.** Hoy `coaConclusion` afirma significación por Doppler con
`gm > 20` **o** con la cola diastólica, y el **máximo** ya no afirma por sí solo: con un máximo
alto y **sin** medio registrado, el texto dice que el criterio de la guía es el medio y manda a
medirlo. **El campo del gradiente medio (`coa_gmedio`) YA EXISTÍA**, así que no hizo falta ningún
campo nuevo y el Excel no gana columnas — que era la PARADA que la orden preveía.

⚠️ **LA INDICACIÓN NO SE MOVIÓ Y SIGUE SALIENDO DEL PICO-PICO INVASIVO.** Lo que la Figura 44 pone
antes de la intervención es el cateterismo: el Doppler es **sospecha**. La fila de Clase IIb que
sólo publica la ESC 2020 de congénitas del adulto **conserva esa cita** (folio e42).

**Escenas que cambian de veredicto, medidas:** gradiente medio 21 → significación por Doppler
(antes no); **20,0 exactos y 19 → no** la cruzan; máximo 64 **sin** medio → pasa de «criterios de
significación» a «gradiente límite» con el texto que manda medir el medio; con los dos cargados
**manda el medio**.

### El 50-85 % sale del informe

«La coartación de aorta se asocia a válvula aórtica bicúspide en el **50-85 %** de los casos»
queda **sólo en Evidencia**, en `_indCoAo`. Verificado en el folio 119. El viejo «hasta el 85 %»
estaba **invertido** —era la prevalencia de VAB entre los coartados, no la de coartación entre los
portadores de VAB— y el repo ya lo había retirado en el Y3d10 sin reemplazo.

⚠️ **ESA FRASE ERA LO QUE HACÍA PASAR UNA CONDICIÓN DE TC-GR-14**, que dice medir que el informe
del paciente anterior nombra «la válvula bicúspide»: la nombraba **la oración de la coartación**,
porque esa escena nunca ponía `va_morf` en bicúspide. Medido en los dos árboles; el caso se adaptó
poniendo la morfología, que es lo que esa condición dice medir.

---

## 5 · La válvula bicúspide — lo que sale del informe y lo que entra en Evidencia

**Tabla 68, folio 119.** Lo que se retira de `vabConclusion` —o sea de la pantalla, el informe, el
EN SUMA y el PDF—:

| se retira | motivo |
|---|---|
| «vigilancia estrecha» | **ninguna fuente lo publica** |
| «Heart Team» | idem |
| «reemplazo de la aorta en el mismo acto» | **tiene** fuente y pasa a Evidencia |
| «control anual» como intervalo único | la guía pide imagen **al año** y, si está estable, **cada 2-3 años** |

**Las SEIS claves de `vabConclusion` no se tocaron** —`concomitante_45`, `umbral_sin_riesgo`,
`vigilancia_50`, `vigilancia_45`, `sin_dilatacion`, `no_valorable`—, y eso es lo que protege los
estudios guardados y el Laboratorio, que cuenta por clave (`VAB_CONDUCTAS`).

Las cuatro recomendaciones con su clase, su nivel y su folio entran en `_indVAB.notas`. El «mismo
acto» es **Clase IIa · Nivel C** (Tabla 68, folio 119; la ESC/EACTS 2025 de valvulopatías lo
publica en su folio 4660).

---

## 6 · Ehlers-Danlos vascular — una opción SIN umbral

Entra como novena opción de `marfan_sindrome` (`eds`) con la clave **`sin_umbral`**, que es su
propia rama: la guía (**Tabla 59 y apartado 10.1.2.4, folio 112**) **no publica un diámetro al que
intervenir** en esta enfermedad, y lo que publica es seguimiento vascular regular (I · C),
celiprolol (IIa · B) y que los procedimientos se limiten a las situaciones de riesgo vital.

⚠️ **LA RAMA VA ANTES DE LA GUARDA DE «falta el diámetro»**: si fuera después, el paciente sin
aorta medida caería en «no concluible por falta de diámetro» sobre una enfermedad para la que el
diámetro **no decide nada**.
⚠️ **`sin_umbral` TUVO QUE ENTRAR EN `CX_NOCONCL` DEL LABORATORIO**: `_labDistribDe` descarta en
silencio lo que no esté en el mapa, así que sin esa entrada esos estudios se perdían del
denominador y el porcentaje se repartía entre los otros. Es la lección que `umbral_iia_sin_fr` ya
dejó escrita.
⚠️ **EL EN SUMA NO LA NOMBRA, y está declarado** (`docs/PENDIENTES.md` → H-6): al resumen sólo
suben las tres clases de indicación y los dos estados de «falta un dato», y éste no es ninguno de
los dos. El cuerpo del informe sí la publica con su folio. **No se migra nada**: ningún estudio
guardado puede traer `eds`, porque la opción no existía.

---

## 7 · El motor de Evidencia de aorta — `_indAo`

### Arranca en el corte de DILATACIÓN de la guía, no en 45 mm

`AO_DIL_MM = { M: 40, F: 36 }` · `aoDilCorte(src)` · `aoDilMax()` · `aoDilatada()`.

**El sexo sale de `sexoEfectivo`**, el dueño único, así que sin sexo cargado se aplica el corte
**más alto** (40) y la fila lo **DICE** en vez de callarlo.

⚠️ **EL OPERADOR ES INCLUSIVO Y LA GUÍA SE CONTRADICE CONSIGO MISMA.** El cuerpo del **folio 71**
escribe «> 40 mm en hombres adultos y > 36 mm en mujeres»; la **Figura 24, folio 76**, bracketea su
primera banda como **«40-44 mm»** y su nota `a` dice **«36-44 mm en mujeres»**, o sea los dos
INCLUSIVOS. Se eligió la figura por tres razones medidas: es el algoritmo que esta sección
reproduce; la app ya trata **40,0 mm exactos como dilatado** en su cuadro descriptivo desde el VS5,
así que el operador estricto haría que el panel contradijera a la pantalla en ese valor exacto; y
es el lado que **no deja de avisar**, porque el panel informa y no indica. Los dos textos quedan
escritos al lado de la constante.

⚠️ **`aoDilMax` LEE CUATRO CAMPOS Y NO DOS.** Los dos canónicos (`ao_sin`, `ao_tub`) y los dos del
módulo de aortopatía hereditaria (`marfan_ao_seno`, `marfan_ao_ascendente`), que son una **segunda
copia** de la misma medición —declarada en `PENDIENTES.md` → G1-11—. Con sólo los dos primeros la
sección se quedaba muda **justo en el paciente con aortopatía**, que es el que carga los otros dos.

⚠️ **`_indVAB` COMPARTE EL DUEÑO**: su compuerta pasó de «45 mm en la raíz o en la ascendente» a
`aoDilatada()`, así que las dos secciones de aorta arrancan en el mismo diámetro **por
construcción** y no por dos números que haya que mantener iguales.

### Lee lo que está y PREGUNTA lo que falta

La aortopatía se **deriva** del estudio cuando está —`marfan_sindrome`, o `va_morf` en bicúspide, o
la coartación— y se **pregunta** cuando no, con `_indOrigen`: así el panel no puede publicar una
aortopatía distinta de la que dice la pestaña de congénitas. Las **diez filas**:

1. Diámetro aórtico máximo (raíz o ascendente) · 2. Raíz · 3. Ascendente · 4. **Aortopatía
asociada** (`ao.aortopatia`) · 5. Cirugía valvular aórtica prevista (`ao.cxvalv`) · 6. Otra cirugía
cardíaca (`ao.cxotra`) · 7. Deseo de embarazo (`ao.embarazo`) · 8. Crecimiento de 3 mm o más al año
(`ao.crecimiento`) · 9. Antecedente familiar de disección (`ao.familiar`) · 10. Riesgo quirúrgico
(`ao.riesgo`).

Cuatro de los seis insumos **se leen del módulo de la VAB** cuando están cargados
(`vab_cx_valvular`, `vab_fr_crecimiento`, `vab_fr_familiar`, `vab_riesgo_qx`); dos son preguntas
puras. **Lo que el médico contesta vive en `_indClin` y NO se guarda con el estudio** —`_indClin`
se borra al abrir y al cerrar el panel—, medido por el juego de ids del recolector.

### Las recomendaciones van en un bloque VISIBLE

⚠️ **`notas` SE PINTA DENTRO DEL «Ver detalle», QUE NACE PLEGADO.** La primera versión puso ahí
las recomendaciones y **lo cazó MIRAR la captura, no la medición**: el panel publicaba la sección
con sus diez filas y las recomendaciones escondidas detrás de un plegable. Van en `r.bloques`, que
es **aditivo** y se pinta con `plegado:false`, **cada línea con su `refs`** para que entre en la
numeración por sección. El segundo bloque, «Lo que falta para decidir otras filas», nombra lo que
hay que contestar.

### `AO_EV` — una transcripción por aortopatía, con `cond` y `pide`

`AO_EV_FTE` es el dueño de las citas; `AO_EV` tiene, por aortopatía, las filas con `{t, cl, nv, f,
cond(S), pide(S)}`. **Las recomendaciones por debajo de 45 mm, que el arranque en 45 escondía:**

| aortopatía | fila | clase · nivel | tabla · folio |
|---|---|---|---|
| Marfan | deseo de embarazo con 40 a 45 mm | **IIb · C** | **63** · 114 |
| Marfan | seguimiento por imagen (tres filas) | I · C | **60** · 113 |
| Loeys-Dietz | umbral adaptado al gen desde 40 mm | **IIb · C** | **66** · 116 |
| Loeys-Dietz | seguimiento (dos filas) | I · C | **65** · 116 |
| ACTA2 | diámetro **menor** de 45 con factores | **IIa · C** | **67** · 116 |
| Turner | cirugía por índice (iDA > 23 mm/m², iAA > 23 mm/m, Z > 3,5) | IIa · C | **58** · 111 |
| Turner | medir por índice y no por diámetro absoluto | I · C | **57** · 111 |
| Turner | intervalos por riesgo estimado | I · C | **Figura 40** · 111 |
| Ehlers-Danlos | seguimiento vascular · celiprolol · sin umbral | I · C / IIa · B / — | **59** y 10.1.2.4 · 112 |
| sin aortopatía | 55 mm o más | **I · B** | **38** · 80 |
| sin aortopatía | tubular por encima de 52 con riesgo bajo | IIa · B | **38** · 80 |
| sin aortopatía | 45 mm o más con cirugía valvular aórtica | IIa · B | **38** · 80 |
| sin aortopatía | 50 mm o más con uno de ocho factores | **IIb · B** | **38** · 80 |

⚠️ **LA BICÚSPIDE Y LA COARTACIÓN NO REPITEN SUS FILAS ACÁ**: tienen su propia sección en el mismo
panel, y publicarlas en las dos lo pondría a decir lo mismo con dos voces. Esta sección **nombra
dónde están**.

⚠️ **EL TÍTULO NO PUEDE SER PREFIJO DE OTRO NI TENER OTRO POR PREFIJO.** `IND_SECS` busca la
sección por el prefijo de su título: dos títulos que colisionen dejan una **sin probar**. Es la
lección que «Válvula aórtica bicúspide — conclusión» ya pagó, y TC-512 la fija. `IND_SECS` pasa de
**17 a 18** secciones.

---

## 8 · Cómo medir esta zona

- **Arnés:** `scripts/_probe_haorta.mjs` (Playwright, los **dos** motores, A/B de solo lectura con
  `--file`; grupos `citas`, `informe`, `coa`, `vabtxt`, `evid`, `motor`, `ab`, `maq`, `ctrl`, más
  las capturas por `--dest`).
- **Las cuatro superficies se enumeran UNA POR UNA**: informe narrativo (tres estilos), EN SUMA
  (tres), **PDF generado de verdad en sus SEIS plantillas** y Excel en **440** columnas; el PPT y
  el PDF de auditoría entran como control.
- **Cobertura: TC-512**, **74 condiciones** —contadas instrumentando el propio caso—, con
  denominadores y controles negativos. **Verificado que sabe fallar contra el inicio de la tanda en
  un worktree aparte: 56 de las 74 en rojo, y NINGUNA por excepción.**

### Siete trampas, y cinco daban mediciones falsas

1. ⚠️ **LA MISMA CITA ESCRITA DE DOS FORMAS.** Ver §1: la pantalla decía «Tabla 62» y el panel
   «Recomendaciones-tabla 63». Lo cazó el caso, no la lectura.
2. ⚠️ **UN CASO QUE MUERE POR EXCEPCIÓN NO PRUEBA QUE SABE MEDIR.** TC-512 contra el árbol de
   entrada murió con `ReferenceError: _indAo is not defined` y **cero condiciones en rojo**: toda
   función nueva se lee con `typeof` y toda clave del lector nace con centinela. Es la quinta vez
   que este repo lo paga.
3. ⚠️ **`_indFilaOrigen` TOMA `(lbl, o, ops, pinta)`** y no `(lbl, ops, o, …)`: con el orden
   invertido, **cinco rótulos** se renderizaban como `[object Object]`.
4. ⚠️ **LA ZONA MUERTA DE `const`**: `MARFAN_FTE` declarada después de sus lectoras aborta el
   `<script>` entero, y el síntoma aparece 67.000 líneas más abajo.
5. ⚠️ **UNA RECOMENDACIÓN DENTRO DE `notas` NO SE VE.** Ver §7.
6. ⚠️ **UN A/B CON `0` DIFERENCIAS PUEDE SER UN DENOMINADOR VACÍO.** La escena de la VAB dio cero
   hasta tildar `vab_incluir_chk`; lo que confirma el cero es que el texto de `vabConclusion`
   llega **sólo** a Evidencia desde el Y3f4.
7. ⚠️ **TC-273 Y TC-274 SON INESTABLES POR ORDEN DE CORRIDA EN UNA LISTA DE ZONA**: salen rojos con
   un `--solo` que saltea casos y **verdes corridos solos**, y fallan **idénticamente contra el
   árbol de entrada con la misma lista**. Medir las dos puntas antes de sospechar.

---

## 9 · Ficha de TC-512

**Título:** «Trabajo H: las citas de aorta por síndrome —Tabla 62 sólo Marfan, 58 Turner, 66
Loeys-Dietz y 38 la no sindrómica—, con su clase y su nivel en las cuatro superficies; el
Loeys-Dietz en IIa con MÁS de 45 mm y su banda del gen desde 40; la coartación por gradiente MEDIO
de la Figura 44; la VAB sin «vigilancia estrecha» ni «Heart Team» y con el intervalo y el «mismo
acto» en Evidencia; el Ehlers-Danlos vascular como opción SIN umbral; el motor de aorta arrancando
en 40 mm y en 36 en la mujer con su cuestionario y las recomendaciones por debajo de 45; y el
informe, el EN SUMA, el PDF, el Laboratorio y las 440 columnas del Excel sin moverse fuera de lo
autorizado».

**74 condiciones** en trece grupos. **Está en la ficha y no en `docs/mapa/tests-fichas.md` por
TAMAÑO**: ese archivo estaba en **33,5 KB** medido con `wc -c` ANTES de escribir, y la ficha lo
cruzaba.

| grupo | qué fija |
|---|---|
| **(a)** | cada síndrome cita SU tabla con su folio, su clase y su nivel; la 62 ya no se le atribuye a los otros tres; la pantalla publica la fuente del umbral; el informe y el EN SUMA la llevan; **control**: ninguna aortopatía cita ya la ESC 2020; el manual nombra las cuatro tablas |
| **(b)** | 55 mm sigue siendo I y ahora dice su **nivel B**; 50 con factores pasa de IIa a **IIb · B**; el badge dice lo MISMO que el Fundamento; **dos controles**: el Marfan con factores sigue en IIa · C y los dos cortes de Turner no se movieron |
| **(c)** | 46 mm es IIa · C y **no** Clase I; **45 exactos NO lo cruzan**; 41 con riesgo alto es IIb · C por el umbral del gen; 39 no alcanza ninguna; **control**: ninguna rama publica una Clase I |
| **(d)** | es opción del desplegable; con 46 mm declara que la guía **no publica umbral**, con su folio; **no** cae en ninguna clase quirúrgica; el Excel lo exporta con su etiqueta y el importador lo entiende |
| **(e)** | el hint de factores publica la lista de LA tabla del síndrome y cambia con él; sin síndrome no afirma ninguna lista |
| **coartación** | el medio de 21 da significación con su folio; **20,0 exactos y 19 no**; el máximo de 64 ya no afirma solo; sigue mandando a medir el pico-pico; con los dos manda el medio; **controles**: la indicación sigue saliendo del invasivo y cita la ESC 2024, y la fila que sólo está en la ESC 2020 la sigue citando; el 50-85 % sale del informe y del EN SUMA |
| **VAB** | ninguna rama dice «Heart Team», «vigilancia estrecha», «mismo acto» ni publica un intervalo; **controles**: las seis claves no se movieron y el cribado familiar se conserva; el globo ⓘ ya no nombra al Heart Team |
| **(D1)** | el disparo por los **dos bordes y los dos sexos**: 39 no / 40 y 41 sí; 35 no / 36 y 37 sí; sin sexo manda el corte alto y la fila **lo dice**; con sexo femenino el corte publicado es 36 |
| **(D2)** | la sección de la VAB arranca en el mismo corte y las dos usan el **mismo dueño** |
| **(D3)** | la aortopatía se deriva del síndrome y de la morfología, y se **pregunta** sin ninguno de los dos; el cuestionario trae los seis insumos |
| **(D4)** | las cinco familias de recomendación **por debajo de 45 mm**, con su clase, su nivel y su tabla; **control**: sin deseo de embarazo la fila de la Tabla 63 no se publica |
| **(D5)** | las cuatro filas de la Tabla 38 con su clase y su nivel, incluida la **IIb · B** de los ocho factores |
| **(D6)** | el bloque de recomendaciones **no nace plegado** y cada línea lleva su cita numerada |
| **(D7)** | **denominador**: la sección está registrada en `IND_SECS`, y ningún título es prefijo de otro |
| **(D8)** | las respuestas del panel **no** entran en los campos del estudio |
