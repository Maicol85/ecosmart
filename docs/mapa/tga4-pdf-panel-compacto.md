# TGA-4 — el PDF de la transposición, el panel compacto y la conclusión descriptiva

Mapa de la tanda **TGA-4** (2026-11-02). Por nombre de función y de constante, **sin números de
línea**: la línea cambia en cada edición, el nombre no.

---

## 1 · El recuadro de la hoja de congénitas, sin «Según la guía»

**Dueño: `ccHoja(k, oraciones, conclusion, seguimiento)`.** Es la **plantilla compartida** de las
catorce hojas de congénitas del PDF —sus claves están en `CC_HOJA_TIT` y su orden en
`CC_HOJA_ORDEN`—, y cada hoja vive en un `<textarea>` oculto `cc-txt-<clave>` que `ccHojaBuild`
crea.

El prefijo `'!!Segun la guia: '` se retiró; el `!!` **se queda**, porque es el marcador de bloque
de nota —itálica, ancho completo y filete— y no texto.

**Quiénes lo emitían** (censado): pasan una conclusión no nula `dap`, `vap`, `eisen`, `fontan`,
`mch` y las cuatro del bucle de la tabla de secciones —`ebs`, `tdf`, `tga` y `mca`—. Pasan `null`
y nunca lo emitieron: `cia`, `civ` y `coa`. `fop` y `vab` retiraron su hoja en tandas anteriores.

## 2 · El bloqueo auriculoventricular de la transposición

**Dueño: `tgaConclusion`.** La cláusula «complicación esperable en la ccTGA por la disposición del
sistema de conducción» se retiró del `partes.push` de la rama no descriptiva. **Esa rama la
recorren el switch auricular, la ccTGA y la d-TGA sin operar**, así que nombraba otra anatomía en
dos de los tres. La rama `descriptivo` —Jatene y Rastelli— ya decía sólo el hallazgo desde TGA-3.

⚠️ **Tenía UNA sola aparición en todo el documento** y no vivía en ningún ⓘ ni en Referencias, así
que se fue también de la pantalla. Declarado en `docs/PENDIENTES.md` → **T4-c**.

## 3 · El rótulo de la caja «Tricúspide / PSAP» del PDF

En el **bloque 3** de la primera hoja, dentro de `drawTablaCompacta`. Las cuatro filas de la
**válvula** pulmonar —`V. máx VP`, `G. máx VP`, `Morf. VP` y `DVI VP`— salieron a un **dueño
único**, `_vpFil`, y el título se arma con `_vpHayFil`:

```
'Tricúspide / PSAP' + (_vpHayFil ? ' / Válv. pulmonar' : '')
```

**Las filas no se movieron**: la agrupación del corazón derecho se conserva y lo único que cambia
es el rótulo. Es el mismo arreglo que el bloque ya le había hecho a la **vena** pulmonar seis
líneas más arriba, con el mismo argumento. Por eso dice «Válv. pulmonar» y no «V. pulmonar»: la
caja vecina dice «Vena pulmonar».

El título se achica solo hasta entrar (bucle de `_sz` en `drawTablaCompacta`).

## 4 · El esquema de circulación en el PDF, con el mismo botón que el 3D

| pieza | qué hace |
|---|---|
| `tga3dIncluirPDF` | el ÚNICO botón. Mete el 3D en un slot y dispara la rasterización del esquema en modo **inmediato** |
| `tgaEsqPdfOn()` | la compuerta: el slot del 3D incluido **Y** `_tga3dEsDato()` |
| `tgaEsqPdfRaster(inmediato)` | rasteriza `#tga-esq-svg` con `esqRasterizar`, diferido 700 ms o ya |
| `tgaEsqPdfData()` | devuelve `{data, linea}` sólo con la compuerta abierta |
| `TGA_ESQ_PDF_W/H/AR` | 600 × 580 y la proporción 290/300 del `viewBox` |
| el recolector de `_dg.tga3d` | agrega la **segunda parte** al tile; el motor no se toca |

**El motor ya dibujaba varias partes lado a lado** (`_pdfTile` reparte `box.w` entre
`t.partes.length`), así que esto es una fila más en el array.

⚠️ **La imagen y su línea se toman JUNTAS**, en el mismo instante: el texto sale de
`#tga-esq-txt`, que `tgaEsqSync` acaba de escribir. Leerlo al armar el PDF dejaba una ventana de
700 ms en la que la línea y el dibujo describen escenarios distintos.

⚠️ **Con la compuerta cerrada NO se borra lo ya rasterizado.** `generarPPT` carga el estudio en el
formulario y el tipo queda vacío un instante: la primera versión tiraba el dataURL ahí y, al
volver el formulario, sólo quedaba agendada la rasterización para 700 ms después. **Generar el
PPT y enseguida el PDF perdía el esquema.** Quien publica es `tgaEsqPdfData`, que pregunta por la
compuerta en cada lectura, así que borrar no aportaba nada.

⚠️ **El lienzo del 3D se estampa CUADRADO** porque su parte no lleva `ar` y `_pdfTile` usa
`p.ar || 1`. Es preexistente (TGA-2) → **T4-d**.

## 5 · El panel de Evidencia compacto

### Qué enciende qué

| marcador | quién lo pone | qué hace |
|---|---|---|
| `compacta: true` | la sección | pliega TODAS las notas en el ⓘ y marca `data-ind-compacta` |
| `preguntas: true` | la sección | marca `data-ind-preg` → las dos columnas por ancho de **panel** y el botón |
| `data-ind-cols` | `_indColsSync` / `_indColsToggle` | `"2"` o `"1"`; el botón además pone `data-ind-manual` |
| `IND_COLS_CORTE` | — | **900 px de PANEL**, no de ventana |

**Por qué se mide la caja y no la ventana:** el panel sin maximizar mide **820 px** tanto a 1440
como a 1000 px de ventana, así que una media query sobre la ventana le daría dos columnas de 410
en los dos casos. Las **ocho** secciones compactas anteriores NO llevan `data-ind-preg` y su media
query de 1200 px queda intacta (lleva un `:not([data-ind-preg="1"])`).

### El tercer estado

`IND_SD_VAL` (`'__sd'`) e `IND_OPS_SD` (`{v:'__sd', t:'?'}`). Lo ofrecen `TGA_IND_OPS`, `CIA_OPS`
y `CIV_OPS`.

⚠️ **Pone `null` y no la cadena vacía**: medio panel pregunta `val == null` para decidir si una
condición está sin contestar —`_indPregNota` lo usa para decir «sin dato no cuenta como no»— y una
cadena vacía no es `null`. La traducción vive en **un solo lugar**, el manejador de clic de
`_indClinCablear`, que es el único que escribe la respuesta.

⚠️ **Y es lo que puso la fila en UNA línea.** Medido: con dos opciones la celda de botones quedaba
en **60 px** y los dos botones de 44×44 se **apilaban** — la fila medía 104 px. Con tres se
enciende el piso de `min-width:170px` que `_indFilaHTML` ya tenía para las botoneras de más de
dos, y la fila baja a **55 px**. Las notas ya estaban plegadas antes: pasar a compacto sin esto
**subía** el alto.

### La etiqueta de guía

`_indPregBadge(p)` → `{g, cn, guia}`, con `IND_GUIA_CORTA`. La clase y el nivel se **leen** del
texto que la tabla de preguntas ya escribió en `rec`, y **falla cerrado**: sin el patrón, publica
sólo la guía y nunca una clase inventada. Se dibuja en `_indFilaHTML` **después** del rótulo
escapado, como el ⓘ de término y por el mismo motivo.

### El aviso por pregunta

`_indFilaOrigen(lbl, o, ops, pinta, sinAviso)`. ⚠️ **`sinAviso` lo pasan SOLO las secciones que ya
dicen la frase en su pie.** Censado: de las diez secciones que usan el molde, **cinco no la
tienen** en sus `notas` —`_indEM`, `_indFOP`, `_indAo`, `_indVAB` y `_indEP`—, así que quitarla del
molde a secas las dejaba sin un solo aviso. La pista «Si ya está cargado en su pestaña, aparece
acá solo» **no se va**: no es el aviso de persistencia.

### Los grupos

`TGA_IND_GRUPOS` y el campo `gr` de cada pregunta de `TGA_IND_PREG.aur`. **Sólo el switch
auricular**: en los otros cuatro paneles de la transposición, y en la CIA y la CIV, no se inventa
ninguno. Una fila `{grupoHdr}` la dibuja `_indFilaHTML` como un `<tr data-ind-grupo="1">` con
`colspan`. `_pregOrden` **no filtra**: lo que sobra después de los cuatro grupos se agrega al
final, así que agrupar no puede perder una pregunta.

### El contador y la lista

El contador es la primera fila de `clinica`, de los **mismos** tres arreglos que alimentan el
balance. La lista «Recomendaciones que aplican con lo contestado (n)» es un bloque al final y
**sólo sale si hay alguna en «Sí»**: un bloque con `(0)` sobre un panel sin contestar se lee como
que no aplica ninguna.

## 6 · La conclusión de pantalla de la transposición, descriptiva

`tgaConclusion` devuelve `txt` con la **misma cadena** que `papel`. `resumen` y `clave` **no se
mueven**: el Laboratorio clasifica por la rama y `TGA_CONDUCTAS` documenta el criterio de cada
una, así que las siete frases de conducta siguen vivas en el código.

**Ningún número medido desaparece**: la obstrucción subaórtica se sigue publicando como dato, con
su gradiente. Lo que sale es el veredicto y el «por encima de 50 mmHg».

Lo que se pierde de la pantalla y qué respalda la Evidencia está en `docs/PENDIENTES.md` →
**T4-b**; el corte de 50 mmHg, en **T4-a** y en `docs/fuentes/FUENTES.md` → «La tanda TGA-4».

## 7 · Las sondas

| sonda | qué mide |
|---|---|
| `scripts/_probe_tga4ab.mjs` | el A/B de superficies, 29 escenas, con PDF y PPT generados de verdad |
| `scripts/_probe_tga4pdf.mjs` | la geometría del PDF: 9 escenarios × 2 temas × 6 plantillas |
| `scripts/_probe_tga4pan.mjs` | el panel: alto, filas, citas, columnas, contador y los tres estados |
| `scripts/_probe_tga4concl.mjs` | la conclusión, rama por rama: `txt`, `papel`, `resumen` y `clave` |

⚠️ **Trampas que estas sondas pagaron**, para no volver a pagarlas:
- `window._tga3d` **no está en `window`**: es un `const` de módulo. La señal de que la librería 3D
  cargó es `#tga-3d-cv canvas`.
- Con la sección ya abierta, **nada vuelve a disparar el arranque** de la librería: hay que
  re-despachar el `change` del tipo.
- `String.replace` con una cadena cambia la **primera** aparición: la palabra que el runner usa
  como marcador no puede aparecer en un comentario dentro del template.
- El slot del dibujo **no lo borra `limpiarCampos`** y se filtra de una escena a la otra.
- Una **barra invertida simple no sobrevive al template literal**: `\d` llega como la letra `d`.

---

## 8 · Lo que la tanda PANT-2 cambió de este panel y de este recuadro (2026-11-02)

- **El esquema del PDF salía con las cajas NEGRAS y el texto en serif.** TGA-4 verificó la
  GEOMETRÍA de esa hoja pero no los colores: el marcado se rasteriza fuera del documento, donde
  `var(--bg)` no resuelve y `fill` cae en su valor inicial, que es negro. Lo cierra
  `esqSvgParaRaster`, dentro de `esqRasterizar`.
- **`tgaEsqPdfData()` ya no devuelve `linea`**: el recuadro decía el escenario DOS veces, y ahora
  su dueño único es `tga3dLineaPDF`.
- **Las filas del panel compacto de preguntas pasan a dos columnas** y su botonera a 32 px
  visibles con 44 de área táctil: el alto del panel de la transposición baja de 1156 a 738 px
  maximizado. El marcador `data-ind-preg` no cambió.

Todo en `docs/mapa/pant2-correcciones.md`.
