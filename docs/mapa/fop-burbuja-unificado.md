# El FOP, el aneurisma del septum y el test de burbuja — UN solo dueño

> Tanda **ARR**, commit 8 (2026-10-18). Cierra **CORTOS-1** de `docs/PENDIENTES.md` por su salida
> **(a)**: el bloque de Otros deja de publicar su oración cuando el módulo FOP está integrado, y
> los datos compartidos se espejan.

---

## El inventario: existían DOS veces

| dato | pestaña **Otros** (CORTOS13, 17/10/2026) | módulo **FOP** (CC frecuentes) |
|---|---|---|
| se hizo el test | `otr_burb` (casilla) | `fop_contraste` (sí/no) |
| hay pasaje | `otr_burb_pasaje` (sí/no) + `otr_burb_man` (espontáneo/Valsalva) | `fop_shunt_reposo` + `fop_shunt_valsalva` |
| cuántas burbujas | `otr_burb_cant` — **<10 / 10-30 / >30** | `fop_burbujas` — **Pocas (<5) / Moderado (5-20) / Abundante (>20)** |
| cuándo aparecen | `otr_burb_mom` (antes del 3.º / 3.º a 5.º / después del 5.º) | — |
| aneurisma del septum | `otr_asia` (casilla) + `otr_asia_nota` | `fop_asa` (sí/no) + `fop_asa_mm` (excursión) |

Un mismo estudio podía llevar las dos, y el informe firmado decía **dos oraciones sobre el mismo
test, con dos escalas**.

---

## La escala que queda, y por qué

⚠️ **NINGUNA FUENTE DE LA BIBLIOTECA GRADÚA EL PASO DE BURBUJAS**, censada entera (todos los PDF,
buscando `bubble`, `microbubble`, `agitated saline`, `right-to-left shunt`, `patent foramen` y
cualquier rango numérico en su ventana). Las menciones son de **contraste de perfusión**, de
**prótesis mecánicas**, de **artefactos pulmonares** y de referencias bibliográficas. Lo más cerca
es la ASE de ETE (`14- ETE/ASE ETE .pdf`, **hoja 59**), que describe el estudio positivo de forma
**cualitativa**: «Positive agitated saline contrast study with dense opacification of RA and RV,
and clear early passage of microbubbles to the LA (arrow) in a case of PFO» — **sin conteo**.

Por eso se aplica la regla de la orden: **conservar la que ya usan los estudios guardados y
adaptar la otra**. Queda la del **módulo FOP**, por tres razones medidas:

1. el **Laboratorio** cuenta su barra «Paso de burbujas con contraste» leyendo `fop_burbujas`;
2. es la única con **nombres de grado**, que es lo que el informe esquemático necesita;
3. es la antigua — la de Otros tiene **un día** de vida.

⚠️ **LAS TRES OPCIONES VIEJAS DE OTROS QUEDAN COMO `<option hidden>`**, el patrón que `em_grado`
ya usa: el recolector restaura por `el.value`, así que sin ellas un estudio guardado del CORTOS
reabre con el `<select>` en `selectedIndex -1`. Es la trampa de `et_grado`.
⚠️ **NO SE TRADUCEN**: equiparar «menos de 10» con «Pocas (<5)» o con «Moderado (5-20)» es
inventar una equivalencia que ninguna fuente hace. **No se migra nada.**

---

## El espejo: `fopBurbEspejo(origen)`

Patrón de `itVmaxSync`: espejo en los **dos** sentidos con guarda de re-entrada (`_fopEspejoSinc`).

| Otros | ↔ | FOP |
|---|---|---|
| `otr_burb` (casilla) | ↔ | `fop_contraste` |
| `otr_burb_pasaje` + `otr_burb_man` | ↔ | `fop_shunt_reposo` + `fop_shunt_valsalva` |
| `otr_burb_cant` | ↔ | `fop_burbujas` (mismos `value`) |
| `otr_asia` (casilla) | ↔ | `fop_asa` |

- **La excursión del aneurisma tiene UN campo en toda la app** (`fop_asa_mm`) y se deja ahí:
  agregarle uno a Otros sería crear el segundo dato que esto viene a cerrar.
- **Las tres opciones de legado no se espejan**: un `otr_burb_cant` en `lt10`, `e1030` o `gt30` se
  conserva y **no** se copia a `fop_burbujas`.
- **`pon()` no escribe un valor que el `<select>` no ofrece**, porque dejaría `selectedIndex -1`.
- ⚠️ **La guarda de re-entrada no es decorativa** aunque asignar `.value` por código no dispare
  `onchange`: los arneses despachan el evento a mano. Es el motivo de `_itVmaxSinc`.

## ⚠️ La mitad que faltaba, y la destapó la sonda

Con la escala unificada **el informe seguía publicando DOS oraciones**. Desde este commit, con el
módulo FOP integrado (`fop_incluir_chk`), **los dos hallazgos de Otros se callan**: `otrBurbuja()`
devuelve `null` y `otrHallazgos()` saltea `otr_asia`. Es el patrón con que el módulo pulmonar
básico se calla frente al avanzado. **Las casillas de Otros no se tocan**: siguen encendidas y
siguen viajando con el estudio; lo único que cambia es quién escribe la oración.

---

## El informe esquemático: TRES oraciones

| # | oración | de dónde sale |
|---|---|---|
| 1 | anatomía | `fop_tunel`, `fop_mov`, `fop_asa` + `fop_asa_mm` |
| 2 | test de burbuja | `fop_contraste`, `fop_shunt_reposo`, `fop_shunt_valsalva`, `FOP_BURB_TXT[fop_burbujas]` |
| 3 | contexto clínico | `c.esq` de `fopConclusion`, y el párrafo de siempre cuando esa clave no lo tiene |

Medido, con el ejemplo exacto de la orden:

> «Foramen oval permeable (túnel de 8 mm), con septum interauricular móvil y aneurisma del septum
> (excursión de 22 mm). Test de burbuja: sin shunt en reposo; con maniobra de Valsalva, shunt
> moderado (5-20 burbujas). Con ACV criptogénico.»

**EN SUMA:** «FOP — túnel 8 mm — shunt con Valsalva — aneurisma del septum (22 mm) — con ACV
criptogénico.»

- **No se pierde ni un dato:** los mismos campos, los mismos números y las mismas palabras de
  grado. Lo que cambia es la puntuación y el orden de las cláusulas.
- ⚠️ **`ccHoja` sigue recibiendo la lista `p`** y no la oración armada: esa hoja la consume el PDF
  de CC frecuentes renglón por renglón, y pasarle una sola cadena larga le rompería la maquetación.
- ⚠️ **Las claves sin `esq` publican el párrafo de siempre**, porque omitirlas sería **perder**
  información del informe firmado. Llevan `esq` las cuatro que cambian la conducta: `descartado`,
  `cierre_iia`, `acv_mayor`, `acv_sin_edad`, `trombofilia` y `alto_riesgo_sin_evento`.

## El aviso de la edad se OMITE

Decisión de Maicol. `acv_sin_edad` deja de publicar «falta la edad del paciente, de la que depende
la indicación: el cierre percutáneo es Clase IIa por debajo de los 60 años», y el EN SUMA deja de
decir «sin edad cargada». **Medido: con edad y sin edad el informe y el EN SUMA salen idénticos.**
La indicación queda documentada en `FUENTES.md` y en `PENDIENTES.md` para llevarla a Referencias;
**no se escribe en la app**.

⚠️ **LA RAMA DE `fopConclusion` SIGUE EXISTIENDO** y su `txt` sigue teniendo el aviso: lo consumen
el PDF de CC frecuentes y la hoja de `ccHoja`, que son otra superficie. Lo que se omite es el
informe narrativo y el EN SUMA.

---

## ⚠️ Un defecto que cazó la sonda sobre código recién escrito

**`FOP_BURB_TXT` YA EMPIEZA CON LA PALABRA «shunt»** —«shunt moderado (5-20 burbujas)»—, así que
la primera versión publicaba **«con maniobra de Valsalva, shunt shunt moderado (5-20 burbujas)»**
en el informe FIRMADO. La frase la pone el dueño del texto, no la plantilla.

## Cómo se mide

`scripts/_probe_arr.mjs --solo fopu`: siete escenas con clics y teclas reales —el ejemplo de la
orden, el ACV sin edad, el shunt descartado, el incidental, el espejo en los **dos** sentidos y el
control del legado—. Las siete publican **una sola** oración.
Cobertura: **TC-501**, bloques (M1) a (M7).

---

## El trabajo «D» — el FOP en tres columnas, descriptivo, con su ficha y su Evidencia (2026-10-22)

Cuatro commits de código y uno de cobertura. **No hay dibujo**: esta tanda no agrega ningún
esquema, animación ni demo del foramen, y el hueco que ese dibujo ocuparía queda vacío a
propósito.

### 1 · Las piezas por nombre

| Pieza | Dónde | Qué hace |
|---|---|---|
| `#sacc-cc-fop .fop-cols` / `.fop-col` / `.fop-col-tit` | CSS, al lado del de los acordeones de congénitas | Las tres columnas. `flex-wrap` con base **220 px** y **NINGUNA media query**, por lo que ya documenta la maquetación de Válvulas |
| `otr_asia_lado` | Otros · Variantes anatómicas, al lado de `otr_asia` | **Dueño único** de hacia dónde se abomba el aneurisma: `''`, `ad`, `ai`, `ambos` |
| `otr_burb_lat` | Otros · Test de burbuja, dentro de `otr-burb-pos` | **Dueño único** del número de latidos: `3`, `4`, `5`, `6`, `''` |
| `ASIA_EXC_UN_LADO_MIN` / `ASIA_EXC_TOTAL_MIN` | al lado de `FOP_BURB_TXT` | 10 y 15 mm |
| `asiaLado(src)` · `asiaCorteMm(src)` · `asiaPorExcursion(mm, src)` | ídem | El corte que depende del lado, con sus **cinco** lectores |
| `fopLatidos(src)` | ídem | Los latidos, **gateados por el pasaje documentado** |
| `fop-asa-lado` · `fop-burb-lat` | `<span>` de la sección del FOP | Lo que el FOP **lee** de Otros. Guión MEDIO: no entran al recolector |
| `fopPdfFilas()` | al lado de `fopSync` | La tabla de características del PDF |
| `FOP_EV_FTE` · `FOP_EV` · `FOP_EV_PROPIO` · `_indFOP` | panel de Evidencia | El cuestionario y las recomendaciones |
| `ref-fop` | Referencias · Otros hallazgos | La ficha, pegada a la del test de burbuja |

### 2 · El reparto de los catorce campos

| Columna | Campos |
|---|---|
| **Anatomía** | `fop_tunel` · `fop_mov` · `fop_asa` · `fop_asa_mm` · `fop-asa-lado` (leído) · `fop-asa-interp` |
| **Shunt** | `fop_contraste` · `fop_shunt_reposo` · `fop_shunt_valsalva` · `fop_burbujas` · `fop-burb-lat` (leído) · `fop-shunt-grado` |
| **Contexto clínico** | `fop_acv` · `fop_trombofilia` |

Ningún campo se renombró ni cambió de id. Medido a 1200, 1440, 768, 390 y 360 px por los dos
temas: **tres columnas arriba de 768 px y una apilada abajo, cero scroll horizontal en las diez
celdas**, y el rótulo de columna resolviendo `--accent2` real y distinto en los dos temas
(`rgb(126,200,227)` de noche, `rgb(31,95,184)` de día).

### 3 · El corte del aneurisma del septum depende del lado

Silvestry 2015, **folio 916** (hoja 7; folio = hoja + 909, comprobado en el pie impreso de las
hojas 7, 8, 22 y 23): excursión de **10 mm** hacia la AD o la AI, **o** excursión **combinada**
derecha más izquierda de **15 mm**. Hasta el D la app aplicaba el de 10 a cualquier excursión.

| Lado | Corte | 9 | 10 | 11 | 14 | 15 | 16 |
|---|---|---|---|---|---|---|---|
| sin consignar · `ad` · `ai` | 10 | no | **sí** | sí | sí | sí | sí |
| `ambos` | 15 | no | no | no | no | **sí** | sí |

⚠️ **EL OPERADOR SIGUE SIENDO `>=` Y NO SE MOVIÓ.** El folio 916 escribe el primero como
«greater than 10 mm» y el segundo «of 15 mm», sin operador; el **folio 938** reescribe los dos
sin «greater than». Mover un operador es mover un corte.
⚠️ **SIN LADO CONSIGNADO MANDA EL 10**, que es lo que la app aplica desde siempre: un estudio
guardado antes del D abre y concluye exactamente igual. Medido.

### 4 · Los latidos, y por qué el dueño los gatea

Silvestry 2015, **folio 931** (hoja 22): la aparición de microburbujas en la AI **dentro de 3 a 6
latidos** tras la opacificación de la AD se considera positiva para un shunt intracardíaco.
El selector publica el **número** y no lo interpreta.

⚠️ **SIN PASAJE DOCUMENTADO `fopLatidos` DEVUELVE `null`, y la compuerta va en el DUEÑO.** El
selector nace en 3 —decisión de Maicol— y su control vive dentro del bloque que sólo aparece con
pasaje, así que un formulario vacío publicaba «3 latidos» sobre un estudio en el que nadie
inyectó nada. Gateado en el dueño, las cuatro superficies quedan de acuerdo por construcción.
⚠️ **EL 3 ES LA PRIMERA OPCIÓN Y LA VACÍA LA ÚLTIMA, y eso reemplaza a una función de sincronía:**
`limpiarCampos` hace `selectedIndex = 0` sobre todo `<select>`, así que el defecto lo repone el
barrido que ya existe.
⚠️ **Y ESE DEFECTO SE AFIRMA SOLO: CON PASAJE DOCUMENTADO EL INFORME DICE «a los 3 latidos» SIN
QUE NADIE LO HAYA ELEGIDO.** La compuerta acota el daño y no lo cierra. **Medido en la ruta real de
reapertura:** para un `<select>` cuya clave falta la restauración hace `el.selectedIndex = 0` —**no**
`.value = ''`—, así que un estudio anterior a esta tanda también reabre en **3**; lo que protege un
informe ya firmado es que la reimpresión **no reescribe** `informe_texto`, que viaja con el estudio.
`PENDIENTES.md` → **D-6**, con la salida de mover la opción vacía al primer lugar.

### 5 · Lo que el papel dice y lo que ya no dice

| Superficie | Antes | Ahora |
|---|---|---|
| Pantalla | «**ESC**: cierre percutáneo Clase IIa…», «el 25 % de la población», «recurrencia del 5 % anual» | una descripción de qué es un foramen y un puntero a Evidencia |
| Conclusión | la conducta de cada rama | la descripción, con la excursión **y su lado** y el pasaje **con sus latidos** |
| Informe | el párrafo al final del cuerpo, con la conducta | **justo debajo de la aurícula izquierda**, descriptivo |
| EN SUMA | «con ACV criptogénico», «sin evento» | sin el antecedente |
| PDF | sección en la hoja «Estudio avanzado – Cardiopatías congénitas» | **tabla de características** en el cuerpo, con el ACV como **motivo del estudio** |

⚠️ **EL ACV CRIPTOGÉNICO SALE DEL INFORME Y DEL EN SUMA Y ENTRA AL PDF**, por decisión de Maicol:
es un dato CLÍNICO del paciente y no una conclusión del eco. Consecuencia: `esq` queda en `null`
en **siete** de las diez claves, y las tres que la conservan dicen algo que no es el antecedente
—`descartado`, `no_interpretable` y `trombofilia`—.
⚠️ **LAS DIEZ CLAVES NO CAMBIAN, Y UNA SE LLAMA `cierre_iia`.** El Laboratorio cuenta la
distribución del FOP **por clave** y un filtro de cohorte guardado la trae. El nombre es interno.

### 6 · La Evidencia es un cuestionario

LEE la edad, el aneurisma con su excursión y su lado, el grado del pasaje y los latidos.
PREGUNTA la **evaluación completa** y el **shunt grande**. Después publica las recomendaciones
aplicables en `r.bloques`, **VISIBLE** y no en `notas`, que se pinta dentro del «Ver detalle».

⚠️ **EL «SHUNT GRANDE» SE PREGUNTA Y NO SE DEDUCE DE LA ESCALA.** La nota al pie del folio e411
dice que cada estudio define los rasgos de alto riesgo de una manera distinta, y las dos guías
atribuyen al **mismo** ensayo RESPECT dos cortes: **>20 microburbujas** (Kleindorfer, folio e413)
y **más de 10** (Pristipino, apéndice suplementario 4).
⚠️ **«RASGOS DE ALTO RIESGO» TIENE TRES ESTADOS Y NO DOS.** `null` cuando no se puede decidir: con
el aneurisma ausente y la pregunta sin contestar no se puede afirmar NI negar, y las filas 2a y 2b
dependen de lados **opuestos** de esa respuesta.

### 7 · Siete trampas, cinco medidas en esta tanda

1. **Un `<select>` no recibe texto, y mandárselo ensucia el campo anterior.** Lo cazó **mirar la
   captura**: con el patrón «tipear y si falla, `sel()`» el `Input.insertText` aterrizaba en el
   último input de TEXTO enfocado y el PNG mostraba **«12sisimoderadosi»** en la excursión del
   aneurisma. `tipear` lanzaba después y el `catch` ponía el select bien, así que la medición
   NUMÉRICA salía correcta —`v('fop_asa_mm')` lee 12 de «12sisimoderadosi»—. Se decide por el TAG.
2. **El escape de espacio en blanco se cocina dentro de un template literal** y deja `/s+/g`, que
   se come todas las eses: «Silvestry» salía «Silve try». Pasó en la sonda **y** en el caso.
3. **Y una clase de caracteres con los escapes de tabulación y salto se cocina a caracteres
   REALES**, y un salto real dentro de un literal de regex **no parsea**: el caso murió con
   «missing ) after argument list». Se normaliza sin ningún regex.
4. **Un par BALANCEADO de acentos graves dentro del cuerpo de un caso lo cierra igual**, y
   `scripts/check_backticks.py` da «OK». Me los comí **dos veces** en TC-513 y una en el probe.
   Los tres los dio `node --check`.
5. **Una sección cerrada mide 0×0**: el acordeón se pliega con `max-height:0` y `overflow:hidden`.
   Hay que abrirlo por su GESTO antes de pedir geometría.
6. **`showTab('congenitas')` LANZA desde el cuerpo de un caso** —esa función está envuelta dos
   veces en el árbol del suite—: se entra por el **clic en el botón del rail**, que además es el
   gesto del médico.
7. **El bloque «Lo que falta» NOMBRA la fila Clase 2a** para decir que falta un dato: un control
   que busque «Clase 2a» en TODOS los bloques lee como publicada una recomendación que no se
   publicó.

### 8 · Cómo medir la zona

`node scripts/_probe_d.mjs --solo cols,asia,lat,inf,pdf,refs,evid,maqueta,captura,ctrl --dest <dir>`
y, contra el inicio de la tanda, el mismo con `--file <copia de HEAD>`.
Cobertura: **TC-513**, 61 condiciones, que sabe fallar contra HEAD con 46 en rojo y ninguna por
excepción. La ficha se mide con la ficha ABIERTA; el PDF se genera de verdad en sus SEIS
plantillas en el grupo `pdf`.

### 9 · Los SEIS casos adaptados, con el motivo

| Caso | Qué afirmaba | Qué afirma hoy | Commit |
|---|---|---|---|
| **TC-501** (M1) (M2) | la frase esquemática exacta del ARR, con «Con ACV criptogénico.» y sin latidos | la frase con **« a los 3 latidos»** y **sin** el antecedente, más la condición NUEVA **(M2b)**, que exige que el antecedente **no** aparezca en ninguna de las dos superficies | D-E1 y D-E2 |
| **TC-506** (F8) | usaba el **FOP** como control de que otra cardiopatía congénita sigue imprimiendo su hoja | **(F8)** pasa a afirmar que el FOP **tampoco** aporta, y **(F8b)** usa la **CIA** de control — o sea mide DOS retiros y un remanente donde medía uno y uno | D-E2 |
| **TC-509** (F3) | el censo de Referencias en **30** entradas | **31**, y exige además que la que entró sea la del **FOP** | D-E3 |
| **TC-502** | el mismo censo en 30 | 31, por el mismo motivo | D-E3 |
| **TC-507** (I8) | el chip «CRITERIO DE ECOSMART» en un conteo fijo | el conteo nuevo, con la ficha del FOP sumando el suyo | D-E3 |
| **TC-322** | su SEED exigía escenario para TODAS las secciones de `IND_SECS` | gana la entrada de la sección del FOP | D-E4 |

⚠️ **TRES DE LOS SEIS LOS DESTAPÓ LA CORRIDA DE ZONA Y NO LA LECTURA** —TC-501, TC-506 y TC-509—,
y los tres por la misma causa de fondo: afirmaban un hecho **medido** que este trabajo dio vuelta.
Ninguno estaba mal escrito. **El de TC-506 es el más instructivo:** su control negativo usaba
justamente el módulo que esta tanda vacía, así que un control que existía para probar que el retiro
era acotado se volvió una segunda medición del mismo retiro.
