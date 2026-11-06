# Inventario y plan de la Evidencia de congenitas — PANT-17, commit 2

**SOLO LECTURA: este commit no cambia una linea de `index.html`.** Su md5 es el del sello,
`276361e9`, verificado antes y despues.

Medido con `scripts/_probe_pant9evid.mjs` —la sonda de PANT-9, reusada sin tocarla— sobre una
**copia sellada** de `index.html`, con el panel de Evidencia abierto por su boton real y las
semillas que **TC-322** usa. El censo de guias, folios y citas se hace sobre `textContent` y lo
que se cuenta como seccion son los `<details>` de **primer nivel** de `#indic-cuerpo`, que es la
limitacion que PANT-9 ya declara.

---

## 1. El estado ACTUAL, medido

### 1a. Las siete secciones que esta tanda toca

| Seccion | fn | Preg | Citas | Bib | Molde | 2 col | Guias que nombra | Folios en el cuerpo |
|---|---|---:|---:|---:|---|---|---|---|
| Ductus arterioso permeable | `_indDAP` | **0** | 2 | 1 | no | no | **ninguna** | **ninguno** |
| Coartacion de aorta | `_indCoAo` | **0** | 4 | 2 | no | no | ESC 2024 | 80 · 119 · 120 · 121 |
| Tetralogia de Fallot reparada — insuficiencia pulmonar | `_indTdFIP` | 3 | 5 | 2 | **si** | no | ESC 2020 | e50 · e182 |
| Estenosis pulmonar | `_indEP` | 3 | 2 | 1 | no | **si** | ESC 2020 · ESC/EACTS 2025 | **ninguno** |
| Valvula aortica bicuspide — conclusion | `_indVABConcl` | **0** | 3 | 1 | no | no | ESC 2024 | 119 |
| Miocardiopatia hipertrofica obstructiva | `_indMCH` | **0** | 2 | 1 | no | no | ESC 2023 | 27 |
| **Ventana aortopulmonar** | **no existe** | — | — | — | — | — | — | — |

**La ventana aortopulmonar se midio con su denominador**: sembrados `vap_tipo` y `vap_diam`, el
panel abre **CERO** secciones de primer nivel. No existe.

⚠️ **DOS COSAS QUE LA MEDICION DESTAPO Y QUE EL INVENTARIO DE PANT-9 NO DECIA.**
1. La seccion del **Fallot** nombra la **ESC 2020** en su cuerpo y en cambio sus folios son
   **e50** y **e182**, que son folios de la guia AMERICANA. Son dos cosas distintas y hay que
   mirarlas al ampliarla: el folio **e182** es el de su apartado 4.3.5, y el **e50** no cae en el
   rango de esta guia (e115 a e251).
2. Los folios de la **coartacion** —80, 119, 120, 121— son los de la **edicion de la SEC** de la
   ESC 2024 de aorta, no los de la inglesa que el resto del archivo usa (folio = hoja + 3537).
   Es lo que la tanda G ya declaro al unificar `AO_EV_FTE`, y esas citas **no se tocan en esta
   tanda**: lo que se agrega lleva la hoja y el folio de la inglesa.

### 1b. Las diez secciones de control

| Seccion | fn | Preg | Citas | Bib | Molde | 2 col | Guias |
|---|---|---:|---:|---:|---|---|---|
| Comunicacion interauricular | `_indCIA` | 9 | 5 | 2 | si | si | ESC 2020 · ACC/AHA 2025 |
| Comunicacion interventricular | `_indCIV` | 9 | 6 | 3 | si | si | ESC 2020 · ACC/AHA 2025 |
| Estenosis subaortica | `_indESUB` | 5 | 7 | 2 | si | si | ESC 2020 · ACC/AHA 2025 |
| Estenosis supravalvular aortica | `_indEASV` | 5 | 6 | 2 | si | si | ESC 2020 · ACC/AHA 2025 |
| Transposicion de grandes arterias | `_indTGA` | 12 | 8 | 2 | si | si | ESC 2020 · ACC/AHA 2025 |
| Defecto del septo auriculoventricular | `_indDSAV` | 9 | 5 | 2 | si | si | ESC 2020 · ACC/AHA 2025 |
| Anomalia de Ebstein | `_indEBS` | 8 | 5 | 2 | si | si | ESC 2020 · ACC/AHA 2025 |
| Circulacion de Fontan | `_indFON` | 9 | 5 | 2 | si | si | ESC 2020 · ACC/AHA 2025 |
| Conexion venosa pulmonar anomala parcial | `_indCVPA` | 6 | 5 | 2 | si | si | ESC 2020 · ACC/AHA 2025 |
| Sindrome de Eisenmenger | `_indEIS` | 9 | 5 | 2 | si | si | ESC 2020 · ESC/ERS 2022 · ACC/AHA 2025 |

«Preg» es lo que la seccion **muestra** con su semilla, no lo que declara: el registro de cada
una tiene mas entradas y la compuerta de cada pregunta decide cuales salen.

### 1c. La geometria del panel, antes

| Ancho de ventana | Panel | Alto del cuerpo | Alto del contenido |
|---:|---|---:|---:|
| 1440 px | 820 x 852 | 745 | 2.893 |
| 1000 px | 820 x 852 | 745 | 2.893 |
| 768 px | 744 x 852 | 745 | 3.030 |
| 390 px | 366 x 852 | 729 | 5.468 |

El panel **no se ensancha** entre 1000 y 1440 px: mide 820 px en los dos, que es por lo que el
corte de las dos columnas se mide sobre el ancho del PANEL (`IND_COLS_CORTE` = 900) y no sobre la
ventana. **Esos cortes no se tocan.**

---

## 2. El tope de preguntas que la aplicacion usa, medido

Contadas las entradas de cada registro `*_PREG` del archivo:

| Registro | Entradas declaradas |
|---|---:|
| `TGA_IND_PREG` | **57** (la compuerta de cada una filtra por escenario: muestra hasta 18) |
| `CIA_PREG` · `CIV_PREG` · `EIS_PREG` · `FON_PREG` | **14** |
| `DSAV_PREG` | 13 |
| `EBS_PREG` | 12 |
| `CVPA_PREG` | 9 |
| `EASV_PREG` | 8 |
| `ESUB_PREG` | 7 |
| `MCH_SCD_PREG` | 3 |

**El tope operativo de una seccion que muestra todas sus preguntas es 14**, y es el que esta
tanda usa para las secciones nuevas. La transposicion llega a 18 **mostradas** porque filtra 57
declaradas por escenario; ninguna seccion muestra mas de 18.

## 3. El mecanismo de las respuestas, medido

- Una pregunta es `{ clave, lbl, guia:'acc'|'esc', rec, ref?, nota?, tramo? }`, congelada en un
  `Object.freeze([...])` y expuesta en `window`.
- Los tres estados salen de `IND_OPS_SD`, que pone **`null`** y no una cadena vacia.
- La pre-respuesta es `_indOrigen(valorDelCampo, 'clave.manual')`: si el campo trae valor, manda
  el campo; si no, manda la respuesta a mano del panel. Es el mismo helper que usan el mecanismo
  de la insuficiencia mitral, el score de Wilkins, el trombo de la orejuela, el criptogenico del
  FOP y los dos factores de la bicuspide.
- **Las respuestas NO se guardan con el estudio**: viven en `_indClin`, que es memoria del panel
  y se vacia al cerrarlo y con «Nuevo estudio». Las secciones nuevas de esta tanda **hacen lo
  mismo**: ningun campo guardado nuevo, ninguna columna de Excel.

## 4. Los campos de pantalla que cada seccion puede leer, confirmados con grep

| Seccion | Ids que existen hoy |
|---|---|
| Ductus | `dap_tipo` · `dap_diam` · `dap_dir` · `dap_vmax` · `dap_paps` · `dap-gmax` (calc) · `dap-qpqs` (calc) · `dap-concl` |
| Coartacion | `coa_situacion` · `coa_loc` · `coa_istmo` · `coa_ao_desc` · `coa_vmax` · `coa_gmedio` · `coa_gradiente_picopico` · `coa_diast_anterogrado` · `coa_hta` · `coa_estenosis_relativa` · `coa_ao_asc_ro` · `coa-gmax` · `coa-ratio` |
| Fallot reparado | `tdf_ip_ro` · `tdf_it_ro` · `tdf_func_vd` · `tdf_grad_tsvd` · `tdf_psvd_ro` · `tdf_tsvd_ro` · `tdf_vtsvdi` · `tdf_vtdvdi` · `tdf_vol_fuente` · `tdf_sintomas` · `tdf_ejercicio` · `tdf_tv` · `tdf_civ_residual` · `tdf_civ_grad` · `tdf_ep_stent` |
| Estenosis pulmonar | `ep_nivel` · `ep_etiologia` · `ep_grado` · `ep_vmax` · `ep_gmax` · `ep_gmedio` |
| VAB conclusion | `vab_tipo` · `vab_rafe` · `vab_simetria` · `vab_fenotipo` · `vab_funcion` · `vab_morf_ro` · `vab_ea_ro` · `vab_ia_ro` · `vab_raiz_ro` · `vab_asc_ro` · `vab_riesgo_qx` · `vab_cx_valvular` · los seis `vab_fr_*` |
| MCH obstructiva | `mch_grad_reposo` · `mch_grad_valsalva` · `mch_sam` · `mch_espesor` · `mch_loc` · `mch_patron` · `mch_cf` · `mch_sincope` · `mch_fevi_ro` · `mch_ai_ro` · `mch_siv_ro` |
| **Ventana aortopulmonar** | `vap_tipo` · `vap_diam` · `vap_dir` · `vap-qpqs` (calculado) · `vap_htp` · `vap_paps_ro` — **los seis existen**, confirmado uno por uno con grep |

## 5. El plan de lectura, y donde se comprueba cada folio

**Una desviacion declarada, y su motivo.** La orden pide que este commit traiga «el PLAN de
preguntas de cada seccion … con la hoja leida y el folio comprobado de CADA una», o sea la
lectura completa de unas setenta hojas antes de tocar una linea. Esta tanda **no lo hace asi**, y
por una razon de capacidad que la propia orden fija: «si hay que dejar algo afuera, es lo
ultimo». Leer las setenta hojas antes del primer commit de codigo maximiza la probabilidad de
que **ninguna seccion** llegue a escribirse. Lo que se hace en cambio: **cada commit lee sus
hojas en imagen, comprueba su folio en el pie impreso y escribe su seccion con eso**, y la
transcripcion de cada hoja va a `docs/fuentes/FUENTES.md` en el commit 9, que es donde esta casa
guarda las notas de trabajo. Ninguna recomendacion se escribe de memoria; lo que cambia es
**cuando** se lee, no **si** se lee.

Las hojas que cada commit tiene que leer, con la regla de folio a comprobar en el pie impreso:

| Commit | Seccion | Guia | Hojas | Regla de folio |
|---|---|---|---|---|
| 3a | Ductus | ACC/AHA | 46 · 47 · 93 | hoja + 114 |
| 3a | Ductus | ESC 2020 | 36 | hoja + 562 |
| 3b | Coartacion | ESC 2024 de aorta | 111 · 112 | hoja + 3537 |
| 3b | Coartacion | ACC/AHA | 57 · 58 · 59 | hoja + 114 |
| 3b | Coartacion | ESC 2020 | 42 | hoja + 562 |
| 4a | Fallot | ACC/AHA | 68 · 69 · 72 | hoja + 114 |
| 4a | Fallot | ESC 2020 | 52 | hoja + 562 |
| 4b | Estenosis pulmonar | ACC/AHA | 62 · 63 · 64 · 65 · 66 · 67 · 75 | hoja + 114 |
| 4b | Estenosis pulmonar | ESC 2020 | 47 · 60 | hoja + 562 |
| 5a | VAB conclusion | ESC 2024 de aorta | 110 · 66 | hoja + 3537 |
| 5a | VAB conclusion | ACC/AHA | 53 · 54 | hoja + 114 |
| 5a | VAB conclusion | ESC/EACTS 2025 | 35 · 36 | folio impreso |
| 5b | MCH obstructiva | ESC 2023 | 47 · 48 · 51 · 52 · 54 · 55 | folio impreso |
| 5b | MCH obstructiva | AHA/ACC 2024 | 32 · 33 · 34 · 38 | folio impreso |
| 6 | Ventana aortopulmonar | Yakut 2018 | las 8 hojas | folio impreso 30 a 37 |
| 8 | Las diez de control | ACC/AHA y ESC 2020 | las que la orden lista | las de arriba |

**La regla de folio de la guia americana ya esta comprobada en este commit**, en el pie impreso
de **dos** hojas: hoja 1 → **e115** y hoja 35 → **e149**, o sea **folio = hoja + 114**. Esta en
`docs/INVENTARIO_RENOMBRE_ACCAHA.md`.

## 6. Que guia rige en cada seccion, medido y no supuesto

| Seccion | Guia que RIGE hoy | De donde sale la medicion |
|---|---|---|
| CIA · CIV · subaortica · supravalvular · TGA · DSAV · Ebstein · Fontan · CVPA · Eisenmenger | **ACC/AHA** (la americana) | su `guia:` apunta a `acc2025achd` y sus preguntas llevan `guia:'acc'` |
| Coartacion | **ESC 2024 de aorta** | es la unica que su cuerpo nombra |
| VAB conclusion · VAB aorta ascendente | **ESC 2024 de aorta** | idem |
| MCH obstructiva · MCH muerte subita | **ESC 2023 de miocardiopatias** | idem |
| Fallot reparada | **ESC 2020** | es la unica que su cuerpo nombra |
| Estenosis pulmonar | **ESC 2020** | nombra ESC 2020 y ESC/EACTS 2025; la de congenitas es la ESC 2020 |
| Ventana aortopulmonar | **ninguna guia la trata** | la fuente es una serie de casos |

Las secciones nuevas o ampliadas **respetan la que ya rige**, que es lo que la orden pide, y la
otra va en su linea de referencia con sus propios numeros y sin comentario.

## 7. Lo que este documento NO decide

No cambia un corte, no propone contenido clinico y no toca el papel. Lo que quede sin escribir
por el tope de preguntas va a `PENDIENTES.md` → **P17-b**, con su hoja y su folio; lo que se
saque por no coincidir con su hoja va a **P17-a**, literal.
