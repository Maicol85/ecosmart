# Tanda 3A — el Valsalva del grado III, los cuatro tramos del strain del VD, y el cor triatriatum

Mapa de la tanda **3A** (2026-11-17). Como todos los de esta carpeta, va **por nombre de función y
de constante y no por número de línea**: la línea cambia en cada edición, el nombre no.

---

## 1 · El Valsalva del grado III — el dueño único

| qué | quién |
|---|---|
| el valor, saneado (`si`, `no` o cadena vacía) | `_diastValsVal` |
| la cláusula del **paréntesis del informe** | `diastValsPatron` → `DIAST_VALS_PATRON` |
| la cláusula del **EN SUMA** | `diastValsSuma` → `DIAST_VALS_SUMA` |
| los dos textos de la **sugerencia** | `DIAST_VALS_SUG` |
| habilitar, limpiar y pintar la sugerencia | `diastValsalvaSync` |
| el selector | `#diast_valsalva`, en la celda de `#diast_ritmo` |
| la sugerencia | `#diast-valsalva-sug`, debajo de `#dd-interp` |
| el globo | `VINFO['diast-valsalva']` |

**Las dos redacciones NO son la misma cadena, y es a propósito:** el informe dice «patrón
restrictivo **fijo, no modificable con Valsalva**» y el EN SUMA «grado III **fijo (no modificable
con Valsalva)**». Son las dos que fijó Maicol, cada una escrita para el lugar donde se lee.

**Cuándo aplica.** `clave === 'g3'`, que es el grado III **tanto de la ASE 2025 como de la
ASE/EACVI 2016** —el mismo identificador en las dos—. En fibrilación auricular no aplica, y la
**BSE 2024 no tiene grados**: medido, sus tres categorías son «normal para la edad», «deteriorada
con presión normal» y «deteriorada con presión elevada», y el archivo lo declara al lado de
`BSE_FRASE`. Por eso **no se la tocó**.

⚠️ **La limpieza tiene una guarda, y es la lección de las referencias que conservaban el resultado
del valor viejo.** `window._diastResult` publica ahora también su `clave`, su `algoritmo` y su
`ritmo`, y `diastValsalvaSync` limpia **únicamente** si ese resultado coincide con el protocolo y
el ritmo actuales. Sin coincidencia no toca nada: el valor del médico se conserva.

⚠️ **El sync cuelga de la envoltura de `calcDiastol` y NO de `RECALC_MODULOS`** — ver
`docs/PENDIENTES.md` → **P3A-f** para el costo. La cláusula se emite **sólo** en la rama de grado
III, así que un estado habilitado atrasado no puede escribir un informe equivocado.

⚠️ **El selector NO llama a `calcDiastol`:** no mueve ningún veredicto ni ningún conteo, sólo cómo
se redacta el grado III. Su `onchange` refresca el informe y nada más.

### Las frases, por algoritmo

- **ASE 2025** (`diastASE2025Evaluar`): cambian `g3`, `g2`, `g1` y `normal`. El `normal` queda en
  **una sola oración** sin conteo. Los indeterminados, los datos insuficientes, el «no estimable»,
  el «presión elevada sin E/A» y el «presión normal sin grado» **conservan su frase**.
- **ASE/EACVI 2016** (`diastASE2016Evaluar`): cambia **sólo** el `g3`, y **sin conteo**, porque esa
  rama llega por el **atajo `E/A ≥ 2`**, o sea antes de contar los tres criterios de la Figura 8B.
  El conteo sigue en la ventana 🧭. Sus otras nueve frases no se tocaron
  (`docs/PENDIENTES.md` → **P3A-i**).
- **BSE 2024** y **fibrilación auricular**: sin cambios.

**La relación E/A se conserva en las tres frases que la traían** (decisión de Maicol). Lo que salió
es la **enumeración** de qué parámetros dieron positivos y el **operador** del corte.

### Los esquemas

La notita `a25.vals` (plano `A25_PLANO_F3`) y `a16b.vals` (plano `A16B_PLANO`), las dos con
`app: true` —que es la marca que el motor traduce a la clase `n-app` y a `stroke-dasharray`— y con
su arista desde la caja de grado III. **La 8A no la lleva: ese algoritmo no gradúa.** No entran en
el camino rojo ni en la tabla compacta.

### El IIIa / IIIb

Se fue **una sola frase**, la de la rama `g3` de la ASE 2025. Censado después: las **19**
apariciones que quedan son el **Carpentier de la mitral** —otra clasificación con el mismo
nombre— y **no se tocan**. Lo fija TC-927 con su control.

---

## 2 · El strain de pared libre del VD — los cuatro tramos

| qué | quién |
|---|---|
| los tres cortes | `VD_STRAIN_PL_NORMAL` (20), `VD_STRAIN_PL_LEVE` (15), `VD_STRAIN_PL_MOD` (11) |
| el corte de normalidad del módulo de Deformación | `VD_STRAIN_NORMAL` (−20), vigilado por un assert |
| el clasificador | `vdStrainPlCat` → `normal` · `leve` · `moderada` · `severa` |
| los cuatro rótulos | `VD_STRAIN_PL_TXT`, **exportado** porque lo lee el emisor del informe |
| la fila del cuadro de referencias | `vdStrainPlSync` → `#vd-strain-interp` |
| el OR de la disfunción | `vdDisfPresente`, por la **negativa** (`!== 'normal'`) |
| las fichas | `FUN-VD-007` (normalidad) y `FUN-VD-008` (los tres tramos), las dos de **guía** y verificadas |
| el globo | `VINFO['vd-strain-pl']` |

⚠️ **Los cuatro tramos son de la Tabla 1 de la ASE 2025, y el archivo afirmaba lo contrario en
CUATRO lugares.** Ver `docs/fuentes/FUENTES.md` → «La tanda 3A» para la transcripción con su folio
comprobado en el pie. `FUN-VD-008` pasó de «criterio propio de EcoSmart / por verificar» a guía
verificada, así que sus filas salen **con corchete**.

**El informe firmado gradúa moderada y severa**, y el grado sale del **mismo registro** que la
pantalla. Lo que no cambió, y está declarado en **P3A-c**: si `vdDisfGrado(tapse, sp)` dio un
grado, ese manda.

---

## 3 · El cor triatriatum

`VINFO['otr-cortri']`, con el botón **fuera** del `<label>` de la casilla `otr_var_cortri` —ese
label envuelve el checkbox, así que un botón adentro lo marcaría al tocarlo— en una fila flex
propia. Es el **primer ⓘ de una celda de variante**. Dos mitades, Gurvitz y Puchalski, las dos
leídas en el PDF por esta sesión; el `>15 mmHg` va con el encuadre de la guía —«umbral propuesto
previamente»— y la aplicación **no gradúa** el cor triatriatum ni publica criterio de reparación.
**Sin clasificación por tipos.**

---

## 4 · Los dos globos de prótesis, y el HCM

- **`VINFO['prot-gmed']`** declara el solapamiento de la Tabla 11 con la Tabla 12. La **lógica ya
  estaba** desde el Z6-2; lo que faltaba era decirlo en pantalla.
- **`VINFO['tavi-pvl-ext']`**, en el campo `ete_tavi_ext_circ`. Los **tres grados ya existían** en
  `eteTaviRPV` desde la PRO-B3. **No se le pone a la fuga de la prótesis quirúrgica**: la VARC-3 es
  un documento de TAVI.
- **El HCM**: `mch_ex_reduccion` queda como «Miectomía previa» y **conserva su id** —de él cuelga
  su columna de Excel—; `mch_ex_alcohol` es nuevo y **no es una exclusión**. Su salvedad tiene un
  dueño único, `_mchAlcoholNota`, que leen el informe, el EN SUMA y el resumen del Laboratorio.

---

## 5 · La clase de los ⓘ

Cada globo nuevo toma la clase de **su vecino inmediato**, medido en el navegador:
`vd-strain-pl` y `tavi-pvl-ext` llevan **`vinfo-btn-44`** (como `vd-tei` y `tavi-calc`);
`diast-valsalva` y `otr-cortri` van **planos** (como `tarj-diast` y `otr-rac`). El CSS del archivo
lo declara: **15×11 a 17×13 px con el mouse es el estándar**, y los 44×44 salen de
`@media (pointer: coarse)`.

---

## 6 · La cobertura

**TC-921** el strain · **TC-922** los dos globos · **TC-923** el Simpson y el HCM, una condición
por superficie · **TC-924** el cor triatriatum · **TC-925** las frases · **TC-926** el EN SUMA, el
selector y la sugerencia · **TC-927** los esquemas y el IIIa/IIIb.
Los siete caen **0/7** contra `e24a81c` y **ninguno por excepción**.
Doce casos adaptados, **siete invertidos**. La sonda de dos motores:
`scripts/_probe_3a.mjs` con su cuerpo en `scripts/_probe_3a_cuerpo.js`.
