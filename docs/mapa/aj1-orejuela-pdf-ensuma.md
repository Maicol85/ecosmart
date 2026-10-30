# Mapa de la TANDA AJUSTES-1 (2026-10-30)

Cinco commits de código. Qué mueve cada uno, quién es su dueño, qué se midió y qué se paró.
Los números de línea NO se guardan a propósito: la línea cambia en cada edición, el nombre de
la función no.

> ⚠️ No confundir con `docs/mapa/aj1-ajustes.md`, que es la tanda **AJ1** del 23/10 (cortes del
> VD, strain sin sexo, coartación reparada). Esta es **AJUSTES-1**, del 30/10.

---

## 1 · La orejuela, sin recomendaciones y sin ruido

Cuatro decisiones del médico del 30/10, las cuatro medidas contra HEAD.

| | dueño | HEAD | hoy |
|---|---|---|---|
| **1a** rótulo del cactus | el `<option>` de `#oai_morfologia` | `Cactus — riesgo intermedio` | `Cactus` |
| **1b** nota de complejidad | `generarInforme`, párrafo 2 del ETE | `… Considerar mayor complejidad para el cierre percutáneo.` | la oración termina en los lóbulos |
| **1c** pastilla | `calcOAI` → `#oai-elegibilidad` | `NO apto — trombo presente` | `Medidas publicadas — sin veredicto de aptitud` |
| **1d** recuadro del Doppler | `oaiEsqSVG` | siempre, con «sin velocidad cargada» | sólo con velocidad; el lienzo se acorta |

**1a — el `value` no se toca.** Es campo guardado, viaja al Excel y vive en los estudios ya
guardados. Lo que cambia es el rótulo.

⚠️ **Las otras DOS superficies que nombran las cuatro morfologías ya no le daban riesgo al
cactus**: la ficha `ref-oai` de Referencias y la entrada «Morfología» de `OAI_GLOBO` dicen «ala
de pollo (menor riesgo) · coliflor (mayor riesgo) · cactus · manga de viento». El `<option>` era
la única que lo afirmaba.

⚠️ **«Manga de viento — riesgo intermedio» sigue diciéndolo**, y no se tocó: la orden nombra sólo
el cactus, y cambiar un rótulo clínico que no nombra es decisión de Maicol → `AJ1-a`.

**1b — con la frase se va su gate.** El `oLob === '3' && oTrombo !== 'si' && oTrombo !== 'sospecha'`
existía para que la nota no apareciera al lado del veredicto de aptitud del párrafo 3; ese
veredicto ya no existe desde el COR-1a, así que el gate no gobierna nada.

⚠️ **La frase NO existía en la Evidencia ni en Referencias** —censado el documento entero: su
única aparición era el papel—. O sea que el contenido **se pierde**. La orden la rotula «si
existe», y no existe → `AJ1-b`.

**1c — la cascada cae sola donde corresponde.** Retirando la rama del trombo, con medidas dice
«Medidas publicadas — sin veredicto de aptitud» y sin ellas «Completar mediciones». Cierra `E-d`.
El hecho del trombo sigue por tres caminos que no se tocan: la fila «Trombo» del recuadro de
hallazgos, la oración del informe («Orejuela izquierda con trombo confirmado») y la Evidencia,
con Meier 2014, folio 1401.

**1d — un dueño único del alto, `_oaiEsqAlto()`.** El alto lo necesitan TRES lugares: el emisor
(`oaiEsqSVG`) y los DOS rasterizadores —el del botón «Incluir en el PDF» y el del guardado
automático diferido—, que rasterizan al doble. Con el alto escrito tres veces, la imagen guardada
saldría con el lienzo de 350 y el dibujo de 262 reescalado dentro, o recortada.

⚠️ **El 262 no es un número elegido a ojo.** El elemento más bajo del dibujo es el rótulo «VI»,
con su línea de base en y=246 y cuerpo 10, o sea descendentes hasta ~250. El recuadro del Doppler
ocupaba y 276..342 del lienzo de 350.

---

## 2 · El PDF: sin repetir la orejuela, y la VAB con su resumen al costado

### 2a — el dibujo de la orejuela

**La regla tiene dos lados**, y los dos los decide `generarPDFReal`:

| | el informe incluye la sección de la orejuela | el dibujo |
|---|---|---|
| **sí** (`amiloIntegrar('oai')`) | la tabla «Mediciones de la orejuela izquierda» va a la hoja del ETE | **junto a esa tabla**, a su derecha, y **fuera** de «Imágenes del estudio» |
| **no** | no hay tabla | en «Imágenes del estudio», con el **resumen corto** al lado |

**El motor:** `amiloDibujarSecciones` aprendió a llevar `sec.img = {dataURL, w, h}`.

⚠️ **El ancho útil viaja en CADA FILA (`f.w`) y no en una variable del bucle.** `plan()` corre
hasta SIETE veces —una por cuerpo de letra probado— y el dibujo es otro recorrido: una variable
compartida dejaría la tabla medida a un ancho y dibujada a otro, que es exactamente el defecto
que esa función ya documenta haber cerrado con la escala de la fuente.

⚠️ **Toda la sección va angosta, no sólo las filas que caen al lado del dibujo.** La tabla de la
orejuela mide nueve filas —unos 39 mm— contra unos 57 del dibujo, así que la distinción no se
puede observar; y hacerla dependería del alto, que es justo lo que `plan()` todavía no sabe
cuando parte el texto.

⚠️ **El slot NO se toca.** `_oaiSlotUsado` es el **índice** que la página de imágenes saltea;
`imgSlots` queda como estaba, así que el estudio se guarda igual y la fila de miniaturas lo sigue
mostrando. Sacarlo de la lista habría sido borrar una imagen del estudio para resolver un
problema de maquetación.

**El resumen corto es `oaiResumenPDF()`**, y sale **sin etiquetas de riesgo ni de aptitud**:

| fila | de dónde sale |
|---|---|
| Morfología (con los lóbulos) | **`_oaiMorfCorta()`**, que corta la cola «— menor riesgo tromboembólico» del `<option>` |
| Ostium · Profundidad · Vel. de vaciamiento | los campos |
| Contraste espontáneo · Trombo | `_amSelTxt` |
| Insuficiencia mitral | **`_emRegurgGrado('im_grado')`**, el MISMO dueño que el dibujo consume por `_oaiImGrado`, con las palabras de `_CC_GRADO` |
| Carpentier | `vm_carp` |

Sin datos devuelve una lista vacía y **no se dibuja resumen**, que es el «si no hay datos, sin
resumen» de la orden.

### 2b — la VAB

El dibujo baja de **70 a 48 mm** y pasa al margen izquierdo; la tabla va a su derecha, **a la
misma altura**. Los textos son los mismos: `vabPdfFilas()` sigue siendo el dueño.

### Lo medido, con coordenadas

`scripts/_probe_aj1pdf.mjs` registra **coordenadas**, no sólo textos, y existe por eso: el A/B
heredado guarda el texto de cada `doc.text` y la cantidad de figuras, así que un cambio de
composición que no toca una palabra **le sale idéntico**. Medido: el A/B del commit 2 daba UNA
sola diferencia y ni la VAB ni el resumen aparecían.

| escena | HEAD | hoy |
|---|---|---|
| `orejETE` | tabla en la página 1, dibujo en la 2 | **una página menos**; dibujo en `146,30 55×56,6` junto a su tabla |
| `orejSola` | dibujo solo | dibujo + **8 filas de resumen** en x=108 |
| `orejPela` | dibujo solo | igual: sin datos no hay resumen |
| `orejTabla` | tabla sin dibujo | idéntico (control negativo) |
| `vab` | dibujo 70×70 centrado, tabla debajo; bloque **100,6 mm** | dibujo 48×48 a la izquierda, tabla a 65 mm a la misma altura; bloque **53,6 mm** |
| `vabOff` · `ajeno` | nada | nada |

⚠️ **CONTRACTILIDAD Y SGL NO SE TOCARON, y se verificó por qué.** Su resumen va **debajo** del
dibujo —«cada una con su imagen arriba y su texto debajo»—, con la leyenda de colores al costado
en 34 mm reservados. No tienen el resumen al lado, así que la orden manda reportarlo → `AJ1-c`.

---

## 3 · El EN SUMA nombra la válvula aórtica bicúspide

**El dueño:** `vabSumaFrase()`, al lado de `vabFraseValv`.

| escena | HEAD | hoy |
|---|---|---|
| bicúspide sola | `Estudio sin alteraciones estructurales ni funcionales significativas.` | `Válvula aórtica bicúspide (fenotipo R-L, rafe calcificado, cúspides simétricas).` |
| + raíz dilatada | `Dilatación raíz aórtica (43 mm).` | `Válvula aórtica bicúspide (…), con dilatación de la raíz aórtica (43 mm).` |
| + estenosis graduada | `EAo moderada.` · `Dilatación…` | las dos líneas iguales, y la de la válvula **sin** cláusula de función |
| **sin** bicúspide | `Dilatación raíz aórtica (43 mm).` | **idéntica** |

⚠️ **La compuerta es la MORFOLOGÍA, no «Integrar al informe».** La línea vieja
(`ccSumaLinea('vab')`) sólo sale con la sección integrada, y el caso que el médico describe es
una bicúspide cargada en **Válvulas** con la sección de la VAB sin tocar.

⚠️ **Se dice UNA sola vez.** `ccSumaLinea('vab')` deja de describir cuando `vabSumaFrase()`
publicó. Lo que esa línea **sigue** publicando es su `dx`: la discrepancia con la morfología de
Válvulas, las medidas fuera de rango y la aorta sin medir, que son avisos sobre el estado del
registro y no descripciones de la válvula.

⚠️ **Con dos segmentos dilatados se une sólo al PRIMERO**; los demás salen como siempre.

⚠️ **«sin estenosis ni insuficiencia» sólo aparece con la válvula EVALUADA**, y es regla propia
de `vabFuncionDerivada`, que devuelve `null` —no `'normal'`— cuando ninguna de las dos lesiones
tiene dato. No se debilitó: afirmar «sin estenosis ni insuficiencia» sobre una válvula que nadie
graduó sería una afirmación nueva en una superficie firmada. El ejemplo literal de la orden sale
con flujo aórtico cargado.

**La redacción no se reescribió**: sale de `VAB_SUMA_FENO`, `VAB_INF_RAFE`, `VAB_INF_DOSVELOS`,
`VAB_INF_CUSPIDES` y `VAB_FUNC_TXT`, las mismas constantes que el informe y el resumen de
pantalla.

---

## 4 · La frase del gradiente, con su fuente

**Lo que dice la fuente, leído en imagen y con el folio comprobado en el pie impreso** (hoja 24 →
«164 Mukherjee, M et al»; hoja 25 → «Mukherjee, M et al 165»):

- **Folio 164:** «In severe PH with right heart failure, reduced RV contractility and decreased
  PA compliance impair the ability of the RV to generate sufficient force, resulting in a
  diminished RV-PA pressure gradient and unreliable RVSP measurements.»
- **Tabla 5, folio 165**, «Common sources of error for hemodynamic assessment»: primera fila
  «Significant RV failure and contractile dysfunction», con su **única** marca en la columna
  «Underestimation».

El rótulo pasa de «CRITERIO DE ECOSMART — sin fuente verificada en la biblioteca» a **«CRITERIO
DE ECOSMART, respaldado en parte por la ASE 2025»**, en el ⓘ «El TRIV del ventrículo derecho» y
en la Evidencia de HTP (`_indHTP`, bloque «Lo que esta aplicación agrega y la guía no publica»),
y la entrada cita `aseDer2025`.

⚠️ **EL RESPALDO ES PARCIAL Y SE DICEN LAS TRES SALVEDADES**, porque citar la fuente sin ellas la
haría respaldar algo que no dice:
1. la fuente habla de falla **significativa** del ventrículo derecho, y la app publica la frase
   con cualquiera de los cinco parámetros de `vdDisfPresente()`;
2. el folio 164 nombra el gradiente **ventrículo derecho-arteria pulmonar**, no el de aurícula
   derecha a ventrículo derecho que la frase menciona; a ese lo sostiene la Tabla 5, que **no
   nombra ningún gradiente**. Esta salvedad no estaba en la orden: salió de leer el folio;
3. el «probablemente» es una inferencia del médico.

⚠️ **La frase del papel no cambia.** El informe firmado no lleva citas ni notas metodológicas.

⚠️ **El OTRO «sin fuente verificada» de esa misma zona sigue en pie**, y es correcto: el corte de
75 ms del TRIV viene de un consenso y de un estudio comparado con ecocardiografía, ninguno de los
dos en la biblioteca.

---

## 5 · La fila de miniaturas de lo que va al PDF

**Dónde:** dentro de la tarjeta «✅ En Suma / Conclusión», debajo del recuadro del caso de interés
y antes de «🔄 Regenerar Informe». `#inf-min-fila`, pintada por `infMinPintar()`.

⚠️ **`style.display = 'block'` y NO `''`.** El `display:none` de fábrica lo pone la **hoja de
estilos**, y vaciar el estilo en línea devuelve el control a la hoja: la fila quedaba oculta con
sus miniaturas adentro. Medido —la sonda informaba «oculta | n=1»—.

### Dónde vive hoy la inclusión y el orden (respuesta al punto 5d)

Son **dos** mecanismos distintos y no se unificaron:

| | dónde vive | orden | ¿campo guardado? |
|---|---|---|---|
| capturas y **esquema de la orejuela** | `imgSlots`, en memoria; a IndexedDB (`ceibomed_img`, lista `imgs`, por uuid) si Config está prendido y el estudio se guarda | el del array, **y es el de impresión** | no: ni campo del formulario ni columna de Excel |
| diagramas de **toggle** | un `input` oculto por diagrama, que **sí** es campo guardado y ya existía: `contr_be_pdf`, `sgl_be_pdf`, `vab_pdf`, `ete_qx_pdf` | lo decide el código: cada uno tiene su sección | sí, preexistentes |
| jet post-TAVI | la casilla `ete_tavi_incluir_chk` | ídem | sí, preexistente |
| captura del 3D | `window.lv3dCapturaParaPDF()`, no se persiste | ídem | no |

**Ningún campo guardado nuevo.** Reordenar los **diagramas** sí exigiría inventar un orden y
persistirlo, así que esa parte se paró → `AJ1-d`.

### Las acciones

- **La ✕ de una captura marca `noPdf` en el slot** —una propiedad del objeto, que ya se persiste
  con él—, **no la borra**. La imagen sigue en «🖼️ Imágenes del estudio» con un cartel «Fuera del
  PDF» y un botón «Incluir en el PDF»: sin ese botón la promesa del texto de ayuda sería falsa.
  Un registro viejo no trae la marca, así que abre incluido, igual que hoy.
  ⚠️ **Y `noPdf` NO VIAJA AL DISCO**: las dos puertas —`CeiboImg.guardar` e `imgRestaurar`— son
  allowlists explícitas que no lo incluyen, así que la exclusión vale para la **sesión**. La
  imagen se guarda igual; lo que no sobrevive es el haberla sacado del papel → `AJ1-g`.
- **El orden de las capturas** se cambia arrastrando o con **◀ ▶**, que son botones de verdad,
  enfocables y con `aria-label`. El arrastre mueve **de a un paso** para que el resultado sea el
  mismo que el de las flechas: dos mecanismos que reordenan distinto es la forma de que la
  pantalla y el papel discrepen.
- **Los diagramas no se reordenan** y no llevan flechas.

### Los cuatro enganches, y por qué son cuatro

Cada uno cubre un disparador que los otros no ven, y se midió:

| enganche | qué cubre |
|---|---|
| `_pdfToggleBtnState` | los cuatro botones de toggle. Un clic en un botón **no despacha `input`**, así que el barrido de espejos no se entera |
| `imgRender` | todo lo que mueve `imgSlots`: agregar o borrar una captura, incluir o quitar el esquema de la orejuela, cambiar la calidad |
| `ESPEJOS_VIVOS` | la casilla del jet post-TAVI y la captura del 3D, que no pasan por los dos anteriores |
| `RECALC_MODULOS` | el embudo de restauración: abrir un estudio guardado y «Nuevo estudio», que pueblan asignando `.value` |

`infMinPintar` **sólo pinta** —lee `imgSlots`, seis compuertas y nada más, y escribe un `<div>`
sin id de campo—, que es la regla con la que `ESPEJOS_VIVOS` excluye a `popSync` y a `calcVD`.

### Lo medido con gestos reales

`scripts/_probe_aj1min.mjs` clickea los botones, no llama a las funciones.

| paso | fila | `imgSlots` | capturas en el PDF |
|---|---|---|---|
| vacío | oculta, 0 | vacío | — |
| 3 capturas + 2 diagramas | visible, 5 | `0:A 1:B 2:C 3:esq` | A, B, C |
| ▶ en la 1ª | visible, 5 | `0:B 1:A 2:C 3:esq` | **B, A, C** |
| ✕ en la 1ª | visible, 4 | `0:B/noPdf 1:A 2:C` | **A, C** |
| «Incluir» en la grilla | visible, 5 | `0:B 1:A 2:C 3:esq` | B, A, C |
| ✕ en «Bicúspide» | visible, 4 | igual | `vabPdfOn` pasa a `false` |
| «Nuevo estudio» | oculta, 0 | vacío | — |

---

## Las sondas de esta tanda

| archivo | qué mide |
|---|---|
| `scripts/_probe_aj1ab.mjs` | el A/B de superficies, 29 escenas, con los denominadores de las cinco zonas |
| `scripts/_ab_aj1diff.mjs` | el comparador, que separa superficie firmada de pantalla |
| `scripts/_probe_aj1pdf.mjs` | la **geometría** del PDF generado de verdad (commit 2) |
| `scripts/_probe_aj1min.mjs` | la fila de miniaturas, con gestos reales (commit 5) |
| `scripts/_mut_aj1.py` | las **14 mutaciones dirigidas**, en worktree y con guarda de md5 |
| `scripts/_probe_ajustes1wk.mjs` | los dos motores, seis anchos y dos temas |

⚠️ **TRES de las 14 mutaciones NO revierten nada: la aplican DE MÁS.** La 06 hace que el recuadro
del Doppler no se dibuje **nunca** —ni con velocidad cargada—, la 09 que el resumen de la
orejuela salga también sobre un estudio sin un solo dato, y la 12 que la frase de la bicúspide se
publique sobre una válvula que no lo es. Existen porque las condiciones que las matan son
**controles negativos**.

⚠️ **La 05 rompe el dueño único por un solo lado, a propósito:** el emisor deja de acortar el
lienzo y `_oaiEsqAlto()` sigue devolviendo 262. Es la mutación que prueba que tener el alto
escrito en dos lugares produce una imagen reescalada, y la mata `(A9)`, que compara el alto del
SVG de la pantalla contra el dueño.

⚠️ **La 10 rompe las dos mitades de la maqueta de la VAB a la vez** —el ancho del dibujo y la
columna de la tabla—, que es la lección del D-11: con una sola rota, la otra la tapa.

## Las trampas que esta tanda pagó

1. **Incluir el esquema en el PDF es un INTERRUPTOR y `imgSlots` sobrevive entre escenas.** La
   escena `aPdfOrejETE` dejaba el slot puesto y la siguiente, que pedía lo mismo, **lo sacaba**.
   El volcado decía «0 vivo(s)» y el A/B daba cero sobre esa escena sin que eso probara nada. Es
   la misma trampa del botón de forma de la demo que la tanda CORRECCIONES documenta. El montaje
   quita siempre antes de incluir.
2. **Un `<select>` al que se le asigna un `value` inexistente se queda en cadena vacía SIN
   error.** Las escenas de la VAB tenían `va_morf: 'Bicuspide'` sin tilde, `vab_tipo: 'rl'` en
   vez de `fused_rl`, `vab_rafe: 'calcificado'` en vez de `si` y `vab_simetria: 'sim'` en vez de
   `simetrica`: el denominador salía `vaMorf:""` y ninguna escena llegaba a la zona.
3. **Los tres PNG de prueba terminan igual.** `BJRU5ErkJggg==` es la cola de todo PNG, así que
   con `slice(-12)` las tres capturas salían con la misma firma y el orden de impresión no se
   podía distinguir. La rebanada va al medio.
4. **El acento grave dentro de un comentario**, tres veces: en el template de `MONTAR` de la
   sonda, en el de `MEDIR` y en el cuerpo de dos casos de la suite. `node --check` sobre el
   `.mjs` caza los dos primeros; el del caso aparece como `SyntaxError: missing ) after argument
   list` apuntando al `caso(` que está decenas de líneas antes.
5. **`[data-min-tipo=\"captura\"]` dentro de una cadena de comillas dobles** termina la cadena.
   Un valor de atributo **sin comillas** es un identificador CSS válido y evita el escape.
6. **La marca de la sección del ETE es `grupo === 'ete'`, no una propiedad `ete`.** El
   denominador filtrado por `x.ete` salía vacío en las dos escenas que sí tienen la tabla en el
   PDF, o sea que decía «no hay hoja de ETE» sobre un PDF que la trae.
7. **Dos tandas distintas con la misma sigla.** `scripts/_probe_aj1wk.mjs` **ya existía**: es
   la sonda de dos motores de la tanda **AJ1** del 23/10 (commit `92198c3`). Escribir la de
   esta tanda con ese nombre la sobrescribió; se restauró desde HEAD byte por byte —10.139
   bytes, verificado— y la de esta tanda se llama **`_probe_ajustes1wk.mjs`**. El mismo cuidado
   vale para el mapa: `aj1-ajustes.md` es de aquella tanda. Los otros cinco nombres
   (`_probe_aj1ab`, `_ab_aj1diff`, `_probe_aj1pdf`, `_probe_aj1min`, `_mut_aj1`) se censaron
   contra HEAD y **ninguno existía**.
8. **`/OREJUELA IZQUIERDA/i` engancha la oración del cuerpo del informe** —«Orejuela izquierda:
   ostium 26 mm…»—, que cae en otra página: la sonda informaba que la tabla estaba en la página 0
   cuando la hoja del ETE es otra. La comparación va exacta y sensible a mayúsculas.
