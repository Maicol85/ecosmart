<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->
# Mapa de funciones — informe narrativo, EN SUMA, PDF y Excel

Dice *qué función emite cada superficie de salida*.

Las cuatro superficies **se rompen por separado**: tienen emisores distintos y ninguna deriva de
la otra. Un dato que se carga y no aparece en ninguna de las cuatro desapareció sin aviso.

---

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

## Excel del Laboratorio

`LAB_XLS_MAP` — tabla de columnas. Cada entrada es
`[columna del Excel, destino, tipo, aliasesOpcionales]`; un destino que empieza con `@` es un
campo de **primer nivel** del estudio (`@nombre`, `@ci`, `@fecha_estudio`), el resto son ids de
`campos`. El `tipo` es `txt` / `num` / `fecha` / `vocab` / `lista`. El 4.º elemento son **alias de
cabecera para el importador**: nombres viejos que se siguen aceptando, porque matchea por nombre y
renombrar una columna haría que los Excel ya exportados pierdan ese dato en silencio. **El orden
del array define el orden de columnas de la plantilla y del export.**

**Cuántas entradas tiene: 361** (contadas — 357 escritas con comilla simple y 4 con comilla doble,
porque llevan apóstrofo en el nombre: `e' septal`, `e' lateral`, `S'`, `e' lateral tricuspideo`).
Las 361 **no** son las columnas del Excel: el mapa es un subconjunto del export.

**Columnas reales de la fila exportada: 438 claves distintas** (eran 434 hasta el 2026-10-12,
cuando entró «Strain contracción AI (%)» pegada a «LARS (%)» en el bloque 3; 435 hasta el
2026-10-14, cuando entró **`DisfSist_VD`** en el bloque 5 — ver
`docs/mapa/exclusiones-laboratorio-vd.md`; y 436 hasta el **2026-10-15**, cuando la tanda **G2**
agregó **«TAPSE/PSAP (mm/mmHg)»** en el bloque 5 y **«Diámetro arteria pulmonar (mm)»** en el
bloque 8 — ver `docs/mapa/tapse-psap-ap.md`) — 412 claves distintas en el objeto
literal de `_labExcelRow` (413 escritas, con `'VAB cirugía valvular prevista'` **repetida dos
veces**, así que la segunda pisa a la primera), más 1 clave computada
(`` [`PSAP_${UMBRAL_PSAP_ELEVADA+1}_50`] ``), más 22 columnas del bloque de pericardio que entra
por un *spread* al final (`DPT …` y `CVR …`). El número 434 que circula **se confirma**.
⚠️ Discrepancia a reportar, no corregida: el panel de ayuda de la app dice **«429 columnas» en 17
bloques** (y «129 columnas básicas» al destildar los siete módulos opcionales); el texto de ayuda
y la fila real no coinciden.

`_labExcelRow(inf)` — **arma la fila**. Deriva todo de `inf.campos` (nada del DOM vivo). Calcula en
el camino BSA, masa indexada, RWT, geometría (`calcGeometriaVI`), FA, relación E/A, e' promedio,
EROA y Vol-R por PISA, AVA por continuidad, gradiente VD-AD, grado diastólico (`_labDiastGrado`) y
los grados valvulares en texto (`_labGradoTxt`) — lee: `im_grado`, `ia_grado`, `it_grado`,
`ea_grado`, `em_grado`, `psap_calc`, `dpt_*`, `cvr_*`, `informe_texto`, `en_suma`, y muchos más —
llamada por: `_labExportarXLSXReal` (una vez por estudio) y `_labRowVacia()`.

`_labOrdenarCols(headers)` — **recorre `LAB_XLS_MAP`** y ordena las cabeceras del export según el
mapa; intercala las binarias de `LAB_XLS_BIN` detrás de su columna de texto y las derivadas de
`LAB_XLS_TRAS` detrás de la suya; lo que el mapa no conoce queda al final; después reagrupa por
bloque de forma estable y, si la reagrupación perdiera o duplicara una columna, devuelve el orden
sin agrupar antes que exportar un Excel incompleto. **El orden del Excel no es el del objeto que
devuelve `_labExcelRow`** — lo decide esta función.

`_labExportarXLSXReal(infs, anon, sel, origen)` — escribe el libro: hoja «Estudios»
(`XLSX.utils.aoa_to_sheet`, `!autofilter`, comentarios de encabezado vía
`_labXlsComentarEncabezados`), hoja de bloques (`_labXlsHojaBloques`), hoja «Leyenda» con el
significado de las binarias, y hoja «Cohorte» cuando `origen` dice que las filas salieron del
filtro. `anon` sustituye `Nombre` por «Paciente anónimo» en **todas** las filas; `sel` es la lista
de módulos elegidos y sin ella se exporta todo. ⚠️ No se escribe `!freeze`: la build comunitaria de
SheetJS 0.18.5 no lo emite.

`labExportarXLSX()` — entrada «exportar el Laboratorio»: `labGetInformes()` → `_labPreguntarAnonimo`
→ `_labExportarXLSXReal(infs, anon, null, 'lab')`.
`labExpAbrir(modo)` / `labExpRefrescar` / `labExpSeleccion` / `labExpSoloConDatos` /
`labExpConfirmar` / `labExpCerrar` — el modal de módulos; `labExpConfirmar` llama a
`_labExportarXLSXReal` con `sel` y `origen`.
`labPlantillaXLSX(vacia, sel)` — plantilla para cargar a mano; también **recorre `LAB_XLS_MAP`** y
escribe la hoja «Instrucciones» (una fila por columna, con tipo y ejemplo) más las alternativas
0/1 de `LAB_XLS_BIN`. Entrada: `labExpPlantilla()`.
`labStrainExportar()` — libro propio del strain; no toca `_labExcelRow` ni `LAB_XLS_MAP`.

### Tablas satélite del mapa

`LAB_XLS_MODULOS` y `LAB_XLS_BLOQUES` (+ `_LAB_XLS_BLOQUE_RESTO`, `_labXlsBloqueDe`,
`_labXlsAssertBloques`) — los bloques temáticos; los módulos **se derivan** de los bloques marcados
`avanzada`, no de una segunda lista. `_labColsFiltradas(headers, sel)` aplica la selección.
`LAB_XLS_BIN` — 5 grupos / 10 columnas binarias de severidad, que el **importador** también lee de
vuelta: por eso no se puede reusar para derivadas. `LAB_XLS_TRAS` — derivadas que deben quedar
pegadas a la suya (`DVI mitral` → `DVI mitral (fuente)`).
`LAB_XLS_SOLO_EXPORT` — campos que salen y no vuelven. `_labXlsEsCalculado(dest)` — el predicado
real de «no se reimporta»: está en `LAB_XLS_SOLO_EXPORT` **o** el input es `readonly`.

### Las DOS columnas del G2 (2026-10-15), y los DOS criterios de «derivada»

| Columna | Bloque | Posición | ¿Se reimporta? |
|---|---|---|---|
| **`TAPSE/PSAP (mm/mmHg)`** | 5 · VENTRÍCULO DERECHO | tras `DisfSist_VD` | **no** |
| **`Diámetro arteria pulmonar (mm)`** | 8 · VÁLVULAS | tras `IP etiología` | **sí** |

El valor del cociente lo da **`vdTapsePsapRed(c)`**, el dueño único desde el G1, con sus **tres
decimales**; la rama `src` existe porque el exportador no tiene formulario que leer. **Vacía —no
0— sin TAPSE o sin PSAP.** El diámetro es el campo `ip_ap_diam`.

⚠️ **EN LA CASA HAY DOS CRITERIOS DE COLUMNA DERIVADA Y HAY QUE ELEGIR EL QUE CORRESPONDE:**

- **(a) con CAMPO** — `PSAP (mmHg)` (`psap_calc`), `AVm THP`, `AVA`: **están** en `LAB_XLS_MAP` y
  se apartan por `LAB_XLS_SOLO_EXPORT`; el importador las lista como «un valor que la app calcula
  sola».
- **(b) SIN campo** — `FAC VD (%)`, `DisfSist_VD`, `DD_I`, `Geom_Normal`, `TS_Presente`: **no**
  están en el mapa y se declaran en `LAB_XLS_BLOQUES`; el importador las lista como «no
  corresponde a un campo editable».

El cociente **no tiene campo en el DOM**, así que sigue el criterio **(b)**. Es la diferencia
menor que el G2 declaró: su mensaje en el importador es el de (b) y no el de (a), más informativo.

⚠️ **LA POSICIÓN LA DECIDE `LAB_XLS_BLOQUES` Y NO EL OBJETO LITERAL**: `_labOrdenarCols` manda al
final lo que el mapa no conoce y **después** reagrupa por bloque, así que sin su declaración el
cociente habría caído al bloque «18 · OTRAS COLUMNAS».

### El alias «PHT» → «THP» (G2), que cierra D2-3

`PHT IAo (ms)` → **`THP IAo (ms)`** y `TAVI RPV PHT (ms)` → **`TAVI RPV THP (ms)`**, las dos con
el nombre viejo en el **cuarto elemento** de su entrada de `LAB_XLS_MAP` — el mecanismo de alias
de ENTRADA que ya existía y que `_cabsDe` consulta. **El número de columnas no cambia.**

⚠️ **EL PREFIJO DEL BLOQUE 8 TUVO QUE SEGUIR EL RENOMBRE.** Era `'PHT IAo'`; sin cambiarlo a
`'THP IAo'`, la columna renombrada caía al bloque «18 · OTRAS COLUMNAS». Lo caza
`_labXlsAssertBloques`, que es para lo que está.

> Las asociaciones y la tabla de válvulas del Laboratorio, en
> **`docs/mapa/laboratorio-asociaciones-valvulas.md`**.
`_labXlsImportables()` — el set de cabeceras que el importador acepta, calculado desde esas mismas
estructuras. Vocabularios y validación: `LAB_XLS_VOCAB`, `_NUEVOS`, `_3E`, `LAB_XLS_OPCIONES`,
`LAB_XLS_LISTAS`, `LAB_XLS_MAX_TXT`, `LAB_XLS_ETIQ` (+ `_labXlsEtiq`), `LAB_XLS_RANGO_PROPIO`,
`LAB_XLS_BIN_VAL`, `LAB_XLS_BIN_NADA`, `LAB_XLS_EJEMPLO`; los asserts `_labXlsAssertVocab` y
`_labXlsAssertListas` existen porque una columna `vocab` sin vocabulario rompe en silencio.

---

## Importación y reimportación

`importarInformesJSON(file)` — lee el JSON, **detecta el nivel del archivo** (un array pelado es
«solo informes»; un objeto con `_ecosmart_backup` y `estudios` es un backup con medios por uuid),
valida **todos** los estudios con `validarInformeImportado`, cuenta duplicados con `_dupIndice` /
`_dupBuscar`, y abre `modal-import` con el resumen y una vista previa de 10 — escribe: `_impDatos`,
`_impMedios`, `_impNivel`.

`validarInformeImportado(inf)` — esquema de lista blanca: rechaza cualquier clave que no esté en
`_INF_CAMPOS_PERMITIDOS`, exige `id` numérico, valida formato (no sólo largo) de `uuid`
(`_uuidValido`), `estudioId`, `nombre`, `ci`, `doc_tipo` y la fecha.

`importEjecutar()` — aplica la importación según el modo elegido (`omitir` por defecto),
reparte ids con `_nuevoIdUnico` y conserva el `uuid` entrante sin admitirlo repetido.
`importCerrar()` — cierra el modal y limpia `_impDatos`.

`labImportarXLSX(file)` — importador de Excel. Busca la hoja **por nombre** (`/estudios/i`) y no la
primera, porque la plantilla trae «Instrucciones» y «Leyenda»; lee con
`XLSX.utils.sheet_to_json({defval:'', raw:false, blankrows:false})`; pide confirmación arriba de
1000 filas porque el parseo es síncrono; **normaliza las cabeceras** (trim + espacios colapsados +
minúsculas) y guarda el mapeo al nombre original, porque un `"CI "` con un espacio de más se
descartaba en silencio y degradaba la dedup. Deja el resultado en `_labImpDatos`
(`{filas, errores, total}`), que después consumen `labImpRender`, `labImpBoton`,
**`labImpEjecutar`** (el que confirma y escribe) y `labImpCerrar`.

`_sevManualDesdeCampos(campos)` / `_sevManualEnCampos(campos)` — marcan como «fijada a mano» cada
severidad que vino en la planilla, **incluido un «0» / «sin»**, y escriben la marca *dentro* de
`campos` (`sev_manual`) para que viaje con el estudio: una marca sólo en `window` se perdía y el
primer recálculo subía de grado un hallazgo que el estudio original negaba.

> **Regla del repo:** el exportador y el importador de Excel **sólo se tocan con orden expresa**.

### El mensaje de las COLUMNAS CALCULADAS (G3, 2026-10-15), que cierra G2-2

Decisión de Maicol: **UN** mensaje para todas, del estilo «columna calculada por la app: se
recalcula con A, B y C; no se importa», con los **nombres de los datos de origen** de cada una.

⚠️ **HASTA EL G3 HABÍA DOS MENSAJES Y EL REPARTO NO SE ENTENDÍA DESDE AFUERA.** La casa tiene
dos criterios de columna derivada y el importador les daba mensajes distintos:

| Familia | Cómo se detecta | Mensaje en HEAD |
|---|---|---|
| **(a) CON campo** — 18 | `LAB_XLS_SOLO_EXPORT` o `readonly` en el DOM, vía `_labXlsEsCalculado` | «un valor que la app calcula sola» |
| **(b) SIN campo** — 75 | ni siquiera está en `LAB_XLS_MAP` | «**no corresponde a un campo editable**» |

El segundo suena a «no la reconozco» sobre una columna que la PROPIA app exporta. Medido en
HEAD con un Excel de catorce columnas: el cociente TAPSE/PSAP, la FAC del VD, `DisfSist_VD`,
`DD_I`, `Geom_Normal` y el gradiente VD-AD caían ahí. Hoy las dos familias reciben el mismo
mensaje y **cero columnas** quedan en «ignoradas».

⚠️ **EL CENSO DE LAS 75 SE CALCULA, NO SE CABLEA.** Se pregunta por lo que `_labExcelRow` emite
sobre una fila vacía —escribe cada columna, vacía o no— y se le resta el mapa con sus alias. Una
lista de 75 nombres se desactualiza con la primera columna derivada que entre.

**El origen** sale de `LAB_XLS_CALC_ORIGEN` (mapa explícito) más `LAB_XLS_CALC_ORIGEN_PREFIJO`
para las familias de indicadoras —`DD_`, `Geom_`, `TS_`, `PSAP_`, `IM_`, `EM_`, `EAo_`, `IAo_`,
`IT_`, `DPT `, `CVR `—, cuyo origen es siempre la columna de la que derivan.
⚠️ **LO QUE NO ESTÁ EN LA TABLA NO SE INVENTA**: cae al texto común sin la lista, que sigue
siendo verdadero. Inventar un origen manda al médico a corregir el campo equivocado.

**Un solo dueño, `_labXlsCalcMsg`**, que publican las DOS superficies del mismo aviso: el modal
del importador y el **comentario de celda** de la plantilla, que hasta hoy decían lo mismo con
dos redacciones — y la que se lee al llenar es la de la celda.

### El DETALLE del TAPSE/PSAP y de la PSAP, y la ida y vuelta que NO se reproduce

Para esas dos —las que el médico corrige a mano en la planilla— el modal dice además si el valor
**recalculado** de la fila coincide con el del archivo, y cuándo no se puede recalcular dice
**cuál** dato de origen falta. Se recalcula con el MISMO dueño que usa el exportador
(`vdTapsePsapRed`); **no se acepta el valor del archivo en ningún caso**, porque eso dejaría dos
fuentes del mismo número. Para poder comparar, `ok.push` guarda la fila CRUDA (`datos: row`):
`inf.campos` ya tiene las calculadas descartadas.

⚠️ **SE NOMBRA EL DATO DE ORIGEN QUE DE VERDAD FALTA Y NO EL ESLABÓN INTERMEDIO.** Decir «falta
la PSAP» manda a llenar una columna que el importador descarta igual, y la PmAD la app la deriva
de la VCI cuando `vci_diam` y `vci_col` vienen —que sí se importan—.

⚠️ **PARADA MEDIDA Y DECLARADA: LA IDA Y VUELTA DEL COCIENTE NO SE REPRODUCE.** Se exportó la
fila COMPLETA de 438 columnas de un estudio y se la reimportó tal cual: el cociente **no se
puede recalcular**, porque la **velocidad máxima de la insuficiencia tricuspídea no tiene
columna**. Censado: `vmax_it` no está en `LAB_XLS_MAP`, y las dos columnas que la contienen
—`PSAP (mmHg)` y `Grad VD-AD (mmHg)`— son CALCULADAS y no se importan. La cadena es
`TAPSE/PSAP ← TAPSE + PSAP ← VRT + PmAD`, y el eslabón que falta es la VRT.
Las dos alternativas están en `docs/PENDIENTES.md`: agregar una columna de origen (que es una
PARADA de columna) o aceptar el valor del archivo marcado como «importado». **Decisión del
médico.** Lo que sí se pudo hacer, y se hizo, es que el modal lo DIGA con todas las letras.

⚠️ **LAS DOS CON DETALLE VAN AL PRINCIPIO DE LA LISTA.** Se recorta en cuarenta —con 93
calculadas, listarlas todas tapa el resto del modal— y el orden natural es el del mapa, así que
el cociente y la PSAP podían quedar fuera de lo visible justo cuando el renglón de abajo habla
de ellas.

### Exportación JSON (el único backup completo)

`exportarInformesJSON()` — modal de exportación (todos / por centro / selección manual).
`_bkExportar(list, nivel, desc)` — escribe el archivo: con `nivel === 'informes'` baja el array
pelado; con los otros arma el sobre `{"_ecosmart_backup":BK_FORMATO,"nivel":…}` con los medios,
troceando en partes para no quedarse sin memoria.
`exportarEcoAnalytics()` — salida hacia CeiboAnalytics (otra frontera de confianza).

---

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

## ⚠️ EL EXCEL PASÓ A 440 COLUMNAS EN EL Z (2026-10-15) — y la ida y vuelta tiene mapa propio

Las dos nuevas son **`Vmax IT (m/s)`** (campo de ENTRADA, se reimporta, bloque 8, pegada a
`VC IT (mm)`) y **`PPM aórtico`** (derivada SIN campo, no se reimporta, bloque 8, pegada a
`AVA (cm²)`).

**Todo lo demás vive en `docs/mapa/excel-origen-ida-vuelta.md`**: los tres criterios de columna
(derivada con campo, derivada sin campo, campo de entrada), la cadena entera de la ida y vuelta
del TAPSE/PSAP, el segundo eslabón que faltaba (`calcPmAD` en las dos rutas de restauración) y
los tres cambios del mensaje del importador.

⚠️ **SE SACÓ A ARCHIVO PROPIO PORQUE ESTE MAPA ESTABA EN 29,7 KB Y LA SECCIÓN LO CRUZABA.** Medido
con `wc -c` **ANTES** de escribir, que es lo que `ecosmart/CLAUDE.md` pide desde la D2 y lo que
`valvulas.md` aprendió pagándolo **dos** veces.

---

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
