# Inventario del CATÁLOGO DE PRÓTESIS — tanda PANT-19, commit 1 (2026-11-06)

> **Documento de SOLO LECTURA.** El commit 1 no cambia una línea de la aplicación:
> `index.html` tiene el mismo md5 **`f39a988f`** antes y después.
> Lo de la pantalla se midió en Chrome con el **gesto real** (sonda
> `scripts/_probe_pant19inv.mjs`); lo de la guía se leyó **en imagen** a 300 ppp con el folio
> comprobado en el pie impreso de cada hoja.

---

## 1a · LA PANTALLA

### Los dos selects de morfología

| | aórtica | mitral |
|---|---|---|
| **id** | `va_morf` | `vm_morf` |
| **valor sin tocar** | `Trivalva normal` | `Normal` |
| **opciones** (valor persistido) | Trivalva normal · Bicúspide · Calcificada · Reumática · **Prótesis biológica** · **Prótesis mecánica** · **TAVI** · Endocarditis · Carcinoide | Normal · Mixomatosa / Barlow · Calcificada · Reumática · Prolapso / EVMS · **Prótesis biológica** · **Prótesis mecánica** · Plastia mitral · TEER mitral · Endocarditis · Isquémica (disfunción/rotura músculo papilar) |
| `onchange` | `valvProtSync();taviMorfSync('va','va_morf')` | `showProlapsoPanel();valvProtSync();imOndaESiExiste();eteVmPropagar('vm');calcIM_ESC();calcEM();m3dBotonSync();vmProtBloqSync();vmMorfFitSync()` |
| **quién dice «es prótesis»** | `valvEsProtesis(val)` sobre `VALV_PROT_OPCIONES` — el dueño único | el mismo |

⚠️ **La etiqueta de la aórtica lleva «(SAVR)» y el `value` NO.** Es la única excepción del archivo
a esa convención y la fija TC-289; el filtro del catálogo tiene que leer el **valor**.

⚠️ **LA MITRAL NO TIENE NINGUNA OPCIÓN DE IMPLANTE TRANSCATÉTER.** Sus cuatro opciones de
dispositivo son prótesis biológica, prótesis mecánica, plastia mitral y TEER mitral. Esto decide
la Tabla A6 — ver **1c (vi)** y `docs/PENDIENTES.md` → **P19-d**.

### La fila que contiene cada select, medida a los cuatro anchos

Sonda con la pestaña Válvulas abierta y la sección abierta por `toggleEteSeccion` —que **alterna**,
así que se comprueba el `display` antes de volver a tocar (la lección de TC-690)—.

| ancho | AÓRTICA select | fila | **hueco a la derecha** | MITRAL select | fila | columnas del grid |
|---|---|---|---|---|---|---|
| 1440 px | 420 px | 1194 px | **774 px** | 156 px | 483 px | 3 (155,7 cada una) |
| 1000 px | 420 px | 778 px | **358 px** | 275 px | 275 px | 1 |
| 768 px | 420 px | 706 px | **286 px** | 706 px | 706 px | 1 |
| 390 px | 328 px | 328 px | **0 px** | 328 px | 328 px | 1 |

- **AÓRTICA — `.valv-morf-row`**: `display:flex; flex-wrap:wrap; gap:8px 12px`, UN hijo `.fg` con
  `flex:0 1 420px`. **Sobra sitio a la derecha del select en los tres anchos grandes**, y a 390 px
  el `flex-wrap` manda a la línea siguiente lo que no entre. Es la fila donde el botón entra.
- **MITRAL — `.valv-morf-row valv-morf-row--tres`**: `display:grid` con
  `repeat(auto-fit,minmax(144px,1fr))` y **ancho acotado** por
  `width:calc((100% - 8px)/2 - var(--valv-sevcol))`, o sea el ancho del botón «Insuficiencia».
  Lleva **TRES** hijos (morfología, tipo de IM, Carpentier). **A 1000 px ya está en UNA columna.**
  ⚠️ **Ese ancho lo vigila TC-522**, que se pone rojo si la fila pasa al botón. Un cuarto hijo
  apretaría las tres celdas por debajo del piso de 144 px. Ver **P19-e**.

### Los campos medidos que el catálogo compara

| válvula | qué | id / nodo | rótulo real |
|---|---|---|---|
| aórtica | velocidad pico | `vmax_ao` | «Vmax aórtica (m/s)» |
| aórtica | **gradiente medio** | `gmedio_ao` | «G. medio (mmHg)» |
| aórtica | **AVA por continuidad** | `ava_cont` (campo) · fila `ea-det-ava` | «AVA continuidad» |
| aórtica | AVA indexada | fila `ea-det-avai` | «AVA indexada» |
| aórtica | DVI | fila `ea-det-dvi` | «DVI» |
| mitral | **velocidad pico de E** | `em_vmax` | «Vmax mitral CW (m/s)» |
| mitral | **gradiente medio** | `em_gmedio` | «G. medio (mmHg)» |
| mitral | **THP** | `thp` | «THP mitral (ms) — EM» |
| mitral | **EOA por continuidad** | **derivada**, `vmProtEOA().eoa`, fila `vm-prot-eoa` | «AEO por continuidad» |
| mitral | DVI | `vm_dvi` (tipeado) o calculado | «DVI — índice de velocidad Doppler» |

⚠️ **La EOA mitral NO es un campo**: la deriva `vmProtEOA()` de `em_vtimit`, `ea_vtitsvi` y el Ø
TSVI. Su cápsula es de sólo lectura y **ni un `id` de control vive adentro**, a propósito.

### El ASC y el IMC de Paciente

| | |
|---|---|
| **ASC** | `getBSA(src)` — Mosteller, `Math.sqrt(peso*talla/3600)`; sin `src` lee el formulario |
| **IMC** | `getIMC(src)` — misma firma; es el dueño único desde que el PPM mitral habría sido la tercera copia |
| **campos** | `peso`, `talla` |
| medido | con 75 kg y 175 cm: ASC **1,9094** m² · IMC **24,49** kg/m² |

### La función y los cortes del PPM de cada válvula

| | aórtica | mitral |
|---|---|---|
| **cortes** | `EA_PROT_PPM_CORTES` | `VM_PROT_PPM_CORTES` |
| IMC < 30 | normal `> 0,85` · severo `≤ 0,65` | normal `> 1,2` · severo `≤ 0,90` |
| IMC ≥ 30 | normal `> 0,70` · severo `≤ 0,55` | normal `> 1,0` · severo `≤ 0,75` |
| **rama del IMC** | `VM_PROT_IMC_OBESIDAD` = 30, compartida | la misma |
| **clasificador** | `_eaPpmAoClasificar(avai, imc)` → `'no'|'moderado'|'severo'` | dentro de `vmProtEOA()`, mismo operador |
| **vocabulario de pantalla** | `PPM_FILA_TXT` = `sin desajuste` / `moderado` / `severo` | el mismo |
| **frases del papel** | `ppmFrases('aortica'|'mitral', grado, indexada)` — dueño único | el mismo |

**Probado con la MISMA indexada y dos IMC**, que es lo que distingue un corte de otro:

| indexada | IMC 25 | IMC 31 |
|---|---|---|
| 0,75 cm²/m² | **moderado** | **sin desajuste** |
| 0,60 cm²/m² | **severo** | **moderado** |

✅ **LA MITRAL USA LOS CORTES MITRALES DE LA TABLA 7, NO LOS AÓRTICOS.** Medido contra la hoja 19
(folio 20): 1,2 / 0,90 y 1,0 / 0,75 coinciden uno por uno. **No hay nada que parar por P19-c.**

### La tarjeta de severidad aórtica (lo que dejó PANT-18)

- **Quién decide:** `eaProtVeredicto()` → `{ via, nivel, niveles, falta, pDep, pIndep, **eoaEvaluable**, avai, ppm, … }`.
- En SAVR el `nivel` es la regla de integración de la nota general de la Tabla 5: el peor de los
  ejes **dependientes del flujo** (`vmax`, `gmed`) y el peor de los **independientes** (hoy sólo
  `dvi`). `signif` sólo con los dos en `signif`.
- **`eoaEvaluable` vale `false` en todas las escenas**, medido: es la bandera que el commit 5
  necesita.
- **Qué dice hoy de la EOA** (`EA_PROT_SALV.eoa`, en el plegable «ⓘ Ver detalle»), textual:
  > «El área efectiva no se evalúa: la Tabla 5 la expresa en desviaciones estándar respecto del
  > valor de referencia del MODELO implantado, y esta aplicación no registra marca ni modelo. El
  > DVI queda como único eje independiente del flujo.»
- **Y lo dice una segunda vez** en el globo ⓘ `ea-prot-sev`, campo `ojo`:
  > «El área valvular NO gradúa una prótesis: la tabla la expresa en desviaciones estándar
  > respecto del valor de referencia del modelo implantado, y esta aplicación no registra marca ni
  > modelo. Y para decir «significativa» exige las DOS mitades: un eje que depende del flujo y uno
  > que no.»
- La tarjeta se parte, desde PANT-18, en **línea visible** + hasta dos avisos + **«ⓘ Ver detalle»**
  plegado. La salvedad de la EOA vive en el plegable.

### La cápsula de obstrucción mitral

- Dueño: `vmProtEOA()` → `{ eoa, eoaI, dvi, obstr, ppm, porVmax, porGmed, porThp, porEoa, porDvi, obstrPos, obstrMed, faltan }`.
- Cortes: `VM_PROT_T11` (velocidad pico 1,9 / 2,5 · gradiente medio 5 / 10 · THP 130 / 200) y
  `VM_PROT_EOA_NORMAL_MIN` = 2,0 — los tres operadores son distintos entre sí, y es de la tabla.
- Filas: `vm-prot-vmax`, `vm-prot-gmed`, `vm-prot-eoa`, `vm-prot-dvi`, `vm-prot-thp`,
  `vm-prot-obstr`, `vm-prot-ppm`.
- **La Tabla 11 NO trae la EOA frente a la del modelo**, así que el commit 7 no le agrega
  ningún criterio.

### ¿Existe ya un campo de modelo, marca o tamaño reutilizable?

Censo del documento entero sobre `input[id]`, `select[id]` y `textarea[id]` con
`modelo|marca|model|tamano|tamaño|size|numero_mm|prot_n` en el id: **UNA sola coincidencia**.

| id | rótulo | pestaña | ¿sirve? |
|---|---|---|---|
| `ete_tavi_pro_marca` | «Marca / modelo» (texto libre, «Ej: Sapien 3») | **módulo TAVI del ETE** | **NO** |

**Por qué no sirve**, con sus tres motivos medidos: (1) vive en otra pantalla, no en Válvulas;
(2) es texto libre y **no tiene tamaño asociado**, que es la mitad de la clave del catálogo;
(3) **llega al papel** —lo leen `eteTaviSync`, el informe y la diapositiva del PPT (`fila(F,'Prótesis TAVI', …)`)—
y esta tanda tiene prohibido que el modelo llegue al informe.

**Conclusión: hacen falta campos nuevos.** Ninguno de los ocho autorizados existe ya.

---

## 1b · LAS LISTAS QUE RECORRE UN CAMPO

Tomando `va_at` —el campo que PANT-18 agregó— como patrón medido:

| # | lista | dónde | qué hay que hacer con un campo nuevo |
|---|---|---|---|
| 1 | **marcado** | `<input id="va_at">` | declararlo; el barrido de `guardarInforme` toma todo `input[id]`/`select[id]` |
| 2 | **«Nuevo estudio»** | `limpiarCampos()` barre `input[type=text]`, `[type=number]` y `textarea` | **nada**, si el campo es `text` o `number` y NO es `hidden` |
| 3 | **restaurado** | el mismo barrido inverso al abrir un estudio | nada |
| 4 | **Excel — salida** | `_labExcelRow`: `'AT aórtico (ms)': rnd(valvProtDato('va_morf','va_at',c),0)` | una entrada por columna |
| 5 | **Excel — importador** | `LAB_XLS_MAP`: `['AT aórtico (ms)', 'va_at', 'num']` | una entrada con su tipo |
| 6 | **banda de plausibilidad** | `va_at:[10,300]` | sólo para campos numéricos |
| 7 | **censo de campos** | derivado del barrido de guardado | se mide, no se escribe |

⚠️ **`_noEsDelEstudio` excluye por PREFIJO con guión MEDIO**
(`login-|ig-|lab-|cfg-|…|va-esp-|tga-3d-|cm3d-|…`). Un campo con **guión BAJO** (`va_prot_modelo`)
**no queda excluido** y por lo tanto se guarda, que es lo que esta tanda quiere.

---

## 1c · LA GUÍA, LEÍDA EN IMAGEN

**ASE 2024 — Zoghbi W y col., *J Am Soc Echocardiogr* 2024;37:2-63**, archivo
`Zoghbi_2024_Protesis.pdf`, **62 hojas**. Renderizado a **300 ppp**.
**Regla de folio = hoja + 1, comprobada en el pie/encabezado impreso de las ONCE hojas del
apéndice**: hoja 50 → «Zoghbi et al **51**», hoja 51 → «**52** Zoghbi et al», hoja 52 → «**53**»,
hoja 53 → «**54**», hoja 54 → «**55**», hoja 55 → «**56**», hoja 56 → «**57**», hoja 57 → «**58**»,
hoja 58 → «**59**», hoja 59 → «**60**», hoja 60 → «**61**».

⚠️ **Los tres archivos de la carpeta son el MISMO documento con md5 distinto**
(`ASE 2024 Apendice.pdf`, `ASE protesis 2024.pdf`, `Zoghbi_2024_Protesis.pdf`): 62 hojas cada uno
y las mismas primeras líneas en las 62. Se usa el tercero, que es el que leyó PANT-18.

### (i) Tabla A4 — aórtica quirúrgica · hojas 52 a 57 · folios 53 a 58

**Título:** «Table A4 Normal Doppler echocardiographic values for surgical prosthetic aortic valves»
**Columnas:** `Valve` · `Size, mm` · `Peak gradient, mm Hg` · `Mean gradient, mm Hg` · `EOA, cm²`
**Nota al pie** (hoja 57, folio 58): «Data are expressed as mean ± SD. Modified from Rajani *et al.*²³¹»

**ESTRUCTURA DE LA CELDA «Valve», y la rareza que decide el tipo:** el nombre va en romana y
**debajo, en cursiva, hay una segunda línea**. Esa segunda línea es a veces un **descriptor de
construcción** —`Bileaflet`, `Single tilting disk`, `Caged ball`, `Stented porcine`,
`Stented bovine pericardial`, `Stentless`, `Homograft valves`— y a veces un **nombre comercial**
—`Trifecta`, `Inspiris Resilia`, `Intuity`, `Avalus`, `3F Enable`—.

⚠️ **LA TABLA NO IMPRIME SUBTÍTULOS DE SECCIÓN POR TIPO.** La orden anticipaba «subtítulos que
imprimen el tipo (mecánica, biológica con soporte, sin soporte, homoinjerto)»: **no existen**. La
tabla va en orden alfabético de marca y el único indicio de tipo es esa cursiva por fila.
→ **P19-a**.

**Conteo medido** (parser por coordenadas, cruzado con la lectura en imagen de las seis hojas):

| | |
|---|---|
| bloques impresos de modelo | **51** |
| filas de tamaño | **211** |
| celdas con dato (pico, medio, EOA) | **523** |

⚠️ **El índice anticipaba «unos 45 modelos de 17 a 29 mm»: son 51 bloques y los tamaños van de
17 a 29 más nueve rangos del homoinjerto** (`17-19`, `19-21`, `20-21`, `20-22`, `22-23`, `22-24`,
`24-27`, `25-28`) y los cuatro de la Sorin Perceval (`S (21)`, `M (23)`, `L (25)`, `XL (27)`).
**El tamaño es TEXTO, no un número.** → **P19-a**.

⚠️ **DOS MODELOS APARECEN EN DOS BLOQUES SEPARADOS** con el mismo nombre y el mismo tipo, por
corte de maquetación: `Medtronic Advantage / Bileaflet` (23-25 y 27-29) y
`Medtronic-Hall / Single tilting disk` (21-27 y 20).

### (ii) Tablas A1 y A2 (hoja 50, folio 51) y A3 (hoja 51, folio 52) — TAVI

**A1** «Normal Doppler echocardiographic values for percutaneous SAPIEN valves in native aortic
stenosis by valve size». **Está transpuesta**: las filas son los parámetros (`EOA, cm²`,
`Mean gradient, mm Hg`, `DVI`) y las columnas los tamaños.
· **SAPIEN** — 20 mm, 23, 26, 29, `All sizes` · **SAPIEN XT** — 20, 23, 26, 29, `All sizes`
· **SAPIEN 3** — 20, 23, 26, 29, `All sizes`
Notas: «*NA*, Not applicable.» / «Data are expressed as mean ± SD. Data are modified from Hahn
*et al.*¹¹ with permission.»

**A2** «Normal Doppler echocardiographic values for percutaneous CoreValve and Evolut R valves by
valve size in native aortic stenosis», misma forma transpuesta.
· **CoreValve** — 23, 26, 29, 31, `All sizes` · **Evolut R (30 d)** — 23, 26, 29, 34, `All sizes`
Nota: «Data are expressed as mean ± SD. Data are modified from Hahn *et al.*¹¹ with permission.»

**A3** «Doppler echocardiographic parameters for percutaneous aortic ViV at 1 year after the
procedure». Columnas: `TAVI ViV` · `THV size` · `Peak gradient, mm Hg` · `Mean gradient, mm Hg` ·
`EOA, cm²`. Cuatro filas —CoreValve, Evolut, SAPIEN 3, SAPIEN XT— y **el tamaño impreso es `All`**.
Notas: «*THV*, Transcatheter heart valve.» / «Data are expressed as mean ± SD. Data are derived
from the respective publications.»

⚠️ **El índice decía «A1 y A2 … por tamaños 20, 23, 26, 29, 31, 34 y “todos”»**: ese es el conjunto
de TODOS los tamaños de las dos tablas juntas; **cada modelo tiene los suyos** y ninguno los tiene
todos. Y **A3 sí imprime un tamaño: `All`** — no es que no lo tenga. → **P19-a**.

### (iii) Tabla A5 — mitral quirúrgica · hojas 57 a 60 · folios 58 a 61

**Título:** «Table A5 Normal Doppler echocardiographic values for surgical prosthetic mitral valves»
**Columnas:** `Valve` · `Size, mm` · `Peak gradient, mm Hg` · `Mean gradient, mm Hg` ·
`Peak velocity, m/sec` · `PHT, msec` · `EOA, cm²`
**Nota al pie** (hoja 60, folio 61): «Data are expressed as mean ± SD. Modified from Rosenhek
*et al.*²³²»
Misma estructura de celda «Valve» que la A4 (romana + cursiva). Tamaños sueltos (25, 27, 29, 31,
33, 35) y **dos rangos impresos**: `27-29` y `31-33`, los dos de la On-X.

### (iv) Tabla A6 — SAPIEN mitral · hoja 60 · folio 61

**Título:** «Table A6 Mean Doppler echocardiographic gradients for normal SAPIEN Valves placed
percutaneously in the mitral position»
**Columnas:** `Reference and valve size` · `ViV` · `ViR` · `ViMAC` · `All`
**Filas:** `Guerrero et al.¹³⁹`, `Whisenant et al.¹³⁸`, `Eleid et al.¹⁴⁰`, y después `23 mm`,
`26 mm`, `29 mm`.
**Notas:** «*NA*, Not applicable; *ViMAC*, valve–in–mitral annular calcification.» ·
«Data are expressed as median (IQR) or as mean ± SD. Data are in millimeters of mercury from each
publication. Data for individual valve size are computed from Eleid *et al.*¹⁴⁰ None of the SAPIEN
valves had >2+ MR.» · «\*Limited data, no SD reported.»

⚠️ **SU EJE NO ES «MODELO × TAMAÑO» SINO «REFERENCIA BIBLIOGRÁFICA × SITUACIÓN»**, y publica un
solo parámetro (el gradiente medio), unas veces como mediana con rango y otras como media ± DE.
**Y la morfología mitral de la app no tiene ninguna opción que la admita** (ver 1a). Por la
condición del commit 6, **la A6 no se carga** → **P19-d**.

### (v) Tabla 7 — hoja 19, folio 20 · cortes de EOA indexada por IMC

Ya implementada y verificada por la tanda Z y por PANT-18. Esta tanda **no la toca**; sus cortes
son los de 1a y coinciden uno por uno con lo que la app aplica en las dos válvulas.

### (vi) Tabla 5 — hoja 18, folio 19 · la fila de la EOA

La transcribió PANT-18 entera. Su fila de la EOA, en el bloque «Specific AVR considerations» →
SAVR, es `EOA §`: **Normal** «Reference EOA ± 1 SD» · **Possible stenosis** «1 SD smaller than
reference EOA» · **Suggests significant stenosis** «2 SDs smaller than reference EOA».
La nota `§` dice «Flow independent» y la nota general: «Significant stenosis should meet at least
one flow-dependent (i.e., velocity and mean gradient) and one flow-independent (i.e., EOA or DVI)
parameter.» **Se relee en imagen en el commit 5, que es donde se aplica.**

### (vii) Tabla 11 — hoja 26, folio 27 · obstrucción mitral

Ya implementada (`VM_PROT_T11` y `VM_PROT_EOA_NORMAL_MIN`) y verificada por la tanda W1. Esta
tanda **no le agrega ningún criterio**: la tabla no trae la EOA frente a la del modelo.

---

## 1d · LAS FILAS DE CONTROL DEL ÍNDICE, VERIFICADAS EN IMAGEN

| # | fila | lo que dice el índice | lo leído en imagen | ¿coincide? |
|---|---|---|---|---|
| 1 | A4 · St. Jude Medical Standard 23 | pico 21,8±7,5 · medio 13,4±5,6 · EOA 1,6±0,4 | idéntico (hoja 57, folio 58) | ✅ |
| 2 | A4 · Medtronic Mosaic 23 | pico 23,8±11,0 · medio 13,7±4,8 · EOA 1,5±0,4 | idéntico (hoja 55, folio 56) | ✅ |
| 3 | A4 · Abbott Trifecta 23 | sin pico · medio 7,2±2,8 · EOA 1,81±0,30 | idéntico (hoja 52, folio 53) | ✅ |
| 4 | A4 · Edwards Mira 25 | EOA «1.9» **sin desvío** | idéntico (hoja 54, folio 55) | ✅ |
| 5 | A4 · St. Jude Haem Plus 21 | media impresa «10.6 ± 5.1**)**» | idéntico, con el paréntesis de más (hoja 56, folio 57) | ✅ |
| 6 | A4 · «Edwards Mosaic» y «Medtronic Mosaic» | dos filas distintas | **sí**: Edwards *Mosaic* (hoja 54, sin tipo impreso, 21-29) y Medtronic Mosaic / *Stented porcine* (hoja 55), con valores distintos | ✅ |
| 7 | A1 · SAPIEN 3 «All sizes» | EOA 1,66±0,38 · GM 11,18±4,35 · DVI 0,43±0,09 | idéntico (hoja 50, folio 51) | ✅ |
| 8 | A3 · SAPIEN 3 | pico 33,93±10,11 · medio 27,00±10,20 · EOA 1,07±0,32 | idéntico (hoja 51, folio 52) | ✅ |
| 9 | A5 · Carpentier-Edwards Perimount 29 | medio 6,0±1,41 · Vpico 1,8±0,19 · PHT 76±17,9 · EOA 2,02±0,57 | idéntico (hoja 58, folio 59) | ✅ |
| 10 | A5 · Hancock II y Medtronic Mosaic | impresos idénticos en todas las columnas, 25 a 33 | **sí**: los dos publican 25 → 8,3±1,71 · 2,1±0,28 · 76±19,8 · 1,42±0,29, en hojas distintas (58 y 59) | ✅ |

**Las diez coinciden.** Lo que NO coincidió con el índice es de estructura, no de celdas, y está
en **P19-a**: los subtítulos de tipo que no existen, el conteo de modelos de A4 (51 y no ~45), el
tamaño `All` de A3 y el reparto de tamaños de A1/A2.

Falta por verificar en imagen, cuando se llegue: la fila A5 de «St. Jude 27 mm» del índice
(pico 11±4, medio 5±1,82, Vpico 1,61±0,29, PHT 75±10, EOA 1,67±0,17) — se verifica en el commit 6.

---

## Lo que este inventario deja decidido

1. **Hacen falta campos nuevos**: ninguno de los ocho autorizados existe. Convención de ids, la de
   `va_at` y sus vecinos: guión bajo y prefijo de válvula.
2. **El tipo del modelo sale de la cursiva**, y sólo cuando esa cursiva es un descriptor de
   construcción; si es un nombre comercial, el modelo queda **«sin dato»** y se ofrece bajo
   cualquier morfología de prótesis, que es lo que la orden dispone.
3. **La fila de la aórtica admite el botón**; la de la mitral, no sin romper TC-522 → **P19-e**.
4. **La Tabla A6 no se carga** → **P19-d**.
5. **El PPM mitral ya usa los cortes mitrales**: no hay nada que parar por **P19-c**.
