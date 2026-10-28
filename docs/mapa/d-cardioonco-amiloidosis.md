<!-- Mapa de la tanda D. Se abre a demanda; no se carga solo. -->

# Mapa — la tanda «D»: la calculadora de riesgo CV y el score de amiloidosis

Qué contestar con este archivo, sin abrir `index.html`:

- dónde vive cada regla de la clasificación de riesgo cardio-oncológico y de dónde sale;
- por qué la misma casilla vale distinto según el fármaco;
- qué casilla del score de amiloidosis se marca sola, cuál no, y por qué;
- qué viaja del módulo de amiloidosis al estudio y qué no, y qué pasa cuando no coinciden.

---

## 1 · La calculadora de riesgo CV — el camino de la Tabla 4

### La matriz, y por qué no es un puntaje

`coT4Pesos()` es la transcripción de la **Tabla 4** de la guía ESC 2022 de cardio-oncología
(Lyon AR y cols., Eur Heart J 2022;43:4229-4361), folios **4246 y 4247** —dos hojas, no ocho—,
leída en imagen celda por celda. La tabla es una **matriz factor × clase de fármaco**: la misma
casilla vale distinto en cada columna, y hay celdas que no valen nada.

| Casilla de la app | Antraciclinas | Anti-HER2 | Fila de la Tabla 4 |
|---|---|---|---|
| `hfaicos_hta` | M1 | M1 | Hypertension |
| `hfaicos_dm` | M1 | M1 | DM |
| `hfaicos_obesidad` | M1 | M1 | Obesity (BMI >30) |
| `hfaicos_tabaco` | M1 | M1 | Current smoker / smoking history |
| `hfaicos_cv_ic` | **VH** | **VH** | HF / cardiomyopathy / CTRCD |
| `hfaicos_cv_coron` | **H** | **H** | MI o PCI o CABG · stable angina · severe VHD |
| `hfaicos_cv_arrit` | **–** | **M2** | Arrhythmia (nota a) |
| `hfaicos_fevi_lim` | M2 | M2 | LVEF 50-54 % |
| `hfaicos_fevi_red` | **H** | **H** | LVEF <50 % |
| `hfaicos_troponina` | M1 | **M2** | Elevated baseline cTn (nota b) |
| `hfaicos_bnp` | M1 | **M2** | Elevated baseline NP (nota b) |
| `hfaicos_edad` | H si ≥80, M2 si 65-79 | igual | las DOS filas de edad, por `co_edad` |
| `hfaicos_sexo_fem` | — | — | **no tiene fila en la Tabla 4** |
| `hfaicos_gls_alt` | — | — | **no tiene fila en la Tabla 4** |
| `hfaicos_cv_previa` | — | — | la casilla de legado: no puntúa en ningún camino |

⚠️ **LA ASIMETRÍA DE LA ARRITMIA ES EL EJEMPLO QUE EXPLICA LA TABLA ENTERA.** La misma FA previa
no suma nada con antraciclinas y son dos puntos con un anti-HER2. Ningún puntaje único puede
representar eso, y por eso la calculadora vieja —que sumaba puntos fijos— daba «muy alto» en los
dos casos.

### La regla de combinación

Al pie de la tabla, literal y **leída a siete aumentos**:

> «Low risk = no risk factors OR one moderate1 risk factor; moderate risk (M) = moderate risk
> factors with a total of 2–4 points (Moderate 1 [M1] = 1 point; Moderate [M2] = 2 points);
> high risk (H) = moderate risk factors with a total of ≥5 points OR any high-risk factor;
> very-high risk (VH) = any very-high risk factor.»

Traducido al orden en que `hfaicosEstado()` lo evalúa: **cualquier VH manda** → muy alto; si no,
**cualquier H o cinco puntos moderados** → alto; **2 a 4 puntos** → moderado; **0 o 1** → bajo.
El guión «–» no suma.

### El único piso, y lo que la app no puede distinguir

El piso es la **nota al pie g**: «High risk if anthracycline chemotherapy and trastuzumab
delivered concurrently». Se aplica con el anti-HER2 elegido y una dosis de antraciclinas cargada.

⚠️ **LA TABLA TIENE DOS COSAS DISTINTAS Y LA APP SÓLO VE UNA.** La fila «Includes anthracycline
**before** HER2-targeted therapy» vale M1; la nota g exige que sean **concurrentes** y entonces es
alto. Ningún campo de esta aplicación dice si la antraciclina fue antes o es concurrente, así que
se toma el lado seguro. Declarado en `docs/PENDIENTES.md` → **D-a**.

### Los fármacos sin columna aplicada

`coT4Columna()` sólo devuelve columna para `antracicline` y `trastuzumab`. Todo lo demás pasa por
el **puntaje propio**, que es exactamente el que la calculadora tenía antes de esta tanda
—0 bajo, 1 medio, ≤3 alto, >3 muy alto—, **menos el piso por fármaco**, que desapareció con el
selector que lo llevaba. Y se rotula como propio en la línea de alcance, con **dos textos
distintos** porque las dos situaciones lo son:

- `inmunoterapia` y `radioterapia`: la Tabla 4 **no tiene columna** para ellas.
- `vegf`, `bcr_abl` y las demás: la tabla **sí** la tiene y esta versión no la aplica.
  → `docs/PENDIENTES.md` **D-b**.

### La derivación, por categoría

`_hfaicosDerivacion()` sale de **Recomendaciones-tabla 1, folio 4249, hoja 21**. Las clases y los
niveles viven en el globo ⓘ `co-riesgo-basal` y **no** en la línea visible, que es la regla R2 de
esta tanda.

| Categoría | Qué publica |
|---|---|
| alto y muy alto | derivación antes del tratamiento, salvo urgencia oncológica |
| moderado | se puede considerar derivar, sin demorar el tratamiento |
| bajo | **nada**: la tabla recomienda empezar sin demora |

Y la **última fila** de esa tabla vale en cualquier categoría: con enfermedad cardiovascular
previa o hallazgos anormales en la evaluación basal, se deriva. `_hfaicosHallazgos()` enumera lo
que la calculadora **sí** ve —antecedente, biomarcadores, FEVI ≤50 %, strain— y, cuando no
encuentra ninguno, publica una **línea informativa** y no una conclusión: no ve el ECG basal ni
una valvulopatía, miocardiopatía o enfermedad pericárdica no conocida.

### El calendario es del FÁRMACO, no de la banda

`_hfaicosSeguimiento(col, clave)`. Antes salía de la banda, así que un anti-HER2 de riesgo muy
alto recibía el calendario de las antraciclinas.

| Fármaco | Qué publica | Fuente |
|---|---|---|
| antraciclinas, alto y muy alto | basal, **cada dos ciclos**, a los 3 meses y a los 12 | Rec.-tabla 7, folio 4259 |
| antraciclinas, moderado | basal, a los 12 meses, y uno más al superar 250 mg/m² | ídem |
| antraciclinas, bajo | igual, con el adicional como «puede considerarse» | ídem |
| anti-HER2 | basal, **cada 3 meses** y dentro de los 12 meses | Rec.-tabla 8, folio 4261 |
| los demás | **nada** | la app no muestra un calendario que no es suyo |

⚠️ **«CADA CICLO» NO ERA DE LA GUÍA PARA NINGUNO DE LOS DOS.** Es lo que la guía pide para los
**biomarcadores**; el eco en antraciclinas de riesgo alto y muy alto va cada **dos** ciclos.

### El selector único, y el reflejo

`hfaicos_farmaco` —el de bandas— **se retiró**. El que queda es `co_farmaco`, que es el que viaja
con el estudio, va al Excel y lo lee el Laboratorio, y se **mudó** a la columna «Fármaco» de la
calculadora porque desde esta tanda elige la columna de la Tabla 4, o sea que decide la
clasificación entera. En «Datos basales» quedó `co_farmaco_eco`, un `<div>` de sólo lectura que
mantiene `_hfaicosPintarPuntos` — **no es un control**, y por eso no entra al censo.

### La columna de puntos de la pantalla sigue al fármaco

`_hfaicosPintarPuntos(col)` reescribe los `data-hfa-pts-de` de cada fila. Eran literales del HTML
(`1 pt`, `2 pts`) y con la Tabla 4 dejaron de ser ciertos. También esconde la fila de la casilla
de legado salvo cuando está tildada.

### El defecto de limpieza (1f), con su denominador

`calcHFAICOS` salía con `return` cuando no había datos **antes** de llamar a
`hfaicosPublicarBasal()`. Medido en HEAD con el gesto real —destildar la última casilla, sin
llamar a ningún recálculo—: la cápsula decía «Ingresar factores o fármaco» y `co-riesgo-resultado`
—el contenedor que leen la hoja del PDF, el PPT y el texto del módulo integrado— conservaba
«Riesgo MEDIO (1/13 pts)» del paciente anterior.

⚠️ **LA PRIMERA MEDICIÓN DE ESTE DEFECTO DIO «NO PASA», Y ERA LA SONDA.** `window.__Y.poner`
llamaba a `calcCardioOnco()` al final, que es justo el disparador que la app no tiene. Con esa
llamada, el defecto no aparece. Es el error de TC-519 otra vez.

---

## 2 · El score de amiloidosis

### Qué se marca solo y qué no

`amiloScoreSync()` entra en `ESPEJOS_VIVOS()` —el barrido de la tanda B, el **mismo** debounce de
220 ms, sin temporizador nuevo— y hace dos cosas en este orden: `amiloEspejoDesdeApp()` trae los
insumos, y `amiloAutoMarcarTodos()` deja que decidan `_AM_CALC[k].ok` y `amAplicarCalc`. **Ningún
corte se tocó ni se inventó.**

| Criterio | Fuente en la app | ¿Se marca solo? |
|---|---|---|
| espesor relativo | `siv`, `ppvi`, `ddfvi` | sí |
| E/e′ | `onda_e` y el e′ promedio de la función diastólica | sí |
| TAPSE | `tapse` | sí |
| strain longitudinal | `sgl` | sí |
| **cociente ápex/base** | **ninguna** | **no, y lo dice en pantalla** |

El strain por segmentos de esta aplicación no publica el cociente ápex-base. Se declara en
`ett-auto-nota` en vez de deducirlo de otra medición.

### Los tres estados del origen

Había dos —`'manual'` y sin marca— y con el marcado automático en vivo eso no alcanza: destildar
borraba el origen y el barrido volvía a marcar 220 ms después. Hoy son **tres**:

- `'auto'` — lo marcó el cálculo;
- `'manual'` — lo marcó una persona;
- `'nomanual'` — **una persona lo SACÓ**, y `amAplicarCalc` lo respeta igual.

Viaja en el mismo hidden `ett-<k>-orig` que ya se persistía, y `amETTSyncDesdeHidden` lo conserva
al reabrir un estudio guardado. Sin ese tercer estado, «el médico puede desmarcarla y esa decisión
se respeta» no se puede cumplir.

### Los dos sentidos, y los tres que van en uno solo

`amiloEspejos()` es el registro único que leen las dos direcciones.

| Campo del módulo | Campo del estudio | Sentido |
|---|---|---|
| `rwt-septo` · `rwt-pp` · `rwt-ddvi` | `siv` · `ppvi` · `ddfvi` | los dos |
| `ee-e` | `onda_e` | los dos |
| `tapse-val` | `tapse` | los dos |
| `sgl-val` | `sgl` | los dos, **con signo negativo hacia el estudio** |
| `ett-septo` · `ett-pp` · `ett-fevi` | `siv` · `ppvi` · `fevi` | **sólo módulo → app** |
| `ee-ep` | — | **sólo app → módulo** |
| `ap-apic` · `ap-base` | — | **ninguno** |

⚠️ **POR QUÉ LOS ESPESORES VAN EN UN SOLO SENTIDO, Y ESTÁ MEDIDO.** `_amHayDatos` —la línea de
pendientes de la miocardiopatía hipertrófica— lee `ett-septo` y `ett-pp` como «el médico está
evaluando amiloidosis en esta aplicación». Autollenarlos desde `siv` habría puesto esa frase en el
informe de **cualquier** estudio con el septo cargado. Para la condición de pared de 12 mm o más,
`calcETT` **lee** `siv` y `ppvi` cuando los del módulo están vacíos: es un cálculo, no una
escritura.

⚠️ **EL `e′` PROMEDIO NO VUELVE.** Sale de `e′` septal y `e′` lateral; devolver un solo número a
dos campos exigiría inventar dos mediciones.

⚠️ **EL SENTIDO MÓDULO → APP CUELGA DEL GESTO, NO DEL BARRIDO.** Lo llaman los `calc*` del módulo,
que cuelgan del `oninput` de cada insumo. El registro de espejos de la tanda B excluye a propósito
a los pintores que **escriben** campos del estudio, y ésta es la misma regla.
Y **no pisa un valor distinto ya cargado**: lo declara, igual que el aviso de discrepancia de la
PAM. Pisarlo sería cambiar en silencio el TAPSE que decide el cociente TAPSE/PSAP y el score de
TEP, con el médico mirando otra pestaña.

### El resultado pasa solo al algoritmo

El botón «→ Pasar score al Algoritmo» se retiró y `pasarScoreAAlgoritmo` se fue con él. `calcETT`
publica el puntaje en `alg-ett-score`, que es lo que leen el algoritmo, el informe y la columna
«Score amiloidosis ETT» del Excel.

⚠️ **SÓLO CON PUNTAJE MAYOR QUE CERO, Y ESTO SE MIDIÓ.** La condición era «el módulo tiene algún
insumo cargado», y con el autollenado en vivo eso es casi cualquier estudio: publicaba un **0**
donde el Excel tenía vacío. `actualizarAlgoritmo` lee ese campo con `PF(...) || null`, así que
para él 0 y vacío son lo mismo: no se pierde nada.

⚠️ **EL STRAIN SE ESCRIBE NEGATIVO.** El campo `sgl` del estudio tiene su línea de referencia del
Laboratorio en **−20**, así que un +12 queda del lado sano de una referencia negativa. Lo destapó
el A/B, que publicaba «GLS (%) 12» con el módulo en −12.

### Lo que el ⓘ del score dice hoy

`VINFO['amilo-score']`, con **ancho propio de 460 px** porque el texto nuevo no entraba en los 300
de la tarjeta estándar —1013 px de contenido en 985 de hueco, medido—.

Es el score **IWT** de Boldrini: detecta amiloidosis cardíaca de **cualquier** tipo y **no** es
específico de transtiretina; se aplica con pared de 12 mm o más; con 8 puntos o más la
sensibilidad es 46 % y la especificidad 98 %, así que **por debajo de 8 no se descarta**; el corte
de 8 sale del **documento de posición**, no del artículo; y los cortes de «menos de 1» y «5 o más»
que el artículo propone son del score **AL**, que es otro.

---

## 3 · Las siete tablas de Cardio-Oncología

Las tildes se completaron celda por celda: **48 celdas**, 34 palabras distintas, verificado
comparando con HEAD tras normalizar acentos —**cero** cambios de contenido—.

⚠️ **TRES DE ESAS TABLAS PUBLICAN EL ESQUEMA QUE EL D-1 RETIRÓ.** La de factores con puntos fijos,
la de riesgo por fármaco y la de «riesgo global» viven en la sub-pestaña «HFA-ICOS» y describen
una forma de clasificar que ya no es la de la app. Su aviso visible se corrigió —decía los cortes
viejos y traía un «ejemplo real» que ya no ocurre—, pero las tablas quedan. → **D-c**.

⚠️ **LAS ETIQUETAS DEL SELECTOR `co_farmaco` NO SE TOCARON**, «Radioterapia toraxica» incluida, que
además tiene una x por una c: ese texto es el que el Excel publica en la columna «Fármaco
cardiotóxico», y corregirlo cambia un **valor** del Excel. → **D-d**.

---

## 4 · Dos premisas de la orden que no se reproducen

Medido en seis anchos (390, 480, 500, 560, 768 y 1024 px), con la pestaña abierta por su **botón
real** y las tarjetas desplegadas:

1. **Los cuatro botones del centellograma NO ocupan cuatro renglones.** Van en **una** fila desde
   560 px y en **dos** por debajo de 500, por una media query deliberada. Nunca cuatro.
2. **El globo ⓘ del score NO se cortaba**: contenido 647 px contra 1002 de hueco disponible.
   El texto nuevo del D-4 **sí** lo cortó, y por eso la tarjeta pasó a tener ancho propio.

Antes de reabrir cualquiera de las dos, medir: este repo ya pagó dos hallazgos de auditoría que
apuntaban a defectos que no existían.

---

## ➜ Dónde está el resto

- El barrido de espejos y su registro: `docs/mapa/b-espejos-pam.md`.
- La hemodinámica, la cardio-oncología de la tanda J2 y el resto del módulo de amiloidosis:
  `docs/mapa/j2-hemo-onco-amiloide-pulmon.md`.
- La ficha del caso de prueba: `docs/mapa/tests-fichas-540.md`.
- Las fuentes, transcritas: `docs/fuentes/FUENTES.md` → «La tanda D».

---

## 5 · La corrección D-9 — no se podía borrar lo que el módulo había escrito

**El defecto, medido campo por campo antes de tocar nada.** Después de que el módulo escribía en
el estudio, **seis** de los ocho datos compartidos no se dejaban borrar: volvían 220 ms después.

| Campo del estudio | ¿Se borraba? | Quién lo reescribía |
|---|---|---|
| `siv` · `ppvi` · `ddfvi` · `tapse` · `onda_e` · `sgl` | **no** | la pasada de **marcado** del barrido |
| `e_sep` · `e_lat` | sí | — (no tienen campo espejo) |

⚠️ **EL SENTIDO APP → MÓDULO NO ERA EL CULPABLE**: tras esa pasada el campo del estudio seguía
vacío. Lo reescribía `amiloAutoMarcarTodos`, que llama a los `calc*` del módulo, y **ésos**
escribían hacia el estudio. El comentario del D-3 decía «cuelga del gesto del médico» y era una
intención, no un mecanismo: el barrido llama a esas mismas funciones.

### El arreglo, en una frase: el campo del ESTUDIO es el dueño

- **`amiloGestoEnModulo(id)` es la única puerta de escritura módulo → estudio**, y la llama el
  evento de entrada de cada insumo del módulo. Ningún `calc*` escribe ya. Eso cubre de una vez el
  barrido, el repintado, la restauración de un estudio guardado y el cambio de pestaña.
- **`_amiloReflejarDesdeApp()` es el único dueño del sentido app → módulo**: deja cada insumo
  valiendo lo que dice su fuente —el valor si lo hay, vacío si no—, y toca sólo lo que lleva la
  marca `espejo`, que es lo que distingue un reflejo de una medición hecha en el calculador.
- El gesto **quita** esa marca: lo que el médico escribe en el módulo deja de ser reflejo.

### Dos redundancias que destaparon las mutaciones, y no el caso

⚠️ **CUATRO MUTACIONES SOBREVIVIERON AL PRIMER BARRIDO Y SÓLO DOS ERAN FALTA DE COBERTURA.** Las
otras dos sobrevivían porque **el arreglo tenía dos mecanismos haciendo el mismo trabajo**: un
recorrido del registro `amiloEspejos()` y el que sigue a los insumos autollenados cubrían
exactamente los mismos campos. Romper cualquiera de los dos no cambiaba nada. Se retiró el
recorrido y quedó un solo dueño.

⚠️ **Y UNA TERCERA REDUNDANCIA SOBREVIVIÓ A ESO**: vaciar el reflejo y dejar que el autollenado lo
repusiera da el mismo resultado que seguir al dato… **salvo con la fuente incompleta**. El
autollenado exige los TRES insumos del espesor relativo y no escribe nada si falta uno, así que
sin el reflejo que sigue al dato, borrar **sólo el DDVI** se llevaba puestos también el septo y la
pared posterior del calculador. Esa es la condición **(G1)** de TC-541, y es un escenario
corriente: el médico mide dos de tres.

⚠️ **EL EMPALME DEL CÓDIGO SE LLEVÓ UNA FUNCIÓN ENTERA, Y LO DIJO LA MEDICIÓN.** Al quitar el
recorrido redundante, el corte llegaba hasta la línea `window.amiloEspejoDesdeApp = …`, que estaba
**después** de la función nueva: quedó la llamada sin la función. El score pasó a 0 y el marcado
automático dejó de funcionar por completo. No lo dijo ningún error de consola —`amiloScoreSync`
corre dentro del `try` del barrido— sino el caso, al medir el denominador.

### Lo que NO se tocó

El `e′` promedio **no se vacía** cuando se borra una sola de las dos `e′`: pasa a valer la que
queda, que es lo correcto. La primera versión de la condición exigía vacío y daba rojo sobre el
comportamiento correcto.
