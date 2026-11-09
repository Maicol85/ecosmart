# Mapa — los catorce textos de la tanda PANT-27 (2026-11-09)

**Qué cubre.** Dónde vive cada uno de los catorce textos que el médico reescribió, cómo está
escrito, en qué condición se ve y qué lo fija. No lleva números de línea a propósito: la línea
cambia en cada edición, el nombre de la función no.

El texto completo de **antes** de cada uno, con sus líneas al abrir la tanda, está en
`docs/INVENTARIO_TEXTOS_P27.md`. Lo que se paró y lo que se cerró, en `docs/PENDIENTES.md` →
**P27-a**.

**Ningún cálculo, corte, regla de combinación ni condición de pantalla se movió.** Lo que
cambió es el texto visible, y nada más.

---

## 1 · Las siete notas de la estenosis mitral — `EM_NOTAS`

**Dueño único: `EM_NOTAS(US, etio, D)`**, el detalle plegado de la sección «Estenosis mitral»
del panel de Evidencia. `_indEM` la llama y publica su resultado en `notas`; el detalle lo
pinta `_indDetalleHTML`, que pasa cada texto por `_critEsc`.

**Cómo llegar en pantalla:** cargar una estenosis mitral **nativa**, abrir el panel de
Evidencia, abrir la sección «Estenosis mitral» y desplegar su «ⓘ Ver detalle».

| # | de qué habla la nota | lo que decía | lo que dice |
|---|---|---|---|
| T1 | el operador del área | relataba qué operador usa cada parte del documento y cerraba con «Queda declarado, no corregido» | afirma el área que la aplicación usa, y nombra la guía |
| T2 | los cortes de 5 y 10 mmHg | contaba de qué documento **no** salen y cerraba con «Queda declarado, no corregido» | los declara **criterio de la aplicación** |
| T3 | la palabra de la guía | traía la expresión en inglés y comparaba la palabra de la guía con la del informe | dice la palabra de la guía con su folio y lo que la define |
| T4 | las características desfavorables | comparaba las dos notas del documento, citando las dos en inglés | afirma lo que la guía dice, en una oración |
| T5 | el corte del score | decía que el material suplementario **no está** en el documento consultado | dice que la guía **remite** la definición a su material suplementario |
| T6 | las contraindicaciones | escribía «MÁS QUE LEVE —no «moderada o más»—» | escribe «más que leve», sin la aposición |
| T7 | las excepciones | «Las dos excepciones de esa tabla», la orejuela con aposición y «1-3 meses» | «Excepciones de la Tabla 8 (folio 4682)», «con trombo en la orejuela», «de 1 a 3 meses» |

### Lo que NO se movió, y hay que cuidar

- **Las variables.** `u` —el área de corte, `_indNum(US, 1)`, con **coma decimal**— la usan
  **CUATRO** notas: T1, T6, T7 y la de guías previas. El **8** del score sale de
  `EM_CRIT_2025.score_desfav` y se **interpola**, no se escribe a mano.
- **Las citas.** Las **seis** notas de la guía vigente siguen con `refs:['esc2025vc']`. **T2 no
  lleva corchete y no puede llevarlo**: la regla de la sección se lo prohíbe, porque la ASE 2023
  es un documento de cardiopatía reumática y ahí la etiología no es reumática.
- **La compuerta de etiología de T2** es `(etio && etio !== 'reumatica')`. Las dos partes
  importan: con etiología reumática la nota **no sale**, y **sin etiología cargada tampoco**.
  `etio` se deriva de `vm_morf` en `_indEM`: `null` si está vacía o «Normal», `'reumatica'` si es
  `EM_ETIO_CMP`, `'otra'` en cualquier otro caso.
- **La nota hermana de T2**, la de etiología **reumática**, **no se tocó** y sigue comparando dos
  fuentes. Está declarada en **P27-a § 3 (b)**.

**Lo fija `TC-765`**, con sus siete bloques: las frases exactas, la ausencia de las nueve
expresiones viejas, el área con tres umbrales, el score por el cuerpo de la función, la
compuerta en tres escenas, el texto **en pantalla** con el detalle abierto, y el papel.

---

## 2 · Fontan — la entrada `fon.ev.sangrado`

**Dónde:** registro **`FON_PREG`**, entrada de clave `fon.ev.sangrado`. La consume `_indFON` y
la pinta **`_indPregNota`**.

**Cómo se arma la fila.** `_indPregNota` concatena las partes con `partes.join('. ')`:

```
guía + ' · ' + rec   →   nota   →   'ESC 2020 (anterior): ' + ref   →   'Nota: ' + tramo   →   sinDato
```

- **La propiedad `tramo` se quitó.** Su línea está **guardada por un `if`**, así que no queda
  rótulo huérfano, ni línea vacía, ni error. Medido en pantalla.
- **El texto de `ref` NO lleva punto final**: el separador del `join` lo agrega. Ponerle uno
  daría dos puntos seguidos cuando la pregunta está sin contestar.
- **La convención del registro es SIN TILDES**, en sus trece entradas, y se respetó. Está
  declarado en **P27-a § 4**.

**Lo fija `TC-766`**, bloques (A) y (B): el dato, el texto en pantalla, la ausencia del rótulo
huérfano, y la pregunta contestada en los **dos** sentidos por sus propios botones —con el
botón marcado como denominador de que el clic entró—.

⚠️ **El nodo de la fila se destruye al contestar**: el panel se repinta. Los botones se vuelven
a buscar en vivo, o los dos clics caen en un árbol desprendido y las dos respuestas salen
idénticas, que se lee igual que «contesta igual en los dos sentidos».

---

## 3 · El globo de la calculadora de TAVI — `VINFO['tavi-calc']`

**Dónde:** registro **`VINFO`**, clave `tavi-calc`, título «La calcificación de la válvula
aórtica», ancho 460. Lo abre el botón ⓘ del campo `ete_tavi_calc`.

**Qué cambió:** **sólo el último párrafo**. Decía que la guía usa la palabra «severa» sin
definirla y nombraba su tabla y su folio; hoy afirma la calcificación severa por tomografía y
la progresión de la velocidad máxima. **Los 0,3 m/s por año no se perdieron.** Lo que viene
antes queda idéntico: **2.588 caracteres** de los dos lados, medidos.

⚠️ **`showTab` no le da caja al botón.** El campo vive en `ete-seccion-tavi`, que nace
cerrada, y un botón sin caja no abre el globo: hay que abrir la pestaña **y** la sección. El
botón mide **44 × 44 px**.

**Cuatro frases más del mismo globo** rozan las reglas del 04/11 y del 08/11 y **no se
tocaron**: están listadas una por una en **P27-a § 3 (c)**.

**Lo fija `TC-766`**, bloque (C), incluida la condición (C4) de que lo anterior no se movió.

---

## 4 · El reverso diastólico de la aorta descendente — la ficha `ref-ia`

⚠️ **ESTO NO ESTÁ EN LA EVIDENCIA, Y LA ORDEN DE LA TANDA CREÍA QUE SÍ.** Vive en la **ficha de
Referencias `ref-ia`**, dentro de `ref-nativas`, en un `<div>` de prosa debajo de la tabla de
criterios. La medición que lo prueba está en **P27-a § 1 (a)**.

**Cómo llegar:** pestaña **Referencias** → subpestaña **Válvulas nativas** → ficha
**«Insuficiencia aórtica»**, que nace cerrada. `evRefPintar` sólo pinta al abrir su subpestaña.

**Qué cambió, en el orden del párrafo:**

| # | lo que decía | lo que dice |
|---|---|---|
| — | «El reverso diastólico de la aorta descendente se gradúa por su duración, y el VTI y la velocidad telediastólica la califican.» | **IDÉNTICO**: la primera oración no se tocó |
| T13 | la estructura con las tres expresiones **en inglés**, la Tabla 4 y la cita de Tribouilloy | la estructura **en castellano**, con la publicación completa y el folio 621 |
| T10 | «sale de la **Tabla 20-5 del libro de texto** … : libro de texto; **no figura en las guías de la biblioteca**» | «sale del libro «Ecocardiografía avanzada» (Moya Mur, capítulo 20).» |
| T11 | «se queda en moderada, que es el lado que no afirma la gravedad: la tabla escribe «<15» y «>15» y **deja ese valor sin definir**» | «Con 15 cm exactos la aplicación lo considera moderada.» |
| T12 | «Sin la duración **consignada**, … se muestran **y** no gradúan» | «Sin la duración, … se muestran **pero** no gradúan» |

**El marcado es el del lugar**: entidades HTML (`&oacute;`, `&laquo;`, `&iacute;`), negritas
`<b>` y la publicación en cursiva `<i>`. **La velocidad de 20 cm/s no se perdió.**

⚠️ **El párrafo de ARRIBA, que esta tanda no toca, cita a la ESC con «Holodiastolic flow
reversal in descending aorta (EDV ≥20 cm/s)» y su folio 4659.** Buscar las expresiones viejas
sobre la ficha **entera** da rojo sobre ese texto ajeno: se cuentan **dentro del bloque**.

⚠️ **La nota del reverso en la EVIDENCIA es otra superficie y NO se tocó.** Comparte el
contenido de T10 y T12 y hoy dice las cosas de otra forma. Está declarado en **P27-a § 3 (a)**
y lo fija **TC-767 (D1)**, que se pone rojo el día que alguien la cambie sin decidirlo.

**Lo fija `TC-767`**, con su control positivo de que la sonda sabe mirar la ficha entera.

---

## 5 · La cirugía ante el trombo protésico grande

**Dónde se sumó:** la **nota del ramal `tipo === 'mec'`** de la sección de prótesis mitral del
panel de Evidencia, que es el **único** lugar de la aplicación acotado a prótesis mecánica.

**La fuente:** ESC/EACTS 2025 final, sección **14.4.4.2**, hoja **64**, folio **4698**
comprobado en la cabecera impresa, leída **en imagen a 300 ppp**.

**Dónde NO se sumó, y por qué.** Las preguntas `prota.trombGrande` y `prott.trombGrande` **no
están acotadas por tipo de prótesis**, así que ahí la oración le prestaría a cualquier prótesis
lo que la fuente dice de una mecánica. **PARADAS**, en **P27-a § 2**.

**Lo que no se movió:** la frase que ya estaba, con su corte de «10 mm o más» y su cita en la
Figura 20 (hoja 65, folio 4699), y el cierre que declara que el tamaño del trombo y la clase
funcional no se registran en esta aplicación. **La oración nueva no repite el número del corte**,
así que el conteo de **siete** cadenas con «10 mm» en los cuatro registros —el que vigila
**TC-759**— no se mueve.

### Cómo llegar en pantalla, que tiene dos puertas

1. Prótesis **mitral mecánica** cargada en `vm_morf`.
2. En el panel: contestar **«Fuga periprotésica» → No** (`protm.peri`) **y** **«Disfunción
   atribuible a trombosis» → Sí** (`protm.tromb`).

⚠️ **Sin el primero la sección sale temprano** —publica «Falta un dato para aplicar la guía» y
**nunca llega al ramal del tipo de prótesis**—, así que medir ahí la oración da cero y parece
que no está. Y **la trombosis no es un campo del estudio**: es una pregunta del panel, que se
contesta por `data-ind-clin` y `data-ind-val`; buscar la fila por su rótulo elige la botonera de
la pregunta de al lado.

**Lo fija `TC-768`**, con su control negativo fuerte —la misma sección y la misma pregunta
contestada, con prótesis **biológica**— y el conteo de las siete cadenas.

---

## 6 · Las sondas y el barrido

| archivo | qué mide |
|---|---|
| `scripts/_probe_pant27em.mjs` | las siete notas de la estenosis mitral, en pantalla y en el objeto, con tres umbrales y tres etiologías |
| `scripts/_probe_pant27f9ia.mjs` | Fontan, el globo `tavi-calc` y la ficha `ref-ia`, con el control negativo de la nota de Evidencia |
| `scripts/_probe_pant27tromb.mjs` | la oración del trombo en tres escenas y tres secciones, y el censo de los cuatro registros |
| `scripts/_mut_pant27.py` | **40** mutaciones dirigidas, en worktree y nunca sobre el árbol vivo |

Las tres sondas aceptan `--file` y `--out`, así que el A/B corre **en serie sobre las mismas
escenas** contra una copia del árbol anterior puesta **dentro del proyecto** —las fuentes se
cargan por ruta relativa—.
