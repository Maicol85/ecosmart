# Mapa — el CORAZÓN DERECHO y la RAÍZ AÓRTICA a la Tabla 1 de la ASE 2025 (tanda «VS», 2026-10-17)

> **Mapa NUEVO.** Medido con `wc -c` **ANTES** de escribir: `vd-derecho.md` estaba en 29,1 KB,
> `aortica-cortes.md` en 28,4 y `registro-evidencia.md` en 16,9 — con el contenido de esta tanda
> adentro, los dos primeros cruzaban el techo de 35 KB. Lo que salió a archivo propio es esto, y
> a los cinco mapas de la zona les entró un puntero. `tests-fichas.md` SÍ se partió (33,4 KB).
> Sin números de línea a propósito: la línea cambia en cada edición, el nombre de la función no.

---

## 1 · El dueño único: `ASE25_T1`

Una sola transcripción de la **Tabla 1 de la ASE 2025 de corazón derecho** (Mukherjee M,
Rudski LG y col., *J Am Soc Echocardiogr* 2025;38(3):141-186), **folio impreso 145, hoja 5 del
PDF**. La regla «folio = hoja + 140» se comprobó en el **pie impreso** de tres páginas (hoja 5 →
145, hoja 9 → 149, hoja 19 → 159) y en el **encabezado** de la hoja 20 → 160.

⚠️ **ESA FUENTE CODIFICA `≥` COMO `$` Y `≤` COMO `#`** en su texto extraído. Quien la lea sin
saberlo invierte TODOS los operadores de la tabla.

Cada fila guarda sus bandas en orden, y **el operador va al lado del valor**:

```js
vd_bas: { u:'mm', dec:0, bandas: [ {g:'normal', op:'<', v:41}, {g:'leve', op:'<=', v:44},
                                   {g:'moderada', op:'<=', v:49}, {g:'severa'} ] }
```

⚠️ **POR QUÉ NO HAY UN JUEGO ÚNICO DE OPERADORES: cada fila elige el suyo.** Las de DIMENSIÓN
suben con el techo INCLUIDO; la FAC abre su banda leve con `>29` **exclusivo** y el TAPSE con
`≥1,3` **inclusivo**; la FEVD cierra la moderada con `≥32`; y el índice de Tei sube con el techo
EXCLUIDO. Un juego único movería de lado el valor exacto del corte en **cinco de las once filas**.

**Los valores se guardan en la unidad del CAMPO**, no en la del papel: la guía publica
centímetros y los campos de esta app son milímetros, así que 1,7 cm se guarda como 17 y la
conversión no se repite en cada comparación. La columna `u` dice cuál es esa unidad.

| pieza | qué hace |
|---|---|
| `ase25Grado(clave, x)` | el evaluador ÚNICO: devuelve `normal` / `leve` / `moderada` / `severa`, o `null` |
| `ase25Rango(clave, g, conUnidad)` | el rótulo del rango de una banda, **derivado de los mismos operadores** |
| `ase25Corte(clave, g)` | el VALOR del corte de una banda, para las constantes que se derivan |
| `ASE25_BADGE` | el color por grado: verde · amarillo · naranja · rojo |
| `vdBadgeGrado(...)` | el badge común: valor, categoría EN PALABRAS y rango, con su color |

⚠️ **EL RÓTULO SE DERIVA Y NO SE ESCRIBE.** `ase25Rango` compone el borde inferior negando el
operador de la banda anterior (`< 19` → `≥ 19`; `> 1,7` → `≤ 1,7`) y el superior con el suyo. Con
los dos bordes escritos a mano, el rótulo de una banda puede decir un número que el código no
aplica — que es la trampa del «42-45» que `vdBasCat` ya documentaba.

### El assert de arranque

Barre el dominio de cada fila con el paso de su propia precisión y exige **los cuatro grados, en
orden de gravedad, sin hueco ni solape**. Sin esto, un operador mal tipeado deja una banda
inalcanzable —o dos pisadas— y el único síntoma es una categoría que nunca aparece, que se lee
igual que «este paciente no la tiene». **Verificado por mutación fuera del árbol:** bajando el
techo de la banda leve del área de la AD de 22 a 18, el barrido informa
`['normal','moderada','severa']` y el assert grita.

### ⚠️ Tres cosas que la tabla NO dice como uno espera

1. **NO distingue sexo en ninguna fila** —se leyó entera, no tiene columnas de varón y mujer—,
   así que estos cortes **no pasan por `sexoEfectivo`** y sus barras no esconden el punto cuando
   el sexo falta. Es la diferencia con la zona AI/VI de la tanda LS.
2. **El TAPSE y la onda S′ tienen un SOLAPE tipográfico.** Su banda leve se escribe «≤1.7 to
   ≥1.3» y la moderada «≤1.3 to >1.0», así que **1,3 cm está en las dos** (y 7,2 cm/s igual). Se
   resuelve a favor de la banda **MENOS grave**, que es la convención de las once filas
   ascendentes de la misma tabla —ahí la moderada EXCLUYE el techo de la leve— y además es la
   lectura que no sobre-afirma. **Lo que la app publica es el operador que APLICA**: `<13` y
   `<7.2` para la moderada, no el `≤` del original.
3. **«RAV index (area-length method)» tiene un hueco entre 38 y 39** (leve `≤38`, moderada `>39`).
   Esa fila **no la usa esta app** —no hay volumen de la AD— y queda declarada sin aplicar.
   Y la fila leve de la FEVD 3D se imprime «≤45 to <39», que parece un rango dado vuelta y no lo
   es: va de 45 hacia abajo, y con la moderada en «≤39 to ≥32» no hay hueco ni solape.

---

## 2 · Las doce filas que la app aplica, antes y ahora

| parámetro | dueño | antes | ahora (ASE 2025, Tabla 1) |
|---|---|---|---|
| TAPSE | `vdTapseCat` | `≥17` normal | `>17` · `≤17 a ≥13` · `<13 a >10` · `≤10` mm |
| onda S′ | `vdSprimeCat` | `≥9,5` normal | `>9,5` · `≤9,5 a ≥7,2` · `<7,2 a >5,0` · `≤5,0` cm/s |
| FAC | `vdFacCat` | `≥35` normal, `<25` severa | `>35` · `≤35 a >29` · `≤29 a >22` · `≤22` % |
| FEVD 3D | `vdFevdCat` | `>45` normal (sin grados) | `>45` · `≤45 a >39` · `≤39 a ≥32` · `<32` % |
| índice de Tei (DTI) | `vdTeiCat` | `≥0,55` alterado | `<0,55` · `≥0,55 a <0,62` · `≥0,62 a <0,70` · `≥0,70` |
| diámetro basal | `vdBasCat` | `≤41` / `42-45` / `>45` | `<41` · `≥41 a ≤44` · `>44 a ≤49` · `>49` mm |
| diámetro medio | `vdMidCat` | `>35` dilatado | `<35` · `≥35 a ≤38` · `>38 a ≤42` · `>42` mm |
| diámetro longitudinal | `vdLongCat` | `>86` dilatado (**sin fuente**) | `<82` · `≥82 a ≤89` · `>89 a ≤96` · `>96` mm |
| pared libre | `vdParedCat` | `<5` / `5-7` / `>7-9` / `>9` | **IDÉNTICO** |
| área telesistólica | `vdAreaSCat` | no se clasificaba | `<14` · `≥14 a ≤16` · `>16 a ≤19` · `>19` cm² |
| área telediastólica | `vdAreaDCat` | no se clasificaba | `<25` · `≥25 a ≤28` · `>28 a ≤32` · `>32` cm² |
| área de la AD | `adAreaCat` | `≤18` normal, `>18` dilatada | `<19` · `≥19 a ≤22` · `>22 a ≤24` · `>24` cm² |

⚠️ **LA PARED ES LA ÚNICA FILA QUE LA APP YA TENÍA EXACTAMENTE COMO LA GUÍA LA PUBLICA**, así que
ahí esto no es un cambio de corte sino el retiro de la segunda copia: sus seis escenas de borde
salen idénticas al árbol de entrada.
⚠️ **EL 86 DEL LONGITUDINAL NO ESTABA EN NINGUNA GUÍA.** Su ficha `DIM-VD-003` figuraba «por
verificar» y declarada como criterio propio desde la tanda M.
⚠️ **EL 25 % DE LA FAC SEVERA TAMPOCO.** Su propio comentario lo declaraba criterio de la app.

### Lo que NO entra en la tabla, y por qué

* **El tiempo de aceleración pulmonar.** La Tabla 1 lo gradúa y esta orden lo deja como está:
  `UMBRAL_TAP_HTP` conserva su `<105` y su única banda. Es el **control negativo** de que no se
  gradúa lo que no se pidió.
* **El diámetro del TSVD.** La Tabla 1 le da **TRES** filas con cortes distintos —PLAX `<3,3`,
  PSAX proximal `<3,4`, PSAX distal `<2,9`— y el campo de la app (`tsvd_diametro`, rotulado
  «Diám. TSVD (mm)») **no dice en qué vista se mide**. No se gradúa.
* **La relación VD/VI y el diámetro de la arteria pulmonar**, que no votan hoy.

---

## 3 · Las constantes que se DERIVAN, y una trampa que costó un caso

`UMBRAL_TAPSE_NORMAL`, `UMBRAL_SPRIME_NORMAL`, `UMBRAL_FAC_VD_NORMAL`, `UMBRAL_FAC_VD_SEVERA`,
`UMBRAL_FEVD_NORMAL`, `VD_TEI_DTI_ALT_MIN`, `VD_PARED_HVD_MIN`, `VD_BAS_NORMAL_MAX`,
`VD_BAS_LEVE_MAX`, `VD_MID_NORMAL_MAX`, `VD_LONG_NORMAL_MAX` y `UMBRAL_AD_AREA_NORMAL` salen hoy
de `ase25Corte`. Ninguna repite un número.

⚠️ **LOS DOS PRIMEROS SE MUDARON DE SITIO.** `UMBRAL_TAPSE_NORMAL` y `UMBRAL_SPRIME_NORMAL`
estaban declarados ANTES de la tabla, así que derivarlos en su lugar era un `ReferenceError` por
zona muerta de `const`. Se movieron a continuación de `ASE25_T1`.

⚠️ **Y DOS SE DERIVARON CON LA BANDA EQUIVOCADA — LO CAZÓ TC-457, NO LA LECTURA.** En una fila
ASCENDENTE el `v` de cada banda es su **TECHO**, así que `ase25Corte('vd_pared','leve')` devuelve
**7** —el techo de la banda leve— y no 5, que es donde empieza la hipertrofia. **El corte de una
fila ascendente es el `v` de la banda `normal`.** Lo mismo con el índice de Tei (0,62 en vez de
0,55). Las dos salieron mal al escribirlas y el caso las puso en rojo con el valor a la vista.

---

## 4 · Las superficies, una por una

### Informe narrativo y EN SUMA

* **El TAMAÑO del VD pasa de DOS categorías a CUATRO**, con el vocabulario que la app ya usa para
  la aurícula izquierda: `VD_TAM_TXT` = «de dimensiones normales» · «levemente dilatado» ·
  «moderadamente dilatado» · «severamente dilatado». El grado lo elige **`vdTamPeor`**: el PEOR
  de los diámetros medidos, que es la MISMA regla de siempre.
  ⚠️ **SE VA EL CASO ESPECIAL `vdSoloLeve`** —«levemente dilatado» sólo si el ÚNICO hallazgo era
  el basal en su banda leve—, que existía porque el basal era el único diámetro con banda
  intermedia. Con los tres graduados, un VD medio de 36 mm es leve POR SU PROPIA banda.
* **El ÁREA de la AD pasa a cuatro categorías** por el mismo camino, y acá vivía una **SEGUNDA
  comparación** contra la constante dentro de `generarInforme`, al lado de la de `adAreaCat`.
* **La función sistólica sigue siendo BINARIA en el informe**, y es deliberado: el informe nunca
  publicó una categoría por parámetro —publica UN veredicto combinado— y graduar ESE veredicto
  pide una regla de integración que esta orden difiere. El grado de cada parámetro vive en la
  cápsula, en la tarjeta y en Referencias.
* **La línea de FAC severa del EN SUMA** no se tocó: cambió su compuerta, de `<25` a `≤22`.
* ⚠️ **EL `sp < 9.5` ERA UN LITERAL** dentro de `generarInforme`, el último corte de esta zona que
  vivía escrito a mano en el informe FIRMADO.

### La lógica de integración — **NO CAMBIA**

```
tapseBajo || spBajo || facBajo || teiAlt      ← cada uno sólo si está medido; UNO alcanza
```

Lo único que cambia es de dónde sale cada «está alterado»: de los dueños, o sea de la Tabla 1.
**La FEVD sigue FUERA del OR**, como siempre: meterla cambiaría qué escenas publican «disfunción
sistólica» en el informe firmado.

### PDF

Las referencias IMPRESAS siguen al operador del dueño: TAPSE «>17 mm», S′ «>9.5 cm/s», FAC «>35%»,
FEVD «>45%», basal «<41 mm», medio «<35 mm», longitud «<82 mm», área AD «<19 cm2» y VCI «<=21 mm»
—que antes era un rango «16-20 mm» con un piso que ninguna guía da—.

### PPT y Excel

**No cambian.** El PPT publica `_pptNum('vd_bas')` y `_pptNum('ad_area')`, o sea el VALOR y no la
categoría. El Excel queda en **440 columnas**; la única que guarda una categoría derivada de esta
zona es `DisfSist_VD`, que **sigue siendo BINARIA** y sale del TEXTO del informe por
`_labDisfSistVent` — cambia sólo en las escenas donde el OR cambia.

### Vista 2D

⚠️ **EL DIBUJO LEÍA LAS DOS CÁMARAS DERECHAS POR EL TEXTO DE LA CÁPSULA, Y DEJÓ DE AGRANDARLAS EN
SILENCIO.** `E.dvd` buscaba el sintagma «dilatado» y `E.dad` «dilatada»; con las cápsulas nuevas
—«Dilatación moderada — basal 48 mm (…)» y «25 cm² — dilatación severa (…)»— ninguno aparece.
Hoy se le preguntan al DUEÑO (`vdTamPeor` y `adAreaCat`). **Lo cazó TC-482, no la lectura.** La
granularidad del dibujo no cambia: el ventrículo sigue teniendo tres tamaños y la aurícula dos.

### Dos consumidores de fuera de la pestaña

La categoría `dilatado` **dejó de existir**, y los dos habrían fallado en silencio:

* el **panel de Evidencia** (`_indVD`) la usaba para decir «la sobrecarga de volumen del VD es el
  criterio Clase I». Pasa a preguntar «no es normal y no es leve», la MISMA frontera con otro
  nombre; su conducta sólo se mueve en los dos bordes que esta tanda movió;
* la **conexión venosa pulmonar anómala** (`cvpaEstado`) comparaba contra una LISTA de nombres, y
  con ella un basal moderado o severo contaba como NO dilatado.

---

## 5 · La vena cava inferior

`pmadEstimar` aplicaba `< 21` como diámetro normal, así que a 21,0 mm EXACTOS lo trataba como
dilatado; el folio 160 escribe, literal: **«A normal IVC diameter is ≤2.1 cm»**. Hoy es `<= 21`.

⚠️ **ESO MUEVE LA PmAD EN UN VALOR, Y CON ELLA LA PSAP.** Con 21,0 mm y colapso mayor del 50 % la
presión pasa de 8 a 3 mmHg, y sin colapso de 15 a 8; la PSAP estimada —`4 × VRT² + PmAD`— baja
5 mmHg en esas dos escenas. Con 20, 21,1 y 22 mm no se mueve nada.

La tabla de la vena cava de la tarjeta sigue al operador: sus dos rótulos pasan de «Menos de
21 mm» y «21 mm o más» a **«21 mm o menos»** y **«Más de 21 mm»**. Los cuatro valores de presión
salen de llamar al dueño, así que las cuatro filas se alinearon solas.

⚠️ **LA GUÍA TIENE UNA QUINTA CATEGORÍA QUE LA APP NO IMPLEMENTA**, y queda declarada: «In cases
in which the IVC is markedly enlarged (>2.5 cm) without respirophasic variation and evidence of
spontaneous echo contrast or color flow reflux, a value of 20 mm Hg can be considered» (folio
160). La app **no tiene campo** para el contraste espontáneo ni para el reflujo de color. La
tabla de 3 / 8 / 15 mmHg no se tocó.

---

## 6 · La raíz aórtica — «40 mm o más»

Decisión de Maicol. El corte **no se movió** —sigue siendo 40 mm— y lo que cambia es el operador:
`> 40` pasa a `>= 40`. Es **criterio de EcoSmart** y no se le atribuye a ninguna guía: la ficha
`AOR-001` figura «por verificar» y no publica fuente.

**Los otros cuatro segmentos NO se tocan** y conservan su `>` estricto: unión sinotubular 38,
aorta ascendente 40, cayado 40 y aorta torácica descendente 35.

El operador vive **al lado del valor** (`incRef:true` en `AO_SEGS`) y sale a un dueño propio,
**`aoSegDil`**, porque había **TRES copias** del `x > sg.ref`: la cascada de `aoSegGrado`, la
celda compacta de la aorta del PDF y la estadística de válvula aórtica bicúspide del Laboratorio.
El **símbolo** que publican la cápsula, el PDF, la nota del Laboratorio y Referencias también se
deriva (`aoSegSim`).

⚠️ **LA TARJETA SONDEA EL PISO DE LA BANDA `leve` Y NO EL TECHO DE LA `normal`.** Con el operador
nuevo, el techo de lo normal es el valor ANTERIOR del barrido —39 con paso 1— y la tarjeta habría
publicado «Corte de EcoSmart: 39 mm» sobre una app que llama dilatados a los 40. Hoy dice
**«Corte de EcoSmart: 40 mm o más»**, y es el mismo número que dibuja la línea del nomograma.

---

## 7 · Las tarjetas ⓘ y Referencias

Las once barras graduadas pasan de dos o tres zonas a **CUATRO**, y no hubo que tocar el motor de
dibujo: las bandas se **SONDEAN** al dueño. Lo que sí cambia es **cómo se nombra cada corte**:

| barra | `corteEn` | por qué |
|---|---|---|
| los tres diámetros, la pared, las dos áreas, el área de la AD | `['desde','hasta','hasta']` | la tabla escribe «<4.1 · ≥4.1 a ≤4.4 · >4.4 a ≤4.9 · >4.9» |
| TAPSE y onda S′ | `['hasta','desde','hasta']` | **tres operadores distintos en una sola barra** |
| FEVD | `['desde','hasta','hasta']` | su banda moderada se cierra con `≥32` |
| FAC | el modo por omisión | sus tres cortes por el techo de la banda de abajo |
| índice de Tei | `'desde'` | sus tres bandas se abren con `≥` |

Con un solo modo, uno de los grupos sale **corrido un paso de sondeo** —«40 mm» en vez de 41,
«46 %» en vez de 45— que es un número que el médico no reconoce.

⚠️ **EL `colores` DE TAPSE, ONDA S′ Y FEVD SE RETIRA.** Existía porque esas tres tenían UNA sola
banda anormal y la palabra «disfuncion» era, en la FAC, la del MEDIO. Con cuatro grados, el
override habría pintado de rojo las cuatro bandas. El del tiempo de aceleración pulmonar se
conserva: es el único que sigue teniendo dos.

**Referencias** (`ref-ad`, `ref-vd2`, `ref-ao2`) eran **cadenas escritas a mano** —«≤ 18 cm²»,
«≥ 17 mm», «≥ 35 % · < 25 %»— y habrían quedado viejas en bloque, que es lo peor que puede
pasarle a la superficie que el médico consulta justamente para saber con qué se graduó. Hoy las
arma `_evRefFilasT1`, una fila por grado con el rango que `ase25Rango` publica. `ref-vd2` pasa de
12 filas a **45** y gana las dos barras de las áreas; su **bibliografía queda en UNA entrada**,
porque sus doce fichas citan la misma Tabla 1, y la de la AD pasa de una a **TRES**, porque sus
tres fichas quedaron verificadas y cada una cita otra ubicación de la misma guía.

### Lo medido de las tarjetas

48 celdas —seis viewports × dos temas × cuatro tarjetas—, con la clase `light-mode` COMPROBADA en
cada pasada:

* las cuatro abren, cierran con el segundo toque y entran **enteras** en el viewport en las 48;
* **CERO scroll interno** y **CERO scroll horizontal** de la página en las 48. La tarjeta de
  función mide hoy **562 px** y la de tamaño **526** con sus seis barras;
* los cuatro colores resuelven **reales y distintos** en los dos temas: normal `rgb(62,207,142)`,
  leve `rgb(245,200,66)`, moderada `rgb(245,158,66)` y severa `rgb(240,84,84)` de noche;
  `rgb(31,157,108)`, `rgb(184,134,11)`, `rgb(217,123,31)` y `rgb(214,59,59)` de día;
* las bandas **no llevan palabras de gravedad**: lo único escrito debajo de cada una es el corte
  con su número y su unidad;
* 20 aperturas y cierres dejan **12.515 nodos → 12.515** y la tarjeta cerrada.

---

## 8 · El registro

Las **catorce** fichas de la zona se actualizaron contra el original y **doce pasaron a
«verificado»** (ocho venían de «parcial» o «por verificar»). Entran **`DIM-VD-005`** y
**`DIM-VD-006`**, las dos áreas del VD. La única que sigue **«por verificar»** es **`AOR-001`**,
el criterio propio de EcoSmart, y es el control negativo de que la línea de fuente se publica
sólo desde una ficha verificada.

---

## 9 · Trampas de esta tanda

1. **En una fila ascendente, el `v` de una banda es su TECHO y no su piso.** Dos constantes
   salieron derivadas con la banda equivocada —`VD_PARED_HVD_MIN` en 7 y `VD_TEI_DTI_ALT_MIN` en
   0,62— y lo cazó TC-457 con el valor a la vista.
2. **Un lector que busca el SINTAGMA de una cápsula se rompe en silencio cuando la cápsula
   cambia de palabras.** La vista 2D dejó de agrandar las dos cámaras derechas; lo cazó TC-482.
3. **Al retirar una variable de una función hay que mirar TODOS sus usos.** `vdTxt` y `adTxt`
   seguían usándose en la tabla de cavidades: `v2dEstado` tiraba `ReferenceError` y el panel
   entero dejaba de abrir, lo que puso en rojo TRES casos que nada tenían que ver.
4. **La tarjeta se cierra con `style.display = none` y NO con el atributo `hidden`:** preguntar
   por el atributo informa «no cerró» sobre un cierre perfecto, en las cuatro.
5. **El bucle de veinte aperturas hay que arrancarlo con la tarjeta CERRADA** — con ella abierta,
   cuarenta clics la dejan abierta. Es la lección que el mapa de la tanda M ya tiene escrita.
6. **Un filtro de líneas del informe anclado en «^VD » no ve «… del VD (FAC 23%).»**, que es la
   línea de la FAC severa del EN SUMA: el A/B informó «el informe no cambia» sobre la escena que
   SÍ cambia. Es la trampa del denominador, esta vez en el lector.
7. **Un acento grave dentro del template de una sonda o del cuerpo de un caso rompe el parseo**, y
   `check_backticks.py` **no alcanza** los templates inline de una sonda: ésos los da
   `node --check`. **Correr los dos.** Se pagó tres veces en esta tanda.
8. **Los campos de Válvulas viven detrás de DOS puertas y sus nombres no coinciden** —el
   contenedor es `#bloque-insuf-mitral` y el `onclick` dice `valvDatosTog('caja-insuf-mitral')`—,
   así que ningún buscador por id da con el par: la escena de control abortó con «SIN GEOMETRIA
   im_vc» hasta que la sonda volvió a clickear los controles reales.
