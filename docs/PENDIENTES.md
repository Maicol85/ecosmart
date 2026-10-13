# EcoSmart — pendientes vivos

## Parámetros complementarios de la función diastólica (2026-10-12) — DECLARADO y NO arreglado

Fuente: `docs/fuentes/FUENTES.md` → «Parámetros complementarios de la función diastólica».
Mapa: `docs/mapa/diastolica-complementarios.md`.

### C1 · El importador sigue rechazando un LARS negativo que la pantalla ya no marca

`LAB_XLS_RANGO_PROPIO` tiene `lars:[0,60]` y lo compara sobre el valor **crudo**, así que una
planilla con un LARS de −32 se rechaza por rango. En pantalla ese mismo valor ya **no** se marca
«(revisar)», porque la cuenta usa `|x|` y 32 está en banda. Las dos superficies dicen cosas
distintas sobre el mismo número.

**No se tocó** porque tocar el importador cambia el round-trip de Excel, que necesita orden
expresa. La salida limpia es la misma que ya tienen los otros tres strain: banda simétrica
(`[-60, 60]`), que es la banda del valor absoluto escrita sobre el valor crudo.

### C2 · La nota ‡ de la Figura 3 y el inciso (d) del folio 555 no dicen lo mismo

La nota ‡ nombra sólo «Ar-A duration > 30 ms»; el inciso (d) pide además «a high amplitude
(>35 cm/s) … **along with** an Ar-A duration >30 ms». La app exige el **AND**, que es la prosa y es
el lado conservador. Si Maicol prefiere el criterio de la figura —el Ar−A solo—, es una línea:
sacar la segunda mitad de `cumple` en la entrada `arA` de `ASE_SUPLEMENTARIOS`.

### C3 · El inciso (d) es un marcador de LVEDP, no de PAI media

El folio 555d lo escribe: «there is an early stage when **LVEDP is elevated but mean LAP is
normal**». La Figura 3 estima la **PAI media**, así que ese parámetro empuja hacia «presión elevada»
un estado que su propia fuente describe con la PAI media normal. Se implementó porque la nota ‡ lo
lista como suplementario de ese algoritmo y porque el §12 del folio 555 manda informar el aumento
aislado de la LVEDP. **Decidirlo es de Maicol**: la alternativa es sacarlo de la lista, o publicar
una frase propia para el aumento aislado de la LVEDP —que sería una frase nueva del informe
firmado—.

### C4 · El informe firmado no nombra los suplementarios que decidieron

El §12 del folio 555 lo pide: «LARS, pulmonary vein S/D ratio or systolic filling fraction, mitral
inflow A duration, pulmonary vein Ar duration, and/or IVRT **should be included in the report if
relied on**». Hoy los suplementarios se nombran en la ventana del 🧭 y en la `via`, y el único que
llega al informe es el de la BSE por `_bseDetalles`. La ASE 2025 no tiene su equivalente.
**Es una frase nueva del informe firmado**, así que no se tocó.

### C5 · El quinto suplementario no tiene campo

La **caída de la E/A ≥ 50 % con Valsalva** (folio 555e y nota ‡). La app no registra la maniobra por
ningún campo. Los dos del inciso (c) —IM diastólica y terminación precoz del llenado antes del QRS—
tampoco, y además no son una medición con corte. La lista `ASE_SUPLEMENTARIOS` está armada para que
agregarlo sea una entrada y nada más.

⚠️ **Y MIENTRAS FALTE UNO, EL LADO NEGATIVO DE LA ETAPA NO PUEDE AFIRMAR NADA.** La flecha «None» de
la figura sale de haber preguntado sus cinco; la app pregunta cuatro. Por eso con los cuatro
negativos el estado se queda en «no estimable».

### C6 · Las dos salvedades del S/D que las guías escriben y la app no avisa

El folio 554 de la ASE 2025: «The ratio is most reliable in patients with LV systolic dysfunction
and **should not be considered in normal subjects with normal echocardiographic results**, when the
ratio can be ≤ 0.67. In patients with normal LVEF, the ratio can be >0.67 despite elevated LV
filling pressures.» La ASE/EACVI 2016 dice lo mismo en los folios 286 y 287, y de ahí sale que su
Figura 8A **no** mire el S/D.

En la ASE 2025 en ritmo sinusal el S/D **sí vota con FEVI normal**, porque su Figura 3 lo pone en el
segundo paso sin condicionarlo a la FEVI. Las dos cosas están impresas en el mismo folio. Un aviso
ámbar —«el S/D es poco fiable con FEVI normal»— sería lo que esta casa hace con una salvedad de la
fuente, pero es un cartel nuevo y no estaba en la orden.

### C7 · El borde de la PAP diastólica es el del campo REDONDEADO

`asePapdSupl()` parsea `ip_papd`, que `calcIP` escribe con `toFixed(0)`. Así un 15,64 real se lee
**16** y cruza el corte. Es deliberado —el número que el médico tiene delante es el que se
clasificó, y la alternativa es una segunda copia de la fórmula— pero significa que el corte efectivo
es `>= 15,5` sobre el valor exacto. Declarado.

### C8 · El redondeo del IMC mueve un borde real, no sólo el del punto flotante

Redondear a un decimal deja NEGATIVO un IMC de **30,03** (86,8 kg con 170 cm), que en HEAD era
positivo. Es el precio del decimal que la orden pide, y es el lado conservador. Si Maicol quiere
cerrar sólo el error de representación, la alternativa es comparar con una épsilon
(`imc > 30 + 1e-9`) en vez de redondear.

### C9 · Con un anillo solo, la BSE deja el cuadro en «—» y el rótulo nombra el sitio

`calcDiastolBSE2024` escribe `eprom-val` sólo con los DOS anillos, así que con uno solo el renglón
queda en «—» mientras su rótulo ya dice «e′ septal». **Es preexistente** —antes decía «e′ promedio»
sobre el mismo «—»— y lo que esta tanda hace es que se vea. La salida limpia es que esa rama llame a
`diastCeldasBasicas`, que sí lo escribe con un anillo; no se tocó porque es la celda de otra guía.

### C10 · La «indeterminada» sigue sumando en DD_Sin

El token nuevo de esta tanda cierra el caso de «Disfunción diastólica.», pero «Función diastólica
indeterminada.» sigue clasificando `null` y, con el E/e′ documentado, sigue contando en
`DD_Sin (Sin disfunción)` por la misma regla. **No le corresponde el token nuevo**: esa frase no
afirma disfunción. Darle uno propio —o cambiar la fórmula de la columna— es una decisión sobre otra
frase. Es lo que queda abierto de **A4**.

---

## Función diastólica ASE/EACVI 2016 en ritmo sinusal (2026-10-12) — DECLARADO y NO arreglado

Fuente: `docs/fuentes/FUENTES.md` → `### aseDiast2016 — ASE/EACVI 2016, RITMO SINUSAL`.
Mapa: `docs/mapa/diastolica-ase2016.md`.

### A1 · ✅ **CERRADO 2026-10-12** — El E/e′ con un solo anillo se compara contra el corte del PROMEDIO

El folio 281 lo dice: «at times only the lateral e′ or septal e′ velocity is available ... a
**lateral E/e′ ratio > 13** or a **septal E/e′ > 15** is considered abnormal». La app calcula
`eprom` cayendo al anillo que haya y compara ese cociente contra `> 14`, que es el corte del
promedio. Con un septal solo, un E/e′ de 14,5 cuenta como positivo cuando su corte es 15; con un
lateral solo, un 13,5 cuenta como negativo cuando su corte es 13.

~~**No se tocó porque es un umbral clínico que esta orden no autoriza.**~~ **CERRADO el 2026-10-12**
con tres constantes y el corte elegido por el sitio MEDIDO (`ASE16_EE_PROM` 14, `ASE16_EE_SEPTAL` 15,
`ASE16_EE_LATERAL` 13, las tres con `>` estricto). **Es un REEMPLAZO y no un OR**: con los dos
anillos manda el promedio, que es lo que dice el folio 281 («applies to laboratories that acquire
only septal or lateral velocities»). Medido: cambian 3 de 12 escenas, las tres con un anillo solo y
en las dos direcciones. Ver `docs/mapa/diastolica-complementarios.md`.

### A2 · «Enfermedad miocárdica con FEVI normal» no se detecta

El pie de la Figura 8 manda a la 8B a los pacientes con «myocardial disease and normal LVEF after
consideration of clinical and other 2D data». Eso es un juicio clínico sobre datos 2D que no tienen
campo en la app. Hoy esos pacientes corren por la 8A. Para detectarlo haría falta un campo nuevo
—un tilde de «cardiopatía conocida», o derivarlo de la geometría del VI y los trastornos
sectoriales— y esta orden prohíbe agregar campos.

### A3 · Con UNA sola variable disponible la 8A no afirma, y eso es una decisión de la app

La regla de la mitad sobre un denominador de 1 convierte un único parámetro en «hay disfunción» o
en «es normal». La guía no tiene rama para eso y su propio ejemplo usa tres variables. La app
informa indeterminada. Si Maicol prefiere seguir la regla al pie de la letra, es cambiar una sola
condición.

### A4 · ✅ **CERRADO EN PARTE 2026-10-12** — Un `null` del Laboratorio cuenta como «Sin disfunción» en el Excel

`DD_Sin (Sin disfunción)` vale `(gd === 'sin' || (gd === null && eeDoc)) ? 1 : 0`. La frase nueva de
la 8A («Disfunción diastólica.») y la «Función diastólica indeterminada.» que la app ya publicaba
clasifican las dos en `null`, así que un estudio con el E/e′ documentado **cuenta como «Sin
disfunción»** aunque su propio texto afirme lo contrario.

**CERRADO para la frase de la 8A el 2026-10-12** con exactamente esa salida: el token
`ase2016_sin_grado` en `_labDiastGrado`, con rótulo en la columna de texto y ningún `DD_*`. Medido
antes y después: `DD_Sin` pasa de 1 a 0 y el Excel sigue en 435 columnas. **Sigue abierto para la
«indeterminada»**, que no afirma disfunción y a la que no le corresponde este token — ver C10.

### A5 · ✅ **CERRADO 2026-10-12** — La frase de la 8A no tiene token en el Laboratorio

Era consecuencia de A4. **CERRADO el 2026-10-12**: hoy clasifica `ase2016_sin_grado` y la columna de
texto publica «Disfunción, sin grado (ASE 2016)», así que ya se distingue de «no se pudo
clasificar». Sigue **sin** `DD_*` y fuera de la distribución del panel, del PPT estadístico y del
filtro por grado, y eso es lo correcto: la figura no gradúa. Mismo mecanismo que los cuatro tokens
de la BSE.

### A6 · El TDE y el TRIV no entran, y la app los tiene cargados

Censado en los dos PDF: ninguno aparece en la Figura 8 ni en su prosa como paso de los algoritmos de
ritmo sinusal. La app los guarda y los muestra, y la ASE 2016 no los consulta. No hay nada que
arreglar; queda escrito para que nadie lo reabra.

### A7 · El paciente con E/A ≤ 0,8 y E > 50 sale «grado I» por criterio EcoSmart, no por la figura

Con 0 criterios positivos y FEVI normal o sin cargar, la app fuerza grado I si el E/A es ≤ 0,8.
La Figura 8A diría «normal» (ese paciente tendría 0 de 4) y la 8B lo manda a la caja de los tres
criterios sin más. Es una decisión heredada de HEAD y conservada a propósito —afirmar normalidad
sobre una relajación prolongada es peor que omitir—, pero no sale de la guía.

### A8 · La 8A no distingue su badge del de la 8B

El badge dice «Normal — ASE 2016» o «Indeterminado — ASE 2016» corra la figura que corra; sólo la
ventana del 🧭 nombra cuál se aplicó. Se dejó así para no mover el texto que lee la franja del PPT.
Si conviene que el papel diga por cuál vía se graduó, es agregar el sufijo en un solo lugar.

## Pared del VD e índice de Tei (2026-10-12) — DECLARADO y NO arreglado

Lo que la tanda de la pared del VD y del índice de Tei **midió y dejó como está**, con el motivo
de cada uno. La zona está mapeada en `docs/mapa/vd-derecho.md` y la fuente en
`docs/fuentes/FUENTES.md` → `### aseVd2025`.

### V1 · Las filas de TAPSE y S′ del cuadro no vuelven a «—» al borrar el dato

Su `if (tapse)` / `if (sp)` dentro de `calcVD` **sólo pinta**, así que la fila del paciente
anterior se queda en pantalla hasta que `limpiarCampos` barra el `.calc-box`. Las otras cinco
filas —`vd-tam`, `vd-pared-interp`, `fac-interp`, `vd-tei-interp`, `tap-interp`— sí resetean, y
las **dos nuevas siguen a las que resetean**.
**Medido** con teclas reales en la sonda (grupo `refs`, escena `trasBorrarVecinas`): cargar
TAPSE 14 y S′ 9, borrarlos y las dos filas siguen diciendo «Disfunción» sobre campos vacíos,
mientras las cinco que resetean —las dos nuevas incluidas— ya están en «—».
**Por qué no se tocó:** son dos filas que esta orden no nombra, y cambiarlas toca el
comportamiento de pantalla de dos parámetros que la app ya publica. Es un arreglo de dos líneas
cuando se autorice.

### V2 · La pared NORMAL sola no publica oración en el informe

La compuerta del bloque 5 entra con `_hvdInf.hvd`, o sea **sólo con hipertrofia**. Un estudio cuyo
único dato del VD sea una pared de 4 mm no se nombra.
**Por qué así:** la app no dice «sin hipertrofia» en ninguna parte, y sin una frase de normalidad
la oración quedaría en «Ventrículo derecho.» pelado, que es peor que no decir nada. Es además el
mismo trato que ya reciben `fevd` y `vd_vi`, que tampoco llegan al narrativo. Y la guía pide
informarla **si es anormal** (Recomendación 3, folio 144).
**Qué habría que decidir:** si se quiere una frase de pared normal, es texto del informe firmado y
lo decide Maicol.

### V3 · Con el VD no dilatado, el EN SUMA pierde «de dimensiones normales»

Los textos de la orden para la hipertrofia sin dilatación arrancan en «HVD …», así que
`HVD con disfunción sistólica.` reemplaza al `VD de dimensiones normales con disfunción
sistólica.` que HEAD escribía. **Es la decisión de la orden** y está medido en la tabla de 24
escenas: es la única pérdida de la tanda.
**Alternativa, si se quiere recuperar:** `VD de dimensiones normales e hipertrófico, con …`, que
suena contradictorio para un lector no técnico y se aparta del texto aprobado.

### V4 · El Laboratorio cuenta las frases del VD como «Disfunción sistólica VI» — PREEXISTENTE

`_LAB_HALLAZGOS` usa `/disfunci[oó]n\s+sist[oó]lica/i`, que **no distingue el ventrículo**: una
frase del VD («VD dilatado con disfunción sistólica.») cuenta en la fila rotulada «Disfunción
sistólica VI» del dashboard y de la sección 3 del PDF de auditoría. Lo mismo con «Disfunción
diastólica», que no distingue VI de VD.
**No es de esta tanda:** pasa igual en HEAD y está medido con las propias funciones del
Laboratorio. Las frases nuevas no agregan ni quitan nada ahí —**«HVD» no matchea el patrón de
HVI**, verificado—, así que el recuento no se mueve por este trabajo.
**Qué habría que hacer:** anclar el patrón al ventrículo (`del VI` / `del VD` / sigla) o separar
las dos filas. Toca el Laboratorio y la orden lo prohíbe explícitamente.

### V5 · La app no gradúa la pared del VD, y la guía sí

La Tabla 1 del folio 145 la gradúa `≥0,5 a ≤0,7` leve · `>0,7 a ≤0,9` moderada · `>0,9` severa.
La app informa **hipertrofia sí o no**, que es lo que pidió la orden.
**Por qué no se agregó:** una banda intermedia es contenido clínico y decide Maicol. Si se
autoriza, las tres bandas salen de la misma Tabla 1 y los operadores están transcriptos en
`FUENTES.md`.

### V6 · El Tei no tiene columna de Excel, ni la pared

Decisión de la orden («EXCEL: SIN columnas nuevas; queda en 435»). Los dos campos viajan con el
estudio y se restauran, pero **no viajan al Excel**, así que no entran en el Laboratorio ni en
ningún análisis de cohorte, y un backup a Excel + reimportación los PIERDE.
**Lo que habría que hacer si se autoriza:** dos entradas en `LAB_XLS_MAP` en el bloque del VD más
sus bandas en `LAB_XLS_RANGO_PROPIO` —que pueden consumir `VD_NUEVOS_BANDA` por referencia, como
hizo el strain de contracción— y adaptar los casos que afirman 435.

### V7 · El corte del Doppler PULSADO del Tei existe y no se usa

`VD_TEI_PW_ALT_MIN` (0,40) está declarado y **ningún camino lo aplica**: el campo de la app es de
DTI y su corte es 0,55. Está escrito para que un borde se entienda al lado del que no se eligió, y
porque confundir los dos métodos mueve el corte un 27 % sobre un informe firmado.
**Qué haría falta para usarlo:** un campo propio del Tei por Doppler pulsado, o un selector de
método. Es un campo nuevo y no se pidió.

### V8 · Las tres advertencias del Tei que la app NO puede detectar

La guía nombra cuatro condiciones de carga (folio 159) y el cartel ámbar sólo cubre dos:

| Advertencia de la guía | ¿Detectable? | Por qué |
|---|---|---|
| IT severa acorta el IVRT | **sí** | `it_grado === '4'` |
| R-R variables (FA) | **sí** | `diast_ritmo === 'fa'` |
| Precarga aumentada / congestión derecha | **no** | la app no tiene un campo de estado de volumen; la VCI y la PAD estimada son proxies y usarlas sería inventar un criterio |
| HTP / poscarga aumentada | **no decidido** | la PSAP estimada existe (`psap_calc`), pero el cartel diría «puede no ser válido» en casi todo paciente con HTP, que es justamente la población donde la guía más lo recomienda. **Un gate que grita de más se deja de leer.** |
| «No es el único método cuantitativo» (Recomendación 1) | **no se afirma** | es una recomendación de conducta, no un hallazgo del estudio |

### V9 · Los cortes de TAPSE, S′ y FAC no se compararon contra la ASE 2025

La Tabla 1 del folio 145 trae TAPSE `>1,7 cm`, S′ `>9,5 cm/s` y FAC `>35 %`, que **coinciden** con
los que la app aplica desde la ASE 2015 (17 mm, 9,5 cm/s, 35 %) — pero la guía nueva agrega bandas
de severidad para los tres y **la app no las usa**. No se tocó ni un corte: esta orden pedía la
pared y el Tei.
⚠️ Y el **S′ sigue siendo un literal `9.5` dentro de `calcVD` y de `generarInforme`**, no una
constante: son dos copias del mismo número y este archivo ya documenta lo que pasa con eso.

### V10 · La Tabla 6 del folio 169 (función diastólica del VD) no se usó

Trae los cortes diastólicos del VD —E/A, e′/a′, E/e′, TDE— y la app los toma de la **ASE 2010**
(`DT_EA_RELAJ`, `DT_EA_RESTR`, `DT_EEP_ELEV`). **No se compararon.** Cambiarlos es mover umbrales
clínicos de una zona que esta orden no nombra.

---

## Función diastólica BSE 2024 en ritmo sinusal (2026-10-12) — DECLARADO y NO arreglado

Lo que la tanda de la BSE 2024 **midió y dejó como está**, con el motivo de cada uno. La zona
está mapeada en `docs/mapa/diastolica.md` → «`diastBSE2024Evaluar`» y las fuentes en
`docs/fuentes/FUENTES.md` → `### bseDiast2024 — RITMO SINUSAL`.

### ✅ B1 — CERRADO el 2026-10-12. El LAPs y la onda L YA tienen campo

La tanda del strain de la AI agregó `ai_strain_ct` («strain de contracción de la AI», que es el
LAPs) y `onda_l`, y los **cuatro** pasos que quedaban en gris votan: las dos cajas de strain de la
Figura 17, las dos de la Figura 18 y la onda L en los suplementarios de las dos. La consecuencia
medida que este punto declaraba —«un paciente con discordancia 1 y 1 y sin LARS queda
indeterminado»— ya no se alcanza por falta de campo: con el strain de contracción cargado la rama
decide. El Excel pasó de 434 a **435 columnas**. Ver `docs/mapa/diastolica.md` → «Los campos de
strain de la AI y la onda L» y la sección nueva de `docs/fuentes/FUENTES.md`.

El texto original, que es lo que se cerró:

### B1 · El LAPs (strain de bomba de la AI) y la onda L no tienen campo

Las Figuras 17 y 18 los usan en la rama del strain: el LAPs como alternativa del LARS en los dos
sentidos (`≥14 %` normal en la 17, `<8 %` elevado y `≥14 %` normal en la 18) y la onda L como
parámetro suplementario (`>20 cm/s`). **La app no los mide y la orden pidió no agregar campos**
(el Excel estaba entonces en 434 columnas), así que los dos quedaron declarados **no evaluables**: se dibujaban
en la ventana con el motivo en su propio rótulo y no cuentan.

**Consecuencia medida:** un paciente con discordancia 1 y 1 y **sin LARS** queda
**indeterminado** aunque tuviera el LAPs medido en otro lado. Es lo que la guía manda hacer
cuando el strain no se puede analizar (folio 36), pero la app llega ahí por no tener el campo,
no por no poder medirlo.

### B2 · «Known myocardial disease» no abre la vía reducida

La entrada de la Figura 18 es `LVEF <50% OR GLS <16% OR known myocardial disease`, y el folio 35
la define: cardiopatía isquémica con alteraciones sectoriales, miocardiopatía, HVI patológica.
**No hay un campo que lo declare**, así que la vía se abre sólo por FEVI o GLS. Un paciente con
FEVI 60 %, GLS −20 % y una miocardiopatía conocida corre la Figura 17 y se le valora la
relajación por el e′, cuando la guía la daría por alterada.

Se podría derivar de campos existentes (trastornos sectoriales, masa del VI), pero eso es
inventar un criterio de entrada que la guía escribe en prosa y no en una fórmula. **Decisión de
Maicol.**

### B3 · La zona gris de FEVI/GLS corre la vía de FEVI normal

Pedido por la orden y conservado. La guía no la resuelve con un número —«LVEF and GLS cannot
provide binary normal/abnormal cut-offs»— y pide interpretar volúmenes, TDI, informes previos,
historia clínica y síntomas. La app lo **declara** con un aviso ámbar y no cambia ningún
veredicto; está medido (FEVI 52 y GLS −17 dan el mismo badge y la misma vía que FEVI 60 con
GLS −20).

### B4 · El Ar−A tiene DOS constantes en la app, con dos operadores

`VENP_AR_A_MS` vale 30 con borde **`>=`** y es el criterio de la ASE/EACVI 2016 que pinta la fila
de la vena pulmonar y la celda del PDF. La BSE escribe **`> 30`** y por eso esta tanda agregó
`BSE_ARA_SUPL`. **No se unificaron**: son dos guías con el mismo número y distinto borde, y
tocar `VENP_AR_A_MS` movería la alerta de la vena pulmonar, que es otro módulo y otro informe.
Un Ar−A de 30,0 exacto es **positivo** para la fila de la vena pulmonar y **negativo** para el
paso suplementario de la BSE, en la misma pantalla.

### B5 · Los cuatro tokens nuevos del Laboratorio salen del denominador

`_labDiastGrado` devuelve ahora `bse_det_normal`, `bse_det_elevada`, `fa_elevada` y
`pres_normal_sin_grado`. Ganan la **columna de texto** del Excel y **no activan ningún `DD_*`**,
que es lo pedido: la BSE abandonó los grados I-III. Pero además:

- **salen de la distribución diastólica del panel y del PPT estadístico**, porque `_labDiastDist`
  sólo cuenta las claves `I`, `II`, `III` y `sin` (guarda de `hasOwnProperty`). No rompe ningún
  gráfico —el denominador `tot` simplemente no los incluye—, pero un laboratorio que informe con
  la BSE va a ver una torta diastólica construida sobre menos estudios de los que tiene;
- **quedan fuera del filtro de cohorte por grado**, porque `#coh-diast` tiene cuatro opciones
  fijas. Es lo que su propio texto de ayuda ya advierte («Un estudio cuyo informe no los nombre
  queda fuera del filtro»);
- **dejan de aparecer en dos indicadores de auditoría** —«E/e' >14 sin clasificación de
  disfunción diastólica» y «Vol AI elevado sin función diastólica documentada»—, que preguntan
  por `_labDiastGrado(i) === null`. Eso es lo correcto: ahora sí tienen clasificación.

Agregar una quinta categoría a la torta o una quinta opción al filtro **cambia un gráfico y una
pantalla del Laboratorio, y es decisión de Maicol.**

### B6 · Dos frases de estudios GUARDADOS siguen sin clasificar

«Presión de llenado del VI elevada (…), compatible con disfunción diastólica significativa.» y
«Disfunción diastólica con presión de llenado del VI elevada, en contexto de función sistólica
deprimida/cardiopatía conocida.» son las que esta app publicó **hasta hoy** con la BSE, viajan en
los estudios ya archivados y `_labDiastGrado` las devuelve en `null` — como antes de esta tanda.
**No se tocaron a propósito:** la orden pide que lo que no tiene las frases nuevas quede idéntico
a HEAD, y reclasificarlas movería la estadística de estudios ya firmados. Verificado con las seis
frases viejas.

### B7 · La indeterminada de la vía reducida no dice que la relajación está deteriorada

La prosa del folio 37 la llama «LV relaxation is therefore impaired but with indeterminate LVFP».
La app publica la plantilla de presión indeterminada, que es una de las cuatro aprobadas, y **no
afirma la relajación deteriorada**: no hay una quinta plantilla y escribir una sería inventar una
frase de informe firmado. **Decisión de Maicol.**

### B8 · La coletilla de contexto de la vía reducida se fue

HEAD escribía «… en contexto de función sistólica deprimida/cardiopatía conocida». Las dos vías
llegan a LA MISMA casilla de la guía, así que comparten la plantilla y esa coletilla desapareció.
El dato que repetía (la FEVI) sigue en su propia línea del informe. **Si Maicol la quiere de
vuelta, es una línea.**

### B9 · El nombre de la categoría 1: la guía dice «Normal diastolic function»

La casilla verde de la Figura 17 se llama, literal, **«Normal diastolic function»** — sin «para
la edad». La plantilla que la app publica es la que escribió Maicol en la orden: **«Función
diastólica normal para la edad»**. Se conservó la suya porque es texto de informe firmado y la
orden la enuncia en su sección de decisiones del médico; el calificativo además es cierto (el
paso del e′ ES específico por edad) y es el lado conservador. **Queda reportado: si prefiere el
nombre literal de la guía, es una línea en `BSE_FRASE`.**

## Función diastólica ASE 2025 (2026-10-12) — DECLARADO y NO arreglado

Lo que la tanda del 2026-10-12 **midió y dejó como está**, con el motivo de cada uno. La zona
entera está mapeada en `docs/mapa/diastolica.md` y las fuentes en `docs/fuentes/FUENTES.md` →
`### aseDiast2025`.

### 1 · [CERRADO 2026-10-12] El cuadro gris se atrasaba: `calcDiastol` no estaba cableado

**Cerrado en la tanda de la fibrilación auricular.** Se cablearon **once** campos al `oninput` de
siempre: `peso`, `talla`, `fevi`, `ai_vol`, `vmax_it`, `it_vmax_cw`, `tde`, `triv`, `venp_sd`,
`vci_diam` y `vci_col`. El TDE y el TRIV no tenían manejador **ninguno**.

Medido en A/B contra HEAD, tipeando en el orden natural: en ritmo sinusal con la ASE 2025, HEAD
decía «No estimable» en los cuatro campos que siguen al Vol AI y sólo se ponía al día al tipear
el LARS, que es el último; el árbol nuevo cambia en el Vol AI mismo. Con la BSE, lo mismo entre
«Normal» e «Indeterminado». **El veredicto final es idéntico en los dos** —es una función pura de
los campos— y lo único que cambió es cuándo se repinta.

No se usó un oyente global: `calcDiastol` arrastra `calcHemo`, `calcVenaPulm`, `imOndaEPintar` y
el aviso de protocolo, y colgarla de cada tecla de la app entera se paga en todas las pestañas.

### 2 · El rojo del E/e' no sigue los tres cortes por sitio

`calcVenaPulm` pinta el E/e' en rojo con `UMBRAL_EE_ELEVADA` (14) y `>`, y `eeCorteEs14()` lo apaga
en la rama de BSE + FA. Con la ASE 2025 los cortes pasaron a ser **septal ≥15 · lateral ≥13 ·
promedio ≥14**, así que con **un solo anillo** el color y el veredicto pueden discrepar: un E/e'
septal de 14,5 se pinta **rojo** y el criterio es **negativo** (su corte es 15). No se tocó porque
el comentario de `UMBRAL_EE_ELEVADA` ya declara que ese número lo comparten **cuatro** lugares más
—los dos BSE, el ASE 2016 y el Laboratorio— y unificarlo toca tres algoritmos y el Laboratorio.

### 3 · Dos rótulos del cuadro mienten con un solo anillo

`#eprom-val` dice **«e' promedio»** y muestra el valor del único anillo medido, y `#ee-val` dice
**«E/e' promedio»** con el cociente de ese único sitio. Pre-existente, sólo de pantalla, y el
cálculo ya no se confunde (`prom` vale `null` con un anillo). Corregir el rótulo es tocar el
marcado de dos celdas del cuadro gris.

### 4 · El S/D venoso pulmonar no es evaluable, y por eso el segundo paso tiene tres patas y no cuatro

El corte de la Figura 3 es **≤0,67** (equivale a una fracción de llenado sistólico ≤40 %) y el
campo `venp_sd` es un `<select>` de **«<1 / >1»**: un S/D de 0,9 es «<1» y **no** cumple el
criterio. El criterio quedó dibujado en **gris** con el motivo en su rótulo. Para habilitarlo hace
falta **un campo numérico nuevo** —el S/D, o la fracción de llenado sistólico— y esta tanda tenía
orden expresa de no agregar ninguno (el Excel estaba entonces en **434 columnas**; desde el
2026-10-12 está en **435**).

⚠️ **EN FIBRILACIÓN AURICULAR EL MISMO CAMPO SÍ ES EVALUABLE** (2026-10-12): el corte de la
Figura 8 de la ASE 2025 y el de la Figura 19 de la BSE es **< 1**, que es exactamente lo que dice
la opción del `<select>`. Es el mismo campo con dos cortes distintos, y el de ritmo sinusal cae
justo en el borde de la opción. Lo que sigue faltando es el campo numérico para el ≤0,67.

### 5 · El estado (a) entra al Laboratorio como «Sin disfunción»

`_labDiastGrado` clasifica por TEXTO, y el EN SUMA del estado (a) —«Presión de llenado del VI
normal.»— matchea su cuarta expresión (`llenado (del VI) normal`), así que ese estudio sale con
**«Sin disfunción»** en la columna «Grado disfunción diastólica» y con **`DD_Sin = 1`**. Medido:
pasa igual en HEAD, porque la frase que el estado (a) reemplaza —«e' reducida con presión de
llenado normal (…), pero el cociente E/A…»— **también** matcheaba esa expresión. O sea que no es
una regresión; es una imprecisión que ya existía y que ahora se ve mejor. Cambiarlo es cambiar
una frase del informe o la heurística del Laboratorio, las dos decisiones de Maicol.

### 6 · Las exclusiones que la app NO puede detectar

El aviso ámbar nombra **estenosis mitral de cualquier grado**, **insuficiencia mitral grave**,
**prótesis mitral** y **válvula mitral calcificada**. El pie de la Figura 3 excluye además:

| Exclusión de la guía | Por qué no se detecta |
|---|---|
| **Calcificación del ANILLO moderada o grave** | no hay campo. `vm_morf = 'Calcificada'` describe la **valva**, no el anillo, y por eso el motivo del aviso lo dice con esas palabras |
| **Plástica mitral** y **TEER ya realizado** | no hay campo que diga «ya operado»; el módulo de TEER evalúa **candidatura**, no antecedente |
| **IM primaria grave** (el mecanismo) | el aviso nombra la IM grave sin pedir el mecanismo: sobre un cartel que no cambia ningún veredicto, avisar de más es el lado seguro |
| **Asistencia ventricular**, **HP no cardíaca**, **trasplante**, **constricción pericárdica** | la app tiene módulos de constricción y de HP, pero ninguno expone un campo binario «este paciente es de ese grupo» |

Y la guía trae **algoritmos propios** para cinco de esos grupos —CAM (Figura 4, folio 558),
trasplante (Figura 5, folio 559), HP no cardíaca (Figura 6, folio 560), FA (Figura 8, folio 563) y
la Tabla 7 del folio 557 para los demás— que la app **no implementa**. Son cinco algoritmos
nuevos, no un parche.

### 7 · [CERRADO 2026-10-12] Con «ASE 2025» y FA se graduaba con la vía SINUSAL de la BSE

**Cerrado en la tanda de la fibrilación auricular**, junto con los otros cinco defectos de esa
zona. Hoy `calcDiastol` decide el ritmo **antes** que la guía y cada una corre su propio
protocolo: Figura 8 (folio 563) para la ASE 2025, Figura 19 (pág. 39) para la BSE y la sección E
del folio 295 para la ASE/EACVI 2016, que **no tiene regla de conteo** y por eso no da veredicto.
La zona entera está en `docs/mapa/diastolica.md` y las fuentes en `docs/fuentes/FUENTES.md`.

#### Lo que esa tanda dejó declarado y NO tocó

1. **El Laboratorio no cuenta los estudios en FA.** La frase nueva —«Disfunción diastólica con
   presión de llenado elevada (con FA).»— no coincide con ninguna de las cuatro expresiones de
   `_labDiastGrado`, así que esos estudios clasifican como `null` y quedan fuera de la
   distribución diastólica y de las cinco columnas `DD_*` del Excel. Verificado en 27 escenas.
   Cambiarlo es cambiar la heurística del Laboratorio o la frase del informe: decisión de Maicol.
2. **El IMC de 30,00 exacto depende de la talla, por punto flotante.** El corte es `> 30` y un 30
   exacto es negativo —verificado con talla 100 y peso 30—, pero `(170/100)**2` vale
   `2.8899999999999997`, así que **86,7 kg con 170 cm da 30.000000000000004 y cruza el corte**. No
   se tocó `getIMC`: es el dueño único y lo comparten `calcBSA`, el encabezado del PDF y el PPM
   mitral, y redondear ahí movería tres superficies por un borde de una.
3. **Tres parámetros de la ASE/EACVI 2016 no son evaluables**: la aceleración pico de la onda E
   (≥1.900 cm/s²), el TD de la onda D de la vena pulmonar (≤220 ms) y el E/Vp (≥1,4) no tienen
   campo. Se dibujan en gris con el motivo en su rótulo. Habilitarlos son **tres campos nuevos** y
   esta tanda tenía orden expresa de no agregar ninguno.
4. **La ventana de la BSE y la de la ASE 2016 siguen calculando por su cuenta EN RITMO SINUSAL.**
   En FA las tres leen el dueño único; en sinusal, sólo la ASE 2025. Medido al cerrar: con la BSE
   en sinusal el cuadro dice «Indeterminado» y su ventana no coincide. Es el punto 8 de abajo.
5. **El rojo del E/e' no sigue los cortes de la FA.** `eeCorteEs14()` apaga el color con BSE + FA
   y lo deja con `>14` en todo lo demás; el corte de la FA es el septal `>11` en las dos guías que
   lo tienen. Es el mismo nudo del punto 2 de este archivo y se arregla con él.
6. **El aviso de FC no mira el ritmo del ECG, mira el selector.** Si el médico carga una FC alta y
   deja `diast_ritmo` en sinusal, el aviso no sale —es correcto: es un límite del algoritmo de FA
   de la BSE—, pero tampoco hay nada que compruebe que el ritmo declarado y la FC son coherentes.

### 8 · Las diferencias B1 a B7 de la BSE 2024 y la ASE/EACVI 2016

Del reporte de la Fase 1, **sin corregir por orden expresa**, y verificadas como control negativo
en esta tanda (12 casos, 0 diferencias):

| # | Qué |
|---|---|
| B1 | **BSE: los cortes de e' son los de la ASE 2025, no los de la BSE.** La BSE los da por edad **y sexo** (Tabla 2, pág. 13: septal 18-40 varón <7,0 / mujer <8,0; 41-65 <5,0; >65 <4,0; lateral <9,0 / <11,0 / <6,0 / <5,0) y **no tiene corte de promedio** |
| B2 | **BSE: el juego de variables está cambiado.** Sus tres claves son E/e' >14, **IT >2,8** y LAVi >34 (págs. 35, 37); la app usa la **E/A** donde va la IT, y arranca por la relajación donde la BSE arranca por las presiones |
| B3 | **BSE: falta la sustitución por strain de AI** en el caso 1 positiva / 1 negativa, y con **una sola** variable evaluada la app afirma «elevada» |
| B4 | **ASE 2016: `pos === 1` sobre 3 disponibles debería ser grado I con PAI normal**, no «Indeterminado» (Figura 8B, folio 290) |
| B5 | **ASE 2016: el e' no vota** en el juego de cuatro variables de la 8A, y el `eprom < 8` que usa la app no existe en la guía |
| B6 | **Ventana ASE 2016: `<0,8` y `<50`** donde el original dice **≤0,8 y ≤50**. El cuadro ya está corregido; la ventana quedó atrás |
| B7 | **Ventana BSE: exige 3 de 3** para «LAP elevada»; la BSE dice **2 o 3** (pág. 35) |

⚠️ **Y las dos ramas no-2025 de la ventana siguen calculando por su cuenta**, con
`_daCriteriosLAP` y `_daContar`: para la ASE 2025 el cuadro y la ventana tienen un dueño único,
para la BSE y la 2016 **no**.

## Frases largas visibles en el panel de Evidencia (2026-10-11) — REPORTADO y NO tocado

Censo pedido al cerrar la tanda del marco del panel: las frases de **más de 25 palabras que
quedan visibles en el cuerpo** de cada sección, con el detalle y los ⓘ CERRADOS, para decidir
cuáles acortar en un trabajo aparte. **No se tocó ninguna.**

⚠️ **El denominador son las QUINCE secciones y con un paciente no se encienden.** La prótesis
mitral apaga las tres mitrales nativas (`vmEsProtesis`) y la insuficiencia mitral secundaria
apaga la primaria, así que el censo se armó con **tres pacientes** —13 + 13 + 12 secciones, 15
distintas— y se consolidó por sección. Un reporte armado sobre nueve y presentado como «todas»
es la forma en que una frase larga queda sin listar.

⚠️ **Y hay que ABRIR las secciones colapsadas antes de medir.** Una sección nace colapsada
cuando ninguna de sus filas trae `ok` ni `alarm` y su recomendación no es `ind` ni `alarma`;
medido sobre el árbol cerrado, la sección entera desaparece del censo y el reporte sale sin una
sola frase de ella. Las aperturas se hacen con un **clic real en el rótulo**, que es el gesto
del médico, y la sonda informa cuántas quedaron cerradas (cero en las tres escenas).

**Total: 22 frases distintas.** Lo que ya NO está en esta lista son las notas de las 34
preguntas, que la tanda del 2026-10-11 movió detrás del ⓘ: ocho de ellas pasaban de 25
palabras y por eso bajaron solas.

⚠️ **Casi todas son `guia.txt`, o sea el CRITERIO VISIBLE de la sección con su clase y su
nivel** —salen en `<b>`—. Eso las pone del lado del contenido clínico: acortar una es reescribir
la frase de una guía, que es decisión de Maicol y no se toca sin orden expresa. Las tres que
salen en `<td>` son notas de fila con marca ⚠️ o ❓, que la compuerta del ⓘ deja visibles a
propósito; las que salen en `<div>` son avisos de sección o notas de recomendación.

| Sección | Palabras | Nodo | Primeras diez palabras |
|---|---|---|---|
| Estenosis aórtica | 35 | `<b>` | Intervención Clase I · Nivel B en el paciente sintomático… |
| Insuficiencia mitral primaria | 33 | `<b>` | Cirugía Clase I · Nivel B en el paciente sintomático… |
| Insuficiencia mitral secundaria | 35 | `<div>` | Las dos tablas de esta sección son distintas: la auricular… |
| Insuficiencia mitral secundaria | 27 | `<b>` | Dos tablas distintas según el tipo: la AURICULAR indica cirugía… |
| Estenosis mitral | 31 | `<b>` | Un área valvular mitral ≤ 1,5 cm² JUNTO CON factores… |
| Estenosis mitral | 29 | `<div>` | Hay una contraindicación de la comisurotomía: Insuficiencia mitral asociada. ·… |
| Prótesis mitral | 42 | `<b>` | En la disfunción protésica significativa la reoperación es Clase I… |
| Insuficiencia aórtica | 38 | `<b>` | Cirugía Clase I · Nivel B en el paciente sintomático… |
| Insuficiencia aórtica | 35 | `<td>` | ⚠️ ≥ 45 mm, pero esa fila exige que la… |
| Insuficiencia aórtica | 32 | `<div>` | Los síntomas son lo que separa la Clase I —que… |
| Válvula tricúspide | 63 | `<b>` | La cirugía tricuspídea concomitante es Clase I · Nivel B… |
| Válvula tricúspide | 36 | `<td>` | ❓ condición no verificable acá: las filas piden HTP severa,… |
| Estenosis pulmonar | 72 | `<b>` | Con un gradiente máximo por Doppler mayor de 64 mmHg,… |
| Estenosis pulmonar | 63 | `<div>` | La estenosis es severa. La tabla se parte en tres… |
| Estenosis pulmonar | 44 | `<td>` | ❓ la fila del asintomático pide PSVD mayor de 80… |
| Comunicación interauricular | 43 | `<b>` | Cierre Clase I · Nivel B con sobrecarga de volumen… |
| Comunicación interventricular | 32 | `<b>` | El cierre de la comunicación interventricular es Clase I en… |
| Ductus arterioso permeable | 37 | `<b>` | El cierre del ductus es Clase I · Nivel C… |
| Coartación de aorta | 32 | `<b>` | Reparación Clase I · Nivel C en pacientes HIPERTENSOS con… |
| Foramen oval permeable | 31 | `<b>` | Recomendación FUERTE a favor del cierre percutáneo en pacientes seleccionados… |
| Miocardiopatía hipertrófica obstructiva | 38 | `<b>` | La terapia de reducción septal para mejorar los síntomas es… |
| Válvula aórtica bicúspide — aorta ascendente | 32 | `<b>` | Cirugía Clase I · Nivel B con diámetro máximo ≥… |

Cómo se vuelve a medir, sin leer este archivo:

```bash
node scripts/_probe_evidmarco.mjs --solo frases
```

---
## Estenosis mitral binaria (2026-10-11) — REPORTADO y NO tocado

De la tanda «significativa / no significativa, con gradiente elevado de 5 a menos de 10»
(`dae0064`, `128dc4f`, `0142b24`). Nada de esto es un defecto que la tanda haya introducido.

### ⚠️ La pestaña Referencias enuncia la regla VIEJA, en prosa y en una tabla

La tarjeta «🟠 EM — Estenosis Mitral» de Referencias es TEXTO FIJO y hoy dice tres cosas que la
app ya no hace:

| Lo que dice la tarjeta | Lo que hace la app desde el 2026-10-11 |
|---|---|
| «Con AVm > 1,5 y **gradiente medio > 4 mmHg** publica «EM con gradiente elevado»» | el corte es `>= 5`, y de `>= 10` publica «estenosis significativa» |
| «Si dos áreas válidas caen a los dos lados del corte, se publican **las dos** con su método y **prevalece el peor**, con «probablemente severa por …»» | prevalece el peor igual, pero la categoría «probable» **se eliminó**: el veredicto es «significativa» a secas |
| la fila de la tabla: «AVm — **estenosis mitral severa** — ≤ 1,5 cm²» | el corte y su fuente (ASE 2023, Tabla 1) son los MISMOS; lo que cambió es la palabra |

**Por qué no se tocó:** es contenido clínico de cara al médico en otra pestaña, y la orden de la
tanda acotaba el papel al informe, al EN SUMA y al cuadro de Válvulas. **Decisión de Maicol.**
Nota a favor de dejarla: esa misma fila ya dice que **«la ESC/EACTS 2021 usa el mismo corte y lo
llama *clínicamente significativa (moderada o severa)*»** — o sea que la nomenclatura nueva
coincide con lo que la tarjeta atribuye a la ESC. Lo que hay que corregir es el «> 4», el
«probablemente severa» y la palabra «severa» de la fila.

### ⚠️ El Laboratorio cuenta la EM con la escalera de cuatro grados

`_labEstenSev(inf, 'em_grado')` hace regex sobre el **valor guardado** y devuelve
`Severa / Moderada / Leve / Sin`. Como `emGradoAuto` sigue escribiendo `'severa'`, **la fila
«Esten. Mitral» del Laboratorio no cambió ni una celda** y por eso la tanda no lo tocó.
Lo que queda dicho: la etiqueta que el Laboratorio imprime es **«Severa»**, mientras el informe
firmado del mismo estudio dice **«significativa»**. Son dos vocabularios para el mismo dato en dos
superficies de la misma app. Es el mismo pendiente que la **estenosis tricuspídea** ya tiene
abierto desde el 2026-10-05 (su `_labEstenSev` devuelve `null` para los dos grados nuevos), así
que conviene resolver los dos juntos y decidir cuántas categorías cuenta esa fila.

### ⚠️ `VALVSIG` de CeiboAnalytics no reconocería «significativa» — hoy no importa, pero importará

Su regex es `/severa|moderada/` sobre el valor guardado. Como el valor sigue siendo `severa`, **una
EM significativa SÍ cuenta** hoy como valvulopatía significativa. Queda anotado porque el día que
alguien renombre el valor guardado —no la palabra visible— esa cuenta se cae en silencio, en otra
app. Es el mismo agujero que la ET ya tiene (ella SÍ escribe «Significativa» como valor).

### ⚠️ La banda `< 5 mmHg` del cuadro no tiene rótulo de veredicto

El pedido definió dos rótulos —«elevado (5 a <10 mmHg; moderada, ASE 2023)» y «significativo
(≥10 mmHg)»— y ninguno para el gradiente por debajo de 5. El cuadro publica la **banda**
(«< 5 mmHg») y ninguna palabra de veredicto, para no inventar redacción clínica. Si Maicol quiere
una, es una línea.

### ⚠️ El EN SUMA de la banda media ya no nombra el gradiente elevado

Es **pedido explícito** (punto 3c): el resumen dice «EM no significativa.» y el gradiente elevado
sale sólo en el cuerpo del informe. Queda anotado porque el EN SUMA es la superficie que se copia
a una interconsulta o a un resumen de alta, y ahí el hallazgo desaparece.

### ⚠️ La nota «a FC de 60-80 lpm» de la Tabla 1 no se verifica

Los dos cortes del gradiente de la ASE 2023 valen **a una frecuencia cardíaca de 60-80 lpm**. La
app no recoge la FC del Doppler transmitral, así que aplica los cortes sin comprobar la condición.
Está dicho en `FUENTES.md` y en el comentario de las constantes.

### Lo que queda citando «ESC/EACTS 2021» fuera de esta tanda

Censado el 2026-10-11 y **no tocado**, porque cada uno es contenido clínico de otro módulo: el
encabezado visible de la tarjeta de **IT** de Referencias, el de **CRITERIOS ANATÓMICOS ESC 2021**
del score de Wilkins / CMP, el subtítulo de la tarjeta de **TEER**, y la prosa de la tarjeta de EM.
La tabla con lo que habría que hacer en cada uno está en `docs/fuentes/FUENTES.md`, en la sección
««ESC/EACTS 2021» NO EXISTE EN ESTE REGISTRO».

---

## Evidencia de la estenosis mitral (2026-10-11) — REPORTADO y NO tocado

De la tanda «estructura por etiología + textos y fuentes de la guía 2025» (`af0eb13`, `90a7630`).
La sección del panel ahora usa la MISMA función y las MISMAS constantes que el informe, así que las
dos divergencias que ese panel tenía quedaron cerradas. Lo que sigue abierto:

### ⚠️ La app aplica a TODA etiología dos cortes que su única fuente escribió para la reumática

`EM_GMEDIO_ELEVADO_MIN = 5` y `EM_GMEDIO_SIGNIF_MIN = 10` salen de la **Tabla 1 de la ASE 2023,
folio 8**, que es un documento de **cardiopatía reumática**, y `emCategoria()` los aplica sin mirar
`vm_morf`. La ESC/EACTS 2025 **no publica cortes de severidad de estenosis mitral** (verificado:
sólo un enunciado en prosa del área en el folio 4680, y el gradiente mencionado como consecuencia
con valor pronóstico, más la «low-gradient severe MS» con gradiente < 10 mmHg como grupo difícil —
ninguna de las dos cosas es un corte).

**Qué hace el panel mientras tanto:** cita a la ASE 2023 **sólo con etiología reumática** —lo fija
TC-327— y con otra etiología publica una nota que declara la discrepancia **sin nombrar el
documento y sin corchete**, porque nombrarlo sin bracket rompe la otra regla del registro. Se
pierde saber cuál es el documento; no se pierde que el corte se está aplicando fuera del alcance de
su fuente.

**Decisión de Maicol:** o se acota el criterio del gradiente a la etiología reumática en
`emCategoria` —que cambia el informe firmado de las degenerativas—, o se verifica una fuente que
escriba esos cortes para cualquier etiología, o se deja como está con la declaración.

### ⚠️ Cuatro contraindicaciones sin contestar NO cortan las filas de la tabla

De las siete de la Tabla 8, la app **mide** dos (área e insuficiencia mitral) y **pregunta** cinco.
El trombo sin contestar **sí** corta —la guía dice que el ETE se hace sistemáticamente en el
candidato para excluir trombo auricular, folio 4680— y el área sin medición también. Las otras
cuatro —calcificación severa o bicomisural, ausencia de fusión comisural, valvulopatía aórtica
severa o enfermedad tricuspídea combinada severa con indicación quirúrgica, y coronariopatía que
requiera revascularización— **no cortan**: exigirlas dejaría las cinco filas en «falta contestar»
para TODO paciente y la sección sería muda de fábrica. El aviso del bloque 2 lo declara con el
conteo («Quedan N contraindicaciones sin contestar, y no cortan las filas de abajo»).

### ⚠️ «No apto para comisurotomía» es una derivación de la aplicación

La fila 3 de la Recommendation Table 8 dice *«MV surgery is recommended in symptomatic patients who
are **not suitable for PMC**»* y la guía **no define** «not suitable»: es un juicio del Heart Team.
El panel lo deriva de «características clínicas desfavorables» —no de la anatomía, porque la fila 4
rutea la anatomía subóptima con clínica favorable a comisurotomía— y **lo declara en la propia
fila**. La alternativa sería preguntarlo como un control más.

### ⚠️ La definición del «score ecocardiográfico > 8» no se pudo leer

> **✅ LA TABLA S3 YA ESTÁ EN LA BIBLIOTECA (2026-10-12).** Vive en
> `.../04_Valvulopatias/ehaf194_supplementary_data.pdf`, p. 5, y está **verificada en texto
> completo** en `docs/fuentes/FUENTES.md`. Define el score de **Wilkins** y el de **Cormier** —así
> que «no se pudo leer qué escala es» dejó de ser cierto—, y **sigue sin dar el corte «> 8»**: ese
> lo ponen las dos notas ^c. El párrafo de abajo es el estado de 2026-10-11 y lo que queda abierto
> es sólo lo del bloque siguiente: **las dos frases del panel que todavía dicen que no se pudo
> leer**.

La nota ^c del folio 4682 escribe el corte y remite a su *Supplementary data online, Table S3*,
que **no está en el archivo de la biblioteca**. El panel publica el corte **«según la guía»** y
**no lo atribuye a Wilkins ni a ninguna escala concreta** — el artículo de Wilkins 1988 no menciona
ningún 8, y atribuírselo (como hacía la versión anterior, con su corchete en la fila) era afirmar
algo que ese documento no dice. Si alguna vez se consigue la Table S3, se verifica qué escala es y
entonces la fila puede nombrarla.

### ⚠️ Glosario del panel (2026-10-12) — TRES COSAS DECLARADAS Y NO TOCADAS

Las tres salieron de la tanda del glosario (`IND_TERMINOS`, los ⓘ de Cormier y del score). **Decisión
de Maicol del 2026-10-12: ninguna se toca en esa tanda**; van a una tanda de TEXTOS del panel.

**1 · Dos frases del panel afirman que la Tabla S3 «no está en el documento consultado», y hoy sí
está.** Son contenido clínico del panel, así que se reportan y se esperan:

| Dónde | Qué dice hoy |
|---|---|
| Nota de detalle de la sección de estenosis mitral (la del corte del score) | «La definición de esa escala vive en su material suplementario (Table S3), **que no está en el documento consultado**: la aplicación usa el corte tal como la guía lo escribe y **no lo atribuye a ninguna escala concreta**.» |
| Comentario de `index.html` sobre la fila del score | «…remite a su Supplementary data online, Table S3, **que no está en el material consultado** — o sea que la definición de la escala no se pudo leer.» |

Lo que la Tabla S3 cambia: la escala **sí** se puede nombrar (es el score de Wilkins, y la tabla lo
llama así). Lo que **no** cambia: el **«> 8» sigue siendo de la guía y no de Wilkins 1988**, que no
menciona ningún 8. O sea que si esas frases se actualizan, hay que conservar esa mitad —es la que
evita atribuirle a un artículo un corte que no publica— y el único cambio honesto es dejar de decir
que no se pudo leer. **La tarjeta nueva del término ya dice lo correcto**, así que durante un rato
el panel tiene las dos versiones.

**2 · El panel muestra DOS rangos del score y los dos son ciertos.**

| Dónde | Rango | Documento |
|---|---|---|
| Tarjeta del término `score_eco` | grados **1 a 4**, total **4 a 16** | ESC/EACTS 2025, Tabla S3, p. 5 (literal: «ranges between 4 and 16») |
| Nota de guías previas de la sección, y `IND_REFS.wilkins1988` | **0 a 4** por ítem, total **0 a 16** | Wilkins 1988, Tabla 2, p. 300 |
| Los `<select>` del módulo ETE y de Calculadoras | rotulados **«(1-4)»**, total **/16** | — |

No es un error de ninguno de los tres: la Tabla S3 reproduce la escala con otro origen.
⚠️ **Unificarlos es elegir a qué documento desmentir**, así que no se hace sin orden expresa. Si
alguna vez se unifica, el camino honesto es declarar los dos rangos con su fuente —no borrar uno—.
Y ojo con el tercero: los selectores de la app coinciden con la **Tabla S3** (1 a 4) y no con el
original, cosa que `FUENTES.md` ya tenía anotada como discrepancia con el artículo.

**3 · El encabezado de la mitad de Wilkins de la Tabla S3 dice «MVA» — probable error del
documento.** Literal: *«Assessment of **MVA** according to the Wilkins score»*. En ese mismo
documento `MVA` es la sigla de **mitral valve area** (está así en el pie de la propia Tabla S3 y en
la Tabla S2), y la mitad de Cormier —dos renglones más abajo— dice *«Assessment of **MV anatomy**»*.
El score de Wilkins puntúa **anatomía**, no área: los cuatro componentes son movilidad,
engrosamiento, calcificación y engrosamiento subvalvular, y ninguno es una medida de superficie.
**Por eso la tarjeta titula «Score de Wilkins (Tabla S3)» y NO traduce ese encabezado** — hacerlo
publicaría «valoración del área mitral según el score de Wilkins», que es falso. Decisión de Maicol
del 2026-10-12. No hay nada que corregir en la app; queda anotado para que nadie lo «arregle»
traduciéndolo, y para el día en que haya una errata de la guía que confirmarlo.

### Lo que QUEDA de la tanda del glosario, medido y no corregido

- **La tarjeta puede superponerse a su propia fila** cuando no entra ni abajo ni arriba del botón: a
  1200 × 900 la del score mide 611 y la caja permitida 844, con el botón al medio. Queda **entera,
  dentro del panel y sin un pixel tapado** —medido con `elementFromPoint` en las cuatro esquinas y
  el centro—; lo que se pierde es ver la fila mientras se lee la tarjeta. La alternativa era
  recortarla y hacerla scrollear siempre, que es peor para una tabla de referencia.
- **Contestar una pregunta clínica con la tarjeta abierta la CIERRA.** Es lo pedido —un control
  clínico está «afuera»— y está medido como tal; el re-anclaje queda para los repintados que no
  vienen de un clic. Si algún día se quiere que sobreviva al clic, lo que hay que cambiar es el
  oyente de «tocar afuera», no el re-anclaje.
- **Tab dentro de la tarjeta se gasta en cerrarla**, así que para seguir tabulando hace falta uno
  más. Es la alternativa a una trampa de teclado sin salida anunciada.
- **`docs/mapa/panel-evidencia.md` quedó en 35,3 KB**, apenas por encima del techo de ~35 KB que
  `ecosmart/CLAUDE.md` fija. El glosario ya salió a su propio archivo
  (`docs/mapa/panel-evidencia-terminos.md`, 15 KB) justamente por eso; **la próxima tanda que lo
  toque conviene que lo parta**, no que lo estire.

### ⚠️ Las dos contradicciones internas de la ESC/EACTS 2025, declaradas y no corregidas

- **El operador del área**: `≤ 1,5 cm²` en el enunciado del folio 4680 y en el título de la Figura
  14 (folio 4681), y `< 1,5 cm²` en el §10.2.3 del folio 4680. La app usa `≤`.
- **«Varias»**: la nota ^c de la Recommendation Table 8 (folio 4682) dice «several of the
  following» sin número, y la nota ^c de la Figura 14 (folio 4681) dice «Favourable = absence of
  unfavourable characteristics», o sea cero. El panel no elige: con «Una» publica las dos lecturas.

### Los dos lugares que siguen enunciando la regla vieja — RE-CENSADOS y NO tocados

Los dos ya estaban abiertos de la tanda anterior y esta tanda **no los modificó**; se re-verificó
que siguen igual (el diff de los dos commits toca sólo la zona del panel y el sello de versión):

1. **La tabla «Referencia clínica» de la ayuda** (`abrirAyudaEco`): su fila de severidad dice «AVm —
   **estenosis mitral severa** — ≤ 1,5 cm²», cita «**ESC/EACTS 2021**» —que tiene **cero** entradas
   en `FUENTES.md`— y su resumen sigue hablando de «**probablemente severa por …**», categoría
   eliminada el 2026-10-11. Ver «La pestaña Referencias enuncia la regla VIEJA» arriba.
2. **`_labEstenSev` del Laboratorio**: hace regex sobre el valor guardado y devuelve «Severa» donde
   el informe del mismo estudio imprime «significativa»; su comentario sigue describiendo el select
   viejo (`sin/esclerosis/leve/moderada/severa`). Ver «El Laboratorio cuenta la EM con la escalera
   de cuatro grados» arriba, y conviene resolverlo junto con el pendiente de la **tricúspide**.

---

## EN SUMA · morfología y prótesis (2026-10-05, parte D) — declarado y NO arreglado

De la tanda «EN SUMA: morfología y prótesis en una línea (pulmonar y tricúspide)». Nada de esto es
un defecto introducido por esa tanda: los tres están **medidos en HEAD y en el cambio con el mismo
resultado**. Los encontró `/sharp-edges` corriendo sobre el propio diff.

### ⚠️ El grado calculado con cortes NATIVOS sobrevive al cambio a prótesis

**Qué se midió.** Dos gestos, en el orden del día a día:

| gesto | pulmonar | tricúspide |
|---|---|---|
| 1 · cargar el dato con la válvula nativa | `vp_vmax = 3.5` → `calcVP` escribe `ep_grado = 'Moderada'` | `et_gmedio = 6` → `calcET` escribe `et_grado = 'Significativa'` |
| 2 · elegir la prótesis en Válvulas | `ep_grado` sigue en `'Moderada'` | `et_grado` sigue en `'Significativa'` |

El `onchange` de `vp_morf` es `vpSync();valvProtSync()` y el de `vt_morf` es `valvProtSync()`:
ninguno limpia el `<select>` de grado ni vuelve a llamar al calculador — y si lo llamara, saldría
por `protNoGraduaPintar` **antes** de tocarlo.

**Qué causa.** El informe firmado gradúa con cortes de válvula nativa lo que la app se niega a
graduar. Y **el cuerpo ya lo hacía en HEAD**: imprime «Válvula pulmonar con prótesis biológica y
estenosis moderada (Vmax 3.5 m/s, Gmax 49 mmHg)». Lo que cambió con D es sólo el renglón del
resumen, que pasó de «EP moderada.» a «VP protésica biológica con estenosis moderada.» — o sea que
D hizo el resumen **coherente con el cuerpo**; la fuga está aguas arriba, en el campo de grado.

**Peor en la pulmonar:** el badge `vp-sev-badge` sigue diciendo «Sugerido automáticamente por Vmax
3.5 m/s → Gmax 49 mmHg…» sobre una válvula cuyo badge debería decir `PROT_SIN_GRADO_TXT`, porque
`calcVP` sólo corre desde el `oninput` del Doppler. La pantalla se contradice con su propia regla.

**Por qué no se corrigió.** Retirar el grado residual al cambiar de morfología cambia el criterio
de una válvula protésica en el informe firmado —decisión de Maicol— y el `onchange` es código
compartido con el resto de la sincronización de válvulas. **Alternativas, sin elegir ninguna:**
(a) que el `onchange` de la morfología devuelva el grado al centinela cuando pasa a prótesis — el
gesto más honesto, pero reescribe un campo que el médico pudo haber fijado a mano;
(b) que el emisor no publique grado de estenosis con prótesis (ni en el cuerpo ni en el resumen),
dejando `VP protésica biológica.` y los valores medidos — no toca ningún campo, pero borra del
papel un grado que el médico quizá fijó a propósito;
(c) repintar el badge al cambiar la morfología y dejar el grado como está — arregla la pantalla y
no el papel.

### ⚠️ «VT protésica biológica con estenosis no significativa.»

El grado de la ET es binario y `No significativa` es un valor elegible a mano (o traído por un
legado), así que la línea única puede decirlo. Es una frase **por la negativa** y, sobre una
prótesis, una afirmación de función conservada construida con cortes que la app declara
inaplicables — justo lo que la compuerta (3b) del bloque de «normofuncionante» existe para
impedir. En HEAD el mismo estado salía como `ET no significativa.`, así que no es nuevo.
No se tocó: es redacción clínica. Alternativa, sin elegir: en la rama protésica empujar la lesión
sólo con grado afirmativo y callar con «No significativa» (callar no es negar).

### ⚠️ El nivel de la EP se cae del EN SUMA con prótesis (no del cuerpo)

Medido: con `vp_morf = 'Prótesis biológica'`, `ep_grado = 'Moderada'` y `ep_nivel = 'Supravalvular'`,
el EN SUMA pasa de «EP moderada a nivel supravalvular.» (HEAD) a «VP protésica biológica con
estenosis moderada.». El **cuerpo lo conserva** («…y estenosis moderada a nivel supravalvular.»),
así que no desaparece del papel; desaparece de la superficie que se copia al resumen de alta.
El formato que Maicol escribió para la línea única no lleva nivel, y agregarlo es cambiar ese
formato. Alternativa: `«VP protésica biológica con estenosis moderada a nivel supravalvular.»`.

### Lo que NO es alcanzable y queda dicho, para no reabrirlo

- **`VP protésica transcatéter tipo TAVI.`** — `VALV_MORF_FRASE` tiene la entrada `TAVI`, así que
  `sumaProtLinea` la redactaría; pero `TAVI` **no es una `<option>`** de `vp_morf` ni de `vt_morf`,
  y el importador descarta la fila entera ante un valor que no está en la lista. No se agregó
  ninguna guarda: agregarla sería código para un estado que no se alcanza.
- **«con estenosis» sin grado en la PULMONAR protésica** — `_epSinGrado` lleva `!_epEsProt` adentro
  desde E5b-1, así que el escalón «botón prendido sin grado» no afirma estenosis en ninguna
  superficie. La tricúspide sí lo alcanza, por `etPill`. Lo fija TC-419 como límite declarado.

## 3D E2 (2026-10-04) — declarado y NO arreglado

De la tanda «color por territorio coronario + captura». Nada de esto es un defecto introducido:
son cosas medidas durante el trabajo que quedan abiertas porque están fuera del alcance del pedido
o porque son decisión de Maicol.

- **El VI 3D no tiene ni un caso en `test_clinico.mjs`.** `grep lv3d scripts/test_clinico.mjs` da
  **cero**: los 429 casos no tocan el panel. Toda su cobertura vive en sondas temporales
  —`scripts/_probe_vi3d.mjs` (tanda E1) y `scripts/_probe_vi3dcolor.mjs` (ésta, 101 aserciones)—
  que están versionadas pero **nadie corre automáticamente**. Es exactamente el patrón de EcoSmart
  S3/S4: cerrados pero sin cobertura automática, que es cómo un arreglo se deshace sin que nadie
  se entere. Pasar las aserciones a la suite es un trabajo aparte.
- **La brújula se corta y se superpone en la vista por defecto.** «Sep» se dibuja con x negativa y
  se recorta contra el borde izquierdo, y «Punta» pisa a «Lat» porque con la rotación identidad el
  eje de la punta proyecta sobre el origen de la brújula. Es **preexistente** (el código de la
  brújula viene de E1 y no se tocó), pero ahora queda horneado dentro del PNG de la captura, que
  es una imagen pensada para un informe. Se ve en `/tmp/vi3d_*_{claro,oscuro}.png`.
- **El comentario de `index.html` sobre la tarjeta del 3D dice «Lo mide TC-408» y es falso.**
  TC-408 es el escalón de estenosis pulmonar. El caso que mediría la maquetación de esa tarjeta no
  existe. Referencia cruzada rota de la tanda E1.
- **`scripts/check_mobile.js` no abre el panel del 3D**, así que no mide ninguno de sus controles.
  Su informe salió **byte a byte idéntico** a HEAD, pero para los controles nuevos eso es un cero
  sin denominador, no un aprobado: lo táctil del panel lo mide `_probe_vi3dcolor.mjs` (`LAY-2`,
  con el panel abierto a 1200/768/390/360 px).
- **La escalera de tonos tiene un paso apretado, y es el de la CD.** Normal ↔ Hipoquinesia de la
  circunfleja derecha da **8,9 ΔE2000**, el peor de los doce pares vecinos. No es «demasiado
  parecido» —8,9 se distingue cómodo— pero es el que menos margen tiene, porque la base de la CD
  (`#3ecf8e`, L\* 74,6) ya es la más clara de las tres y deja poco techo para dos pasos más claros.
  Separarlos más obliga a bajar el extremo oscuro o a mover el color base: **decisión de Maicol**.
- **`_lv3d.fase` sobrevive a `limpiarCampos`.** Abrir un estudio nuevo arranca el latido donde lo
  dejó el anterior en vez de en fin de diástole. No es fuga de dato del paciente —es estado de
  vista y la animación corre igual— pero sí hizo fallar dos veces la sonda, que creía estar
  midiendo con la fase congelada en 0. Si alguna vez molesta, se resetea en `lv3dNuevoPaciente`.

## ✅ CERRADO 2026-10-03 — la aórtica entró, y por una tercera salida

La decisión de Maicol no fue ninguna de las dos que este archivo ofrecía. **El invariante es
«botón prendido = hay valvulopatía», y elegir «Sin» APAGA el botón** — por los dos gestos: el menú ▼
(`valvSev.aplicar`) y el desplegable de grado final (`_gradoManoBorraMarca`, `emGradoManual`,
`imGradoManual`). Con el botón apagado, el estado 3 llega al emisor sin la tercera mitad de la
compuerta, así que `EA_ESCALON_SIN_GRADO` pudo ponerse en `true` **sin tocar la regla de la marca**:
«Aórtica 3b» queda intacta y por el desplegable siguen sin aparecer el aviso rojo ni el cajón.

Eso descartó las dos salidas de antes: la (a) traía el aviso y el cajón por ese camino, que era su
precio, y la (b) dependía de un `dataset.sugerido` ausente en un formulario en blanco.

Commits: `23eb4e2` (el invariante y el escalón) y `e8b03c5` (los defectos hermanos).
Casos: **TC-397** promovido de `casoAbierto` a `caso`; **TC-399** reescrito —pineaba el
comportamiento «en espera» a propósito—; **TC-402 … TC-407** nuevos. Mutaciones en
`scripts/_mut_sinapaga.py`.

### ⚠️ Lo que quedó abierto de la aórtica, medido y NO corregido

- **«Sin» en el desplegable aórtico no es durable.** Apagar el botón es un rastro, pero el
  autocálculo no lo respeta: reabrir el botón corre `sincronizarEADesdeValvulas → calcAo →
  clasificarEA_Vmax`, que no mira la pastilla y no tiene marca que lo frene, así que **regrada a
  «severa»** y el informe firmado publica «EAo severa.» sobre un «Sin estenosis» que el médico
  acababa de elegir. Medido el 2026-10-03 (escena `H-VUELTA-ea`). Control: la mitral lo conserva,
  porque su `onchange` sí enciende `esqSevManual`.
  Es **pre-existente** —no lo causa el escalón— y cerrarlo exige una señal nueva que sobreviva al
  recálculo sin ser `esqSevManual`: por ejemplo un `dataset.sinExplicito` en el `<select>`, que
  `limpiarCampos` barra y que las escritoras automáticas respeten. Eso es la decisión que «Aórtica
  3b» excluyó, así que **es tuya**.
- **Con prótesis aórtica el escalón de insuficiencia calla, a propósito.** La frase protésica tiene
  otra forma: `Válvula aórtica <morf>, <veredicto protésico><, insuficiencia …>`, sin el «con» que
  en la nativa carga el token. Con el escalón corriendo salía «…, sin datos suficientes para graduar
  la estenosis protésica, insuficiencia.» — un sustantivo colgado. Lo destapó el A/B de las 47
  escenas (`H11-prot-ia`), no la lectura. La prótesis quedó **exactamente** como en `42a1f0e` y el
  hueco se declara: una prótesis aórtica con la pastilla de insuficiencia abierta y sin grado sigue
  sin afirmar nada. Darle texto propio es escribir una frase de informe firmado — decisión tuya.
- **Apagar por regla deja la clave `valv-pill-*` en `'0'`**, que para `valvAutoAbrirCajones`
  significa «el médico lo cerró a mano, no reabrir». O sea que elegir «Sin» revoca la apertura
  automática de ese cajón en ese estudio. Se acepta —el médico dijo que no— y el daño que tenía
  (un grado publicado con su bloque invisible) lo cierra la mitad `hayGrado` de `valvGradoVisSync`.

### Lo demás que la tanda del `c808e69` reportó y no corrigió
- **La tricúspide tiene el mismo mecanismo sin gatear**: `etPill` y `hayIT` leen `pillOn` y no
  consultan `esqSevManual.et` / `.it`, que existen y se escriben. `et_grado` no tiene `onchange`
  (no marca, no repinta), el menú ▼ no ofrece «Sin» para esa válvula, y **cerrar su cajón borra el
  grado Y la marca**, así que cerrar y reabrir convierte una ET graduada en «Estenosis tricuspídea.»
  sin grado. Además su EN SUMA dice la frase larga donde la mitral ahora dice la sigla.
- **La pastilla es estado del navegador, no del estudio.** `toggleValvPill` la persiste en
  `localStorage` y `limpiarCampos` la borra; no viaja con el estudio guardado. Desde esta tanda ese
  estado decide texto del informe firmado: **el mismo estudio puede firmar «con estenosis» hoy y
  «sin estenosis ni insuficiencia» al reabrirlo mañana**, y nada en el estudio explica la
  diferencia.
- **El discriminador es una ausencia**, que es el estado de fábrica de todo estudio legado (la marca
  se persiste recién desde que existe el oculto `#sev_manual`). Hoy lo frenan `limpiarCampos`
  borrando las claves `valv-pill-*` y `valvAutoAbrirCajones` abriendo sólo con grado leve o mayor;
  las dos son frágiles frente a un clic.
- **La tarjeta pre-PDF marca sólo `if (cambio)`**: confirmar «Sin estenosis» sin tocarlo no deja
  marca. La tarjeta que existe para evitar el defecto podría producirlo.
- ~~**R6 (`sevSincronizar`) suelta la marca sola y en silencio**, y `eaGradoCalculado` sí emite
  `'sin'`: el camino automático puede dejar grado `'sin'` sin marca y con la pastilla abierta.~~
  **[CERRADO 2026-10-03, `23eb4e2`]** Era exactamente eso, y con el escalón encendido publicaba
  «EAo.» en el firmado sobre un paciente con Vmax 1,8. `sevSincronizar` apaga el botón **dentro de
  la rama de R6** y sólo ahí: aplicar la regla en cada sincronía apagaría el botón del estado 2 y el
  escalón no volvería a dispararse. Lo fija **TC-406**, con su control negativo (R6 que suelta a un
  grado real no apaga nada). El hermano del **retiro por insumo fuera de banda** —que dejaba el
  mismo estado con el badge diciendo «no gradúa»— se cerró con una cuarta compuerta por
  `bloqueado()`, en el mismo caso.
- **Las leves pulmonares perdieron la lista blanca de vocabulario** que el filtro
  `/moderada|severa/` hacía de refilón. El día que `ip_grado` recupere «Fisiológica» o «Trivial»,
  el EN SUMA firmado dirá «Insuficiencia pulmonar fisiológica.» como hallazgo de conclusión sin que
  nadie toque `generarInforme`.

---

## Etapa de cálculos (mitral)

- El AVm por continuidad inválido (IAo moderada o severa) sigue alimentando `avmMax` y la
  contraindicación por área: decisión de voto, pendiente.
- El selector «Incluir en el informe» deja imprimir una continuidad inválida.
- `index.html` ~22263 afirma que `calcEM` vacía `avm_cont` con `emContValido()` falso; no lo hace
  (el gate es la casilla): corregir comentario.
- Negación tranquilizadora del informe con valores fuera de banda en `avm_plan`, `avm_cont` y
  `em_gmedio`. Eran cuatro: `avm_ete` salió el 2026-10-08 al dejar de ser una fuente, y era el único
  de los cuatro **sin banda en ninguna tabla**, o sea el que ni llegaba a `cat.revisar`.
- AVm indexada (`avm_idx`): marca de pantalla cuando viene de la continuidad; el Excel exporta el
  valor crudo.
- Piso de 20 ms del THP: un THP real por debajo se retiraría del informe.
- Estudios de prótesis guardados antes del cambio: el narrativo congelado publica el área y la
  tabla del PDF dice «no evaluable».
- Ratio VTI mitral/VTI TSVI protésico (≥2,5): hoy se retira desde IAo moderada; revisar si
  corresponde (la Tabla 12 de ASE 2024 no condiciona por IAo).
- Calculadora de severidad de IM: gradúa la secundaria con cortes de primaria; hay aviso en
  pantalla, sin decisión de grado propio.
- Abrir un estudio guardado arrastra las respuestas del panel de Evidencia; `cerrarSesionReal` no
  limpia `_indClin`.
- Wilkins: unificar `calcWilkins` y `cxWilkins`; al hacerlo, atribuir el ≤8 de la leyenda a la
  guía ESC; la escala (1-4) de los selectores NO se cambia.

## Aórtica — declarado en la tanda 2/3 (2026-10-01) y NO arreglado

Lo de abajo está **medido en Chrome**, no supuesto, y **espera decisión de Maicol**: son cortes,
fórmulas y rótulos clínicos, que por la regla del repo se reportan y no se tocan.

- **[CORREGIDO 2026-10-01, tanda 2b] La fracción regurgitante de la IAo usaba el denominador
  equivocado y fallaba hacia «menos severa».** Hacía `volR/(volR+vsv)`, donde `vsv` es el volumen
  sistólico del TSVI. La ASE 2017 (Zoghbi, **folio 311**) define *«RF is then derived as the RVol
  divided by the SV through the regurgitant valve. Thus, RVol = SV_RegValv − SV_CompValv;
  RF = RVol/SV_RegValv»*, y la **Tabla 14** (**folio 339**) da el método de la IAo: *«SV method:
  RVol = SV_LVOT − SV_MV»*. En la IAo la válvula regurgitante **es la aórtica** y su SV se mide en el
  TSVI: `vsv` **ya contiene** el regurgitante. Hoy es `volR/vsv`, con guarda `vsv > 0`.
  Medido antes/después con EROA 20 mm², VTI del jet 200 cm, Ø TSVI 20 mm y VTI TSVI 20 cm:
  **39 % → 64 %**, y el grado integrado **moderada → severa** en las cuatro superficies. Fijado por
  **TC-350**. ⚠️ **No es una duplicación con la mitral:** `calcIM_ESC` usa `volR/(volR+vsv)` y ahí
  **está bien**, porque el SV mitral *es* `volR + vsv`; `calcContIM` ya usaba `volR/vmit` con guarda
  `> 0`, que es la forma correcta. Un «dueño único» de la cuenta sería el error.
- **🔴 `itv_tsvi` y `diam_tsvi` NO llaman a `calcIA_ESC`, y la tanda 2b lo volvió mucho más caro.**
  Sus `oninput` llaman `calcAo(); … imSyncSiExiste(); emSyncSiExiste()` — la **mitral** sí se enganchó
  (`imSyncSiExiste` existe exactamente para esto), la aórtica no. Antes `vsv` estaba diluido en
  `volR+vsv`; ahora **`FR ∝ 1/vsv`**, así que corregir el Ø del TSVI de 20 a 22 mm deja en pantalla la
  FR del valor viejo **y no recalcula `ia-sev` ni `ia_grado`**, que es lo único de este bloque que baja
  al informe, al EN SUMA, al PDF y al Excel, y lo que gobierna `_indIA`. También queda obsoleto
  `ia-jet-ratio`, que lee `diam_tsvi`. Se cierra con un `iaSyncSiExiste()` calcado de
  `imSyncSiExiste` en los dos `oninput`. **No se hizo acá**: es cableado nuevo, merece su propio
  commit y su propia mutación. Lo encontró `/sharp-edges` sobre el diff de 2b.
- **La FR de la IAo perdió la cota implícita del 100 %.** `volR/(volR+vsv)` no podía pasar de 100 %;
  `volR/vsv` sí. Con el error de unidad que este repo ya documenta —Ø TSVI tipeado en cm, 2 por 20—
  `vsv` da 0,628 ml y la FR sale **6369 %**, impresa bajo el rótulo «Fracción regurgitante (%)», y
  vota severa. Con la fórmula vieja el mismo error daba 98 %. La IAo **sigue sin banda de
  plausibilidad** (`CHM_RANGO` no cubre `ia_pisa_r`, `ia_pisa_val`, `ia_vmax_cw`, `ia_vti`,
  `itv_tsvi` ni `diam_tsvi`), mientras la mitral publica con `MARCA_REVISAR` y **retira el voto**
  (`if (!_frDud)`). Opciones: tratar `fr > 100` como no valorable —precedente: `calcContIM` con
  «No valorable — revisar mediciones»—, o extender la banda y copiar el patrón `_frDud`. **Es
  decisión clínica de Maicol**, por eso quedó declarado y no resuelto.
- **Los calc-val de la IAo no se limpian cuando el insumo desaparece.** `ia-eroa`, `ia-volr` y
  `ia-jet-ratio` no tienen `else`: borrar el radio del PISA deja la fila afirmando el número
  retirado, y reimprimir un estudio sin PISA encima de otro que sí lo tenía conserva los del
  paciente anterior (`cargarEstudioPorId` corre `calcIA_ESC()` sin barrer los span). La mitral lo
  resolvió con `_pisaLimpiar`. Atenuante **medido**: ningún emisor lee esos tres span —el PDF de
  IAo imprime VC, PHT y AT; el Excel sólo `PHT IAo`—, así que queda en pantalla. Pero en pantalla
  es donde se decide. `limpiarCampos` sí los barre, así que «Nuevo estudio» no arrastra.
- **El VTI del TSVI negativo sigue llegando al PPT.** La tanda 2b lo cerró en `calcIA_ESC`, pero
  `calcAo` hace `if (dtsvi && itsvi)` sin `> 0` y publica `vs-val`, que el PPT entrega como «Volumen
  sistólico». Los inputs no tienen `min`. Queda la app diciendo dos cosas del mismo dato: en IAo
  «no valorable», en el PPT un número negativo. **No se tocó** — fuera del alcance de este diff.
- **⚠️ EFECTO RETROACTIVO SOBRE ESTUDIOS GUARDADOS — segunda entrada (la primera es la del corte de
  velocidad telediastólica, tanda 2/3).** No se migró nada, pero `cargarEstudioPorId` vuelve a correr
  `calcIA_ESC()` al reabrir, así que **la FR se recalcula**. La FR vieja era **siempre menor** que la
  nueva —el denominador era mayor—, de modo que un estudio archivado puede **subir** de grado al
  reabrirse y **nunca bajar**. Sumado al corte de 2/3, un mismo estudio reabierto hoy puede decir
  «severa» donde el papel impreso decía «moderada». Queda declarado, no migrado.
- **El grado 3 («Moderada-severa») lo ofrece el `select` `ia_sev_final` y `calcIA_ESC` no lo emite
  nunca.** La cascada solo produce `'4'`, `'2'` y `'1'`. Solo se llega a 3 eligiéndolo a mano, y
  hacerlo **apaga el panel de conducta**, que abre con `ia_sev_final === '4'`. La categoría sí existe
  en la ASE 2017 (tabla de IAo, folio 340, con cuatro columnas), así que la opción no es inventada:
  lo que falta es que la integración sepa emitirla, o que se retire del `select`.
- **Fail-open por unidad en `ia_vmax_td`, agravado por el corte nuevo.** El campo **no tiene banda de
  plausibilidad** (`CHM_RANGO` cubre `ia_vmax_cw` y `ia_pht`, no éste). Una velocidad tipeada en m/s
  —`0,25` en vez de `25`— cruza la guarda `if (vmaxTD)`, no alcanza los 20 y la pantalla contesta
  «No gradúa (< 20 cm/s) — la guía sólo publica el corte de severa»: un criterio de severa cumplido
  se pierde detrás de una frase con autoridad de guía. Toda la banda fisiológica en m/s (0,2-0,6)
  cae en esa ventana muerta. Igual con negativos (el equipo muestra la reversión con signo).
- **`if (vmaxTD)` descarta el cero medido.** «Busqué la reversión y no hay» se trata como «no hay
  dato». El módulo TAVI ya resolvió esta distinción con `cero()` y `_medidoCero`, y usa
  `velT != null`: dos lectores del mismo parámetro físico con guardas distintas.
- **El rótulo dice «Vmax telediastólica» y la guía pide EDV** (velocidad *al final* de la diástole),
  no el pico del flujo reverso. Son números distintos del mismo trazado y el pico siempre es mayor.
  Con el techo viejo de 200 cm/s la confusión era inofensiva; con el corte en 20 decide el grado, y
  hacia severa. Además el badge **afirma** «reversión holodiastólica» a partir de una sola velocidad,
  mientras el módulo TAVI exige la conjunción (`flujo==='holo' && velT>=20`, con un `select` propio).
- **`ia_vmax_td` no sale en el PDF, ni en el Excel, ni en el importador.** Con `severa >= 1` puede ser
  el **único** votante del grado que firma el informe: un papel que dice «insuficiencia aórtica
  severa» sin la fila que lo sostiene, y un round-trip de Excel que pierde el dato. Era deuda barata
  mientras el parámetro casi no podía votar severa; ahora no lo es.
- **Grado rancio en la IAo, límite ya declarado.** Bajar 25 → 15 cm/s sin limpiar deja el grado
  severo en pie (`params` vacío → early return antes de reescribirlo) y la pantalla se contradice:
  el renglón dice «No gradúa» sobre un grado severo. Retirar el grado auto-derivado en nativa es
  **decisión tomada de Maicol — «NO se toca»** (comentario de `calcIM_ESC`). Queda fijado por TC-348
  para que el límite sea visible y no cambie en silencio.

## Aórtica — declarado en la tanda 1/3 (2026-10-01) y NO arreglado

Sale de `/sharp-edges` sobre el diff de esa tanda. Está medido, no supuesto.

- **Cinco superficies más publican `ea_grado` con cortes nativos sobre una prótesis.** La tanda 1/3
  cubrió tres de ocho (EN SUMA, fila del PDF, `gEA` del Excel). Faltan: `_pptSel('ea_grado')` en el
  PPT; `VALVSIG` en el export a CeiboAnalytics (`sig=1` por `/severa|moderada/`); `_labEstenSev` en
  el PDF de auditoría del Laboratorio; el indicador «EA moderada-severa sin gradiente documentado»;
  y `_tieneValv`/`_labValvCounts`/`sevTable` (buscador, filtro y distribución). Se cierran con una
  línea cada una usando `eaGradoNoPublica(inf.campos.va_morf)`. No se hicieron en la misma tanda que
  el informe firmado para no mover estadísticas del Laboratorio a la vez. El censo está en el
  comentario de `eaGradoNoPublica`.
- **`VALV_PROT_OPCIONES` no tiene assert**, y es la única lista literal paralela a los selects que
  no lo tiene (`_labXlsAssertListas` y `_eteVmAssertPares` son el molde). Una opción de prótesis
  nueva o renombrada apaga SIETE compuertas de un golpe, sin error ni caso rojo. El caso que parece
  cubrirlo (`valvEsProtesis` contra la visibilidad del bloque) compara el predicado contra sí mismo:
  es una tautología en la dirección que importa. Falta un `_valvProtAssertOpciones` que recorra las
  opciones de los cuatro selects y grite si el texto dice prótesis/TAVI/SAVR y el predicado dice no.
- **El `<option>` de `ea_grado` severa dice «Vmax >4 m/s» y el motor decide con `>=`.** La tarjeta de
  pantalla y ahora el PDF dicen `≥4,0`; el selector que el médico lee mientras elige el grado quedó
  con el operador viejo. Es rótulo clínico: se reporta y se espera (`index.html` ~3724).
- **Los decisores no leen `EA_CRIT`.** `clasificarEA_Vmax`, `calcEADetalle` y `_indEA` comparan contra
  literales (`4.0`, `40`) mientras el `ref` del PDF ya deriva de la constante: mover `EA_CRIT.vmax`
  cambiaría la escala impresa y NO el grado. Y `_eaAssertUmbrales` compara valores, no operadores, así
  que un cambio de `>=` a `>` pasa en silencio. Lo correcto es un predicado compartido
  (`eaVmaxEsSevera`/`eaGmedEsSevero`), como `avaEsSevera` ya hace con el AVA. Toca operadores del
  motor: fuera del alcance de la tanda 1/3.
- **La abstención de `calcEADetalle` avisa sólo en pantalla.** Con AVA no valuable el grado anterior
  queda en el `<select>` y las cuatro superficies lo publican; el único aviso es `#ea-ava-badge`. Es
  la convención que `sugerirSeveridadEA` ya fijó, no algo nuevo, pero el canal que podría llevarlo al
  informe —`window._eaBajoGradiente`— tiene tres escrituras y **cero lectores**: hoy es código muerto.
  Decidir si el EN SUMA debe emitir «el grado consignado no se actualizó» (es texto del informe).
- **El Excel afirma el negativo en vez de abstenerse.** Con prótesis `gEA` queda en `''` y `bin()`
  devuelve `0`, así que `EAo_III (Severa)=0` dice «no hay estenosis severa» en lugar de «desconocido
  en esta escala». Un denominador de prevalencia construido sobre esa planilla cuenta la prótesis como
  negativo confirmado. Maicol aprobó los tres binarios en `0` el 2026-10-01; pasarlos a `''` es una
  decisión aparte y toca el round-trip del importador.
- **`va_morf` arranca en «Trivalva normal» y no tiene opción vacía**, así que una prótesis cuya
  morfología no se consignó deja las ocho guardas apagadas. Hay un dato cruzado para detectarlo
  (`vab_cx_valvular`). Migrar o agregar opción vacía toca datos guardados.

## Aórtica (próxima válvula)

- Reordenar el bloque «Estenosis Aórtica — Datos del Doppler»: fila 1 Vmax Ao, G. máx, G. medio;
  fila 2 Ø TSVI (auto), VTI TSVI, VTI Ao, DVI; fila 3 AVA continuidad y campo nuevo AVA por
  planimetría.
- Verificar que los dos «Ø TSVI auto ← Doppler» no se sincronizan con el diámetro de TSVI de la
  pestaña de aorta.
- Estenosis aórtica: el grado final aparece como «Severa (Vmax >4 m/s)» con la leyenda «sugerido
  por AVA continuidad (1,85 cm²)» mientras el recuadro dice «Sin estenosis / leve»: revisar.
- Rótulos «ESC 2021» en las etiquetas de severidad (guía vigente: ESC/EACTS 2025).

## Maquetación de Válvulas — declarado en la tanda del 2026-10-03 y NO arreglado

- **El menú de severidad depende de `:has()`, y sin soporte vuelve el recorte EN SILENCIO.**
  La regla `#tab-valvulas .card:has(.valv-sev-menu.open){overflow:visible;}` es lo único que evita
  que `.card{overflow:hidden}` corte el menú. `:has()` existe en Chrome 105+, Safari 15.4+ y
  **Firefox 121+**; en un navegador anterior la regla se descarta sin error ni aviso y vuelven a
  perderse tres opciones de la aórtica —«Moderada» y «Severa» de estenosis, y la última de
  insuficiencia—. El modo de fallo es «el médico elige Severa y no pasa nada», indistinguible de
  un clic mal dado. **La suite no puede detectarlo**: TC-395 corre por CDP contra el Chrome del
  sistema, así que es cobertura en Chrome, no cobertura del arreglo en otro navegador. La app se
  usa en Chrome, así que hoy no es un defecto activo — pero la dependencia queda declarada.
  Si alguna vez hay que soportar Firefox viejo o iOS <15.4, el camino ya resuelto en la app es el
  de `.igio-menu`: `position:fixed` + `max-height`, que además arregla el menú abierto por debajo
  del pliegue, algo que `:has()` no toca.

- **El rótulo por defecto del grado final quedó con 2 px de margen a 1200 px.**
  «— Sin insuficiencia / no evaluada» mide 197 px y es la opción seleccionada de fábrica de
  `im_sev_final` e `ia_sev_final`. Con el reparto 1:1 viejo le sobraban ~43 px; con el `grow:2` del
  cajón le quedan 2. **Sigue entrando** y está pineado por TC-396, así que si se trunca el caso se
  pone en rojo en vez de descubrirse en un informe. Las dos salidas son decisión de Maicol:
  acortar el rótulo —es texto clínico— o bajar el `grow`. No se tocó.

- **A 756 px ese mismo rótulo de 197 px NO entra, y eso es PREVIO a esta tanda.** Con el reparto
  1:1 el select medía 161 px (útil 129) y ya truncaba; con `grow:2` mide 157 (útil 125). El cambio
  no lo causó ni lo arregló. Mismo par de salidas que el punto anterior.

- **El cajón de la IA es el único sin lista de opciones** (sólo título, label y un input de texto),
  así que el `grow:2` le saca 41 px al select para dárselos a un cajón que no los necesita para
  repartir columnas. Se dejó uniforme en las cuatro filas a propósito —una sola regla— y ahora
  TC-396 lo mide. Si alguna vez molesta, el reparto se acota a los cajones con `.valv-fund-opc`.

## Visor de imágenes (cineloop)

- Modo mínimo: al abrir solo Reproducir, Capturar, Medir y la cruz de cierre; Medir es un
  interruptor que muestra/oculta el resto; siempre arranca en modo mínimo.

## Imágenes (después de las CC)

- Calibración automática por DICOM.
- VI en 3D interactivo a partir de los trazados A4C/A2C/A3C.
- Mitral esquemática animada.

---

## Strain de la AI y onda L (2026-10-12) — DECLARADO y NO arreglado

### S1 · El strain de CONDUCTO no entra en ningún algoritmo, y es de la fuente

Censado en los dos PDF completos: la **BSE 2024** sólo habla del *volumen* de conducto, en la
fisiología de la pág. 7; la **ASE 2025** lo nombra en el protocolo de adquisición y en la tabla de
abreviaturas del folio 546, y en ningún algoritmo. El campo `ai_strain_cd` existe porque Maicol lo
pidió, **se guarda con el estudio, no vota y no tiene columna de Excel**. No es un hueco: es lo que
dicen las guías.

### S2 · La ASE 2025 tiene CINCO parámetros suplementarios y la app implementa UNO

La nota ‡ de la Figura 3 (folio 554) lista: velocidad telediastólica de la IP ≥ 2 m/s, PAP
diastólica ≥ 16 mmHg, **onda L ≥ 50 cm/s**, Ar−A > 30 ms y caída de la E/A ≥ 50 % con Valsalva; el
folio 555b suma la IM diastólica, la terminación precoz del llenado y la amplitud de la Ar > 35 cm/s.
Esta tanda implementa la onda L, que es la única con campo. **Los demás los agrega otro trabajo**, y
la etapa quedó armada como una LISTA (`ASE_SUPLEMENTARIOS`) para que entren sin reestructurar nada.

**Consecuencia declarada:** con la onda L negativa la app **no afirma presión normal** y se queda en
el «No estimable» de HEAD. La flecha «None» de la figura sale de haber preguntado los cinco; la app
puede preguntar uno. Cuando entren los otros cuatro habrá que decidir si con todos evaluados y
negativos se afirma presión normal — y eso es cambiar un texto del informe, o sea decisión de Maicol.

### S3 · El Ar−A de la ASE 2025 no entra en la lista de suplementarios

Existe `venpArA()` y la BSE ya lo usa con su propio corte (`> 30`, `BSE_ARA_SUPL`), y la nota ‡ de
la ASE escribe `Ar-A duration > 30 ms`. **No se agregó** porque la orden lo asignó explícitamente a
otro trabajo, junto con la velocidad de Ar, la IP telediastólica y la PAP diastólica.

### S4 · El `soloE` de la ASE 2025 no mira la onda L

Un paciente con el e′ y la onda L como únicos datos sale «Datos insuficientes para clasificar
presión de llenado» —el texto de HEAD, sin cambios—, porque para llegar a los suplementarios hay que
pasar por las tres principales y por el segundo paso. Es lo conservador y es lo que hace la figura,
pero queda dicho: el dato está cargado y no se usa en esa escena.

### S5 · El informe nombra el strain de contracción con su VALOR ABSOLUTO

`_bseDetalles` escribe «strain de contracción de la AI 13,5 %» aunque el médico haya tipeado −13,5,
porque 13,5 es lo que votó. El campo y el Excel conservan el signo. Si alguna vez se prefiere
imprimir el crudo, es cambiar una frase del informe firmado.

### S6 · Siete comentarios de `index.html` siguen diciendo «434»

Son frases que registran una MEDICIÓN pasada —«verificado en el A/B de 434», «la fila de 434
columnas no se mueve», «las 434 columnas quedan idénticas»— de tandas anteriores. **No se
reescribieron a propósito**: cambiarlas diría que aquellas corridas compararon 435 columnas, y no
fue así. Las frases en presente sí se actualizaron.

### S7 · El conducto y la onda L NO sobreviven a un round-trip por Excel

Los dos viajan con el estudio guardado (el barrido de `guardarInforme` los toma por su `id`) pero
**no tienen columna de Excel**, por orden expresa. Consecuencia: exportar una cohorte a Excel y
volver a importarla deja esos dos campos vacíos, mientras el LARS y el strain de contracción sí
vuelven. No es un defecto del round-trip —ninguna columna se desalinea—, es que esos dos datos no
están en la planilla. Si alguna vez se quieren para análisis, son dos columnas más.
