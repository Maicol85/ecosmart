# Fichas de los casos de prueba · TC-674 a TC-679 (tanda PANT-11, 2026-11-04)

Archivo propio: `docs/mapa/tests-fichas.md` está en **34.237 B**, a menos de 1 KB del techo de
~35 KB, así que las fichas de esta tanda salen acá en vez de engordarlo.

Los seis **caen contra la línea base de la tanda** (`cf04f84`, el cierre de PANT-10) por **87
condiciones y NINGUNA por excepción**, verificado en un worktree alternando sólo `index.html` con
el mismo archivo de casos. Las ocho `EXC` que aparecen están **dentro** de una condición, atrapadas
por su propio `try`, y se publican como valor: ningún caso muere por excepción, que es la lección
de TC-546.

---

## TC-674 · el papel de Ebstein y de Eisenmenger (commit 1)

**Denominador**: `ebsConclusion` devuelve una conclusión con `txt` y con `papel`; la PANTALLA sí
trae el índice por su nombre propio; con la sección integrada el informe nombra la anomalía de
Ebstein; `eisenEstado` dice que hay datos y publica alertas; la Evidencia de Ebstein abre con ese
escenario.

| grupo | qué fija |
|---|---|
| (A) | los denominadores de Ebstein |
| (B) | el papel sin los **once** marcadores, la pantalla CON el apellido y la guía —el control positivo—, la relación de áreas y su grado publicados con el MISMO valor que la pantalla, y la línea de electrofisiología fuera del papel y dentro de la pantalla |
| (C) | las superficies con la sección integrada: informe en los TRES estilos y EN SUMA en los tres |
| (D) | **CONTROL**: sin integrar, el informe no nombra Ebstein |
| (E) | Eisenmenger: «30 a 50 %» y no «>50 %», sin nombrar la guía, sin «marcador de mal pronóstico», sin «masivo y fatal», con la alerta de la saturación crítica **viva** y la franja de la pantalla diciendo «30 a 50 %» |
| (F) | la Evidencia conserva la conducta con su guía, su clase y su folio, y el globo conserva el ORIGEN del índice |
| (G) | **CONTROL**: un estudio ajeno no nombra ninguna de las dos lesiones ni trae los marcadores |

⚠️ **Dos premisas mías que la medición corrigió al escribirlo.** (1) El globo `cc9-ebs-cel` **no**
trae el κ de 0,39 —PANT-10 lo retiró porque ninguna de las 248 fuentes lo publica—, así que (F2)
exige lo que el globo SÍ conserva: la serie de 50 neonatos, el «orientativo», el «ESC 2020» y el
apellido. (2) El escenario necesita las **CINCO** áreas y `ebs_desplazamiento` por encima del
umbral: con una sola área el índice sale «no calculada, faltan…» y (B3) medía sobre un denominador
vacío; con el desplazamiento en 12 el informe no nombraba la lesión.

⚠️ **El PDF y el PPT los mide el A/B de la tanda, que los genera de verdad**, y el caso lo dice
para que su cero no se lea como que las cuatro superficies están cubiertas.

---

## TC-675 · el TDE y el TRIV intercambiados (commit 2)

**Denominador**: la grilla tiene sus **dieciséis** celdas y las dieciséis tienen un campo con `id`.

| grupo | qué fija |
|---|---|
| (A) | los dieciséis con su campo |
| (B) | la columna 2 es `thp, triv, tde, onda_l`; **CONTROL**: las otras tres columnas no se movieron, nombradas una por una; y los dieciséis ids son los mismos |
| (C) | el orden del **MARCADO** —medido por la posición del nodo en el documento, no por la clase— y que la grilla no declara **ningún** `tabindex`, que es lo que hace que el Tab siga al marcado |
| (D) | cada valor va a SU campo, los dos siguen llamando a `calcDiastol` y el rótulo de cada celda nombra lo que esa celda contiene |
| (E) | el papel: el informe y el EN SUMA **no nombran ninguna de las dos siglas**, emitir no les pisa el valor, **ninguno tiene columna de Excel** y los dos sí llegan a la evaluación de la diastólica |

⚠️ **La primera versión de (E) buscaba las dos siglas en el informe y medía sobre un denominador
vacío:** el informe no las nombra y ninguna tiene columna, así que el intercambio de celdas no
puede mover el papel **por construcción** — y eso es lo que el grupo (E) fija hoy.

---

## TC-676 · la casilla «(no se visualiza VCI)» (commit 3)

**Denominador**: el botón y el campo persistido existen; los dos campos de la cava tienen valor y
la PmAD se derivó; antes de «Nuevo estudio» la casilla está marcada y hay una marca guardada.

| grupo | qué fija |
|---|---|
| (A) | es un `BUTTON`, reusa `.pac-id-mk` + `.vci-nv-mk`, el estado vive en `aria-pressed`, el rótulo dice «(no se visualiza VCI)», el área mide **44 × 44** y los **cinco** puntos dan el propio botón |
| (B) | **CONTROL**: sin marcar, el informe NO dice la frase |
| (C) | marcado: el campo pasa a «1», los dos campos quedan vacíos y **deshabilitados**, el valor viejo queda en `data-vciprev`, la PmAD se vacía, el informe dice la frase **una sola vez**, y `vciNoVisOn` lee también un estudio guardado por su argumento `src` |
| (D) | idempotencia, y que `vciNoVisSync` va **PRIMERO** en `RECALC_MODULOS` |
| (E) | desmarcado: los dos valores vuelven, los campos se habilitan, la marca se borra y el informe deja de decir la frase |
| (F) | «Nuevo estudio»: el campo persistido queda vacío, el `aria-pressed` vuelve a `false`, los dos campos quedan limpios y sin marca, y el informe del estudio nuevo no dice la frase |
| (G) | **CONTROL**: `vci_no_vis` no tiene columna de Excel |

⚠️ **Dos trampas pagadas al escribirlo.** La VCI vive en `#tab-vd` y no en una pestaña «vdad»: sin
abrirla el botón informa 0 × 0 y los cinco puntos dan cero. Y **`#sacc-ad` nace plegado con una
transición de 0,3 s**, así que hay que abrir el acordeón y apagarle la animación: con el acordeón
cerrado los cinco puntos devuelven `sacc-hdr` o `app-content`, que se lee como que el área táctil
no existe.

---

## TC-677 · la profundidad de coaptación (commit 4)

**Denominador**: las dos secciones del ETE abren por su encabezado real y los dos campos existen.

| grupo | qué fija |
|---|---|
| (A) | los denominadores y que el par entra en `_ETEM_VELOS`, el dueño único del gesto |
| (B) | el gesto en los **dos** sentidos, y que el **borrado** viaja igual |
| (C) | la reconciliación completa lo vacío en los dos sentidos, es **idempotente** y cuelga de `RECALC_MODULOS` |
| (D) | con los dos cargados y **DISTINTOS** no toca ninguno |
| (E) | **CONTROL**: el flail gap y el ancho del flail no se mueven y no están en el registro |
| (F) | **CONTROL**: sin integrar el módulo, el informe no publica el veredicto del TEER; y los dos rótulos siguen **distintos** |

⚠️ **Los campos viven en dos secciones que nacen plegadas**, y hay que abrirlas por su encabezado
real: un campo en `display:none` no acepta el gesto — la trampa que esta tanda pagó con `page.fill`,
que se agotó esperando un campo invisible.

⚠️ **El rótulo NO lleva `for`**: va como texto del `label` contenedor, así que se busca por el
`.fg` del campo.

---

## TC-678 · el eco pulmonar (commits 5, 6 y 7)

**Denominador**: los tres campos nuevos existen; con el módulo integrado el informe habla del
derrame pleural; con el formulario limpio el posoperatorio NO está en uso; con un campo propio del
posoperatorio cargado SÍ lo está; el lienzo tiene nodos dibujados.

| grupo | qué fija |
|---|---|
| (A) | los tres campos, los MISMOS valores en el mismo orden que el posoperatorio, y los dos legados **deshabilitados** |
| (B) | la derivación: una pleura, las dos con el **MAYOR**, la traducción «leve» → «mínimo», «ausente» que no es un derrame, y la **guarda** que no le borra el tamaño a un estudio viejo |
| (C) | la reconciliación en los dos pares de legado, **idempotente**, y las dos colgadas de `RECALC_MODULOS` |
| (D) | el papel sigue describiendo el derrame con la palabra del legado |
| (E) | la **GUARDA** del espejo —sin el posoperatorio en uso el básico no le escribe nada, y los cinco campos espejados no cuentan como «en uso»—, el sentido inverso **sin** guarda, la consolidación con su lado, y los **CONTROLES** de lo que NO se sincroniza: el hemotórax y las líneas B «difusas» |
| (F) | el dibujo: su estado sale de los campos, la consolidación sólo del lado consignado, la descripción nombra los dos lados, **seis repintados no mueven un solo campo**, el pie dice que es ilustrativo, **ni un nodo sale de `innerHTML`** y nada llega al papel |

---

## TC-679 · las masas, la tabla, los globos y las dos fichas (commits 8 a 11)

**Denominador**: las tres secciones de Otros existen; la tabla tiene su encabezado de siete
columnas; las dos entradas están en el registro de globos; las dos fichas existen; la masa sí llega
al informe.

| grupo | qué fija |
|---|---|
| (A) | las tres secciones son **HERMANAS** de la pestaña y cada una tiene **exactamente un** encabezado de acordeón; los nueve campos viven en Otros con caja; ningún id cambió; y la sección vieja dice «Pericardio» |
| (B) | la tabla con sus **siete** filas de cuerpo, las siete celdas de cada fila con entidad y fuente, el scroll **propio** de su contenedor y la página sin scroll horizontal |
| (C) | los dos globos con su clase de 44 px, su geometría, sus folios, la guía del de endocarditis, y que ése vive en la fila de la **vegetación** |
| (D) | las dos fichas dentro de `#ref-sub-otros`, en **`REF_SUBTAB`** —la lección de la tanda J—, con sus **14** y **18** filas, la frase de que la guía de la ASE no trae algoritmo propio, y las dos **indexadas** por el buscador |
| (E) | **CONTROLES**: ni la tabla, ni los globos, ni las fichas llegan al papel; ningún campo de masa ganó columna de Excel; y la pestaña Pericardio conserva sus tres campos |

⚠️ **(A1) y (A2) son los que encontraron el `</div>` de menos del commit 8**, y por eso se miden
por la **cadena de padres** y por el conteo de encabezados: el DOM quedaba balanceado y la pantalla
no tenía un síntoma visible.

⚠️ **La frase del algoritmo va en minúscula en la ficha**: mi primera versión de (D5) buscaba un
«NO» en mayúscula y medía sobre una frase que sí estaba.
