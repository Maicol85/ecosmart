# Auditoria de sincronias de C. Congenitas — tanda PANT-2, commit 1 (2026-11-02)

**SOLO LECTURA.** Este commit no cambia una linea de la aplicacion: es el inventario (1a), la
auditoria de hechos duplicados (1b) y la comparacion de las dos copias de la ACC/AHA 2025 (1c).
La clasificacion de 1b es la propuesta del medico; donde un caso no entra en ninguna de sus
cuatro categorias se usa **otros** y se describe.

Medido en el DOM y no por censo estatico del archivo, y hay un motivo: un acordeon sin hermano
despues se lleva todo lo que sigue. Medido: la seccion de Fontan daba 526 KB, 213 campos y 536
textos largos con el censo estatico, contra 18 campos y 1 texto en el DOM.

---

## 1a · Inventario de las diecinueve secciones

Las dos sub-pestanias se abren por su boton real y los **38 acordeones** tambien, uno por uno:
lo que esta en `display:none` no tiene geometria, asi que medir sobre la app cerrada da cero y
parece impecable. Cada sub-pestania se mide con **la suya activa** — con la otra delante, el
`scrollHeight` de sus nueve secciones daba CERO.

| seccion | titulo | campos | espejos | ⓘ | textos largos | 1440 | 1000 | 768 | 390 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `sacc-cc-mch` | MCH — Miocardiopatía hipertrófica | 30 | 4 | 0 | 6 | 1253 | 1303 | 2305 | 2527 |
| `sacc-cc-mca` | MCA — Miocardiopatía arritmogénica | 26 | 5 | 0 | 7 | 1208 | 1425 | 1803 | 2319 |
| `sacc-cc-shunt` | CIA / CIV — Comunicación interauricular  | 22 | 6 | 0 | 2 | 998 | 983 | 1568 | 1886 |
| `sacc-cc-ebs` | Ebstein — Anomalía de Ebstein | 17 | 2 | 0 | 3 | 775 | 827 | 1381 | 1538 |
| `sacc-cc-fontan` | 🫀 Circulacion de Fontan | 18 | 0 | 0 | 1 | 742 | 742 | 1132 | 1132 |
| `sacc-cc-vab` | VAB — Válvula aórtica bicúspide | 21 | 6 | 6 | 2 | 619 | 619 | 719 | 1245 |
| `sacc-cc-tdf` | TdF — Tetralogía de Fallot reparada | 16 | 5 | 0 | 4 | 596 | 637 | 1218 | 1376 |
| `sacc-cc-tga` | TGA — Transposición de grandes arterias | 12 | 2 | 2 | 3 | 528 | 648 | 965 | 971 |
| `sacc-cc-eisen` | 🫁 Sindrome de Eisenmenger | 12 | 0 | 0 | 4 | 509 | 539 | 918 | 961 |
| `sacc-cc-fop` | FOP — Foramen oval permeable | 11 | 0 | 0 | 2 | 503 | 523 | 523 | 1011 |
| `sacc-cc-coa` | CoAo — Coartación de aorta | 12 | 1 | 1 | 1 | 436 | 441 | 909 | 923 |
| `sacc-cc-cvpa` | 🫀 Conexión venosa pulmonar anómala parci | 9 | 2 | 0 | 3 | 374 | 381 | 645 | 702 |
| `sacc-cc-dsav` | 🫀 Defecto del septo auriculoventricular | 10 | 1 | 0 | 4 | 367 | 410 | 731 | 776 |
| `sacc-cc-esub` | 🫀 Estenosis subaórtica | 7 | 0 | 0 | 4 | 317 | 339 | 576 | 645 |
| `sacc-cc-easv` | 🫀 Estenosis supravalvular aórtica | 7 | 0 | 0 | 3 | 293 | 327 | 563 | 606 |
| `sacc-cc-vap` | VAP — Ventana aortopulmonar | 6 | 1 | 0 | 1 | 280 | 291 | 535 | 585 |
| `sacc-cc-dap` | DAP — Ductus arterioso permeable | 6 | 0 | 0 | 0 | 269 | 266 | 492 | 492 |
| `sacc-cc-marfan` | 🧬 Marfan / EHAT — aortopatia hereditaria | 26 | 0 | 0 | 2 | 213 | 222 | 439 | 469 |
| `sacc-cc-tv` | ⚡ Arritmia ventricular — compartido por  | 4 | 0 | 0 | 1 | 157 | 166 | 338 | 368 |
| **TOTAL** | 19 secciones | **272** | **35** | **9** | **53** | | | | |

**Las dos mas altas a 1440 px son MCH (1253 px) y MCA (1208 px)**, que son las dos pantallas que
los commits 2 y 4 reordenan, y la tercera es CIA/CIV (998), cuyo panel de Evidencia reordeno la
correccion C. A 390 px todas crecen entre un 70 y un 110 %.

### Que lee cada seccion de otras pestanias, y que emite al papel

| seccion | lee de otras pestanias (espejos de solo lectura) | emite al papel |
|---|---|---|
| `sacc-cc-coa` | `coa_ao_asc_ro` | informe/EN SUMA/PPT con `coart_incluir_chk` + hoja del PDF `coa` |
| `sacc-cc-cvpa` | `cvpa_cia_ro`, `cvpa_vd_ro` | **nada** — vive solo en la pantalla |
| `sacc-cc-dap` | — (ninguno) | informe/EN SUMA/PPT con `ductus_incluir_chk` + hoja del PDF `dap` |
| `sacc-cc-dsav` | `dsav_vi_ro` | **nada** — vive solo en la pantalla |
| `sacc-cc-easv` | — (ninguno) | **nada** — vive solo en la pantalla |
| `sacc-cc-ebs` | `ebs_it_ro`, `ebs_areas_ro` | informe/EN SUMA/PPT con `ebs_incluir_chk` + hoja del PDF `ebs` |
| `sacc-cc-eisen` | — (ninguno) | hoja del PDF `eisen` |
| `sacc-cc-esub` | — (ninguno) | **nada** — vive solo en la pantalla |
| `sacc-cc-fontan` | — (ninguno) | hoja del PDF `fontan` |
| `sacc-cc-fop` | — (ninguno) | informe/EN SUMA/PPT con `fop_incluir_chk` + hoja del PDF `fop` |
| `sacc-cc-marfan` | — (ninguno) | **nada** — vive solo en la pantalla |
| `sacc-cc-mca` | `mca_plax_ro`, `tv_legacy_ev`, `mca_v_may`, `mca_v_men1`, `mca_v_men2` | informe/EN SUMA/PPT con `mca_incluir_chk` + hoja del PDF `mca` |
| `sacc-cc-mch` | `mch_siv_ro`, `mch_tvns`, `mch_ai_ro`, `mch_fevi_ro` | informe/EN SUMA/PPT con `mch_incluir_chk` + hoja del PDF `mch` |
| `sacc-cc-shunt` | `ete_shunt_tsvi_ro`, `ete_shunt_vtitsvi_ro`, `ete_shunt_tsvd_ro`, `ete_shunt_vtitsvd_ro`, `ete_shunt_ddvi_ro`, `ete_shunt_asc_ro` | informe/EN SUMA/PPT con `ete_shunt_incluir_chk` + hoja del PDF `cia`; informe/EN SUMA/PPT con `ete_shunt_incluir_chk` + hoja del PDF `civ` |
| `sacc-cc-tdf` | `tdf_ip_ro`, `tdf_tsvd_ro`, `tdf_psvd_ro`, `tdf_it_ro`, `tdf_tv` | informe/EN SUMA/PPT con `tdf_incluir_chk` + hoja del PDF `tdf` |
| `sacc-cc-tga` | `tga_dilatacion_ro`, `tga_it_ro` | informe/EN SUMA/PPT con `tga_incluir_chk` + hoja del PDF `tga` |
| `sacc-cc-tv` | — (ninguno) | **nada** — vive solo en la pantalla |
| `sacc-cc-vab` | `vab_funcion`, `vab_ea_ro`, `vab_ia_ro`, `vab_raiz_ro`, `vab_asc_ro`, `vab_morf_ro` | informe/EN SUMA/PPT con `vab_incluir_chk` + hoja del PDF `vab` |
| `sacc-cc-vap` | `vap_paps_ro` | informe/EN SUMA/PPT con `vap_incluir_chk` + hoja del PDF `vap` |

**Seis secciones no emiten a ninguna superficie del papel**: la aortopatia hereditaria de
Marfan (que publica por su propio modulo), la estenosis subaortica, la supravalvular aortica,
el defecto del septo auriculoventricular, la conexion venosa pulmonar anomala y el modulo de
arritmia ventricular. Las trece restantes tienen hoja del PDF, y doce de ellas ademas su
casilla de integrar al informe.

---

### La lista de trabajo de los commits 2 y 4 a 6: las frases visibles

Cada frase visible de 55 caracteres o mas, clasificada por lo que hace. Es la lista que los
commits de pantalla usan para decidir que pasa al ⓘ y que sale.

| seccion | tipo | frase (recortada) |
|---|---|---|
| `coa` | (iii) u otro — revisar en su commit | Es el criterio de indicación: se mide de forma invasiva. |
| `cvpa` | (iii) u otro — revisar en su commit | En el adulto sólo se ve la forma parcial: la total es una emergencia neonatal. El tipo de CIA y la dilatación del vent |
| `cvpa` | (iii) u otro — revisar en su commit | El drenaje a cava superior es el más frecuente y suele asociar CIA de seno venoso. |
| `cvpa` | (i) explica una guia | El eco subestima el shunt en esta lesión: la resonancia es el método de referencia (ESC 2020). |
| `dsav` | (iii) u otro — revisar en su commit | La FEVI y el DTSVI de esta sección son los del estudio (AI / VI): no se vuelven a pedir acá. Dos lugares donde escribi |
| `dsav` | (iii) u otro — revisar en su commit | Marcador de severidad y principal indicación quirúrgica. |
| `dsav` | (iii) u otro — revisar en su commit | Presente en buena parte de los DSAV completos del adulto. |
| `dsav` | (iii) u otro — revisar en su commit | Por cateterismo. Es lo que decide sobre el cierre, no la PSAP del eco. |
| `easv` | (iii) u otro — revisar en su commit | Obstrucción por encima de la unión sinotubular. Es la única de las tres formas en que los ostios coronarios quedan pro |
| `easv` | (i) explica una guia | Es el que gradúa: ESC 2020, medio ≥40 mmHg a flujo normal. |
| `easv` | (iii) u otro — revisar en su commit | Asocia retraso cognitivo, hipercalcemia y estenosis pulmonar periférica. |
| `ebs` | (iii) u otro — revisar en su commit | Desplazamiento apical del velo septal tricuspídeo con atrialización del ventrículo derecho. Menos del 1 % de las cardi |
| `ebs` | (iii) u otro — revisar en su commit | Las cinco áreas se trazan en apical 4 cámaras y en TELEDIÁSTOLE. No son las mismas que las áreas auriculares del estud |
| `ebs` | (i) explica una guia | La cianosis es uno de los desencadenantes de intervención que lista la ESC 2020 en la anomalía de Ebstein. Por debajo  |
| `eisen` | (iii) u otro — revisar en su commit | Contraindicaciones absolutas — embarazo (mortalidad materna >50 %) · correccion quirurgica cardiaca del defecto · ejer |
| `eisen` | (iii) u otro — revisar en su commit | <90 % → riesgo fetal critico. Embarazo practicamente imposible con <85 %. Mortalidad materna >50 %. |
| `eisen` | (iii) u otro — revisar en su commit | El derrame pericardico asocia peor pronostico en Eisenmenger. |
| `eisen` | (iii) u otro — revisar en su commit | Síndrome de EisenmengerIngresar lesión de base y saturación |
| `esub` | (iii) u otro — revisar en su commit | Obstrucción fija del tracto de salida izquierdo por membrana o túnel fibromuscular. Se distingue de la obstrucción din |
| `esub` | (i) explica una guia | Es el que gradúa: la ESC 2020 define severa la obstrucción del TSVI a cualquier nivel con medio ≥40 mmHg a flujo norma |
| `esub` | (iii) u otro — revisar en su commit | Secundaria al chorro sobre los velos: frecuente y progresiva, marcador de severidad. |
| `esub` | (iii) u otro — revisar en su commit | Un gradiente que aumenta con Valsalva sugiere obstrucción dinámica, no fija. |
| `fontan` | (iii) u otro — revisar en su commit | En Fontan es marcador de disfuncion del ventriculo sistemico. |
| `fop` | (i) explica una guia | Comunicación interauricular fisiológica que no se cierra tras el nacimiento. Es un hallazgo frecuente en la población  |
| `fop` | (iii) u otro — revisar en su commit | Son datos del paciente, no del eco. La app no los deduce. |
| `marfan` | (iii) u otro — revisar en su commit | El umbral quirurgico depende del SINDROME, no solo del diametro: Loeys-Dietz opera a los 45 mm donde el Marfan espera  |
| `marfan` | (iii) u otro — revisar en su commit | Se calcula con la aorta ascendente y la superficie corporal (peso y talla): faltan la aorta ascendente de esta pantall |
| `mca` | (iii) u otro — revisar en su commit | Criterios estructurales ecocardiográficos (Task Force 2010) |
| `mca` | (iii) u otro — revisar en su commit | La anomalía regional de la motilidad es obligatoria. El Task Force exige «aquinesia, disquinesia o aneurisma regional  |
| `mca` | (iii) u otro — revisar en su commit | Relevante en los fenotipos biventricular e izquierdo. Se deriva de la FEVI y del módulo de Contractilidad, que ya regi |
| `mca` | (iii) u otro — revisar en su commit | Tocá la celda para marcar. Cada categoría aporta un solo criterio, el de mayor jerarquía: si marcás dos de la misma ca |
| `mca` | (iii) u otro — revisar en su commit | — se deriva de «Historia familiar de muerte súbita» y de la edad del familiar, en la sección de MCH |
| `mca` | (iii) u otro — revisar en su commit | Interpretación Task Force 2010sin criterios diagnósticos |
| `mca` | (iii) u otro — revisar en su commit | El diagnóstico definitivo de MCA requiere integración de criterios de múltiples categorías. Un score ecocardiográfico  |
| `mch` | (iii) u otro — revisar en su commit | Hipertrofia del ventrículo izquierdo sin causa que la explique. Genética y heterogénea, 1 de cada 500. Junto con la MC |
| `mch` | (iii) u otro — revisar en su commit | El espesor máximo es un campo propio y no se deduce del SIV: en la MCH el punto de mayor espesor no siempre es septal. |
| `mch` | (ii) historia de la app o de una edicion | La respuesta tensional anormal se registra y el informe la menciona, pero no suma al conteo de la AHA/ACC 2024: salió  |
| `mch` | (iii) u otro — revisar en su commit | El HCM Risk-SCD no está validado en estos grupos. Si alguno está marcado, no se publica el porcentaje y se dice cuál l |
| `mch` | (i) explica una guia | No entran en el score de la ESC ni en el conteo de la AHA/ACC. El informe los menciona como contexto clínico. |
| `mch` | (i) explica una guia | Los dos scores se muestran juntos y no se promedian. El europeo es una ecuación continua (HCM Risk-SCD, O'Mahony 2014) |
| `shunt` | (iii) u otro — revisar en su commit | 🟩 ≥5 mm adecuado🟧 3–4 mm borderline🟥 <3 mm deficiente |
| `shunt` | (iii) u otro — revisar en su commit | Los cuatro valores del Qp/Qs se cargan en sus tabs: TSVI y VTI-TSVI en 〰️ Doppler → Doppler Aórtico (TSVI), diámetro y |
| `tdf` | (iii) u otro — revisar en su commit | La cardiopatía congénita compleja más frecuente en el adulto. El seguimiento gira alrededor de la insuficiencia pulmon |
| `tdf` | (iii) u otro — revisar en su commit | Con obstrucción residual del tracto de salida, la presión que estima la IT es la del ventrículo derecho y no la de la  |
| `tdf` | (i) explica una guia | Volúmenes del ventrículo derecho — criterio volumétrico ESC 2020 |
| `tdf` | (i) explica una guia | Estos volúmenes no los mide este estudio: se transcriben de la imagen que los midió. Los umbrales de la ESC 2020 están |
| `tga` | (iii) u otro — revisar en su commit | Transposición de grandes arterias: el tipo y la cirugía describen el dibujo, la conclusión y el informe. |
| `tga` | (iii) u otro — revisar en su commit | Esquema de la circulación de la sangre: corazón normal. Recorrido: AD → VD → arteria pulmonar → pulmones → AI → VI → a |
| `tga` | (iii) u otro — revisar en su commit | sangre poco oxigenada sangre oxigenada suturas y comunicaciones |
| `tv` | (iii) u otro — revisar en su commit | Se carga una sola vez y la usan las tres secciones, cada una con su propia regla. La morfología y el eje sólo los nece |
| `vab` | (iii) u otro — revisar en su commit | Los nueve factores se contestan en la pestaña Evidencia, en la sección de la válvula aórtica bicúspide, con tres estad |
| `vab` | (iii) u otro — revisar en su commit | Excluir coartación de aorta asociada — ver la sección de coartación. |
| `vap` | (i) explica una guia | Comunicación directa entre la aorta ascendente y la arteria pulmonar principal. Menos del 1 % de las cardiopatías cong |

**Reparto:** (i) = 10 · (ii) = 1 · (iii) = 42 · total **53** frases.

---

## 1b · Auditoria de sincronias

Todo hecho que se pregunta o se muestra en mas de un lugar, por las cuatro categorias del
medico. **No se cambio ningun campo**: esto es un inventario.

### Tipo 1 — un dueno y los demas lo leen (CORRECTO, no se toca)

Los **35 espejos de solo lectura** de las congenitas. Cada uno lee un campo que vive en otra
pestania; editarlo ahi mueve el espejo y no al reves, que es el patron que la casa usa.

| seccion | espejo | lo que lee (por su rotulo) |
|---|---|---|
| `coa` | `coa_ao_asc_ro` | Ao ascendente (mm) — de Aorta torácica |
| `cvpa` | `cvpa_cia_ro` | CIA asociada (de CIA/CIV) |
| `cvpa` | `cvpa_vd_ro` | Ventrículo derecho (de VD / AD) |
| `dsav` | `dsav_vi_ro` | FEVI y DTSVI |
| `ebs` | `ebs_it_ro` | IT — grado (de Válvulas) |
| `ebs` | `ebs_areas_ro` | Áreas del estudio (telesístole) |
| `mca` | `mca_plax_ro` | TSVD del Qp/Qs (de VD / AD) — referencia |
| `mca` | `tv_legacy_ev` | (sin rotulo) |
| `mca` | `mca_v_may` | (sin rotulo) |
| `mca` | `mca_v_men1` | (sin rotulo) |
| `mca` | `mca_v_men2` | (sin rotulo) |
| `mch` | `mch_siv_ro` | SIV / PP (de AI · VI) |
| `mch` | `mch_tvns` | TVNS en Holter — derivado |
| `mch` | `mch_ai_ro` | Diám. AP aurícula izquierda (de AI · VI) |
| `mch` | `mch_fevi_ro` | FEVI (de AI · VI) |
| `shunt` | `ete_shunt_tsvi_ro` | Ø TSVI (mm) — del estudio |
| `shunt` | `ete_shunt_vtitsvi_ro` | VTI TSVI (cm) — del estudio |
| `shunt` | `ete_shunt_tsvd_ro` | Ø TSVD (mm) — de VD/AD |
| `shunt` | `ete_shunt_vtitsvd_ro` | VTI TSVD (cm) — de VD/AD |
| `shunt` | `ete_shunt_ddvi_ro` | DDVI (mm) — del estudio |
| `shunt` | `ete_shunt_asc_ro` | ASC (m²) — del estudio |
| `tdf` | `tdf_ip_ro` | IP — grado (de Válvulas) |
| `tdf` | `tdf_tsvd_ro` | Ø TSVD (de VD / AD) |
| `tdf` | `tdf_psvd_ro` | Presión sistólica VD (de PSAP por IT) |
| `tdf` | `tdf_it_ro` | IT — grado (de Válvulas) |
| `tdf` | `tdf_tv` | Taquicardia ventricular — derivado |
| `tga` | `tga_dilatacion_ro` | Diámetro del VD sistémico (de VD / AD) |
| `tga` | `tga_it_ro` | IT sistémica — grado (de Válvulas) |
| `vab` | `vab_funcion` | (sin rotulo) |
| `vab` | `vab_ea_ro` | EA — grado ⓘ |
| `vab` | `vab_ia_ro` | IAo — grado |
| `vab` | `vab_raiz_ro` | Raíz aórtica ⓘ |
| `vab` | `vab_asc_ro` | Ao ascendente |
| `vab` | `vab_morf_ro` | (sin rotulo) |
| `vap` | `vap_paps_ro` | PAPs estimada — del estudio |

**35 espejos.** El caso que mas importa para el commit 7: `mch_tvns`, `tdf_tv`, `tv_legacy_ev`
y `mca_v_*` leen el modulo de **arritmia ventricular** (`sacc-cc-tv`), que es su dueno unico.

### Tipo 2 — dos campos independientes del MISMO hecho (candidatos a unir; NO se unieron)

| hecho | campos | que pasa al editar uno |
|---|---|---|
| CIV residual | `tdf_civ_residual` (Fallot) · `tga_civ_residual` (TGA) | nada: el otro no se mueve. Son la misma lesion residual preguntada dos veces, una por cardiopatia. |
| Gradiente de la CIV residual | `tdf_civ_grad` · `tga_civ_grad` | idem: el mismo gradiente, dos campos. |
| Sintomas | `tdf_sintomas` (Fallot) · `tga_sintomas` (TGA) | nada. Los dos preguntan la situacion clinica del paciente, que es una sola. |
| Clase funcional NYHA | `eis_clase_nyha` (Eisenmenger) · `fontan_clase_nyha` (Fontan) | nada. Es la misma escala sobre el mismo paciente. |
| Funcion del VD | `tdf_func_vd` (Fallot) · `eis_vd_funcion` (Eisenmenger) | nada. Y el VD tiene ademas su propia pestania, que ninguno de los dos lee. |

**Por que no se unieron:** unir dos campos del estudio es una decision de datos —cual queda
como dueno, que pasa con los estudios guardados que tienen los dos con valores distintos— y
esta orden pide reportarlos, no unirlos.

### Tipo 3 — dos campos legitimamente distintos que PARECEN iguales (no se sincronizan)

| rotulo compartido | campos | por que NO son el mismo hecho |
|---|---|---|
| Gradiente medio (mmHg) | `coa_gmedio` · `esub_gradiente_medio` · `easv_gradiente_medio` | tres obstrucciones en tres lugares distintos: el istmo aortico, el tracto de salida izquierdo y la aorta supravalvular. Un paciente puede tener las tres. |
| Gradiente pico (mmHg) | `esub_gradiente_mmhg` · `easv_gradiente_mmhg` | la subvalvular y la supravalvular son dos lesiones distintas de la misma via. |
| Direccion del shunt | `dap_dir` · `vap_dir` | dos comunicaciones distintas —ductus y ventana aortopulmonar— que pueden coexistir. |
| Hipertension pulmonar | `dsav_htp` · `cvpa_htp` | la pregunta la hace cada cardiopatia sobre su propio contexto. |
| Localizacion | `coa_loc` (del istmo) · `mch_loc` (de la hipertrofia) | el rotulo coincide y el hecho no tiene nada que ver. |
| Longitud del tunel (mm) | `fop_tunel` (del foramen) · `esub_longitud_mm` (de la estenosis) | idem: dos longitudes de dos cosas distintas. |

### Tipo 4 — la seccion lo responde ella misma y otro modulo solo AVISA

| hecho | campo de la seccion | campo del modulo | que pasa hoy al editar uno |
|---|---|---|---|
| Parada cardiaca o TV sostenida previa | `mch_ex_parada` (MCH, **editable**) | `tv_documentada` (arritmia ventricular) | **nada**: son independientes. El medico puede contestar «No» en MCH con una TV documentada en el modulo, y la aplicacion no lo avisa. Es el caso que el commit 7 (iii) viene a cerrar. |
| TVNS en Holter | `mch_tvns` (**solo lectura**) | `tv_documentada` + `tv_tipo` | el modulo manda y MCH lo refleja. Ese lado ya es tipo 1. |
| Taquicardia ventricular | `tdf_tv` (**solo lectura**) | idem | idem. |

**La asimetria es el hallazgo:** del mismo modulo, MCH lee `mch_tvns` como espejo y responde
`mch_ex_parada` por su cuenta. Los dos hablan de arritmia ventricular y solo uno esta cableado.

### Otros — lo que no entra en las cuatro categorias

| caso | descripcion |
|---|---|
| `mca_plax_ro` «TSVD del Qp/Qs (de VD / AD) — referencia» | es un espejo que la propia app rotula **«referencia»**: no alimenta ningun criterio, esta al lado del campo editable `mca_tsvd_plax` para comparar. Un espejo informativo no es ni un dueno ni un duplicado. |
| `tv_legacy_ev` en MCA | el nombre lleva **`legacy`** y el prefijo es `tv_`, no `mca_`: es un campo del modulo de arritmia que vive dentro de la seccion de MCA. Esta en la lista de espejos y en la de campos de MCA a la vez. |
| Las dos casillas `*_incluir_chk` de CIA y CIV | las dos secciones del acordeon `shunt` comparten **una sola** casilla, `ete_shunt_incluir_chk`: integrar una integra la otra. No es un hecho clinico duplicado sino un control compartido. |

---

## 1c · Las dos copias de la ACC/AHA 2025 de congenitas (SOLO LECTURA)

En `08_Cardiopatias_congenitas` hay dos copias del mismo PDF y una lectura de otra herramienta
dice que **no son identicas**. Es cierto a nivel de bytes y **falso a nivel de contenido**.

| | `…-a.pdf` | `…-a-2.pdf` |
|---|---|---|
| tamano | 8.088.723 B | 8.088.531 B (**192 B menos**) |
| md5 | `a643e66c15bc1c5513c984e91acfedc1` | `d4d0229478a4e63dfbb7e270b99c2bdb` |
| hojas | **137** | **137** |
| titulo de los metadatos | identico | identico |
| `subject` de los metadatos | `Circulation 2026.153:e115-e251` | **el mismo** |
| productor | Quartz PDFContext (macOS) | el mismo |
| `modDate` | 2026-10-17 14:22 Z | 2026-10-25 01:18 Z |
| encabezado impreso de la hoja 1 | `Circulation. 2026;153:e115–e251 · DOI 10.1161/CIR.0000000000001402 · February 24, 2026 · e115` | **identico, palabra por palabra** |

### Las hojas que la app cita

Comparadas las **quince** que la orden nombra —35, 39, 40, 53, 57, 59 a 62, 75, 77 y 81 a 84—:
las quince difieren en texto, y **en las quince la primera diferencia es el sello de descarga**,
siempre la misma:

```
-a   : ahajournals.org by on October 17, 2026
-a-2 : ahajournals.org by on October 24, 2026
```

### La comparacion normalizada, que es la que decide

Quitando las lineas del sello de descarga y comparando las **137** hojas:

| medicion | resultado |
|---|---|
| hojas que difieren, **normalizadas** | **CERO de 137** |
| hojas que difieren, **sin normalizar** (control positivo) | **137 de 137** |
| largo del texto normalizado | `-a` = 828.516 · `-a-2` = **828.516** · **IGUAL** |
| «LOE» | 64 en las dos |
| «Level of Evidence» | 4 en las dos |
| «mm Hg» | 43 en las dos |
| «%» | 209 en las dos |

El **control positivo** es lo que hace que el cero signifique algo: sin normalizar, las 137 hojas
difieren, asi que la comparacion si distingue.

### Respuesta

**Cero diferencias que cambien una clase, un nivel, un numero o una condicion.** Son la **misma
version publicada** —`Circulation` 2026;153:e115-e251, del 24 de febrero de 2026— descargada dos
veces: el 17 y el 24 de octubre de 2026. Ninguna de las dos es «mas reciente» por su encabezado,
porque el encabezado es el mismo; la mas reciente **por fecha de descarga** es `-a-2`.

**No se cambio nada**, y la app puede seguir citando cualquiera de las dos sin que una clase, un
nivel, un numero o una condicion se muevan.

---

## Lo que este commit NO hizo

- **No cambio una linea de la aplicacion.** El unico archivo nuevo es este.
- **No unio ningun campo** de los cinco casos de tipo 2, que es lo que la orden pide: se reportan.
- **No toco** ninguna de las frases de la lista de trabajo: eso es de los commits 2 y 4 a 6.
- **La clasificacion de las frases es automatica y aproximada.** Una frase como «Es el criterio de
  indicacion: se mide de forma invasiva» cae en «(iii) u otro» porque no nombra una guia, y en
  rigor explica un criterio. Cada commit de pantalla reclasifica las suyas al leerlas.
