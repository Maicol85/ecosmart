# Mapa de la TANDA CORRECCIONES (2026-10-30)

Seis commits de código. Qué mueve cada uno, quién es su dueño, qué se midió y qué se paró.
Los números de línea NO se guardan a propósito: la línea cambia en cada edición, el nombre de
la función no.

---

## 1 · El informe de la orejuela, sin veredicto

**Dueño:** el párrafo «3. Elegibilidad cierre percutáneo OAI» dentro de `generarInforme`.
Su compuerta es `oDiam || oProf`, que **no es la misma** que la del párrafo de arriba
(`hasOAI` = velocidad, contraste, trombo o lóbulos). Por eso esta oración puede salir **sola**,
y por eso lleva sujeto propio.

| | HEAD | hoy |
|---|---|---|
| con trombo | `ostium 26 mm, profundidad 37 mm — no apto para cierre percutáneo (trombo presente).` | `Orejuela izquierda: ostium 26 mm, profundidad 37 mm.` |
| sólo ostium | `ostium 22 mm.` | `Orejuela izquierda: ostium 22 mm.` |

**«trombo presente» no se repite**, y es la regla R4 ganándole al ejemplo de la orden: con
`oai_trombo = 'si'`, `hasOAI` es **siempre** verdadero, así que el párrafo anterior ya publicó
«Orejuela izquierda con trombo confirmado». Medido.

**El gate de los lóbulos NO se tocó.** `oLob === '3' && oTrombo !== 'si' && oTrombo !== 'sospecha'`
sigue en pie: la nota «Considerar mayor complejidad para el cierre percutáneo» sigue sin
aparecer con trombo.

**El hecho vive en la Evidencia**, en `_indETETrombo`, bloque «Trombo y cierre percutáneo —
consenso EHRA/EAPCI (folio 1401)», con la clave `meier2014` nueva en `IND_REFS`.

### El barrido 1c — qué dice el papel firmado

Censados **64 escenas y 1.315.598 caracteres** de superficie firmada (informe en los tres
estilos, EN SUMA, el PDF generado de verdad y el PPT) contra trece palabras de veredicto y
conducta. **Tres frases distintas, y nada más:**

| frase | módulo | superficies | qué se hizo |
|---|---|---|---|
| «no apto para cierre percutáneo (trombo presente)» | orejuela | informe ×3, PDF | **retirada** (COR-1a) |
| «Considerar mayor complejidad para el cierre percutáneo.» | orejuela (3+ lóbulos) | informe ×3, PDF | **reportada, no tocada** → `COR-a` |
| «El grado VEXUS debe integrarse con la clínica…» | VExUS | informe ×3, PDF | **reportada, no tocada** (1c prohíbe tocar lo que no es orejuela) |

El **EN SUMA no publica ninguna** y el **PPT tampoco**.

---

## 2 · Un solo corte de 75 ms, y la frase de elementos a favor de HTP

**Una sola constante: `DT_TRIV_HTP = 75`, operador estricto.** `DT_TRIV_HTP_PANEL` **se retiró**
—no quedó como alias— y con ella el párrafo que declaraba que los dos umbrales tenían que seguir
separados. Es una **reversión pedida** (decisión del médico del 9 y del 30/10), no un defecto.

**Los dos lectores** son `dopTricEstado` (que alimenta `htpIndirectosFrase`, o sea el informe
firmado) y `_dtTrivRefTxt` (las dos filas de referencia de pantalla).

### Las tres formas de la oración — un dueño, cuatro ramas que lo consumen

`_htpInd`, dentro de `generarInforme`, justo antes de las cuatro ramas de `tricLine`:

| escenario | texto |
|---|---|
| IT **declarada** sin Vmax, con elementos | `Velocidad de la insuficiencia tricuspídea no medida; con elementos a favor de hipertensión pulmonar (…).` |
| **sin** IT, con elementos | `Con elementos a favor de hipertensión pulmonar (…).` |
| IT medida, sin rango de HTP, VD disfuncionante | `Presenta elementos indirectos de HTP (…) (gradiente AD-VD probablemente subestimado por disfunción del VD).` |
| el resto | `Presenta elementos indirectos de HTP (…).` |

**Ningún corte nuevo.** «Sin rango de HTP» es `HTP_VRT_BAJA_MAX` (2,8 m/s inclusive, ESC/ERS 2022,
Figura 5, folio 28). «VD disfuncionante» es **`vdDisfPresente()`**, el `OR` de cinco parámetros
—TAPSE, S′, FAC, Tei y el strain de pared libre, cada uno sólo si está medido— que
`generarInforme` ya calculaba a mano. Hubo que extraerlo porque vivía como `const` dentro de un
bloque que **cierra 1.800 líneas antes** de la línea tricuspídea.

⚠️ **La otra cuenta de «disfunción del VD» de la app NO es ésta.** La vista 2D cuenta cuántos de
`tapse-interp`, `sprime-interp` y `fac-interp` dicen «disfunci» para elegir el trazo del dibujo:
tres parámetros, no cinco, y no afirma nada en ninguna superficie firmada. → `COR-c`.

**La frase (ii) es un CRITERIO DE ECOSMART sin fuente verificada**, y va rotulada así en el ⓘ
«El TRIV del ventrículo derecho» y en la Evidencia de HTP (`_indHTP`, bloque «Lo que esta
aplicación agrega y la guía no publica»).

**La categoría de probabilidad de HTP no cambia**, medido en las 64 escenas sobre
`htp2022-prob`, `catA`, `catB`, `catC` y `vrt-interp`: cero diferencias.

---

## 3 · La grilla de VD/AD, 3 × 6

| | columna 1 | columna 2 | columna 3 |
|---|---|---|---|
| 1 | TAP (`tvia`) | VD basal | Diám. TSVD |
| 2 | TAPSE | VD medio | VTI TSVD |
| 3 | S′ (`s_prime`) | VD longitudinal | Diám. arteria pulmonar |
| 4 | **TRIV (`vd-triv`)** | VD/VI + selector | Área telediastólica |
| 5 | strain de pared libre | pared del VD | Área telesistólica |
| 6 | **índice de Tei** | **FEVD** | FAC |

**La fila 7 del CSS se retiró.** 18 = 3 × 6 sin un solo hueco, así que los espacios entre campos
quedan iguales. **El orden del marcado es el nuevo orden visual**, que es lo que fija el Tab:
no hay ni un `tabindex`.

El **VD/VI y su selector** comparten una fila `flex` (1 y 1,15 de ancho, `min-width: 0`,
`flex-wrap`), con el rótulo debajo y un `aria-label` en el `<select>`, que ya no lleva rótulo
delante en el orden de lectura.

⚠️ **El cuadro de referencias de abajo NO se reordenó**, y el renglón del código que decía que
lo seguía dejó de ser cierto. → `COR-b`.

---

## 4 · La raíz en Marfan y el índice de Turner

**4a — la lectura.** `marfan-ao-lectura` es un `<span>` de guión **medio** (fuera del recolector
del estudio) que `marfanSync` pinta con `Seno de Valsalva N mm — tomado de AI/VI` **sólo cuando
`marfan_ao_seno` está vacío**. No escribe nada.

El **espejo condicional del G-4 no se tocó**, y su motivo sigue vigente: poblar `marfan_ao_seno`
en todo estudio con aorta encendería la tarjeta de aortopatía, metería esos estudios en el panel
«Marfan/EHAT» del Laboratorio y le pondría valor a una columna de Excel.

⚠️ **Con el síndrome ya elegido la lectura sale VACÍA, a propósito**: ahí el módulo está «en uso»
y el espejo ya llenó el campo propio. La escena del médico es la raíz cargada en AI/VI **con el
módulo sin tocar**.

**`marfanSync` entra en `ESPEJOS_VIVOS`** porque sólo pinta — `marfan_ita` sigue sin que nadie lo
escriba desde el B2.

**4b — el mensaje.** Nombra lo que falta uno por uno y **dónde se carga cada cosa**:

| escena | mensaje |
|---|---|
| sin ascendente | `… falta la aorta ascendente de esta pantalla.` |
| sin ascendente ni peso | `… faltan la aorta ascendente de esta pantalla y el peso (en «Datos»).` |
| nada cargado | `… faltan la aorta ascendente de esta pantalla, el peso (en «Datos») y la talla (en «Datos»).` |

⚠️ **`ao_tub` de AI/VI NO está espejado con `marfan_ao_ascendente`**: el espejo del G-4 cubre
sólo la raíz. Por eso el mensaje dice «de esta pantalla». → `COR-d`.

---

## 5 · «Incluir en el PDF», independiente y con interruptor

**El inventario 5a, medido generando el PDF de verdad sobre HEAD:** el botón **no incluía nada**.
Llamaba a `esqGuardarComoImagen`, que exige Config prendido **y** el estudio ya guardado, y
escribe en la lista `esqs` de IndexedDB; **`CeiboImg.leer` devuelve sólo `imgs`**, así que
`imgRestaurar` nunca traía los esquemas a `imgSlots`, que es **lo único que el PDF imprime**.

**El mecanismo nuevo:** `esqIncluirEnPDF(clave, …)` pone el esquema como un **slot de
`imgSlots`**, la lista en memoria de las imágenes del estudio. `esqQuitarDelPDF` lo saca y
`esqEstaIncluido` lo contesta. De ahí salen las tres propiedades, sin un campo guardado nuevo:

| | Config OFF | Config ON |
|---|---|---|
| PDF antes del clic | 0 imágenes | 0 |
| PDF después, **estudio sin guardar** | **1** | **1** |
| PDF tras volver a apretar | 0 | 0 |
| al guardar → imágenes en disco | 0 | **1** |

En **HEAD las seis celdas dan 0** y el botón nunca cambia de color.

**El botón es un interruptor**: `✓ Incluido en el PDF` + `btn-primary` + `aria-pressed`.
**Una sola imagen de esquema por estudio**: el slot se identifica por `esqClave` y se reemplaza.
**La elegida explícitamente gana**: el guardado automático diferido ya no cuelga del uuid —que
vale `null` mientras el estudio no esté guardado— sino de que haya un esquema incluido.

⚠️ **`_oaiEsqManualUuid` se olvida en «Nuevo estudio»**, por `oaiEsqOlvidarManual()`, que es una
función exportada: la variable vive en **otro bloque `<script>` inline**, así que una asignación
directa desde `imgVaciar` habría creado otra global sin un solo error.

---

## 6 · La orejuela portada de la demo

`docs/3d/demo_orejuela_esquema_aprobado.html` es la referencia. **`OAI_ESQ_PATHS`, `OAI_ESQ_LOBES`
y `OAI_ESQ_TIP` ya eran idénticos a la demo**: lo que faltaba era otra cosa.

| lo que el médico vio | la causa | qué se hizo |
|---|---|---|
| «dice Veleta y debe decir Manga de viento» | el rótulo del `<option>`, del ⓘ, de Referencias, del Excel y del Laboratorio | **rótulo** cambiado en los cinco; el `value` `veleta` **no se toca** (campo guardado) y el importador acepta las dos escrituras |
| «la orejuela es muy oscura y no se ve el contraste» | la silueta se dibujaba en **una** capa de acento a opacidad 0,9; la demo usa **dos** | dos capas: contorno de acento y relleno `--esq-acento-bg` |
| «el trombo queda FUERA de la orejuela» | la app lo ponía en `OAI_ESQ_TIP`, la **punta** de la línea guía, donde la silueta ya se afinó | `_oaiSpec`, el **receso** que `_oaiTaper` calcula con `o.rec`/`o.ti`, **más un `clip-path`** por la unión de las siluetas |
| «falta dibujar la aurícula izquierda» | la portada se había quedado con una curva de anillo reinterpretada | las **dos capas** de la demo, cuyo borde inferior **es** el plano del anillo |
| «sobra el triángulo que simula el VI» | dos curvas que bajaban a (99,232) y (110,230) | **omitidas**; el rótulo «VI» se conserva porque la demo lo lleva |
| «la línea del ostium está mal dibujada» | grosor 2,5 y punta cuadrada contra el `.ms` de la demo (3 y punta redonda) | grosor **3** y `stroke-linecap: round`, también en la de profundidad |
| «la coliflor no se parece» | mismo `LOBES`, pero una sola capa y sin `spec` | las dos capas y `_oaiSpec = {cx:240, cy:170, ang:35, rx:10, ry:15}`, que es el de la demo |

**Faltaba además la VPSI**: había sólo el rótulo suelto, nombrando un hueco. Hoy es la elipse de
la demo con el rótulo adentro.

**Dos variables de tema nuevas**, con los valores de la demo en los dos temas:
`--esq-superficie` (su `--surface-2`) y `--esq-acento-bg` (su `--bg-accent`). Llevan prefijo
propio porque lo único que las usa es el dibujo.

**El velo afectado NO se agregó** (6c): la app no tiene ese campo y el chorro queda central.

---

## Las sondas de esta tanda

| archivo | qué mide |
|---|---|
| `scripts/_probe_corab.mjs` | el A/B de superficies, 64 escenas, con el censo de veredictos del barrido 1c |
| `scripts/_ab_cordiff.mjs` | el comparador, que separa superficie firmada de pantalla |
| `scripts/_probe_corimg.mjs` | el commit 5, **generando el PDF de verdad** y leyendo el disco |
| `scripts/_probe_cordemo.mjs` | la comparación obligatoria 6b contra la demo, por geometría |

| `scripts/_mut_cor.py` | las **24 mutaciones dirigidas**, en worktree y con guarda de md5 |
| `scripts/_probe_corwk.mjs` | los dos motores, seis anchos y dos temas |

⚠️ **TRES de las 24 mutaciones NO revierten nada: la aplican DE MÁS.** La 05 hace que la oración
de la orejuela vuelva a repetir el trombo que el párrafo de arriba ya dijo, la 08 que el
paréntesis del gradiente subestimado salga también con el ventrículo derecho **normal**, y la 14
que la lectura de la raíz **escriba** en el estudio en vez de sólo mostrarse. Existen porque las
condiciones que las matan son **controles negativos**, y un control negativo que ninguna mutación
puede romper no está probando nada.

⚠️ **DOS rompen las dos mitades a la vez**, que es la lección del D-11: la 06 cambia la
**constante** del TRIV —o sea la pantalla y el papel juntos—, y la 21 rompe las **dos capas** de
la silueta, porque con una sola rota la otra sigue dibujando y el conteo por trazo seguiría dando
dos.

⚠️ **Cuatro trampas de instrumentación que esta tanda pagó**, y las cuatro están en los
comentarios de sus sondas:
1. `MONTAR.replace('CFG', …)` pega **primero en `IMG_CFG_KEY`**, que está en el cuerpo, y deja el
   parámetro sin definir. El marcador tiene que ser `__CFG__`.
2. `generarPDF` **a secas no emite nada** en estos arneses: el espía devolvía **cero** llamadas a
   `text`, o sea que «0 imágenes» no probaba nada. El que emite es `_pdfAjustarA4`.
3. `page.evaluate` de Playwright **no tiene timeout**: la primera corrida de `_probe_cordemo`
   quedó dormida a 0 % de CPU. Cada `evaluate` va con reloj.
4. **Clickear el botón de forma de la demo que YA estaba apretado la devolvía a su forma de
   fábrica.** En la escena `sec_trombo`, que viene después de `forma_cactus`, la demo medida era
   «manga de viento» —dos trazos de silueta en vez de seis—, y los 13 px de diferencia que eso
   producía se leían como una diferencia del dibujo de la app. Se pone el `<select>`, que es
   idempotente. Y el detector del triángulo del VI matcheaba la **valva posterior**, que también
   arranca en «M48 164»: se veía en que su ancho cambiaba con el grado de la insuficiencia, cosa
   que un trazo estático no hace.

---

## → La TANDA AJUSTES-1 (2026-10-30) — puntero

Vive en **`docs/mapa/aj1-orejuela-pdf-ensuma.md`**, en archivo propio. Lo que esta zona
perdió o ganó:

- **§ 1** · la nota «Considerar mayor complejidad para el cierre percutáneo» —que el COR-1a
  había dejado en pie con su gate— **sale del papel**, y el gate con ella: el veredicto de
  aptitud del que dependía ya no existe. Era una de las dos frases que el barrido 1c había
  reportado sin tocar, así que `COR-a` queda reducido a la de VExUS.
- **§ 1** · la pastilla de «Medidas de la orejuela» pierde su última rama de juicio, «NO apto
  — trombo presente». Cierra `E-d`.
- **§ 5** · el esquema incluido con «Incluir en el PDF» ya **no se imprime dos veces**: con la
  sección de la orejuela integrada va junto a su tabla y sale de la página de imágenes.

