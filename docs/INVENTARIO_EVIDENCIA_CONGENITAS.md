# Inventario de la Evidencia de las congénitas — SOLO LECTURA

**Tanda PANT-9, commit 9 (2026-11-04).** Este documento **no cambia nada de la aplicación**: es
una medición, hecha en Chrome sobre el árbol de la tanda, para que la próxima tanda —la Evidencia
de las congénitas— se escriba con datos y no de memoria. **No propone preguntas ni diseño**, que
es lo que la orden fija.

Medido con `scripts/_probe_pant9evid.mjs`, que para cada sección siembra su escenario —los mismos
que usa **TC-322**, el caso que recorre `IND_SECS` y exige que cada sección tenga el suyo—, abre el
panel de Evidencia y cuenta sobre el DOM emitido. El md5 de `index.html` es **idéntico antes y
después** de este commit: `868883cefd48144ca2797de301d83dff`.

⚠️ **DOS PREMISAS DE LA ORDEN SON FALSAS, Y ESTÁN MEDIDAS.** La orden lista entre «las secciones
sin Evidencia» a **DAP, estenosis pulmonar, Fallot y la coartación**. Las cuatro **SÍ tienen**
sección de Evidencia, registrada en `IND_SECS` y verificada abriéndola con su escenario. Lo que
falta es otra cosa, y está en la segunda tabla.

⚠️ **UNA LIMITACIÓN DEL MÉTODO, DECLARADA.** El censo de guías, folios, hojas y citas se hace sobre
`textContent` y no sobre `innerText`: un `<details>` **cerrado** —las tarjetas de los globos ⓘ del
glosario— no aporta `innerText`, así que medirlo ahí daba **cero guías** en secciones que sí las
nombran. La primera versión de la sonda contaba además los `<details>` anidados de esos globos como
secciones, y daba **28 secciones donde hay dos**: lo que se cuenta son los `<details>` de **primer
nivel** de `#indic-cuerpo`.

---

## 1. Lo que hay

Las **quince** secciones de Evidencia que una cardiopatía congénita abre, con su medición. «Preg» es
el número de preguntas de tres estados; «citas» los corchetes `[N]` del cuerpo; «bib» las entradas
de «Bibliografía de esta sección»; «molde» es la marca `data-ind-compacta` y «preg-2col» la marca
`data-ind-preg`, que es la que reparte las preguntas en dos columnas.

| Sección (`IND_SECS`) | fn | Preg | Citas | Bib | Molde | Preg-2col | Guías que nombra |
|---|---|---:|---:|---:|---|---|---|
| Estenosis pulmonar | `_indEP` | 3 | 2 | 1 | no | **sí** | ESC 2020 · ESC/EACTS 2025 |
| Comunicación interauricular | `_indCIA` | **9** | 5 | 2 | **sí** | **sí** | ESC 2020 · ACC/AHA 2025 |
| Comunicación interventricular | `_indCIV` | **9** | 6 | 3 | **sí** | **sí** | ESC 2020 · ACC/AHA 2025 |
| Ductus arterioso permeable | `_indDAP` | **0** | 2 | 1 | no | no | ninguna nombrada |
| Coartación de aorta | `_indCoAo` | **0** | 4 | 2 | no | no | ESC 2024 |
| Estenosis subaórtica | `_indESUB` | 5 | 7 | 2 | **sí** | **sí** | ESC 2020 · ACC/AHA 2025 |
| Estenosis supravalvular aórtica | `_indEASV` | 5 | 6 | 2 | **sí** | **sí** | ESC 2020 · ACC/AHA 2025 |
| Foramen oval permeable | `_indFOP` | 1 | **19** | 3 | no | no | AHA/ASA 2021 |
| Miocardiopatía hipertrófica obstructiva | `_indMCH` | **0** | 2 | 1 | no | no | ESC 2023 |
| Miocardiopatía hipertrófica — prevención de muerte súbita | `_indMCHSCD` | 2 | 5 | 2 | no | no | ESC 2023 · AHA/ACC 2024 |
| Transposición de grandes arterias | `_indTGA` | **12** | 8 | 2 | **sí** | **sí** | ESC 2020 · ACC/AHA 2025 |
| Tetralogía de Fallot reparada — insuficiencia pulmonar | `_indTdFIP` | 3 | 5 | 2 | **sí** | no | ESC 2020 |
| Válvula aórtica bicúspide — conclusión | `_indVABConcl` | 0 | 3 | 1 | no | no | ESC 2024 |
| Válvula aórtica bicúspide — aorta ascendente | `_indVAB` | 4 | 4 | 1 | no | no | ESC 2024 · ESC/EACTS 2025 |
| Aorta torácica — dilatación y aortopatía | `_indAo` | 3 | 4 | 1 | no | **sí** (dos columnas) | ESC 2024 |

### Las hojas y los folios que cada una cita

| Sección | Folios | Hojas |
|---|---|---|
| Comunicación interauricular | e149 · 592 | 35 · 30 |
| Comunicación interventricular | e153 · e154 · 595 | 40 · 33 |
| Coartación de aorta | 80 · 119 · 120 · 121 | — |
| Estenosis subaórtica | e166 · 603 | 52 · 41 |
| Estenosis supravalvular aórtica | e169 · e170 · 602 | 55 · 56 · 40 |
| Foramen oval permeable | e372 · e411 · e413 · 1395 · 1396 · 1399 | — |
| Miocardiopatía hipertrófica obstructiva | 27 | 28 |
| Miocardiopatía hipertrófica — muerte súbita | 3561 · 3562 · e1267 | 59 · 60 · 29 |
| Transposición de grandes arterias | e191 · 619 | 77 · 57 |
| Tetralogía de Fallot reparada | e50 · e182 | 68 |
| Válvula aórtica bicúspide — conclusión | 119 | — |
| Válvula aórtica bicúspide — aorta ascendente | 119 · 4660 | — |
| Aorta torácica | 3603 · 3607 · 3647 | 66 · 70 · 110 |
| Estenosis pulmonar | — (cita por tabla, sin folio en el cuerpo) | — |
| Ductus arterioso permeable | — | — |

⚠️ **DOS SECCIONES CITAN SIN NOMBRAR FOLIO EN EL CUERPO**: la estenosis pulmonar y el ductus. Y el
**ductus no nombra ninguna guía** en su texto, aunque tiene dos corchetes y una entrada de
bibliografía: el nombre de la guía vive en la entrada, no en la línea.

### La regla «una pregunta, una guía» y los tres estados

Las **siete** secciones con `data-ind-preg="1"` —estenosis pulmonar, CIA, CIV, estenosis
subaórtica, estenosis supravalvular, transposición y aorta torácica— son las que reparten las
preguntas en dos columnas y las que publican las respuestas en tres estados **Sí | No | ?**. Las
**cuatro** que publican las dos guías con la regla «una pregunta, una guía» —la que RIGE primero y
la otra en su línea de referencia— son **CIA, CIV, estenosis subaórtica, estenosis supravalvular** y
**transposición**: las cinco nombran a la vez la ACC/AHA 2025 y la ESC 2020.

### Qué campos de la pantalla lee la Evidencia

La tarjeta de datos del estudio (`.ind-datos`) solo la emiten las secciones con **molde**. La única
que la publicó en la medición es la **estenosis pulmonar**, con ocho filas: gradiente máximo, Vmax
pulmonar, grado consignado, nivel de la obstrucción, etiología, morfología valvular, estadio
AHA/ACC 2020 y función del ventrículo derecho. Las otras leen los campos de su pantalla **sin
publicarlos en una tarjeta**, así que el inventario de lo que leen hay que tomarlo de su compuerta;
los escenarios que las abren están en `scripts/_probe_pant9evid.mjs` y en **TC-322**.

### La geometría del panel

| Ancho de ventana | Panel | Alto del cuerpo | Alto del contenido |
|---:|---|---:|---:|
| 1440 px | 820 × 852 | 745 | 2.893 |
| 1000 px | 820 × 852 | 745 | 2.893 |
| 768 px | 744 × 852 | 745 | 3.030 |
| 390 px | 366 × 852 | 729 | 5.468 |

El panel **no se ensancha** entre 1000 y 1440 px: mide 820 px en los dos, que es por lo que el corte
de las dos columnas de preguntas se mide sobre el **ancho del panel** y no sobre la ventana, como
`IND_COLS_CORTE` ya declara. El cuerpo scrollea en los cuatro anchos.

### El papel

**La Evidencia NO llega al papel, y está medido en las veinte siembras.** Con cada sección abierta
y el informe emitido, ni el informe ni el EN SUMA contienen «Clase I», «Clase II», «Nivel B»,
«Nivel C», «folio» ni «Recomendaciones que aplican». Es el invariante que la regla fija de esta casa
pide, confirmado sección por sección.

---

## 2. Lo que falta

Las **seis** pantallas que esta tanda rediseñó **no tienen sección de Evidencia**, y se midió con su
denominador: con los campos de cada una cargados, el panel abre **CERO** secciones de primer nivel.

| Pantalla | Sección de Evidencia | Campos de la pantalla que una Evidencia podría leer |
|---|---|---|
| Anomalía de Ebstein | **no existe** | `ebs_desplazamiento` · `ebs-desp-idx` (indexado, calculado) · `ebs_atrializacion` · `ebs_it_ro` (IT de Válvulas) · `ebs_func_vd` · las cinco áreas `ebs_area_ad`, `ebs_area_vd_atrial`, `ebs_area_vd_func`, `ebs_area_ai`, `ebs_area_vi` · `ebs-celermajer` (índice) · `ebs_tsv` · `ebs_vias` · `ebs_sintomas` · `ebs_saturacion` · `ebs_ejercicio` · `ebs_progresion` |
| Síndrome de Eisenmenger | **no existe** | `eis_lesion_base` · `eis_saturacion_reposo` · `eis_saturacion_ejercicio` · `eis_psap` · `eis_pdap` · `eis_it_vel` · `eis_vd_funcion` · `eis_pericardio` · `eis_clase_nyha` · `eis_sincope` · `eis_hemoptisis` |
| Circulación de Fontan | **no existe** | `fontan_tipo` · `fontan_fenestracion` · `fontan_vs_morfologia` · `fontan_vs_fevi` · `fontan_vs_fac` · `fontan_saturacion` · `fontan_it_grado` · `fontan_derrame_pleural` · `fontan_ascitis` · `fontan_clase_nyha` · `fontan_arritmia` · las seis casillas `fontan_comp_*` |
| Defecto del septo auriculoventricular | **no existe** | `dsav_tipo` · `dsav_regurg_av_izq` · `dsav_regurg_av_der` · `dsav_dssd_mm` · `dsav_qp_qs` · `dsav_down` · `dsav_htp` · `dsav_rvp_uw` · `dsav_vi_ro` (FEVI y DTSVI del estudio) |
| Conexión venosa pulmonar anómala parcial | **no existe** | `cvpa_venas_numero` · `cvpa_conexion` · `cvpa_lado` · `cvpa_qp_qs` · `cvpa_htp` · `cvpa_sintomas` · `cvpa_cia_ro` (CIA de CIA/CIV) · `cvpa_vd_ro` (VD de VD/AD) |
| Ventana aortopulmonar | **no existe** | `vap_tipo` · `vap_diam` · `vap_dir` · `vap-qpqs` (calculado) · `vap_htp` · `vap_paps_ro` (PSAP del estudio) |

### Las que existen pero están incompletas

| Sección | Qué le falta, medido |
|---|---|
| Ductus arterioso permeable | **CERO preguntas** y **ninguna guía nombrada** en su cuerpo: hoy es un bloque de recomendaciones sin cuestionario, y sin molde. |
| Coartación de aorta | **CERO preguntas**, sin molde. Cita cuatro corchetes y la ESC 2024. |
| Miocardiopatía hipertrófica obstructiva | **CERO preguntas**, sin molde. Su hermana de muerte súbita tiene dos. |
| Tetralogía de Fallot reparada | Cubre **sólo la insuficiencia pulmonar** (`_indTdFIP`). La Fallot reparada tiene además el ventrículo derecho, las arritmias y la estenosis residual, y de eso no hay sección. |
| Estenosis pulmonar | Tiene tres preguntas y el molde de preguntas en dos columnas, pero **no publica folio** en su cuerpo. |
| Válvula aórtica bicúspide — conclusión | **CERO preguntas**; la de aorta ascendente tiene cuatro. |

---

## 3. Lo que este documento NO decide

No propone preguntas, no propone guías, no propone diseño y no toca un corte. Las decisiones que
quedan para el médico, sin recomendación de esta tanda:

1. Si las seis pantallas sin Evidencia deben tenerla, y en qué orden.
2. Si el ductus, la coartación y la miocardiopatía hipertrófica obstructiva deben pasar al molde
   con preguntas de tres estados, como la CIA y la CIV.
3. Si la Fallot reparada debe tener más de una sección.
4. Si la estenosis pulmonar y el ductus deben publicar folio en su cuerpo, como las otras trece.
