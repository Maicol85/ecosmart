# TEP — los cortes del VD por la AHA/ACC 2026, McConnell y el papel del eco

Mapa de la tanda **«TEP» (2026-10-29)**. Lo que esta tanda cambia es **de qué guía salen los dos
cortes del ventrículo derecho del módulo de TEP**, cómo se dice el signo de McConnell, y qué
afirma la pantalla sobre lo que el eco puede contestar.

> ⚠️ **La zona en sí está mapeada en `docs/mapa/tep-score.md`** —las piezas, los seis criterios,
> el dueño del cociente, la Evidencia y sus siete ramas—. Acá queda **sólo lo que esta tanda
> movió**, que es el corte, el operador, la cita y dos textos.

---

## 1 · La decisión, y por qué revierte al R7 sin contradecirlo

**Decisión de Maicol del 28/10/2026: en los cortes del ventrículo derecho para embolia pulmonar
manda la AHA/ACC 2026.**

| | Antes (ESC 2019) | Hoy (AHA/ACC 2026, Tabla 4) |
|---|---|---|
| TAPSE | `< 16 mm` | **`< 17 mm`** |
| VD/VI | `>= 1,0` | **`> 0,9`** |
| Fuente | folio 497.e17 y Figura 3 | **hoja 13, folio e989** |

La tanda **R7** había subido el VD/VI de 0,9 a 1,0 argumentando que el 0,9 era **un corte de
tomografía y no de ecocardiografía**. Con la ESC 2019 sobre la mesa, tenía razón. Lo que cambió
no es el razonamiento sino la fuente: la Tabla 4 de la AHA/ACC 2026 se titula **«Optimal Methods
of RV Dysfunction Assessment on Echocardiogram»** y publica ahí el `>0.9`. O sea que hoy el 0,9
tiene fuente ecocardiográfica propia. **Antes de volver a subirlo, leer esto.**

---

## 2 · El dueño único es del PREDICADO, no del número

`tepVdViDilatado(vdvi)` vive pegado a la constante y lo llaman los **seis** consumidores:

| Quién | Dónde |
|---|---|
| la cápsula de TEP | `calcTEP` |
| el score del informe firmado | el IIFE de TEP en `generarInforme` |
| la sección de Evidencia | `_indTEP` |
| el POCUS del posoperatorio | `popPocusSync` |
| el patrón hemodinámico | `popPatron` |
| el esquema animado | `popEsquema` |

⚠️ **HASTA ESTA TANDA COMPARTÍAN EL NÚMERO Y CADA UNO ESCRIBÍA SU PROPIO `>=`.** Mientras el
operador fue el mismo en los seis, eso alcanzaba. Con el operador movido a `>` estricto, no: el
que se quedara con `>=` graduaría el **0,90 exacto** al revés que la cápsula, sobre el mismo
paciente. Por eso lo que se comparte pasó a ser el predicado.
**La mutación M4 es exactamente eso**, y la caza una sola condición — `(H4)` de TC-546.

---

## 3 · El posoperatorio sigue el corte, y es decisión de Maicol

`popPatron()` alimenta **la hoja PostCEC del PDF, el EN SUMA, el PPT y el Laboratorio**, y su
pregunta «¿Falla del VD?» se decide con ese predicado. Bajar la constante le cambia el papel
firmado **sin que se le toque una línea de código**.

Se le preguntó antes de tocar nada. **Maicol eligió que lo siga**, para que la app no quede con
dos cortes de dilatación distintos y para que el pie del cuadro POCUS —que afirma «los cortes son
los que la app ya aplica en la cápsula de TEP»— siga siendo verdadero.

**Medido, y es la única diferencia:** con VD/VI entre 0,9 y 1,0, «¿Falla del VD?» pasa de
`orange` a `red`. **Con 0,90 exacto no cambia nada.**

⚠️ **EL PIE DE ESE CUADRO YA FUE FALSO DOS VECES, POR DOS MOTIVOS DISTINTOS.** Primero tenía el
VD/VI escrito a mano en 0,9 con la constante en 1,0 (lo arregló el C1). Después, hasta esta
tanda, decía «TAPSE 17 mm» afirmando que era el corte de la cápsula de TEP, **que cortaba en
16**: verdadero para el VD/VI y falso para el TAPSE, en el mismo renglón. Hoy los dos números
coinciden **y siguen saliendo de dos constantes** —`UMBRAL_TAPSE_NORMAL` (ASE 2025) y
`TEP_TAPSE_BAJO_MAX` (AHA/ACC 2026)—, así que el día que una de las dos guías mueva el TAPSE,
este pie vuelve a mentir.

---

## 4 · La cita falsa que cerró, y qué la hacía falsa

La ficha de Referencias del **posoperatorio** publicaba:

> ¿Falla del ventrículo derecho? · **TAPSE <17 mm · VD/VI ≥1,0** · **ESC 2019** de tromboembolia
> pulmonar · *folio e17. Son los mismos dos cortes que aplica la cápsula de tromboembolia
> pulmonar de esta pestaña — TAPSE por debajo de 17 mm y VD/VI de 1,0 o más.*

Era falsa **por dos caminos a la vez**:

1. **La ESC 2019 no contiene «17 mm» en ninguna de sus 58 hojas** —censado el documento entero—;
   su folio 497.e17 dice **16 mm**.
2. **La cápsula de TEP no cortaba en 17**, cortaba en 16. El globo afirmaba una coincidencia que
   no existía.

Hoy dice **AHA/ACC 2026, Tabla 4, folio e989**, y los dos números son los que la app aplica.

---

## 5 · El signo de McConnell — qué salió y qué entró

**Salió un adjetivo, y no era sólo de pantalla.** La cápsula decía
`'Presente — altamente específico de TEP ✓'`, y **`amiloTextoTEP` lee ese mismo span**, así que
el adjetivo viajaba a la hoja del PDF firmada. Hoy dice `'Presente ✓'`. El `✓` se conserva: es la
marca de «suma al score» que ya llevan el signo 60/60 y el tabique en D, no un adjetivo.

**Entró un globo ⓘ** (`'tep-mcconnell'`), con sensibilidad 77 %, especificidad 94 %, VPP 71 % y
VPN 96 %; que no es patognomónico; que el infarto del VD puede parecerse al signo; y la clase con
que la AHA/ACC 2026 lo lista.

⚠️ **EL 94 % YA HABÍA ESTADO EN LA APP Y EL C-E3 LO RETIRÓ, CON RAZÓN:** estaba atribuido a la
ESC 2019, que no lo publica. Vuelve citado a quien sí lo publica. **La ficha de Referencias sigue
sin afirmarlo** — el dato vive sólo en el globo.

⚠️ **LAS DOS CIFRAS SE CITAN POR QUIEN LAS REPRODUCE, Y SE DICE ASÍ.** El trabajo original de
McConnell (1996) **no está en la biblioteca**, así que el globo dice «como las reproduce
Hotelling 2024». Es la regla de «lo que no se leyó en texto completo no se cita».

---

## 6 · El eco orienta — dónde quedó cada cosa

| Qué | Dónde | Lleva cita |
|---|---|---|
| «Los hallazgos ecocardiográficos orientan la evaluación del ventrículo derecho.» | pantalla, en la tarjeta de TEP | **no** |
| clase 3 «sin beneficio», nivel B-NR, especificidad 64 % | globo ⓘ `'tep-eco-dx'` | sí, folios e986 y e988 |
| informe, EN SUMA, PDF, PPT | **nada de esto entra** | — |

⚠️ **LA LÍNEA VA EN EL LUGAR DE LA QUE DECÍA CASI LO MISMO.** Ese párrafo abría con «Orientación
ecocardiográfica de disfunción VD por sobrecarga aguda de presión (TEP/HTP aguda)»: agregar la
frase nueva al lado dejaba la tarjeta afirmando **dos veces** que el eco orienta, y una tercera
en el cartel ámbar de más abajo (regla R4). Lo que esa línea aportaba —para qué sirve la
tarjeta— lo dice su título.

⚠️ **EL 64 % ES LA ESPECIFICIDAD GLOBAL, no la del paciente inestable.** La guía dice que el
rendimiento **mejora** con compromiso hemodinámico y que **aun así** la especificidad global
sigue siendo subóptima. Recortarlo a «64 % en el paciente inestable» invierte la frase.

**La «Salvedad» ya no salía en el PDF**: la retiró el C-E2 el 21/10/2026. Esta tanda lo
**confirmó midiendo**, en los dos árboles, en vez de retirarla de nuevo.

---

## 7 · Lo que esta tanda NO tocó, y está medido

- **El VD/VI de la probabilidad de HTP**: `VD_VI_HTP_MIN`, **1,0 con `>`**, ESC/ERS 2022 Tabla 10
  folio 28 y ASE 2025 Tabla 8 folio 173. Son **dos campos** (`tep_vdvi` y `vd_vi`) y **dos
  preguntas**, y desde esta tanda **ya ni siquiera coinciden en el número**.
- **El TAPSE de la pestaña VD**: `UMBRAL_TAPSE_NORMAL`, 17 mm, ASE 2025 Tabla 1 folio 145.
  Coincide en el número con el de TEP **y no es el mismo corte**.
- **Las categorías de riesgo de TEP**: la app sigue publicándolas en la **sección de Evidencia**
  (`_indTEP`), por la Tabla 8 de la ESC 2019, decididas con **las cuatro respuestas del médico** y
  no con el eco. Esta tanda **no las retiró**: la orden pedía reportarlas, no moverlas.
- **El PPT, el Excel (440 columnas) y las ocho funciones dueñas del Laboratorio.**

---

## 8 · Trampas medidas en esta tanda

1. **`generarInforme()` CAMBIA DE PESTAÑA.** Medir la geometría de un globo después de llamarlo
   da **0×0** sobre un botón que sí se dibuja. Hay que volver a abrir Hemodinámica antes de medir.
   Es la trampa de `showTab` que este repo ya documenta, por una puerta nueva.
2. **EL FILTRO DEL INFORME MEDÍA LA RAMA EQUIVOCADA.** La primera versión de la sonda buscaba
   `'sobrecarga VD aguda'`, que es la frase de la rama **«criterios incompletos»**. Las escenas
   cargadas pasan esa compuerta y emiten **la otra** frase, así que la línea salía vacía en todas
   ellas y el único que la tenía era el control negativo: el A/B daba «sin diferencias» sobre un
   denominador de cero.
3. **LA CATEGORÍA A DE LA PROBABILIDAD DE HTP AGREGA VARIOS SIGNOS.** Un control que le pregunte
   a ese badge dice «signo presente» en 1,00 y en 1,01 por igual, así que **pasa en verde sobre
   cualquier corte**. Hay que preguntarle a `vdViEstado`, que es el dueño.
4. **TC-476 y TC-478 son INTERMITENTES por una carrera propia**, no por esta tanda. Miden que la
   maquinaria `numdec` haya tomado el campo `vd_vi`; con la máquina cargada, el caso lee antes de
   que esa pasada termine y reporta `INPUT//null`. Medido: los dos árboles convierten **384**
   inputs idénticos, con cero errores, y el caso pasa 3 de 3 al repetirlo.
5. **UN CASO QUE CAE POR EXCEPCIÓN NO DICE QUÉ SE ROMPIÓ.** La primera versión de TC-546 moría
   con un `TypeError` contra HEAD, porque el ayudante del globo devolvía `{ERROR}` y la condición
   leía `.t` de `undefined`. Devolviendo una forma completa, cae por **20 condiciones** y ninguna
   por excepción.

---

## 9 · Cobertura

**TC-546**, 30 condiciones en nueve bloques, con **seis denominadores** y **ocho controles
negativos**. Verificado que sabe fallar: contra el árbol de antes de la tanda da **20 en rojo y
ninguna por excepción**.

| Bloque | Qué fija |
|---|---|
| (D1)-(D3) | los denominadores y que las dos constantes de TAPSE sigan siendo **dos** |
| (A) | el TAPSE por 16 / 16,9 / **17 exacto** / 18, más el control de la pestaña VD |
| (B) | el VD/VI por **0,90 exacto** / 0,91 / 1,00 / 0,70, y el rótulo escrito del campo |
| (C) | el corte de la probabilidad de HTP, por su dueño y en sus tres bordes |
| (D4)-(D7) | la ficha: los cortes nuevos con su folio, sin el 497.e17, y la ESC 2019 donde sí |
| (E) | McConnell sin adjetivo en la pantalla **y en la hoja del PDF** |
| (F) | los dos globos: geometría de 44×44 y cada afirmación con su fuente |
| (G) | la línea visible, y que ninguna de las dos frases ni la «Salvedad» entren al papel |
| (H)-(I) | Excel en 440, el Laboratorio, el posoperatorio en el 0,90 exacto y el escenario ajeno |

**Arnés de mutaciones: `scripts/_mut_tep.py`** (14 dirigidas, en worktree, con guarda de md5).
**Sonda de bordes: `scripts/_probe_tepg.mjs`** (A/B de sólo lectura con `--file`).
**Sonda de dos motores: `scripts/_probe_tepwk.mjs`** (ocho cruces).

### Los diez casos viejos adaptados, y por qué siete no los encontró el censo

| Caso | Qué afirmaba | Por qué cambió |
|---|---|---|
| TC-168 | el badge del POCUS en «dilatación (≥1.0)» | el corte y su operador |
| TC-507 | H1, H2, H4 — el corte en 1,0 y la ficha | **las tres invertidas** |
| TC-510 | el denominador, A1-A3, C1-C2, G1-G2 | el corte, y **dos cambiaron de forma** |
| TC-471 · TC-500 · TC-502 | el registro `VINFO` en **60** entradas | hoy son **62** |
| TC-535 | los **seis** globos de 44×44 | hoy son **ocho** |
| TC-534 | (D4) el pie del POCUS y (L4) el corte en 1,0 | **(D4) cambió de forma** |
| TC-544 | (E1) el badge del POCUS | el operador del rótulo |
| TC-537 | que «folio e17» siga en la ficha del POP | **la cita era falsa y se fue** |

⚠️ **SIETE DE LOS DIEZ LOS DESTAPÓ LA CORRIDA COMPLETA.** Seis son **conteos de inventario** —el
tamaño del registro de globos, cuántos miden 44×44, cuántas tarjetas no tienen ficha—: ninguno
nombra lo que esta tanda tocó, así que grepear por «TEP», por el nombre del corte o por la cita
**no los encuentra**. Es el mismo modo de falla que el C2 documenta con TC-520.

⚠️ **DOS TUVIERON QUE CAMBIAR DE FORMA Y NO SÓLO DE NÚMERO.** El denominador de TC-510 medía que
las dos constantes de TAPSE fueran **distintas** (16 contra 17), y hoy valen las dos 17 con
fuentes distintas. Y **(D4) de TC-534** nació para cazar un pie que decía «VD/VI 0,9» escrito a
mano mientras la constante valía 1,0; hoy la constante **vale** 0,9 y el pie lo **deriva**, que es
justo lo contrario del defecto. Buscar el literal ya no distinguía las dos cosas: hoy se exige que
el pie imprima el valor de la constante, sea cual sea.
