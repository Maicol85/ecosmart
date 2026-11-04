# PANT-7 — la medición de cierre: el A/B final y los dieciséis cruces

Partido de `docs/mapa/pant7-vd-cia-globos.md` el 2026-11-04, **antes** de que cruzara el techo
de 35 KB: ese mapa quedó en 34.775 B y esta sección lo pasaba. Acá vive la § 8; el resto de la
tanda está allá.

**Cero líneas perdidas:** la sección se movió tal cual, verificado una por una.

---

## 8 · La medición de cierre

### 8.1 · El A/B final, con el PDF y el PPT generados de verdad

**66 escenas, 75.356 claves comparadas y 29.106 celdas de Excel.** El arnés es
`scripts/_probe_pant7ab.mjs` —copia del de PANT-6— más dos escenas propias, `p7dap` y `p7dapNo`,
que la tanda tuvo que agregar: el rótulo «PAPs» lo escriben **cuatro** emisores y el del **ductus**
no tenía ninguna escena, así que sin ella el A/B medía el cambio en tres de los cuatro y el cuarto
quedaba sin denominador.

**31 diferencias de superficie firmada, en SIETE escenas, y las 31 son las autorizadas:**

| escena | diferencias | qué cambia |
|---|---|---|
| `p6forrNada`, `p6forrIc` | 2 + 2 | se va «Perfil de Forrester (estimado por eco): no determinable»; el PDF pasa de 86 a 85 textos |
| `p6ccNadaInt` | 1 | se va la línea de corrido de los bordes de la CIA; 122 → 119 textos de PDF |
| `p6ccCiv`, `p6ccDos`, `p6ccDosInt` | 6 + 6 + 7 | «PAPs» → «PSAP» |
| `p7dap` | 7 | «PAPs» → «PSAP» en el cuarto emisor, el ductus |

**Las otras 59 escenas dan CERO**, `p4vacio`, `p4ajeno`, `p6ccCia`, `p5ccCia` y `p7dapNo`
incluidas. **Cero escenas con el juego de campos distinto** y **cero con el juego de columnas
distinto**: 441 → 441 clave por clave, y los únicos campos con valor distinto son los cuatro
espejos de texto autorizados —`am-txt-hemo`, `cc-txt-civ`, `cc-txt-dap` e `informe_texto`—.

⚠️ **El `_campos` crudo difiere en TODAS las escenas, y es el falso positivo que PANT-5 ya
documentó:** sus claves salen de un `querySelectorAll`, o sea **en orden del DOM**, y el commit 8
movió dos campos de columna. El comparador oficial ordena los pares, así que no lo reporta.

### 8.2 · Chrome y WebKit, dieciséis cruces, con su control contra HEAD

Dos motores × 1440, 1000, 768 y 390 px × dos temas, con `scripts/_probe_pant7wk.mjs`.
**Cuatro diferencias entre motores en total, y las cuatro son 4 px de alto** en dos tarjetas a
390 px — métrica de fuente. **Cero errores de página**, y el **único** error de consola es el
`ERR_FILE_NOT_FOUND` del arnés, **idéntico en HEAD**, que la tanda D2 ya documenta: el árbol se
carga de una copia en el temporal.

| clave | HEAD, 1440 oscuro | nuevo, 1440 oscuro | nuevo, 390 claro |
|---|---|---|---|
| caja del dibujo | 520 × 832,2 | **220 × 300** | 328 × 240 |
| letra del rótulo | 4.2px | **5.2px** | 5.2px |
| los dos rótulos | «Septumdesplazado \| McConnell» | **«SIV desplazado \| Sg McConnell»** | ídem |
| tspans | 2/1 | **1/1** | 1/1 |
| resalte con 59 ms | sin rótulos | **`var(--orange)` en los dos** | ídem |
| resalte con 60 exactos | — | **vacío** (control negativo) | vacío |
| ⓘ del Tei | **sin botón** | 420 × 414, dentro, 3.783 caracteres | 374 × 635 |
| ⓘ del 60/60 | **sin botón** | 400 × 490, dentro, 1.233 caracteres | 374 × 414 |
| los dos botones nuevos | — | **44 × 44** | 44 × 44 |
| ⓘ del TRVI de Doppler | **NO ABRE** | **abre**, 2.486 caracteres | abre |
| ⓘ de la pleura del posoperatorio | **NO ABRE** | **abre**, 750 caracteres | abre |
| franja del TEER, caracteres | **0** (la vació `limpiarCampos`) | **50** | 50 |
| franja del TEER, color | rgb(252,165,165) | rgb(252,165,165) | **rgb(185,28,28)** |
| cartel de la orejuela, cuerpo | **12px : 2.653 caracteres** | **11px : 2.653** | 11px : 2.653 |
| fila de Wilkins | sin regla | **lado a lado** | apilado |
| campos de Wilkins | — | **1 columna** | 1 |
| fila de la orejuela | incompleta | **dibujo a la derecha, conclusión debajo** | apilado |
| fila de la aorta del ETE | sin regla | **lado a lado**, 2 columnas | apilado, 1 |
| columnas de la VAB | −1 | **4**, con el resumen dentro | 4 |
| ids y globos de la VAB | 21 / 6 | **21 / 6** | 21 / 6 |
| desplazamiento horizontal | 0 | **0** | 0 |
| textos recortados | 0 | **0** | 0 |
| letra de `#vinfo-card` | 11px | 11px | 11px |

⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
`channel: 'chrome'`.

⚠️ **La sonda midió sobre denominadores vacíos TRES veces antes de servir, y cada una costó una
corrida.** (1) Los cuatro globos daban 0 × 0 y «NO ABRE» porque abrir la **pestaña** no alcanza:
cada clave vive además en un **acordeón** que nace cerrado. (2) Las secciones del ETE **no tienen
un handler `onclick` con su id** —las abre `toggleEteSeccion` con el nombre—, así que buscar
`[onclick*="ete-seccion-wilkins"]` devuelve null y la fila queda con sus dos hijos en 0 × 0, lo
que la sonda informaba como «un hijo». (3) **La letra del cartel de la orejuela no se mide en
`#vinfo-body`**: el `font-size` que ese cartel se fijaba a mano vivía en un contenedor **interno**,
así que preguntarle al cuerpo daba 11px en los **dos** árboles y la clave no distinguía nada. Hoy
se cuentan los caracteres de cuerpo **por tamaño**, que es la misma cuenta del barrido de las 122
claves.
