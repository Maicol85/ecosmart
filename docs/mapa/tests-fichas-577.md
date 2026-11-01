# Fichas de los casos TC-577 a TC-581 — tanda POP-A (2026-11-01)

Archivo propio porque `tests-fichas.md` está en **34,2 KB**, a 800 bytes del techo de 35 KB.
El mapa de la pantalla es `pa-pantalla-posoperatorio.md`.

---

## ⚠️ Lo primero: el suite corre a 756 px

`test_clinico.mjs` lanza Chrome **sin `--window-size`**, así que la ventana mide **756 px** — por
debajo del corte de 900 de esta tanda. Los cinco casos **no miden el reparto por geometría**: a
756 px las seis tarjetas están apiladas, que es lo correcto. Lo que miden es:

- la **REGLA** de la hoja de estilos, con el ayudante `reglaMedia(min, selector, propiedad)`, que
  recorre `document.styleSheets`, busca la `CSSMediaRule` con ese `min-width` y lee la
  declaración. Es observable a cualquier ancho y es lo que fija el contrato;
- la **ESTRUCTURA**: qué tarjeta está en qué `.pop-col`, cuántos `.pop-mon-c` tiene el Swan, si
  la opción de la asistencia es hermana de grilla del dispositivo;
- el **comportamiento**, que no depende del ancho: el panel absoluto, los espejos, las compuertas
  y el papel.

⚠️ Chrome normaliza `minmax(0, 1fr)` a **`minmax(0px, 1fr)`**: los valores esperados van con el
`px`. Costó una corrida.

La geometría lado a lado la miden `scripts/_probe_pa_inv.mjs` y las cinco sondas de la tanda.

## ⚠️ Lo segundo: los cinco caen contra HEAD por CONDICIONES, no por excepción

Contra `47ff639` faltan los nodos nuevos, y un caso que cae por **excepción** no dice qué
invariante se rompió — lo documenta este repositorio con TC-546. El prelude de los cinco trae
ayudantes **a prueba de nodo ausente** (`csEl`, `csSel`, `csId`, `marcada`, `tieneClase`,
`nOpts`, `opt0`, `hijos`, `qsDe`, `nQsDe`, `atr`, `clic`, `cerca`), que devuelven `'NO NODO'` o
`-1` en vez de tirar.

**Medido en un worktree sobre `47ff639` con el archivo de tests de esta tanda:**

| caso | condiciones en rojo contra HEAD | excepciones |
|---|---|---|
| TC-577 | 18 | 0 |
| TC-578 | 23 | 0 |
| TC-579 | 21 | 0 |
| TC-580 | 25 | 0 |
| TC-581 | 15 | 0 |

---

## TC-577 — las tres columnas, el orden y los rótulos

| bloque | qué fija |
|---|---|
| (A1)(A2) | **denominadores**: la sección abierta y sus **nueve** tarjetas en el documento |
| (B1) | el **orden del marcado**, que es el orden apilado del pedido |
| (C1) | `.pop-cols` reparte en tres pistas **desde 900 px** |
| (C2) | y por debajo es **una** sola |
| (C3) | cada `.pop-col` es `display:flex` con `flex-direction:column` — lo que hace que una columna no mueva a las otras |
| (C4) | `align-items:start` en la fila |
| (D1)(D2)(D3) | el reparto: qué tarjeta cae en qué columna |
| (E1)(E2) | el acordeón del monitoreo y `popMonToggle` **no existen** |
| (E3) | y los siete campos del Swan siguen con su id exacto |
| (E4) | sin dispositivo se dice y no hay recuadro |
| (E5) | **control negativo**: con Swan-Ganz la línea no se dice y el recuadro sí |
| (F1)(F2) | `PAD (PVC) (mmHg)`, con el `(PVC)` en letra más chica **medida** |
| (F3)(F4) | `PSAP` y `PDAP` |
| (F5) | y **ningún** rótulo del módulo dice `PAPs`, `PAPd` ni `PAPm` |
| (F6) | la fila de la resistencia dice `PmAP` |
| (G1)(G2) | **controles negativos**: la «PAP media estimada» de VD/AD y el «TAPSE/PAPs» de la tabla de HTP siguen |

⚠️ **(G2) daba «SE FUE» sobre un rótulo que sigue ahí**: usaba `document.body.innerText`, y el
`innerText` de un nodo oculto es vacío — la tabla de HTP vive en una pestaña que puede no estar a
la vista. Hay que preguntar por `textContent`.

---

## TC-578 — el selector de fármacos y el azul de metileno

| bloque | qué fija |
|---|---|
| (A1)…(A5) | **denominadores**: las once casillas, los once campos de dosis, el menú **cerrado** al nacer y su `aria-expanded` |
| (B1)(B2) | el **orden** de la lista y sus **tres** separadores |
| (C1)(C2) | el panel es `absolute` y tiene **barra propia** |
| (C3) | abrirlo **no mueve** la fila de dosis ni cambia el alto del cuerpo |
| (C4) | y **se superpone** con lo de abajo, que es la prueba de que flota |
| (C5)(C6) | Esc lo cierra y tocar afuera también |
| (D1) | **denominador**: sin nada marcado no hay ninguna fila a la vista |
| (D2) | marcados dos, se ven **exactamente** esos dos |
| (D3) | la ✕ mide 44×44 |
| (E1)(E2) | el azul no declara unidad, ni en el `placeholder` ni en el nombre accesible |
| (E3)(E4) | no está en `POP_DROGAS_PESO` ni en `POP_DROGAS_PATRON` |
| (E5) | **control negativo**: los diez de siempre **sí** están en el patrón (son diez) |
| (E6)(E7) | `popDosisUnid('azul')` es vacío y `popDosisUnid('nor')` es `mcg/kg/min` |
| (E8)(E9) | con la dilución cargada su línea **no** publica `mcg/kg/min` y no le escribe la dosis |
| (F1) | el informe y la hoja del PDF enumeran los dos, **cada uno con su unidad** |
| (F2) | y el **dibujo** no lo nombra |
| (G1)…(G4) | la ✕ desmarca, esconde la fila, borra los cuatro campos y el papel deja de nombrarlo |
| (G5)(G6) | **denominador** y: desmarcar la casilla borra **lo mismo** que la ✕ |

---

## TC-579 — asistencia, monitoreo y datos hemodinámicos

| bloque | qué fija |
|---|---|
| (B1)(B2)(B3) | la opción de cada dispositivo vive en la **misma grilla** que el selector — un item oculto no ocupa pista, así que eso es «la misma fila» |
| (B4) | la grilla reparte en **hasta dos** columnas |
| (B5) | con el balón se ve **sólo** su opción |
| (B6) | **control negativo**: con el Impella, la suya |
| (C1)…(C4) | el Swan en **tres** `.pop-mon-c` y qué campo cae en cuál |
| (C5) | la `PmAP` **no es un campo**: es un `DIV` |
| (C6)(C7) | **denominador** —sin las dos presiones no publica nada— y la media de siempre con ellas |
| (C9)(C10) | el PiCCO en **dos** columnas, con sus cinco campos |
| (D1) | **denominador**: los siete campos existen |
| (D2)…(D4) | la compuerta: sin monitoreo los siete, con Swan sin FC ni PAM, con línea arterial sin PAM |
| (D5) | **control negativo**: con PiCCO los siete, porque no trae ninguno |
| (E0)(E1) | **denominador** y: los cuatro espejos **no** son campos del estudio |
| (E2) | **control negativo**: los dos campos nuevos **sí** lo son |
| (E3)(E4)(E5) | ida, vuelta y borrado de los cuatro |
| (E6) | **lo automático no escribe el estudio**: tras `_recalcModulos` el dueño sigue vacío |
| (F1)(F2) | el relleno capilar y la diuresis se **describen** en el papel |
| (F3)(F4) | **denominador** y: el patrón **no cambia** por ellos, por extremos que sean |
| (F5) | sin ellos no hay línea |

---

## TC-580 — contexto quirúrgico

| bloque | qué fija |
|---|---|
| (A1)(A2) | **denominadores**: la sección abierta y el EN SUMA del módulo **emitiéndose** —sin índice cardíaco calculable devuelve cadena vacía, y un vacío se lee igual que «la línea no cambió» |
| (A3)(A4)(A5) | las once casillas con su id exacto, las once **sí** son campos del estudio y los cuatro selectores de tipo **no** |
| (A6)(A7) | el selector viejo existe y está oculto, **con su vocabulario de siempre y sin una opción nueva** |
| (B1) | la casilla del estudio viejo se ve con la **marca heredada** |
| (B2) | **pero ninguna queda marcada de verdad: el estudio no se reescribe** |
| (B3) | y el campo viejo queda como estaba |
| (B4)(B5) | la etiqueta dice de dónde sale y el bloque de válvulas se abre |
| (B6)(B7) | **controles negativos**: el papel y el EN SUMA dicen **lo mismo** que antes de esta tanda |
| (B8)(B9) | «Combinada» no marca ninguna y la etiqueta lo dice |
| (C1)…(C3) | una marcada escribe su token, el papel la describe y la marca heredada desaparece |
| (C4)(C5)(C6) | dos escriben «combinada» en el campo viejo **pero el papel y el EN SUMA dicen cuáles** |
| (C7) | tres se enumeran con coma y una «y» |
| (C8)(C9) | desmarcar todas vacía el campo: **borrar borra** |
| (D1)(D2) | los cuatro selectores tienen las opciones **de su dueño más una** vacía |
| (D3)(D4) | **denominador** y: marcar una válvula **sin tipo no escribe ninguna morfología** |
| (D5)(D6) | el selector queda vacío y el papel lo dice |
| (D7)(D8)(D9) | elegir el tipo escribe la morfología, aparece «de Válvulas» y el papel lo publica |
| (D10) | y al revés: moverla en Válvulas trae el tipo al posoperatorio |
| (D11) | **control negativo**: una válvula **no** marcada no sale al papel |
| (D12) | sin cirugía valvular el bloque se cierra |
| (E1) | la fila de drenajes reparte en **tres pistas**, así que es una fila a cualquier ancho |
| (E2)…(E5) | **denominador** y la enumeración en el informe y en el EN SUMA |
| (E6) | **ningún dato nuevo llega al Excel**: 441 columnas y cero con datos nuevos |

⚠️ **(E6) daba «1 con datos nuevos» y era mi propio filtro**: un `/drenaj/i` a secas toma la
columna **«CVPA drenaje»**, que es de la conexión venosa pulmonar anómala y existe desde antes.
Hay que nombrar los datos nuevos.

---

## TC-581 — Eco y POCUS, lo que se paró, y la disposición de abajo

| bloque | qué fija |
|---|---|
| (B1) | la tarjeta se llama «Eco y POCUS» |
| (B2)(B3) | el recuadro del eco está **dentro** de ella y **ya no** en la de datos hemodinámicos |
| (B4) | **control negativo**: la concordancia Swan contra eco **sí** se queda allá |
| (B5) | **denominador**: el recuadro del eco publica sus filas |
| (B6) | las tres grillas reparten en **dos** columnas |
| (B7) | **control negativo**: los seis selectores de pleura y pulmón conservan su id y sus opciones (5,5,4,4,5,4) |
| (C1)(C2)(C3) | el dueño tiene cinco opciones, el espejo **las mismas sin una vacía**, y no es campo del estudio |
| (C4)(C5) | elegirlo acá escribe el dueño y **repinta la caja en el gesto** |
| (C6) | y al revés |
| **(D1)(D2)(D3)** | **lo que se PARÓ**: la pleura del posoperatorio gradúa **por lado** y el módulo tiene **un** tamaño con una lateralidad; el neumotórax es un **grado** acá y un **criterio de dos signos** allá |
| (E1)(E2) | las características son una tarjeta propia y su contenido es el **mismo nodo** |
| (E3) | el dibujo se queda **solo** en su tarjeta |
| (E4) | la conclusión va **debajo** de las características, en la misma columna |
| (E5) | el reparto en dos mitades **desde 900 px** |
| (E6) | el envoltorio viejo `.pop-esq-par` ya no existe |
| (E7) | el botón de integrar queda debajo de todo |
| (F1)…(F4) | **denominador** —con datos el dibujo tiene nodos— y: el `viewBox` no se movió, el texto sigue publicando las cavidades, y el SVG **escala con su caja** y no con un ancho fijo |

El bloque **(D)** es el que registra lo que se paró, para que la próxima tanda que lo intente se
encuentre con la medición y no con una suposición.
