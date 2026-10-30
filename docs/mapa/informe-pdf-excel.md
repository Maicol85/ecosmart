<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->
# Mapa de funciones — informe narrativo, EN SUMA, PDF y Excel

> ⚠️ **TANDA Y3d (2026-10-19) — EL PDF LLEVA EL DIBUJO DE LA VÁLVULA AÓRTICA BICÚSPIDE Y SU TABLA**
> cuando el botón «Incluir en el PDF» está tildado, y **no se toca** cuando no. El detalle, la
> guarda que evita una tabla sobre una sección vacía y por qué las palabras de la tabla son las
> MISMAS del informe están en `docs/mapa/vab-bicuspide.md` → §7. **El Excel sigue en 440 columnas
> y no gana ninguna por esto.**

Dice *qué función emite cada superficie de salida*.

Las cuatro superficies **se rompen por separado**: tienen emisores distintos y ninguna deriva de
la otra. Un dato que se carga y no aparece en ninguna de las cuatro desapareció sin aviso.

---


> ⚠️ **EL ESQUEMA DE LA MITRAL DEL PDF CAMBIÓ DE DIBUJO** (tanda «Y3c», 2026-10-18).
> `eteQxDataURL` tenía los seis paths del dibujo viejo escritos a mano; hoy dibuja el canvas desde
> la **misma geometría que la pantalla**, siempre en la **vista del cirujano** y **sin la línea del
> plano**. La caja pasa de 120 × 66,9 mm a **100 × 100 mm** y `checkPage` de 92 a 125; **lo
> incluyen las SEIS plantillas**. Detalle en `docs/mapa/mitral-dibujo-estatico.md` § 7.

## Las cuatro superficies, una por una

| Superficie | Función de entrada | Destino del texto/dato |
|---|---|---|
| Informe narrativo | `generarInforme` (entrada de UI: `generarInformeConEvolucion`) | textarea `informe_texto` |
| EN SUMA | `generarInforme` — mismo recorrido, acumulador `suma` | textarea `en_suma` |
| PDF del informe | `generarPDF` → `_pdfAjustarA4` → `generarPDFReal` | archivo jsPDF (A4) |
| Excel del Laboratorio | `labExportarXLSX` / `labExpConfirmar` → `_labExportarXLSXReal` | libro XLSX, hoja «Estudios» |
| PPT (cuando aplica) | `generarPPT` | archivo `.pptx` (PptxGenJS) |

Las dos primeras **salen de la misma función**: `generarInforme` llena dos arrays (`inf` y `suma`)
y los escribe con dos llamadas a `_infEscribir`. Eso significa que una sección puede escribir
cuerpo y **no** conclusión, o al revés — no son la misma superficie aunque compartan emisor.

---

## Informe narrativo y EN SUMA

`generarInforme` — recorre todas las secciones clínicas y arma los dos textos del estudio; con
`opts.silencioso` refresca sin pisar lo que escribió el médico — lee: los campos del formulario
vía `v()` / `sv()` (`fevi`, `ddfvi`, `dsfvi`, `siv`, `ppvi`, `tapse`, `s_prime`, `onda_e`,
`onda_a`, `e_sep`, `e_lat`, `ai_vol`, `ai_diam`, `ai_area`, `psap_calc`, y los grados
`im_grado`, `ia_grado`, `it_grado`, `em_grado`, `ea_grado`) — escribe: `informe_texto` y `en_suma`
— llamada por: `generarInformeConEvolucion` (los dos botones «Generar Informe» / «Regenerar
Informe») y en modo silencioso por el refresco de los módulos.

**Las frases de la ESTENOSIS MITRAL viven dentro de `generarInforme`**, en tres tablas por clave de
`emCategoria()`: `EM_CAT_EST` (estándar y narrativo, que comparten la cadena), `EM_CAT_CORTO`
(conciso) y `EM_CAT_SUMA` (EN SUMA). Desde el 2026-10-11 son **dos** frases y no cuatro:

| clave | estándar / narrativo | conciso | EN SUMA |
|---|---|---|---|
| `severa` | `estenosis significativa (…)` | `EM significativa (…)` | `EM significativa.` |
| `gradiente` | `estenosis no significativa, con gradiente elevado (…)` | `EM no significativa, …` | `EM no significativa.` |
| `gradiente_im` | `gradiente transmitral elevado` | idem | `Gradiente transmitral elevado.` |

El detalle entre paréntesis lo arman `_emDatos` / `_emSignifTxt` / `_emElevTxt`: el **peor** AVm
primero con su «por {método}» y los otros marcados detrás con «;» y **sin paréntesis propio**; el
gradiente va primero cuando el criterio es sólo él; y el rótulo «por {criterio}: » **se omite con un
solo dato**. El EN SUMA **no lleva criterios** (pedido de Maicol): el número sale en el cuerpo, en
la tabla del PDF y en el Excel. El slot entra a `estiloPick(conciso, estándar, narrativo)`.

La fila **«EM grado» del PDF** usa `emGradoVis(sv('em_grado'))` y **no** `_cap`: el valor guardado
sigue siendo `severa` y lo impreso es «Significativa».

`_infEscribir(id, lineasNuevas, silencioso, base)` — escribe un array de líneas en un textarea y
devuelve la nueva base de procedencia; en silencioso delega en `_infMerge` para conservar lo manual
— escribe: el textarea `id` (`informe_texto` o `en_suma`) — llamada por: `generarInforme`, 2 veces.

`_infMerge(base, actual, nuevo)` — reconstruye por diferencia qué líneas escribió la app y cuáles
el médico, para no borrar las manuales en un refresco silencioso.

`_infBase` / `_sumaBase` — arrays de líneas (o `null`) con lo último que escribió la app. Son la
base del merge y **viajan con el estudio**: `guardarInforme` las serializa en `campos`
(`informe_base`, `suma_base`), porque si vivieran sólo en memoria el primer refresco después de
reabrir se llevaba el texto manual. `_infBaseAjena()` / `_infBaseDelDOM` distinguen «la base es de
la app» de «la base la tomé del DOM al cargar un estudio»; de eso depende que un refresco
silencioso actúe o quede inerte.

`ccHojaReset` — vacía las catorce hojas de congénitas **antes** de recorrer las secciones;
`generarInforme` la llama al principio. Sin eso, destildar una CC dejaba su texto en el PDF.

`generarInformeEcoEstres` — emisor del módulo de eco estrés; sus líneas entran al informe general
vía `eeInformeLineas()`, que `generarInforme` concatena en la sección «Eco Estrés».

### El EN SUMA en particular

- El acumulador se llama `suma`; las líneas de congénitas van aparte (`sumaCCLineas`, por el helper
  local `sumaCC`) y se vuelcan al final con rótulo propio, para que no queden tipográficamente
  iguales a «IT leve.».
- `_ccHuboParrafo` es la prueba de que una sección de congénitas escribió cuerpo. Gobierna el
  *fallback*: con `suma.length === 0` y párrafo escrito sale «Sin otras alteraciones… — ver los
  hallazgos descritos en el cuerpo del informe»; sin párrafo, «Estudio sin alteraciones
  estructurales ni funcionales significativas.».
- El EN SUMA guardado es además **dato de lectura** del Laboratorio: `_labTxt(inf)` concatena
  `en_suma` + `informe_texto` y varios paneles grepean ese texto, así que cambiar una frase puede
  mover una estadística.
- Funciones con «suma» en el nombre que **no** son el EN SUMA: `dptSuma`, `cvrSuma`, `ccSumaLinea`,
  `popSumaLinea`, `pulAvSuma`, `dptMandaSuma` — constructores de línea de sus módulos que
  *entregan* texto al acumulador. `_pptEnSuma` es el emisor de la diapositiva, no del textarea.

---

## PDF del informe

`generarPDF` — punto de entrada del botón; si la severidad valvular no está confirmada abre
`mostrarCardSeveridadValvular` y recién después sigue — llama a `_pdfAjustarA4`, nunca a
`generarPDFReal` directo.

`_pdfAjustarA4` — mide el informe con varios pasos de `_PDF_A4_PASOS` (`sp` = aire, `fs` = cuerpo
de letra) en modo `medir:true` y elige el primero con el cuerpo en una hoja; una medición que
lanza se descarta y se sigue, con `console.error`.

`generarPDFReal(_aj)` — dibuja el PDF entero con jsPDF (A4, portrait, mm) — `_aj.sp`, `_aj.fs`,
`_aj.medir`; con `medir:true` corta temprano y devuelve `{pagCuerpo, guardado:false}` sin dibujar
ETE/ETT avanzado, imágenes ni pie — llamada por: `_pdfAjustarA4` únicamente.

`_sanML` (dentro de `generarPDFReal`, delega en `amiloSanPDFml`) — saneador WinAnsi de **todo**
texto que salga por `doc.text`/`splitTextToSize`. Sin él un solo carácter fuera de WinAnsi (`≤`,
`≥`, un apóstrofo pegado de Word) hace que jsPDF pase la cadena entera a UTF-16 y esa línea salga
con otra letra. `amiloSanPDF` es la variante de una línea.

`vPdf(id, uni, dec)` — texto de una celda numérica del PDF: consulta `vPlaus(id)`, imprime siempre
el número y le agrega `MARCA_REVISAR` (` (revisar)`) si cae fuera de banda; devuelve `null` si el
valor es falsy — lo llaman las filas de las tablas del PDF — ⚠️ no verificado: cuántas son hoy.

`vPlaus(id)` — da `{crudo, fuera}` contra la tabla `_labRango`. Un campo sin entrada en esa tabla
**nunca** sale con `(revisar)`: es lo que pasa con `thp`.

`emAvmThpPdfTxt()` — texto de la fila «AVm THP»: si `emThpFueraBanda()` y hay `avm_thp` devuelve
la constante `EM_AVM_THP_NOEVAL_PDF` (`'no evaluable (THP fuera de rango)'`); si no, delega en
`vPdf('avm_thp', ' cm2')` — es el **dueño** del literal, y la fila «AVm» lo reusa para que las dos
publiquen el mismo texto carácter por carácter.

`emAvmPdfVal()` — arma la celda «AVm» uniendo con ` · ` los métodos marcados: THP (texto de
`emAvmThpPdfTxt`, con prefijo `'THP: '` salvo cuando es el literal de «no evaluable»),
`Cont:` desde `avm_cont` y `Plan:` desde `avm_plan` — lee los checkbox `em_pdf_cont` y
`em_pdf_plan`; no recalcula fórmulas, lee los campos ya calculados.

> `Plan:` leía `avm_plan`/`avm_ete` hasta el **2026-10-08**: el área de Wilkins por ETE dejó de ser
> una fuente (ver `docs/mapa/valvulas.md` → Mitral). Medido en HEAD antes del cambio: con el área por
> ETE como única medición el PDF **firmado** publicaba `Plan: 1.20 cm2`, y con un `150` tipeado donde
> van cm², `Plan: 150.00 cm2` **sin marca** — `avm_ete` no estaba en ninguna tabla de rangos. La
> misma precedencia la compartían `em-plan-row`, `emPdfMetodosUI`, `emPdfValsSync` y
> `_PDF_METODOS.em_pdf_plan`; las cinco leen hoy un solo campo.

`emPdfValsSync()`, `emPdfMetodosUI(thpVal, contVal, planVal, contAuto)`, `_emPdfThpSpanSync`,
`_emPdfChk` — mantienen el panel «🖨️ Incluir en el informe» diciendo lo mismo que el papel. El
dueño del texto del THP sigue siendo `emAvmThpPdfTxt()`: el panel pregunta por la respuesta, no
por la banda.

`_pdfMetodoSpan(idSpan, val, opts)` / `_pdfMetodoChk(idChk, idSpan, val, opts)` — primitivas del
selector de método (span de valor + checkbox).
`imPdfMetodosUI()`, `_imPdfPisaTxt`, `_imMetodoPdfVal(idSpanPisa, idCampoCont, uni, dec)`,
`imEroaPdfVal()` (`'eroa-val'`, `im_eroa_cont`, ` mm²`, 1) y `imVolrPdfVal()` (`'volr-val'`,
`vr_cont`, ` ml`, 1) — eligen de dónde sale el número de las filas EROA y Vol.R, que el PDF ya
imprimía; el default es PISA.

`_protPdf(idMorf, id, uni, dec)` — celda de las filas de prótesis.

### Tema, plantilla y toggles del PDF

Paleta y encabezado: `pdfTemaRGB`, `pdfTemaHex`, `pdfTemaMezcla`, `setPdfColor`, `initPdfColor`,
`pdfColor2Get`, `setPdfColor2`, `pdfPlantillaGet`, `setPdfPlantilla`, `initPdfPlantillas`,
`pdfPlantillaIr`.

`_togglePDF(key, btnId, label)` con `_pdfToggleBtnState` — base de los interruptores «incluir en
el PDF», persistidos en `localStorage`: `toggleContrPDF` (`contractilidad_incluir_pdf`),
`toggleSglPDF` (`sgl_incluir_pdf`), `cxWilkinsPDF`, `cxDukePDF`, `cxGtpPDF`, `eeIncluirPDF`,
`eteQxIncluirPDF`. El eco estrés tiene su propio juego sobre la clave `ecosmart_pdf_toggles`:
`eePdfToggles`, `eePdfOn`, `eePdfSet`, `eePdfPanelRender`, `eePdfSyncUI`, `eeBullPdfTog`.

### Otros PDF de la app (no son el informe firmado)

`labGenerarPDF` — PDF **del Laboratorio**: `labGetInformes()` y su propio documento jsPDF; lee
`lab-pdf-titulo`, `lab-pdf-inst`, `lab-pdf-periodo`, `lab-pdf-responsable`; sanea con `_labSanPDF`;
pie con `_labPdfPie` / `_labPdfPieAlto`. `labAnalisisPDF` → `_labAnalisisPDFReal(infs)`.
`amiloImprimirPDF(cual)` (con `_teerAsciiPDF` / `_teerAsciiPDFml`) — ETT avanzado.
`medSimpsonTablaPDF` / `medSimpsonDocAlPDF`. `generarManualPDF` → `_manualPDFArmar`.

---

## El EXCEL del Laboratorio → **tiene mapa propio desde la tanda C2**

**`docs/mapa/excel-laboratorio.md`** (2026-10-28).

Ahí viven: `LAB_XLS_MAP` con sus 361 entradas y sus cuatro campos, las **440 columnas** reales de
la fila exportada, los tipos `txt` / `num` / `fecha` / `vocab` / `lista`, los **alias de cabecera**
del importador, las tablas satélite, las **dos columnas del G2** con los dos criterios de
«derivada», el alias **«PHT» → «THP»** que cierra D2-3, el puntero al mapa de importación y el
bloque del **Z** que subió el Excel a 440.

⚠️ **Se partió porque este mapa cruzó el techo de 35 KB**, no porque el Excel sea otra cosa: sigue
siendo una de las cuatro superficies que la tabla de arriba enumera, y se rompe por separado igual
que las otras tres.

## Guardado y reimpresión de un estudio guardado

`guardarInforme(onDone)` — persiste el estudio. Además de los campos del formulario escribe blobs
sintéticos en `campos`: `strain_sgl`, `contr_flags`, **`informe_base`** y **`suma_base`** (las
bases de procedencia de `_infBase` / `_sumaBase`) y los datos del médico (`med-nombre`,
`med-matricula`, `med-lugar`, `med-especialidad`, `med-direccion`, `med-telefono`). El `id` sale
de `_nuevoIdUnico` contra los ids existentes —no de un `Date.now()` pelado, que puede chocar con
uno recién importado— más `estudioId` (`_nuevoEstudioId`, para el QR) y `uuid` (`_uuidNuevo`,
clave de los recursos en IndexedDB). `guardarInformesSeguro(informes)` escribe con control de cuota.

`pdfDeInformeGuardado(id, accion, etiqueta)` — reimpresión. Lee las imágenes del estudio por su
`uuid` con `CeiboImg.leer` **antes** de tocar el formulario, distinguiendo `null` («no se pudo
leer», se avisa) de `[]` («no tiene imágenes»); `getInformes()` va dentro del `try` porque si
lanzaba, el guard `_pdfGuardadoEnCurso` quedaba en `true` el resto de la sesión.

`_pdfDeInformeGuardadoArmar(id, accion)` — respalda el formulario vivo, lo repuebla con el estudio
guardado, entra **por el mismo camino** que el botón (`_pdfAjustarA4` → `generarPDFReal`, para que
reimprimir dé el documento que se firmó y no uno más largo) y restaura en el `finally`. Respalda:
`imgSlots` + `_imgEditado`, el snapshot de ETT avanzado (`amiloSnapshot`, con `amiloBuildCard`
llamada **antes**) y `window.esqSevManual` — sin eso, reimprimir con otro paciente abierto daba un
informe firmado con las imágenes de otro paciente y el grado valvular de la sesión pisando el del
estudio.

`_migrarCamposLegacy(campos)` — normaliza los campos de un estudio viejo al leerlo.

---

## PPT (PptxGenJS)

`generarPPT(id)` — único emisor de `.pptx`; avisa distinto si la librería no cargó (CDN caído o SRI
viejo) y si el estudio no tiene `informe_texto`. Alrededor: `_pptDesdeFormulario(inf, tema,
presentador)`, `_pptEnSuma` (lee `campos.en_suma`), `_pptAgregarImagenes`, `_pptAgregarVideos`,
`_pptCierre`, los selectores `_pptElegirPresentador` / `_pptElegirTema` / `_pptElegirImagenes`, y
`_pptTxt(x)`, por donde pasa **todo** el texto porque PptxGenJS escribe XML crudo.

---

## No confirmado

- **«429 columnas» vs 438.** La ayuda de la app declara 429 en 17 bloques y 129 básicas; el conteo
  de claves de `_labExcelRow` da 438 (daba 434 cuando se escribió este renglón). No se investigó de
  dónde sale la diferencia.
- **`'VAB cirugía valvular prevista'` aparece dos veces** como clave del mismo objeto literal, con
  expresiones distintas (`{no:'No',si:'Sí'}[c.vab_cx_valvular]` y `_cc3e(c.vab_cx_valvular)`). En
  JS gana la segunda. No verificado si es intencional ni cuál es la correcta clínicamente.
- **Cuántas filas del PDF llaman a `vPdf`.** El comentario del código dice «treinta y tres»; no se
  contaron los llamadores actuales.
- **El orden de las secciones dentro de `generarInforme`**: el mapa documenta los puntos de entrada
  y de escritura, no sección por sección.
- **Qué columnas del Excel no tienen campo de origen** (y al revés): eso lo responde
  `scripts/detectar_huerfanos.py`.
- **Las ramas de `labImpEjecutar`** (modos de duplicado, fusión) no se leyeron — ⚠️ no verificado:
  sólo se confirmó que existe y que es el confirmador del import de Excel.

---

## El GASTO CARDÍACO del PDF — está en otro mapa (F1, 2026-10-15)

La fila `GC` del bloque 4 («AVA / GC / IC») se publica **sólo con frecuencia cardíaca cargada** y
su rótulo dice con qué FC se calculó: «GC (con FC de 72 lpm): 4.5 L/min». Sin FC usable no hay
fila de GC **ni de IC**. Antes el respaldo era una FC de **70** marcada con un `*` que no tiene
pie de página en ningún lado del documento.

Todo eso —la medición en HEAD, por qué el rótulo va en `ref` y no en `lbl`, por qué el IC se va
con el GC, y la trampa de que el rótulo y el valor de una fila son **dos `doc.text` distintos**—
está en **`docs/mapa/vi-volumenes-automaticos.md`**, que es además el mapa de la pestaña AI/VI.

---

## La AURÍCULA IZQUIERDA y las dos correcciones del PDF — «H» (2026-10-16) → otro mapa

El dueño único de la clasificación de la AI por volumen indexado (`AI_VOL_BANDAS`,
`aiVolClasificar`, `aiVolRotulo`), la tabla de qué superficie clasifica y cuál sólo publica el
valor, el colapso de la VCI con su «%» y el símbolo del sexo dibujado como figura vectorial
—con el hueco de espacios duros y por qué su ancho se le devuelve al medidor del envoltorio—
viven en **`docs/mapa/auricula-izquierda-pdf.md`**.

⚠️ **Tres cosas de acá que esa tanda midió y conviene saber antes de tocar el PDF:**

* **Son SEIS plantillas de PDF, no tres** (clásico, moderno, minimalista, académico, compacto,
  elegante), y el bloque de datos del paciente se maqueta de **tres formas distintas** entre
  ellas: `_hdrCajaPaciente` (grilla), la tira corrida con `_duro` (Minimalista y Compacto) y la
  tabla Parámetro\|Valor (Académico). Medir una sola deja cinco sin cubrir.
* **`amiloSanPDF` borra en silencio todo lo que esté fuera de WinAnsi** (`/[^\x20-\xFF]/`), así
  que un carácter que no sea WinAnsi puesto en un texto del PDF **no se ve y no avisa**. Y si se
  lo saltea, jsPDF con las fuentes estándar no sólo lo rompe: **pasa la línea entera a UTF-16 y
  la desmaqueta**.
* **El informe de un estudio guardado viaja como TEXTO** (`informe_texto` y `en_suma` son
  `<textarea>` con id) y el reimpreso lo repone tal cual: un cambio en la redacción del informe
  **no alcanza** a lo ya guardado. Lo que sí cambia en el reimpreso es la **tabla de datos**, que
  se arma de `campos`.

---

## La pestaña OTROS en el informe — tanda «I» (2026-10-16)

⚠️ **El pericardio, las masas y los tres temas del módulo pulmonar básico pasaron a ir cada uno en su
PROPIA entrada de `inf`**, o sea en su propia oración. Antes el pericardio y las masas compartían una
entrada —y en el estilo NARRATIVO una sola oración— y los tres temas del pulmón salían pegados por un
`join(' ')`. El EN SUMA no se movió. **Mapa de la zona, con la tabla de antes y después y los tres
campos nuevos: `docs/mapa/otros-pericardio-pulmon.md`.**

⚠️ **Y la columna `Score Wilkins total` del Excel dejó de contar por su cuenta**: le pregunta a
`wilkinsScoreDeCampos`, que es el mismo cálculo que las dos pantallas. La única escena en la que el
valor cambia es un estudio legado con 1/1/1/1 y sin la marca de gesto, que pasa de `4` a vacío.
**Mapa: `docs/mapa/wilkins-unificado.md` → sección 5.**

---

## La IDENTIFICACIÓN del paciente y el PANEL DE FRASES — tanda «J» (2026-10-16)

⚠️ **AL PDF Y AL PPT VA UNO SOLO DE LOS DOS IDENTIFICADORES del paciente —el documento o la
matrícula— y lo elige el médico** con un marcador al lado de cada rótulo, en la pestaña
Paciente. Por omisión el documento. El dueño único es **`pacIdImpreso(src, docLblDef)`**, y la
celda del bloque del paciente del PDF —**UNA sola para las SEIS plantillas**— y la portada del
PPT le preguntan a él. **El Excel sigue en 440 columnas**: la elección viaja en un
`input[type=hidden]` que el mapa del Excel no nombra.
**Mapa de la zona, con los tres estados, las cinco puertas y las ocho trampas medidas:
`docs/mapa/identificacion-paciente.md`.**

⚠️ **Y EL PANEL DE FRASES PASA A SER UNA COLUMNA ALTA a la derecha**, con el informe y el EN
SUMA apilados y angostados a la izquierda. Sólo cambia la DISPOSICIÓN: la inserción en el cursor,
el guardado y el cajón de 768 px o menos no se tocaron, y **los dos textarea siguen siendo
alcanzables por id**, que es de lo que dependen el recolector, `limpiarCampos`, las rutas de
restauración y la ventana de reimpresión. **Mapa: `docs/mapa/panel-frases.md`.**

⚠️ **Y la fila `Vol. indexado` del PDF dice por qué no hay índice** cuando el volumen de la AI
está medido y no hay superficie corporal, en vez de caerse del filtro de la tabla.
**Mapa: `docs/mapa/auricula-izquierda-pdf.md` § 9.**

---

## El TOGGLE del bull's eye de contractilidad — tanda «K1» (2026-10-16) → otro mapa

De qué depende que el bull's eye entre al PDF dejó de ser
`localStorage + contrHayDatos()` y pasa a ser **sólo el botón**, cuyo estado vive en un campo DEL
ESTUDIO (`contr_be_pdf`) y nace apagado. **No agrega ninguna columna al Excel** —verificado: sigue
en 440, clave por clave—. Todo en **`docs/mapa/contractilidad-3d-vi.md`** → sección 1.

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

---

# La tanda «VS» (2026-10-17) — EL CORAZÓN DERECHO A LA TABLA 1 DE LA ASE 2025

⚠️ **El VD, la AD, la VCI y la raíz aórtica se alinearon a la Tabla 1 de la ASE 2025 de corazón
derecho, y todo eso vive en `docs/mapa/corazon-derecho-ase2025.md`.** Ahí están el dueño único
(`ASE25_T1` + `ase25Grado` + `ase25Rango` + `ase25Corte`), las doce filas con su antes y su
ahora, las tres cosas que la tabla NO dice como uno espera —no distingue sexo, el solape
tipográfico del TAPSE y de la onda S′, y el hueco del volumen de la AD—, las superficies una por
una, el 21 mm exacto de la vena cava, el «40 mm o más» del seno de Valsalva, las cuatro tarjetas
con sus cuatro zonas y las ocho trampas.

**Lo que hay que saber antes de tocar esta zona:** los cortes y los operadores ya NO viven acá.
Mover uno es editar `ASE25_T1`, y el assert de arranque exige que las cuatro bandas sigan en
orden y sin hueco.

---

## ⚠️ Punteros de la tanda «CORTOS» (2026-10-17)

- **Los otros dos toggles de inclusión en PDF son campos del ESTUDIO** (`sgl_be_pdf` y
  `ete_qx_pdf`), con el patrón de `contr_be_pdf`: `K-3` cerrado. Las dos claves de `localStorage`
  ya no se leen.
- **El PDF de amiloidosis pregunta a `pacIdImpreso`** en sus dos encabezados: `J-2` cerrado.
- **El informe dice «derrame pericárdico»** y el `value` del selector no cambia, así que la columna
  «Pericardio» del Excel y los estudios guardados siguen leyendo lo mismo.
- **El Excel sigue en 440 columnas**: ni los 21 campos de Otros, ni los dos ocultos de PDF, ni la
  separación de las líneas B agregan una.

En `docs/mapa/cortos-arreglos.md` y `docs/mapa/otros-hallazgos.md`.

---

## Lo que la tanda «Y3f» movió en el papel (2026-10-20) — puntero

- **El párrafo final de la VAB SALE del informe.** Su texto completo se publica en el panel de
  Evidencia; la pestaña publica un resumen esquemático de cuatro líneas. El motor `vabConclusion`
  **no se tocó**: lo que cambió es dónde se muestra. → `docs/mapa/vab-bicuspide.md` § 11.3.
- **El derrame pericárdico y las masas salen en UNA sola oración cuando los dos están ausentes**,
  en vez de dos frases de normalidad seguidas.
- **El EN SUMA pierde el encabezado «Cardiopatías congénitas y miocardiopatías genéticas:»**, y la
  línea de la VAB sólo agrega «, normofuncionante».
  ⚠️ **DESVÍO DECLARADO sobre la letra del pedido:** decía «IAo con grado calculado cero», y
  medido en el archivo la cascada de `calcIA_ESC` sólo emite `'1'`, `'2'` y `'4'` y deja `null`,
  así que ese estado **es inalcanzable** y la regla literal se anularía a sí misma. La compuerta es
  «la VÁLVULA tiene datos», que es el estado en el que el informe ya dice «sin estenosis ni
  insuficiencia» — medido.
- **La hoja «Estudio avanzado – Cardiopatías congénitas» del PDF se retira SÓLO para la VAB.** Las
  otras cardiopatías congénitas la conservan — medido.
- **El Excel queda en 440 columnas, con las mismas claves y los mismos valores.** La celda de la
  función valvular de la VAB pasa a **derivarse** de los grados de Válvulas sobre el estudio
  archivado (`vabFuncionDerivada(c)`), y la de «fused type» **conserva el texto viejo** porque el
  importador lo lee por valor de opción: renombrarlo descarta la **fila entera** de todo backup ya
  exportado.

---

## ➜ El POSOPERATORIO (tanda «G», 2026-10-24)

La hoja PostCEC del PDF y la línea del EN SUMA pasan a ser **descriptivas**: sin el patrón, sin
las cinco preguntas y sin conducta. Entran el lactato, la PAM, la PAD, la PAP, el gradiente
transpulmonar y la RVP. El Excel sigue en **440 columnas** y `LAB_XLS_MAP` no tiene un solo
`pop_`. Qué sale por dónde: **`docs/mapa/g-posoperatorio.md`** §5.

---

## El SGL en el papel tras la tanda AJ9 (2026-10-29) — puntero

El informe narrativo (tres estilos), el EN SUMA, la tabla de mediciones del PDF, la hoja de
strain del PDF y el PPT publican el SGL **con signo negativo**, aunque el médico lo haya tipeado
positivo. `sglNegTxt` conserva literal lo que ya viene negativo.

**El campo del estudio y la columna `GLS (%)` del Excel NO se reescriben**, y eso está declarado:
`docs/PENDIENTES.md` → **AJ9-f**.

**El rótulo «normal / limítrofe / anormal» NO baja al papel**: es sólo de pantalla.

→ **`docs/mapa/aj9-sgl-patrones.md`** § 2 y § 3

---

## ⇢ Puntero — la tanda «POP-V2» (2026-10-29)

El módulo **«POP Cirugía Cardíaca»** se reordenó de arriba hacia abajo —contexto y monitoreo,
fármacos en un desplegable, hemodinámica, POCUS con el VD primero, dibujo y conclusión—, la dosis
de las vasoactivas **se calcula sola**, apareció la **PAM por línea arterial** en el primer
escalón del dueño único, el dibujo sumó **Impella, ECMO venovenoso y el timing del balón**, la
conclusión publica **señales sueltas con su valor** y el **patrón y las cinco preguntas salieron
del PPT**.

**Todo en `docs/mapa/pop-v2-posoperatorio.md`**, con la tabla de lo que los mapas anteriores decían
y dejó de ser cierto. El caso que lo fija es **TC-548**; los pendientes, **POP-a** a **POP-h**.

---

## → La TANDA AJUSTES-1 (2026-10-30) — puntero

Vive en **`docs/mapa/aj1-orejuela-pdf-ensuma.md`**, en archivo propio. Lo que esta zona
perdió o ganó:

- **el dibujo de la orejuela no se imprime dos veces**: `amiloDibujarSecciones` aprendió a
  llevar `sec.img`, con el ancho útil viajando en cada fila; `_oaiSlotUsado` es el índice que la
  página «Imágenes del estudio» saltea. Sin la sección integrada, el esquema se queda en esa
  página con el resumen de `oaiResumenPDF()` al lado.
- **el bloque de la VAB** pasa a dibujo a la izquierda y tabla al costado (100,6 → 53,6 mm).
- **`noPdf`** en un slot de `imgSlots` lo saca del papel sin borrarlo del estudio.

