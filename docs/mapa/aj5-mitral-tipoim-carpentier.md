<!-- mapa de la tanda AJ5, armado sobre 4a2ea41 (2026-10-24); SIN números de línea a propósito -->

# AJ5 — Tipo de IM y Carpentier en Válvulas, y el strain de pared libre del VD

Qué contesta este archivo: **quién es el dueño de «primaria o secundaria» y del Carpentier de la
mitral**, cómo viajan entre Válvulas y el ETE, cómo entran al informe firmado, y dónde vive el
campo nuevo de strain de pared libre del VD. Se abre a demanda; no se carga solo.

---

## 1 · Los tres campos de la fila de la mitral

La fila es el `div.valv-morf-row.valv-morf-row--tres` que abre la sección de la mitral en
Válvulas. Lleva **tres** `.fg`, en este orden, que es también el orden del Tab (no hay ni un
`tabindex` en el bloque):

| campo | id | valores | dueño del dato |
|---|---|---|---|
| Morfología VM | `vm_morf` | nueve textos, de «Normal» a «Isquémica…» | **Válvulas**, sincronizado con `ete_etiologia` desde antes de esta tanda |
| Tipo de IM | `vm_tipo_im` | `''` · `primaria` · `secundaria` | **Válvulas**, espejado a `teer_tipo_im` |
| Carpentier | `vm_carp` | `''` · `I` · `II` · `IIIa` · `IIIb` | **Válvulas**, espejado a `ete_carpentier` con guarda |

**Los dos nuevos nacen vacíos y eso es el punto**: el informe es descriptivo y un valor de fábrica
publicaría en el papel firmado un mecanismo que nadie consignó.

### El ancho, que NO está escrito

`#tab-valvulas .valv-morf-row--tres` es una grilla `repeat(auto-fit, minmax(144px, 1fr))` con
`gap: 8px`, y su ancho es
`calc((100% - 8px)/2 - var(--valv-sevcol))`.

- La **mitad** sale de la fila de botones de abajo, que es un `display:flex; gap:8px` con dos
  `.valv-btn-wrap` en `flex:1`: cada pastilla mide exactamente `(100% - 8px)/2`.
- `--valv-sevcol: 110px` (declarada en `#tab-valvulas`) es lo que la pastilla tiene **de más** que
  el botón: su columna de severidad (el ⓘ y el «🟡 Severidad ▼») más los 6 px de `gap`. **Es el
  único número escrito a mano de toda la fila, y está medido**: a 1440 px la pastilla da 573 y el
  botón 463.
- **Lo vigila TC-522 (A3)**, no la buena voluntad: si alguien ensancha el rótulo de la columna de
  severidad, el botón se angosta, la fila lo pasa y el caso se pone rojo.
- Las tres columnas y el ancho viven **sólo por encima de 768 px**, que es el complemento exacto
  del `max-width:768px` que ya colapsa `.grid-3`: no es un breakpoint nuevo. Por debajo, una
  columna a ancho completo.

**Medido en Chrome, los dos temas, cero `console.error` y cero scroll horizontal nuevo:**

| viewport | fila | botón | celdas | filas visuales |
|---|---|---|---|---|
| 1440 | 463 | 463 | 149 · 149 · 149 | 1 |
| 1280 | 415 | 415 | 204 · 204 · 204 | 2 (2+1) |
| 1024 | 287 | 287 | 287 | 3 |
| 820 | 185 | 185 | 185 | 3 |
| 390 | 328 | 50 | 328 | 3 |

⚠️ **`auto-fit` y no `repeat(3,1fr)`**, y es lo que arregló `/sharp-edges` sobre el propio diff:
con tres columnas fijas la fila **no apila nunca, aprieta**, y como el ancho es el del botón —que
se angosta con la ventana— entre 769 y ~1400 px las celdas caían a 70-120 px sobre tres datos del
informe firmado. La verificación original midió 1440 y 390: la franja apretada quedaba
**exactamente entre los dos puntos medidos**.

⚠️ **El scroll horizontal a 820 px es PREEXISTENTE.** Medido en los dos árboles: 930 contra 820,
el mismo par. No es de esta tanda y TC-522 (A5) mide la fila contra su contenedor, no el documento.

### El globo ⓘ del Carpentier

Clave `vm-carp` del registro `VINFO`, el mismo mecanismo que los demás ⓘ de Válvulas: un toque
abre una tarjeta `position:fixed` junto al botón, otro toque la cierra, tocar afuera cierra y
Escape también. **No es una caja fija y no está anidada en la fila** (TC-522 B2).

---

## 2 · La sincronía: dos nodos, un dato, y una guarda asimétrica

Todo vive en el bloque **«TIPO DE IM Y CARPENTIER — EL DUEÑO ES VÁLVULAS»**, al lado de
`eteVmPropagar`, y reusa su mecanismo sin tocarle una línea.

| función | qué hace |
|---|---|
| `_vmEspejar(src, dst, efectos)` | copia el valor si el destino **tiene esa opción** y corre los efectos del destino a mano |
| `vmTipoImPropagar(origen)` | `vm_tipo_im` ↔ `teer_tipo_im`, **sin guarda** |
| `vmCarpPropagar(origen)` | `vm_carp` ↔ `ete_carpentier`, **con guarda de «es un ETE»** |
| `vmCarpLegadoSync(gesto)` | escribe el `vm_carpentier` del cajón de prolapso desde `vm_carp` |
| `vmCarpAvisoSync` / `_vmCarpDiverge` | pintan el aviso cuando las voces no coinciden |
| `vmTipoIMEfectivo()` / `vmCarpEfectivo()` | **resuelven al leer**: el de Válvulas, y si no dice nada, el del ETE |
| `_vmImAssertPares()` | grita al arrancar si los cuatro `<select>` dejan de ser pares |

**Escriben SÓLO los `onchange`.** Ninguna ruta de restauración los llama: reabrir un estudio no
puede modificar un valor guardado, y asignar `.value` no dispara `change`.

### Por qué uno lleva guarda y el otro no

`eteVmPropagar` se niega a escribir el lado ETE si el estudio no es un ETE, y su comentario
enumera **tres** salidas. Aplicadas campo por campo:

| campo | en la regex de `ete-es-ete__chk` | en `_labUsaEteVM` | columna de Excel | ⇒ |
|---|---|---|---|---|
| `ete_carpentier` | **sí** | **sí** | no | **lleva guarda** |
| `teer_tipo_im` | no | no | no | **sin guarda** |

Con `ete_carpentier` escrito desde un transtorácico, el estudio vuelve del reimport con la bandera
encendida y el PDF titulado «Informe Ecocardiograma Transesofágico». Con `teer_tipo_im` eso no
pasa — y **sin escribirlo nada de la AJ5-4 funcionaría**: `imEsSecundariaIM`, `imSecAltPintar`,
`calcTEER` y el recuadro de reparabilidad de `calcETE` leen ese campo directamente, no un
resolvedor.

### Las dos listas de morfología: DIFIEREN, y no se unificaron

La orden pedía compararlas y, si diferían, **no** unificarlas. Difieren:

| `vm_morf` (9) | `ete_etiologia` (9 + «—») | par |
|---|---|---|
| Normal | — | — |
| Mixomatosa / Barlow | `barlow` Degenerativa — Barlow | **sí** |
| — | `dfe` Degenerativa — DFE | no |
| Calcificada | — | no |
| Reumática | `reumatica` | **sí** |
| Prolapso / EVMS | — | no |
| Prótesis biológica | `prot_bio` | **sí** |
| Prótesis mecánica | `prot_mec` | **sí** |
| Endocarditis | `endocarditis` | **sí** |
| Isquémica (disfunción/rotura músculo papilar) | — | no |
| — | `funcional_isq` Funcional isquémica | no |
| — | `funcional_aur` Funcional auricular (FA) | no |
| — | `congenita` Congénita | no |

**Cinco pares de nueve** (`_ETE_VM_PARES`), y las granularidades son distintas a propósito:
`vm_morf` mezcla morfología y etiología y tiene **una** opción degenerativa, mientras
`ete_etiologia` separa Barlow de DFE, que son fenotipos con expectativas de reparabilidad
distintas. Ese par ya estaba sincronizado desde antes de la AJ5 y **no se le tocó una línea**.
TC-523 (A3) lo fija: si alguien las unifica, se pone rojo.

### El segundo Carpentier, el del cajón de prolapso

`vm_carpentier` **existía** y es la premisa que la orden no contemplaba: un SEGUNDO Carpentier, con
**otro vocabulario** (tres opciones, sin partir el III), sin sincronía con el del ETE, y
alimentando la frase de prolapso del informe firmado.

Hoy:

- **sigue existiendo y su vocabulario no se tocó**, porque los estudios guardados traen ahí el
  **texto** de la opción («Tipo II (prolapso/flail)»): sacarle la opción dejaría
  `selectedIndex = -1`, `.value` daría `''` y `guardarInforme` **persistiría el hueco** — el
  defecto de `vab_tipo` y de `centro_nombre`, y además sería migrar un estudio guardado;
- queda **`disabled`** y lo escribe `vmCarpLegadoSync` desde `vm_carp`. Esa dirección es **total**:
  `I → Tipo I`, `II → Tipo II`, **`IIIa` y `IIIb` → los dos a `Tipo III`**;
- **al revés no se escribe**: «Tipo III» no distingue IIIa de IIIb, así que no hay a qué
  traducirlo, y rellenar `vm_carp` al abrir sería migrar;
- `disabled` **no lo saca del estudio**: `guardarInforme` barre `select[id]` y lee `.value`, que en
  un select deshabilitado sigue valiendo.

### El aviso de divergencia, y las tres voces

`_vmCarpDiverge()` devuelve `{legado, ete}` cuando una de las dos contradice al efectivo, y
`vmCarpAvisoSync` **nombra los dos valores** —no un texto genérico— porque es lo único que le dice
al médico cuál corregir. Cubre los dos estados reales:

1. **el legado contradice** (estudio guardado antes de la AJ5): el paréntesis nuevo hablaba por el
   lado ETE y la frase de prolapso por el legado, así que el informe firmaba «(Carpentier II)» y
   «mecanismo Carpentier I» **en el mismo párrafo**;
2. **`ete_carpentier` se quedó viejo** porque la guarda se abstuvo: con la morfología del ETE
   integrada, el mismo informe publicaba IIIb en la oración mitral y «Carpentier Tipo II» en la del
   ETE, y el PPT proyectaba la segunda.

⚠️ **Quien se abstiene es el texto NUEVO**, no el viejo: el paréntesis de la AJ5-3 no existía en
HEAD, así que callarse deja el informe del estudio legado **byte por byte** como estaba. Pisar un
valor guardado para «arreglar» la contradicción sería migrar.

⚠️ **Y el aviso abre su sección.** Vive dentro de `ete-seccion-valv-mitral`, que nace plegada y la
abre sólo `toggleEteSeccion`: se pintaba, medía 0 × 0 y seguía sin verse. Es el defecto que
`eteVmAvisoSync` ya documenta y que la sonda de esta tanda volvió a medir. TC-523 (E3) exige
geometría.

---

## 3 · El paréntesis del informe

Texto aprobado: **«Válvula mitral … con insuficiencia moderada (mecanismo secundario; Carpentier
II).»**

Se arma en `_imMecCarp` y se concatena a **`insE` / `insC`**, no a la oración. Eso es lo que hace
que entre en las **cuatro** ramas de `vmSent` y en los **tres** estilos de una sola vez; escrito en
cada rama serían doce literales y el que se olvida deja un estilo del papel firmado sin el
mecanismo.

| regla | conducta |
|---|---|
| campo en «—» | no aporta su mitad |
| los dos en «—» | no hay paréntesis |
| morfología prótesis biológica o mecánica | **no se escribe nada** (`_vmProt`) |
| sin insuficiencia | tampoco: el texto cuelga de `insE`/`insC`, que son `null` |
| Carpentier divergente | se abstiene de **su mitad**; el mecanismo sigue |
| EN SUMA | **no lo lleva** |

**Son TRES estilos y no cuatro.** `estiloPick(c, e, n)` tiene tres brazos: Conciso, Estándar y
Narrativo. «CC» no es un estilo de informe — es la sub-pestaña «CC / Genéticas» del Laboratorio y
el bloque integrable de C. Congénitas, que no reescribe la oración de la mitral.

**El género se concuerda con «mecanismo»** (`_MEC_TXT`: `primaria → primario`): el valor del
desplegable concuerda con «insuficiencia», que es su rótulo en pantalla, y el informe firmado decía
«mecanismo secundaria». Lo cazó la sonda, no la lectura.

**`_vmProt` se MOVIÓ** ~30 líneas arriba, junto al paréntesis, que es su primer lector. No se
duplicó: su propio comentario exige que las superficies pregunten lo mismo.

**Los dos valores salen de los resolvedores** y no de un nodo, porque un estudio guardado antes de
esta tanda trae el dato sólo del lado ETE.

⚠️ **Dos paréntesis seguidos.** Con un fundamento escrito a mano (`_imFundG`, que sólo aparece
cuando el grado manual discrepa del calculado) la frase sale «insuficiencia severa (jet excéntrico)
(mecanismo secundario)». Dicen cosas distintas y fusionarlos reescribiría el texto del médico →
`docs/PENDIENTES.md` → **AJ5-c**.

---

## 4 · Los efectos, gobernados desde Válvulas

Funcionan **porque `vm_tipo_im` escribe `teer_tipo_im`**, que es lo que los cuatro consumidores
leen. Medido:

| escena (desde Válvulas) | frase del corte alternativo | grado de la IM |
|---|---|---|
| Secundaria + ORE 30,0 mm² | **sale**, con «≥ 30 mm², aplicable con orificio elíptico» | sin cambio |
| Secundaria + ORE 29,0 mm² | no sale | sin cambio |
| Primaria + ORE 30,0 mm² | no sale | sin cambio |
| sin tipo + ORE 30,0 mm² | no sale | sin cambio |

El ORE sale de PISA, que es de donde lo lee `_imSecAltEroa`: radio 5 mm y Vmax 5 m/s dejan la EROA
en `0,31416 × Valiasing`, así que 95,5 da 30,0 clavado y 92,3 da 29,0.

⚠️ **`calcTEER` repinta ahora la frase, y le faltaba desde antes de esta tanda**: llamaba a
`imSecAvisoSiExiste` y no a su gemelo, así que cargar «Secundaria» en el ETE con un ORE ya medido
dejaba la frase sin pintar hasta que alguien tocara un campo de la IM.

**Reparabilidad**, los tres estados de la AJ2, los tres gobernados desde Válvulas: Secundaria lista
los factores desfavorables con sus valores; Primaria publica el texto de «ninguna fuente de la
biblioteca…»; vacío dice que el tipo no está consignado.

---

## 5 · El strain de pared libre del VD

Campo **`vd_strain_pl`**, en la **columna 1** de la pantalla VD / AD, entre el índice de Tei y la
FEVD, que baja a `vd-r6`. Esa fila ya existía (la abrió el G3 para la columna 3); ahora la usan
dos. Sin columna de Excel: el libro queda en **440**.

⚠️ **No es el strain del módulo «Deformación».** Ése se **mide** trazando dos contornos, vive en el
visor, lo persiste `strain_manual` y su propio descargo dice «no se integra al informe firmado».
Este es un valor que el médico **tipea**, viene de su equipo, y sí sale al informe. Conviven.

⚠️ **Sin selector «Sin medición, elegí el tramo», y la condición se verificó antes**: ese control
existe en **un** solo campo de esa pantalla, la relación VD/VI (`vd_vi_sel`, G3), y **no** en el
TAPSE ni en la onda S′. La orden lo pedía sólo si esos dos lo tenían.

### Los cortes, y qué tenía la app de verdad

| grado | corte | de dónde sale |
|---|---|---|
| normal | **más de 20 %** en valor absoluto | `VD_STRAIN_NORMAL` (−20), aplicado en el AJ1, sin diferencia por sexo. ASE 2025 de mayo, Tabla 1 folio 145 y texto folio 159 |
| leve | **de 15 a 20 % inclusive** (15 exacto = leve) | **la orden de Maicol.** El AJ1 **no** abrió esta banda → **AJ5-e** |
| moderada / severa | **no existen** | la app **no tiene** esos cortes, ni la Tabla 1, ni el folio 159, ni ninguna ficha. **No se inventó ninguno**: por debajo de 15 el campo dice «por debajo de leve» |

`VD_STRAIN_PL_NORMAL` y `VD_STRAIN_PL_LEVE` viven al lado de `vdTeiCat`, **no** en `ASE25_T1`: esa
tabla no bandea el strain, y meterlo ahí fabricaría tres bandas que no tiene. El primero es una
**segunda escritura** del corte del módulo de Deformación, así que `_vdStrainPlAssert` lo vigila al
arrancar: si se separan, grita.

### Signo, cero y plausibilidad

- **Gradúa por el valor absoluto**: −18 y 18 dan lo mismo. Es lo que dice la Tabla 1 y lo que ya
  dice la ficha `FUN-VD-007`.
- **El informe publica el signo de la app** (−18 %), no el que se tipeó: dos estudios con el mismo
  hallazgo no pueden salir con dos signos distintos en un documento firmado.
- `vdStrainPlNorm` normaliza en el `oninput` los cinco guiones tipográficos (U+2212, U+2013,
  U+2014, U+2010, U+2011) → `-`. **Sin eso, pegar «−18» del propio informe dejaba el valor a la
  vista, guardado, y el strain sin salir por ninguna superficie.** `PF` sólo normaliza la coma.
  Es local a este campo, no al normalizador global de los ~400 numéricos.
- **`vdStrainPlVal()` es el dueño único de «¿hay un strain usable?»**: vacío, **`0`** y **fuera de
  banda** son los tres un no. Sin el `0`, el informe firmaba «strain de pared libre −0 %» con la
  pantalla en rojo al lado.
- Banda **`[-60, 60] %`** en `VD_NUEVOS_BANDA` — **plausibilidad, no severidad**: caza el dedazo de
  un orden de magnitud (185 por 18,5), que sin ella salía **verde** y «normal» en pantalla y
  «−185 %» en el papel. Mismo número y mismo argumento que los dos strain de la AI. Era el único de
  los diecisiete campos de esa pantalla sin banda. La marca «(revisar)» la pone `vdMarcaSync`, su
  dueño genérico.

### No vota, y qué publica el informe

`vdDisfGrado` —el dueño del grado de la disfunción— lee **TAPSE y onda S′** y nada más, y el OR de
`vdDisf` suma esos dos, la FAC y el Tei. **Medido, no supuesto.** El strain no está, así que este
campo **no vota**.

Al informe va el **número** y **no su categoría**: con la categoría, un strain de −18 % sobre un
TAPSE y una S′ normales habría firmado «función sistólica conservada (strain de pared libre leve)»,
una contradicción en el papel → **AJ5-d**.

| escena | oración del VD (Estándar) |
|---|---|
| sólo strain −21 | «Ventrículo derecho con strain de pared libre −21 %.» |
| TAPSE 22 · S′ 13 · strain 18 | «… con función sistólica conservada (strain de pared libre −18 %) (TAPSE 22 mm, S′ 13 cm/s).» |
| TAPSE 12 · S′ 6 · strain −12 | «… con disfunción sistólica moderada (strain de pared libre −12 %) …» |

⚠️ **No entra en `hayFunc`** y sí en la compuerta del **bloque**. `hayFunc` es la compuerta de la
afirmación «función sistólica conservada»: con el strain adentro, un estudio cuyo único dato de
función fuera el strain habría firmado «conservada» sin un solo parámetro votante medido. En la
compuerta del bloque sí, para que ese estudio no pierda la oración entera — el agujero que esta
zona ya pagó tres veces (el Tei, la hipertrofia y el Doppler tricuspídeo).

⚠️ **El narrativo lleva su propio literal** en la rama «todo normal» y **no** usa `funcTxt`, así que
el strain hubo que agregarlo ahí también: sin esa línea el Conciso y el Estándar publicaban el
valor y el Narrativo no.

---

## 6 · Los cinco casos

| caso | qué fija | condiciones |
|---|---|---|
| **TC-522** | la fila: geometría derivada del botón, anchos iguales, reflujo a 200 px, el ⓘ flotante y su pie de fuente | 11 |
| **TC-523** | los vocabularios, los dos sentidos, el espejo de legado y su fantasma por las dos puertas, el aviso con geometría, el estudio legado y el assert | 14 |
| **TC-524** | el paréntesis en los tres estilos, el género, el EN SUMA, prótesis, sin insuficiencia y la abstención | 10 |
| **TC-525** | ORE 30 / 29 / primaria / vacío, el grado que no se mueve, y los tres estados de la reparabilidad | 10 |
| **TC-526** | el campo y su posición, los cuatro bordes por los dos signos, el 0, la banda, el signo tipográfico y que no vota | 18 |

**Dos denominadores que la primera corrida cazó y quedan escritos en el caso:**

1. **el ancho de la VENTANA.** El arnés no lo fija y su Chrome abre a ~740 px: por debajo de 769 px
   la media query no aplica, la fila ocupa el ancho entero y los campos se apilan — que es el
   contrato, no un defecto. TC-522 evalúa contra `matchMedia` real y fija la fila única **fijando**
   el ancho a los 463 px del botón.
2. **el TIPO del campo del strain.** El bloque que convierte los `input[type=number]` a
   `type="text" inputmode="decimal"` corre en `DOMContentLoaded`, y el arnés evalúa los casos con
   `document.readyState` todavía en «interactive»: el campo llega como `number` y **rechaza**
   cualquier cadena no numérica. Sin convertirlo, la condición medía el arnés y no la app.

---

## ⚠️ La tanda AJ7 cerró AJ5-f y AJ5-g (24/10/2026)

- **`vmProtBloqSync()`**: con prótesis mitral, `vm_tipo_im` y `vm_carp` se **atenúan y se
  bloquean**, conservando el valor cargado. Pinta y no escribe.
- **`vmMorfFitSync()`**: el rótulo de la morfología se **mide** contra el ancho útil de hoy y el
  cuerpo baja de a 0,25 px hasta que entre, con piso de 10 px. No se fijó un número.

**`docs/mapa/aj7-correcciones.md` § 3.**

---

## ⚠️ La tanda E REVIRTIÓ la precedencia del Carpentier y retiró el aviso (27/10/2026)

- **Gana el ETE**, no Válvulas: `vmCarpEfectivo()` invierte el orden de este mapa. Con un
  Carpentier en el ETE, el campo de Válvulas queda **deshabilitado** mostrando ese valor, con un
  enlace a la pestaña de origen (`vmCarpOrigenSync`, `vmCarpIrAlEte`).
- **`_vmCarpDiverge` y `vmCarpAvisoSync` YA NO EXISTEN**, ni el nodo `vm-carp-aviso`: con un solo
  dato no hay dos voces que comparar. Todo el § «El aviso de divergencia, y las tres voces» de
  este mapa describe un mecanismo **retirado**.
- **El paréntesis ya no se abstiene** por divergencia, y **la frase de prolapso y la oración de la
  mitral del ETE se callan** cuando él habla: el Carpentier se dice **una sola vez**.
- `vmCarpLegadoSync` lleva una **guarda de repintado** nueva.

**`docs/mapa/e-carpentier-tricuspide-orejuela.md` §§ 1 y 2.**
