# La REORGANIZACIÓN DE PESTAÑAS — trabajo «B» (2026-10-21)

Mapa de dónde vive cada pantalla después del trabajo B. **Nada de acá cambia un corte, un
operador, una fórmula ni un texto clínico**: lo único que se movió son puertas. Lo que sí cambió
de palabras es la frase de Balik, y está en su propia sección.

---

## 1 · La tabla «qué se movió»

| elemento | antes | ahora |
|---|---|---|
| **Pericardio y masas** | sección plegable dentro de la pestaña «Otros» | pestaña propia del rail, `#tab-pericardio` |
| **Eco pulmonar (básico)** | sección plegable dentro de «Otros» | dentro de `#tab-pulmonar` |
| **Eco pulmonar (avanzado)** | botón «🫁 Eco Pulmonar» de la fila de arriba | botón del rail, **misma pestaña** `#tab-pulmonar` |
| **Texto del pulmonar avanzado** | hoja aparte del PDF («ETT Avanzado») | **cuerpo del informe narrativo**, tras pericardio y masas |
| **ASIA, 6 variantes y RAC** | dentro de «Pericardio y masas», en Otros | sub-pestaña «Variantes anatómicas» de Otros |
| **Test de burbuja** | sección plegable suelta en Otros | sub-pestaña «Test de burbuja» de Otros |
| **Fonocardiograma** | botón de la fila de arriba + `#tab-fono` | **fuera de la app**, en `docs/para-cardiosalud/fonocardiograma/` |
| **Calculadoras** | botón de la fila de arriba + `#tab-calculadoras` | **primera sub-pestaña de Referencias** |
| **CC frecuentes / CC complejas** | dos botones de la fila de arriba | **un** botón «C. Congénitas» + barra de dos sub-pestañas |

**Los conteos, medidos:** la columna izquierda pasa de **10 a 12** botones y la fila de arriba de
**10 a 6**. Los seis que quedan arriba son Hemodinámica, ETE, Cardio-Oncología, **Amiloidosis**
—que este trabajo no toca—, C. Congénitas y Referencias.

⚠️ **El prompt decía «hoy 9 → 5» y el conteo real es 10 → 6.** La corrección del médico lo
confirmó: **Amiloidosis también está en esa fila y no se mueve**. Y `.tabs-lab-wrap` tiene CSS
pero **no existe en el marcado** —sólo `applyViewMode` lo busca y recibe `null`—: el botón del
Laboratorio vive en `.foot-actions`, al pie, y nunca estuvo en esa fila.

---

## 2 · Las piezas, por nombre

| pieza | qué hace |
|---|---|
| `#tab-pericardio` | la pestaña nueva. **Sin `data-mod`**: es contenido básico. |
| `OTR_SUB_ORDEN` / `otrSubTab` | dueño del reparto de Otros y su navegación. |
| `#otr-sub-burbuja` / `#otr-sub-variantes` | los dos paneles. Clase `.otr-sub`, activa con `.active`. |
| `pulAvFrases()` | **dueño único** de las frases del cuerpo del pulmonar avanzado. |
| `amiloTextoPulmonar()` | consume `pulAvFrases()` y le agrega el «Patrón global». Arma el texto de la hoja. |
| `_balikVol` / `_balikFrase` / `_balikDet` | la fórmula y su redacción. **El cálculo no cambió.** |
| `REF_SUBTAB.calc` / `REF_SUB_ORDEN` | Calculadoras como sub-pestaña. La lista va **vacía** (ver §5). |
| `CC_TABS` / `ccSubTab` / `ccSubSync` | las dos pestañas de congénitas bajo un botón. |
| `window.ecoDrawerBuild` | el drawer móvil, exportado para que `applyViewMode` lo reconstruya. |

---

## 3 · Tres cosas que `showTab` hace y que condicionan todo esto

1. **`showTab` barre `.active` de TODO `.tab-btn` del documento.** Así que el estado activo de
   cualquier barra de sub-pestañas hecha con `.tab-btn` **no puede vivir en `.active`**: lo
   pierde en el próximo cambio de pestaña. Por eso Otros usa **`otr-on`** y congénitas **`cc-on`**.
   Los paneles sí usan `.active`, que ese barrido no alcanza.
2. **`showTab` hace `getElementById('tab-' + id).classList.add('active')` SIN guarda.** Un id que
   no exista es un `TypeError` que se lleva el resto de la función. Por eso `#tab-calculadoras`
   **se conserva vacío** después de mudar su contenido.
3. **La cola de `showTab` es el único lugar donde se puede sincronizar una barra cuyo estado se
   derive de la pestaña activa.** A congénitas se llega también por el drawer, por el desplegable
   de avanzadas y por accesos internos; `ccSubSync` se llama ahí, en `try`.

---

## 4 · El drawer móvil y `data-mod`

Por debajo de **768 px** el rail pasa a `display:none !important` y la única puerta es el
**drawer** (`#ecoDrawer`), que `buildDrawer` arma desde `.rail .tab-btn`.

⚠️ **Hasta este trabajo ningún botón del rail llevaba `data-mod`**, así que el drawer podía
tomarlos todos. Con «Eco pulmonar» ahí, un drawer que no mire `style.display` ofrecería en Modo
Básico un módulo que el rail ya escondió — **la única puerta por la que el gateado de
`applyViewMode` no pasaba**. Se cierra con dos cosas:

- `buildDrawer` saltea los botones con `style.display === 'none'`;
- `window.ecoDrawerBuild` se exporta y `applyViewMode` lo llama, porque **cambiar de modo en
  Config no pasa por `showTab`**, que es el otro camino que lo reconstruye.

**Medido: 12 items en Avanzado, 11 en Básico (sin «Eco pulmonar») y 12 otra vez al volver.**

---

## 5 · Calculadoras dentro de Referencias

`refSubInit` mueve los **nodos** de `#tab-calculadoras` al panel `#ref-sub-calc`, igual que hace
con las 30 entradas de la pestaña. El contenido no se reescribe.

⚠️ **`REF_SUBTAB.calc` va con lista VACÍA**, y no es un olvido: las otras cinco listan las
entradas `ref-<id>` que `refSubInit` reubica, y Calculadoras no tiene ninguna. De paso eso la deja
**fuera del índice del buscador por construcción**: ese índice exige un `h2.card-head` con un
`toggleRef('...')` y un `ref-<id>` hermano, y las tarjetas de Calculadoras no tienen ni lo uno ni
lo otro. **Las 30 entradas del censo y las 28 indexadas no se mueven** — medido.

El botón lleva `data-mod="calculadoras"` y es un `<button>`: son los dos invariantes que el
chequeo de arranque de `EE_MODULES` exige.

---

## 6 · El eco pulmonar: dónde sale cada texto

| superficie | antes | ahora |
|---|---|---|
| cuerpo del informe, módulo **básico** | sí (bloque 13b) | **igual** |
| cuerpo del informe, módulo **avanzado** | **no** | **sí** (bloque 13c), tras pericardio y masas |
| EN SUMA, avanzado | sí (`pulAvSuma`) | igual |
| hoja «ECOGRAFIA PULMONAR» del PDF | sí | **no se arma** |
| Excel | ninguna columna | **ninguna** (440) |

⚠️ **La hoja se descarta en el ARMADOR del PDF y NO con la compuerta `omitir` de la sección**, y
hay un motivo medido: `pulAvanzadoIntegrado` —el predicado de la exclusión mutua con el módulo
básico— pregunta por `amiloEnInforme`, que es justo donde `omitir` actúa. Con la compuerta puesta
ese predicado quedaba **falso para siempre**: el avanzado no publicaba nada, el básico no se
silenciaba y el módulo integrado desaparecía del informe firmado.

⚠️ **Y el «Patrón global» hay que empujarlo aparte.** Vivía **sólo** en la hoja, bajo su propio
`## En suma`, así que al dejar de imprimirse esa página desaparecía del papel. Es la única parte
del módulo que se habría perdido, y lo destapó comparar los **textos** del PDF y no su conteo.

---

## 7 · Balik: la fórmula se nombra, el cálculo no cambia

| estado | antes | ahora |
|---|---|---|
| valor plausible | `Balik 25 mm, aproximadamente 500 ml` | `aproximadamente 500 ml, según fórmula de Balik` |
| valor implausible | `Balik 200 mm — valor fuera de rango, verificar` | `separación pleural de 200 mm, fuera del rango plausible: no se estima el volumen` |

La oración completa del básico queda: **«Derrame pleural derecho moderado (aproximadamente 500 ml,
según fórmula de Balik).»**

- **El lado y el tamaño se CONSERVAN.** La orden escribe la frase como «Derrame pleural de
  aproximadamente N mL (según fórmula de Balik)»; publicada así, el informe firmado **perdería**
  de qué hemitórax es y de qué tamaño. La oración los mantiene y contiene esa frase dentro.
- **La unidad queda en «ml»** y no en «mL»: la app usa «ml» en sus otras 21 apariciones, y abrir
  una segunda notación en el papel firmado se lee como un cambio de unidad.
- **Los límites de validez de la fórmula** siguen en el globo ⓘ (`pul-balik`), con la ICM 2026 y
  su alcance —pacientes críticos en ventilación invasiva—. Lo que **sí** se conserva en el informe
  es la marca de un valor **implausible**, que es un límite del dato y no de la fórmula: sin ella
  un 200 mal tipeado sale como un derrame de 4000 ml.

---

## 8 · El Fonocardiograma

Retirado de la app y **copiado** a `docs/para-cardiosalud/fonocardiograma/` con su README.
**No guardaba ningún campo** —sus doce ids llevan guión medio, así que el recolector los deja
afuera; medido comparando los ids uno por uno: 1059 = 1059—.

⚠️ **El prefijo `fcg-` de los dos regex de exclusión SE CONSERVA**, y no es inercia: hasta el
2026-09-09 `fcg-valve-select` **sí** se colaba entre los campos guardados, así que un estudio
guardado antes de esa fecha lo trae y las rutas de restauración lo recorren.

⚠️ **Semgrep baja de 127 a 124 por este retiro.** Los tres hallazgos que se van son del código
del módulo; **0 ERROR** sigue. La línea base de Semgrep de la app es **124** desde el 2026-10-21.

---

## 9 · El assert del panel de Evidencia, que este trabajo tuvo que arreglar

`_indOrigenAssert` deriva los paneles «gateados por Modo Básico» del `showTab('x')` de cada
`.tab-btn[data-mod]`. Con **dos** botones de congénitas los dos paneles quedaban cubiertos; con
**uno**, `tab-congenitas2` dejó de aparecer en esa derivación y el assert gritaba que
`ete_cia_dir` es alcanzable en Modo Básico — que es **falso**: su única puerta sigue detrás del
botón gateado.

Lo que quedó mal es la **derivación**, no el gateado. Se cierra por **estructura**: cualquier
control dentro de un panel ya gateado que navegue a otro panel lo gatea también, iterando hasta
que no cambie nada. **Verificado que el assert no se volvió laxo: 8 paneles gateados y 15 no**
(entre ellos `tab-pericardio`, `tab-otros` y `tab-datos`).

---

## 10 · Trampas de esta tanda

1. **El color de un `.tab-btn` no se lee en el mismo turno del clic.** Lleva
   `transition: all .15s`, así que `getComputedStyle().color` devuelve un valor **intermedio** de
   la animación —medido `rgb(62,153,154)` entre el teal y el gris— y la regla parece no ganar.
   **Costó dos diagnósticos falsos**, y uno llegué a escribirlo en un comentario del código
   («Chrome no revalida el estilo por un selector de atributo»): era **falso** y se corrigió.
   Se mide **después** de la transición y en **otra llamada** que el clic.
2. **Un medidor que navega se pisa a sí mismo.** El lector de las sub-pestañas de congénitas hacía
   `showTab('congenitas')` adentro, así que volvía a la primera pestaña después de cada clic e
   informaba «el clic no cambia de pestaña» sobre un mecanismo que funciona.
3. **Un A/B con otro ORDEN de grupos no se compara.** Informó 1076 campos contra 1059 y no era una
   diferencia del commit: el grupo del PDF integra un módulo y deja estado. **Remedir HEAD con los
   mismos grupos antes de sospechar.**
4. **El rail no se ve a 756 px**, que es el ancho al que corre la suite. Un caso que mida su
   geometría ahí cae sobre un rail perfecto: lo que se mide es el **orden** (independiente del
   ancho) y el **drawer**, que es la puerta real a ese ancho.
5. **Las dos sub-pestañas de Otros son excluyentes**, así que medir controles de las dos a la vez
   deja los de la inactiva en 0×0.
6. **El acento grave, seis veces**, y el salto de línea dentro de un literal de cadena una vez
   —que mata el caso por excepción sin decir qué condición falló—. `check_backticks.py` dio la
   línea exacta todas las veces; `node --check` apuntaba a la apertura del template.

---

## 10b · La regla del celular que escondía las barras nuevas

`@media(max-width:768px){ .subtabs-wrap .tabs-row{ display:none !important } }` existe para las
**tabs avanzadas**, que por debajo de 768 px se reemplazan por el `<select>` `#ecoAdvSelect`.
Las barras que este trabajo agregó —las dos de «Otros» y las dos de congénitas— reusan
`.subtabs-wrap`/`.tabs-row` **por su estilo** y no tienen ningún reemplazo, así que esa regla las
dejaba invisibles en celular: **el médico quedaba atrapado en la sub-pestaña activa, sin puerta a
la otra**.

⚠️ **Lo destapó MIRAR una captura a 360 px.** La medición numérica daba todo bien, y es coherente:
el panel activo se ve perfecto y lo que falta es la **puerta** a la otra, que ninguna condición
sobre el panel activo puede ver. Es para lo que están las capturas.

Se cerró **acotando** la regla original —`:not(.otr-subbar):not(.cc-subbar)`— y no peleándole con
otro `!important`: lo que se sigue escondiendo es exactamente lo que tiene reemplazo. **Medido:
el chequeo de celular no se movió ni un hallazgo** (66 a 360 px y 76 a 390 px con 17 ALTA cada
uno), porque los botones de sub-pestaña ya cumplen el piso táctil de 44 px.

---

## 11 · Cómo medir esta zona

```bash
node scripts/_probe_btabs.mjs --solo rail            # los dos conteos, en los dos motores
node scripts/_probe_btabs.mjs --solo peri,otros      # los once campos y el ASIA
node scripts/_probe_btabs.mjs --solo pulm,infpul     # el inventario y el informe
node scripts/_probe_btabs.mjs --solo fono,calc,cc    # lo retirado y lo mudado
node scripts/_probe_btabs.mjs --solo pdf             # las seis plantillas, generadas de verdad
node scripts/_probe_btabs.mjs --solo ctrl,excel --file /tmp/head.html   # el A/B
node scripts/_probe_btabs.mjs --solo maqueta --dest /tmp/bcap           # 5 anchos x 2 temas
node scripts/_probe_btabs.mjs --solo drawer,otrclic                     # el drawer y el color
node scripts/test_clinico.mjs --solo TC-509
```
