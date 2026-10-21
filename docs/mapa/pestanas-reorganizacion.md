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

---

# LAS CORRECCIONES — trabajo «B2» (2026-10-22)

El B dejó cuatro cosas que el médico corrigió después de probarlo en Safari. **Nada de acá cambia
un corte, un operador, una fórmula ni un texto clínico**: lo que se mueve son puertas, lo que se
unifica son dos módulos que decían lo mismo, y lo que cambia de formato es una clase de CSS.

## 12 · «Pericardio y pulmón»: un botón, dos barras apiladas

| elemento | antes (B) | ahora (B2) |
|---|---|---|
| botones de la columna izquierda | **12** | **11** |
| «Pericardio y masas» y «Eco pulmonar» | dos botones | **uno**: «⚪ Pericardio y pulmón» |
| panel | `#tab-pericardio` y `#tab-pulmonar` | **`#tab-pericardio`**, con las dos pantallas apiladas |
| `#tab-pulmonar` | existía | **no existe** |
| `data-mod` del botón | `pulmonar` | **ninguno**; la clave salió de `EE_MODULES` |

**El panel NO se renombra**, a propósito: `#tab-pericardio` es el id que `showTab`, el drawer,
`_indOrigenAssert` y los casos de la suite ya nombran.

⚠️ **EL BOTÓN VA SIN `data-mod`, Y ES LA DECISIÓN DE FONDO.** Medido en HEAD: en Modo Básico el
rail mostraba **11** botones —«Pericardio y masas» **sí**, «Eco pulmonar» **no**—. Con un botón
solo, dejarle el atributo lo escondería en Básico **y con él «Pericardio y masas»**, que el médico
hoy sí ve. Sin él nadie pierde nada y el Básico **recupera** el módulo pulmonar básico, que hasta
el B vivía en «Otros» (sin `data-mod`) y que el B le había quitado al meterlo en una pestaña
gateada. Está en `docs/PENDIENTES.md` → **B2-1**, con la salida para recuperar la casilla de
Config.

**Las dos barras usan `h2.card-head`**, que es el formato de las de Hemodinámica, y nacen
**cerradas**. Medido contra la de Hemodinámica, las ocho propiedades idénticas:
`bg rgb(35,40,64)` · `color rgb(126,200,227)` · 11px/700 · uppercase · `ls .88px` ·
`pad 8px 14px` · `border-bottom 1px rgb(42,48,80)`.

## 13 · El eco pulmonar unificado: un módulo donde había dos

| | módulo BÁSICO (`pul_*`) | módulo AVANZADO (`pua_*`) | unificado |
|---|---|---|---|
| derrame | `pul_derrame` si/no | `pua_derrame` ''/no/si | **`pua_derrame`** |
| tamaño | `pul_derrame_tam` mínimo/moderado/severo | **no existía** | **`pul_derrame_tam`** (mismo id) |
| Balik | `pul_balik` | `pua_balik` | **`pua_balik`** (con su globo ⓘ) |
| lado | `pul_derrame_lado` ''/derecho/izquierdo/bilateral | `pua_derrame_lado` unilateral derecho/… | **`pua_derrame_lado`** + «sin consignar» |
| tipo del derrame | no existía | `pua_derrame_tipo` libre/tabicado | **`pua_derrame_tipo`** + «sin consignar» |
| líneas B | `pul_lineasb` si/no | `pua_lineasb` ''/ausentes/presentes | **`pua_lineasb`** |
| patrón / cantidad | `pul_lineasb_pat` focal/difuso | `pua_lineasb_cant` focal/multiples/coalescentes + 6 zonas | **`pua_lineasb_cant`** |
| consolidación | `pul_consolidacion` si/no | `pua_consol` ''/no/si | **`pua_consol`** |
| broncograma | no existía | `pua_consol_bronco` con/sin/fluido | **`pua_consol_bronco`** + «sin consignar» |
| nota | `pul_consol_nota` | **no existía** | **`pul_consol_nota`** (mismo id) |
| deslizamiento, líneas A, punto pulmón | no existían | `pua_desliz`, `pua_desliz_lado`, `pua_lineasa`, `pua_punto` | igual |

**El avanzado es la base y del básico entra sólo lo que no tenía: el tamaño y la nota.** Esos dos
**conservan su id** porque no hay contraparte a la que traducirlos (`PENDIENTES.md` → B2-2).

### La migración, en `_migrarCamposLegacy`

```
pul_derrame = 'si'        -> pua_derrame = 'si'   (+ pua_balik, pua_derrame_lado)
pul_derrame_lado derecho  -> pua_derrame_lado 'unilateral derecho'  (izquierdo idem)
pul_lineasb = 'si'        -> pua_lineasb = 'presentes'  (+ pua_lineasb_cant)
pul_lineasb_pat difuso    -> pua_lineasb_cant 'multiples'   ·  focal -> 'focal'
pul_consolidacion = 'si'  -> pua_consol = 'si'
los seis pul_* se borran del objeto; pul_derrame_tam y pul_consol_nota NO se tocan
```

⚠️ **SÓLO SE TRADUCE EL VALOR POSITIVO**, y es lo que protege todo informe ya firmado: los tres
selects del básico nacían en `'no'`, así que ese valor lo trae **cada** estudio guardado. Ver
`PENDIENTES.md` → **B2-3**.
⚠️ **Y SÓLO SI EL DESTINO ESTÁ VACÍO**: desde el B los dos módulos vivían en la misma pestaña, así
que un estudio puede traer los dos. **El avanzado manda.**
⚠️ **LAS ZONAS NO SE INVENTAN**: quedan sin marcar, así que `pulAvDifuso` devuelve `null` y el
patrón se nombra **sin** el adjetivo «difuso» en vez de afirmarlo. Es la regla del ARR.

### El texto: un párrafo y una línea

`pulAvFrases` es el **dueño único** y lo consumen el informe y `amiloTextoPulmonar`. El bloque
**13b** del informe —el del básico— se retiró con el módulo, así que no hay dos listas que
duplicarse ni exclusión mutua que aplicar: con eso se fueron `PUL_PARES`, `pulBasicoHayDatos`,
`pulBasicoDominios`, `pulBasicoTexto`, `pulBasicoUI` y `pulAvanzadoCubreBasico`, **con sus
`window.*`** (una referencia de nivel superior a algo que ya no existe aborta el `<script>`
completo).

Las frases se unen con un espacio: **un párrafo** en el informe —con el «Patrón global» adentro— y
**una línea** en el EN SUMA. No se escribió una oración clínica nueva.

⚠️ **LOS TRES DEPENDIENTES GANARON «— sin consignar —»** y su cláusula se omite cuando está vacío.
Sin eso, un estudio migrado del básico publicaría «de aspecto libre», «bilateral» y «con
broncograma aéreo» por el valor de fábrica — hallazgos que nadie evaluó. **No cambia ningún texto
alcanzable antes del B2.**

## 14 · Otros: dos barras apiladas

Los dos botones de sub-pestaña salieron y las dos secciones quedaron apiladas, **cada una con la
barra que ya tenía**: queda un nivel y no dos. Se retiraron `otrSubTab`, `OTR_SUB_ORDEN`,
`_otrSubActiva`, su oyente de teclado, sus dos `window.*` y las tres reglas de CSS — incluida la
excepción `:not(.otr-subbar)` de la media query del celular, que el B había tenido que agregar
para que esa barra no se escondiera por debajo de 768 px. **Las de C. Congénitas se conservan.**

Medido a 360 px: las dos barras en **326 × 44** (piso táctil), cero scroll horizontal, en los dos
motores. El médico ya no queda atrapado en una sub-pestaña.

## 15 · Los botones de C. Congénitas

Llevan `tab-special`, la clase de los de la fila de arriba, en las **dos** copias de la barra.
⚠️ **MEDIDO ANTES DE TOCAR NADA: ya se veían igual.** `.subtabs-wrap .tab-btn` (0,2,1) le gana a
`.tab-special` (0,1,0) y los botones de arriba también viven dentro de un `.subtabs-wrap`, así que
las cinco declaraciones de esa clase no se aplican a ninguno de los dos. La clase se agrega igual
porque **ata los dos grupos**: cero cambio de píxel, medido. `PENDIENTES.md` → **B2-6**.

El estado activo sigue en **`cc-on`** y no en `.active`, que `showTab` barre.

## 16 · Trampas de esta tanda

1. **Un medidor que clickea deja el botón en `:hover` y `:focus`**, y `.subtabs-wrap .tab-btn:hover`
   cambia el color y el borde: la primera corrida informó tres diferencias falsas entre CC y la
   fila de arriba. Hay que **alejar el mouse y hacer `blur`** antes de medir el reposo, además de
   esperar la transición de `.15s` y medir en otra llamada.
2. **Y comparar el botón ACTIVO de CC contra uno EN REPOSO de arriba** da «distinto» sobre dos
   estados que no son comparables. Reposo con reposo, activo con activo.
3. **`fop_contraste` es un `<select>` si/no y no un checkbox**: preguntarle por `.checked` da
   siempre `false` y la condición sale roja sobre un espejo que funciona.
4. **Retirar un campo se lleva su globo ⓘ.** El del Balik vivía en `pul_balik`; lo destapó
   **TC-502**, que cuenta las tarjetas registradas sin botón, y no la lectura.
4b. **Y retirar un módulo deja vivos los avisos que hablaban de él.** La pantalla unificada seguía
   publicando «Al integrar este módulo, la sección básica de Ecografía Pulmonar se omite del
   informe para no duplicar los hallazgos» sobre una sección que ya no existe. **Ninguna medición
   de texto lo veía** —ese `<p>` no entra al informe— y lo cazó **mirar una captura a 390 px**.
5. **El acento grave, cuatro veces**, todas en comentarios míos dentro del cuerpo de un caso.
   `check_backticks.py` dio la línea exacta las cuatro; `node --check` apuntaba a la apertura del
   template.

## 17 · Cómo medir esta zona

```bash
node scripts/_probe_b2.mjs --solo rail,modos        # los once botones y los dos modos
node scripts/_probe_b2.mjs --solo barras,otros      # las cuatro barras y su color
node scripts/_probe_b2.mjs --solo pulm              # el inventario de la pantalla unificada
node scripts/_probe_b2.mjs --solo color             # CC contra la fila de arriba
node scripts/test_clinico.mjs --solo TC-511
```
