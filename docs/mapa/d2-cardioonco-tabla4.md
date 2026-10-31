<!-- Mapa de la tanda D2 (2026-10-30). Se abre a demanda; no se carga solo. -->

# Mapa — la tanda «D2»: la calculadora sin fármaco, las seis columnas de la Tabla 4, las tablas HFA-ICOS y el monitoreo

Hermano de `d-cardioonco-amiloidosis.md`, que es el mapa de la tanda D y donde vive el
mecanismo de la calculadora. Acá está **sólo lo que la D2 movió**.

---

## 1 · Sin fármaco elegido la calculadora no clasifica

**Decisión de Maicol, 2026-10-30.** La Tabla 4 tiene una **columna por fármaco** —la misma
casilla vale distinto en cada una—, así que sin fármaco no hay columna que aplicar; y el puntaje
propio tampoco contesta, porque es el puntaje de un tratamiento que todavía no se eligió.

**Lo que pasaba antes, medido en HEAD:** con el selector vacío, una hipertensión sola salía
«Riesgo MEDIO (1/13 pts)» y tres factores «Riesgo ALTO (3/13 pts)», con su línea de derivación,
en la cápsula **y** en `co-riesgo-resultado`. El informe firmado de un estudio integrado
publicaba «puntaje 2/13 puntos — riesgo alto» sobre un paciente sin tratamiento elegido.

**El dueño es `hfaicosEstado().clasifica`**, que vale `!!farmaco`. Apaga ahí mismo `derivacion`
y `seguimiento`, que son función de la categoría: tres pintores que se acuerden por separado es
como se desincronizan.

| Quién | Qué hace sin fármaco |
|---|---|
| `calcHFAICOS` | publica «Elegí el fármaco para calcular el riesgo» y sale; conserva la línea del antecedente sin especificar y la de enfermedad CV previa o hallazgos anormales |
| `hfaicosPublicarBasal` | publica la **misma pastilla gris de siempre**, «Completar en «Calculadora de Riesgo CV»» |
| `hfaicosTexto` | se calla la oración de la categoría, la derivación, el calendario y la línea de «clasificación orientativa»; deja los factores consignados, el antecedente sin especificar y los hallazgos |

⚠️ **EL MENSAJE NO LLEGA AL PAPEL, Y ESO ES DELIBERADO.** `co-riesgo-resultado` lo leen la hoja
del PDF, el PPT y el cuerpo del informe cuando el módulo está integrado, así que ahí va la
pastilla gris que ya existía. **Ninguna cadena nueva entra al informe firmado por este cambio.**

⚠️ **LO QUE SE CONSERVA NO ES UN OLVIDO.** La última fila de la Recomendaciones-tabla 1
—enfermedad cardiovascular previa o hallazgos anormales— vale en **cualquier** categoría, también
en ninguna. Retirarla sería un segundo cambio que nadie pidió, y es la línea que manda derivar.

---

## 2 · Las seis columnas de la Tabla 4

`coT4Pesos()` tiene hoy las **seis** columnas de la tabla, leídas en imagen a 420 ppp para esta
tanda, celda por celda: hojas 18 y 19 de la edición inglesa, folios **4246** y **4247**
verificados en el pie impreso. **Folio = hoja + 4228**, comprobado en siete hojas.

| Casilla de la app | Antracicl. | Anti-HER2 | Anti-VEGF | BCR-ABL | Mieloma | RAF/MEK |
|---|---|---|---|---|---|---|
| `hfaicos_hta` | M1 | M1 | **H** | M2 | M1 | M2 |
| `hfaicos_dm` | M1 | M1 | M1 | M1 | M1 | M1 |
| `hfaicos_obesidad` | M1 | M1 | M1 | M1 | M1 | M1 |
| `hfaicos_tabaco` | M1 | M1 | M1 | **H** | M1 | M1 |
| `hfaicos_cv_ic` | VH | VH | VH | **H** | VH | VH |
| `hfaicos_cv_coron` | H | H | **VH** | – | – | H |
| `hfaicos_cv_arrit` | – | M2 | M2 | M2 | M2 | M1 |
| `hfaicos_fevi_lim` | M2 | M2 | M2 | **–** | M2 | M2 |
| `hfaicos_fevi_red` | H | H | H | H | H | H |
| `hfaicos_troponina` | M1 | M2 | M1 | **–** | M2 | M2 |
| `hfaicos_bnp` | M1 | M2 | M1 | **–** | **H** | M2 |

`hfaicos_sexo_fem`, `hfaicos_gls_alt` y `hfaicos_cv_previa` **no tienen fila** en la tabla y no
figuran: las dos primeras caen en `fueraDeTabla` y la tercera es la casilla de legado.

### Las filas de edad no son las mismas en cada columna

`_coT4Edad(edad, col)`. La tabla reparte la edad en **cinco** filas y cada columna usa las suyas:

| Columna | Filas de la tabla | Qué aplica la app |
|---|---|---|
| antraciclinas, anti-HER2 | ≥80 **H** · 65-79 **M2** | ≥80 → H, si no M2 |
| anti-VEGF | ≥75 **H** · 65-74 **M1** | ≥75 → H, si no M1 |
| BCR-ABL | ≥75 **H** · 65-74 **M2** · ≥60 **M1** | ≥75 → H, si no M2 |
| mieloma múltiple | ≥75 **H** · 65-74 **M1** | ≥75 → H, si no M1 |
| RAF/MEK | las cuatro valen **M1** | M1 siempre |

La app tiene **una** casilla de edad, así que sólo puede emitir una celda: se aplica la fila más
específica que el paciente cumple, y entre dos que cumple a la vez —en BCR-ABL, «65-74» y
«≥60»— la mayor. Sumar las dos sería contar la misma edad dos veces. Sin el año cargado se
aplica la fila **menor** de la columna, que es la regla que la tanda D ya tenía.

### ⚠️ La casilla de antecedente coronario son TRES filas, y en cuatro columnas no valen lo mismo

`hfaicos_cv_coron` cubre «Severe VHD», «MI or PCI or CABG» y «Stable angina». Se aplica el
**mayor** de las tres, que es el lado seguro y el mismo criterio que la nota al pie g. Para
antraciclinas y anti-HER2 las tres son H, así que **nada se movió**; para BCR-ABL y mieloma las
tres son «–»; para RAF/MEK las tres son H; **y para anti-VEGF son –, VH y VH**.

**El precio, declarado:** con anti-VEGF, un paciente cuyo único antecedente sea una valvulopatía
severa se clasifica **muy alto**, y esa columna no le da peso. Partir la casilla en tres exigiría
campos guardados nuevos → `docs/PENDIENTES.md` **D2-a**.

### Los dos fármacos nuevos del selector

`mieloma` y `raf_mek`. **No agregan un campo guardado ni una columna de Excel**: `co_farmaco` y
la columna «Fármaco cardiotóxico» ya existían. Lo que agregan son dos **valores** al vocabulario
de esa columna, en `LAB_XLS_ETIQ` y en el mapa inverso del importador —los dos, que es lo que
mantiene vivo el round-trip—. Medido: Excel **440 → 440** columnas con las mismas claves, censo
**946 → 946** ids con el mismo juego.

### La línea de alcance quedó con un solo texto

`_hfaicosAlcance` tenía dos porque anti-VEGF y BCR-ABL tenían columna sin aplicar. Hoy los únicos
fármacos que llegan al puntaje propio —**inmunoterapia, radioterapia y «Otro»**— son exactamente
los que **no tienen columna**, y para los tres la frase correcta es la misma.

### ⚠️ El nombre de la columna en el papel sale de una tabla, no de un ternario

`hfaicosTexto` lo armaba con `r.col === 'antracicline' ? 'antraciclinas' : 'terapias dirigidas
contra HER2'`, cierto mientras las columnas fueran dos. Con las seis, el informe **firmado** de
un paciente con mieloma múltiple decía «según la tabla … para terapias dirigidas contra HER2».
Lo encontró el A/B del commit 2 con la escena `f_mieloma_bnp`. Hoy el nombre sale de `COLNOM`.

---

## 3 · Las tablas A y C de HFA-ICOS se dibujan, no se escriben

Cierra **D-c**. Inventario de lo que publicaban:

| | Qué mostraba | Qué muestra hoy |
|---|---|---|
| **A** | doce filas con puntos **fijos**, iguales para todos los fármacos | la **matriz** factor × fármaco, 11 filas más las dos de edad, 6 columnas |
| **B** | cuatro bandas de riesgo con listas de fármacos | **sin tocar** |
| **C** | «≥4 puntos de la sección A **o** fármaco de muy alto riesgo» y su cascada | la **regla de combinación** de la guía |

**Ejemplo medido del defecto:** un paciente con hipertensión arterial y nada más, con un
anti-VEGF, leía «1 punto → Medio» en A+C y la calculadora dos tarjetas más arriba decía **ALTO**.

`coT4RefPintar()` arma las dos desde `coT4Pesos()`, `_coT4Edad()` y `_CO_T4_CORTES`. **No hay dos
números que mantener de acuerdo: hay uno leído dos veces.** Los dos cortes de la regla se
extrajeron de la cascada de `hfaicosEstado` a `_CO_T4_CORTES`, y el rótulo de cada celda a
`_coT4Rot`, que comparten la matriz y la columna de puntos de la calculadora.

⚠️ **SE PINTA UNA VEZ AL ARRANCAR, no sólo al abrir la sub-pestaña.** Si sólo se pintara con el
gesto, el texto de la sección entera —que es lo que leen TC-99, TC-100 y TC-108— mediría un
contenedor **vacío**. Es el motivo por el que TC-507 tuvo que pintar su ficha antes de contar sus
chips. No entra en `RECALC_MODULOS` ni en `limpiarCampos`: no depende del paciente.

**La matriz va dentro de `overflow-x:auto`**, que es el patrón que `check_mobile.js` acepta para
siete columnas; sin él son 44 px por celda en un teléfono.

**LA TABLA B NO SE TOCÓ Y SE REPORTA:** agrupar fármacos en bandas de riesgo **no tiene
equivalente** en la Tabla 4, donde el fármaco es una **columna** y nunca un piso. El aviso
amarillo pasa a decir que A y C son las que la app aplica y que B no decide nada → **D2-b**.

---

## 4 · El monitoreo de inmunoterapia y de anti-VEGF

Cierra **D-g**. Las dos fuentes, leídas en imagen con su folio comprobado en el pie:

- **Figura 20**, «Immune checkpoint inhibitors surveillance protocol», hoja **45**, folio
  **4273**. Las clases salen de los colores de su leyenda y la definición de riesgo alto de su
  nota b.
- **Recomendaciones-tabla 10**, hoja **36**, folio **4264**. El eco adicional a las 4 semanas es
  su nota e.

| Fila | Decía | La guía publica |
|---|---|---|
| ICI | «ECG y troponina basal y ante síntomas» | basal: evaluación CV, ECG, eco, troponina y péptidos; después ECG y troponina en los ciclos 2, 3 y 4 y cada 3 ciclos |
| Anti-VEGF | «PA, eco si síntomas o FEVI límite» | PA en cada visita y domiciliaria **diaria** el primer ciclo; eco basal; el primer año cada 3 meses en alto y muy alto o cada 4 en moderado |

### ⚠️ Las dos filas no estaban en un lugar: estaban en TRES

La columna «Monitoreo recomendado» de la subtab **Cardiotoxicidad**, la tabla por clase de la
subtab **Seguimiento** y la tabla de la subtab **Clases**, cada una con su propia versión y las
tres distintas. La de «Seguimiento» además afirmaba en su intro ser «la **misma** columna» de la
primera, y no lo era. **Se corrigieron las tres al mismo texto**, y esa intro dejó de afirmarlo.

**La línea visible dice lo esencial y el detalle vive en el ⓘ `co-monitoreo`**, con el calendario
completo por riesgo, sus clases y las dos fuentes con su folio. Es la regla R2.

⚠️ **LO QUE NO SE ESCRIBIÓ:** el protocolo de la inmunoterapia reparte cada estudio en **dos**
columnas de riesgo que define por un criterio propio —doble bloqueo, combinación con otro
tratamiento cardiotóxico, evento adverso no cardiovascular por el mismo fármaco, o disfunción o
enfermedad cardiovascular previa—, que **no** es la categoría de la calculadora. El globo dice
cuál es y no las mezcla.

### El punto 4b, verificado y sin tocar nada

Releída en imagen la **Recomendaciones-tabla 1**, hoja **21**, folio **4249**. La derivación de
la app **sí** sigue la categoría de la guía:

| Categoría | La guía | La app |
|---|---|---|
| bajo | «proceed to anticancer therapy without delay» (I · C) | no muestra acción |
| moderado | «cardiology referral **may be considered**» (IIb · C) | «se puede considerar derivar a cardiología, sin demorar el tratamiento» |
| alto y muy alto | «cardiology referral **is recommended** … before anticancer therapy» (I · C) | «derivación a cardiología antes de iniciar el tratamiento, salvo urgencia oncológica» |

Las clases y los niveles ya vivían en el globo `co-riesgo-basal`. **Nada que cambiar.**

---

## 5 · Dónde tocar qué

| Si hay que tocar… | Está en |
|---|---|
| una celda de la Tabla 4 | `coT4Pesos()` |
| qué columna le toca a un fármaco | `coT4Columna()` |
| una fila de edad | `_coT4Edad(edad, col)` |
| los dos cortes de la regla de combinación | `_CO_T4_CORTES` |
| el rótulo de una celda | `_coT4Rot()` |
| el nombre de una columna en el informe | `COLNOM`, dentro de `hfaicosTexto` |
| la matriz o la regla de la sub-pestaña HFA-ICOS | `coT4RefPintar()` — **no hay HTML que editar** |
| si la calculadora clasifica | `hfaicosEstado().clasifica` |
| el detalle del monitoreo | el globo `co-monitoreo` del registro `VINFO` |
| las tres copias de la fila de monitoreo | buscar «ciclos 2, 3 y 4» y «domiciliaria diaria» — son **tres** cada una |

El caso es **TC-556** (`docs/mapa/tests-fichas-556.md`) y el barrido, `scripts/_mut_d2.py`.
