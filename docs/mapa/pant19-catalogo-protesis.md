# El catálogo de prótesis por modelo y tamaño — tanda PANT-19 (2026-11-06)

> Qué tocar cuando haya que mover el catálogo de modelos, el botón «Modelo y tamaño», los
> valores esperados, la EOA indexada predicha o la EOA frente a la del modelo en la tarjeta de
> severidad aórtica.
>
> Lo de antes de esta tanda está en `docs/mapa/pant18-protesis-aortica.md` y en
> `docs/mapa/protesis-valvular.md`.

---

## 1 · Las tres tablas de datos, y qué las sostiene

| constante | qué trae | de dónde | transcripción |
|---|---|---|---|
| `PROT_CAT_A4` | **49** modelos aórticos quirúrgicos, 211 tamaños, 523 celdas | ASE 2024, Tabla A4, hojas 52-57, folios 53-58 | `docs/TRANSCRIPCION_A4_P19.md` |
| `PROT_CAT_TAVI` | **9** modelos transcatéter, 29 tamaños, 78 celdas | Tablas A1 y A2 (hoja 50, folio 51) y A3 (hoja 51, folio 52) | `docs/TRANSCRIPCION_TAVI_P19.md` |
| `PROT_CAT_A5` | **30** modelos mitrales quirúrgicos, 122 tamaños, 391 celdas | Tabla A5, hojas 57-60, folios 58-61 | `docs/TRANSCRIPCION_MITRAL_P19.md` |

Cada una trae además su `_COLS` —**el orden de los valores de cada fila**, que el consumidor lee
de ahí y no de memoria— y su `_FTE` —la guía, la tabla, las hojas y los folios que la tarjeta
cita al pie—.

**La forma de cada entrada:** `{ n:nombre, d:descriptor, t:tipo, f:folio, s:[[tamaño, …valores]] }`,
con cada valor `[media, desvío]` o `null`. **El tamaño es TEXTO** —la tabla imprime `19`,
`19-21`, `All` y `XL (27)`— y **`null` es una celda vacía impresa**; un desvío `null` es un valor
**impreso sin desvío**.

⚠️ **TRES CASOS DE PRUEBA COMPARAN EL CÓDIGO CONTRA SU TRANSCRIPCIÓN** —TC-729, TC-730 y
TC-735—: cuentan los modelos, los tamaños, las celdas con dato y las vacías, y verifican las
filas de control leídas en imagen. Quitar una celda los pone en rojo.

## 2 · De dónde sale el TIPO de un modelo, y por qué diez quedan sin él

**La Tabla A4 no tiene subtítulos de sección por tipo** —el índice de la orden decía que sí, y
no—. Lo único que hay es una segunda línea **en cursiva** dentro de la celda «Valve», que a veces
es un **descriptor de construcción** (`Bileaflet`, `Single tilting disk`, `Caged ball`,
`Stented porcine`, `Stented bovine pericardial`, `Stentless`, `Homograft valves`, `Sutureless`,
y en la A5 también `Tilting disk`, `Stented bioprosthesis`, `Stentless bioprosthesis`,
`Stented pericardial`) y a veces un **nombre comercial** (`Trifecta`, `Epic`, `Mosaic`, `Avalus`,
`Intuity`, `Inspiris Resilia`, `3F Enable`, `Trilogy`, `Mitris`).

**El nombre y el descriptor se separan por la FUENTE del PDF** (`AdvPSA183` romana contra
`Advhelvneue-italic` cursiva), que es mecánico. Después:

- cursiva ∈ descriptores → **nombre** = romana, **descriptor** = cursiva;
- si no → **nombre** = romana + cursiva, **sin descriptor**.

**El tipo se asigna sólo** a los que nombran el mecanismo (`mec`) o el tejido (`bio`).
`Homograft valves` y `Sutureless` describen el injerto y el método de implante, no el material:
quedan **sin dato**, y **un modelo sin tipo se ofrece bajo CUALQUIER morfología de prótesis** —el
lado seguro, que nunca esconde un modelo—.

⚠️ **El PDF codifica la mayúscula inicial del span cursivo en la fuente romana** en siete filas
(«Biocor **S**» + «tented porcine»): se repone mecánicamente.
⚠️ **La A5 imprime UNA vez el descriptor con mayúscula** —`Stented Bioprosthesis`— y se reconoce
como el mismo.

## 3 · Cómo se lee el símbolo ± que el PDF codifica como «6»

**Por geometría, y no por el texto.** El glifo del ± mide **6,6 pt** y un dígito **4,4**; el punto
decimal **2,2**. Si el ancho real de un token supera en ~2,2 pt el ancho esperado de sus
caracteres, uno de sus «6» es el símbolo.

Eso lee bien los dos casos que rompen cualquier regla más simple: **«11 ± 6»**, donde el seis es
un desvío de verdad, y **«21.46»**, que es «21.4 ±» pegado. Probado contra la imagen en doce
celdas elegidas por ser las difíciles: **12 de 12**.

## 4 · El componente «Modelo y tamaño»

**UN solo componente, parametrizado por posición.** Lo que cambia por válvula vive en
**`VMOD_POS`**: el id del select de morfología, los cuatro campos guardados, los campos medidos
que se comparan y la función de PPM de esa válvula. El resto es común.

| pieza | función |
|---|---|
| qué catálogo corresponde a la morfología | `vModCatalogo(pos)` |
| los valores esperados del modelo y el tamaño guardados | `vModEsperados(pos)` |
| la EOA indexada predicha y su categoría | `vModIndexada(pos, eoa)` |
| **el pintor** — botón, cuadritos, línea de abajo y lo medido | `vModSync(pos)` · `vModSyncTodos()` |
| abrir, cerrar, elegir y quitar | `vModAbrir` · `vModCerrar` · `vModClic` · `vModElegir` · `vModQuitar` |
| la limpieza al cambiar de morfología | `vModMorfSync(pos)` |

**La card es ÚNICA y cuelga del body**, como la tarjeta de los globos: una por posición serían dos
DOM que divergen. La coloca `_vModColocar` bajo el botón que la abrió, y **a 900 px o menos es
una hoja fija abajo** con scroll interno y tope del 80 % de la ventana.

⚠️ **La lista de sugerencias NO se abre sola al abrir la card** —en la demo tapaba los enlaces de
abajo— **y va EN FLUJO, no superpuesta**: flotando tapaba «No sé el modelo: ver todos y elegir»,
que es justo el enlace al que va el médico que no encuentra su modelo escribiendo. Medido antes y
después: tapaba = `true` → `false`.

⚠️ **El « mm» sólo se escribe con un tamaño NUMÉRICO**: la tabla también imprime «All», «19-21» y
«XL (27)».

### Las tres columnas del pintor

`vModSyncTodos` entra en **`ESPEJOS_VIVOS`** (sólo pinta, no escribe un campo del estudio), en
**`RECALC_MODULOS`** (las rutas de restauración pueblan asignando `.value`, que no dispara
`input`) y **al final de `limpiarCampos`**.

⚠️ **EN LAS DOS LISTAS VA DESPUÉS DE `ccPuertaSync` —y de `vciNoVisSync` en `RECALC_MODULOS`—, NO
ANTES, y lo exigen DOS casos existentes**: **TC-676 (D2)** y **TC-700 (A5)(A6)**. Esos dos
encienden interruptores que los pintores **leen**, así que el orden de las dos primeras entradas
es parte del contrato de esas listas. Este pintor no lee ninguno de los dos —sólo pinta el botón y
los cuadritos—, así que su posición es libre y respeta la regla que ya estaba. **La primera versión
lo puso PRIMERO y puso rojo a los dos casos**: se corrigió la app, no los casos. La tercera la cazó la sonda y no una lectura: los
cuatro campos sí los vacía el barrido genérico, pero el **rótulo** del botón lo escribe `vModSync`,
que «Nuevo estudio» no llamaba, y dejaba el botón diciendo «Medtronic Mosaic · 25 mm» sobre un
formulario en blanco.

### Los campos guardados

`va_prot_modelo`, `va_prot_tam`, `va_prot_gmref`, `va_prot_eoaref`. **Guión BAJO**, así que
`_noEsDelEstudio` —que excluye por prefijo con guión MEDIO— no los saca del estudio. Van ocultos
con `display:none` y **no con `type="hidden"`**: en un hidden el `value` y el `defaultValue` son
el mismo atributo y «Nuevo estudio» no los limpiaría (P14c-g).

**Cuatro columnas de Excel, 441 → 445**, con estos nombres exactos:

| columna | campo |
|---|---|
| `Modelo de prótesis aórtica` | `va_prot_modelo` |
| `Tamaño de prótesis aórtica` | `va_prot_tam` |
| `G. medio de referencia aórtico (mmHg)` | `va_prot_gmref` |
| `AVA de referencia aórtica (cm²)` | `va_prot_eoaref` |

⚠️ **La última se llama «AVA» y no «AEO», y lo decidió un caso existente**, no una preferencia: la
condición «(F) el Excel sigue en 441 columnas y NINGÚN encabezado cambió de nombre» exige que
ningún encabezado contenga «EOA» ni «AEO». Es además la sigla con la que el propio Excel ya nombra
el área valvular aórtica en la columna de al lado, «AVA (cm²)». El **id del campo no cambió**.
Ver `docs/PENDIENTES.md` → **P19-g**.

Las cuatro salen **sólo con una prótesis**: `valvEsProtesis(c.va_morf)` las deja vacías en una
válvula nativa, porque en una válvula nativa no hay modelo que informar.

## 5 · La EOA frente a la del modelo en la tarjeta de severidad aórtica

**Fila «EOA §» de la Tabla 5, hoja 18, folio 19**, leída en imagen:
`Reference EOA ± 1 SD` · `1 SD smaller than reference EOA` · `2 SDs smaller than reference EOA`.
La nota `§` dice «Flow independent», así que entra **del mismo lado que el DVI**.

| | |
|---|---|
| **el evaluador** | `eaProtEOAz()` → `{z, nivel, ava, ref, sd, modelo, tam, folio}` o `null` |
| **los cortes** | `EA_PROT_EOA_Z` = `{normalMin:-1, signifMax:-2}` |
| **dónde entra** | `eaProtVeredicto` → `nv.eoa`, y `indep = [nv.dvi, nv.eoa]` |
| **la bandera** | `eoaEvaluable` deja de ser siempre `false` |

**Las cuatro condiciones**, todas de la orden del médico: prótesis **quirúrgica** (no TAVI),
modelo **y** tamaño del **catálogo** (no el modo manual), **desvío** de la EOA del modelo mayor
que cero, y **AVA por continuidad** calculada y sin la marca «(revisar)».

⚠️ **CON EL TSVI DE 21 mm LA EOA Y EL DVI SE MUEVEN JUNTOS Y LA EOA NO APORTA NADA.** Los dos
salen del cociente de los dos VTI; lo que los separa es el **diámetro del TSVI**: con 16 mm el DVI
se queda normal (0,40) mientras el área cae a 0,80 cm², dos desvíos por debajo de la del modelo.
**Ésa es la única familia de escenas donde este commit cambia el resultado de la tarjeta**, y por
lo tanto el papel. Un A/B que no la incluya da cero sin probar nada.

⚠️ **Los bordes los resuelve la app, no la tabla**, y está declarado en **P19-b**: el «± 1 SD» de
la columna normal se superpone con «1 SD smaller», y una EOA **por encima** de la del modelo no
cae en ninguna de las tres. Se resuelve por **complemento** —lo que la tabla no llama estenosis no
es estenosis, y las dos columnas de estenosis dicen «smaller»—, que es la convención de la casa
desde el hueco impreso del gradiente medio mitral.

## 6 · Lo que esta tanda NO hizo

- **El componente en la MITRAL** (commit 7): su fila de morfología es un grid de tres con el ancho
  acotado al botón «Insuficiencia», que **TC-522 vigila**, y a 1000 px ya está en una columna. Un
  cuarto hijo apretaría las tres celdas por debajo del piso de 144 px. **Los datos (`PROT_CAT_A5`)
  sí están cargados**, así que la tanda siguiente sólo tiene que decidir dónde va el botón. → **P19-e**.
- **La Tabla A6** (SAPIEN mitral): la morfología mitral no tiene ninguna opción de implante
  transcatéter y su eje no es modelo × tamaño. → **P19-d**.

## 7 · Lo que el barrido de mutaciones enseñó, caso por caso

El primer barrido dejó **doce sobrevivientes y siete anclas que no aplicaron**, y ninguna de las
doce era «falta de cobertura» a secas: se repartieron en cinco clases distintas, cada una medida.

**Huecos reales — cinco condiciones nuevas.**
- La búsqueda de modelos es **por palabra**, y «han» y «mosa» caen al principio de una: una
  búsqueda laxa las encuentra igual. Lo único que separa las dos reglas es una consulta que caiga
  **en medio** de una palabra → **TC-731 (B3b)**, con «ifecta» dentro de «Trifecta».
- La EOA indexada predicha se medía por sus **cortes** y no por su **valor**, así que dejar de
  dividir por el ASC pasaba en verde → **TC-732 (B0b)**, que recalcula el número con el ASC que la
  propia función publica.
- Ninguna escena traía un valor esperado **sin desvío impreso** → **TC-732 (D4)**, con la
  Edwards Mira 25, que imprime el gradiente medio con desvío y la EOA sin: la misma escena mide
  las dos mitades.
- La EOA era **siempre el peor** de los dos ejes independientes, así que quedarse con la EOA en
  lugar del DVI daba el mismo resultado → **TC-734 (F)**, con un TSVI de 28 mm y un VTI aórtico de
  90: el DVI cae a 0,20 —significativo— y el área queda a 0,93 desvíos, o sea normal.
- La guarda del `(revisar)` no tenía escena → **TC-734 (C6)**, que la siembra en el campo. ⚠️ Se
  puede sembrar porque **el campo del AVA es de TEXTO en tiempo de ejecución** —su `type`
  computado es `text`, no `number`, medido—, así que un valor con la marca puede llegar por un
  estudio guardado o por el importador; (C7) es su control: sin la marca, el mismo valor sí se
  evalúa.

**Dos frenos que tapaban a la mutación, los dos medidos.** Con el manejador de Escape del
componente **roto la card se cierra igual**, porque la app tiene su propio Escape general; y el
foco **ya estaba** en el botón, porque `vModElegir` lo devuelve al elegir. Por eso el bloque (E)
de TC-731 **mueve el foco** al campo del modelo antes del Escape y **(E0)** lo declara: sin eso,
(E1) y (E2) pasaban las dos con el manejador apagado.

**Dos pares de guardas redundantes, que se tapan mutuamente.** `vModSyncTodos` está en
`RECALC_MODULOS` **y** en `ESPEJOS_VIVOS` a propósito, así que sacarlo de una sola lista lo tapa la
otra; y `E.manual` protege lo mismo que la guarda del desvío, porque el modo manual construye sus
valores con desvío `null`. Las dos mutaciones **rompen las dos mitades a la vez**, que es la
lección del D-11.

**Una mutación mal dirigida, y de ella nació una condición.** La del modo manual apuntaba a
`_vModDraft` —el **borrador** de la tarjeta— y la condición que la mata mide `vModEsperados`, que
es **otro** constructor de valores manuales. Hoy son dos mutaciones: la 23 sobre el dueño que llega
al estudio y la **43** sobre el borrador, con **TC-731 (D4)** nueva para matarla.

**Una mutación mal escrita.** La de la lista de sugerencias flotante: con **sólo** el CSS la lista
sigue colgada de la tarjeta, así que `top:100%` la manda **debajo** de la tarjeta y no tapa nada.
El defecto original es la lista **dentro** de la fila —que es `position:relative`— y absoluta, o
sea **dos** mitades.

⚠️ **Y siete anclas no aplicaron, todas por lo mismo:** en el `.py` del barrido las escribí con
secuencias `\uXXXX` y `index.html` tiene el **carácter real** («ó», «·», «−»). Más dos de
contenido: hay **dos** modelos «Abbott Epic» en la A4 —folio 53 y folio 58— así que el ancla lleva
el folio, y los valores se imprimen con sus decimales (`[27.00,10.20]`, no `[27,10.2]`). El script
verifica que **cada ancla exista exactamente una vez** antes de correr, y por eso lo dijo en vez de
puntuar una sobrevivencia falsa.

## 8 · Dónde está lo demás

| qué | dónde |
|---|---|
| el inventario de solo lectura del commit 1 | `docs/INVENTARIO_CATALOGO_PROTESIS_P19.md` |
| las tres transcripciones celda por celda | `docs/TRANSCRIPCION_A4_P19.md` · `docs/TRANSCRIPCION_TAVI_P19.md` · `docs/TRANSCRIPCION_MITRAL_P19.md` |
| la regla de folio comprobada en las once hojas, y la tabla «Cambios de evidencia» | `docs/fuentes/FUENTES.md` → «La tanda PANT-19» |
| las fichas de los siete casos | `docs/mapa/tests-fichas-729.md` |
| el índice de casos por tanda | `docs/mapa/tests-punteros-tandas.md` → «PANT-19» |
| lo declarado y lo parado | `docs/PENDIENTES.md` → **P19-a** a **P19-g** |
| la guía de prueba manual, en 26 pasos | `docs/GUIA_PRUEBA_PANT19.md` |
| el barrido de mutaciones | `scripts/_mut_pant19.py` (43 mutaciones, cada una con SU caso) |
| la suite en lotes de 55, con el pendrive verificado | `scripts/_lotes_pant19.sh` |
| las sondas | `scripts/_probe_pant19inv.mjs` · `_probe_pant19mod.mjs` · `_probe_pant19geo.mjs` (dos motores) · `_probe_pant19eoa.mjs` · `_probe_pant19ab.mjs` + `_ab_pant19diff.mjs` |
