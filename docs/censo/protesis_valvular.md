# Censo W1 — PRÓTESIS valvular mitral y aórtica, y las cuestiones valvulares pendientes

**Fecha:** 2026-10-15 · **Commit de partida:** `fb8f42c` (sello `v20261015-0019`), `main` = `origin/main`.
**Trabajo de SOLO LECTURA sobre el código.** No se modificó `index.html`, ni `scripts/`, ni los
casos de la suite, ni ningún archivo de datos: `git diff --stat` vacío salvo `docs/`. El `md5` de
`index.html` es `3617c29f76adf451de0d6d68f1fd78b4` al abrir y al cerrar.

Las correcciones las decide otro prompt («W2») a partir de este censo y de lo que resuelva Maicol.
**Acá no se corrige nada y no se inventa ningún corte**: cada número sale del PDF original con su
folio, y lo que no está en la biblioteca se dice.

---

## 0 · Denominador de la verificación

| Qué | Cuánto | Cómo |
|---|---|---|
| Escenas con **teclas y clics reales** | **37** | sonda CDP de solo lectura, con aborto si el tecleo o el borrado no quedan |
| Borrados reales de un campo | **16** | 12 del censo de rancios + el THP + 3 controles negativos |
| Estudios **armados** (sin teclas) | **10** | el Laboratorio lee un registro archivado, no el formulario: mismo reparto que TC-469 |
| Filas del censo medidas en pantalla | **27** de 40 | las 13 restantes son por **lectura de código**, y se dice cuáles y por qué |
| Casos de la suite de las zonas medidas | **123/124** | el único rojo es **TC-390**, uno de los cuatro de ENTRADA documentados en `CLAUDE.md`. Pendrive `DISK_IMG` MONTADO. Excel en **436** columnas |

La sonda vive en el **scratchpad de la sesión**, no en `scripts/`: la orden prohíbe agregar
archivos de código. Sus grupos: `mitral`, `avmidx`, `emgrad`, `lab`, `aortica`, `ritmo`,
`rancios`, `eoaband`.

⚠️ **Tres trampas de método que costaron corridas, y las tres están medidas:**
1. **Tipear un campo de la pestaña «Datos» primero deja la pestaña activa allí**, y al volver a
   Válvulas `revelar()` no sabe reabrir la sección plegable de la mitral —su opener dice
   `toggleEteSeccion('valv-mitral', this)`, que **no contiene el id del contenedor**—. Con el orden
   natural del objeto, `peso` y `talla` iban primero y **todo campo mitral abortaba**: los dos
   primeros controles negativos cargaron cero campos y los dos salieron «no cambia» sobre escenas
   vacías. Los de «Datos» van **al final**.
2. **`generarInforme()` salta a la pestaña Informe**, así que medir las superficies y después
   borrar un campo deja el borrado sin ocurrir: `borrar()` abortó dos veces diciendo que el campo
   conservaba su valor. Hay que **reabrir las dos puertas antes de cada borrado**.
3. **`im_vmax` va en m/s desde el 2026-10-09** (banda `[1,9]`), y el bloque de prosa que la
   documenta en `index.html` sigue diciendo «[100,900] cm/s»: es prosa vieja, las constantes están
   migradas. Un 500 tipeado ahí marca las tres filas de PISA con «(revisar)» y **ninguna vota**.

---

## 1 · Las fuentes, con su regla de folio comprobada en el pie impreso

| Documento | Archivo | Regla de folio | Comprobada en |
|---|---|---|---|
| **ASE 2024 — prótesis** (Zoghbi, JASE 2024;37:2-63) | `05_Protesis_valvulares/Zoghbi_2024_Protesis.pdf` | folio = página del PDF **+ 1** | PDF 1→2, 5→6, 11→12, 21→22, 31→32, 62→63 |
| **ASE 2023 — reumática** (Pandian) | `04_Valvulopatias/ASE Enf Reumatica.pdf` | folio = página **+ 2** | PDF 1→3 |
| **ASE 2017 — regurgitación nativa** (Zoghbi) | `04_Valvulopatias/Zoghbi_2017_Regurgitacion_Valvular.pdf` | folio = página **+ 302** | PDF 1→303 |
| **EAE/ASE 2009 — estenosis nativa** (Baumgartner) | `04_Valvulopatias/2009_Echo-Assessment-of-Valve-Stenosis_note_added.pdf` | folio = página del PDF | pie «Baumgartner et al 13» en PDF 13 |
| **ESC/EACTS 2025** | `04_Valvulopatias/2025 ESC:EACTS Guidelines…pdf` | folio = página **+ 4634** | PDF 41→4675 |

✅ **La guía de prótesis MÁS NUEVA SÍ está en la biblioteca**: la ASE 2024. Hay dos copias del
mismo documento (`ASE Evaluacion protesis valvular.pdf` y `Zoghbi_2024_Protesis.pdf`, 62 páginas
las dos, `md5` distinto por metadatos). **No hace falta recurrir a la ASE 2009 de prótesis**, que
la propia ASE 2024 declara reemplazada (folio 3).

⚠️ **El texto extraído de la ASE 2024 pierde los operadores**, igual que el D1 vio en la ASE 2023:
la fuente codifica `≥` como **`$`** y `≤` como **`#`**. **Las Tablas 5, 7 y 11 se leyeron
RENDERIZANDO** a 330-400 dpi; los operadores de abajo son los de la imagen, no los del `pdftotext`.

---

## 2 · CENSO MITRAL

### 2.1 · Morfología: cuántas opciones y cuáles cambian el criterio

`#vm_morf` tiene **nueve** opciones: Normal · Mixomatosa/Barlow · Calcificada · Reumática ·
Prolapso/EVMS · **Prótesis biológica** · **Prótesis mecánica** · Endocarditis · Isquémica.
**Dos cambian el criterio**, y las dos del mismo modo: `valvEsProtesis()` las reconoce y de ahí
cuelgan `protNoGradua('vm_morf')` (apaga la graduación nativa de la estenosis), `_imVmProt()` (el
régimen protésico de la insuficiencia) y `vmProtEOA()` (la cápsula de EOA/DVI/PPM).

⚠️ **No hay opción de plastia, anuloplastia ni TEER**, y las tres guías las nombran. Ya estaba
declarado como X2.

### 2.2 · ESTENOSIS / OBSTRUCCIÓN mitral

Leyenda de la columna «¿coincide?»: **SÍ** · **PARCIAL** (coincide el número pero no el operador, o
falta una banda) · **NO** · **FALTA** (la app no aplica nada).

| # | Estado | Campo / criterio | Corte que aplica HOY (origen) | Corte de la guía (folio) | ¿Coincide? | Qué muestran las superficies | ¿Existe el campo? |
|---|---|---|---|---|---|---|---|
| E1 | nativa | AVm (planimetría · THP · continuidad) | `AVM_SEVERA_MAX = 1.5`, borde `≤` | ASE 2023 **Tabla 1, folio 8**: severa `≤1.5` | **SÍ** | graduado en las cinco superficies | sí |
| E2 | nativa | Gradiente medio | `EM_GMEDIO_ELEVADO_MIN = 5`, `EM_GMEDIO_SIGNIF_MIN = 10`, los dos `≥` | ASE 2023 **Tabla 1, folio 8**: `<5` / `5-9` / `≥10` | **SÍ** | graduado | sí (`em_gmedio`) |
| E3 | nativa | THP como criterio de severidad | **no se aplica**: el THP sólo deriva `220/THP` | ASE 2023 **Tabla 1, folio 8**: `<100` / `100-149` / `≥150` ms | **FALTA** | el THP no gradúa por sí mismo en ninguna superficie | sí (`thp`) |
| E4 | nativa | PSAP como criterio de severidad | **no se aplica** | ASE 2023 **Tabla 1, folio 8**: `<30` / `30-49` / `≥50` mmHg | **FALTA** | — | sí (`psap_calc`, derivado) |
| E5 | prótesis bio y mec | grado nativo de la estenosis | `protNoGradua` bloquea: `em_grado` queda en `sin` | — (la escala nativa no aplica a una prótesis) | **correcto** | badge y cápsula dicen «No graduada: los cortes de válvula nativa no aplican a prótesis»; informe y EN SUMA **callan** la estenosis | — |
| E6 | prótesis | **Velocidad pico de E** | **no se aplica ningún corte protésico** | ASE 2024 **Tabla 11, folio 27**: `<1.9` / `1.9-2.5` / `≥2.5` m/s | **FALTA** | el campo se carga y no vota ni se nombra en la cápsula | **sí** (`em_vmax`, m/s) |
| E7 | prótesis | **Gradiente medio** | la fila del cuadro publica el corte **NATIVO**: «· significativo (≥10 mmHg)» | ASE 2024 **Tabla 11, folio 27**: `≤5` / `6-10` / `>10` | **PARCIAL** | **medido**: con prótesis el cuadro rotula «significativo (≥10 mmHg)»; los dos bordes difieren del protésico (a 5 y a 10 exactos el veredicto se invierte) | sí |
| E8 | prótesis | **DVI = VTI prótesis / VTI TSVI** | `VM_PROT_DVI_NORMAL_MAX = 2.2`, `VM_PROT_DVI_SIGNIF_MIN = 2.5` (`>`) | ASE 2024 **Tabla 11, folio 27**: `<2.2` / `2.2-2.5` / `>2.5` | **SÍ** | cápsula «DVI — VTI prótesis / VTI TSVI» | sí (calculado; `vm_dvi` como respaldo tipeado) |
| E9 | prótesis | **EOA por continuidad** | `VM_PROT_EOA_OBSTR_MAX = 1.0`: `<1` significativa, **todo lo demás «normal»** | ASE 2024 **Tabla 11, folio 27**: `≥2.0` normal / **`1-2` posible** / `<1` significativa | **PARCIAL** | ⚠️ **medido**: EOA **1.50 cm²** con DVI 2.10 publica **«sin criterios de obstrucción»**, donde la Tabla 11 lo pone en «possible stenosis». **Falta la banda intermedia** | sí (calculado) |
| E10 | prótesis | **THP como parámetro directo** | **no se aplica**; y la app **sigue publicando `220/THP`** con rótulo nativo | ASE 2024 **Tabla 11, folio 27**: `<130` / `130-200` / `>200` ms | **FALTA** | ⚠️ **medido**: con prótesis el cuadro muestra «AVm por THP 1.38 cm² · significativa (≤1,5 cm²)». La ASE 2024, **folio 10**, dice que el EOA calculado por THP es frecuentemente inexacto y **sobreestima** el área | sí (`thp`) |
| E11 | prótesis | **EOA indexada — PPM** | `VM_PROT_PPM_CORTES`: IMC<30 → normal `>1.2`, severo `≤0.90`; IMC≥30 → `>1.0` / `≤0.75` | ASE 2024 **Tabla 7, folio 20** (leída de la imagen) | **SÍ** | cápsula «PPM — EOA indexada»; medido: 0.69 y 0.83 → «severo», 1.73 → «sin desajuste» | sí (calculado) |
| E12 | prótesis | **Rótulos del cuadro de referencias** | las cuatro filas publican cortes **NATIVOS** | — | **NO** | ⚠️ **medido**: sobre una prótesis el cuadro dice «significativa (≤1,5 cm²)» en las tres filas de área y «significativo (≥10 mmHg)» en el gradiente, **a dos centímetros** de la cápsula que dice «No graduada» y de la que lee la misma continuidad como «posible obstrucción». **Dos lecturas del mismo número en la misma pantalla** | — |

**Lo que SÍ funciona y conviene decirlo:** la cápsula protésica (`vmProtEOA`) usa la continuidad,
que es el método que la ASE 2024 recomienda para el EOA indexado mitral (**folio 10**: «calculation
of indexed EOA for mitral prostheses is best done using the continuity equation»), retira el
veredicto del DVI con regurgitación significativa —porque el mismo 2,5 sugiere **estenosis** en la
Tabla 11 y **regurgitación** en la Tabla 13— y aplica la Tabla 7 con su rama de IMC. Los tres
comportamientos están medidos.

### 2.3 · INSUFICIENCIA mitral

| # | Estado | Campo / criterio | Corte que aplica HOY | Corte de la guía (folio) | ¿Coincide? | Medido |
|---|---|---|---|---|---|---|
| R1 | nativa | Vena contracta | `IM_CORTES.vc` 3 y 7 mm | ASE 2017 **Tabla 8, folio 332**: `<0.3` / `≥0.7` cm | **SÍ** | 7 mm → severa |
| R2 | nativa | **Área del jet / AI** | `IM_CORTES.jet_nat` `<20` leve · `20-40` moderada · `>40` severa | ASE 2017 **Tabla 8, folio 332** y **folio 333**: severa **`>50 %` del área de la AI**; la guía **no publica 20 ni 40** | **NO** | el 20/40 es de guías previas; es un hallazgo **nativo**, no protésico |
| R3 | nativa | EROA por PISA | 20 y 40 mm² | ASE 2017 **Tabla 8, folio 332**: `<0.20` / `≥0.40` cm² | **SÍ** | 40.7 mm² → severa |
| R4 | nativa | Vol-R | 30 y 60 ml | ASE 2017 **folio 332**: `<30` / `≥60` | **SÍ** | 48.8 ml → moderada |
| R5 | nativa | FR | 30 y 50 % | ASE 2017 **folio 332**: `<30` / `≥50` | **SÍ** | — |
| R6 | nativa | Onda S venosa pulmonar | texto (positiva · embotada · invertida) | ASE 2017 **folio 332** | **SÍ** | — |
| R7 | nativa | Cociente VTI mitral / VTI TSVI | `>1.4` «apoya IM severa» | ASE 2023 (reumática) | **SÍ** | 2.50 → «>1,4 — apoya IM severa» |
| R8 | prótesis | **Área del jet / AI** | `IM_CORTES.jet_prot` `<20` leve · `>50` severa · entre medio **no vota** | ASE 2024 **Tabla 13, folio 30**: leve `<4 cm²` o `<20 %` de la AI · severa `>8 cm²` o `>50 %` · moderada «variable» | **SÍ** | 60 % → «(prótesis: <20 % leve · >50 % severa)» |
| R9 | prótesis | **Cociente VTI** | `≥2.5` «apoya IM severa» | ASE 2024 **Tabla 12, folio 28**: `VTI_PrMV/VTI_LVOT ≥2.5`, sens. 89 % / esp. 91 % | **SÍ** | 2.50 → «≥2,5 — apoya IM severa» |
| R10 | prótesis | Vena contracta | cortes **nativos** (3 y 7 mm) | ASE 2024 **Tabla 13, folio 30**: `<0.3` / `0.3-0.69` / `≥0.7` cm | **SÍ, numéricamente idéntico** | ver la nota de abajo |
| R11 | prótesis | EROA | cortes **nativos** (20 y 40 mm²) | ASE 2024 **Tabla 13, folio 30**: `<0.20` / `0.20-0.39` / `≥0.40` cm² | **SÍ, numéricamente idéntico** | ídem |
| R12 | prótesis | Vol-R | cortes **nativos** (30 y 60 ml) | ASE 2024 **Tabla 13, folio 30**: `<30` / `30-59` / `≥60` | **SÍ, numéricamente idéntico** | ídem |
| R13 | prótesis | FR | cortes **nativos** (30 y 50 %) | ASE 2024 **Tabla 13, folio 30**: `<30` / `30-49` / `≥50` | **SÍ, numéricamente idéntico** | ídem |
| R14 | prótesis | Onda S venosa pulmonar | texto nativo | ASE 2024 **Tabla 13, folio 30**: dominancia sistólica / embotamiento / inversión | **SÍ** | ídem |
| R15 | prótesis | Resto de la **Tabla 12** (velocidad pico `≥1.9 m/s`, gradiente medio `≥5 mmHg`, Vmax del chorro de IT `>3 m/s`, VS del VI >30 % mayor que el sistémico, convergencia sistólica en el VI) | **sólo el cociente VTI está implementado** | ASE 2024 **Tabla 12, folio 28** | **FALTA** | los tres primeros tienen campo en la app; los dos últimos no |

⚠️ **LA NOTA DEL 09/10 ES LITERALMENTE CIERTA Y CLÍNICAMENTE INOCUA EN CUATRO DE SUS CINCO FILAS.**
Decía que «con prótesis mitral la vena contracta, la onda S, la EROA, el Vol-R y la FR aplican
cortes de válvula NATIVA». Es verdad del **camino de código**: esas cinco filas no preguntan por
`_imVmProt()`. Pero **la ASE 2024, Tabla 13, folio 30, publica para la prótesis exactamente los
mismos números que la ASE 2017, Tabla 8, folio 332, publica para la nativa** en vena contracta,
EROA, Vol-R y FR; y la fila de la onda S dice lo mismo con otras palabras. **Ningún paciente
cambia de grado por esto.** Lo único que la Tabla 13 pide distinto es el área del jet —y eso la
app **ya lo tiene** conmutado (R8)—. Lo que sí vale la pena es que la **fuente que se cita** en la
tarjeta ⓘ y en el manual sea la Tabla 13 cuando la válvula es protésica, y la nota `††` de esa
tabla («estos parámetros cuantitativos están menos validados que en la IM nativa»), que hoy no se
dice en ninguna superficie.

---

## 3 · CENSO AÓRTICO

### 3.1 · Morfología: cuántas opciones y cuáles cambian el criterio

`#va_morf` tiene **nueve** opciones: Trivalva normal · Bicúspide · Calcificada · Reumática ·
**Prótesis biológica (SAVR)** · **Prótesis mecánica (SAVR)** · **TAVI** · Endocarditis · Carcinoide.
**Tres cambian el criterio**, y **no del mismo modo**: la aórtica **no** entra en
`PROT_SIN_GRADO_VALVS`, así que **sí se gradúa**, con la Tabla 5 de la ASE 2024 vía
`eaProtVeredicto()`. Las dos SAVR corren la vía `SAVR`; **la TAVI corre la vía `TAVI` y no se
gradúa**, porque el criterio específico de la Tabla 5 es el **cambio respecto de un basal
post-implante en condiciones hemodinámicas estables** y la app no elige ese basal.

⚠️ **El `onchange` de `#va_morf` es sólo `valvProtSync()`**: no llama a `calcAo()`. Cambiar la
morfología no recalcula por sí mismo (en el censo se forzó el recálculo). Es una diferencia con la
mitral, cuyo `onchange` sí llama a `calcIM_ESC()` y `calcEM()`.

### 3.2 · ESTENOSIS aórtica

| # | Estado | Campo / criterio | Corte que aplica HOY | Corte de la guía (folio) | ¿Coincide? | Medido |
|---|---|---|---|---|---|---|
| A1 | nativa | Vmax · gradiente medio · AVA · AVA indexada · DVI | ver `docs/mapa/aortica-cortes.md` | EAE/ASE 2009 Tabla 3 · ESC/EACTS 2025 | ya censado en la tanda del 2026-10-13 | Vmax 4.2 + Gm 42 → «Severa» |
| A2 | prótesis SAVR | Velocidad pico | `EA_PROT_CRIT.vmax_normal_max = 3`, `vmax_signif_min = 4` (`≥`) | ASE 2024 **Tabla 5, folio 19** (imagen): `<3` / `3-4` / `≥4` | **SÍ** | 4.2 → `signif` |
| A3 | prótesis SAVR | Gradiente medio | `savr_gmed_normal_max = 20`, `savr_gmed_signif_min = 35` (`≥`) | **Tabla 5, folio 19**: `<20` / `20-34` / `≥35` | **SÍ** | 42 → `signif` |
| A4 | prótesis (las tres) | Tiempo de aceleración | `AT_PROT_NORMAL_MAX = 80`, `AT_PROT_POSIBLE_MAX = 100` (`>` para significativa) | **Tabla 5, folio 19**: `<80` / `80-100` / `>100` ms | **SÍ** | campo vacío en la escena; el eje existe |
| A5 | prótesis (las tres) | AT / tiempo de eyección | `0.32` y `0.37` | **Tabla 5, folio 19**: `<0.32` / `0.32-0.37` / `>0.37` | **SÍ** | — |
| A6 | prótesis SAVR | DVI | `savr_dvi_normal_min = 0.35`, `savr_dvi_signif_max = 0.25` | **Tabla 5, folio 19**: `>0.35` / `0.25-0.35` / `<0.25` | **SÍ** | 0.23 → `signif` |
| A7 | prótesis | **EOA** | **no evaluable y declarado**: la Tabla 5 la expresa en desviaciones estándar respecto del EOA de referencia **del modelo implantado**, y la app no registra marca ni modelo | **Tabla 5, folio 19**: referencia ±1 SD / 1 SD menor / 2 SD menor | **declarado** | la cápsula lo dice; el DVI queda como único eje independiente del flujo |
| A8 | **TAVI** | criterio específico | **no se gradúa**, con el motivo escrito | **Tabla 5, folio 19**: cambio del gradiente `≥20 mmHg`, del DVI `≥0.2` o `≥40 %`, del EOA `≥0.6 cm²` o `≥50 %` respecto del basal | **declarado** | informe: «sin graduación de estenosis protésica (Vmax 4.2 m/s, G. medio 42 mmHg, DVI 0.23)» |
| A9 | prótesis | **PPM aórtico (EOA indexada)** | **no se calcula.** Sólo hay un **texto de ayuda** (`#ref-pao`, atribuido a «ESC 2021 · VARC-3») que dice «AVAi >0.85 normal · 0.65–0.85 mod · <0.65 severo», **sin la rama de IMC** | ASE 2024 **Tabla 7, folio 20** (imagen): normal `>0.85` si IMC `<30`, `>0.70` si IMC `≥30`; severo `≤0.65` / `≤0.55` | **NO** | ⚠️ **medido**: con AVAi `0.40 cm²/m²` —que por la Tabla 7 es PPM severo— la app **no dice nada de PPM** en ninguna superficie, mientras la **mitral sí lo calcula**. Es la asimetría más visible del censo |
| A10 | prótesis SAVR | Regla de integración | exige **un eje dependiente del flujo** y **uno independiente** en rango significativo | **Tabla 5, folio 19**, nota al pie | **SÍ** | `pDep=signif` + `pIndep=signif` → `signif` |
| A11 | prótesis | **Fila del AVA del recuadro Doppler** | publica «**Severa (≤1.0cm²)**», corte **NATIVO** | la Tabla 5 **no usa un corte absoluto de AVA** en prótesis | **NO** | ⚠️ **medido**: con las tres prótesis, `#ea-sev` dice «— no se gradúa con estos datos» **inmediatamente arriba de** «Severa (≤1.0cm²)». El comentario del código lo declara («la línea del AVA se sigue pintando») |

### 3.3 · INSUFICIENCIA aórtica, central y paravalvular

| # | Estado | Criterio | Qué aplica HOY | Guía (folio) | ¿Coincide? |
|---|---|---|---|---|---|
| A12 | prótesis (las tres) | insuficiencia intra y paravalvular | la **cascada NATIVA**, a propósito y con el motivo escrito en el código | ASE 2024 **folio 20** (verificado renderizando): la clasificación de la regurgitación protésica intra y paravalvular **es similar a la de la válvula nativa**, con integración de parámetros cualitativos y semicuantitativos (Tabla 8) | **SÍ** |
| A13 | **TAVI** | regurgitación paravalvular (`eteTaviRPV`) | extensión circunferencial `≥30` severa / `≥10` moderada · VC `>0.6` / `≥0.3` cm · área de VC `≥0.30` / `≥0.10` cm² | ASE 2024 **Tabla 8, folio 23**: `<10` / `10-29` / `≥30 %` · `<0.3` / `0.3-0.6` / `>0.6` cm · `<0.10` / `0.10-0.29` / `≥0.30` cm² | **SÍ, los tres** |
| A14 | prótesis bio y mec (SAVR) | regurgitación **paravalvular** | ⚠️ **el módulo de RPV vive sólo en la pestaña ETE/TAVI**: una bioprótesis o una mecánica quirúrgicas con un jet paravalvular **no tienen dónde cargar la extensión circunferencial** | ASE 2024 **Tabla 8, folio 23**: la fila de extensión circunferencial aplica a **toda** prótesis aórtica, no sólo a la TAVI | **NO** |

---

## 4 · Las preguntas (2) a (6)

### (2) · Estenosis mitral NATIVA con insuficiencia mitral moderada o severa

**Lo que hace la app, medido con teclas reales (6 escenas):**

| Escena | `em_grado` | Badge | Informe | EN SUMA |
|---|---|---|---|---|
| Gm 12 mmHg, sin IM | `severa` | «Estenosis mitral significativa — gradiente medio 12 mmHg» | «con estenosis significativa (gradiente medio 12 mmHg)» | «EM significativa.» |
| Gm 12, **IM moderada** | `sin` | «Gradiente transmitral elevado» | «con gradiente transmitral elevado e insuficiencia moderada» | «Gradiente transmitral elevado. IM moderada.» |
| Gm 12, **IM severa** | `sin` | «Gradiente transmitral elevado» | «con gradiente transmitral elevado e insuficiencia severa» | «Gradiente transmitral elevado. IM severa.» |
| Gm 7, sin IM | `sin` | «EM no significativa, con gradiente elevado» | «con estenosis no significativa, con gradiente elevado» | «EM no significativa.» |
| Gm 7, **IM severa** | `sin` | «Gradiente transmitral elevado» | «con gradiente transmitral elevado e insuficiencia severa» | «Gradiente transmitral elevado. IM severa.» |
| **CONTROL** AVm 1.2 por planimetría + Gm 12 + IM severa | `severa` | «Estenosis mitral significativa» | «con estenosis significativa (por gradiente y AVm…)» | «EM significativa. IM severa.» |

**La observación del médico es exacta**, y el control negativo delimita su alcance: **la excepción
es sólo del GRADIENTE**. Con un área medida, el área sigue votando y la estenosis se gradúa
normalmente aunque haya IM severa.

**Qué dicen las guías, en palabras propias y con folio:**

- **ASE 2023 (Pandian), folio 7.** Los gradientes transmitrales **dependen del flujo y de la
  frecuencia cardíaca**, y **no deben usarse como único parámetro** para evaluar la severidad de la
  estenosis mitral. Los estados de gasto elevado **o una IM concurrente** producen un aumento
  **desproporcionado** de la velocidad y del gradiente transmitrales. En la misma página: la
  presencia de IM significativa **reduce la fiabilidad del área derivada del THP**, con riesgo de
  **subestimar** el área; y la ecuación de continuidad **no debe usarse** cuando hay regurgitación
  aórtica o mitral significativa.
- **ASE 2023, Tabla 1, folio 8.** La clasificación de severidad es una tabla de **cuatro**
  parámetros (área, THP, gradiente medio, PSAP). **No enuncia ninguna regla sobre qué hacer cuando
  hay IM asociada**, ni dice que un parámetro aislado gradúe.
- **EAE/ASE 2009 (Baumgartner), folio 12.** El gradiente mitral, aunque se mide de forma fiable,
  **no es el mejor marcador de la severidad** de la estenosis, porque depende del área y de otros
  factores que gobiernan el flujo transmitral —los más importantes, la frecuencia cardíaca, el
  gasto cardíaco y **la IM asociada**—. Pero **sí tiene valor pronóstico propio**, sobre todo
  después de la comisurotomía percutánea, y conviene **comprobar la consistencia** entre el
  gradiente y el resto de los hallazgos.
- **ESC/EACTS 2025, folio 4680.** Un **área ≤1,5 cm²** junto con factores clínicos es lo que
  indica estenosis mitral **clínicamente severa**. El gradiente transvalvular medio y las presiones
  pulmonares **reflejan sus consecuencias y tienen valor pronóstico** — es decir, la guía **no los
  usa para graduar**.
- **ESC/EACTS 2025, folio 4681** (estenosis mitral degenerativa con calcificación del anillo). La
  estenosis degenerativa **puede coexistir con grados variables de IM**, y se ha demostrado que el
  gradiente transmitral medio se asocia a mayor mortalidad **con independencia de la severidad de
  la IM**.

**Conclusión, sin inventar nada.** ⚠️ **NINGUNA de las tres guías dice explícitamente cómo
clasificar ese caso.** Las tres dicen dos cosas que sí son explícitas: (a) el gradiente **solo** no
gradúa la estenosis mitral, y (b) la IM asociada lo **infla**. Por lo tanto, lo que la app hace
hoy —no llamar estenosis significativa a un gradiente elevado con IM moderada o severa, y sí
nombrar el gradiente— **es el lado conservador y no contradice a ninguna de las tres**. Lo único
que la ESC agrega, y que conviene no perder, es que **ese gradiente conserva valor pronóstico
aunque haya IM**: la app ya lo publica como «Gradiente transmitral elevado», que es exactamente
nombrarlo sin graduarlo.

⚠️ **Y una fuente secundaria que el original DESMIENTE.** La premisa con que se pidió el trabajo
decía que «el THP y la planimetría se prefieren en ese caso». **La planimetría sí; el THP no**: la
ASE 2023, folio 7, dice literalmente lo contrario, que la IM significativa reduce la fiabilidad del
área por THP. La **EAE/ASE 2009, folio 14**, agrega que el método de **PISA sí puede usarse en
presencia de IM significativa**, que es el único método cuantitativo que las guías salvan además
de la planimetría. Ninguno de los dos está hoy entre las fuentes de área de la app para la mitral
(la app usa planimetría, THP y continuidad).

⚠️ **Un efecto colateral medido, menor pero real:** con gradiente 7 mmHg (banda `5-9`) e IM severa,
el informe **deja de decir el estado de la estenosis**: pasa de «con estenosis no significativa,
con gradiente elevado» a «con gradiente transmitral elevado» a secas. El dato de que la estenosis
no es significativa desaparece del papel firmado.

### (3) · El THP en la PRÓTESIS mitral — valores exactos de la guía

**ASE 2024, Tabla 11, folio 27** («Doppler findings suggestive of prosthetic mitral valve
stenosis»), **leída renderizando a 400 dpi** porque el texto extraído devuelve `$` por `≥` y `#`
por `≤`:

| Parámetro | Normal | Posible estenosis | Sugiere estenosis significativa |
|---|---|---|---|
| Velocidad pico, m/s ‡§ | `<1.9` | `1.9-2.5` | `≥2.5` |
| Gradiente medio, mmHg ‡§ | `≤5` | `6-10` | `>10` |
| VTI prótesis / VTI TSVI ‡§ | `<2.2` | `2.2-2.5` | `>2.5` |
| EOA, cm² | `≥2.0` | `1-2` | `<1` |
| **THP, ms** | **`<130`** | **`130-200`** | **`>200`** |

Notas de la tabla: `*` vale para prótesis mecánicas **y** biológicas, y la exactitud diagnóstica es
mejor cuando la mayoría de los parámetros son normales o anormales a la vez. `†` los valores de la
columna del medio obligan a mirar más de cerca y a pensar en flujo aumentado, taquicardia o PPM.
**`‡` esos tres parámetros también están alterados cuando hay IM protésica significativa** —y, en
la tabla, **el THP y el EOA no llevan esa marca**. `§` algunas bioprótesis pueden tener valores de
corte algo más altos.

**Las dos afirmaciones de la fuente secundaria quedan CONFIRMADAS, con su respaldo:**

1. **La fórmula `220/THP` no se usa para calcular el área en una prótesis.** ASE 2024, **folio
   10**: el cálculo del EOA por el método del THP es **frecuentemente inexacto y conduce a
   sobreestimar el EOA**, sobre todo en válvulas normales; el EOA indexado de una prótesis mitral
   se calcula mejor **por la ecuación de continuidad**. Y el THP se usa **como parámetro directo**,
   con los tres tramos de arriba.
2. **El cociente VTI sube tanto con la obstrucción como con la regurgitación protésica, y el THP
   ayuda a separarlas.** Es exactamente lo que dicen las dos marcas `‡` de la Tabla 11 y el título
   de la **Tabla 12, folio 28**: «hallazgos sugestivos de IM protésica significativa en válvulas
   mecánicas **con THP normal**». Y el **folio 24** lo dice en prosa: los criterios principales de
   estenosis mitral protésica son **gradiente medio >10 mmHg a frecuencia normal, THP >200 ms, DVI
   >2,5 y EOA <1 cm²**, y el DVI derivado como VTI prótesis/VTI TSVI resultó el parámetro Doppler
   más sensible y específico en un estudio.

**Los valores exactos NO difieren de la fuente secundaria en ningún tramo.** Los cuatro números
que la orden citaba de memoria («menos de 130 / 130 a 200 / más de 200», «1,9 y 2,5», «hasta 5 /
6 a 10 / 10 o más», «2,2 a 2,5») **coinciden letra por letra con la tabla original**.

**Tabla 12, folio 28** — los cinco hallazgos de IM protésica significativa con THP normal, con su
sensibilidad y especificidad: velocidad mitral pico `≥1.9 m/s` (90 % / 89 %) · **VTI prótesis /
VTI TSVI `≥2.5` (89 % / 91 %)** · gradiente medio `≥5 mmHg` (90 % / 70 %) · Vmax del chorro de IT
`>3 m/s` (80 % / 71 %) · volumen sistólico del VI por 2D/3D más de un 30 % mayor que el sistémico
por Doppler. Nota: **cuando la velocidad pico y el cociente VTI están elevados con un THP normal,
la especificidad se acerca al 100 %**.

### (4) · El defecto de la AVm indexada — reproducido, y es MAYOR que lo reportado

**Escena**: prótesis no; mitral normal; peso 70, talla 170; **el THP como única fuente de área**
(THP 160 ms → AVm 1.38 cm²). Borrado del THP con **doce Backspace reales** sobre el campo enfocado.

| Nodo | ANTES de borrar | DESPUÉS de borrar | Tras llamar `calcEM()` a mano |
|---|---|---|---|
| `thp` | `160` | `''` | `''` |
| `avm_thp` | `1.38` | `''` ✅ | `''` |
| `em_avm_thp_display` | `1.38 cm²` | `''` ✅ | `''` |
| `#em-thp-row` | `1.38 cm²` | `—` ✅ | `—` |
| **`avm_idx`** | `0.76 cm²/m²` | **`0.76 cm²/m²`** ❌ | `''` |
| **`#em-clase-thp`** | `· significativa (≤1,5 cm²) · peor` | **igual** ❌ | `''` |
| **`#em-sev-integrada`** | `Estenosis mitral significativa AVm 1.38 cm² por THP` | **igual** ❌ | `—` |
| **`em_grado`** | `severa` | **`severa`** ❌ | `sin` |
| `emCategoria()` | `clave: 'severa'` | `clave: 'nada'` ✅ | `clave: 'nada'` |

⚠️ **Y LLEGA AL INFORME FIRMADO.** Medido en los tres estilos, después del borrado y **sin**
llamar a nada:

| | ANTES | DESPUÉS de borrar el THP |
|---|---|---|
| Informe (estándar) | «Válvula mitral de morfología normal, con **estenosis significativa (AVm 1.38 cm² por THP)**, sin insuficiencia.» | «Válvula mitral de morfología normal, con **estenosis significativa**, sin insuficiencia.» |
| EN SUMA | «EM significativa.» | «EM significativa.» |

O sea que el informe **conserva la afirmación y pierde el número que la sostenía**: el paréntesis
sale de `emCategoria()`, que es una función pura de los campos y se recalcula sola; la afirmación
sale de `em_grado`, que **nadie reescribe**. Queda un informe firmado que dice «estenosis
significativa» sin un solo dato detrás. Es peor que un número rancio.

**La causa, con nombre y línea de razonamiento:** `calcTHP()` sale temprano cuando el THP está
vacío —`if (!thp) { setv('avm_thp',''); emThpSalidasLimpiar(); return; }`— **antes de la llamada a
`calcEM()` que está al final de la función**. `calcEM()` es quien escribe `em_grado`, `avm_idx`,
`#em-sev-integrada` y las clases del cuadro, y tiene desde el 2026-10-09 el `else` que vacía
`avm_idx`. Ese `else` **existe y es correcto**: lo que falla es que nadie lo ejecuta.

**Cuántos otros campos automáticos tienen el mismo patrón: NINGUNO, y está medido.** Censo de
**doce** campos editables, cargados y borrados con teclas reales uno por uno, comparando todos los
derivados antes, después y tras forzar el recálculo:

| Campo borrado | Derivados que quedan rancios |
|---|---|
| **`thp` (mitral)** | **5**: `em_grado`, `avm_idx`, `#em-sev-integrada`, `#em-clase-thp`, `#em-thp-badge` |
| `avm_plan` · `em_vtimit` · `em_dtsvi` · `em_vtitsvi` · `em_gmedio` (mitral) | **0** cada uno |
| `vmax_ao` · `gmedio_ao` · `itv_ao` · `ea_dtsvi` · `ea_vtitsvi` · `ava_plan` (aórtico) | **0** cada uno |

**Tres controles negativos**, los tres limpios: borrar la **planimetría** y borrar el **VTI mitral**
limpian todo (sus `oninput` sí llaman a `calcEM()`); borrar el **peso** limpia **sólo** `avm_idx`
y deja el resto —que es el comportamiento correcto y deliberado de `_emAvmiSinBSA`, que a
propósito **no** llama a `calcEM()` para que borrar el peso no mueva una afirmación de severidad—.

### (5) · La continuidad mitral en fibrilación auricular

**Lo que hace la app, medido:** el área mitral por continuidad vota **exactamente igual** en ritmo
sinusal y en fibrilación auricular. Con los tres insumos cargados y `diast_ritmo` cambiado con un
gesto real: `avm_cont = 1.26 cm²` y `em_grado = severa` en los dos ritmos, con la fila del cuadro
diciendo «· significativa (≤1,5 cm²) · **peor**» y **el aviso `#em-cont-aviso` vacío en los dos**.
`hfRitmoEfectivo()` devuelve `rs` y `fa` correctamente, o sea que **el dato del ritmo está
disponible y nadie lo consulta**. Confirma D1-4.

**Lo que dice la guía. EAE/ASE 2009, folio 14, §B.1.4**, literal en palabras propias: la ecuación
de continuidad **no puede usarse** en casos de **fibrilación auricular** ni con IM o IAo
significativas asociadas. En la misma página, sobre el método de PISA: **ese sí puede usarse en
presencia de IM significativa**.

**De dónde se leería el ritmo.** `#diast_ritmo` es el `<select>` del cuadro de función diastólica
del Doppler mitral, con exactamente **dos** opciones (`sinusal` y `fa`), y **`hfRitmoEfectivo()` ya
es su dueño único** —lo usan el HFA-PEFF y los tres algoritmos de función diastólica—. No hace
falta un campo nuevo.

**Dónde podría ir el aviso.** `#em-cont-aviso` **ya existe** y ya es la superficie de este mismo
tipo de salvedad: hoy lo escribe `emContMotivoNoVota()`, el dueño único que retira el voto de la
continuidad con IM o IAo `≥` moderada (`EM_CONT_REGURG_MIN = 2`) y con la regurgitación ilegible
(`EM_CONT_NOVERIF_TXT`, fail-closed). Agregar la fibrilación auricular sería **una condición más
en esa misma función**, y la fila dejaría de votar por el mismo camino por el que ya deja de votar
con IM significativa.

⚠️ **Pero hay una pieza que hay que mirar antes, y no es obvia:** `emContMotivoNoVota(src)` acepta
una fuente inyectable, porque la consumen también el **Laboratorio** y la **fila del Excel**, que
trabajan sobre `inf.campos` de un estudio archivado. Para que el aviso no divida pantalla y libro,
`diast_ritmo` tendría que leerse del mismo `src`, igual que hoy se leen `im_grado` e `ia_grado`.
**No se implementó nada.**

### (6) · El Laboratorio frente a la excepción de la IM

**Sí la respeta, y está medido sobre diez estudios armados.** `_labEmLectura()` llama a
`emImSignificativa(c)` y define `gradCuenta = !imSig`: con IM moderada o severa, **ni la banda de
`≥10` ni la de `≥5` votan**.

| Estudio armado | Categoría del Laboratorio | Rótulo |
|---|---|---|
| Gm 12, sin IM | `sig_grad` | «Significativa solo por gradiente» |
| Gm 12, **IM moderada** | `sin` | **«Sin estenosis»** |
| Gm 12, **IM severa** | `sin` | **«Sin estenosis»** |
| Gm 7, sin IM | `grad_elev` | «No significativa con gradiente elevado» |
| Gm 7, **IM severa** | `sin` | **«Sin estenosis»** |
| AVm 1.2 + Gm 12 + IM severa | `sig_area_15` | «Significativa, AVm >1,0 a ≤1,5 cm²» (el **área** sigue votando) |
| AVm 0.8, sin IM | `sig_area_1` | «Significativa, AVm ≤1,0 cm²» |
| sin ningún dato | `null` | fuera de todas las categorías |
| **prótesis** con Gm 12 | `null` | fuera de todas las categorías |

**Los conteos por área están bien**: el área vota con IM severa, el sub-rango 1,0 separa las dos
categorías, y la prótesis y el estudio sin datos quedan fuera.

⚠️ **PERO HAY UN DEFECTO, Y ES DE CONSISTENCIA ENTRE DOS SUPERFICIES DE LA MISMA APP.** Con
gradiente elevado e IM moderada o severa:

- la **pantalla y el informe firmado** dicen «**Gradiente transmitral elevado**»;
- el **Laboratorio** clasifica ese mismo estudio como «**Sin estenosis**».

La categoría «No significativa con gradiente elevado» (`grad_elev`) **existe y no se alcanza**,
porque `gmElev` también está gateado por `gradCuenta`. El resultado es que un estudio cuyo papel
firmado **afirma un gradiente elevado** cuenta en la estadística como si la mitral no tuviera nada.
Es el espejo exacto del defecto que la tanda B3 quiso evitar: allí se evitó **sobre-afirmar**
(decir «significativa sólo por gradiente» sobre un informe que no dice estenosis) y acá quedó una
**sub-afirmación**. La salida conservadora —y la que haría coincidir las dos superficies— es una
categoría propia que diga lo mismo que el papel, sin la palabra estenosis.

---

## 5 · Propuestas para el W2, por riesgo clínico

«¿Publica hoy un grado equivocado?» se contesta con **sí** sólo cuando una superficie **firmada**
(informe, EN SUMA, PDF, Excel) publica una afirmación que la guía o los datos no sostienen.

| # | Qué cambiaría | Por qué (guía · folio) | ¿Grado equivocado hoy? | Esfuerzo | ¿Columna de Excel? ¿Laboratorio? | Depende de |
|---|---|---|---|---|---|---|
| **W2-1** | Que `calcTHP()` llame a `calcEM()` también en su salida temprana del THP vacío (o que el borrado del THP pase por el mismo embudo que los otros insumos) | No es una cuestión de guía: es un recálculo que no ocurre | **SÍ.** Cargar el AVm por THP y borrar el THP deja el informe firmado diciendo «con estenosis significativa», **sin número**, y el EN SUMA «EM significativa.», con `em_grado = severa` en el Excel | **chico** (una línea) | no · no | ninguna |
| **W2-2** | Que el **Laboratorio** no cuente como «Sin estenosis» un estudio con gradiente elevado e IM significativa: categoría propia alineada con lo que el informe dice | Consistencia interna; ASE 2023 folio 7 y EAE/ASE 2009 folio 12 sostienen nombrar el gradiente sin graduar | **no** en el informe; **sí** en la estadística, que hoy dice lo contrario del papel | **mediano** | **Laboratorio sí** (una categoría más; ⚠️ `_labHallazgosCuenta` corta en ocho — ver X5). Excel: no | ninguna |
| **W2-3** | **Rótulos del cuadro de referencias de la EM con prótesis**: que las cuatro filas publiquen los cortes de la **Tabla 11** en vez de los nativos, o que declaren que no aplican | ASE 2024 **Tabla 11, folio 27** | **no** (el informe calla la estenosis protésica), pero la **pantalla** afirma «significativa (≤1,5 cm²)» sobre una prótesis, al lado de «No graduada» | **mediano** | no · no | el patrón ya existe: `imCortesPintar()` conmuta el jet/AI con `_imVmProt()` |
| **W2-4** | **Fila del AVA del recuadro Doppler aórtico con prótesis** (`#ea-sev`, línea 2): que no publique «Severa (≤1.0cm²)» | La Tabla 5 **no usa un corte absoluto de AVA** en prótesis | **no** (el informe ya publica el veredicto protésico), pero la pantalla se contradice a dos centímetros | **chico** | no · no | ninguna |
| **W2-5** | **PPM aórtico**: calcularlo como ya se calcula el mitral, con la rama de IMC | ASE 2024 **Tabla 7, folio 20** | **no** (hoy no se afirma nada), pero **se pierde un hallazgo** que la app tiene todos los datos para dar, y la ayuda `#ref-pao` publica cortes sin la rama de IMC atribuidos a otra fuente | **mediano** | ⚠️ **probable columna nueva** si se quiere en el libro (hoy 436). Laboratorio: no | el AVAi ya existe (`ava-idx`); el patrón es `vmProtEOA` |
| **W2-6** | **Banda intermedia del EOA protésico mitral** (`1-2 cm²` = «posible estenosis») | ASE 2024 **Tabla 11, folio 27** | **no** —no afirma de más—, pero **sub-afirma**: EOA 1.50 con DVI 2.10 publica «sin criterios de obstrucción» donde la guía dice «posible» | **chico** (un tramo más en `porEoa`) | no · no | ninguna |
| **W2-7** | **Aviso de fibrilación auricular en la continuidad mitral** (cierra D1-4) | EAE/ASE 2009 **folio 14**: la continuidad **no puede usarse** en FA | **SÍ en potencia**: hoy un área por continuidad calculada en FA puede ser la única fuente que gradúe, y el informe firmado la publica sin salvedad | **mediano** | no · no | ⚠️ **`emContMotivoNoVota` tiene fuente inyectable**: el ritmo debe entrar por `src`, si no el Excel y el Laboratorio divergen de la pantalla |
| **W2-8** | **THP como parámetro directo en la prótesis mitral**, y dejar de publicar `220/THP` con rótulo nativo cuando la válvula es protésica | ASE 2024 **Tabla 11, folio 27** (`<130` / `130-200` / `>200`) y **folio 10** (el EOA por THP sobreestima en prótesis) | **no** —la estenosis protésica no se gradúa—, pero la pantalla publica un área por un método que la guía desaconseja ahí, rotulada con el corte nativo | **mediano** | no · no | conviene hacerlo junto con **W2-3** |
| **W2-9** | **Velocidad pico de E y gradiente medio con bandas protésicas** en la cápsula de la prótesis mitral | ASE 2024 **Tabla 11, folio 27** | **no** | **mediano** | no · no | los dos campos existen (`em_vmax`, `em_gmedio`); **W2-3** |
| **W2-10** | **Atribuir la Tabla 13 en las tarjetas ⓘ y el manual** cuando la mitral es protésica, con su nota `††` («menos validados que en la IM nativa») | ASE 2024 **Tabla 13, folio 30** | **no**: los cuatro cortes cuantitativos **coinciden número por número** con los nativos | **chico** | no · no | ninguna |
| **W2-11** | **Jet/AI nativo**: el `>40 %` para severa no está en la ASE 2017 | ASE 2017 **Tabla 8, folio 332** y **folio 333**: severa `>50 %` del área de la AI | **SÍ en potencia**, y es **NATIVO**: hoy un jet del 45 % vota «severa» con un corte que la guía citada no publica | **chico** el número; **clínico** la decisión | no · no | ⚠️ **es contenido clínico: lo decide Maicol**, no se toca sin orden |
| **W2-12** | **Regurgitación paravalvular de una SAVR**: hoy el módulo de RPV vive sólo en la pestaña ETE/TAVI | ASE 2024 **Tabla 8, folio 23**: la extensión circunferencial aplica a toda prótesis aórtica | **no** (no afirma de más), pero **no hay dónde cargarlo** | **grande** | ⚠️ **campos nuevos** | — |
| **W2-13** | `onchange` de `#va_morf`: hoy es sólo `valvProtSync()` y no recalcula | — | **no** medido como defecto (el censo forzó el recálculo); es una **asimetría** con `#vm_morf` | **chico** | no · no | ninguna |

### Lo que NO se puede hacer sin un campo nuevo

- **EOA aórtico protésico contra su referencia (A7).** La Tabla 5 lo expresa en desviaciones
  estándar respecto del EOA de referencia **del modelo implantado**: haría falta registrar **marca,
  modelo y tamaño** de la prótesis, más una tabla de referencia (el Apéndice de la ASE 2024 la
  trae, Tablas A1 a A9). Es el cambio más grande del censo.
- **Criterio específico de TAVI (A8).** Es un cambio respecto de un **basal post-implante en
  condiciones hemodinámicas estables**: hace falta marcar cuál estudio del paciente es ese basal.
- **Regurgitación paravalvular de una SAVR (W2-12).** Extensión circunferencial, ancho y área de la
  vena contracta paravalvulares fuera del módulo TAVI.
- **Dos filas de la Tabla 12 (R15):** el volumen sistólico del VI por 2D/3D comparado con el
  sistémico, y la convergencia sistólica en el VI hacia la prótesis.

---

## 6 · Lo que NO se pudo medir, y por qué

- **La Tabla 11 en una bioprótesis con cortes «algo más altos»** (nota `§`): la guía no publica
  cuáles. Queda como está.
- **El tiempo de aceleración aórtico y el AT/ET con datos reales**: los ejes existen y están
  cableados (`va_at`, `tango_te`), pero la escena del censo no los cargó, así que su veredicto se
  verificó por **lectura de código** contra la Tabla 5, no en pantalla.
- **Las diez filas del censo marcadas «lectura de código»**: E3, E4, R5, R6, R15, A1, A4, A5, A12 y
  A14. Las seis primeras porque su escena pediría cargar parámetros que no mueven ninguna de las
  preguntas del prompt; A1 porque ya está censado en `docs/mapa/aortica-cortes.md`; A12 y A14
  porque son una decisión de arquitectura verificable por grep (`eteTaviRPV` sólo se alcanza desde
  el módulo ETE).
- **Safari**: la comprobación de que un `<option>` oculto no aparece sólo se puede hacer ahí, y
  este entorno no lo tiene. No aplica a nada de este censo.
