
# Mapa — parámetros COMPLEMENTARIOS de la función diastólica

**S/D venoso pulmonar · LARS en valor absoluto · suplementarios de la ASE 2025 · E/e′ por sitio de
la ASE/EACVI 2016 · los dos rótulos del cuadro · el rojo de la celda del E/e′ · el borde del IMC.**

Armado el 2026-10-12 sobre el commit de cierre de esa tanda. **No guarda números de línea a
propósito**: la línea cambia en cada edición, el nombre de la función no.

Los otros tres mapas de esta zona: `docs/mapa/diastolica.md` (el dueño de cada guía, las dos
superficies, la BSE y la FA), `docs/mapa/diastolica-ase2016.md` (las dos figuras de la ASE 2016) y
`docs/fuentes/FUENTES.md` → «Parámetros complementarios de la función diastólica» (los folios, los
cortes, los operadores y lo que cada guía NO dice).

---

## El S/D venoso pulmonar — un campo, DOS cortes, un solo dueño

El `<select id="venp_sd">` del Doppler mitral tiene **cuatro** `<option>`, ninguna oculta y ninguna
deshabilitada.

| `value` | Etiqueta | Para qué está |
|---|---|---|
| `''` | `—` | sin elegir |
| `le067` | `≤0,67` | el corte de la ASE 2025 en ritmo sinusal |
| `mid` | `>0,67 y <1` | **el tramo que separa los dos cortes**, y lo que el selector viejo no podía expresar |
| `ge1` | `≥1` | negativo para los dos |

⚠️ **LAS DOS OPCIONES DE LEGADO SE FUERON EL 2026-10-13** (`menor1` = «<1 (estudio anterior)» y
`mayor1` = «>1»). Decisión del médico: no hay ningún estudio guardado con el S/D cargado, así que
no hay compatibilidad que sostener. Vivían con `hidden` para que un estudio viejo las conservara
como VALOR sin poder elegirlas, y el precio era que **Safari las mostraba**: esconder una
`<option>` con `hidden` termina siendo un `display:none`, y un desplegable **nativo** no está
obligado a respetar el layout de sus propias opciones. Con ellas se fueron sus entradas de
`VENP_SD_TXT`, sus cinco entradas de `VENP_SD_LECTURA` y `venpSdCritSuf` con sus cinco sitios de
llamada —esa función quedó devolviendo cadena vacía siempre—. **Un token que el selector ya no
ofrece se lee como campo SIN CARGAR**: el `<select>` queda en `selectedIndex -1`, `venpSdEstado`
sale por su guarda de `hasOwnProperty` y el S/D no vota en ningún algoritmo.

**El dueño único de la lectura es `venpSdEstado(corte)`**, con `corte` en `'le067'` o `'lt1'`. La
tabla vive en `VENP_SD_LECTURA` y devuelve **TRES estados**:

| token | `'le067'` | `'lt1'` |
|---|---|---|
| `le067` | **true** | **true** |
| `mid` | false | **true** |
| `ge1` | false | false |
| vacío, o un token que el selector no ofrece | `null` | `null` |

⚠️ **EL `null` SIGUE SIENDO UN ESTADO Y NO UN «NEGATIVO»**, aunque desde el 2026-10-13 tenga un
solo origen: el campo **sin cargar**. Un criterio que nadie midió no es un criterio que no se
cumple, y `_daFila` deriva de ese `null` la fila GRIS; devolver `false` pondría el ✓ de NEGATIVO
sobre algo que no se evaluó. Hasta esa fecha el `null` salía también de un estudio guardado con el
selector viejo en «<1», que para el corte ≤ 0,67 no distinguía un 0,6 de un 0,9.

**Quién lo consume** (cinco lugares, cada uno con su clave):

| Función | Clave | Dónde vota |
|---|---|---|
| `diastASE2025Evaluar` | `le067` | segundo paso, como un parámetro más del conteo |
| `diastFAEvaluarASE2025` | `lt1` | paso 2 de la Figura 8 |
| `diastFAEvaluarBSE2024` | `lt1` | paso 2 de la Figura 19 |
| `diastBSE2024Evaluar` (rama de FEVI reducida) | `lt1` | suplementarios de la Figura 18 |
| `diastASE2016Evaluar` (rama 8B) | `lt1` | sustituto del criterio que falta, con sus **tres** compuertas |

Un ayudante para la ventana, y no decide: **`venpSdFilaVal(corte)`** da el valor de la fila y
devuelve `null` cuando el estado es `null` —para que la fila salga en GRIS y no con el ✓ de
«negativo»—.

**La etiqueta legible sale de `VENP_SD_TXT`, que es su único dueño.** Lo consumen el PDF
(`venpSDTxt`), las filas de la ventana y **el informe firmado de la BSE** por `_bseDetalles`.

⚠️ **NO HAY COLUMNA DE EXCEL Y NO LA HUBO NUNCA.** Los cuatro campos `venp_` no están en
`LAB_XLS_MAP`, así que el importador no les pregunta al rango y la planilla sigue en 435 columnas.
Lo que sí viaja con el estudio es el token, por el recolector genérico (`campos[el.id] = el.value`).

---

## El LARS en valor absoluto

`diastStrainAbs('lars')` es la **única** puerta, y los cinco lectores pasan por ella: el segundo
paso de `diastASE2025Evaluar`, `_diastFADatos` (que alimenta las dos ramas de FA) y las dos ramas
de `diastBSE2024Evaluar`.

⚠️ **EN HEAD ENTRABA CRUDO Y ESO DABA VUELTA EL VEREDICTO EN SILENCIO**: un −32 cumple `< 18` y
publicaba «presión de llenado elevada» sobre una aurícula cuyo strain de reservorio es 32 %, o sea
NORMAL. No era una regresión; era el comportamiento de HEAD.

**La marca «(revisar)» pasó a ser por MAGNITUD**, y es consecuencia directa: la decide
`diastStrainMarcaSync` consultando `_DIAST_STRAIN_ABS_MARCA`, que hoy tiene una sola entrada
(`lars`). Los otros tres campos se comparan crudos y **no cambian**, porque sus bandas ya son
simétricas (`[-60, 60]`) y comparar el crudo contra una banda simétrica es comparar la magnitud.
**La del LARS es la única asimétrica** (`[0, 60]`, en `LAB_XLS_RANGO_PROPIO`) y por eso necesita su
entrada.

⚠️ **EL IMPORTADOR NO SE TOCÓ.** Sigue rechazando un LARS negativo por rango mientras la pantalla
ya no lo marca. `docs/PENDIENTES.md`.

**En el informe firmado el LARS se nombra con su valor absoluto**, que es el que votó —lo mismo
que ya hacía el strain de contracción—. El campo y el Excel conservan el signo tipeado.

---

## Los suplementarios de la ASE 2025 — una LISTA de cuatro

`ASE_SUPLEMENTARIOS` es una lista de objetos `{clave, rot, u, dec, leer, cumple}`, y la etapa que
la evalúa, las filas de la ventana y la rama del veredicto están escritas **contra la lista**: el
trabajo que agregue el Valsalva suma una entrada y nada más.

| clave | constante | corte | operador |
|---|---|---|---|
| `ondaL` | `ASE_ONDAL_SUPL` | 50 cm/s | `>=` |
| `ipTd` | `ASE_IPTD_SUPL` | 2 m/s | `>=` |
| `papD` | `ASE_PAPD_SUPL` | 16 mmHg | `>=` |
| `arA` | `ASE_ARA_SUPL` **y** `ASE_ARVEL_SUPL` | 30 ms **y** 35 cm/s | `>` los dos, con **AND** |

**Se consultan en UN solo lugar**: la rama `seg2Eval === 0 && suplPos.length >= 1` de
`diastASE2025Evaluar`, que es la condición que escribe la figura. Y **sólo del lado positivo**: con
los cuatro negativos el estado se queda en el «no estimable» de HEAD.

⚠️ **`arA` ES UNA SOLA ENTRADA PARA DOS OPERANDOS, Y ESO NO ES UNA SIMPLIFICACIÓN.** Con dos
entradas cada una votaría sola, y un Ar−A positivo con una Ar de 20 cm/s afirmaría presión elevada
con la mitad de la condición del folio 555d. `leer` devuelve la DURACIÓN —que es el número que la
fila muestra— y `cumple` exige además la amplitud; el rótulo nombra los dos cortes.

⚠️ **LA PAP DIASTÓLICA SE LEE DEL CAMPO Y NO SE RECALCULA.** `asePapdSupl()` parsea `ip_papd`, que
lo escribe `calcIP` como `4 × V²_td + PmAD`. Devuelve `null` cuando el texto trae «(sin PmAD)»,
porque ahí le FALTA el sumando de la aurícula derecha. **El borde es el del campo REDONDEADO**: el
campo imprime con `toFixed(0)`, así que un 15,64 real se lee 16 y cruza. Es la consecuencia de leer
el número que el médico tiene delante, y es la regla de esta casa.

**Cuatro campos pasaron a llamar a `calcDiastol`**: `ip_vtd`, `venp_dur_ar`, `venp_dur_a` y
`venp_vel_ar`. Son insumos del veredicto y viven en otras pestañas; sin eso el cuadro gris se
quedaba con el del paciente anterior.

---

## El E/e′ por sitio de la ASE/EACVI 2016

Tres constantes en `diastASE2016Evaluar`: `ASE16_EE_PROM` (14), `ASE16_EE_SEPTAL` (15) y
`ASE16_EE_LATERAL` (13), **las tres con `>` estricto**. El corte se elige por `eeSitio`, derivado
del MISMO `eprom` que ya se usaba: con los dos anillos `eprom` es el promedio y el corte es 14; con
uno solo, `eprom` ES ese anillo y el corte es el suyo.

⚠️ **ES UN REEMPLAZO Y NO UN OR**, y la diferencia con la ASE 2025 está en `FUENTES.md`. Con los
dos anillos, un septal que cruce su 15 **no suma por separado**.

`eeSufSitio` agrega al rótulo de la fila el motivo («sólo el septal está medido; folio 281»): un
cociente sin su corte al lado no dice si el criterio se cumple por el dato o por el umbral.

---

## Los dos rótulos del cuadro y el rojo de la celda

**Rótulos:** `diastRotulosSitioSync()` escribe `#eprom-lbl` y `#ee-lbl` leyendo
`diastRotuloSitio()`. Con un anillo dicen «septal» o «lateral»; con los dos o con ninguno,
«promedio» (el estado de fábrica del marcado). **Sólo cambia el TEXTO**: esa función no lee ni
escribe un valor, que los escriben `diastCeldasBasicas` y las ramas de cada guía.

**Rojo:** `diastEeElevadaVigente()` despacha por los dos `<select>`, llama al evaluador de la guía
en vigor y lee el estado de sus filas de E/e′ (las que matchean `/^E\/e/`). Devuelve `true`,
`false` o **`null`** cuando el criterio no se evaluó — y con `null` **no se pinta**, porque el gris
es «no se midió» y el rojo sería una afirmación. Lo aplica `calcVenaPulm`, que ya estaba en las dos
puertas que hacen falta (`RECALC_MODULOS` y `limpiarCampos`) y a la que el envoltorio de
`calcDiastol` ya llamaba.

⚠️ **LA CADENA DEL COLOR ES PURA, Y ESO SE VERIFICÓ ANTES DE LLAMARLA DESDE EL PINTADO.** Los
cuatro evaluadores y las siete funciones que consumen dan **cero** escrituras de DOM. Un evaluador
que pintara, llamado desde el pintado, es un bucle.

`UMBRAL_EE_ELEVADA` y `eeElevada` **se conservan**: los consume el Laboratorio, que clasifica una
cohorte. `eeCorteEs14` queda **sin consumidores y a propósito**, con el comentario que explica por
qué el color funcionaba así — borrarla es lo que hace que un trabajo futuro reintroduzca el umbral
fijo.

---

## El borde del IMC

El redondeo a un decimal vive en **`_diastFADatos`**, que es el dueño de los insumos de las dos
ramas de FA, y **no** en cada comparación: con dos redondeos, uno se olvida y la fila de la ventana
vuelve a contradecir al veredicto. `getIMC`, `calcBSA` y el PDF **no se tocaron**.

⚠️ `(170/100)**2` vale `2.8899999999999997`, así que 86,7 kg con 170 cm da
**30.000000000000004** y cruzaba un corte que es `> 30`. La fila mostraba «30.0» al lado de un ✗.

---

## El Laboratorio

`_labDiastGrado` gana un quinto token sin grado, **`ase2016_sin_grado`**, con rótulo
«Disfunción, sin grado (ASE 2016)» en la columna de texto del Excel y **ningún `DD_*`**. Mismo
mecanismo que los cuatro de la BSE.

⚠️ **EL MOTIVO DE FONDO ES LA COLUMNA `DD_Sin`**, que vale
`(gd === 'sin' || (gd === null && eeDoc)) ? 1 : 0`: con `null` y el E/e′ documentado, un estudio
que AFIRMA disfunción sumaba en «Sin disfunción». No se tocó la fórmula — con el token, `gd` deja
de ser `null` y la guarda del `eeDoc` no se alcanza.

El regex exige **el punto o la cita de la guía**, y está anclado a principio de oración:
«Disfunción diastólica» es el arranque de diez frases de esta app y las otras nueve ya tienen su
token. El censo está en el comentario de la función.

---

## Por dónde sale cada dato

| Dato | Cuadro gris | Ventana 🧭 | Informe firmado | EN SUMA | Excel | PDF |
|---|---|---|---|---|---|---|
| S/D (token) | — | fila con su estado | sólo por `_bseDetalles` (BSE) | — | **no tiene columna** | fila «S/D pulm.» por `venpSDTxt` |
| LARS | — | fila | `_bseDetalles`, en valor absoluto | — | «LARS (%)», valor crudo | — |
| Suplementarios | — | cuatro filas | — | — | los campos que ya tenían columna | los de vena pulmonar |
| E/e′ por sitio | `#ee-val` con su rótulo | fila con el sitio y su corte | por la frase del veredicto | idem | por el texto | — |
| IMC | `#imc-val` (crudo) | fila (redondeado) | — | — | — | sí (crudo) |

---

## Trampas de esta zona

- **Una escena que no llega a la compuerta no mide el corte.** El S/D vota en el segundo paso de la
  ASE 2025 sólo si el paciente llegó ahí, y en la Figura 18 de la BSE sólo si el LARS cayó en la
  zona intermedia. Cuatro escenas de la sonda de esta tanda salieron «el corte no funciona» sobre
  cortes que funcionan, por dejar el paso 1 en tres positivos o por no dejar un criterio ya
  cumplido. **Informar el estado de la FILA al lado del veredicto.**
- **Un A/B que usa una opción que HEAD no tiene compara dos escenas distintas.** Dos escenas del
  grupo del LARS fijaban el S/D en `le067`, que nace en el commit 1: la tabla informó cuatro
  diferencias con el LARS **positivo**, donde el valor absoluto no puede cambiar nada. Para aislar
  un commit hay que usar valores que existan en los dos árboles.
- **El cuerpo de un caso se evalúa en una función NO async.** Un `await` en su nivel superior tira
  «SyntaxError: missing ) after argument list» y el caso muere por excepción, sin decir qué
  condición fallaba. Los casos que usan `fetch` lo envuelven en un `(async function(){…})()` propio;
  para leer el fuente alcanza `document.documentElement.innerHTML`, que es sincrónico.
- **Un `<select>` al que se le saca una `<option>` deja el dato guardado invisible.** El recolector
  restaura por `el.value`, así que sin la option el `<select>` queda en `selectedIndex -1`. Es el
  defecto que `et_grado` ya pagó. Las dos de legado van con `hidden`.
- **La fila de un criterio SIN EVALUAR no puede mostrar su valor con el texto pegado.** `_daFila`
  deriva el estado del valor: con dato y negativo pinta ✓. Devolviendo la etiqueta con el motivo
  pegado, un `<1` de un estudio viejo sobre el corte ≤ 0,67 salía con el ✓ de NEGATIVO. El valor va
  en `null` y el motivo en el rótulo.
- **La PAPd sin PmAD muestra un número alto y no debe votar.** El campo escribe «14 mmHg (sin
  PmAD)»: parsearlo sin mirar el sufijo afirma presión elevada con un valor al que le falta un
  término.
- **`limpiar()` de un caso puede no limpiar lo que hace falta.** El de TC-260 vacía sólo los cuatro
  campos de vena pulmonar, así que una escena «sin ningún dato» heredaba el E/e′ de la escena
  anterior y medía SU color.
- **El acento grave dentro del cuerpo de un caso o de una sonda.** Cinco veces en esta tanda, con
  el archivo que lo documenta abierto delante. `scripts/check_backticks.py` da la línea exacta;
  `node --check` apunta a la apertura del template, decenas de líneas antes.

---

## Cómo medir esta zona

```bash
# la sonda A/B de esta tanda, grupo por grupo (varios grupos en una pagina se cuelgan en HEAD)
node scripts/_probe_diastcompl.mjs --solo sd        > /tmp/dc.sd.json
node scripts/_probe_diastcompl.mjs --solo sdlegado  > /tmp/dc.leg.json
node scripts/_probe_diastcompl.mjs --solo lars      > /tmp/dc.lars.json
node scripts/_probe_diastcompl.mjs --solo supl      > /tmp/dc.supl.json
node scripts/_probe_diastcompl.mjs --solo ee2016    > /tmp/dc.ee.json
node scripts/_probe_diastcompl.mjs --solo rotulos   > /tmp/dc.rot.json
node scripts/_probe_diastcompl.mjs --solo imc       > /tmp/dc.imc.json
node scripts/_probe_diastcompl.mjs --solo lab       > /tmp/dc.lab.json
node scripts/_probe_diastcompl.mjs --solo vacio     > /tmp/dc.vacio.json   # control negativo mayor
# contra una copia de HEAD, para el A/B
node scripts/_probe_diastcompl.mjs --solo lars --file /tmp/index.HEAD.html > /tmp/dc.lars.HEAD.json

node scripts/test_clinico.mjs --solo TC-459         # la cobertura de esta tanda
node scripts/test_clinico.mjs --solo TC-453,TC-454,TC-455,TC-456,TC-458,TC-260   # la zona
python3 scripts/check_backticks.py                  # ANTES de cada commit
```
