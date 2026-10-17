# Mapa — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA (tanda «M», 2026-10-16)

> **Mapa NUEVO.** Medido con `wc -c` **ANTES** de escribir: `vd-derecho.md` estaba en **34,4 KB**
> —a 600 bytes del techo— así que primero se partió (su bloque G3 salió a
> `docs/mapa/vd-g3-campos.md`) y después se le puso un puntero. `aortica-cortes.md` (27,4 KB) y
> `registro-evidencia.md` (14,8 KB) tenían margen.
> Sin números de línea a propósito: la línea cambia en cada edición, el nombre de la función no.
> Es la continuación del «L»: el mecanismo, el registro y el motor de dibujo están en
> `docs/mapa/registro-evidencia.md` y **no se repiten acá**.

---

## 1 · Qué se reusó tal cual, y qué se extendió

De la tanda L se reusa **todo el mecanismo**: `EV_REG` + `evFicha` + `evFuenteLinea`,
`evCortes` + `_evBandas` (el sondeo del dueño), `_evBarra` + `_evFuentesPie` + `EV_COLOR` (el
motor de dibujo), `VINFO` + `vInfoClic` + `#vinfo-card` (el globo), `_evRefTabla` +
`_evRefBiblio` + `_evRefBarras` + `evRefPintar` (Referencias) y el repintado en vivo
(`_evTarjetaViva`). Las tres tarjetas del L **no se mueven un píxel**.

Lo único que se extiende son **dos cosas, las dos opcionales y aditivas**:

| qué | para qué |
|---|---|
| `cfg.colores` en `_evBarra` | una barra pide otro color para una categoría sin tocar el mapa global. La misma palabra —«disfunción»— es la banda del **medio** en la FAC y la **peor** en el TAPSE, la onda S′ y la FEVD. |
| `cfg.corteEn` acepta una **LISTA** | el operador no tiene por qué ser el mismo en los tres cortes de una barra. |

⚠️ **LO SEGUNDO NO ES UN LUJO, Y LO VIO LA CAPTURA.** El espesor de la pared del VD se nombra
`< 0,5 · ≥0,5 a ≤0,7 · >0,7 a ≤0,9 · >0,9`: el primer corte se dice por el **piso de la banda de
arriba** (5) y los otros dos por el **techo de la de abajo** (7 y 9). Con un solo modo para toda
la barra, uno de los dos grupos sale corrido un paso de sondeo —«4,9 mm» o «7,1 mm»—, que es un
número que el médico no reconoce. Lo mismo pasaba con la FEVD («46 %» donde la guía dice 45) y
con el índice de Tei («0,54» donde dice 0,55).

---

## 2 · Los doce dueños PUROS que entraron, y por qué

Las tarjetas **sondean** al dueño: `_evBandas` barre su dominio y anota dónde cambia de
categoría. Para eso el dueño tiene que ser una función **pura** —sin leer ni escribir el DOM—, y
seis de estas comparaciones vivían **dentro** de funciones que sí lo leen. Se extrajeron sin
tocarles un número ni un operador, y sus llamadores pasaron a consumirlas, así que sigue habiendo
**una sola comparación por corte**.

| dueño | de dónde salió | lo consume |
|---|---|---|
| `aoSegGrado(sg, x)` | la cascada de `aoSegsMedidos` | `aoSegsMedidos`, la tarjeta de la aorta |
| `adAreaCat(x)` | el cuerpo de `calcAD` | `calcAD`, la tarjeta de AD/VCI |
| `pmadEstimar(diam, col)` | las cuatro ramas de `calcPmAD` | `calcPmAD`, la tabla de la tarjeta |
| `vdMidCat` / `vdLongCat` | el `x > d.max` de `vdDiamsMedidos` | `vdDiamsMedidos`, la tarjeta de tamaño |
| `vdParedCat(x)` | `vdHvdEstado` | `vdHvdEstado`, la tarjeta de tamaño |
| `vdTapseCat` · `vdSprimeCat` · `vdFacCat` · `vdFevdCat` · `vdTapCat` | literales y expresiones dentro de `calcVD` | `calcVD`, la tarjeta de función |
| `vdTeiCat(x)` | `vdTeiEstado` | `vdTeiEstado`, la tarjeta de función |

⚠️ **DOS CORTES VIVÍAN COMO LITERAL DENTRO DE `calcVD`** y ahora tienen constante:
`UMBRAL_SPRIME_NORMAL` (9,5 cm/s) y `UMBRAL_TAP_HTP` (105 ms). **El valor no se movió.**

---

## 3 · Las dieciséis fichas nuevas

Mismo formato y mismas reglas que las doce del L; ids nuevos y **ninguno reusa uno de aquella**.

| id | dato | dueño | ubicación · folio · hoja | estado |
|---|---|---|---|---|
| `DIM-AD-001` | Área de la AD | `adAreaCat` / `UMBRAL_AD_AREA_NORMAL` | ASE 2025, Tabla 1 · 145 · 5 | parcial |
| `VCI-001` | Diámetro de la VCI | `pmadEstimar` / `VCI_DIAM_DILATADA_MIN` | ASE 2025, Presión auricular derecha · 160 · 20 | parcial |
| `VCI-002` | PmAD estimada | `pmadEstimar` | ASE 2025 · 160 · 20 | **verificado** |
| `DIM-VD-001` | Diámetro basal | `vdBasCat` | Lang 2015, Tabla 8 · 20 · 20 | parcial |
| `DIM-VD-002` | Diámetro medio | `vdMidCat` | Lang 2015, Tabla 8 · 20 · 20 | **verificado** |
| `DIM-VD-003` | Diámetro longitudinal | `vdLongCat` | — | por verificar |
| `DIM-VD-004` | Pared libre | `vdParedCat` / `VD_PARED_GRADOS` | ASE 2025, Tabla 1 · 145 · 5 | **verificado** |
| `FUN-VD-001` | TAPSE | `vdTapseCat` | Lang 2015, §8.2 · 19 · 19 | **verificado** |
| `FUN-VD-002` | Onda S′ | `vdSprimeCat` | Lang 2015, §8.4 · 20 · 20 | **verificado** |
| `FUN-VD-003` | FAC | `vdFacCat` | Lang 2015, §8.3 · 19 · 19 | parcial |
| `FUN-VD-004` | FEVD por 3D | `vdFevdCat` | ASE 2025, Tabla 1 · 145 · 5 | **verificado** |
| `FUN-VD-005` | Índice de Tei por DTI | `vdTeiCat` | ASE 2025, Tabla 1 · 145 · 5 | **verificado** |
| `FUN-VD-006` | Tiempo de aceleración pulmonar | `vdTapCat` | ASE 2025, Tabla 1 · 145 · 5 | **verificado** |
| `AOR-001` | Cortes de dilatación por segmento | `aoSegGrado` / `AO_SEGS` | — (criterio propio) | por verificar |
| `AOR-002` | Nomogramas de los senos de Valsalva | `AOR_NOMO` / `aorNomoBanda` | Lang 2015, Figura 13 · 32 · 32 | **verificado** |
| `AOR-003` | Dimensiones normales por sexo | — | Lang 2015, Tabla 14 · 32 · 32 | **verificado** |

**Diez verificado · cuatro parcial · dos por verificar.** La línea de fuente la publican **sólo**
las verificadas; lo que quedó corto está en `docs/fuentes/FUENTES.md` y las diferencias contra la
guía en `docs/PENDIENTES.md`.

⚠️ **LA REGLA DE FOLIO DE LA ASE 2025 ES «HOJA + 140», comprobada en el pie impreso** de tres
páginas (hoja 5 → 145, hoja 20 → 160, hoja 24 → 164). En Lang 2015 el folio coincide con la hoja
**en el cuerpo** y no en el apéndice, que es lo que el mapa del L ya documenta.

---

## 4 · Las CUATRO tarjetas

| clave | qué muestra | ancho | alto medido |
|---|---|---|---|
| `ad-card` | una barra (área de la AD) y la tabla de la vena cava con la fila del paciente | 348 px | 308 px |
| `vd-tam-card` | basal, medio, longitudinal y pared | 356 px | 391 px |
| `vd-fun-card` | TAPSE, onda S′, FAC, FEVD, Tei y TAP | 356 px | 594 px |
| `ao-card` | el nomograma de los senos de Valsalva por edad y superficie corporal | 356 px | 326 px |

⚠️ **EL VENTRÍCULO DERECHO VA EN DOS GLOBOS Y ES UNA MEDICIÓN.** Con las diez barras juntas la
tarjeta mide **594 + 391 ≈ 985 px** y a 1200 × 700 el hueco útil debajo del globo es de **440**.
Partida, la de tamaño entra entera en los seis anchos medidos; la de función **sigue
desplazándose por dentro a 1200 × 700** (594 contra 440) y, por 4 px, a 1440 × 800. Desde
1920 × 1080 hacia abajo —768, 390 y 360 px incluidos— no se desplaza. Es la división que la orden
prescribe; lo que queda está en `PENDIENTES.md` → **M-8**.

### Lo que NO lleva barra, y por qué

* la **relación VD/VI** tiene corte (`> 1,0`) pero lo que publica es un **signo de la categoría A
  de la probabilidad de hipertensión pulmonar**, no un tamaño del ventrículo;
* el **diámetro de la arteria pulmonar** no tiene corte en la app —sólo una banda de
  plausibilidad, que es el rango de lo medible y no un criterio—, aunque la Tabla 1 de la ASE
  2025 sí lo da (`< 2,5 cm`);
* el **diámetro y el VTI del tracto de salida** y el **volumen sistólico pulmonar** no producen
  categoría.

Las cuatro están declaradas en `PENDIENTES.md`.

### Los tres diámetros comparten UNA línea de categoría

`vd-tam` resume los tres en una sola frase —«Dilatado — basal 48 mm (>41) · medio 40 mm (>35) ·
longitudinal 95 mm (>86)»— y esa es la que la tarjeta copia. Darle a cada barra una frase propia
sería **redactar** una categoría que la app no escribe. La pared sí tiene la suya
(`vd-pared-interp`), y las seis de función también.

### La tabla de la vena cava

Cuatro filas, que son las cuatro combinaciones que `pmadEstimar` distingue. **Ni un número
escrito a mano**: la presión de cada fila sale de llamar al dueño con un diámetro y un colapso de
ejemplo, el corte del diámetro de `VCI_DIAM_DILATADA_MIN`, y los **dos rótulos del colapso se
leen de las `<option>` del propio `<select>`** del formulario. La fila del paciente lleva fondo
**y una flecha**: el color nunca es lo único que informa.

---

## 5 · El nomograma de la aorta

Tres gráficos, de la **Figura 13 de la ASE/EACVI 2015, folio 32, hoja 32**, leídos **de la
imagen** renderizada a 500 ppp porque el texto extraído no los trae.

| | A | B | C |
|---|---|---|---|
| rótulo original | «Children and adolescents» | «Adults 20-39 years» | «Adults >40 years» |
| ecuación | y = 1,02 + 0,98x | y = 0,97 + 1,12x | y = 1,92 + 0,74x |
| error estándar | 0,18 | 0,24 | 0,37 |
| r | 0,93 | 0,71 | 0,40 |
| rango de superficie corporal dibujado | 0,25 a 2,00 m² | 1,30 a 2,50 m² | 1,30 a 2,40 m² |

`y` es el diámetro esperado **en centímetros** y `x` la superficie corporal en m². Las unidades
no figuran al lado de la ecuación: salen de los rótulos de los ejes de la misma figura.

⚠️ **LA BANDA ES ECUACIÓN ± 1,96 × SEE Y ESO NO LO DICE LA GUÍA**: su pie dice «95% confidence
intervals» y nada más. Se **comprobó midiendo la imagen**: calibrando los dos ejes con sus marcas
impresas y leyendo el borde dibujado columna por columna, a superficie corporal 2,0 y 2,2 m² los
bordes leídos caen a **0,003 a 0,063 cm** de ese cálculo en los paneles B y C. Las columnas donde
un rótulo tapa la línea se descartaron —y a 1,8 m² el rótulo «SEE = …» corta la lectura del borde
superior, que es el artefacto que hay que saber antes de creerle a esa fila—.

⚠️ **EL RANGO DE SUPERFICIE CORPORAL SE MIDIÓ EN LA IMAGEN** (A de 0,20 a 2,02 · B de 1,29 a 2,53
· C de 1,32 a 2,40) y se guarda **redondeado hacia adentro**, que es el lado conservador: un
paciente justo en el borde queda sin punto en vez de con un punto sobre una banda extrapolada.

⚠️ **LOS 40 AÑOS EXACTOS VAN AL GRÁFICO B, Y ES DECISIÓN DE MAICOL**, porque la guía se
contradice consigo misma: su texto del folio 32 escribe los tres estratos como «<20, 20 to 40,
and >40 years» y el pie de la Figura 13 dice «adults aged ≥40 years (C)».

⚠️ **NO SE COPIA LA IMAGEN.** Su pie dice «Reprinted with permission from Roman et al.», así que
tiene derechos del editor y de los autores originales. Lo que se usa son las **ecuaciones y los
errores estándar**, que son datos numéricos, citando a Lang 2015 y a Roman 1989. El dibujo de la
app es propio: otros ejes, otra unidad en Y y el punto del paciente adentro.

### El eje Y va en milímetros

La guía publica centímetros. El campo de la app (`ao_sin`) y el corte de EcoSmart están en
milímetros, así que dibujar en centímetros obligaría al médico a convertir el único número que le
importa. La ecuación se multiplica por diez y **el rótulo del gráfico lo dice**.

### La línea de 40 mm

**Sale del dueño, sondeado**: es el techo de la banda `normal` que `aoSegGrado` devuelve para el
seno de Valsalva, así que el día que ese corte se mueva la línea se mueve con él. **No se le
atribuye a ninguna guía**: `AOR-001` es criterio propio de EcoSmart, está «por verificar» y no
publica fuente — la única línea de fuente que la tarjeta muestra es la del **nomograma**.

⚠️ **EL OPERADOR QUE LA APP APLICA ES `>` Y NO `>=`**: con 40,0 mm exactos el grado es
**normal**. Maicol decidió que 40 exactos cuenten como dilatado; **no se cambió** y está en
`PENDIENTES.md` → **M-7**.

### Las tres líneas de texto

1. «Corte de EcoSmart: 40 mm.» + la categoría que la cápsula `ao-interp` ya publica.
2. «Según el gráfico para su edad y superficie corporal: dentro de / por encima de / por debajo
   del rango esperado (N a M mm).»
3. «Es una orientación: el criterio final es individual (edad, sexo, superficie corporal).»

Las dos lecturas **son independientes y pueden discrepar**, y eso es información: el corte único
no mira ni la edad ni el tamaño del paciente y el nomograma sí. Por eso existe la tercera línea.

---

## 6 · Las tres entradas de Referencias

`ref-ad`, `ref-vd2` y `ref-ao2`, con el formato de las dos del L: tabla de cortes con las **dos
columnas de sexo siempre**, las mismas gráficas **sin el punto del paciente** y la bibliografía
**por sección numerada desde [1]**, sólo con fichas «verificado». Una fila cuya ficha no lo está
sale **sin corchete**.

⚠️ **LOS TRES IDS LLEVAN SUFIJO O NOMBRE PROPIO PORQUE DOS YA EXISTÍAN**: `ref-vd` es una tabla
estática de cinco filas (ASE 2015) y `ref-ao` es la de aterosclerosis y umbrales quirúrgicos de
la ESC 2024. Reusar sus ids habría fundido dos entradas con fuentes distintas en una. `ref-ad` no
existía.

⚠️ **LA ENTRADA VIEJA `ref-vd` DICE «S′ ≥10 cm/s» Y LA APP APLICA 9,5.** Es preexistente, no se
tocó, y está en `PENDIENTES.md` → **M-6**.

---

## 7 · Trampas medidas en esta tanda

1. **El rótulo del último valor del eje X se dibujaba FUERA del viewBox** —«2,40 m²» cortado a la
   mitad— y el SVG no lo recorta de una forma que se note: simplemente lo dibuja afuera. **Lo vio
   la captura, no la medición.** Se acota el centro igual que en `_evBarra`.
2. **La unidad del eje Y, flotando arriba a la izquierda, se encimaba con la marca de arriba.**
   Pasó al rótulo del gráfico.
3. **El rótulo del corte de EcoSmart se encimaba con el punto del paciente**, que en una aorta
   dilatada cae justo ahí. Pasó a la izquierda del trazo.
4. **El número publicado como corte salía corrido un paso de sondeo en tres barras** —«4,9 mm»,
   «46 %» y «0,54»—. Ver §1.
5. **El botón de la tarjeta no tiene geometría si su pestaña no está activa.** Las cuatro viven en
   dos pestañas distintas (`tab-ai-vi` y `tab-vd`): una sonda que abra sólo los acordeones mide
   0 × 0 y la tarjeta se niega a anclarse —que es lo correcto—. Se abre por un **campo ancla** de
   la misma sección, que es lo que `abrirPara` sabe hacer.
6. **`AO_SEGS` es un `const` de módulo y no una propiedad de `window`**: `window.AO_SEGS` da
   `undefined` y el caso informa «SIN SEGS» sobre un árbol perfecto. El segmento se saca del
   sondeo que `evCortes` publica, que además es el mismo que dibuja la tarjeta. Es la trampa que
   este repo ya tiene escrita para `ECO_AYUDA` y `_labImpDatos`.
7. **Una lista de palabras de reserva con términos CORTOS da falsos**: «todo» matchea dentro de
   «método» y puso en rojo a `FUN-VD-005` sobre una ficha perfecta. La lista lleva sólo sintagmas
   que no pueden aparecer dentro de otra palabra.
8. **Un centinela sobre la VERDAD no alcanza: tiene que ser sobre el TIPO.** Contra HEAD el
   ayudante devuelve la cadena `'SIN FN'`, que es *truthy*, y `r.lo.toFixed(3)` mató la corrida
   entera de TC-492 — que prueba que el árbol es distinto, no que el caso sabe medir.
9. **`\s` dentro de un template literal se cocina a la letra `s`**, otra vez: la sonda informó
   «ba al 48 mm» y «Di función» sobre textos perfectos. Y **`[ \n\t]` tampoco sirve**: el salto
   de línea se cocina a un salto REAL dentro del literal de regex, que no puede cruzar líneas y
   deja la sonda sin definir `window.__P`.

---

# La tanda «VS» (2026-10-17) — EL CORAZÓN DERECHO A LA TABLA 1 DE LA ASE 2025

⚠️ **El VD, la AD, la VCI y la raíz aórtica se alinearon a la Tabla 1 de la ASE 2025 de corazón
derecho, y todo eso vive en `docs/mapa/corazon-derecho-ase2025.md`.** Ahí están el dueño único
(`ASE25_T1` + `ase25Grado` + `ase25Rango` + `ase25Corte`), las doce filas con su antes y su
ahora, las tres cosas que la tabla NO dice como uno espera —no distingue sexo, el solape
tipográfico del TAPSE y de la onda S′, y el hueco del volumen de la AD—, las superficies una por
una, el 21 mm exacto de la vena cava, el «40 mm o más» del seno de Valsalva, las cuatro tarjetas
con sus cuatro zonas y las ocho trampas.

**Lo que hay que saber antes de tocar esta zona:** los cortes y los operadores ya NO viven acá.
Mover uno es editar `ASE25_T1`, y el assert de arranque exige que las cuatro bandas sigan en
orden y sin hueco.
