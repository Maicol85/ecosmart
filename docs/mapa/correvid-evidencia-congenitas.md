# La Evidencia de congénitas con dos guías, y el EN SUMA de la válvula reparada — tanda CORR-EVID (2026-11-02)

Mapa de la tanda **CORR-EVID**. Está por nombre de función y de constante, no por línea.

El molde de los paneles con preguntas lo dejó TGA-2 y vive en `docs/mapa/t2-evidencia-congenitas.md`,
que esta tanda **no reemplaza: extiende**.

---

## 1 · El EN SUMA de la válvula reparada — `valvRepSuma`

| Qué | Dueño |
|---|---|
| El rótulo corto por válvula y tipo | **`VALV_REP_SUMA`** — `vm_morf` → VM / plastia / TEER · `vt_morf` → VT / plastia / **T-TEER** |
| La línea del resumen | **`valvRepSuma(morfId, val, lesiones)`** |
| Qué tipo es | `popVTipoCorto`, el dueño único de VAL-PPT-1 |

`lesiones` llega **ya redactada** por el emisor de cada válvula, igual que en `sumaProtLinea` y por
el mismo motivo: ese emisor es el único que sabe qué señales tiene esa válvula.

### El defecto que cerró, y el matiz que la premisa no tenía

Con la plastia o el TEER **y una insuficiencia cargada**, el EN SUMA decía «IM moderada.» y nada
más: la reparación desaparecía de la superficie que se copia al resumen de alta.

⚠️ **No era «salvo cuando es el único hallazgo».** Con un hallazgo **ajeno** —una AI dilatada— el
resumen **sí** nombraba la plastia, por la pasada de VAL-PPT-3. Lo que la ocultaba es una lesión de
**esa misma válvula**: el `yaEnSuma` de esa pasada reconoce «IM » como «el resumen ya habla de esta
válvula» y se callaba.

### La pasada de VAL-PPT-3 se RETIRÓ

Su trabajo lo hace la línea nueva, que se emite **siempre**. Dos mecanismos para el mismo trabajo
son lo que hace que una mutación sobreviva —la lección que el D-10 pagó cinco veces—, y su guarda
era justamente la causa del defecto.

### ⚠️ LA ESTENOSIS NO SE FUSIONA, Y ES UNA LECTURA LITERAL DEL PEDIDO

El pedido dice que la **insuficiencia** no se repita aparte y que para la estenosis se use «el mismo
texto que la app ya usa hoy». La estenosis queda en su línea propia: «VM con TEER.» + «EM
significativa.». Difiere de `sumaProtLinea`, que sí fusiona las dos. → `docs/PENDIENTES.md` **CE-a**.

### ⚠️ DOS GUARDAS QUE SE TAPAN, Y LA MUTACIÓN LO DESTAPÓ

`if (tc !== 'plastia' && tc !== 'teer') return '';` y `if (!rot) return '';` son redundantes **dado
el contenido de la tabla**: aflojando sólo la primera, «Prótesis mecánica» da `tc = 'mec'`, la tabla
no tiene esa clave y la función devuelve `''` igual. La mutación 05 rompe **las dos a la vez**.

---

## 2 · El molde de «una pregunta, una guía» — `_indPregNota`

Las cinco reglas que el médico fijó el 2026-11-02 están transcritas en el comentario de
`IND_GUIA_LBL`, en `index.html`. En una línea cada una:

| | |
|---|---|
| **E-1** | cada pregunta usa los cortes de UNA sola guía, con su nombre y año visibles |
| **E-2** | si las dos difieren, rige la **más nueva** y la otra va como línea de referencia |
| **E-3** | si sólo una trae el dato, la pregunta queda con ésa, rotulada |
| **E-4** | tres estados; «sin dato» NO es «no» |
| **E-5** | una condición en varias recomendaciones es UNA pregunta; se unen sólo si la redacción cubre EXACTAMENTE las condiciones de todas |

### Las piezas

| Pieza | Qué hace |
|---|---|
| `IND_GUIA_LBL` | `acc` → «ACC/AHA 2025» · `esc` → «ESC 2020» |
| `_indPregNota(p, sinDato)` | arma la nota: rótulo + `rec` + `ref` («ESC 2020 (anterior): …») + `tramo` + la frase de E-4 |
| `acc2025achd` | la entrada de la guía nueva en el registro de citas |

**El rótulo va en la NOTA y no en el `lbl`**, y es una decisión medida: la botonera queda a la
derecha del rótulo, así que un `lbl` más largo la empuja y a 390 px la parte.

### ⚠️ LA NOTA DE TRAMO NO ES UNA PREGUNTA NUEVA

Cuando los tramos no coinciden —la resistencia vascular pulmonar entre 2 y 3 unidades Wood es el
caso— se **dice** que no coinciden. No se inventa un tramo intermedio ni una pregunta que no esté en
ninguna de las dos hojas.

---

## 3 · Las tres tablas de preguntas, y por qué se exponen

`TGA_IND_PREG` (por situación), `CIA_PREG` y `CIV_PREG` viven **a nivel de script** y se exponen en
`window`. **No es un capricho de la sonda**: la regla E-1 es un invariante de **datos**, y medirlo
sobre el texto ya armado obliga a descontar a mano las frases que declaran que la otra guía no trata
el tema —que es justo lo que E-3 pide decir—.

⚠️ **Y eso destapó un defecto de la sonda de esta tanda**: su «0 mezclas» de la TGA estaba medido
sobre un array **vacío**, porque `TGA_IND_PREG` no estaba en `window`. Un denominador de cero que se
lee igual que «no hay mezclas».

### Cuántas preguntas tiene cada panel

| Panel | Preguntas | Bloques |
|---|---|---|
| TGA · switch auricular | **18** | ACC + ESC + generales |
| TGA · switch arterial | **12** | ACC + ESC + generales |
| TGA · Rastelli y conducto | **12** | ACC + ESC + generales |
| TGA · ccTGA | **8** | ACC + ESC + generales |
| TGA · d-TGA **sin operar** | **0** — ninguna guía publica tabla para ese caso en el adulto, y el panel lo dice | 2 |
| CIA | **14** | 5 |
| CIV | **14** | 4 |

### Las dos separaciones por E-5

- La **recomendación 11** del switch auricular agrega «arritmia refractaria al tratamiento», que
  «insuficiencia cardíaca o intolerancia al ejercicio» no cubre → pregunta propia.
- La **recomendación 12** exige que la arritmia auricular sea **sostenida** o fibrilación auricular,
  que «arritmia auricular» no cubre → pregunta propia.

---

## 4 · Las hojas leídas, y sus reglas de folio

**ACC/AHA 2025** (Gurvitz M y cols., *Circulation* 2026;153:e115-e251). Regla comprobada en el pie
impreso de **diez** hojas: **folio = e(hoja + 114)**.

| Hoja | Folio | Qué |
|---|---|---|
| 35 | e149 | apartado 4.1.1, comunicación interauricular, 13 recomendaciones |
| 39 y 40 | e153 y e154 | apartado 4.1.2, comunicación interventricular, 10 recomendaciones |
| 75 | e189 | apartado 4.3.7, conducto ventrículo derecho-arteria pulmonar, recomendaciones 5 a 8 |
| 77 | e191 | apartado 4.4.1.1, switch auricular, 15 recomendaciones |
| 81 | e195 | apartado 4.4.1.2, switch arterial, 7 recomendaciones |
| 82 | e196 | el texto de apoyo del crecimiento rápido de la raíz |
| 83 | e197 | apartado 4.4.1.3, Rastelli: **UNA sola** recomendación |
| 84 | e198 | apartado 4.4.2, transposición congénitamente corregida, 8 recomendaciones |

**ESC 2020**, edición inglesa. **folio = hoja + 562**, comprobada en **nueve** cabeceras impresas.
⚠️ En la ESC el folio va en la **cabecera**, no en el pie.

| Hoja | Folio | Qué |
|---|---|---|
| 30 | 592 | tabla de intervención en la comunicación interauricular, 9 recomendaciones |
| 33 | 595 | tabla de intervención en la comunicación interventricular, 6 recomendaciones |
| 56 | 618 | apartado 4.12.2.3, tratamiento médico: texto **sin clase** |
| 57 | 619 | switch auricular |
| 58 | 620 | switch arterial, apartado 4.12.4.3 y apartado 4.12.5 (el seguimiento anual) |
| 59 | 621 | transposición congénitamente corregida, y apartado 4.13.4 |
| 60 | 622 | conducto ventrículo derecho-arteria pulmonar |

---

## 5 · Lo que la lectura confirmó, y lo que corrigió del índice

- **C3 y D2 («¿Síntomas?») SÍ existen**, contra lo que el índice anticipaba: recomendaciones 6 y 7
  del apartado 4.3.7 y recomendaciones 4, 6 y 8 del 4.4.2.
- **FCD-1 confirmado, y la pregunta queda SIN cifra**: la recomendación 4 de la CIV escribe
  «resistencia vascular pulmonar ≤2 unidades Wood» y **su propio texto de apoyo** escribe «<2». La
  guía no coincide consigo misma.
- **El crecimiento rápido de la raíz**: la recomendación **no da cifra**; su texto de apoyo escribe
  «más de 3 mm por año», y por eso acá **no se convierte en corte**.
- **El índice llama «rec 3» a la recomendación "sin beneficio" de la CIV, y es la 9.** La 3 es la
  del seguimiento por especialistas.

---

## 6 · Lo que esta tanda NO tocó, y por qué

- **El dibujo del posoperatorio**: medido, el dato SÍ llega y los cuatro símbolos son distintos. Lo
  que falta es la casilla de válvula operada, que es una decisión de diseño. → **CE-b**.
- **El rótulo de la miocardiopatía hipertrófica**: la fila del conteo **ya decía 2024**. Lo que el
  médico ve es la **tarjeta de criterios**, que es otra superficie. → **CE-c**.
- **La conclusión de pantalla de la TGA**: de las cuatro conductas, dos quedan respaldadas, una
  parcialmente y una no. → **CE-d**.
- **La línea de guía de la CIV** sigue apuntando a `escGuchCiv`, que es la que lleva la advertencia
  de divergencia del criterio. → **CE-e**.

---

## 7 · Dónde están las sondas

| Arnés | Qué mide |
|---|---|
| `scripts/_probe_correvid_inv.mjs` | el inventario 1a: informe y EN SUMA en las tres situaciones |
| `scripts/_probe_correvid_simb.mjs` | los inventarios 2a y 3a, con click real |
| `scripts/_probe_correvid_demo.mjs` | el SVG que renderiza la app contra la demo v9 |
| `scripts/_probe_correvid_panel.mjs` | los tres paneles por escenario, y el control del papel |
| `scripts/_mut_correvid.py` | las 18 mutaciones dirigidas |

⚠️ **Los nombres no pisan a los de otra tanda**: se verificó con `ls` antes de crear cada uno.
