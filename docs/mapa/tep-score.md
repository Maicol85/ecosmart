# TEP — el score de sobrecarga aguda del VD, su ficha y su Evidencia

Mapa de la tanda **«C» (2026-10-21)**. Lo que esta zona contesta es **«¿hay hallazgos
ecocardiográficos de sobrecarga aguda del ventrículo derecho?»**, y desde esta tanda **no**
contesta «¿qué riesgo tiene este paciente?»: eso vive en el panel de Evidencia, que es el único
lugar que puede preguntar los tres indicadores que el eco no da.

> ⚠️ **Antes de tocar un corte de acá, leer `docs/fuentes/FUENTES.md` → «La tanda C».** Los seis
> criterios tienen su folio verificado en el PDF original y dos de ellos **se leyeron
> renderizando la página**, porque la extracción de texto de esos dos documentos se come los
> glifos `≥` y `≤`.

---

## 1 · Las piezas, por nombre

| Pieza | Qué es | Dónde |
|---|---|---|
| `TEP_VDVI_DILAT_MIN` | 1,0 · operador `>=` | junto a `UMBRAL_PSAP_ELEVADA` |
| `TEP_TAPSE_BAJO_MAX` | **16 mm · operador `<`** (NUEVO, C-E1) | inmediatamente debajo |
| `UMBRAL_PSAP_ELEVADA` | 35 mmHg — el TEP lo usa con **`>=`** | compartida con otros nueve consumidores |
| `tepVdViRatio()` | **dueño único** del cociente VD/VI del TEP (NUEVO, C-E2) | antes de `calcTEP` |
| `tepHayDatos()` | **dueño único** de la compuerta del módulo (NUEVO, C-E4) | al lado del anterior |
| `calcTEP()` | la pantalla | pestaña Hemodinámica |
| el bloque TEP de `generarInforme` | el informe narrativo y el EN SUMA | IIFE propio |
| `amiloTextoTEP()` | la hoja del PDF | con las otras hojas de `amiloTexto*` |
| `#ref-tep` | la ficha de Referencias (subpestaña **`fun`**) | marcado estático |
| `_indTEP()` | la sección de Evidencia (NUEVA, C-E4) | registrada en `IND_SECS` |

---

## 2 · Los seis criterios que CUENTAN, con su fuente

| Criterio | Corte | Operador | Fuente |
|---|---|---|---|
| VD/VI | 1,0 | `>=` | ESC 2019 de TEP, folio 497.e17 y Figura 3 B (folio 497.e15) |
| TAPSE | 16 mm | `<` | ESC 2019 de TEP, folio 497.e17 y Figura 3 G (folio 497.e15) |
| PSAP | 35 mmHg | `>=` | ASE 2025, Tabla 1, folio 145 (normal `<= 34`) |
| Signo de McConnell | presente | — | ESC 2019 de TEP, §4.9 (folio 497.e14) y Figura 3 B |
| Signo 60/60 | presente | — | ESC 2019 de TEP, §4.9 (folio 497.e14) y Figura 3 E |
| Tabique en D | presente | — | ESC 2019 de TEP, Figura 3 C (folio 497.e15) |

⚠️ **EL TAPSE DEL TEP NO ES EL DE LA PESTAÑA VD, Y LOS DOS SON CORRECTOS.**
`UMBRAL_TAPSE_NORMAL` vale **17 mm** (ASE 2025, Tabla 1, folio 145) y lo leen la pestaña VD, el
cuadro de referencias, el PDF, el POCUS del posoperatorio y el patrón hemodinámico. Son dos
preguntas distintas —«¿hay disfunción sistólica del VD?» contra «¿hay un hallazgo de mal
pronóstico en TEP agudo?»— con dos fuentes distintas. **Medido: un TAPSE de 16,0 a 16,9 mm es
NORMAL para el score de TEP y DISFUNCIÓN para la pestaña VD, cada sección con su fuente.**

⚠️ **LA PSAP REUSA LA CONSTANTE Y CAMBIA EL OPERADOR, Y SÓLO ACÁ.** Declarar un
`TEP_PSAP_MIN = 35` sería una segunda copia del mismo número —el defecto que este repo ya pagó
tres veces—. Lo que cambió es el operador: la ASE 2025 escribe normal `<= 34` y leve
`>= 35 a <= 49`, así que el **35,0 exacto es anormal**. Los otros nueve consumidores de
`UMBRAL_PSAP_ELEVADA` conservan el suyo.

⚠️ **LA GUÍA SE CONTRADICE CONSIGO MISMA EN EL OPERADOR DEL VD/VI.** La Figura 3 B escribe
`VD/VI > 1,0` y el cuerpo del folio 497.e17 escribe `>= 1,0`. La app aplica el del cuerpo, que
es el que no suaviza, y la discrepancia está declarada en `IND_REFS.escTep2019`.

### Los cortes 2 y 4 del conteo son CRITERIO DE ECOSMART
Ninguna de las fuentes publica un puntaje construido con estos seis criterios: la nota `b` de la
Tabla 8 remite a la Figura 3 y **no dice cuántos hallazgos hacen falta**. La ficha de Referencias
lo declara con el chip «CRITERIO DE ECOSMART», que es el cuarto de la app.

---

## 3 · El cociente TAPSE/PSAP — número, sin corte

Hasta el 21/10/2026 la pantalla le aplicaba un **0,32** que **no es un corte de TEP**: sale de la
ESC/ERS 2022, Tabla 16, folio 41, donde es el umbral de **bajo riesgo en hipertensión arterial
pulmonar**. No sumaba al score ni a la interpretación, pero **sí decidía** el renglón de riesgo
(`score >= 2 && desacoplado`) — que es la **PARADA Z4-TEP**, hoy cerrada.

**Censada la biblioteca, ningún documento publica un corte del cociente para TEP AGUDO**, así que
no se reemplazó por otro: el cociente se publica como número, sin color y sin palabra de
veredicto, en la pantalla, en la hoja del PDF y en el informe. El dueño del número sigue siendo
`vdTapsePsap()` y sus tres decimales no se tocaron.

⚠️ **LA SALIDA INTERMEDIA ERA PEOR QUE LAS DOS**, y por eso la etiqueta no se había retirado
sola: dejar «TAPSE/PSAP 0,320» a secas con el veredicto rojo colgando de un corte invisible deja
al médico sin un número en pantalla que explique por qué esa escena es roja. Esta tanda retira
**las dos cosas a la vez** — la etiqueta y el veredicto — así que el problema no existe.

---

## 4 · El VD/VI: un dueño, dos superficies

`tepVdViRatio()` es la cascada: campo propio → `vd_bas / ddfvi` → `vd_vi` de la pestaña VD.

⚠️ **ESTABA ESCRITA DOS VECES Y LAS DOS COPIAS NO DECÍAN LO MISMO.** La pantalla caía al `vd_vi`
y el informe **no**. **Medido con `vd_vi = 1,2` y `tep_vdvi` vacío: la pantalla contaba 2/3
criterios y el informe 1** — el mismo estudio con dos conteos, uno en la pantalla y otro en el
papel firmado.

⚠️ **EL PREDICADO ES EL DE LA PANTALLA, LETRA POR LETRA (`!vdvi`, no `=== null`).** Con `!vdvi` un
cociente de 0 cae al siguiente escalón; cambiarlo movería una rama que la pantalla ya aplicaba.
Lo que esta tanda unifica es **qué lee el informe**, no **cómo compara la pantalla**.

⚠️ **EL POSOPERATORIO NO LO CONSUME, Y ES DELIBERADO.** `popPocusSync` y `popPatron` tienen su
propia cascada —sin el escalón de `vd_vi` y con `=== null`— y esta tanda no los toca: son otra
pantalla, con su propio texto que declara de dónde salen sus cortes.

---

## 5 · Lo que SALIÓ de la pantalla y del PDF

| Qué | Dónde vivía | Por qué sale |
|---|---|---|
| `#tep-estratificacion` con «Riesgo INTERMEDIO-ALTO / BAJO» | fila del `calc-box` + `calcTEP` | es vocabulario de la **Tabla 8**, que clasifica con CUATRO indicadores y esta pantalla tiene uno |
| «Orientación de disfunción VD: …» | `amiloTextoTEP`, leyendo ese span | se va con el span |
| «Salvedad. Estos hallazgos son orientativos…» | `amiloTextoTEP` | descargaba el veredicto que calificaba, y ese veredicto ya no está |

⚠️ **EL INFORME NARRATIVO NUNCA USÓ ESAS PALABRAS — LA HOJA DEL PDF SÍ.** El narrativo tiene sus
propias frases, que son descriptivas («Disfunción VD con N criterios positivos…»), y no se
tocaron. La que publicaba la clase de riesgo era la hoja del PDF, a través del span.

**La advertencia SIGUE en pantalla**, en el cartel de la tarjeta de TEP («Esta herramienta es
orientativa. La estratificación de riesgo en TEP requiere integrar estabilidad hemodinámica,
troponina, PESI/sPESI y confirmación diagnóstica»), que no se tocó. Y su idea está además en la
sección de Evidencia.

---

## 6 · La Evidencia del TEP — `_indTEP`

Estructura de las otras secciones: `filas` (el eco) · `clinica` (lo que el médico contesta) ·
`recom` (la clase) · `guia` · `notas`.

**Las cuatro preguntas** y su clave: `tep.vd` (disfunción del VD por imagen), `tep.ih`
(inestabilidad hemodinámica), `tep.pesi` (PESI III-V / sPESI ≥ 1 / Ninguno) y `tep.tropo`
(troponina: Sí / No / No evaluada). **Viven en `_indClin`, no en el DOM persistente: no se
guardan con el estudio y se borran al abrir y al cerrar el panel.**

⚠️ **LA DISFUNCIÓN DEL VD LA PROPONE LA APP Y LA CONFIRMA EL MÉDICO, y las dos mitades
importan.** El conteo de esta app **no** es un criterio de la guía, así que publicar la clase con
el conteo sería inventar el umbral que esta sección vino a no inventar.

**Las siete ramas de la Tabla 8**, cada una con su fila o su nota:

| Rama | Condición | Fuente |
|---|---|---|
| **ALTO** | inestabilidad **y** disfunción del VD | Tabla 8 + **nota d** |
| **la tabla no publica esta combinación** | inestabilidad **sin** disfunción del VD | folio 497.e15 |
| **INTERMEDIO-ALTO** | sin inestabilidad, con gravedad clínica, VD **y** troponina | Tabla 8 |
| **INTERMEDIO-BAJO** | sin inestabilidad, con gravedad clínica, uno o ninguno de los dos | Tabla 8 |
| **INTERMEDIO** (sin subclase) | sin gravedad clínica, pero VD **o** troponina positivos | Tabla 8, **nota e** |
| **BAJO** | nada positivo | Tabla 8 |
| **faltan datos** | sin contestar `tep.vd` o `tep.ih` | — |

⚠️ **CON INESTABILIDAD Y SIN DISFUNCIÓN DEL VD LA TABLA NO TIENE FILA, y no se inventa una.** Se
publica lo que la guía sí dice en el folio 497.e15: que ante la sospecha de TEP de riesgo alto la
ausencia de signos de sobrecarga del VD prácticamente excluye la TEP como causa de la
inestabilidad. Y se deja **sin clase**.

---

## 7 · Trampas medidas en esta tanda

1. **LA SECCIÓN DE TEP NACE PLEGADA Y `limpiarCampos` LA VUELVE A CERRAR.** Medir sin abrirla da
   **0×0 en todo, «cero scroll horizontal» y una captura VACÍA**: la medición numérica sale
   impecable sobre una tarjeta que no está dibujada. La primera tanda de maqueta de este trabajo
   salió así. Se abre con `toggleCard('tep-seccion')` y se **aborta** si no hay geometría.
2. **LA FICHA DE REFERENCIAS VIVE EN LA SUBPESTAÑA `fun`.** Sin activarla la tarjeta existe y mide
   0×0 dentro de un panel apagado. Y **`refSubTab` exige su segundo argumento**: sin el botón
   lanza al tocarle el `classList` y se traga el resto del abridor.
3. **EL BADGE DE LA PANTALLA ESCRIBE `(<16 mm)` SIN ESPACIO Y LA FICHA `< 16 mm` CON ESPACIO.**
   Una condición que busque el literal de uno sale roja sobre el otro. Le pasó a (A1) de TC-510.
4. **EL COCIENTE ES TAPSE/PSAP Y LOS DOS SON CRITERIOS.** Moverlo cambiando el TAPSE cambia
   **también el conteo**, así que las dos escenas dejan de ser comparables: para probar que el
   cociente ya no decide hay que fijar el TAPSE y mover **sólo** la PSAP, con los dos valores del
   mismo lado de su corte (TAPSE 14 · PSAP 55 y 40 → cocientes 0,255 y 0,350, conteo 3 en las dos).
5. **«Troponina elevada» YA ES UNA COLUMNA DEL EXCEL** y es del módulo de amiloidosis. Un control
   que la filtre como «columna nueva de TEP» sale rojo sobre un libro perfecto.
6. **`EVID_LIMPIAR` ES UNA LISTA EXPLÍCITA Y HAY QUE ALIMENTARLA.** Con la sección de TEP nueva y
   sus campos fuera de esa lista, TC-274 informó el botón de Evidencia **AZUL «con el formulario
   vacío»** — y corrido solo pasaba. No era un defecto del botón: era el estudio del caso anterior.
7. **`check_backticks.py` NO ALCANZÓ EL CUERPO DE TC-510.** Dio «OK» con **cuatro** acentos graves
   adentro, y los cazó `node --check`. **Correr los dos, siempre**, y para un caso nuevo contar los
   acentos graves del cuerpo a mano. Ver `PENDIENTES.md` → C-6.

---

## 8 · Cobertura — TC-510

**48 condiciones**, con cinco denominadores y siete controles negativos, en nueve bloques:

| Bloque | Qué fija |
|---|---|
| (A) | el TAPSE por 15,9 / 16,0 / 16,9 **más el control de que la pestaña VD sigue en 17** |
| (B) | la PSAP por 34 / 35 / 36, derivada de la VRT, con su denominador |
| (C) | el VD/VI por 0,99 / 1,00 y el rótulo del campo |
| (D) | el cociente sin corte, con su control negativo (score ≥ 4 sigue grave) |
| (E) | pantalla e informe con el MISMO conteo, con dos controles negativos |
| (F) | la pantalla sin clase de riesgo, el PDF sin la Salvedad y el cartel que SÍ queda |
| (G) | la ficha: cada criterio con su folio, el chip, la AD y el PESI |
| (H) | la Evidencia por sus siete ramas, con su control negativo |
| (I) | los controles: pestaña VD, HTP, AD, posoperatorio y el Excel en 440 |

**Verificado que sabe fallar contra el inicio de la tanda en un worktree aparte: 28 de las 48 en
rojo, y NINGUNA por excepción.** Las 20 que pasan son los controles y lo que esta tanda no mueve.

**Arnés: `scripts/_probe_tep.mjs`** (Playwright, A/B de solo lectura con `--file`; grupos `score`,
`controles`, `refs`, `evid`, `maqueta`).

---

## Puntero — la tanda «AJ2» (2026-10-23)

Lo que esa tanda movió de esta zona está en **`docs/mapa/aj2-correcciones.md`**, con los doce
commits, sus dependencias y las doce trampas. En una línea, lo que toca acá:

- **HTP**: `htpVrtSinDatos` es el dueño del estado «sin datos», que NO es «no medible»; la hoja del
  PDF y la pantalla son un solo dueño por construcción (`amiloTextoHTP` lee el mismo nodo).
- **TEP**: `tepVeredicto` + `TEP_VD_SIGNIF_MIN` gobiernan las tres superficies; el cuadro pasa a
  tres grupos y el TAPSE/PSAP sale una sola vez; el rótulo del score en `/6`.
- **Otros / orejuela / ateroma**: la orejuela publica la medición y no la juzga; el ateroma no
  afirma un riesgo embólico que su escala no publica, su grosor completa el grado, y los dos
  aportan su línea al EN SUMA.
- **Referencias**: los dos buscadores tratan guión = espacio = nada (`_buscaCompacta`), con el
  punto decimal intacto.
- **Aorta**: `aoSegGrado` devuelve un solo grado, `'dilatada'`, **y el corte no se movió**.
- **Diastólica**: la frase de «no clasificable» describe en vez de pedir un campo.


---

## Puntero — la tanda «TEP» (2026-10-29)

⚠️ **LOS DOS CORTES DE LA TABLA DE LA SECCIÓN 2 DE ESTE MAPA CAMBIARON DE GUÍA Y DE VALOR.**
Hoy el **TAPSE es `< 17 mm`** y el **VD/VI es `> 0,9`**, los dos por la **AHA/ACC 2026, Tabla 4,
folio e989**, y el predicado del VD/VI tiene un dueño único, `tepVdViDilatado`, que leen los seis
consumidores. La PSAP, McConnell, el 60/60 y el tabique en D **no se movieron**.

Todo está en **`docs/mapa/tep-aha2026.md`**: por qué esto revierte al R7 sin contradecirlo, la
cita falsa que se cerró, el efecto autorizado sobre el posoperatorio, los dos globos ⓘ nuevos y
las cinco trampas medidas.
