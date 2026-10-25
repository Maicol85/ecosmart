# Mapa — las DIECISIETE correcciones de la verificación · tanda «AJ2» (2026-10-23)

Lo que esta tanda movió, **por nombre de función y de constante**. No lleva números de línea a
propósito: la línea cambia en cada edición, el nombre no.

Los **doce commits**, en orden de aplicación. **El orden de revertido seguro es el inverso.**

| # | commit | ítem |
|---|---|---|
| 1 | `089e668` | AJ2-1 · «sin datos» no es «no medible» |
| 2 | `f65047e` | AJ2-3 · el tipo de IM vacío es un tercer estado |
| 3 | `cb6ba3e` | AJ2-15 · la diastólica no clasificable |
| 4 | `8e45a13` | AJ2-5 · la coartación sin gradiente |
| 5 | `0ca05ee` | AJ2-13 · los dos buscadores |
| 6 | `af4d3db` | AJ2-14 · la orejuela |
| 7 | `dbc1104` | AJ2-7a · el ateroma sin riesgo embólico |
| 8 | `dca63bf` | AJ2-7b · el grosor completa el grado |
| 9 | `84cd343` | AJ2-16a · el rótulo del score en /6 |
| 10 | `bb0d75e` | AJ2-4 · la tricúspide dice por qué su Evidencia no se abre |
| 11 | `de02fa7` | AJ2-10a y 10b · un solo vocabulario de sobrecarga del VD |
| 12 | `b5bfc1b` | TC-519 (cobertura de los once anteriores) |
| 13 | `ae0ea04` | AJ2-6 · la aorta deja de graduar |
| 14 | `c0c8322` | AJ2-8 · el HF-PEFF |
| 15 | `6921614` | AJ2-9 · el eco pulmonar |
| 16 | `fad2854` | AJ2-12 · el EN SUMA |
| 17 | `3a8f0f3` | AJ2-11 · las tildes |
| 18 | `0a3fdef` | AJ2-10c · la maqueta del TEP |
| 19 | `7154eda` | AJ2-17 · CLAUDE.md |

⚠️ **LAS DEPENDENCIAS DURAS.** El **18 cuelga del 11**: su adaptación de TC-510 reescribe el
filtro del conteo del informe que el 11 cambió, así que revertir el 11 sin revertir antes el 18
deja ese caso midiendo un sintagma que ya no existe. El **16 cuelga del 7**: su corrección del
mapa del ateroma del informe es la mitad que el 7 no había alcanzado, y revertir el 7 sin el 16
deja el papel diciendo «alto riesgo embólico» con la pantalla ya sin él. Los demás **no se
nombran entre sí**.

---

## AJ2-1 · «sin datos» NO es «no medible»

**El dueño es `htpVrtSinDatos(vrtSel, vrtCat)`**, declarado al lado de los cortes de la VRT y
exportado a `window`. Devuelve `true` sólo con `vrtCat === 'nomedible'` **y** `vrtSel` distinto de
`'nomedible'`, o sea el camino **automático sin chorro de IT medible** — el otro, «No medible»
ELEGIDA por el médico, conserva su cláusula palabra por palabra.

Las cinco superficies, cada una con su vocabulario y todas leyendo el predicado:

| superficie | pieza | qué dice sin datos |
|---|---|---|
| pantalla | `calcHTP2022` → `vrtTxt` → `htp2022-vrt-interp` | «VRT sin datos» |
| informe | el bloque de HTP de `generarInforme` | **no nombra la VRT** y pasa directo a los signos |
| ETT avanzado | `amiloTextoHTP` | lo mismo que la pantalla |
| PDF | la hoja de HTP | ídem |
| Evidencia | `_indHTP` → la fila de la velocidad pico | «sin datos» |

⚠️ **LA HOJA Y LA PANTALLA SON UN SOLO DUEÑO POR CONSTRUCCIÓN**: `amiloTextoHTP` lee
`_amTxt('htp2022-vrt-interp')`, o sea **el mismo nodo** que el médico tiene delante. No hay dos
textos que puedan divergir.

---

## AJ2-3 · el tipo de IM vacío es un TERCER estado

`REPAR_SIN_MEC_TXT` y la rama de tres estados en la reparabilidad mitral:
`mec === 'primaria'` → `REPAR_PRIM_TXT` · `mec` con valor → `REPAR_NO_SEC_TXT` · **`mec` vacío →
`REPAR_SIN_MEC_TXT`**. El vacío es como nace el selector, o sea el estado **más frecuente**, y
caía en el texto de «el mecanismo consignado no es secundaria», que afirma que hay un mecanismo.

---

## AJ2-4 · la tricúspide dice POR QUÉ su Evidencia no se abre

`ET_EVID_AVISO_TXT` y `etEvidAvisoSync()`, llamada desde `calcET` **antes de su salida temprana
por prótesis** y desde el oyente de documento de `it_grado`.

⚠️ **LA COMPUERTA SE LE PREGUNTA A `_indVT` Y NO SE COPIA.** El aviso sale sólo cuando la
estenosis está marcada **y** `_indVT()` devuelve `null`. Con una lista de campos escrita a mano,
el día que la sección gane un insumo el aviso seguiría pidiendo los viejos.

⚠️ **Y EL TEXTO NOMBRA LOS INSUMOS QUE DE VERDAD LA ABREN, que es un desvío del literal de la
orden.** Medido: `it_vmax_cw = 3.2` deja `_indVT()` en `null` —la Vmax de la IT sola no gradúa la
regurgitación—, así que un texto que la pidiera mandaría al médico a cargar un campo que no abre
nada. Dice: gradiente medio, área valvular o VTI de entrada, **o** insuficiencia tricuspídea
moderada o mayor.

---

## AJ2-5 · la coartación sin gradiente

`COA_SIT_APOS` es el dueño de la **aposición** («nativa», «post-cirugía», «post-stent»,
«recoartación post-intervención») y `coaConclusion` devuelve `{clave:'incompleto', apos, txt}`.
El informe la pega en `p[0]` —el sujeto— y **no** emite el `c.txt` cuando la clave es
`incompleto`: con las dos, el párrafo decía «Coartación de aorta» **dos veces** y pedía un estudio
(«completar con Doppler de aorta descendente e imagen»).

El EN SUMA sale por un `return l` antes del append de «en seguimiento — datos incompletos».

⚠️ **CON GRADIENTE LA LÓGICA QUEDA LITERAL**, medido: la clave deja de ser `incompleto` y el
párrafo vuelve a llevar su `c.txt` con los criterios de significación.

---

## AJ2-6 · la aorta no gradúa su dilatación

`aoSegGrado(sg, x)` devuelve hoy `'normal' | 'dilatada' | 'fuera'`. **El corte no se movió**:
sigue siendo `sg.ref` con el operador de `aoSegDil` —`incRef:true` en el seno de Valsalva, o sea
los 40,0 mm exactos cuentan—. Lo que se retira es el reparto por encima.

Los campos `leve` y `mod` de `AO_SEGS` **se fueron con sus dos asserts de arranque**: un centinela
que compara dos números que nadie lee afirma, por su propio mensaje de error, que algo los
gobierna.

Los consumidores, uno por uno: `calcAorta` (la cápsula, «Dilatada (≥40mm)»), `AO_BADGE_COLOR` (de
cuatro colores a dos), el narrativo (un solo adjetivo, con la concordancia de género por `sg.m`),
la tarjeta ⓘ (sondea la clave `'dilatada'` y no `'leve'`) y `vabConclusion`.

⚠️ **LA CLAVE `dilatacion_leve` DE `vabConclusion` NO SE TOCA**: el Laboratorio clasifica estudios
guardados por ella. Lo que cambia es cómo se escribe.

**Referencias (`ref-ao2`) ya decía sólo «dilatada»** y las dos tablas del PDF imprimen el valor y
un asterisco: no graduaban. El EN SUMA tampoco.

---

## AJ2-7a y 7b · el ateroma

**7a**: `descripciones` sin la cláusula de riesgo embólico, `const riesgos` retirado entero y la
fila de riesgo **escondida con su `.calc-row`** (`style.display = 'none'`), no sólo vaciada.
`recomendaciones` de los grados 3, 4 y 5 sin «placa irregular» y sin riesgo.
**Fuente**: Nicoara, ASE/SCA 2020, **folio 716** (pie impreso «716 Nicoara et al»), hoja 25:
publica los grados por **espesor creciente** y las limitaciones de la medición por ETE
(«highly subjective»), y **no publica un riesgo embólico por grado**.

⚠️ **Y 7a HABIA QUEDADO A MEDIAS: EL RIESGO EMBOLICO SEGUIA VIVO POR TRES CAMINOS, Y DOS SON EL
PAPEL FIRMADO.** Lo destapó **MIRAR una captura** —ninguna medición numérica lo veía, porque la
fila de pantalla sí estaba escondida—:
1. con **placa MÓVIL** y grado < 5, `calcAteroAo` hacía `riesgoEl.innerHTML = badge('red','Muy
   alto — placa móvil')` sobre el span que 7a acababa de esconder. `display:none` **no** afecta a
   `textContent`, así que `_amTxt` lo leía y la hoja del ETE publicaba
   **«Riesgo embólico | Muy alto — placa móvil»**;
2. la `<option>` del desplegable se llamaba **«Móvil — alto riesgo embólico»**, y `_amSelTxt` lleva
   la ETIQUETA de la opción a la hoja: **«Movilidad de la placa | Móvil — alto riesgo embólico»**.
   Hoy dice «Móvil» y **el `value` no se tocó** (`movil`), que es lo que viaja con el estudio;
3. la tabla de **Referencias** (`ref-ao`) publicaba una columna «Riesgo embólico» con
   Mínimo/Bajo/Moderado/Alto/Muy alto **por grado**.
Y la rama sin grado escribía `'—'` en ese span, que es **truthy**: la hoja publicaba el rótulo con
una raya. Hoy el span queda **vacío** por los dos caminos y la línea `L.push('Riesgo embólico…')`
de la hoja **se retiró**.
⚠️ **AL SACAR EL `badge` ME LLEVÉ EL `rec +=` DE LA LÍNEA DE ARRIBA**, y la medición lo destapó: la
frase «Con componentes móviles, la escala de Nicoara clasifica el ateroma como grado 5 con
independencia del espesor» desapareció de la hoja. Repuesta. **Al retirar una línea, mirar qué se
lleva con ella.**

**7b**: `ateroGradoPorGrosor` → `ateroGradoAuto()` / `ateroGradoManual()` / `ateroGradoReset()`.
El origen vive en `dataset.auto` y `dataset.manual`, que **no se persisten** —el patrón del
selector de VD/VI del G3— y se publica en el `<span id="ao-grado-auto">`.
Las cuatro reglas: 5 mm exactos → grado 3 · más de 5 → grado 4 · **el del médico manda** · borrar
el grosor borra el automático y **no** el manual. `ateroGradoReset()` va al final de
`limpiarCampos`, anclado al comentario de `vpSync` porque ese nombre aparece **dos veces**.

---

## AJ2-8 · el HF-PEFF

`hfapeffFeviGate` publica `sinFevi(s)` donde publicaba `verificar(s)`: «FEVI no cargada (el
HFA-PEFF se aplica con FEVI ≥50 %).» Se conservan las **dos redacciones** —`msg` para el PDF, que
va en helvetica WinAnsi y descarta el «≥» en silencio, y `msgUI` para pantalla— con el símbolo
como parámetro.

`hfapeffConclusion` nombra el dominio humoral **sin su aclaración entre paréntesis**: ese nombre
se interpola DENTRO de «(puntaje parcial: …)».

**La negrita de la hoja**: el armador `amiloDibujarSecciones` tenía `##` para subtítulo, `!!` para
nota y ` | ` para fila, y **ninguna forma de destacar**. Entra el marcador **`**` al principio de
una fila de tabla** = la columna del VALOR en negrita. Es aditivo (medido: ninguna de las otras
seis hojas empieza una línea con `**`) y **se mide con la fuente que se va a dibujar**, porque la
negrita es más ancha y partir en normal subestima el alto.

---

## AJ2-9 · el eco pulmonar

`pulAvPatron` devuelve «Líneas B aisladas.» donde devolvía «Líneas B aisladas: hallazgo focal,
puede ser inespecífico.» — esa frase viaja al CUERPO del informe por el «Patrón global» del
bloque 13c.

**`pulAvZonasTxt()`** agrupa por nivel con `PUL_ZONA_NIVEL`: la misma zona en los dos hemitórax
sale «anterior bilateral», una sola conserva su nombre completo, y el orden es el de
`pulAvZonas()`, o sea el de la pantalla.

⚠️ **EL CORTE DE «difusa» SE CUENTA SOBRE LAS ZONAS Y NO SOBRE LOS RÓTULOS**: con «anterior
bilateral» dos zonas se escriben en un texto, así que contar rótulos subiría el umbral de cinco
zonas a ocho, que no existen.

**`enCuerpo:true`** en el registro de `amiloSecs` reemplaza al `d.k !== 'pulm'` que el armador del
PDF tenía cableado, y el banner de la tarjeta lo nombra. Eran **tres copias** de la misma decisión
y el banner era la que se había quedado atrás.

---

## AJ2-10 · el score de TEP

**`tepVeredicto(score, total)`** y `TEP_VD_SIGNIF_MIN = 4` son el dueño único de las tres
superficies: pantalla, informe y bloque del ETT avanzado. Sin probabilidad diagnóstica, sin
conducta y **sin graduar** con palabras que la ESC 2019 no publica para este recuento.

El informe publica `'… ' + score + ' de ' + _tepTotal + ' criterios positivos.'`, con `_tepTotal`
arrancando en 3 (los tres cualitativos) más uno por cada cuantitativo cargado.

El título, en la pantalla y en la hoja: «Evaluación de sobrecarga del VD».

**(c) la maqueta**: tres grupos con su título —CRITERIOS DE SOBRECARGA DEL VD · ÍNDICES · SCORE—
con 14 px entre ellos, y **el TAPSE/PSAP una sola vez**: `tep-acoplamiento` era un segundo span
que recibía el MISMO texto que `tep-tapse-psap`, y la hoja lo publicaba dos veces (442 → 416
bytes). Las etiquetas nombran el parámetro porque el span ya escribe la sigla con su valor.

---

## AJ2-11 · las tildes

**41 corregidas, 3 declaradas.** El censo se mide en lo **renderizado** —los literales del archivo
incluyen miles de líneas de comentarios y de identificadores— sobre cinco superficies: el DOM
(rótulos, opciones, placeholders, titles, aria-labels), las tarjetas ⓘ **ejecutando** cada entrada
de `VINFO`, las secciones de `IND_SECS`, las fichas de Referencias pintadas, y los generadores.

Las 3 que quedan son la **cita literal en inglés** de la ESC/EACTS 2025 («elliptical regurgitant
orifice **area**»), contada tres veces por el anidamiento del DOM.

⚠️ **EL DICCIONARIO SÓLO LLEVA PALABRAS INEQUÍVOCAS.** El primer censo dio 74 y 33 eran falsos
míos: «auricular», «presiones», «dimensiones», «mediciones», «regiones» y «funciones» **no llevan
tilde**. Las contextuales —«mas», «si», «aun», «solo», «este»— quedan fuera por lo mismo.

---

## AJ2-12 · el EN SUMA no niega lo que el informe describe

**Dos causas, un dueño cada una.**

**(A1)** El bloque ETE no llamaba a `ccMarcarParrafo()`: escribe en el CUERPO —la mitral de ETE
con su Wilkins, la orejuela con su trombo, el ateroma, las mediciones, las congénitas— y el
fallback negaba todo. Cubre `etem`, `teer`, `wilk`, `oai` y `aoete`.

**(A2)** Siete módulos no escriben en el cuerpo sino su **hoja** del PDF, así que `_ccHuboParrafo`
no podía verlos. El fallback gana un segundo destino, `_ccMods`, **derivado de `amiloEnInforme()`**
y exigiendo texto. El texto de HEAD se conserva byte por byte cuando el único destino es el cuerpo.

**Las tres líneas nuevas**: el Wilkins con su **tramo** de `WILK_TRAMO`; el trombo de orejuela sólo
confirmado o sospechado —«sin trombo» y «no evaluada» no son hallazgos—; el ateroma **desde el
grado 3**, con el texto del mismo mapa que el cuerpo.

**El inventario medido: 11 de 16 módulos publicaban la negación global. Hoy: 0.**

---

## AJ2-13 · los dos buscadores

`_buscaCompacta(s)` = `_refNorm(s)` sin guiones ni espacios. `_buscaDoc(s)` le saca además los
puntos, para nombres y documentos. El índice de Referencias guarda las dos formas (`txt`, `txtC`)
y `refBuscar` matchea cualquiera; `igFiltrar` (Guardados) gana `termN`/`termC`/`termD` y **sólo
agrega**.

⚠️ **EL PUNTO DECIMAL NO SE TOCA EN `_buscaCompacta`**: «0,42» sigue encontrando «0.42» y «1.5» no
colapsa con «15».

---

## AJ2-14 · la orejuela

El rótulo pasa a «Zona de anclaje — Amplatzer Amulet» y las dos ramas de profundidad colapsan en
«Profundidad N mm; ostium M mm»: el dato y nada más.
**Fuente censada**: ASE ETE (Hahn, JASE 2021), **folio 50** (pie impreso «50 Hahn et al»): la
profundidad y la zona de anclaje se **miden** en cuatro planos (Figura 27) y advierte que los
dispositivos nuevos son más cortos y conformables, así que «measurements of the usable length of
the LAA may not be orthogonal to the LAA orifice». **No publica ningún criterio de profundidad
contra ostium**, así que no queda criterio que marcar con el chip: queda una medición.

---

## AJ2-15 · la diastólica no clasificable

`diastASE2025Evaluar` publica «Función diastólica no clasificable con los datos cargados (falta e'
septal o lateral).» donde publicaba «Completar e' septal y/o lateral para clasificar.»

⚠️ **DOS FRASES PARECIDAS QUE NO SE TOCARON Y SE REPORTAN**, por no estar en la lista:
«Completar los parámetros de función diastólica para clasificar.» (ASE/EACVI 2016) y
«…completar los parámetros del segundo paso (Vol AI, LARS, S/D o TRIV).» (ASE 2025, no estimable).

---

## AJ2-16 · los dos rótulos

**(a)** el rótulo del score de TEP decía `(+/7)` y `calcTEP` cuenta **seis** criterios —contados
sobre sus seis `criterios.push`—, con el span de al lado publicando «N criterios positivos» sobre
ese mismo denominador.

**(b) NO SE ENCONTRÓ, y no se inventó.** Censados los **15** ids que nombran la PSAP y sus
escritores: `psap_calc` es un `input readonly` escrito con `.toFixed(0)`; `psap-interp` y
`tep-psap-interp` lo leen; `hb-psap-val`, `ht-psap` y `lab-psap-prom` usan `toFixed(0)`;
`cx-tp-res` imprime el **cociente** con `toFixed(2)` y `cx-gtp-papm` es la PAP **media** con
`toFixed(1)`. Ninguna PSAP sin redondear.

---

## Las trampas de esta tanda

1. **`foco()` revienta en un checkbox**: `setSelectionRange` **existe** en
   `HTMLInputElement.prototype` y sólo lanza para `type=checkbox`, así que la guarda
   `e.setSelectionRange ? … : 0` no protege. El `chk()` de la sonda tiene su propio camino de foco.
2. **`IND_SECS` es `[{tit, fn}]`**, no una lista de funciones: llamar `f()` nunca matchea y la
   sonda informa «sin sección» sobre un panel que pinta.
3. **Un `assert` que falla en un script de edición no aplica NADA**, porque la escritura va al
   final. Pasó dos veces, las dos por anclar a un fragmento que aparece más de una vez
   (`etePars.push(p.join('. ') + '. ' + c.txt + '.')` x3, `if (typeof vpSync === 'function')` x2).
4. **El buscador de Guardados no lee una clave de `localStorage`**: `getInformes()` une
   `CeiboStore.getChunk()` con `getLocal()`, así que inyectar en una clave inventada se lee igual
   que «la búsqueda no encuentra nada».
5. **`amiloImprimirPDF('ett')` no imprime la hoja del HFA-PEFF**: imprime el módulo `ett`, y la
   medición sale con la hoja de AMILOIDOSIS —23 textos, 7 en negrita, todos títulos— con pinta de
   medición buena. Esa hoja viaja en el PDF del INFORME, y su puerta es `generarPDFReal`.
6. **La clave del módulo es `hfpeff`, no `hfapeff`**, y sin INTEGRAR el módulo su hoja no entra.
7. **Tres ids de la sonda que daban «el defecto sigue»**: la frecuencia del PostCEC es
   `pop_sw_fc`, ese módulo exige `pop_monitor` **y peso y talla** —su `hayDatos` es
   `popPatron().suficiente`, que necesita el ÍNDICE cardíaco— y el e′ septal de
   constricción/restricción es `cvr-esep`, con guión MEDIO.
8. **Un regex con barra escapada se cocina dentro del template de la sonda**: `/TAPSE\/PSAP/`
   revienta con «Invalid regular expression flags». Va por `indexOf`.
9. **Un lector que busca `' de '` desde el principio de la línea** toma el de «ecocardiográfica
   DE sobrecarga», que está ANTES del «: », y `Number('')` da 0: tres condiciones informaron
   «informe=0» sobre una línea perfecta.
10. **Una regla retirada sigue en el fuente si la nombra un comentario**: la condición que
    comprueba que `d.k !== 'pulm'` se retiró informó «cableado: true» sobre un armador correcto.
11. **`scripts/check_backticks.py` da falsos sobre una concatenación legítima** `` `…` + k + `…` ``
    y **no alcanza un `ev()` suelto**: el acento grave de un comentario mío dentro del template de
    la sonda pasó su chequeo y lo cazó `node --check`. **Correr los dos.**
12. **Correr dos sondas en paralelo** con `2>&1` mezcla el stderr con el JSON y el lector revienta
    donde no es. En serie y con el stderr aparte.

---

## Cómo medir esta zona

`scripts/_probe_aj2.mjs`, A/B de solo lectura con `--file`. Grupos: `htp`, `repar`, `diast`,
`coao`, `busca`, `oai`, `atm`, `et`, `tep`, `aorta`, `hfp`, `pulm`, `suma`, `tildes`, `tepmaq`.

**Cobertura: TC-519**, con un grupo por ítem: (A) AJ2-1 · (B) AJ2-3 · (C) AJ2-4 · (D) AJ2-5 ·
(E) AJ2-7a y 7b · (F) AJ2-10 y 16a · (G) AJ2-13 · (H) AJ2-14 · (I) AJ2-15 · (J) AJ2-6 ·
(K) AJ2-8 · (L) AJ2-9 · (M) AJ2-12 · (N) AJ2-11 · (O) AJ2-10c · (Z) el denominador global.

---

## ⚠️ La tanda AJ7 cerró AJ2-i (24/10/2026)

La fila **«Clasificación — descripción»** del ateroma se **esconde** de la pantalla y su línea
**`Descripción | …`** sale de la hoja del ETE. Quedan las otras dos. El span `ao-atero-desc` se
**conserva**: lo escribe `calcAteroAo`, lo barre `limpiarCampos` y la guarda `if (d || r || rec)`
decide si hay bloque «Valoración» que emitir.

**`docs/mapa/aj7-correcciones.md` § 2.**
