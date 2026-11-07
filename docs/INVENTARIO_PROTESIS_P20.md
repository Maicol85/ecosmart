# Inventario de prótesis — tanda PANT-20, commit 1 (2026-11-06)

> **Documento de SOLO LECTURA.** El commit 1 no cambia una línea de la aplicación: el md5 de
> `index.html` es idéntico antes y después (`298cc61d8bc69d87613bd0f3da9b9a92`).
>
> Todo lo que sigue está **medido**, no leído: la pantalla con `scripts/_probe_pant20inv.mjs`
> (Chrome del sistema, 1440 / 1000 / 768 / 390 px × tema claro y oscuro) y la guía **en imagen a
> 300 ppp** con el folio comprobado en el pie o el encabezado impreso de cada hoja.

---

## 1 · La pantalla, válvula por válvula

### 1a · El select de Morfología y su fila

| | **mitral** | **tricúspide** | **pulmonar** | *(aórtica, de referencia)* |
|---|---|---|---|---|
| id del select | `vm_morf` | `vt_morf` | `vp_morf` | `va_morf` |
| opciones | 11 | 10 | 7 | 9 |
| **cuáles son prótesis** | `Prótesis biológica`, `Prótesis mecánica` | `Prótesis biológica`, `Prótesis mecánica` | `Prótesis biológica`, `Prótesis mecánica` | las dos + `TAVI` |
| clase de la fila | `valv-morf-row valv-morf-row--tres` | `valv-morf-row` | `valv-morf-row` | `valv-morf-row` |
| `display` computado | **grid** | flex | flex | flex |
| hijos de la fila | **3** | 1 | 1 | 7 |

Las dos opciones de prótesis llevan `value` explícito en las cuatro válvulas (`VALV_PROT_OPCIONES`),
así que el valor persistido no arrastra el sufijo de la etiqueta.

### 1b · Ancho disponible a los cuatro anchos (medido, antes de esta tanda)

| ancho de ventana | | fila (w/h) | select (w) | **libre a la derecha** |
|---|---|---|---|---|
| **1440** | mitral | 483 / 76 | 156 | *(grid de 3: no hay hueco)* |
| | tricúspide | 1194 / 76 | 420 | **774** |
| | pulmonar | 1194 / 47 | 420 | **774** |
| | aórtica | 1194 / 76 | 420 | 774 |
| **1000** | mitral | **275 / 186** | 275 | *(ya en UNA columna)* |
| | tricúspide | 778 / 76 | 420 | **358** |
| | pulmonar | 778 / 47 | 420 | **358** |
| **768** | mitral | 706 / 186 | 706 | *(una columna)* |
| | tricúspide | 706 / 76 | 420 | **286** |
| | pulmonar | 706 / 47 | 420 | **286** |
| **390** | mitral | 328 / 186 | 328 | 0 |
| | tricúspide | 328 / 76 | 328 | 0 *(el `flex-wrap` baja el botón)* |
| | pulmonar | 328 / 47 | 328 | 0 |

**Idéntico en los dos temas** en los ocho cruces. **Cero errores de página.**

### 1c · Dónde va el botón «Modelo y tamaño», y por qué

- **Tricúspide y pulmonar: EN LA MISMA FILA**, a la derecha del select, igual que la aórtica. Su
  fila es un `.valv-morf-row` **flex con un solo hijo** y sobra sitio —774 px a 1440, 358 a 1000 y
  286 a 768—; a 390 px el `flex-wrap` lo manda solo a la línea siguiente. **El problema de la
  mitral no aparece acá**, y por eso la «misma solución» de la decisión 5 no hace falta.
- **Mitral: en una FILA PROPIA debajo**, que es la decisión 5 del médico y la opción (a) que
  **P19-e** ya dejó medida. Su fila es un `grid` de `repeat(auto-fit,minmax(144px,1fr))` con tres
  hijos y el ancho **acotado** por `width:calc((100% - 8px)/2 - var(--valv-sevcol))` — el ancho
  del botón «Insuficiencia», que mide **483 × 58** a 1440 px.

### 1d · Los campos medidos que el componente compara

Todos existen; **ninguno hace falta crear**. En tiempo de ejecución su `type` computado es
`text` incluso donde el marcado declara `number` (es la nota de TC-734 (C6)).

| válvula | columna del catálogo | id del campo | rótulo real | unidad |
|---|---|---|---|---|
| **mitral** | `medio` | `em_gmedio` | «G. medio (mmHg)» | mmHg |
| | `vpico` | `em_vmax` | «Vmax mitral CW (m/s)» | m/s |
| | `thp` | `em_thp_display` | «THP (ms) ↔ Doppler mitral» | ms |
| | `eoa` | `avm_cont` *(readonly)* | «AVm continuidad (cm²) (auto)» | cm² |
| **tricúspide** | `mg` | `et_gmedio` | «Gradiente medio ET (mmHg)» | mmHg |
| | `thp` | `et_thp` | «THP tricuspídeo (ms)» | ms |
| | `evel` | `et_e_vmax` | «Velocidad pico de E tricuspídea (cm/s)» | **cm/s** |
| | `eoa` | `et_avt` *(readonly)* | «Área valvular tricuspídea — auto (cm²)» | cm² |
| | `dvi` | `vt_dvi` | «DVI auto ← VTI entrada / VTI TSVI» | — |
| **pulmonar** | `medio` | `ep_gmedio` | «Gradiente medio pulmonar (mmHg)» | mmHg |
| | `vpico` | `ep_vmax` | «Velocidad máxima pulmonar (m/s)» | m/s |
| | `pico` | `ep_gmax` *(readonly, auto)* | «Gradiente máximo (mmHg) — auto» | mmHg |

⚠️ **LA VELOCIDAD DE E TRICUSPÍDEA ESTÁ EN cm/s Y LA TABLA A9 LA IMPRIME EN m/sec.** Es la misma
asimetría que `VT_PROT_T19` ya declara y resuelve: «un corte se publica sólo en la unidad del campo
que lo recibe». El componente tiene que convertir **una vez** el valor esperado de la tabla
(m/s × 100) para compararlo con lo medido, igual que esa constante convierte su corte.

⚠️ **`avm_cont` y `et_avt` escriben el valor CON su unidad pegada** —«1.85 cm²»— y el primero
además puede llevar la marca «(revisar)». `_vmN` hace `parseFloat`, que los lee bien; la guarda del
`(revisar)` es la de TC-734 (C6).

### 1e · La función de PPM / EOA indexada de cada válvula, y sus cortes

| válvula | función | cortes |
|---|---|---|
| **mitral** | la que la app ya usa (`VM_PROT_PPM_CORTES` + `ppmFrases('mitral',…)`) | IMC < 30: normal > **1,2** · severo ≤ **0,90** · IMC ≥ 30: normal > **1,0** · severo ≤ **0,75** cm²/m² |
| **tricúspide** | **ninguna** | la Tabla 7 **no publica** cortes de EOA indexada tricuspídea |
| **pulmonar** | **ninguna** | la Tabla 7 **no publica** cortes de EOA indexada pulmonar |

**P19-c ya cerró** que los cortes mitrales son los correctos (fila por fila con la hoja 19,
folio 20), y no se tocan. En la tricúspide y la pulmonar rige la **decisión 6**: la EOA indexada
predicha es **sólo el número**, sin categoría ni rótulo.

### 1f · Qué criterios aplica HOY la app a una prótesis tricúspide y pulmonar

**Medido: los de PRÓTESIS, no los de válvula nativa.** No hay nada que reportar como defecto y
**no se toca una línea**. Los dos registros coinciden **fila por fila** con lo leído en imagen:

`VT_PROT_T19` — Tabla 19, hoja 35, folio 36:

| parámetro | biológica | mecánica | operador | campo |
|---|---|---|---|---|
| velocidad pico de E | **210** cm/s (= 2,1 m/s) | **190** cm/s (= 1,9) | `≥` | `et_e_vmax` |
| gradiente medio | 9 mmHg | 6 | `≥` | `et_gmedio` |
| THP | 200 ms | 130 | `≥` | `et_thp` |
| AEO | 1,5 cm² | 2,0 | `<` | *(del evaluador)* |
| DVI | 3,3 | 2,1 | `≥` | `vt_dvi` |

con `VT_PROT_OBSTR_MIN = 2` (criterio de EcoSmart declarado, la tabla no lo publica).

`VP_PROT_T15` — Tabla 15, hoja 32, folio 33:

| parámetro | bioprótesis | homoinjerto | operador | campo |
|---|---|---|---|---|
| velocidad pico | 3,2 m/s | 2,5 | `≥` | `vp_vmax` |
| gradiente medio | 20 mmHg | 15 | `≥` | `ep_gmedio` |

con sus tres motivos de «no graduada» (`VP_PROT_SIN_COL`): mecánica, percutánea y falta de tipo.

### 1g · Campos de modelo o tamaño reutilizables

**No hay ninguno**, censado el archivo entero: los únicos cuatro campos de modelo y tamaño de
prótesis son los de la aórtica (`va_prot_modelo`, `va_prot_tam`, `va_prot_gmref`,
`va_prot_eoaref`), que son de esa posición. Hacen falta **cuatro por válvula**.

---

## 2 · Cómo se parametriza hoy el componente, y qué hay que sumar

El componente es **UNO solo**: `VMOD_POS` tiene hoy **una** entrada (`va`) y su propio comentario
anuncia esta tanda — «el día que entren la tricúspide y la pulmonar se agrega una entrada al
registro y nada más».

**Para otra posición hay que sumar, y nada más:**

| qué | dónde |
|---|---|
| la entrada en el registro | `VMOD_POS.<pos>` con `morf`, `etq`, `campos{modelo,tam,gmref,eoaref}`, `medidos[]`, `ppm`, `cortes` |
| el estado de «Mostrar / Ocultar» | `_vModVer` *(ya trae `va` y `vm`; faltan `vt` y `vp`)* |
| el catálogo que corresponde a cada morfología | la rama de `vModCatalogo(pos)` |
| el marcado | `vmod-<pos>-wrap` / `-btn` / `-chips` / `-sub` / `-med` + los cuatro `<input>` ocultos |
| la limpieza al cambiar de morfología | `vModMorfSync('<pos>')` en el `onchange` del select |
| el Excel | la salida (`_labExcelRow`) y el mapa del importador |

**Lo que NO hay que tocar:** `vModSyncTodos` recorre `Object.keys(VMOD_POS)`, así que las tres
columnas del repintado —`ESPEJOS_VIVOS`, `RECALC_MODULOS` y el final de `limpiarCampos`— cubren
las posiciones nuevas **por construcción**, en el orden que TC-676 (D2) y TC-700 (A5)(A6) fijan.

### 2a · Los casos existentes que vigilan esas filas (censo)

| caso | qué vigila | ¿lo toca esta tanda? |
|---|---|---|
| **TC-522 (A1)(A2)** | que `.valv-morf-row--tres` tenga **exactamente tres** hijos `.fg` con ids `vm_morf,vm_tipo_im,vm_carp` | **no**: el botón va en una fila **hermana** |
| **TC-522 (A3)** | que el ancho de esa fila no supere el del botón «Insuficiencia» (483 px a 1440) | **no**: la fila nueva no está dentro |
| **TC-522 (A4)** | que las tres celdas midan lo mismo | **no** |
| TC-729, TC-730, TC-735 | integridad de A4, TAVI y A5 contra su transcripción | no |
| TC-731 a TC-734 | el componente en la aórtica | no |
| TC-289, TC-470 | el vocabulario de las opciones de morfología | no |

---

## 3 · Las siete listas por las que pasa un campo guardado

Las mismas de PANT-19, medidas sobre los cuatro campos aórticos:

| # | lista | ¿hay que tocarla? |
|---|---|---|
| 1 | **Nuevo estudio** (`limpiarCampos`) | **no** — barre `text` y `number`, y por eso los campos van con `display:none` y **no** con `type="hidden"` (P14c-g) |
| 2 | **guardado** | **no** — barrido genérico del formulario |
| 3 | **restaurado** | **no** — ídem, y el repintado lo da `vModSyncTodos` en `RECALC_MODULOS` |
| 4 | **importado** | **SÍ** — el mapa de pares `[encabezado, id, tipo]` del importador |
| 5 | **informe** | **no** — ninguno llega al papel, y esta tanda no lo autoriza |
| 6 | **Excel** | **SÍ** — `_labExcelRow`, con el filtro `valvEsProtesis(morf)` |
| 7 | **censo** | **no** — genérico; los ids van en guión **BAJO** para que `_noEsDelEstudio` (que excluye por prefijo con guión **medio**) no los saque del estudio |

**Línea base medida:** Excel **445** columnas; `VMOD_POS` con **una** entrada; catálogos cargados
`PROT_CAT_A4` (49), `PROT_CAT_A5` (30), `PROT_CAT_TAVI` (9); **no existen** `PROT_CAT_A7`, `A8` ni
`A9`.

---

## 4 · La guía en imagen

Guía: **ASE 2024**, Zoghbi y col., *J Am Soc Echocardiogr* 2024;37:2-63. Archivo
`Zoghbi_2024_Protesis.pdf`, **62 hojas**. Los tres archivos de esa carpeta son el **mismo
documento** (9.991.804 bytes cada uno), que es lo que PANT-19 ya declaró.

### 4a · La regla de folio, comprobada en el pie impreso

**folio = hoja + 1**, comprobada hoja por hoja. Las hojas **pares** llevan el número en el pie
(«Volume 37 Number 1 · Zoghbi et al · N») y las **impares** lo llevan en el encabezado
(«N · Zoghbi et al · Journal of the American Society of Echocardiography · January 2024»).

| tabla | hoja | **folio** | comprobado en |
|---|---|---|---|
| **Tabla 15** — *Parameters for prosthetic pulmonary valve stenosis* | 32 | **33** | pie impreso: «Zoghbi et al **33**» |
| **Tabla 19** — *Doppler parameters suggestive of prosthetic TV stenosis* | 35 | **36** | encabezado impreso |
| **Tabla A7** — *Normal Doppler echocardiographic values for prosthetic pulmonary valves* | 61 | **62** | encabezado impreso: «**62** · Zoghbi et al» |
| **Tabla A8** — *Transcatheter tricuspid ViV and ViR* | 61 | **62** | la misma hoja |
| **Tabla A9** — *Normal Doppler echocardiographic values for prosthetic TVs* | 62 | **63** | pie impreso: «Zoghbi et al **63**» |

### 4b · Estructura de la Tabla A7 (pulmonar)

**Columnas:** `Valve` · `Size, mm` · `Peak gradient, mm Hg` · `Mean gradient, mm Hg` ·
`Peak velocity, m/sec` · `AT, msec` · `EOA, cm²`.

**Notas al pie, literales:** «*AT*, Acceleration time of the prosthetic valve.» y
«Data are expressed as mean ± SD **or as median (IQR)**.»

**Recuento:** **12 modelos**, **26 filas de tamaño**, **82 celdas con dato**.

⚠️ **ESTA TABLA NO TIENE UNA SOLA FORMA DE CELDA, Y ES EL HALLAZGO DEL COMMIT 1.** Conviven
**cuatro**: media ± DE (`16 ± 5`, `18 ± 7.5`, `12 ± 1`), **mediana con rango intercuartílico**
(`11 (8-17)`, `20 (19-21)`, `98 (85-110)`), **valor único** (`2.2`, `1.73`, `93`) y **límite
superior** (`<25`, `<15`, `<2.5`, `<2.2`, `<2.4`). Más dos filas que imprimen **«No data»**. La
propia nota al pie declara las dos primeras; las otras dos no las declara y están impresas.
→ **P20-a**.

⚠️ **Y TIENE SUBTÍTULOS DE SECCIÓN POR TIPO**, al contrario de la A4: `Homograft`,
`Valved conduits`, `Bioprosthetic valves`, `Percutaneous pulmonary valves`,
`Percutaneous pulmonary valve native outflow` y `Mechanical valves`. El superíndice pegado al
nombre (`233`, `234`, `235`) es la **referencia bibliográfica** y no es parte del nombre, igual
que en la A3.

⚠️ **EL TAMAÑO TAMPOCO ES SIEMPRE UN NÚMERO**: hay rangos (`12-22`, `10-24`, `19-29`) y dos con
paréntesis (`16 (≤20)`, `18 (≤22)`). **Se guarda como texto.**

### 4c · Estructura de la Tabla A8 (tricúspide transcatéter)

**Columnas:** `n` · `ViV/ViR` · `Age, y` · `Mean gradient, mm Hg (mean ± SD)` · `EOA, cm²` ·
`Peak velocity, m/sec` · `PVL`. Nota: «*NR*, Not reported.»

**Una sola fila de referencia** (McElhinney et al.²⁰³, n = 306) con dos sub-filas por tamaño
(`≥29 mm` y `<29 mm`). **El EOA y la velocidad pico son «NR»** en las tres.

⚠️ **SU EJE NO ES «MODELO × TAMAÑO» SINO «REFERENCIA BIBLIOGRÁFICA × SITUACIÓN»**, exactamente
como la Tabla A6 que **P19-d** dejó afuera. Y la morfología tricúspide de la aplicación
**no tiene ninguna opción de implante transcatéter** (`vt_morf` ofrece plastia y T-TEER, pero
ningún ViV ni ViR). → **P20-b**.

### 4d · Estructura de la Tabla A9 (tricúspide quirúrgica)

**Está TRANSPUESTA**: los modelos son **columnas** y los parámetros, **filas**.

**Filas:** `Size, mm` · `PHT, msec` · `MG, mm Hg` · `E velocity, m/sec` · `VTI_TVP, cm` ·
`VTI_TVP/VTI_LVOT` · `EOA CON, cm²` · `iEOA CON, cm²/m²`.

**Notas al pie, literales:** «*CON*, Continuity equation; *iEOA*, indexed EOA; *MG*, mean
gradient; *VTI*, velocity-time integral; *TVP*, TV prosthesis.» y «Data are mean ± SD. Data for
mechanical and bioprosthetic TVs are from Blauwet et al.¹⁹²·²⁰²»

**Recuento:** **8 modelos**, **28 tamaños**, 7 parámetros = **196 celdas**, de ellas **190 con
dato** y **6 impresas «NA»**.

| bloque | modelo | tamaños |
|---|---|---|
| **Mechanical** | St. Jude Medical Standard | 27, 29, 31, 33 |
| | Carbomedics Standard | 31, 33 |
| | Starr-Edwards | 30, 32, 34 |
| **Bioprosthesis** | Medtronic Mosaic | 25, 27, 29, 31, 33 |
| | Carpentier Edwards Perimount | 29, 31, 33 |
| | Carpentier Edwards Duraflex | 27, 29, 31, 33, 35 |
| | St. Jude Biocor | 29, 31, 33 |
| | Medtronic Hancock II | 31, 33, 35 |

**Una sola forma de celda**: media ± DE, valor único, o «NA». **Es la tabla limpia de las tres.**

⚠️ **TRAE LA EOA INDEXADA DE LA PROPIA SERIE** (`iEOA CON`), que **no es** la «EOA indexada
predicha» que el componente calcula (EOA esperada ÷ ASC **del paciente**). Son dos números
distintos y la pantalla los nombra distinto: «EOA indexada esperada» la de la tabla, «EOA indexada
predicha» la calculada.

### 4e · Las dos tablas de obstrucción del cuerpo, transcritas

**Tabla 15** (hoja 32, folio 33) — dos columnas, `Normal` y `Possible obstruction`; tres filas,
`Qualitative`, `Quantitative*` y `Serial comparison with baseline`. Lo cuantitativo:

| parámetro | Normal | Possible obstruction |
|---|---|---|
| Peak velocity | < 3,2 m/s (bioprótesis) · < 2,5 m/s (homoinjerto) | ≥ 3,2 · ≥ 2,5 |
| Mean gradient | < 20 mm Hg (bioprótesis) · < 15 mm Hg (homoinjerto) | ≥ 20 · ≥ 15 |

Nota literal: «*Measurements assume normal RV stroke volume. Accurate CW Doppler may be
challenging because of the position of the homograft or bioprosthetic valve; important to use
off-axis parasternal and suprasternal views. Normal values for various prosthetic PVs are shown in
Appendix Table A7.»

**Tabla 19** (hoja 35, folio 36) — dos columnas, `Bioprosthetic` y `Mechanical`:

| parámetro | Bioprosthetic | Mechanical |
|---|---|---|
| Peak E velocity, m/sec | ≥ 2,1 | ≥ 1,9 |
| Mean gradient, mm Hg | ≥ 9 | ≥ 6 |
| PHT, msec | ≥ 200 | ≥ 130 |
| EOA, cm² | < 1,5 | < 2,0 |
| DVI (VTI_PrTV/VTI_LVOT)* | ≥ 3,3 | ≥ 2,1 |

Notas literales: «*VTI_PrTV*, VTI through the prosthetic TV.» y «*Assessed in the absence of AR or
TR. Upper limits of normal DVI vary by valve size and type.»

**Las dos coinciden fila por fila con lo que la aplicación ya aplica** (§ 1f).

### 4f · Lo que NO coincidió con el índice de la orden

1. El índice dice «**A7 a A9** traen valores esperados por modelo y tamaño de prótesis pulmonar y
   tricúspide». **La A8 no**: su eje es referencia bibliográfica × situación y dos de sus tres
   columnas numéricas son «NR».
2. El índice no anticipa que **la A7 mezcla cuatro formas de celda** ni que trae **límites
   superiores sin tamaño** (homoinjerto, conductos y bioprótesis genéricas).
3. El índice no anticipa que **la A9 está transpuesta** ni que trae la **EOA indexada** del propio
   estudio.
4. El índice dice que «la Tabla 7 NO da cortes de EOA indexada para tricúspide ni pulmonar».
   **Confirmado**, y por eso rige la decisión 6.
5. El índice supone que hay que **medir si la app gradúa prótesis tricúspide o pulmonar con cortes
   de válvula nativa** (commit 7). **Medido: no.** Usa las Tablas 19 y 15 de prótesis, con sus
   valores idénticos a los leídos en imagen. **No hay nada que reportar como defecto.**
6. **En Referencias no existe ninguna ficha de prótesis pulmonar ni tricúspide.** La sub-pestaña
   `ref-protesicas` tiene **cinco** fichas: Prótesis Aórtica (ESC 2021), Prótesis Mitral
   (ESC 2021), Trombosis vs Pannus, Valve-in-Valve y Endocarditis Protésica (ESC 2023).
