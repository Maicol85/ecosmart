<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Mapa de funciones — Congénitas, Laboratorio, PPT, Cardio-Onco, Pericardio y resto

Mapa **grueso**: la puerta de entrada de cada módulo y sus funciones principales, no el detalle
interno.

El detalle fino vive en otros archivos de esta carpeta y **no se repite acá**: `valvulas.md`,
`panel-evidencia.md`, `informe-pdf-excel.md`, `tests.md`, `imagenes-visor.md` — los cinco existen en
disco (verificado el 2026-10-01).

> ⚠️ **TETRALOGÍA DE FALLOT REPARADA — EL CUERPO DEL INFORME CAMBIÓ DE FORMA (AJ6-1, 2026-10-24).**
> Ya no es un párrafo corrido: `tdfConclusion` devuelve `lineasInf` —una fila vacía, el título
> «Tetralogía de Fallot reparada.» y renglones con guion— y **el informe firmado perdió la
> conducta**, que vive en la Evidencia de Referencias. `resumen` (el PPT) y `clave` (el
> Laboratorio) no se movieron. Todo el detalle, con los tres grupos y la trampa de la fila vacía,
> en **`docs/mapa/aj6-fallot-pulmon-refs.md`**.

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

> ⚠️ **LA SECCIÓN VAB TIENE SU PROPIO MAPA DESDE LA TANDA Y3d (2026-10-19):**
> `docs/mapa/vab-bicuspide.md`. Ahí están la disposición en tres columnas con el dibujo al lado,
> las seis tarjetas ⓘ, los factores de riesgo con **casilla** y su migración, `vabGeom` con la
> tabla de qué dibuja cada tipo y cuáles **no se dibujan inventados**, la morfología de Válvulas
> siguiendo al tipo de fusión, la **única** descripción de la válvula en el informe, el PDF con su
> tabla y por qué el recordatorio de la coartación quedó **sin porcentaje**. Los cortes de
> `vabConclusion` y la Tabla 68 de la ESC 2024 siguen acá.

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

> ⚠️ **La ESTENOSIS MITRAL del Laboratorio tiene su propio mapa:**
> `docs/mapa/laboratorio-estenosis-mitral.md`. Desde el 2026-10-14 no se lee por
> `_labEstenSev(inf,'em_grado')` como las otras siete lesiones, sino por `_labEmLectura(inf)`, que
> calcula **seis categorías** excluyentes y **dos casillas** superponibles desde los DATOS. Ahí
> están los dueños, las siete decisiones y las superficies, una por una. **La tabla resumen de ocho
> filas y el gráfico apilado siguen leyendo el token** —`docs/PENDIENTES.md` → L1—.

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

> ⚠️ **La pestaña OTROS —pericardio, masas y el módulo básico de ecografía pulmonar— y cómo salen
> en el informe tienen mapa propio desde la tanda «I» (2026-10-16):
> `docs/mapa/otros-pericardio-pulmon.md`.** Ahí están las tres cosas que cambiaron: cada tema en su
> PROPIA oración (antes el narrativo fundía pericardio y masas en una sola), el selector de tres
> estados del compromiso hemodinámico, el lado del derrame pleural y la nota de la consolidación. Y
> lo que quedó sin hacer por falta de fuente: Balik y las dos separaciones de líneas B.

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

> ⚠️ **DESDE LA TANDA AJ3 (23/10/2026) EL BLOQUE YA NO SE CONGELA: `docs/mapa/aj3-ett-avanzado.md`.**
> Ahí están el barrido genérico (`amiloRefrescarTodos` + su oyente de documento con temporizador),
> la marca de edición manual `_amiloEditado` —que guarda un TEXTO y no un booleano— con su campo
> persistido `am-editados`, el aviso ámbar en sus dos lugares, la confirmación al reintegrar un
> bloque editado, y los DOS casos no decididos medidos tal como están. **El refresco se cableaba a
> mano módulo por módulo y estaban cableados ocho de diecisiete; medidos contra `2b9f3ef`, ONCE
> quedaban viejos, dos de ellos de la lista de los «cableados».**

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

> ⚠️ **El score de WILKINS pasó a tener UN SOLO CÁLCULO para la tarjeta de ETE y la de
> Calculadoras (tanda «Wilkins», 2026-10-16): `docs/mapa/wilkins-unificado.md`.** Ahí están la regla
> pura (`_wilkCalc`), sus dos lectores, los dos centinelas, la marca de «puntuado a propósito» y la
> tabla de dónde se consume el score y qué cambia para un estudio legado con 1/1/1/1.

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

---

## CONTRACTILIDAD y el 3D del VENTRÍCULO → tienen mapa propio

Desde la tanda **K** (2026-10-16): el botón «Incluir bull's eye en PDF» y de qué depende que el
bull's eye entre al papel, la fila de tres bloques bajo el bull's eye, la tabla «Referencia de
colores» retirada y el interior del 3D del ventrículo están en
**`docs/mapa/contractilidad-3d-vi.md`**.

---

## ⚠️ La pestaña OTROS ganó seis hallazgos en la tanda «CORTOS» (2026-10-17)

ASIA, seis variantes anatómicas, la circunfleja retroaórtica, el test de burbuja, el «derrame
pericárdico» del papel y la separación de las líneas B. Cada uno con su casilla y su caja de nota,
un solo dueño por frase y cero columnas nuevas de Excel.

⚠️ **EL TEST DE BURBUJA SIGUE TENIENDO DOS ESCALAS EN LA APP, declarado y no tocado:** la sección
FOP de «CC frecuentes» conserva sus `fop_contraste` / `fop_burbujas` con `<5 / 5-20 / >20`, y el
bloque nuevo usa las bandas de Referencias (`<10 / 10-30 / >30`). Unificar los `value` de ese
`<select>` dejaría a cada estudio guardado en `selectedIndex -1`.

Todo en `docs/mapa/otros-hallazgos.md`.


---

## ⚠️ El FOP pasó a tener UN solo dueño con la pestaña Otros (ARR, 18/10/2026)

El test de burbuja y el aneurisma del septum existían **dos veces**, con dos escalas. Desde el
ARR8 son **un dato con dos controles** (espejo bidireccional), el informe del FOP es
**esquemático** —tres oraciones en el estilo del EN SUMA— y el **aviso de la edad se omite** del
informe y del EN SUMA. → `docs/mapa/fop-burbuja-unificado.md`

---

## ⚠️ LA REORGANIZACIÓN DE PESTAÑAS — trabajo «B» (2026-10-21)

Las pantallas de esta zona **cambiaron de lugar**. Nada de lo que este mapa documenta —cortes,
operadores, fórmulas, textos clínicos, ids— se movió; lo que cambió son las puertas:

- **Pericardio y masas** salió de «Otros» a su propia pestaña del rail (`#tab-pericardio`).
- **Otros** quedó con dos sub-pestañas: «Test de burbuja» y «Variantes anatómicas» (el ASIA, las
  seis estructuras normales prominentes y la RAC).
- **El eco pulmonar** —básico y avanzado— quedó en UNA pestaña del rail, y el texto del avanzado
  pasó de una hoja aparte del PDF al **cuerpo del informe**.
- **Calculadoras** es hoy la primera sub-pestaña de **Referencias**.
- **CC frecuentes** y **CC complejas** se abren con un solo botón, «C. Congénitas».
- El **Fonocardiograma** salió de la app (copiado a `docs/para-cardiosalud/fonocardiograma/`).
- La única palabra que cambió es la frase de **Balik**, que ahora nombra la fórmula.

**El mapa de todo eso es `docs/mapa/pestanas-reorganizacion.md`**, con la tabla «qué se movió»,
las tres cosas que `showTab` hace y que condicionan cualquier barra de sub-pestañas, el drawer
móvil y sus `data-mod`, y las seis trampas de medición.

---

## El trabajo «H» (2026-10-21) — puntero

Las **aortopatías de la pestaña C. Congénitas** —Marfan, Loeys-Dietz, Turner, ACTA2, el nuevo
**Ehlers-Danlos vascular**— y la **coartación** cambiaron de cita y, en tres casos, de clase.
El mapa es **`docs/mapa/aorta-aortopatias-evidencia.md`**.

Lo imprescindible:

- `marfanEstado` y `marfanSync` leen **`MARFAN_FTE`**, el dueño único de la tabla y el folio de
  cada síndrome. Antes todos los umbrales se atribuían a «la Tabla 62», que es **sólo del Marfan**,
  y el EN SUMA citaba **«(ESC 2020)»**, que es la guía de congénitas y no la de aorta.
- **Loeys-Dietz ya no es Clase I**: es **IIa · C con MÁS de 45 mm** y **IIb · C desde 40 mm** con
  características de riesgo alto (Tabla 66, folio 116), que son **dos filas distintas**.
- **Ehlers-Danlos vascular** es la novena opción y su clave es **`sin_umbral`**: la guía no publica
  diámetro de intervención. Esa clave **tuvo que entrar en `CX_NOCONCL`** del Laboratorio, o
  `_labDistribDe` la descartaba en silencio.
- La **coartación** afirma significación por Doppler con el **gradiente MEDIO > 20 mmHg** (Figura
  44, folio 120); el máximo ya no afirma solo. La indicación sigue saliendo del **pico-pico
  invasivo**.
- **Las seis claves de `vabConclusion` no se movieron**, y es lo que protege los estudios guardados
  y el recuento del Laboratorio.

---

## El trabajo «D» (2026-10-22) — el foramen oval: puntero

La tanda del **FOP** vive en `docs/mapa/fop-burbuja-unificado.md` → «El trabajo D». Lo que toca
de esta zona:

- **`otr_asia_lado`** («Se abomba hacia»: AD, AI o ambos) nace en **Otros · Variantes
  anatómicas**, al lado de `otr_asia`, y es su **dueño único**. Decide el corte del aneurisma
  del septum: 10 mm hacia un lado, **15 mm de excursión total** con «ambos lados» (Silvestry
  2015, folio 916). Sin consignar manda el de 10, que es el que la app aplica desde siempre.
- **`otr_burb_lat`** (3 a 6 latidos, con el **3 por defecto**) nace en **Otros · Test de
  burbuja**, dentro de `otr-burb-pos`, y también es dueño único (Silvestry 2015, folio 931).
  Su primera opción es el 3 y la vacía va última: `limpiarCampos` hace `selectedIndex = 0`.
- La sección del FOP de «CC frecuentes» pasa a **tres columnas** —Anatomía, Shunt y Contexto
  clínico— y **lee** esos dos datos en dos `<span>` de solo lectura. **Sin dibujo.**
- La ficha **«Foramen Oval Permeable — ASIA, shunt y cierre»** entra en Referencias ·
  **Otros hallazgos**, pegada a la del test de burbuja; la de **Test de Burbujas** gana la
  **fuente** de su tabla de tiempos, y **ni un corte de esa tabla se movió**.
- La conclusión, el informe y el EN SUMA del FOP son **descriptivos**: sin «ESC», sin indicación
  de cierre y **sin el ACV criptogénico**, que pasa al PDF como «Motivo del estudio».

---

## ⚠️ LA TANDA «D2» (21/10/2026) — ver `docs/mapa/d2-correcciones.md`

- **Las barras de CC frecuentes y de CC complejas nacen CERRADAS.** Las abría `secAutoOpen` por
  dos controles de la barra de la VAB que no son datos del paciente: `vab-anim-scrub` (el
  deslizante de la animación, `value="0"`) y `vab_funcion` (el oculto que se **deriva** de los
  grados de Válvulas). Llevan `data-ui` y `data-espejo`.
- **La caja de «Conclusión» del FOP se apila**: la etiqueta queda entera por encima del texto, con
  una clase propia (`fop-concl-row`) y sin tocar `.calc-row`.
- La regla del **aneurisma del septum** y el selector de **latidos** cambiaron: ver el mapa de la
  tanda.

---

## La tanda I-E4 (22/10/2026) — la insuficiencia pulmonar en Fallot reparada, en Evidencia

Sección nueva **`_indTdFIP`**, compuerta `tdfConclusion()`. Publica **DOS guías en bloques
separados** porque no piden lo mismo: la **ACC/AHA 2025** (folio e182) define la disfunción valvular
pulmonar por una fracción regurgitante por resonancia **> 25 %** y pide **DOS** criterios en el
asintomático; la **ESC 2020** (folio e50) pide insuficiencia **grave** y **UNO** de cuatro.
El **80 ml/m²** aparece en las dos y no es el mismo criterio: una lo **incluye** y la otra pide
**por encima**.

⚠️ **El módulo de la pestaña de congénitas NO se tocó**: sigue publicando su conclusión y su
conducta en el informe firmado, y esa mudanza no la autoriza esta orden (`PENDIENTES.md` → I-7).

Detalle, constantes y trampas en **`docs/mapa/tanda-i-ete.md` § 8**.

---

## ⚠️ La tanda J movió esto (2026-10-24) — el mapa está en otro archivo

El colapso de la aurícula derecha pasó a ser **diastólico** con su duración (`dpt_col_ad_dur`,
corte `DPT_COL_AD_DUR_SIG` = 0,34), la plétora de VCI del pericardio bajó a **>20 mm**
(`DPT_VCI_PLETORA_MM`), la constricción perdió el aviso de confirmación invasiva y ganó el
cociente de la vena suprahepática (`cvr_hep_coc`, `CVR_HEP_COC_MIN` = 0,78), VEXUS pasó a usar los
**dos** operadores del artículo (`VEXUS_VCI_MM`, con `≥` para el grado 1 y `>` para el 2 y el 3) y
perdió sus frases de conducta, y entraron **tres Evidencias nuevas** más la ficha de Referencias
de constricción.

**Todo eso está en `docs/mapa/j-pericardio-constriccion-vexus.md`.** Acá no se repite.

---

## La tanda «J2» movió cosas de Hemodinámica, Cardio-Oncología y Amiloidosis → otro mapa

Puntero. El relato vive en **`docs/mapa/j2-hemo-onco-amiloide-pulmon.md`**. En una línea cada uno:

- **Hemodinámica**: tres globos ⓘ nuevos (`hemo-ic`, `hemo-rvs`, `hemo-forr`) y las dos ramas del
  perfil que usan la banda `<800` — la de IC bajo con RVS baja publica **los dos números** y ya no
  «considerar shock mixto/distributivo»; la distributiva queda con el chip «Criterio de EcoSmart».
  ⚠️ **`_rvsBanda` NO se tocó**: de ella cuelga la vasoplejia del posoperatorio.
- **Cardio-Oncología**: el seguimiento tras radioterapia pasa a «desde los 5 años y luego cada 5»
  (ESC 2022, Recomendaciones-tabla 41, folio 4314, IIa · C) en los **tres** lugares, y sale el
  plazo de «2-4 sem» de las dos filas de antraciclinas.
- **Amiloidosis**: salen las etiquetas «INTERMEDIO» (5-7) y «BAJO» (<5) del score ETT; para menos
  de 8 puntos la pantalla publica el puntaje y su **rendimiento en ese corte** (Boldrini 2020,
  Tabla 4, pág. 30). «ALTO» con ≥8 o con 2 de 3 cualitativos no se tocó.
  ⚠️ El **Laboratorio conserva su propia banda** (`_labAmilBanda`, cortes <6 / 6-7 / ≥8).

---

## ➜ El POSOPERATORIO de cirugía cardíaca vive en su propio mapa

La subpestaña **«POP Cirugía Cardíaca»** de Hemodinámica —su pantalla, el esquema animado, la
vasoplejia, el derrame pleural, lo que sale al informe y lo que no, su ficha de Referencias y
su Evidencia— está en **`docs/mapa/g-posoperatorio.md`** (tanda «G», 2026-10-24).

## ⚠️ La tanda B puso los espejos de estos módulos al día solos (2026-10-27)

Los `*_ro` de MCH, MCA, Fallot, TGA, Ebstein, la coartación, el DSAV, la CVPA y el shunt del ETE
—y los `dap-qpqs` / `vap-qpqs`— se repintaban **sólo** desde el `oninput` de sus propios campos y
desde `RECALC_MODULOS`. Cambiar la fuente en otra pestaña no avisaba a nadie: medido, **ocho de
los once pintores que quedaban viejos** son de esta zona.

Hoy `tvSync`, `dapSync`, `coaSync`, `vapSync`, `ebsSync`, `tgaSync`, `dsavSync`, `cvpaSync` y
`eteShuntSync` están en `ESPEJOS_VIVOS()`. **Ver `docs/mapa/b-espejos-pam.md`.**


## → La TANDA AORTA-2 (2026-10-30) — puntero, la COARTACIÓN

Dos cosas. **Los tres textos largos de la pantalla** —el del gradiente pico-pico, el del
estrechamiento relativo y el de la hipertensión— pasaron a una línea corta cada uno, con el texto
completo en un globo ⓘ nuevo en la fila «Conclusión», verificado en imagen contra la ESC 2020 de
cardiopatías congénitas del adulto (hoja 42, folio 604). **Y la coartación llega al EN SUMA esté o
no integrada al informe**, con una línea descriptiva: sin clase, sin nivel y sin tabla.

→ **`docs/mapa/ao2-segmentos-bicuspide.md`** § 3
