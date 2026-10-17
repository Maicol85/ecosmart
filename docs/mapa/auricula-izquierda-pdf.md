# Mapa — la AURÍCULA IZQUIERDA y las dos correcciones del PDF (tanda «H», 2026-10-16)

> **Mapa NUEVO por PARTICIÓN.** Medido con `wc -c` **ANTES** de escribir:
> `docs/mapa/informe-pdf-excel.md` estaba en **30,6 KB** y esta sección lo cruzaba. Lo que entró
> allá es un puntero.
> Sin números de línea a propósito: la línea cambia en cada edición, el nombre de la función no.

---

## 1 · Las TRES preguntas de la aurícula izquierda, y sus TRES dueños

La app no tiene **una** clasificación de la AI: tiene tres preguntas que no se mezclan.

| Pregunta | Dueño | Qué devuelve | Cortes |
|---|---|---|---|
| ¿El **diámetro AP** marca dilatación? | `aiDiamDilatado(d)` | `true` / `false` / `null` | `>= UMBRAL_AI_DIAM_DILATADO` (40 mm) |
| ¿El **área** marca dilatación? | `aiAreaDilatada(a)` | `true` / `false` / `null` | `> UMBRAL_AI_AREA_DILATADA` (20 cm²) |
| ¿**Qué tan severa**? | **`aiVolClasificar(idx)`** | una entrada de `AI_VOL_BANDAS`, o `null` | ver abajo |

Las dos primeras son **binarias y sin grado**: la guía no gradúa por diámetro ni por área. La
tercera es la única que gradúa, y por eso es la que **manda**.

### `AI_VOL_BANDAS` — el dueño que esta tanda creó

Vive al lado de `aiDiamDilatado`/`aiAreaDilatada`, que ya eran los dueños de las otras dos.

| clave | hasta | color | `adj` (lo que escribe el informe) | rótulo de la cápsula |
|---|---|---|---|---|
| `normal` | `UMBRAL_LAVI_DILATADO` (34) | `green` | `de dimensiones normales` | `Normal (≤34 ml/m²)` |
| `leve` | 41 | `yellow` | `levemente dilatada` | `Dilat. leve (35-41)` |
| `moderada` | 48 | `orange` | `moderadamente dilatada` | `Dilat. moderada (42-48)` |
| `severa` | `Infinity` | `red` | `severamente dilatada` | `Dilat. severa (>48)` |

`aiVolRotulo(b)` **deriva** el rótulo de las bandas. Antes estaba cableado (`'Dilat. leve (35-41)'`
con los números a mano) al lado de un corte que sí era constante: mover `UMBRAL_LAVI_DILATADO`
dejaba el rótulo mintiendo. El texto que sale hoy es **idéntico carácter por carácter** al de HEAD.

⚠️ **EL `+1` DE LOS RÓTULOS ASUME ENTEROS.** El límite real de «leve» es `> 34`, no `>= 35`, así
que un 34,5 cae en leve y el rótulo lo rotula «35-41». Es preexistente —el rótulo cableado decía
lo mismo— y es la misma trampa que `hviSeveridad` ya tiene escrita. **Lo que gradúa es la BANDA,
no el rótulo.**

⚠️ **LA CLAVE Y NO EL ADJETIVO** decide si la aurícula es normal. El informe lo resolvía con
`aiStr === 'de dimensiones normales'`, o sea comparando contra una frase del papel firmado:
cambiar esa redacción habría dado vuelta en silencio la rama de la discordancia y el EN SUMA.

---

## 2 · Dónde se clasifica la AI, superficie por superficie

| Lugar | Quién decide | Qué publica |
|---|---|---|
| Cápsula `ai-interp` (pestaña AI/VI) | **`aiVolClasificar`**, desde `calcAI` | el badge con su color y su rótulo |
| Cápsulas `ai-diam-interp` / `ai-area-interp` | `aiDiamDilatado` / `aiAreaDilatada` | binario, sin grado |
| Campo `ai-idx` | `calcAI` | `(vol / bsa).toFixed(1) + ' ml/m²'` |
| **Informe**, los tres estilos | **`aiVolClasificar`**, desde `generarInforme` bloque 4 | la frase, con el indexado entre paréntesis |
| **EN SUMA** | la misma banda (`adj`) | sólo si NO es normal |
| **PDF — tabla de datos** | **nadie**: imprime el valor y su referencia | `Vol. indexado` con `ref '<=34 ml/m2'` |
| **PDF — texto** | el informe ya generado (`sv('informe_texto')`) | lo mismo que el informe |
| **PPT** | **nadie**: imprime `Volumen AI` en ml | el valor crudo |
| **Excel** | **nadie**: cuatro columnas de VALOR | `Vol AI (LAVI) (ml/m²)` (derivada, vía `_labLavi`), `Diám. AP AI (mm)`, `Área AI (cm²)`, `Volumen AI (ml)` |
| **Laboratorio** | **SU PROPIA clasificación** | ver abajo |

⚠️ **EL LABORATORIO CLASIFICA POR SU CUENTA Y NO SE TOCÓ** (la orden lo prohíbe expresamente).
Son dos lecturas independientes:
* la fila «Dilatación AI» de `_LAB_HALLAZGOS` es un **regex sobre el TEXTO** del informe
  (`/dilataci[oó]n.{0,10}auricular|AI\s+(?:dilata|agrand)/i`), no sobre el dato;
* `_labLavi(inf)` recalcula el indexado desde `ai_vol`, `peso` y `talla` con Mosteller, y la fila
  «Vol AI elevado sin función diastólica documentada» corta en `> UMBRAL_LAVI_DILATADO`.
Como esta tanda **no cambia ni una letra del informe**, el recuento del Laboratorio tampoco se
mueve. `docs/PENDIENTES.md` → **H-3**.

---

## 3 · La regla del informe, escena por escena (no cambió: estaba implementada)

Medido con teclas reales en las 16 escenas de `scripts/_probe_h.mjs --solo ai`.

| Escena | Informe (estilo estándar) | EN SUMA |
|---|---|---|
| sin ningún dato | `Aurícula izquierda de dimensiones normales.` | — |
| volumen normal solo | `… de dimensiones normales (Vol Index 34.0 ml/m²).` | — |
| volumen normal + DAP dilatado | lo mismo **+ la línea de discordancia** | — |
| volumen normal + área dilatada | lo mismo **+ la discordancia nombrando el área** | — |
| volumen normal + los dos | lo mismo **+ la discordancia nombrando las dos** | — |
| volumen leve / moderado / severo | `… levemente/moderadamente/severamente dilatada (Vol Index N ml/m²).` | `AI … dilatada (Vol Index N ml/m²).` |
| volumen severo + área normal | el grado, igual | el grado, igual |
| **sin volumen**, DAP dilatado | `Aurícula izquierda dilatada (diámetro AP 50 mm).` | `AI dilatada (diámetro AP 50 mm).` |
| **sin volumen**, área dilatada | `Aurícula izquierda dilatada (área 25 cm²).` | `AI dilatada (área 25 cm²).` |
| **sin volumen**, DAP normal | `… de dimensiones normales (diámetro AP 38 mm).` | — |
| **volumen SIN superficie corporal** | se trata **como sin volumen** | lo que corresponda al DAP o al área |

⚠️ **CON EL VOLUMEN MEDIDO Y SIN SUPERFICIE CORPORAL, Y SIN NINGUNA OTRA MEDICIÓN, EL INFORME
AFIRMA NORMALIDAD.** Medido: con `ai_vol = 98` y sin peso ni talla, el informe firmado dice
«Aurícula izquierda de dimensiones normales.» sobre una aurícula cuyo único dato es un volumen
que, indexado, sería severo. Es **preexistente** y es el reverso de lo que la rama `aiGeoFuera` ya
cierra para los valores ilegibles —«la negación necesita evidencia de haber podido leer algo»—.
La orden mandaba tratarlo como «sin volumen» (que es lo que hace) **y reportarlo**, así que no se
corrigió. `docs/PENDIENTES.md` → **H-1**. TC-487 lo fija como **límite declarado**, para que el
día que se arregle el caso lo note.

---

## 4 · El PDF — el colapso de la VCI lleva su unidad

El `<select>` `vci_col` guarda los tokens `>50` y `<50`. El papel firmado los imprimía **pelados**,
al lado de un diámetro que sí dice «mm».

| Superficie | Antes | Ahora |
|---|---|---|
| **PDF, tabla de datos** | `Colapso VCI: >50` | `Colapso VCI: >50%` |
| Informe narrativo | `con colapso mayor al 50%` | sin cambios |
| EN SUMA | **no nombra la VCI** (censado) | sin cambios |
| PPT | `val + '%'` sobre los mismos dos tokens | sin cambios |
| `<option>` de la pantalla | se rotula `>50%` | sin cambios |
| Excel, columna `Colapso VCI` | el token crudo | **sin cambios** (no se toca el Excel) |

Se alinea con el **mismo formato** que ya usaban las otras dos superficies —sin espacio—, no con
uno nuevo. La guarda va **por token**: un valor que no sea uno de los dos sale sin unidad, en vez
de que se le invente una.

---

## 5 · El PDF — el símbolo del sexo se DIBUJA

### Por qué no se puede escribir, y son DOS motivos medidos

1. **`amiloSanPDF` lo borra.** Todo lo que se dibuja pasa por `_sanML` → `amiloSanPDFml` →
   `amiloSanPDF`, que tiene un `.replace(/[^\x20-\xFF]/g, '')`: cualquier carácter fuera de
   WinAnsi desaparece **en silencio**. Un ♂ puesto como texto ni se rompe ni se ve.
2. **Y si se lo saltea, es PEOR.** Medido generando un PDF con el mismo **jsPDF 2.5.1** que la app
   carga y **rasterizando la página**: con helvetica el glifo sale como **«&B»** (y ♀ como «&@»),
   y además **la línea ENTERA pasa a UTF-16 y se desmaqueta** — «B :  4 5  a n i o s», con un
   espacio entre cada letra. El dedazo no se limitaría al símbolo: **rompe la celda del informe
   firmado**.

Censo de fuentes del PDF: **85** `setFont('helvetica')`, **11** `setFont('times')`, **CERO**
`addFont` y **CERO** `addFileToVFS`. No hay fuente propia, y embeber una exigiría un CDN.

### Las piezas

| Pieza | Qué hace |
|---|---|
| `PDF_SEXO_HUECO` | **tres** espacios **duros** (` `), el hueco donde cae la figura |
| `sexoTxt` | `PDF_SEXO_HUECO + 'Masculino'` / `… + 'Femenino'`, o `(sexo||null)` sin sexo |
| `_pdfSexoFig(x, yb, w)` | dibuja ♂ o ♀ con `circle` y `line`; **sale por la puerta si el sexo no es M ni F** |
| `_tSexo(txt, x, y, opts)` | el **único** dibujador de una línea de celda del paciente |

`_tSexo` sin hueco —o con una alineación que no sea la izquierda, donde el origen no es el borde
del texto— se comporta **exactamente** como `doc.text`, así que todas las demás líneas del PDF
salen byte por byte como en HEAD.

El alto del símbolo sale del **cuerpo de letra vigente** (`doc.getFontSize() * 0.70 / 2.8346` mm,
la altura de una mayúscula), así que acompaña a la plantilla que lo pide **sin un solo número
cableado por plantilla**.

⚠️ **LA FIGURA SE ALINEA A LA IZQUIERDA DEL HUECO Y NO AL CENTRO**, y el aire que sobra queda del
lado de la palabra: centrada salía **pegada a la «M» de «Masculino»**. Lo delató mirar el PNG del
PDF real, no la medición.

### ⚠️ El hueco y el envoltorio — la corrección que la medición destapó

El texto que se mide con `splitTextToSize` y el que se estampa son **el mismo string**: el hueco
queda en blanco y la figura se pinta encima, dentro de su propio ancho. Pero medido, el valor
`60 años · Masculino` **cabía JUSTO** en su columna:

* en `_hdrCajaPaciente` (Clásico, Moderno, Elegante y dos más) los tres duros **partían la celda
  en dos renglones** y la caja del paciente crecía **3,9 mm**;
* en la tira corrida (Minimalista y **Compacto**) **corrían el corte** y «ASC 2.00 m2» se pasaba
  al renglón siguiente.

**Un símbolo no puede remaquetar el informe firmado.** Los **tres** `splitTextToSize` de las
celdas del paciente reciben el ancho del hueco (`doc.getTextWidth(PDF_SEXO_HUECO)`), así que el
corte se decide **como si el símbolo no existiera** y la línea queda 2,2 mm más ancha dentro del
colchón de 3 mm que esa celda ya reservaba.

### Las SEIS plantillas (son seis, no tres) y sus TRES maquetaciones

| Maquetación | Plantillas | Dónde se dibuja el valor |
|---|---|---|
| `_hdrCajaPaciente` (grilla de 4 columnas) | Clásico, Moderno, Elegante y las dos que la llaman | `c.lines.forEach` |
| tira corrida con `_duro` y `join('  ·  ')` | Minimalista, Compacto | `lns.forEach` |
| tabla Parámetro \| Valor | Académico | `lns.forEach` |

### Lo medido

* **`nTextos` IDÉNTICO a HEAD en las 18 celdas** (3 escenas × 6 plantillas): ninguna cambió de
  envoltorio.
* La **única** línea de texto distinta en las doce con sexo es `: >50` → `: >50%`.
* `nFigs`: **+4** con el masculino (un círculo y tres líneas) y **+3** con el femenino.
* **CONTROL NEGATIVO:** sin sexo cargado, las seis plantillas salen con **cero** diferencias de
  texto y **cero** figuras de más.
* **PDF REIMPRESO** de un estudio guardado, por su camino REAL (guardar → limpiar →
  `pdfDeInformeGuardado`): masculino «>50%» con 54 figuras, femenino «<50%» con 52, y sin sexo 42
  figuras y ninguna celda de VCI.

⚠️ **EL INFORME DE UN ESTUDIO GUARDADO NO SE REESCRIBE.** `informe_texto` y `en_suma` son
`<textarea>` **con id**, así que viajan con el estudio y el barrido de restauración de
`_pdfDeInformeGuardadoArmar` los repone tal cual; el PDF los lee con `sv('informe_texto')`. Lo que
**sí** cambia en el reimpreso es la **tabla de datos**, que se arma de `campos` — o sea el «%» de
la VCI y el símbolo del sexo. Es lo correcto y es lo que la orden pedía verificar. **No se migra
nada.**

---

## 6 · Lo que NO se hizo: la cédula o la matrícula del médico

**La lectura del asistente es incorrecta, y la orden lo prevé.** Censado:

| Dato | id | De quién | Dónde se carga |
|---|---|---|---|
| Matrícula del **médico** | `med-matricula` / `cfg-medico-matricula` | médico | ⚙️ Config → «👨‍⚕️ Médicos» |
| Nº de documento del **paciente** | `ci` + `doc_tipo` (`CI`/`DNI`/`CPF`) | **paciente** | pestaña Paciente |
| «Matrícula» del **paciente** | `matricula`, placeholder **«Nº mutualista»** | **paciente** | pestaña Paciente |

**No existe ninguna cédula del médico.** La regla «si están las dos se imprime la cédula, salvo
que el médico prefiera la matrícula» **no es aplicable**: no hay dos datos entre los que elegir.
Y la identificación que hoy se imprime en la firma va **sin rótulo** (`_num` unido a la
especialidad con `·`), no como «Matrícula: …».

Por eso esta parte **queda sin hacer**, que es lo que la orden manda en ese caso. Las tres
salidas posibles están en `docs/PENDIENTES.md` → **H-2**.

---

## 7 · Ocho trampas, medidas

1. **`amiloSanPDF` borra lo que está fuera de WinAnsi**, así que un símbolo puesto como texto
   desaparece sin aviso. Un `grep` del glifo en el fuente **no** prueba que se imprima.
2. **Y jsPDF, si se lo saltea, no sólo rompe el glifo: desmaqueta la línea entera.** El modo de
   falla no es «un carácter feo», es una celda del informe firmado con un espacio entre cada
   letra.
3. **El hueco mueve el envoltorio.** Dos de las tres maquetaciones estaban al límite. Medir
   `nTextos` contra HEAD es lo que lo delata; mirar el PNG, lo que lo confirma.
4. **Son SEIS plantillas de PDF, no tres**, repartidas en tres maquetaciones distintas del bloque
   del paciente. Medir una sola deja cinco sin cubrir.
5. **`guardarInforme` devuelve `false` y no guarda** si las severidades valvulares no están
   confirmadas: abre una tarjeta y espera un clic. Y `valvSevConfirmada` es un `let` de MÓDULO,
   no una propiedad de `window` — la trampa que `_labImpDatos` y `ECO_AYUDA` ya tienen escrita.
   Se confirma clickeando `#rev-confirm`, que es el gesto del médico.
6. **`getInformes()` no devuelve «el último guardado» en la última posición.** Las tres escenas
   del reimpreso devolvieron el **mismo id** y las dos de abajo reimprimieron el estudio de la
   primera: un denominador roto con pinta de medición buena. Se busca por documento.
7. **`showTab('valvulas')` corre `valvCerrarTarjetas` y cierra lo que el clic acaba de abrir**, así
   que llamarlo con la pestaña ya activa deshace las dos puertas de la mitral y el campo vuelve a
   medir 0×0. Se llama **sólo si la pestaña no está activa**.
8. **`indexOf('uricula')` NO matchea «Aurícula»**, porque la í lleva tilde: once condiciones de
   TC-487 salieron rojas **por el filtro** y no por el árbol, sobre un informe perfecto.
   ⚠️ Y una novena, del mismo tipo: **un `input[type=date]` no soporta `setSelectionRange`** y tira
   `InvalidStateError`, que mata la escena entera. La fecha se fija por valor y **se declara**:
   es el único campo de estas escenas donde el gesto no es una tecla real.

---

## 9 · El volumen que NO se puede indexar — la tanda «J» (2026-10-16)

Cierra **H-1** por su salida **(a)**: declarar la medición sin afirmar.

> ⚠️ **El prompt de la tanda J la llamó «opción B» y describió la (a).** Lo que manda es la
> descripción —«dice el volumen medido sin indexar y que no se clasifica»—, que es la (a) de
> este archivo; la (b) era «pedir el dato». Queda anotado para que la letra no confunda.

### El dueño del ESTADO, al lado del dueño de los cortes

| Pieza | Qué es |
|---|---|
| `aiVolSinIndexar(vol, bsa)` | el predicado: hay volumen legible y no hay superficie corporal |
| `AI_SIN_IDX_ROT` | `'Sin indexar (falta ASC)'`, el rótulo que comparten la cápsula y el PDF |

**Ningún corte se movió**: `aiVolClasificar` y `AI_VOL_BANDAS` no se tocaron. Lo que faltaba era
un dueño del estado, que vivía implícito en **tres** `if` distintos —`!vol || !bsa` en la
cápsula, `ai_vol && bsa` en el informe y `_pAiVol.crudo && bsa` en la fila del PDF— y por eso las
tres publicaban cosas distintas del mismo paciente: raya, normalidad y fila ausente.

⚠️ **EL RÓTULO ES ASCII PURO Y SIN EM DASH.** Lo imprime la tabla del PDF, que se dibuja con
jsPDF en WinAnsi y **no** pasa por `amiloSanPDF` —que es la que transliteraría el em dash a `-`—.
Un glifo fuera de la codificación sale como basura: medido en la tanda H con el símbolo del sexo,
que jsPDF 2.5.1 imprimió como «&B» y además desmaquetó la línea entera.

### La rama nueva del informe, y dónde va en la cascada

```
if (ai_vol && bsa)        → el grado por volumen indexado        (sin cambios)
else if (aiGeoMedido)     → área / diámetro, binario y sin grado  (sin cambios)
else if (ai_vol)          → DECLARA el volumen sin indexar       ← NUEVA
else if (!aiGeoFuera)     → la frase de normalidad               (sin cambios)
```

Va **después** de `aiGeoMedido` y eso es la mitad del arreglo: con área o diámetro cargados la
cascada los sigue usando como hoy, y la línea nueva sólo habla cuando no hay nada más con qué
clasificar —que es exactamente el caso que negaba—.

| Estilo | Frase |
|---|---|
| conciso | `AI sin graduar (volumen 98 ml, sin indexar).` |
| estándar | `Volumen de la aurícula izquierda de 98 ml, sin indexar por falta de superficie corporal; no se informa el tamaño auricular.` |
| narrativo | `El volumen de la aurícula izquierda es de 98 ml. No se puede indexar por superficie corporal —falta el peso o la talla—, así que no se informa el tamaño auricular: la guía lo gradúa sólo por volumen indexado.` |

⚠️ **EL CONCISO SIGUE EL PATRÓN «AI \<algo\> (\<dato\>).»** y no «AI: …». La primera versión con
dos puntos quedó fuera del filtro de la sonda —que ancla al comienzo de línea— e informó «la
línea desapareció del conciso» sobre un informe perfecto: **el filtro era del lector, pero la
inconsistencia de estilo era real**.

### Las cuatro superficies, y el EN SUMA que NO cambia

| Superficie | Antes | Ahora |
|---|---|---|
| informe, 3 estilos | afirmaba normalidad | declara el volumen sin indexar |
| **EN SUMA** | no nombra la AI | **sin cambios** (decisión de Maicol) |
| cápsula `ai-interp` | `—` | `Sin indexar (falta ASC)`, badge **gris** |
| campo `ai-idx` | `—` | **sin cambios**: es el valor INDEXADO, y no existe |
| PDF, fila `Vol. indexado` | la fila **desaparecía** del filtro de la tabla | `(<=34 ml/m2): Sin indexar (falta ASC)` |
| PDF, fila `Volumen AI` | los ml | **sin cambios** |

`gray` y no `yellow`: los cuatro colores de `AI_VOL_BANDAS` son GRADOS y el amarillo ya significa
«dilatación leve» en esa misma cápsula.

⚠️ **NO LLAMA A `ccMarcarParrafo()`**, a diferencia de la rama de `aiGeoFuera`. Marcar cambiaría
el texto GLOBAL del EN SUMA, que esta orden no autoriza. La contrapartida queda declarada:
`docs/PENDIENTES.md` → **J-1**.

### El Laboratorio no la lee como categoría — medido

La fila «Dilatación AI» de `_LAB_HALLAZGOS` es un **regex sobre el TEXTO**
(`/dilataci[oó]n.{0,10}auricular|AI\s+(?:dilata|agrand)/i`) y `_labLavi` recalcula el indexado
desde `ai_vol`, `peso` y `talla` —sin peso ni talla da `null`—. Medido en las 18 escenas: la
frase nueva da `dilat:false` **y** `normal:false`, o sea que no entra en ninguna categoría. **No
se tocó una línea del Laboratorio ni del Excel.**

### Escenas que cambian contra HEAD: **4 de 18**

| Escena | Qué cambia |
|---|---|
| volumen sin ASC | la frase en los tres estilos, la cápsula, el Laboratorio deja de leer «normal» |
| volumen sin ASC + DAP dilatado | **sólo la cápsula**: el informe sigue usando el diámetro, como hoy |
| volumen sin ASC y nada más | igual que la primera |
| el PDF de esa escena | la fila `Vol. indexado` aparece con su motivo |

Las otras **14** salen idénticas: los cuatro grados por volumen, los cuatro de discordancia, las
cuatro sin volumen y los dos controles.

---

## 10 · La UNA línea de la AI en el PPT — «J2»

⚠️ **LA PREMISA DE LA ORDEN ERA PARCIALMENTE FALSA.** El PPT no publicaba «Volumen AI» en ml y
nada más: publicaba **DOS** filas —`Volumen AI` en ml y `Vol. AI indexado` leído del span
`ai-idx`— y **ninguna de las dos tenía fallback**: sin volumen, con el área o el diámetro
cargados, la AI no salía en la diapositiva por ningún camino.

Dueño: **`aiResumenUno()`**, al lado del de los cortes. Devuelve `{lbl, val, suf}` o `null`.

| Rama | Condición | Lo que publica (medido) |
|---|---|---|
| (a) | volumen indexable | `Vol. AI indexado` · `49.0` · ` ml/m²` |
| (b) | sin volumen, con área | `Área AI` · `25` · ` cm²` |
| (c) | sin volumen ni área, con diámetro | `Diám. AP AI` · `44` · ` mm` |
| (d) | volumen que no se puede indexar | `Volumen AI` · `98` · ` ml (sin indexar)` |
| — | sin ningún dato | `null`: **no hay fila**, como hoy |

Controles negativos medidos: con área **y** diámetro manda el área; con volumen indexable y área
manda el indexado; y con el **área fuera de banda** (250 cm²) cae al diámetro.

⚠️ **EL ÁREA Y EL DIÁMETRO SE LEEN POR SU BANDA DE PLAUSIBILIDAD y el volumen crudo**, que es
como los lee la rama del informe de cada uno. Acá la banda no decide sólo si se imprime un
número: decide **cuál de los tres se publica**, así que un área de 250 cm² —mm² tipeados por
cm²— elegiría la línea y dejaría afuera al diámetro bien medido.

⚠️ **DEVUELVE EL VALOR Y EL SUFIJO POR SEPARADO** para que el PPT lo pase por su propio
`fila(arr, k, val, suf)`. Así el texto de la rama (a) sale **idéntico** al de HEAD: `_pptTxt` no
toca el `²` y el sufijo se concatena después de él.

⚠️ **NO LEE EL SPAN `ai-idx`** aunque el texto sea el mismo: ese span lo pinta `calcAI`, así que
leerlo ataba la diapositiva a que la cápsula estuviera pintada.

⚠️ **SIN PARÁMETRO `src`**: el PPT clínico lee el DOM —`_pptNum` y `_pptSpan` leen el DOM— y no
hay otro consumidor. El fuente se verifica por la **declaración completa** y no por una mención:
un comentario que nombre lo retirado se lee igual que el código retirado (la trampa de TC-476).

---

## 8 · Cómo medir esta zona

```bash
node scripts/_probe_h.mjs --solo ai,bordes          # la AI y los seis bordes
node scripts/_probe_h.mjs --solo pdf --dest /tmp    # el PDF real en las seis plantillas
node scripts/_probe_h.mjs --solo reimp              # el PDF de un estudio guardado
node scripts/_probe_h.mjs --solo controles          # informe, EN SUMA, grados, Excel 440
node scripts/test_clinico.mjs --solo TC-487
```

El A/B va con `--file /ruta/index.HEAD.html`. Para **mirar** el PDF hay que rasterizarlo: la sonda
deja el base64 en `--dest` con `--solo pdf`, y `pymupdf` lo convierte a PNG. **Mirarlo es
obligatorio**: el defecto del símbolo pegado a la palabra y el de la celda partida en dos
renglones los vio la captura, no la medición.

---

## 11 · La tarjeta ⓘ de la aurícula izquierda — puntero (tanda «L», 2026-10-16)

Desde el 2026-10-16 el título de la AI lleva un globo ⓘ que abre una tarjeta con **tres barras**
—diámetro AP, área y volumen indexado— con el punto del paciente, su categoría en palabras y la
fuente. Y la pestaña Referencias gana la entrada «AI — Aurícula izquierda: cortes por sexo».

**Nada de eso recalcula nada**: los cortes se **sondean** de `aiVolClasificar`, `aiDiamDilatado`
y `aiAreaDilatada` —los mismos dueños de este mapa—, la categoría del volumen es el `adj` de
`AI_VOL_BANDAS` y las de diámetro y área se copian del texto que su cápsula publica.

⚠️ **NINGUNO DE LOS TRES CORTES DE LA AI DEPENDE DEL SEXO**, así que esa tarjeta nunca esconde el
punto por falta de sexo. La Tabla 4 imprime los mismos cuatro valores en las dos columnas.

Todo el mecanismo, el registro de evidencia que lo alimenta y sus ocho trampas medidas están en
**`docs/mapa/registro-evidencia.md`**.

---

## → La tanda «LS» (2026-10-16): la AI y el VI por SEXO

Los cortes de la aurícula y el ventrículo izquierdos pasaron a ser **por sexo**, con la regla del
**corte más alto** cuando el sexo falta, y la fracción de eyección a **cuatro categorías con un
solo dueño**. Entró además un **aviso de pantalla** que aparece sólo cuando falta el sexo y algún
valor cambiaría de categoría con él.

**Todo está en `docs/mapa/ai-vi-por-sexo.md`**: el dueño del sexo efectivo (`sexoLeido`,
`sexoCargado`, `sexoEfectivo`, `sexoFalta`), la tabla de los seis parámetros con su operador, las
cinco copias de la FEVI que pasaron a leer `feviClasificar`, el aviso con su medición en seis
anchos por dos temas, lo que cambió en las tarjetas y en Referencias, las tres fichas nuevas del
registro y nueve trampas.

La verificación contra el PDF original —folio por folio, con la regla de folio de cada una de las
tres guías comprobada en el pie impreso— está en `docs/fuentes/FUENTES.md` → «La tanda LS».
