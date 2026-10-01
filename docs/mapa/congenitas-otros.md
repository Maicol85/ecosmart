<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Mapa de funciones — Congénitas, Laboratorio, PPT, Cardio-Onco, Pericardio y resto

Mapa **grueso**: la puerta de entrada de cada módulo y sus funciones principales, no el detalle
interno.

El detalle fino vive en otros archivos de esta carpeta y **no se repite acá**: `valvulas.md`,
`panel-evidencia.md`, `informe-pdf-excel.md`, `tests.md`, `imagenes-visor.md` — los cinco existen en
disco (verificado el 2026-10-01).

---

## Tabs / navegación general

- `showTab(id)` — **la puerta normal** de cambio de pestaña: quita `active` de todos los
  `.tab-section` y `.tab-btn`, se lo pone a `#tab-<id>` y al botón del evento, y corre
  `secAutoOpen`/`cardAutoOpen`. Ganchos por `id`: `imagenes` → `orthancBotonSync()`; `lab` →
  `labAccCerrarTodos()`; `cardioOnco` → `_coMigrarNombreACedula()` y `renderSeguimientoLista()`.
- ⚠️ `showTabById(id)` — **NO es `showTab` sin `event`: es una segunda puerta que duplica el
  cuerpo** y **no corre ninguno de los ganchos** (ni `secAutoOpen`, ni `cardAutoOpen`, ni los tres
  por `id`); marca el botón buscando el que diga «Informe» en su `textContent`. Entrar a una
  pestaña por acá la deja con los acordeones cerrados y sin la sincronía de Orthanc. Dos copias de
  la misma lógica: lo que se agregue a una no aparece en la otra.
- `applyViewMode()` — Básico vs. Avanzado. Esconde `.tabs-special`, `.tabs-tools`, `.tabs-lab-wrap`,
  `#lab-subtab-avanzado` **y cada `button[data-mod]` uno por uno** (hay botones con `data-mod` fuera de
  las tres filas). — lee: `ett_view_mode`.
- `cfgSetMode` / `cfgToggleMod` / `cfgRenderModulos` — modo y casillas por módulo, desde
  `EE_MODULES`, persistidas en `ett_modules`.
- `ecoAdvBuild` / `ecoAdvPick` — `#ecoAdvSelect`, versión móvil de la fila avanzada.
- `secToggle` · `accToggle` · `toggleCard` · `toggleEteSeccion` · `toggleRef` · `labSubTab` — los cinco
  acordeones distintos más las subtabs del Laboratorio. Congénitas usa `.sacc` y **no** `.acc`, que
  recorta a 720 px sin scroll. `irATabPaciente()` salta a los datos.

**Las 23 pestañas reales** (`id="tab-…"`):

| Fila | Pestañas |
|---|---|
| Rail izquierdo (siempre) | `datos` Paciente · `ai-vi` AI/VI · `vd` VD/AD · `doppler` · `valvulas` · `contractilidad` · `sgl` · `otros` · `imagenes` · `config` |
| Especiales (solo Avanzado) | `hemodinamica` · `pulmonar` Eco Pulmonar · `ete` · `cardioOnco` · `amiloidosis` · `congenitas` CC frecuentes · `congenitas2` CC complejas |
| Herramientas (siempre) | `calculadoras` · `fono` Fonocardiograma · `refs` Referencias |
| Sin botón — botones al pie | `informe` · `guardados` · `lab` Laboratorio |

El botón de `congenitas2` lleva `data-mod="congenitas"` **a propósito**: son un solo módulo partido
por largo y con `data-mod` propio no tenía casilla en Config.

---

## Congénitas I — «CC frecuentes»

Pestaña `tab-congenitas`. Sin entrada propia: se abre con `showTab('congenitas')` y cada sección se
cablea al desplegarse, con `secToggle('cc-<k>')` seguido de su `Sync()`. Patrón uniforme por lesión:

- `<k>Estado()` o `<k>Conclusion()` — clasificador puro: lee los campos, devuelve estado/texto.
- `<k>Sync()` — render: badge, frases, conclusión, y publica la hoja vía `ccHoja`.

Prefijos: `vab` (aórtica bicúspide), `coa` (coartación; además `coaGmax`, `coaRatio` y la única
periodicidad de control calculada de la app, `coaSeguimiento()`), `marfan` (con `critMarfanCalc`),
`fop`, `esub` (estenosis subaórtica), `easv` (supravalvular aórtica), `mch`, `mca`, `tdf` (Fallot
reparado) y `tv` (arritmia ventricular, **compartida** por MCH, Fallot y MCA). `critAbrir`/`critCerrar`
abren el overlay de criterios, que pueblan `critMarfan`, `critMCH`, `critMCA`, `critEisen`,
`critFontan`. MCH y MCA no son congénitas sino miocardiopatías genéticas, y el rótulo lo dice.

---

## Congénitas II — «CC complejas»

Pestaña `tab-congenitas2`, mismo patrón `<k>Estado`/`<k>Conclusion` + `<k>Sync`.

- `eteShuntTab(cual)` — subtabs CIA / CIV; `eteShuntSync` es el render y `eteShuntSyncSiExiste` su
  envoltorio con guarda.
- `ciaDonutRender` / `ciaBordesReset` / `ciaDonutDataURL` — esquema de bordes del defecto
  interauricular, y su exportación.
- Secciones: `dap` (ductus, con `dapGmax`), `vap` (ventana aortopulmonar), `dsav` (septo
  auriculoventricular), `cvpa` (venosa pulmonar anómala parcial), `tga` (transposición corregida),
  `ebs` (Ebstein), `eisen` (Eisenmenger), `fontan` (con `fontanComplicaciones`).

---

## Congénitas — motor compartido de hojas y Qp/Qs

- `ccHojaBuild()` — crea una vez `#cc-txt-wrap` oculto, con un `<textarea id="cc-txt-<k>">` por cada
  una de las catorce claves de `CC_HOJA_ORDEN`. — llamada por: `DOMContentLoaded` o en el acto.
- `ccHoja(k, oraciones, conclusion, seguimiento)` — arma la hoja de UNA cardiopatía. **No recalcula
  nada**, y la línea de guía y la de seguimiento **se copian, no se arman**.
- `ccEnInforme()` — lo que consume el PDF: `[{k, tit, txt}]` por `CC_HOJA_ORDEN`, o sea **en el orden
  del registro y no en el de escritura**.
- `ccHojaReset()` — vacía las catorce. — llamada por: `generarInforme`.
- `ccQpQsDe(cual, src)` / `ccShuntsConDatos(src)` — atribución del Qp/Qs: es el **mismo** `eteQpQs()`
  del shunt, y devuelve `null` si hay más de un grupo con datos o si el único no es el propio (CIA y
  CIV cuentan como uno, `'shunt'`). — lee: los ids de `CC_SHUNTS`.
- `ccSumaLinea(sec)` — línea de EN SUMA; traduce con `_ccLbl`, y fuera de banda de plausibilidad se
  declara y **no se imprime el número**.
- `ccSegSync` / `ccToggleSegmentario` — bloque segmentario. `_CC_SECS` — registro que leen
  `labCCRender` y `_labCohorteCCBox`.

---

## Laboratorio

- `labInit()` — **puerta de entrada**, desde el botón al pie
  (`showTab('lab');if(window.labInit)labInit();`) y en cada cambio de período o centro. Recalcula
  **cada bloque en su propio `try`**, y el `catch` del bloque A **vacía** la tabla a propósito.
- `labSubTab(id, el)` — ocho subtabs: `general`, `mediciones`, `avanzado`, `ete`, `cc`, `filtros`,
  `asociaciones`, `informe`. Con guarda contra `id="lab-sub-x"` mal tipeado; llama a
  `labAccCerrarTodos()` **para toda** subtab.
- `labGetInformes()` / `_labFiltrarBase` — la cohorte; filtros en `_labCohorteOk`,
  `labCohorteAplicar`, `labCohorteLimpiar`.
- Un render por subtab: `labRenderExtras`, `labHemoRender`, `labMedTricValvRender`, `labCCRender`,
  `labEteRender`, `labStrainRender`, `labRenderDesc`, `labVerDetalleIndicador(idx)`; gráficos en
  `labBarras`, `labChartMeses`, `labDestroyChart`.
- Exportaciones — **el Excel se detalla en `informe-pdf-excel.md`**; acá la puerta:
  `labExpAbrir(modo)`, `labExportarXLSX` (pregunta anonimización **en cada corrida**, delega en
  `_labExportarXLSXReal`), `labPlantillaXLSX`, `labImportarXLSX`/`labImpEjecutar`, `labGenerarPDF`,
  `labAnalisisPDF` y `labPPTEstadistico`.

---

## PPT (PptxGenJS)

- `generarPPT(id)` — **puerta única**, desde un estudio guardado. Verifica que `PptxGenJS` exista y
  avisa con un mensaje **distinto** del de `writeFile` (CDN caído o SRI viejo). Encadena
  `_pptElegirTema` → `_pptElegirPresentador` → `_pptImgsDeEstudio`/`_pptVideosDeEstudio` →
  `_pptElegirImagenes` → `pdfDeInformeGuardado(id, … => _pptDesdeFormulario(…), 'PPT')`.
- `_pptDesdeFormulario(inf, tema, presentador)` — **la función que arma la presentación**:
  `new PptxGenJS()`, pulgadas (`W = 10`, `H = 5.63`), y adentro `_pptEnSuma`, `_pptAgregarImagenes`,
  `_pptAgregarVideos` y `_pptCierre`.
- `_pptTxt(x)` — **todo lo que entra al PPT pasa por acá**: PptxGenJS escribe XML y un `&`, `<` o `>`
  crudo lo rompe. `_pptSpan` lee un valor por id y **avisa por `console.warn` si el id no existe**.
- `_pptxDescargarSaneado(P, nombre)` — reemplaza a `writeFile` y corrige el `[Content_Types].xml` de
  PptxGenJS 3.12.0: **bug de la librería, no de la app**.

---

## Cardio-Oncología

Pestaña `tab-cardioOnco`. `showTab('cardioOnco')` corre `_coMigrarNombreACedula()` y
`renderSeguimientoLista()` **en cada visita**: el seguimiento está indexado por paciente.

- `calcCardioOnco()` — cálculo principal. — lee: `co_fevi_basal`, `co_fevi_actual`, `co_gls_basal`,
  `co_gls_actual`, `co_dosis_antrac`, `co_troponi`, `co_farmaco`, `co_edad`. Acá vivía un **segundo**
  score de riesgo CV basal, eliminado; `co-riesgo-resultado` queda y lo repuebla `hfaicosEstado()`.
- `_ctrcdEstado(d)` — clasificador de CTRCD; umbrales desde `CO_UMBRAL_*`. `_ctrcdEsGrado(k)` acota a
  las **cuatro** claves que la guía gradúa (`severa`, `moderada`, `moderada_menor`, `leve`).
  `_ctrcdGlsRel` / `_ctrcdFeviCaida` — las caídas (la del GLS es **relativa**, ESC 2022).
- `hfaicosEstado()` / `calcHFAICOS()` — la calculadora de riesgo CV basal que queda; alrededor,
  `hfaicosFactores`, `hfaicosSyncDesdeEstudio`, `hfaicosPublicarBasal`.
- `agregarPuntoSeguimiento()` / `renderSeguimientoLista()` — serie longitudinal; almacén en
  `_coPacienteKey`, `_coLeerTodo`, `_coGuardarTodo`, `_coPuntos`, `coCongelarSerie`. Lo guardado antes
  de separar por paciente queda en `__sin_paciente__`: `coAdoptarHuerfanos`/`coDescartarHuerfanos`.
- `coTablaEvolucion` / `coCurvaDataURL` — tabla y curva del informe. `coRefTab(k)` — las referencias
  (`ctrcd`, `hfaicos`, `clases`, `monit`).

---

## Pericardio

Repartido en tres lugares y **sin pestaña propia**.

- `dptCambio()` — **entrada** del derrame y taponamiento (sección «Derrame pericárdico / Taponamiento»
  de la pestaña Hemodinámica): `dptSync()` + `_refrescarInformeSiGenerado()`.
- `dptEstado()` — clasificador. Evalúa los **tres criterios mayores** con «¿se evaluó?» separado de
  «¿se cumple?». — lee: `dpt_col_vd`, `resp_var_mitral`, `dptPletora()` y `dptTamano()`.
- `dptSync()` — render: los rótulos de umbral salen de `DPT_VAR_MITRAL_SIG` / `DPT_VAR_TRIC_SIG`,
  nunca fijos. `dptFrases` / `dptSuma` — prosa y EN SUMA. `_dptPct` / `_dptMm` /
  `_dptPctSospechoso` — lectores con banda.
- `cvrCambio` → `cvrSync` → `cvrEstado` — «Constricción vs Restricción», mismo patrón; alrededor,
  `cvrDatos`, `cvrFilas`, `cvrFrases`, `cvrSuma`.
- El texto libre vive en Otros: sección `pericardio-masas`, select `#pericardio` (su `onchange` es
  `dptCambio`), textarea `#otras_notas` y `showMasaPanel`.

---

## Hemodinámica

Pestaña `tab-hemodinamica`, secciones con `toggleEteSeccion`: perfil hemodinámico (GC · IC · RVS · PCP
· GTP), HTP ESC 2022, TEP, VEXUS, HFA-PEFF, `derrame-tap`, `constr-restr` y POP.

- `calcHemo()` — perfil hemodinámico; lo llama también `calcDiastol` antes de ramificar.
- `vexusEstado()` — congestión venosa sistémica, con `vexusGrado` y `vexusCobertura`.
- `hfapeffScore()` / `hfapeffRender()` — HFA-PEFF, con compuerta por FEVI en `hfapeffFeviGate`.
- `popSync()` — postoperatorio de cirugía cardíaca; con `popHemoSync`, `popPocusSync`, `popPatron`,
  `popDosisDilucion`, `popSumaLinea`.

---

## Eco Pulmonar

Pestaña `tab-pulmonar`. Dos niveles **mutuamente excluyentes**: básico (`pulBasicoUI`,
`pulBasicoHayDatos`, `pulBasicoTexto`) y avanzado (`pulAvUI`, `pulAvZonas`, `pulAvPatron`,
`pulAvSuma`). La exclusión la resuelven `pulAvanzadoCubreBasico` y `pulAvanzadoIntegrado`.

---

## ETE

Pestaña `tab-ete`. Un checkbox visible marca el estudio como transesofágico y cambia el título del
PDF, y **no** es un derivado de «hay datos de ETE cargados». Nueve secciones (`toggleEteSeccion`):
`tecnica`, `morfo`, `mitral`, `mediciones-mitral`, `teer`, `wilkins`, `oai`, `aorta`, `tavi`.

- `calcETE()` — cálculo principal. `calcTEER()` — criterios MitraClip / PASCAL, con `teerEstado`.
  `calcOAI()` — orejuela auricular izquierda.
- `calcWilkins()` — score de valvuloplastia, **solo sobre mitral nativa**: ver `vmEsProtesis`.
- `eteTaviSync()` — pre/post TAVI, con `eteTaviTab` y `eteShuntTaviReset`.
- `eteEpcHoras` / `eteEpcPintar` / `eteEpcDataURL` — widget del eje paraesternal corto, reloj de 12 h.
- `eteInclToggle(id)` — inclusión de una sección en el informe, atributo `data-ete-chk`.

---

## Amiloidosis — y el motor genérico de «hojas» del PDF

Pestaña `tab-amiloidosis`: `calcETT` es el score por ETT (ESC 2021), `amiloSwitchTab` las subtabs,
`amCalcToggle`/`amCalcAutoColapsar` las calculadoras plegables. Pero `amilo*` **ya no es solo
amiloidosis**: es el motor por el que cualquier módulo publica una hoja en el PDF.

- `amiloSecs()` — registro único de secciones integrables: `k`, `lbl`, `tit`, el generador `gen` y
  opcionalmente `hayDatos` (compuerta), `soloHoja` (gobierna la hoja del PDF pero **no** la línea del
  informe narrativo) y `omitir`. Diecisiete generadores `amiloTexto*`, uno por módulo: `ETT`,
  `Algoritmo`, `Hemo`, `HFAPEFF`, `HTP`, `TEP`, `VEXUS`, `EteMitral`, `TEER`, `Wilkins`, `OAI`,
  `AortaETE`, `CardioOnco`, `Pulmonar`, `DPT`, `CVR`, `POP`.
- `amiloIntegrar(k)` — **la puerta**, y es un toggle: si ya está integrado, retira. La compuerta
  `hayDatos` **falla abierta** a propósito y si lanza lo avisa por `console.warn`.
- `amiloBuildCard` / `amiloIntegrado` / `amiloSyncBotones` / `amiloRefrescarInforme` — ciclo de vida.

---

## Contractilidad

Pestaña `tab-contractilidad`. `contrCiclar(id)` es la interacción principal (un clic cicla el
segmento); `contrAplicarTodos`, `contrColorActual` y `contrHayDatos` completan el estado y
`contrReset` lo limpia. Dibujo: `contrDibujarBullseye` y `contrDibujarVistaApical`, sobre los helpers
`contrDescribirCuna` / `contrMuestrearLado` / `contrPolilinea`. `toggleContrPDF` →
`contractilidad_incluir_pdf`.

---

## SGL (strain global longitudinal)

Pestaña `tab-sgl`. `window.sglOnShow` es la **entrada** —la llama el `onclick` del botón— y corre
`sglDibujarBullseye()` + `sglSyncGLS()`. `strainCiclar` / `strainAplicarTodos` / `strainColor` manejan
los segmentos; `bullseyeDataURL` rasteriza el bull's eye para el PDF y `toggleSglPDF` lo incluye o lo
saca (`sgl_incluir_pdf`). `selCat(cat, btn)` + `renderGrid()` son la biblioteca de patrones
(`#sp-root`, registro `PATRONES`), y el origen del GLS lo resuelven `sglOrigenValor`/`sglOrigenSync`/
`sglOrigenElegir`. Las mediciones de strain sobre imagen son del visor (`imagenes.md`).

---

## Fonocardiograma

Pestaña `tab-fono`. Todo el módulo vive en una IIFE, así que casi no hay handlers inline.
`window.fcgOnShow` es la **entrada**: `if (currentValve && animFrame === null) drawStrip(currentValve,
1)` — el mismo predicado atiende el `resize`. `selectValve(valve)` elige la válvula y sincroniza
`<select id="fcg-valve-select">` con los `.fcg-valve-btn[data-valve]`. `drawStrip(valve, progress)`
dibuja sobre canvas y se anima por `requestAnimationFrame`. El prefijo `fcg-` está excluido de los
campos que viajan con el estudio: son controles del visor, no mediciones.

---

## Calculadoras

Pestaña `tab-calculadoras`, una función por calculadora y nada compartido: `cxAVT`, `cxTango`,
`cxTP`, `cxEsf`, `cxPisa`, `cxCont`, `cxTei`, `cxWilkins`, `cxDuke` y `cxGTP` con su `cxGtpSync`. Tres
publican al PDF sobre `_togglePDF`: `cxWilkinsPDF`, `cxDukePDF`, `cxGtpPDF`.

---

## Referencias

Pestaña `tab-refs`. Estática, con un único cableado: `toggleRef(id, headEl)`, 24 usos.

---

## Informes guardados

Pestaña `tab-guardados`, desde el botón al pie
(`showTab('guardados');renderInformesGuardados();actualizarFloatBtns();`).

- `renderInformesGuardados()` — la lista; `igPintar` / `igItemHTML` arman las filas.
- `igFiltrar` / `filtrarInformes` / `aplicarFiltros` — los filtros. `aplicarFiltros` envuelve
  `_aplicarFiltrosCrudo` en un `try` y, si falla, cae a `igRepintarTodoSinFiltrar` avisando que **la
  lista se muestra completa**.
- `igEsCaso`, `igTieneAntec`, `igCmpFecha`, `igMesToggle` — predicados y agrupado por mes; `igNotaPop`
  la nota, `igMas` el menú, `igIOSubXLSX`/`igIOSubDCM` la importación.
- `guardarInforme` y `limpiarCampos` comparten una **única fuente de verdad** sobre qué ids pertenecen
  al estudio y qué es cromo de la app; va como declaración de función y no como `const`, que leído
  antes de su línea corta el `<script>` entero. `nuevoEstudio` es la otra puerta.

---

## Resto de pestañas base

- **`datos`.** `calcBSA` y el checklist clínico (`hcSync`, `hcAbrir`). **`ai-vi`.** `calcVI`, `calcAI`,
  `calcAorta`, `syncTSVI`. **`vd`.** `calcVD`, `calcAD`, `calcPmAD`; dispara además `dptSync` y
  `eteShuntSyncSiExiste`.
- **`doppler`.** `window.calcDiastol` es un **despachador**: corre `calcHemo()` y ramifica por
  `diast_algoritmo` a `calcDiastolASE2025` (por omisión), `calcDiastolASE2016` o la rama BSE 2024, que
  además mira `diast_ritmo`. Más `calcAo`, `calcVenaPulm`, `calcDopTric`, `calcTango`.
- **`valvulas`.** Secciones `valv-mitral`, `valv-aortica`, `valv-tricuspide`, `valv-pulmonar`, subtabs
  `vpTab('morf'|'med')`, prótesis/nativa en `valvEsProtesis`. **Detalle en `valvulas.md`.**
- **`otros`.** Pericardio y masas (arriba) más `pulBasicoUI`.
- **`imagenes`.** `imgRender` es la entrada; además Orthanc (`orthancRender`), DICOM (`_dcmImgLeer`) y
  cineloop (`_cineAbrir`). **Detalle en `imagenes.md`.**
- **`config`.** `cfgOnShow` encadena `cfgRenderModulos`, `cfgSoporteRender`, `cfgLoadMed`,
  `cfgRenderCentros`, `cfgRenderMedicos`, `initPdfPlantillas`; centros y médicos en `ecoGet/SetCentros`
  y `ecoGet/SetMedicos`.
- **`informe`.** `generarInforme(opts)` — **detalle en `informe-pdf-excel.md`**; frases guardadas en
  `frasesLeer` / `frasesGuardar` / `frasesInsertar`.

---

## No confirmado

- **Eco Estrés (`ee*`).** Hay un módulo completo en JS —`eeSwitchTab`, `eeEvalCFVR`, `eeEvalPSAP`,
  `eeEvalEE`, `eeEvalGLS`, `eeCalcCFVR`, `eeRenderBull`, `eeUpdateWMSI`, `eeInformeLineas`, `eeImg*`,
  `eeEcg*`— pero **`#tab-ee` no existe en el HTML**: ni `id="tab-ee"` ni botón que lo abra. Un
  comentario del bloque dice «si vuelve `#tab-ee`» y anota que habrá que decidir el orden del handler
  de `paste` frente a `imgPasteHandler`. Cuidado con el substring: `ee-val`, `ee-e`, `ee-ep`,
  `EE_MODULES` y `eeQrEnabled` son **otras** cosas.
- `tab-lab` se abre por el botón al pie y `applyViewMode` lo esconde por `.tabs-lab-wrap` — ⚠️ no
  verificado: no busqué dónde se emite ese contenedor.
- Qué publica cada módulo en las cuatro superficies (informe, EN SUMA, PDF, Excel) — va en
  `informe-pdf-excel.md`.

---

## Índice de prefijos de función

| Prefijo | Módulo |
|---|---|
| `showTab` · `applyViewMode` · `ecoAdv*` · `secToggle` · `toggleCard` | navegación y acordeones |
| `cc*` · `CC_HOJA_*` · `CC_SHUNTS` · `crit*` | motor compartido de congénitas |
| `vab` `coa` `marfan` `fop` `esub` `easv` `mch` `mca` `tdf` `tv` | Congénitas I (una por lesión) |
| `dap` `vap` `dsav` `cvpa` `tga` `ebs` `eisen` `fontan` · `cia*` | Congénitas II |
| `lab*` · `_lab*` | Laboratorio |
| `_ppt*` · `generarPPT` · `_cinePpt*` | exportación a PowerPoint |
| `co*` · `_ctrcd*` · `hfaicos*` | Cardio-Oncología |
| `dpt*` · `cvr*` | pericardio (derrame/taponamiento, constricción/restricción) |
| `hfapeff*` · `vexus*` · `pop*` · `calcHemo` | Hemodinámica |
| `pulBasico*` · `pulAv*` | Eco Pulmonar |
| `ete*` · `calcETE` · `calcTEER` · `calcWilkins` | ETE |
| `amilo*` · `amCalc*` · `calcETT` | Amiloidosis **y** motor de hojas del PDF |
| `contr*` | Contractilidad |
| `sgl*` · `strain*` · `selCat` · `bullseyeDataURL` | SGL y patrones |
| `fcg*` · `drawStrip` · `selectValve` | Fonocardiograma |
| `cx*` | Calculadoras |
| `ig*` · `aplicarFiltros` · `guardarInforme` · `limpiarCampos` | guardados y ciclo de vida |
| `cfg*` · `eco*` (centros/médicos) · `EE_MODULES` | Config |
| `img*` · `orthanc*` · `_dcmImg*` · `_cine*` · `med*` · `_strain*` | imágenes y visor (`imagenes.md`) |
| `_ind*` · `indic*` | panel de Evidencia (`panel-evidencia.md`) |
| `valv*` · `vp*` · `em*` · `_sev*` | válvulas (`valvulas.md`) |
| `eeEval*` · `eeBull*` · `eeEcg*` | Eco Estrés — **sin pestaña**, ver «No confirmado» |
| `frases*` · `generarInforme` | informe narrativo |
