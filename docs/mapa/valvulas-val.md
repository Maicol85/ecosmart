# Mapa — la tanda «VAL»: las válvulas NATIVAS alineadas a las guías (2026-10-17)

Qué cubre: los **cinco parámetros** que esta tanda movió y las **dos cosas de texto** que cerró.
Nada de esto toca prótesis, función diastólica, HFA-PEFF, AI, VI, VD, AD, VCI ni aorta.

> **Regla que gobierna toda la tanda:** si dos guías chocan manda la **más nueva**; si la más
> nueva no trae ese dato, se usa la anterior. Cada corte de abajo se verificó **viendo el PDF
> original** —tabla o figura, folio impreso y hoja—; lo que está en `docs/fuentes/FUENTES.md`.

---

## 1 · Tabla de cortes: antes / ahora / operador / fuente

| parámetro | antes | ahora | fuente (tabla · folio · hoja) |
|---|---|---|---|
| ET — gradiente medio | `≥ 5` mmHg | **`> 5`** mmHg | ESC/EACTS 2025 §12.2 · folio 4688 · hoja 54 |
| ET — THP | criterio que **vota** (`≥ 190` ms) | **signo de apoyo**, no decide (mismo corte) | ASE 2023 Key Points · folio 16 · hoja 14 |
| ET — área valvular | `≤ 1` cm² | **sin cambio** | EAE/ASE 2009 Tabla 10 · folio 19 · hoja 19 |
| ET — VTI de entrada | `≥ 60` cm | **sin cambio** | ASE 2023 · folio 16 · hoja 14 |
| EAo — AVA, techo de moderada | `< 1,5` cm² | **`≤ 1,5`** cm² | EAE/ASE 2009 Tabla 3 · folio 10 · hoja 10 · y ESC/EACTS 2025 nota ^c · folio 4671 · hoja 37 |
| EAo — AVA, borde de severa | `≤ 1,0` cm² | **sin cambio** (reportado) | ESC/EACTS 2025 · folio 4670 · hoja 36 |
| IAo — fracción regurgitante | `≥ 50` % | **`> 50`** % | ESC/EACTS 2025 Figura 4 · folio 4659 · hoja 25 |
| IM — onda E (apoyo) | `≥ 120` cm/s | **`> 120`** cm/s | ASE 2017 Tabla 8 · folio 332 · hoja 30 · y ESC/EACTS 2025 Figura 10 · folio 4672 · hoja 38 |
| IM — cociente VTI, compuerta de IAo | se retira con IAo **severa** | se retira desde IAo **moderada** | ASE 2023 Key Points · folio 12 · hoja 10 |
| IM — jet/AI (20 y 40 %) | «sin fuente» | **ACC/AHA 2020 Tabla 17** · folio e121 · hoja 50 | el número **no cambia** |

⚠️ **Ningún otro corte, operador ni regla de integración se movió.** El Excel queda en **440
columnas** con el mismo juego de claves y, en el control negativo, con **cero valores distintos**.

---

## 2 · Estenosis tricuspídea — el dueño y las tres piezas nuevas

**Dueño único: `etEstado()`.** Todo lo demás lo lee de ahí.

- `ET_CRIT` es la única tabla de cortes, bandas y operadores. Cada entrada tiene además un
  **`corto`** —«área valvular», «gradiente medio», «VTI de entrada», «THP»— y el THP lleva
  **`apoyo: true`**, que es lo único que lo distingue.
- `signif = cGm || cAvt || cVti` — **el THP salió del `some`**. Se sigue calculando (`cThp`): lo
  necesitan la fila del cuadro y el informe.
- **`r.criterio`** es el criterio que DECIDE. Precedencia **área → gradiente medio → VTI de
  entrada**, que es el orden del enunciado de la regla. Es un **desempate**, no una cascada: el
  veredicto sigue siendo un OR y basta con que se cumpla uno.

### Dónde se ve el criterio que decide
| superficie | cómo |
|---|---|
| badge `#et-sev` | `Significativa — por <corto>` |
| informe (3 estilos) | `estenosis significativa (por <criterio> <valor>; <los demás>)` |
| vista 2D, línea «Decide» | lee `#et-sev` con `decideModo: 'sufijo'` — **sin mecanismo nuevo** |
| Laboratorio | lee el **token** `ET_SIGNIF_TXT` del grado guardado |

⚠️ **El formato del badge NO es libre.** `_v2dDecide` lo reconoce por el sufijo `— por `; si
cambia, la tarjeta de la vista 2D se queda sin su línea «Decide» y nada lo señala.

### El aviso de la insuficiencia tricuspídea (`#et-it-aviso`)
- **No cambia ningún veredicto.** Lo escribe `etItAvisoSync`, que no toca `etEstado`.
- **Compuerta:** que HAYA área calculada (`#et_avt` con valor) **y** `it_grado ≥ 2`.
  Falla **abierto** (un grado ilegible muestra el aviso): el aviso no quita ni agrega severidad.
- **Texto:** «Con insuficiencia tricuspídea mayor que leve el área por continuidad queda
  subestimada (EAE/ASE 2009, Tabla 10, nota).»
- **Color `--orange`**, medido `rgb(245,158,66)`. ⚠️ **No `--amber`**, que sólo existe dentro de
  `.amilo-root` y acá se vería gris — la trampa que este repo ya pagó cinco veces.
- **Las tres columnas:** lo pinta `calcET`, lo repone `RECALC_MODULOS` (vía `calcET`) y el
  barrido `[id$="-aviso"]` de `limpiarCampos` le vacía el texto. ⚠️ Su insumo `#it_grado` vive en
  la misma pestaña y su `onchange` va a `valvSev.aplicar`, **no** a `calcET`: hace falta un
  **oyente de documento**, el mismo que `vdTeiAvisoSync` ya tiene para ese campo.

### Consecuencia declarada: `etGradoCalculado` con el THP SOLO
`thpOk` salió de su guarda. Con el THP como único dato medido el grado calculado es **`null`** y
no «No significativa»: afirmar sobre un signo de apoyo sería publicar un veredicto que la regla
nueva no sostiene, y después el aviso rojo lo nombraría.

---

## 3 · Estenosis aórtica — el techo de la banda moderada

- **`AVA_MOD_MAX = 1.5`** es el dueño; **`EA_BANDAS.avaSinMin` se DERIVA de él**. Se declara al
  lado de `AVA_SEVERA_MAX` y no dentro de `EA_BANDAS` porque `avaEsModerada` vive ~15.000 líneas
  antes que esa tabla: un `const` nombrado desde arriba caería en su zona muerta.
- `avaEsModerada`: `> AVA_SEVERA_MAX && <= AVA_MOD_MAX`. La cascada de `eaGradoCalculado` entra a
  `'sin'` con **`> avaSinMin`**. Las dos mitades se mueven juntas o el 1,5 cae en las dos.
- **Seis rótulos** publicaban ese borde y se movieron con él: los dos badges de pantalla
  (`cxAVT` y el recuadro Doppler), el cuadro de referencias del Doppler, la fila de «Referencia
  clínica» y **las DOS referencias impresas del PDF**, que decían «>1.0–1.49».
- ⚠️ **El AVA por PLANIMETRÍA se mueve con esto, y es correcto:** `_eaCritPlan` usa el MISMO
  `avaEsModerada`. Es la banda del **área**, no la del método.
- ⚠️ **El borde de 1,0 se verificó y NO se tocó.** Las dos guías se contradicen ahí: EAE/ASE 2009
  escribe severa `<1.0` y ESC/EACTS 2025 «AVA ≤1.0 cm²». La app aplica `≤ 1,0` → severa, que es
  la guía más nueva y el lado que no suaviza.

⚠️ **Al medir el borde de 1,5 hay que apagar el DVI.** El DVI es `AVA / área del TSVI`, así que
con un Ø TSVI de 20 mm un AVA de 1,5 da un DVI de 0,477 y el DVI vota moderada **por su cuenta**:
los dos lados del borde salen «moderada» y el corte parece no haberse movido. Con Ø 19 mm el DVI
queda en 0,53 (> 0,50) y se abstiene.

---

## 4 · Insuficiencia aórtica — la fracción regurgitante

- Las tres bandas quedan `< 30` leve · `30 ≤ fr ≤ 50` moderada · `> 50` severa. El tramo de
  moderada es el **complemento exacto**: con `< 50` arriba y `> 50` abajo el 50 no caería en
  ninguna y el parámetro dejaría de votar en silencio.
- Se compara el valor **PUBLICADO** (`frNum.toFixed(0)`), igual que antes: el número que vota es
  el que el médico tiene delante.
- La fórmula (`VolR / VSV`) y el resto de la IAo no cambian. El VTI del reverso en aorta
  descendente (`≥ 20 cm/s`) no se tocó.

⚠️ **Las unidades de los campos del PISA aórtico son las que declara su banda:** radio en **mm**
`[1,30]`, Valiasing en **cm/s** `[5,150]`, Vmax CW en **m/s**, VTI del jet en **cm** `[20,500]`.
Con el radio o la Vmax fuera de banda la fila publica «revisar la unidad de los insumos del PISA»,
la FR **no se calcula** y los tres bordes salen idénticos en los dos árboles — un denominador
vacío con pinta de «el corte no se movió».

---

## 5 · Insuficiencia mitral — la onda E y el cociente VTI

**Onda E.** `UMBRAL_ONDA_E_APOYO_IM` no cambió de valor (120 cm/s); cambió el **operador**.
Sigue **sin votar**: es un signo de apoyo y no entra en ningún `scores`. Lo que se mueve es la
frase de una fila de pantalla y el rótulo en **cuatro superficies** (el rótulo del campo, la fila
de «Referencia clínica», la tarjeta ⓘ y el manual).
⚠️ **La ASE 2017 se contradice consigo misma** y las dos mitades están impresas: el cuerpo del
folio 330 escribe «usually ≥1.2 m/sec» y la **Tabla 8, folio 332** escribe «(>1.2 m/sec)». La
desempata la ESC/EACTS 2025, que escribe `>` en su Figura 10.

**Cociente VTI mitral/TSVI.** `IM_RATIO_IA_MAX_NAT` pasa de **4 a 2**, así que los dos regímenes
—nativo y protésico— se retiran desde la IAo **moderada**. Con eso quedaron **inalcanzables**
`IM_RATIO_IA_MOD_MIN` y `IM_RATIO_IA_MOD_TXT`, y se fueron: una cadena viva sin consumidores es
la que la próxima lectura cree que gobierna algo.
⚠️ **Tres superficies describían la divergencia y se reescribieron:** la nota del panel de
Evidencia, la fila de «Salvedades de los parámetros de apoyo» de Referencia clínica y el manual.
Una nota que describe una regla derogada es peor que ninguna.
⚠️ **El `≥ 2,5` protésico NO se tocó.** Lo que coincide ahora es la COMPUERTA de la IAo, que en
la prótesis ya era moderada.

---

## 6 · Las dos cosas de texto

**(a) La cita del jet/AI.** Los cortes nativos 20/40 figuraban como «sin fuente». La mitad que
seguía siendo cierta es que **no son de la ASE 2017** (esa guía publica `>50 %`). La fuente es
**ACC/AHA 2020, Tabla 17 «Stages of Chronic Primary MR», folio e121, hoja 50**: estadio A
`<20 % LA`, estadio B `20 %–40 % LA`, estadios C y D `>40 % LA`. **Ningún número cambió.**
⚠️ **Esa tabla publica ESTADIOS (A, B, C-D) y no grados**, y la app los mapea a su vocabulario de
tres. Queda declarado.

**(b) El texto general de integración.** Va **SÓLO** al final de la sección de válvulas nativas
de la pestaña **Referencias** (`#ref-integracion`, dentro de `#ref-nativas`), en letra chica, con
`--text2` —medido `rgb(154,163,188)` de noche y `rgb(91,100,120)` de día—. Es marcado
**estático**: no se recalcula, no se limpia y no viaja con el estudio.
**No** está en el bloque de integración de Válvulas, ni en las estenosis, ni en el informe, el PDF
o el PPT: el papel afirma y no explica.

---

## 7 · Trampas de esta tanda

1. **El 5,0 exacto y el THP solo son DOS cambios distintos y se mezclan.** En la tabla de 36
   escenas, seis cambian de veredicto: cuatro por el operador del gradiente y dos porque el THP
   dejó de votar. Separarlas exige que la escena declare el valor de los CUATRO parámetros.
2. **El DVI tapa el borde del AVA** (§3). Con el Ø del TSVI mal elegido los dos lados dan
   «moderada» y el corte parece no haberse movido.
3. **Las unidades del PISA aórtico** (§4): con el radio en cm o la Vmax en cm/s la FR no se
   calcula y la escena mide un denominador vacío.
4. **`VINFO` es un `const` de módulo y no una propiedad de `window`**: la cita de una tarjeta ⓘ
   se lee abriendo el globo REAL, no desde `window.VINFO`.
5. **El `\s` dentro del template de una sonda se cocina a la letra `s`** y borra todas las eses
   del texto medido: «Las guías piden integrar varios parámetros» salió «La guía piden integrar
   vario parámetro». Va con **doble barra en el ARCHIVO**.
6. **Los insumos del área tricuspídea viven en la pestaña VD** (`tsvd_diametro`, `vti_tsvd`): sin
   abrir esa pestaña el tecleo no ocurre y la escena mide el paciente anterior. La sonda **aborta**
   nombrando el campo, que es lo correcto.
7. **`_labValvBin` devuelve un objeto indexado por VÁLVULA**: tomar `Object.keys(b)[0]` da la
   **MITRAL** (índice 1) y no la tricúspide (índice 5). Se lee por `LAB_VALV_BIN.et.i`.

---

## 8 · Qué quedó declarado y no tocado

Está en `docs/PENDIENTES.md` → **VAL-1 a VAL-7**.
