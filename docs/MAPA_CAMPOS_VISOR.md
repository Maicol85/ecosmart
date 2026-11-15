# MAPA_CAMPOS_VISOR — cada fila de medida del visor y su campo del informe

Tanda **MEDIR-4**, bloque 0 punto (g). Medido sobre el árbol `a3a75a7` (sello `v20261114-2057`,
md5 `6545b13e`, 182.292 líneas), **leyendo el archivo** y verificando cada id con
`grep -n 'id="<id>"' index.html`. Ninguna correspondencia se inventó.

> ⚠️ **ESTE ARCHIVO ES LA ÚNICA FUENTE DEL BLOQUE F.** La casilla «A la app» de una fila sale de
> acá y de ningún otro lado. Una fila que acá diga «sin campo» **no lleva casilla activa**, por
> más que exista un campo que parezca medir lo mismo: decidir que dos magnitudes son la misma es
> contenido clínico, y en esta casa eso se reporta y se espera.

---

## 1 · De dónde sale la correspondencia, y por qué no de un mapa nuevo

El visor **ya declara** qué fila equivale a qué campo del formulario, en dos tablas:
`_D2_BANDA_DE` (cajón 2D) y `_DOP_BANDA_DE` (cajón Doppler). No son tablas de estilo: son la
lista de los campos cuya **banda de plausibilidad se presta**, y la regla que las gobierna
—escrita en sus propios comentarios— es exactamente la que hace falta acá:

> «LAS BANDAS SE PRESTAN SÓLO DONDE LA PREGUNTA ES LA MISMA. … Prestar la banda de un campo que
> contesta OTRA pregunta es peor que no tener banda: rechaza mediciones legítimas y lo hace en
> silencio.»

O sea que cada entrada de esas dos tablas es una afirmación ya tomada y ya verificada de que la
fila del visor y el campo del formulario **miden lo mismo**. Tres de ellas se tuvieron que sacar
en su momento después de haberlas escrito, con el caso que las desmintió anotado al lado. Un mapa
nuevo escrito para esta tanda sería una segunda opinión sobre la misma pregunta, y el día que una
de las dos cambie quedarían en desacuerdo sin que nada lo delate — el patrón de «dos dueños del
mismo valor» que este archivo persigue desde el Diam TSVI.

**Por eso el mapa de abajo no agrega ni una correspondencia nueva.** Lo que hace es:

1. tomar las de `_D2_BANDA_DE` y `_DOP_BANDA_DE`;
2. verificar que el id exista de verdad como control del formulario;
3. leer su **rótulo impreso** y su unidad del marcado;
4. anotar como **candidato no cableado** —sin casilla— lo que tiene un campo plausible que esas
   dos tablas **no** declaran, con el motivo.

---

## 2 · Las tres puertas de escritura que ya existen

El Bloque F no crea dueños: reusa éstas.

| puerta | qué escribe | eventos que emite |
|---|---|---|
| `medVtiDiametro(rol)` | `diam_tsvi` (rol `tsvi`) o `tsvd_diametro` (rol `tsvd`) | `input` |
| `medVtiCargar()` | `itv_tsvi` y `vti_tsvd` | `input` |
| `_simpEscribirFEVI(fevi)` | `fevi` + pone `fevi_met` en «Simpson biplano» | `input` y `change` |

⚠️ **LAS DOS PRIMERAS EMITEN SÓLO `input` Y LA TERCERA LAS DOS.** Tipear a mano dispara `input`
por tecla y `change` al salir del campo, así que **la forma fiel es emitir las dos** — es lo que
hace `_simpEscribirFEVI`. Hoy la diferencia no muerde porque `diam_tsvi`, `tsvd_diametro`,
`itv_tsvi` y `vti_tsvd` no tienen `onchange`; **cuatro campos del mapa sí lo tienen**
(`onda_e`, `e_sep`, `e_lat`, `vci_diam`), así que una puerta que emitiera sólo `input` dejaría
sin correr `cvrCambio()` y `dptSync();cvrSync();vexusRefrescarInforme()`.

---

## 3 · El mapa — cajón 2D (herramienta Distancia)

Las filas las reparte `_D2_FILAS_DE`, el dueño único. Rótulo del visor: `_D2_ROT`.
Todas las filas medidas del cajón 2D están en **mm**, y los quince campos que les corresponden
también — **no hay una sola conversión de unidad en este cajón**.

| clave | nombre en el visor | tabla | unidad | campo del informe | rótulo impreso del campo | banda |
|---|---|---|---|---|---|---|
| `vi.sivd` | SIVd | VI | mm | **`siv`** | SIV (mm) | [3–35] |
| `vi.ddvi` | DDVI | VI | mm | **`ddfvi`** | DDFVI (mm) | [20–100] |
| `vi.ppd` | PPd | VI | mm | **`ppvi`** | PPVI (mm) | [3–35] |
| `vi.sivs` | SIVs | VI | mm | — *sin campo* | — | fija [3–60] |
| `vi.dsvi` | DSVI | VI | mm | **`dsfvi`** | DSFVI (mm) | [10–90] |
| `vi.pps` | PPs | VI | mm | — *sin campo* | — | fija [3–60] |
| *(derivada)* | Engrosamiento SIV | VI | % | — *la app no lo calcula* ⚠️ | — | — |
| *(derivada)* | Engrosamiento PP | VI | % | — *la app no lo calcula* ⚠️ | — | — |
| `vd.basal` | VD basal | VD | mm | **`vd_bas`** | VD basal (mm) | [10–70] |
| `vd.medio` | VD medio | VD | mm | **`vd_mid`** *(candidato)* | VD medio (mm) | fija [3–120] |
| `vd.longit` | VD longitudinal | VD | mm | **`vd_long`** *(candidato)* | VD longitudinal (mm) | fija [3–120] |
| `vd.tapse` | TAPSE | VD | mm | **`tapse`** | TAPSE (mm) | [3–40] |
| `vd.tsvd` | Diam TSVD | VD | mm | **`tsvd_diametro`** | Diám. TSVD (mm) | [5–50] |
| `ao.sinusal` | Senos de Valsalva | Aorta | mm | **`ao_sin`** | Ao sinusal (mm) | [10–90] |
| `ao.sinotub` | Unión sinotubular | Aorta | mm | **`ao_st`** | Ao sinotubular (mm) | [10–80] |
| `ao.tubular` | Aorta tubular | Aorta | mm | **`ao_tub`** | Ao tubular (mm) | — |
| `ao.cayado` | Cayado | Aorta | mm | — *sin campo* | — | fija [3–120] |
| `ao.descend` | Torácica descendente | Aorta | mm | — *sin campo* | — | fija [3–120] |
| `ao.abdominal` | Aorta abdominal | Aorta | mm | — *sin campo* | — | fija [3–120] |
| `vi.tsvi` | Diam TSVI | Aorta | mm | **`diam_tsvi`** | Diám. TSVI (mm) | [5–45] |
| `ai.dap` | DAP | AI | mm | **`ai_diam`** | Diámetro AP (mm) | [10–90] |
| `vci.vci` | VCI | VCI | mm | **`vci_diam`** | *(sin label propio; marcador «mm»)* | [2–50] |

**Sin campo, verificado uno por uno con `grep`:** no existen `sivs`, `pps`, `ao_cayado` ni
`ao_desc` como control en todo el archivo. Los espesores **sistólicos** y los tres segmentos
distales de la aorta **no tienen dónde ir**, y es por eso que su banda es fija y no prestada.

⚠️ **`vd_mid` Y `vd_long` SON CANDIDATOS Y NO CORRESPONDENCIAS CABLEADAS.** Los dos campos
existen, con el rótulo idéntico a la fila del visor, pero `_D2_BANDA_DE` **no los declara**, y su
comentario dice por qué: la banda de `vd_bas` «RECHAZA una medición normal» en el longitudinal
—que llega a 86 mm— y el medio «es otra dimensión de la misma cavidad». Eso habla de la **banda**,
no de la identidad de la magnitud, así que el campo probablemente SÍ es el que corresponde. **No
se cablea solo:** queda como pregunta para el médico (**M4-?**).

⚠️ **LOS DOS ENGROSAMIENTOS NO TIENEN CAMPO Y TAMPOCO LOS CALCULA LA APP.** Son derivados **del
visor** (`_d2Derivados` → `_d2FEP`) y el formulario no tiene ni el campo ni el cálculo: no hay
ningún `id` de engrosamiento parietal en el archivo. Así que su celda **no puede decir «la app lo
calcula»** —sería falso— y tampoco «sin campo» a secas. Van sin casilla, con la leyenda del
`f[7]` de MEDIR-3.

---

## 4 · El mapa — cajón Doppler

| clave | nombre en el visor | grupo | unidad | campo del informe | rótulo impreso del campo | banda |
|---|---|---|---|---|---|---|
| `ao.vmax` | Vmax VAo | Aórtica | m/s | **`vmax_ao`** | Vmax aórtica (m/s) | [0,5–8] |
| `ao.gradMedio` | Grad Medio | Aórtica | mmHg | **`gmedio_ao`** *(candidato)* | G. medio (mmHg) | — |
| `ao.vtiAo` | VTI VAo | Aórtica | cm | **`itv_ao`** *(candidato)* | VTI VAo (cm) | — |
| `ao.vtiTsvi` | VTI TSVI | Aórtica | cm | **`itv_tsvi`** | VTI TSVI (cm) | [2–60] |
| `ao.diam` | Diam TSVI | Aórtica | mm | **`diam_tsvi`** | Diám. TSVI (mm) | [5–45] |
| `ao.pht` | THP IAo | Aórtica | ms | **`ia_pht`** | THP (ms) | — |
| `mit.ondaE` | Onda E | Mitral | cm/s | **`onda_e`** | Onda E (cm/s) | [10–250] |
| `mit.ondaA` | Onda A | Mitral | cm/s | **`onda_a`** | Onda A (cm/s) | [5–250] |
| `mit.ePrimaSept` | e′ septal | Mitral | cm/s | **`e_sep`** | e′ septal (cm/s) | — |
| `mit.ePrimaLat` | e′ lateral | Mitral | cm/s | **`e_lat`** | e′ lateral (cm/s) | — |
| `mit.vmaxIm` | Vmax IM | Mitral | m/s | — *sin campo declarado* | — | — |
| `mit.vtiVm` | VTI VM | Mitral | cm | — *sin campo declarado* | — | — |
| `mit.vtiIm` | VTI IM | Mitral | cm | — *sin campo declarado* | — | — |
| `mit.gradMedioVm` | Grad Medio VM | Mitral | mmHg | — *sin campo declarado* | — | — |
| `mit.pht` | THP VM | Mitral | ms | — *sin campo declarado* ⚠️ | — | — |
| `tri.vmaxIt` | Vmax IT | Tricúspide | m/s | **`vmax_it`** | *(marcador «m/s»)* | [0,5–8] |
| `tri.vmaxEt` | Vmax ET | Tricúspide | m/s | — *sin campo declarado* | — | — |
| `pul.vmaxIp` | Vmax proto-diast. IP | Pulmonar | m/s | **`ip_vmax`** *(candidato)* | — | — |
| `pul.vmaxIpTd` | Vmax telediastólica IP | Pulmonar | m/s | **`ip_vtd`** *(candidato)* | — | — |
| `pul.vmaxEp` | Vmax pulmonar | Pulmonar | m/s | **`vp_vmax`** | Vmax pulmonar (m/s) — Estenosis | [0,2–8] |
| `pul.tap` | TAP | Pulmonar | ms | — *sin campo declarado* | — | — |
| `pul.diamTsvd` | Diam TSVD | Pulmonar | mm | **`tsvd_diametro`** | Diám. TSVD (mm) | [5–50] |
| `pul.vtiPul` | VTI Pulmonar (TSVD) | Pulmonar | cm | **`vti_tsvd`** | VTI TSVD (cm) | [2–60] |
| `gen.*` | Velocidad · Gradiente · Tiempo · FC · VTI | sin asignar | varias | — *genéricas, sin campo* | — | — |
| *(derivadas)* | E/A · E/e′ · PSAP · AVA · AVAi · AVM · Grad Máx · Vol Eyectivo VD | — | varias | — *las calcula el informe* | — | — |

⚠️ **`mit.pht` TIENE UN CAMPO QUE NO ES EL SUYO, Y ESO ESTÁ MEDIDO.** `_DOP_BANDA_DE` lo declara
explícitamente retirado: «`mit.pht` con la banda del PHT aórtico [50–1500] — una válvula mitral
normal tiene un tiempo de hemipresión de 30 a 60 ms». `ia_pht` es el THP de la **insuficiencia
aórtica**: mandar ahí el THP mitral escribiría una magnitud en el campo de otra. Va **sin
casilla**.

⚠️ **`pul.vmaxIp` E `ip_vtd` SON LOS HOMÓLOGOS QUE `M3-b` YA NOMBRA**, y sus rótulos del visor son
«LOS DE LA APP, palabra por palabra» según el comentario de `_DOP_ROT`. O sea que la identidad
está declarada en el archivo aunque la banda no, porque esos dos campos **no tienen rango en
`DCM_RANGO` ni en `CHM_RANGO`** y no hay nada que prestar. Quedan como candidatos.

---

## 5 · El mapa — la tabla del FAC del VD y el Simpson

| fila | tabla | unidad | campo del informe | qué corresponde |
|---|---|---|---|---|
| Área VD telediastólica | `vdfac` | cm² | **`vd_area_d`** | Área VD telediastólica (cm²) |
| Área VD telesistólica | `vdfac` | cm² | **`vd_area_s`** | Área VD telesistólica (cm²) |
| FAC VD (%) | `vdfac` | % | **`vd_fac`** — **la app lo calcula** | `readonly`, rótulo «FAC VD (%) auto ← áreas»; lo escribe `calcVD()` |
| VFD de una ventana | Simpson | mL | — *monoplanar: la app no tiene el método* | ver abajo |
| VFS de una ventana | Simpson | mL | — *ídem* | — |
| FEVI de una ventana | Simpson | % | — *ídem* | — |
| **VFD biplano** | Simpson | mL | **`vdfvi`** | VDFVI (ml) |
| **VFS biplano** | Simpson | mL | **`vsfvi`** | VSFVI (ml) |
| **FEVI biplano** | Simpson | % | **`fevi`** + `fevi_met` | FEVI (Simpson, %) |
| VFD/VFS indexados | Simpson | mL/m² | — **la app los calcula** | `vdfvi-idx-interp` y `vsfvi-idx-interp`, dos `span`, no campos |

**`fevi_met` es un `select` con exactamente tres opciones**, leídas del marcado: «Simpson
biplano», «Teicholz», «Visual». **No hay monoplanar**, que es la razón ya escrita en
`_simpEscribirFEVI` de por qué una FEVI de una sola ventana no se integra: saldría en el informe
firmado rotulada «Simpson biplano», o sea nombrando mal el método en un documento clínico.

⚠️ **LOS DOS VOLÚMENES DEL BIPLANO VAN EN mL Y LOS CAMPOS ESTÁN EN ml — MISMA UNIDAD.** No hay
conversión. Pero sí hay un vecino que conviene conocer: **`vauto-vsfvi`** («VSFVI automático
(ml) auto ← VDFVI y FEVI») es un `readonly` que deriva `VDFVI × (1 − FEVI/100)`. Escribir los
tres —`vdfvi`, `vsfvi` y `fevi`— deja al automático **al lado** del medido, que es textualmente
«la comparación que el médico pidió poder hacer» según su propio comentario. **No hay
circularidad**: el automático no escribe `vsfvi`.

⚠️ **PERO EL COMENTARIO QUE LO DECLARA ESTÁ VIEJO Y HAY QUE DECIRLO.** Dice: «`fevi` es un campo
TIPEADO. Censo del archivo: NADIE le escribe `.value` ni pasa por `setv('fevi', …)`». Eso **ya es
falso en el árbol de hoy**: `_simpEscribirFEVI` hace `el.value = nuevo` sobre `fevi` desde antes
de esta tanda. La conclusión del comentario —que no hay lazo— **sigue siendo cierta** por la otra
mitad del razonamiento (el automático no escribe el campo), así que no hay defecto de cálculo;
lo que está mal es la premisa con la que se justifica. Declarado, no corregido.

---

## 6 · Las discrepancias de nombre — listadas, NO corregidas

Esta tanda **no unifica nombres**. Van acá para que la próxima los decida.

| magnitud | el visor dice | el formulario dice |
|---|---|---|
| espesor del septum en diástole | **SIVd** | **SIV (mm)** *(sin la «d»)* |
| espesor de la pared posterior en diástole | **PPd** | **PPVI (mm)** |
| diámetro telediastólico del VI | **DDVI** | **DDFVI (mm)** |
| diámetro telesistólico del VI | **DSVI** | **DSFVI (mm)** |
| diámetro del TSVI | **Diam TSVI** | **Diám. TSVI (mm)** *(con punto y tilde)* |
| diámetro del TSVD | **Diam TSVD** | **Diám. TSVD (mm)** *(ídem)* |
| senos de Valsalva | **Senos de Valsalva** | **Ao sinusal (mm)** |
| unión sinotubular | **Unión sinotubular** | **Ao sinotubular (mm)** |
| aorta tubular | **Aorta tubular** | **Ao tubular (mm)** |
| diámetro anteroposterior de la AI | **DAP** | **Diámetro AP (mm)** |
| velocidad máxima aórtica | **Vmax VAo** | **Vmax aórtica (m/s)** |
| gradiente medio aórtico | **Grad Medio** | **G. medio (mmHg)** |
| VTI del TSVD | **VTI Pulmonar (TSVD)** | **VTI TSVD (cm)** |
| fracción de acortamiento del área del VD | **FAC VD (%)** | **FAC VD (%)** — *coinciden* |

Y una que **ya está declarada** y no es de nombre sino de cantidad: la misma velocidad máxima
pulmonar tiene **cuatro** nombres fuera del visor (`vp_vmax` dueño, `ep_vmax` espejo, «V. máx VP»
en el PDF y «PV Vmax P» en la cabecera del importador), informado en MEDIR-2 y sin tocar.

---

## 7 · Conteo

- Filas con **campo declarado** por `_D2_BANDA_DE` / `_DOP_BANDA_DE`: **13 + 12 = 25**.
- Filas con **candidato no cableado**: **7** (`vd.medio`, `vd.longit`, `ao.gradMedio`, `ao.vtiAo`,
  `pul.vmaxIp`, `pul.vmaxIpTd`, más `mit.pht` que queda **excluido** por tener el campo de otra
  magnitud).
- Filas **sin campo en la app**: **5** del cajón 2D + las cinco genéricas + ocho mitrales,
  tricuspídeas y pulmonares sin homólogo.
- Filas que **la app calcula**: `vd_fac`, los dos indexados del Simpson y todos los derivados
  Doppler.
- Filas que **nadie calcula** y tampoco tienen campo: los **dos engrosamientos** del VI.
