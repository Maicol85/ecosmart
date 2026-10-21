# Las CUATRO correcciones del 21/10/2026 — «D2»

Mapa de la tanda que el médico pidió tras probar el H (aorta) y el D (FOP) en Safari. Cubre la
regla del aneurisma del septum, el selector de latidos, la compuerta de la Evidencia de la válvula
aórtica bicúspide y las barras de C. Congénitas.

**No se agregó ningún campo, ninguna columna de Excel y ninguna función clínica nueva.** El Excel
queda en **440 columnas** con los mismos valores, medido clave por clave.

---

## 1 · El ASIA: la regla, con UN solo dueño

| Pieza | Qué hace |
|---|---|
| `ASIA_EXC_UN_LADO_MIN` = 10 · `ASIA_EXC_TOTAL_MIN` = 15 | los dos cortes, en milímetros |
| `ASIA_EXC_BANDA` = `[2, 40]` | la banda de plausibilidad, **dueño único**: la usan `fopConclusion` (que manda a `no_interpretable`) y la interpretación de pantalla |
| `asiaLado(src)` | lee `otr_asia_lado`, cuyo **único control** vive en Otros · Variantes anatómicas |
| `asiaCorteMm(src)` | 15 con «ambos lados», 10 con un lado |
| `asiaNegado(src)` | `fop_asa === 'no'`. Lee el `<select>` y no la casilla de Otros: la casilla no distingue «no» de «no evaluado» |
| `asiaPorExcursion(mm, src)` | **la regla**: `false` si está negado, `false` sin lado, y `mm > asiaCorteMm(src)` |
| `asiaExcFrase(src)` | **la frase**, en dos renderizados de las mismas piezas: `txt` para la prosa y `corto` para la celda del PDF |

### El operador es `>` ESTRICTO, y la fuente sostiene la mitad

Silvestry 2015, **folio 916**: «*of **greater than** 10 mm* … *into the RA or LA or a combined
total excursion right and left **of 15 mm***». El de **un lado** lo escribe la guía; el del
**total** no lleva operador en ninguno de los dos folios que lo publican (el 938 reescribe los dos
sin «greater than»). Se elige el estricto, que es el lado que **no afirma**. Los dos textos están
en `docs/fuentes/FUENTES.md`.

**Tabla de bordes, medida con teclas reales:**

| lado | 9 | 10 | 11 | 14 | 15 | 16 |
|---|---|---|---|---|---|---|
| un lado (AD o AI) | no | **no** | sí | sí | sí | sí |
| ambos lados | no | no | no | no | **no** | sí |
| sin consignar | — | — | — | — | — | — (nunca afirma) |

### Sin lado NO hay veredicto, y es la mitad que faltaba

El corte **depende** del lado, así que sin él no hay umbral que comparar. La pantalla publica
«*16 mm — falta indicar hacia dónde se abomba*» y el informe no afirma el criterio.
⚠️ **CONSECUENCIA DECLARADA sobre un estudio GUARDADO antes de la tanda D**: no trae la clave, así
que su excursión deja de afirmar el aneurisma **por sí sola** —el médico que marcó «Sí» en el
desplegable lo sigue teniendo—. Lo protege que `informe_texto` es un `<textarea>` con id, viaja con
el estudio y la reimpresión **no lo reescribe**. `docs/PENDIENTES.md` → D2b-1.

### Con el ASIA en «No», la excursión no se usa

El número **se conserva** —es un dato que el médico tipeó y la tabla del PDF no pierde datos— y
deja de alimentar toda frase e interpretación. «Se abomba hacia» vuelve a **vacío** por los dos
gestos: la casilla de Otros (`fopBurbEspejo('otr_asia')`) y el desplegable del FOP
(`fopBurbEspejo('fop')`). Al volver a «Sí» se elige de nuevo.
⚠️ **LA COMPUERTA VA EN EL DUEÑO Y NO EN CADA CONSUMIDOR**, que son seis.

### Las SIETE superficies del aneurisma, y las cinco copias del lado que había

Seis leen `asiaExcFrase`; la séptima —la interpretación de la pantalla— publica el **veredicto** y
su motivo, que es otra cosa y por eso no usa la frase.

| Superficie | Antes | Ahora |
|---|---|---|
| Pantalla del FOP (`fop-asa-interp`) | «15 mm — aneurisma significativo (≥10 mm)» | «15 mm — no supera el umbral de 15 mm» / «falta indicar hacia dónde se abomba» |
| Conclusión (`fopConclusion`) | «(excursión de 16 mm **de excursión total**)» | «con excursión de 16 mm **hacia ambos lados (total)**» |
| Informe narrativo (bloque del FOP) | «(excursión de 16 mm de excursión total)» | «con excursión de 16 mm hacia ambos lados (total)» |
| EN SUMA (`ccSumaLinea('fop')`) | «aneurisma del septum **(16 mm)**» | «aneurisma del septum **con excursión de 16 mm hacia ambos lados (total)**» |
| Tabla del PDF (`fopPdfFilas`) | «16 mm (excursion total)» | «16 mm hacia ambos lados (total)» |
| Pestaña Otros (`otrHallazgos`) | «Aneurisma del septum interauricular **16**.» (el 16 era la nota del médico) | «Aneurisma del septum interauricular **con excursión de 16 mm hacia ambos lados (total)**.» |
| Panel de Evidencia (`_indFOP`) | «(excursión 16 mm, excursión total)» | «— excursión de 16 mm hacia ambos lados (total)» |

⚠️ **LA PROSA ENGANCHA CON « con » Y NO CON PARÉNTESIS**: el «(total)» de la frase es el único
paréntesis, y anidarlo dejaría el papel firmado terminando en «))» —el defecto que la rama de
prótesis de `index.html` ya pagó—. La celda del PDF usa `corto`, sin el «excursión de», porque el
rótulo de su fila ya lo dice.
⚠️ **LA CAJA DE DETALLE DE OTROS (`otr_asia_nota`) NO SE TOCA**: es texto libre del médico y va
**después** de la frase.

---

## 2 · Los latidos nacen VACÍOS

La `<option value="">` pasa al **primer** lugar, y eso es todo lo que hace falta: `limpiarCampos`
hace `selectedIndex = 0` sobre todo `<select>` del documento. **Cierra `D-6`.**

| Estado | Pantalla del FOP | Informe · conclusión · EN SUMA · PDF |
|---|---|---|
| sin pasaje documentado | «— se consigna en Otros · Test de burbuja» | nada |
| con pasaje, sin número | «— sin consignar» | nada |
| con pasaje y número | «N latidos tras la opacificación…» | «a los N latidos» |

El predicado que separa los dos primeros sale a `fopPasajeDocumentado(src)`, **dueño único**, que
`fopLatidos` también usa.
⚠️ **UN ESTUDIO GUARDADO CON 3 ABRE CON 3**: el guardado no distingue un 3 elegido de un 3 por
omisión. No se migra nada. `docs/PENDIENTES.md` → D2b-2.

---

## 3 · La Evidencia de la VAB: la válvula Y la aorta

`_indVABEsBicuspide()` es el **dueño único** del predicado: `vab_tipo` elegido **o** `va_morf` en
«Bicúspide». Lo consultan las **dos** secciones de la bicúspide.

⚠️ **LA CONDICIÓN DE LA VÁLVULA NUNCA ESTUVO EN `_indVAB`**, medido con git en el árbol del H y en
el anterior: su compuerta era `if (!_ge(asc,45) && !_ge(raiz,45)) return null`, o sea sólo el
diámetro. Lo que el H cambió es el **umbral** —de 45 mm a `aoDilatada()`, 40 en el hombre y 36 en
la mujer— y con eso el defecto pasó de aparecer a 45 mm a aparecer a **41**, que es cuando el
médico lo vio.

| válvula | 38 mm | 41 mm | 56 mm |
|---|---|---|---|
| Trivalva — **antes del H** | no | no | **sí** (defecto) |
| Trivalva — **después del H** | no | **sí** (defecto) | **sí** (defecto) |
| Trivalva — **hoy** | no | **no** | **no** |
| Bicúspide — hoy | no | sí | sí |

**CONTROL**: la sección «Aorta torácica — dilatación y aortopatía» **no** cambia —su asunto ES la
aorta— y aparece a 41 y 56 mm con las dos válvulas.
**CENSO**: los cuatro commits del H tocaron **dos** `return null`, el de `_indAo` (sección nueva) y
el de `_indVAB`. La coartación gatea por `coaConclusion()` y las aortopatías por el diámetro.

---

## 4 · Las barras de C. Congénitas nacen cerradas

`secAutoOpen(tabId)` abre toda `.sacc` cuyo cuerpo tenga un control «con datos». **Dos** controles
de la barra de la VAB lo disparaban con el formulario vacío o casi:

| Control | Por qué contaba | Marca |
|---|---|---|
| `vab-anim-scrub` (`<input type="range" value="0">`) | `'0'.trim() !== ''` → dato. Era el **único** culpable con el formulario vacío | `data-ui` |
| `vab_funcion` (`<input type="hidden">`) | lo escribe `vabFuncionDerivada` desde los grados de EA y de IAo de **Válvulas**. Medido: con `ea_grado` en moderada vale «estenosis» | `data-espejo` |

Los dos atributos los consume **sólo** `secAutoOpen` (y `data-espejo` también `cardAutoOpen`), así
que no hay otro efecto. **Medido**: CC frecuentes 0 de 10 barras abiertas y CC complejas 0 de 9, al
entrar y al volver a entrar; lo que el médico abre a mano **no** se cierra; y con un dato cargado la
barra **sí** se abre sola.

---

## 5 · La caja de «Conclusión» del FOP

`.calc-row` es `display:flex; align-items:center`, pensada para una fila de un valor corto. Con una
oración de varios renglones la etiqueta —de una línea y centrada verticalmente— cae a la altura del
**segundo** renglón a 1200 px y en el **medio** de diez a 360 px.
⚠️ **NO HAY SUPERPOSICIÓN DE PÍXELES Y EL MÉDICO TIENE RAZÓN IGUAL**: medido en las diez celdas,
las dos cajas no se cruzan; lo que pasa es que la etiqueta cae **dentro** del bloque del texto.

La regla va en una clase **propia**, `#sacc-cc-fop .fop-concl-row`, y no en `.calc-row`, que la
comparten cientos de filas de toda la app. La fila **conserva** `calc-row`: el barrido de
`limpiarCampos` es `.calc-box .calc-row span[id]`, y sin esa clase la conclusión del paciente
anterior sobreviviría a «Nuevo estudio».

---

## 6 · Cómo se mide esta zona

`scripts/_probe_d2.mjs`, A/B de solo lectura con `--file`, seis grupos:
`asia` · `lat` · `vab` · `cc` · `concl` · `captura` · `ctrl`.

### Trampas de esta tanda

1. **`abrirOtros()` CAMBIA DE PESTAÑA**, así que la caja del FOP queda en 0×0 y la captura sale
   «SIN CAJA». Hay que volver al FOP **antes** de sacarla.
2. **`#sacc-cc-fop .calc-box:last-of-type` NO MATCHEA LA CAJA DE CONCLUSIÓN**: `:last-of-type` mira
   el **tipo de elemento** (`div`), no la clase. Se selecciona por la clase de la fila.
3. **EL ACENTO GRAVE DENTRO DEL CUERPO DE UN CASO**, CINCO veces en esta tanda, las cinco
   nombrando algo en prosa. `scripts/check_backticks.py` dio la línea exacta las cinco;
   `node --check` apuntaba a la apertura del template, cientos de líneas antes.
4. **LEER EL ESTADO DESPUÉS DE DESHACER EL GESTO**: la primera versión del grupo `asia` leía la
   conclusión tras haber devuelto el ASIA a «Sí», o sea medía la escena siguiente. El estado se
   captura **en el momento**, dentro del helper que hace el gesto.
5. **UNA BARRA ABIERTA POR UNA ESCENA ANTERIOR NO ES UN AUTO-ABRIR**: el medidor informa los
   **culpables** de cada barra abierta, y una lista vacía dice que la abrió otra cosa. Es lo que
   obligó a que el grupo F **fije su estado de partida por el gesto** —ver «Cobertura»—.
6. **EL CONTEO IMPRESO MANDA SOBRE EL VEREDICTO**: un `RESULTADO` sobre un `--solo` de 528 ids no
   dice que el denominador sea el que se pidió. Hay que mirar el conteo.

### Cobertura

**TC-514**, **62 condiciones** en diez grupos:

| grupo | qué fija |
|---|---|
| **DENOM** | los cuatro dueños existen, y los dos selectores y los dos campos también |
| **A** | la regla por sus tripletes en los cuatro estados del lado, el símbolo siguiendo al operador y la fila del lado nombrando SU umbral |
| **B** | la frase en las **siete** superficies, con lado y sin lado |
| **C** | el ASIA en «No» por los **dos** gestos, la excursión conservada y no usada, la vuelta a «Sí» y «Nuevo estudio» |
| **D** | la opción vacía primera, las cuatro superficies callando el número, los cuatro valores, y el **control** sin pasaje |
| **E** | la matriz válvula × diámetro, el tipo de fusión, y los **controles** de «Aorta torácica» y del dueño compartido |
| **F** | el estado de partida CERRADO por el gesto, que entrar no abre ninguna barra en las dos pestañas, los dos atributos, y los **controles** de lo abierto a mano y de lo que sí abre |
| **G** | la etiqueta por encima del texto, la clase propia, el color real y el **control** de «Nuevo estudio» |
| **H** | estudios guardados con 3 latidos y sin las dos claves, con su **control** |
| **I · J** | la regla sin media query, el scroll al ancho de la corrida, el Excel en 440 y los cuatro controles ajenos |

**Sabe fallar contra el inicio de la tanda en un worktree aparte: 33 de las 62 en rojo, y ninguna
por excepción** —las dos que informan `SIN FN` son el centinela de `asiaExcFrase` y el de
`_indVABEsBicuspide`, que allá no existen, y eso es la medición de una ausencia, no una excepción—.
⚠️ **LA MAQUETA SE AFIRMA POR LA REGLA Y POR LO RENDERIZADO AL ANCHO DE LA CORRIDA**: el cuerpo de
un caso no puede cambiar el viewport, así que los cinco anchos por dos temas los mide la sonda.

⚠️ **EL GRUPO F FIJA SU ESTADO DE PARTIDA POR EL GESTO, y es lo que lo hace independiente del orden
de corrida.** `limpiarCampos` vacía los campos y **no cierra un acordeón**, así que un caso anterior
puede dejar una barra abierta: medido, la corrida completa informaba
`abiertas=["sacc-cc-vab","sacc-cc-fop"]` con **`culpables=[]`** y el mismo caso **corrido solo daba
verde**. El caso cierra las abiertas clickeando su encabezado, comprueba en su **denominador** que
quedaron en cero, y recién entonces entra: lo que afirma es que **entrar** no ABRE una barra que
estaba cerrada, que es lo que `secAutoOpen` gobierna. Contra el inicio de la tanda ese denominador
sale **en verde** y F1 **en rojo**, que es lo que prueba que el rojo es el defecto y no el arnés.

### Casos de la suite que esta tanda adaptó

| caso | por qué |
|---|---|
| **TC-513** | diez condiciones (B2, B3, B6, B7, B9, B10, B12, E1, H1, H3); **seis afirman hoy lo contrario** y dos ganan poder |
| **TC-173** | su escenario del aneurisma MEDIDO gana el lado: la excursión sola ya no afirma |
| **TC-322** | el SEED de la sección de la aorta de la bicúspide iba `{ ao_tub:'50' }` **sin morfología**, o sea sembraba el defecto |
| **TC-501** | **lo destapó la suite completa**: sus M1 y M2 fijan la frase del FOP del ARR letra por letra, y le cambian la excursión y los latidos. Gana **M2c**, que exige que el número de latidos no salga por ninguna de las dos superficies |

