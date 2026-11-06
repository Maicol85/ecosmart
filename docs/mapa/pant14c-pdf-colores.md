# El PDF del corazón maestro, el diagrama del posoperatorio y los colores del 3D — «PANT-14c»

Mapa de la tanda **PANT-14c** (2026-11-05/06). Por nombre de función y de constante, no por línea.

---

## 1 · El PDF del corazón maestro: imagen, esquema y texto (commit 1)

### 1.1 · Las tres causas, medidas

El médico reportó tres cosas y las tres se reprodujeron con el **gesto real** —el botón del
encabezado y su tarjeta de severidades— en `scripts/_probe_pant14c_pdf.mjs`, ocho escenas:

| lo que reportó | la causa, medida |
|---|---|
| «imprime el corazón **angosto**» | la parte del 3D no pasaba `ar`, así que `_pdfTile` caía en `p.ar \|\| 1` y estampaba **cuadrado** un lienzo de 1230 × 420 (relación 0,341): el corazón se comprimía 2,9 veces a lo ancho. Es la deuda que PANT-14 declaró para el 3D de la transposición. |
| «y **chico**» | se capturaba el **lienzo entero**. El recuadro ocupa el ancho del cuerpo —1230 px a 1440 de ventana, 922 con el esquema abierto— y el alto es `CM3D_ALTO`: la caja de contenido del corazón medía **207 × 352 px**, el 16,8 % del ancho, con el 8,5-8,8 % de píxeles no blancos. |
| «con ◫ abierto el PDF **no incluyó el esquema**» | reproducido **en el orden que el médico usó**: tocar «Incluir en el PDF» PRIMERO y abrir ◫ DESPUÉS. El único lugar que rasterizaba era `cmIncluirPDF`, y con el esquema cerrado su llamada no hacía nada —la compuerta pide `_cm3d.sch`—; después nadie volvía a rasterizar, porque `cmSchSet` sólo dibujaba el SVG. Medido: `cmEsqPdfOn()` en `true` y `cmEsqPdfData()` en `data:null`. |

### 1.2 · Quién hace qué

| pieza | qué hace |
|---|---|
| `CM_PDF_AR` = 1.25 | la relación alto/ancho del estampado. **Una constante** y no un dato del slot: la lista de claves de `CeiboImg.guardar` es cerrada, así que un `ar` guardado no sobreviviría a reabrir el estudio y el dibujo volvería a salir cuadrado. |
| `CM_PDF_MARGEN` = 0.04 | el margen proporcional del recorte. |
| `_cm3dCaptura` | recorta al contenido —barrido de píxeles no blancos— y **abre** la caja simétricamente hasta `CM_PDF_AR`. La caja sólo se agranda: nada se corta por construcción. Con el lienzo todo blanco devuelve el lienzo entero, como hasta hoy. |
| el recolector de `_dg.cm3d` | pasa `ar: CM_PDF_AR` y `cmPapelTexto()`. |
| `cmSchSet` | rasteriza al abrir, **al final** y después de escribir `_cm3d.sch`, que es lo que la compuerta lee. |

### 1.3 · El texto del papel, cuatro partes y un solo dueño

`cmPapelTexto()` lee el estado **del estudio** —el mismo guardar-y-reponer que `_cmCapturaDelEstudio`
y `cmLineaPDF`— y arma cuatro líneas, todas con textos que la app ya tiene:

| parte | dueño |
|---|---|
| el título, en siglas | `cmTitulo(S)` — `CM_SIB`, `CM_SHORT` y `CM_SIG` |
| las lesiones con su nombre completo | `cmPapelLesiones(S)` — `CM_SIG[k][1]` y la variante de `CM_MODS` |
| la circulación de esa escena | `cmEscena(S).circ` |
| la leyenda de lo dibujado | `cmLeyendaPresente(escena)` |

**Nada más entra**: ni los textos «Qué mirar» del ⓘ, ni una guía, ni una clase, ni una conducta,
ni una frase de dato faltante. El pie «esquema ilustrativo» lo agrega el recolector.

`cmLineaPDF` **se conserva** y es la línea corta que un caso de la suite afirma; el dueño del
texto del papel es `cmPapelTexto`.

### 1.4 · Medido, HEAD → ahora

| | HEAD | ahora |
|---|---|---|
| imagen del 3D | 1230 × 420 px (ar 0,341) | **304 × 380** (ar 1,25) |
| píxeles no blancos | 8,5-8,8 % | **38,5-41,5 %** |
| ancho usado por el corazón | 16,8 % | **68,1-75,2 %** |
| estampado | 70,8 × 70,8 mm (arMm **1,0**) | 46,1 × 57,6 mm (arMm **1,249**) |
| **el corazón, ancho real** | **11,9 mm** | **31,4 mm** |
| esquema con ◫ abierto ANTES del botón | 2 imágenes | 2 imágenes |
| esquema con ◫ abierto DESPUÉS del botón | **1 imagen** | **2 imágenes** |
| etiqueta del bloque | 1 | 1 (nunca dos) |
| imágenes duplicadas | 0 | 0 |

Ejemplos del texto: `TGA d-TGA` / `transposición de grandes arterias (d-TGA sin cirugía)` /
la circulación / `sangre poco oxigenada · sangre oxigenada`; y `CIA O.S.` /
`comunicación interauricular (ostium secundum)` / …

---

## 2 · El esquema del posoperatorio que salía solo (commit 2)

### 2.1 · La tabla casilla × datos × «Nuevo estudio»

Medida con el botón real `#pop-esq-pdf-btn`, `nuevoEstudio()` y «Continuar sin guardar», con el
PDF generado de verdad (`scripts/_probe_pant14c_pop.mjs`):

| escena | HEAD campo / on / data / imágenes | ahora |
|---|---|---|
| apagada, sin datos | `''` / false / false / **0** | `''` / false / false / **0** |
| apagada, con datos | `''` / false / false / **0** | `''` / false / false / **0** |
| **encendida, SIN datos** | `'1'` / true / true / **1** | `'1'` / true / false / **0** ← la única diferencia autorizada |
| **encendida, con datos** | `'1'` / true / true / **1** | `'1'` / true / true / **1** ← el control |
| encendida + «Nuevo estudio» | `'1'` / true / true / **1** | `''` / false / false / **0** |
| encendida sin datos + «Nuevo estudio» | `'1'` / true / true / **1** | `''` / false / false / **0** |

### 2.2 · Qué lo encendía

**Nada lo recordaba fuera del estudio**: cero apariciones de `pop_esq_pdf` junto a
`localStorage`, censado. Lo que pasaba es que `pop_esq_pdf` es un `input[type=hidden]` y el
barrido de `limpiarCampos` toma `text` y `number` —igual que `vci_no_vis` y `pac_id_print`—, y
sus **tres hermanos del mismo patrón** sí estaban en la lista: `contr_be_pdf`, `ete_qx_pdf` y
`vab_pdf`.

### 2.3 · Quién hace qué

| pieza | qué hace |
|---|---|
| `limpiarCampos` | apaga `pop_esq_pdf` y repinta su botón, junto a los otros tres. Corre en «Nuevo estudio», **no** al restaurar: un estudio guardado con la casilla encendida y con datos sigue incluyéndolo. |
| `popHayDatos()` | «¿hay algún dato del posoperatorio?», comparando contra el valor por omisión del **propio marcado** —`defaultValue`, `defaultChecked`, `defaultSelected`—, que es la misma pregunta de `_formTieneDatos`. Excluye `pop_esq_pdf`, que es el interruptor y no un dato. **Falla ABIERTO.** |
| `popEsqPdfData()` | la compuerta: `popEsqPdfOn() && popHayDatos()`. Va en el **publicador** para que todos sus consumidores vean la misma respuesta. |
| `popEsqPdfOn()` | sigue siendo «la casilla está marcada», que es lo que el botón refleja. |

**No se tocó** el contenido del esquema ni su cálculo.

### 2.4 · El arnés de A/B heredaba la fuga

Con `limpiarCampos` sin apagar ese campo, la **primera** escena que lo encendía lo dejaba
encendido para las **63** siguientes, así que las dos corridas no arrancaban del mismo estado.
`MONTAR` de `scripts/_probe_pant14c_ab.mjs` lo normaliza a vacío en cada una, y ese comentario
**no puede contener la palabra que el runner usa de marcador** —`replace(<marcador>, JSON)` cambia
la primera aparición—: es la trampa que TGA-4 documenta, pagada otra vez.

---

## 3 · Los colores, el anillo, las suturas, los parches y la leyenda (commit 3)

### 3.1 · Las cuatro constantes nuevas, con su medición

Cada color vive en **una** constante con nombre: una línea para cambiarlo. Los números los midió
`scripts/_probe_pant14c_color.mjs` en el navegador, no una cuenta a mano.

| constante | valor | luminancia relativa | matiz |
|---|---|---|---|
| `TGA3D_C.violet` (oscuro) | `0x7e22ce` | 0,1004 | 272,1° |
| `TGA3D_C.violetClaro` | `0xc084fc` | 0,3474 | 270,0° |
| `CM_C.celeste` | `0x38bdf8` | 0,4401 | 198,4° |
| `CM_C.green` | `0x2f9e44` | 0,2548 | 131,4° |

Los pares que la orden pide, medidos (fondo del lienzo `rgb(24, 28, 39)` en el tema oscuro):

| par | medido | lo que la orden pide |
|---|---|---|
| violeta oscuro / violeta claro, **luminancia** | **2,64 : 1** | 1,6 : 1 como mínimo ✔ |
| violeta oscuro / fondo, luminancia | **2,44 : 1** | 1,5 : 1 ✔ |
| violeta claro / fondo, luminancia | **6,44 : 1** | 1,5 : 1 ✔ |
| violeta oscuro / azul, **matiz** | **55,9°** | el violeta anterior quedaba a 42,1° — `P14b-h` |
| violeta claro / azul, matiz | **53,9°** | ídem |
| celeste / azul, luminancia | **2,28 : 1** | lo que lo separa de la sangre es la **claridad**, no el tono (17,7°) |
| celeste / violeta oscuro y claro, matiz | **73,7°** y **71,6°** | ✔ |
| verde / azul, rojo y naranja, matiz | **84,8°**, **128,3°** y **97,9°** | ✔ |

`TGA_ESQ_VIOLETA`, `TGA_ESQ_VIOLETA_CLARO`, `CM_SCH_VERDE` y `CM_SCH_CELESTE` salen de **esos
mismos números**: el esquema plano y el 3D no pueden discrepar.

### 3.2 · Dónde va cada tono

| dónde | oscuro | claro |
|---|---|---|
| switch auricular (Mustard o Senning), 3D | el camino de las **cavas** (hacia la mitral) | el de las **venas pulmonares** (hacia la tricúspide) |
| switch auricular, esquema | el tramo 1 de `tun` | el tramo 4 — `tun:[[1,'o'],[4,'c']]` |
| Rastelli, 3D | el **túnel** intracardíaco (VI → aorta por la CIV) | el **conducto** (VD → arteria pulmonar) |
| Rastelli, esquema | el tramo horizontal de `ex` | el tramo vertical |

Las **partículas conservan** su azul y su rojo: viven en `s.fl` y no se tocan. La pared dice que
es una estructura propia; la corriente dice qué sangre lleva. Los dos rótulos del Rastelli salen
de las palabras que `TGA3D_INFO.ras` ya usa.

### 3.2-bis · Cómo se midió el violeta, y por qué el valor exacto no sirve

Los dos túneles se dibujan **semitransparentes** —opacidad 0,5 y 0,65—, así que el píxel que sale
del lienzo es el violeta **mezclado** con lo que tiene detrás: comparar contra el valor exacto de
la constante da **cero** aunque el color esté aplicado. Medido: con tolerancia estricta el túnel
oscuro del switch auricular daba **1 píxel**. Es un denominador vacío.

Lo que sí sobrevive a la mezcla sobre un fondo neutro es el **tono**. Contando los píxeles cuyo
tono cae entre 250° y 300°, con el dibujo quieto (frecuencia en cero):

| escena | HEAD | ahora |
|---|---|---|
| switch auricular | 500 px | **1368** |
| Rastelli | 361 px | **3725** |
| Jatene (sin túnel) | 330 | 320 |
| cava izquierda (sin túnel) | 320 | 295 |
| Fallot operado con CIV residual (sin túnel) | 511 | 406 |
| obstrucción subaórtica (sin túnel) | 360 | 354 |
| **corazón normal — el control** | **332** | **332** |

En las dos escenas **con** túnel el recuento salta; en las seis **sin** túnel se queda en la base
de ~300-500 px que dan los brillos de los vasos. El corazón normal da **el mismo número exacto**
en los dos árboles.

⚠️ **Y el reparto en dos grupos por claridad no es lo que los separa, y se declara**: esa base de
brillos ya se parte en dos, así que el indicador «hay dos grupos» da verdadero también en las
escenas sin túnel. Lo que discrimina es el **recuento contra el control**, y la diferencia de
luminancia entre los dos violetas la da la medición de las constantes (2,64 : 1).

### 3.3 · Los rótulos que no se solapan

Regla **general** y no un reacomodo de dos: `CM_LBL_TOL` (3 px) y una pasada en el bucle de
cuadro que recorre los rótulos y baja el que choca, midiendo la caja del **propio elemento**
(`offsetWidth`/`offsetHeight`) y sin salir del recuadro.

| | HEAD | ahora |
|---|---|---|
| solapes en las 30 escenas con rótulos | **4** (`Túnel cavas × Túnel venas pulm. = 62 × 10 px`) | **0** |
| rótulos fuera del recuadro | 0 | **0** |

### 3.4 · El anillo de la obstrucción subaórtica

Antes quedaba en el plano XY —el que la cámara mira de frente—, así que se veía como un aro de
frente y no como un rodete. Ahora:

* el **origen** de la aorta es el primer punto de su curva en la propia escena;
* la **tangente** en el origen es la dirección de ese primer punto al segundo;
* el anillo se ubica `CM_OBS_BAJO` (0,30) por debajo del origen **siguiendo** esa tangente;
* y se **orienta** con su normal en esa tangente (`nrm`), que es lo que lo deja acostado y
  transversal al vaso;
* el **radio** sale del radio de la aorta en su origen con un 10 % más.

`nrm` lo convierte el motor en una rotación del toro, y lo lleva **sólo quien lo pide**: `rx`,
`ry` y los otros doce anillos del módulo no se mueven. El gris, el rótulo, la barra del esquema y
`pri` (la prioridad de render) no se tocan.

### 3.5 · Las suturas en malla y las coronarias

| | antes | ahora |
|---|---|---|
| 3D | dos `ring` naranjas — **el mismo toro que la obstrucción** | dos `malla`: cilindro corto abierto, perpendicular al vaso por `nrm` = `_t3tang(trazado, centro)`, semitransparente, con textura de líneas cruzadas generada por código (`_cmMallaTex`), **sin rótulo** |
| esquema | dos barras sólidas naranjas | dos **rectángulos con trama**, por el `<pattern>` `TGA_ESQ_MALLA_ID` que `tgaEsqCuerpo` declara en sus `<defs>` |
| coronarias, 3D | dos tubos finos naranjas | **sin cambio** (es lo que la orden pide) |
| coronarias, esquema | un punto naranja | el punto **más su trazo corto** |

**No se reusa el toro para ninguna sutura**, que es lo que la orden pide expresamente.

### 3.6 · Los parches en verde y la CIV residual que los atraviesa

`CM_FAL_PARCHE` y `CM_FAL_PARCHE_R` son el centro y el radio del parche, en **un** solo lugar: los
leen el disco que lo dibuja y la CIV residual, que se ubica en su **borde** —el disco tiene su eje
en X, así que su borde es un círculo en el plano YZ— con su corriente a lo largo de X, o sea
**cruzando** el plano del parche. Antes el anillo estaba 0,4 por debajo, como una lesión aparte.

El **Rastelli no lleva parche verde**: su CIV está cerrada por el túnel. **No se agregan parches
de CIA**: no hay dato que los consigne.

### 3.6-bis · Un defecto propio que la medición del inventario destapó

`cmColoresEscena` leía `e.c` como el color de **todo** objeto, y `e.c` es un color **sólo en un
`tube`**: en un `ring`, un `disc`, un `cone`, un `sph`, una `zone` y una `leaf` es el **centro**,
un array de tres números, y el color va en `e.col`. Escrito así, la entrada «comunicación» de la
leyenda **no se prendía** con la CIV residual del Fallot operado —su anillo no trae `col` y su
`e.c` es la posición, así que el barrido guardaba el array como si fuera un color y el naranja por
omisión nunca entraba—. Lo destapó el **inventario medido**, no la lectura.

### 3.7 · La leyenda, por entradas

`CM_LEY` es la lista única —once entradas con su `id`— y `cmLeyendaSync()` prende la que está
dibujada en las **dos** leyendas. Las entradas están **todas en el marcado**: ningún nodo se crea
ni se borra, así que los ids no cambian. `cmTunelLeySync` **se conserva** y delega acá, porque la
llaman dos embudos y los casos de la suite.

`«CIV, parches y suturas»` se parte en **comunicación** (naranja), **parche** (verde), **sutura**
(naranja con trama) y **coronarias reimplantadas** (punto naranja). Las dos naranjas se
distinguen por la **forma** y no por el color: la sutura se pregunta por su **tipo** de objeto
(`malla`) y las coronarias por el **radio** del tubo, porque el color lo comparten con la
comunicación.

**Medido, entrada por entrada y escena por escena:**

| escena | entradas prendidas |
|---|---|
| switch auricular | `san`, `sano`, **`tun`**, **`tunc`** |
| Rastelli | `san`, `sano`, `com`, `obs`, **`tun`**, **`tunc`** |
| Jatene | `san`, `sano`, `com`, **`sut`**, **`cor`** |
| obstrucción subaórtica | `san`, `sano`, **`obs`** |
| Fallot operado con CIV residual | `san`, `sano`, `com`, **`par`** |
| cava izquierda persistente | `san`, `sano`, **`vcsi`** |
| **corazón normal — el control** | `san`, `sano` **y nada más** |

---

## 4 · El título del dibujo y los textos chicos (commit 4)

### 4.1 · El título

| pieza | qué hace |
|---|---|
| `cmTitulo(S)` | el dueño único, **nacido en el commit 1** porque el texto del papel lo necesitaba. Puro: recibe el estado y no lo toca. |
| `cmTituloSync()` | lo escribe en `#cm3d-tit` —superpuesto en la esquina superior izquierda del recuadro— y en `#cm3d-schtit`, la cabecera del esquema. Se cuelga de `cm3dBuild`, el único dueño del repintado. |
| `.cm3d-tit` | `position:absolute` en `.cm3d-cvw`, **fuera** del lienzo: no rota con el modelo y no entra en la captura como parte del dibujo. `pointer-events:none`, porque el recuadro se rota arrastrando por cualquier punto. Tipografía de título de tarjeta (11 px / 700) y recorte con puntos suspensivos. |

La base va **siempre salvo** cuando es el corazón normal **y** hay lesiones: ahí lo que el dibujo
muestra son las lesiones. Con eso los tres ejemplos que el médico escribió salen tal cual:
`Mus/Sen · CIA O.S.`, `Fallot Operado · IP` y `Normal`.

### 4.2 · Los textos chicos

La tabla completa —qué se quitó, qué se mantuvo y por qué— está en `docs/PENDIENTES.md` → **P14c-a**,
con el único texto que **no se tocó** porque no cae claramente en ninguna de las dos listas.

Las dos aclaraciones que bajaron del texto chico —«esquemático, no a escala» y «se rota
arrastrando»— están en el ⓘ del recuadro, palabra por palabra. El aviso de conexión **no se
pierde**: el que queda es el **dinámico** de `cm3dBoot`, que es «cuando falta la librería» y no
siempre.

---

## 5 · La pestaña de transposición (commit 5)

| pieza | qué hace |
|---|---|
| `#tga-grupos` | la grilla de grupos, con sus propias media queries: **una** columna por debajo de 768 px, **dos** desde 768 y **tres** desde 1000. Reusa `.cc9-col` y `.cc9-h` de la CVPA, que es el patrón que la orden nombra. |
| `tgaGruposSync()` | esconde el grupo cuyos campos están **todos** escondidos, para que no quede un hueco. Lo llama `tgaSync`, que es el dueño de mostrar y esconder cada campo: con dos dueños, un grupo podría quedar vacío y ocupando espacio. |

**Ningún id, ningún rótulo, ninguna opción y ningún valor se movieron.** El orden del marcado es el
orden visual, así que la tabulación lo sigue sin un solo `tabindex`.

El botón «Ver en 3D» propio de la sección **se quitó**: queda el común, debajo de las secciones de
congénitas. **`tgaVer3D` NO se borró** — la llama la suite y es el camino con nombre al módulo.

### 5.1 · El alto medido, en las ocho combinaciones de Tipo × Cirugía

| ancho | antes (según la combinación) | ahora | columnas |
|---|---|---|---|
| 1440 px | 434 a **524** | **482 en las ocho** | **3** |
| 1000 px | 432 a **543** | 464 a 479 | **3** |
| 768 px | 475 a **547** | 464 a 521 | **2** |
| 390 px | 526 a 652 | **709 a 815** | **1** |

**A 1440 px el alto deja de depender de la combinación**, que es el hueco que el médico reportó: con
d-TGA bajaba de 509 a 482 y con el switch auricular de 524 a 482. Por debajo de 768 px **sube** 180
a 190 px, porque la grilla es de una columna y se suman los cuatro encabezados → **P14c-e**.

En los ocho cruces: el botón propio pasa de existir a **no existir**, **4** grupos y **11** campos,
columnas **3 / 3 / 2 / 1**, **cero** grupos vacíos ocupando espacio, la conclusión **debajo y a
todo el ancho** —1194 px a 1440, el mismo ancho que la grilla—, **cero** desplazamiento horizontal,
**cero** textos recortados y **cero errores de página**.

### 5.2 · Lo que la medición pidió, y no estaba en la orden

⚠️ **`#tga-fila` dejó de ser flex.** Su flex de 900 px existía para poner los campos al lado del
recuadro del 3D, que ya no se dibuja ahí desde PANT-14b; con flex y el recuadro oculto, la caja de
conclusión quedaba como **segunda columna** en vez de debajo. Con él se van `#tga-campos` y la clase
`tga-sint-ancho` → **P14c-d**.

⚠️ **El `tga_bav` cambió de lugar en el marcado** —del 6 al 10—, y es el único de los once: los dos
campos clínicos estaban separados por el bloque de la obstrucción, así que agrupar por tema los
junta. El papel no se movió, porque el emisor lee por id → **P14c-f**.

---

## 6 · Las secciones de congénitas, siempre cerradas (commit 6)

| pieza | qué hace |
|---|---|
| `ccSeccionesCerrar()` | cierra **todas** las secciones de las dos pestañas de congénitas, con el mismo cierre que `secToggle` usa —la clase, el `aria-expanded` y el `max-height`—. |
| `showTab` | la llama **después** de `secAutoOpen`, y sólo para las dos pestañas de congénitas. |

**El estado abierto vive en el DOM** —la clase `.open`— y en ningún otro lado: cero apariciones en
`localStorage` y ningún campo del estudio, censado. Lo que el médico veía tiene dos causas: la
clase sobrevive al cambio de pestaña, y `secAutoOpen` reabre las que tienen datos.

⚠️ **`secAutoOpen` contradice la regla y se declara**: está en `docs/PENDIENTES.md` → **P14c-b**,
con el censo de lo que la suite afirma de él.

### 6.1 · Lo medido, con el recorrido real

| | antes | ahora |
|---|---|---|
| secciones abiertas al **volver** a la pestaña | **2** | **0** |
| lo abierto **sin** cambiar de pestaña | 1 | 1 |
| abiertas en la **otra** sub-pestaña | 0 | 0 |
| el cerrador existe | no | sí |
| **CONTROL**: `secAutoOpen` abriendo en otra pestaña | **1** | **1** |

El control es lo que prueba que `secAutoOpen` sigue vivo. **Cero errores de página en los dos
árboles.**

⚠️ **`showTab` está ENVUELTA DOS VECES** —el repintado de los botones flotantes y el cajón
lateral—, así que `String(showTab)` devuelve el envoltorio y **no contiene** ni `secAutoOpen` ni
`ccSeccionesCerrar`. Las dos condiciones que iban a medir el orden por su texto daban falso sobre
código correcto; se reemplazaron por el **comportamiento**: una sección con datos —que
`secAutoOpen` abriría— queda cerrada, o sea que el cerrador corre **después**.

---

## 7 · Cobertura y verificación (commit 7)

### 7.1 · Los casos nuevos

| caso | qué fija |
|---|---|
| **TC-705** | `CM_PDF_AR`, el recorte al contenido, el `ar` del recolector y las cuatro partes del texto del papel, con el censo de formas prohibidas y el control del formulario vacío |
| **TC-706** | `cmSchSet` rasteriza al abrir, y la compuerta pide las dos cosas |
| **TC-707** | la tabla casilla × datos × «Nuevo estudio» del posoperatorio, con `popHayDatos` excluyendo el interruptor |
| **TC-708** | los dos violetas —luminancia y matiz—, su reparto por variante, el esquema con su tono por tramo y la regla de rótulos |
| **TC-709** | el anillo orientado con la tangente y ubicado siguiendo la tangente, y las suturas en malla sin reusar el toro |
| **TC-710** | la cava celeste, los parches verdes con la CIV residual en el borde, y la leyenda entrada por entrada |
| **TC-711** | el título en los dos nodos y los textos chicos quitados y mantenidos |
| **TC-712** | la pestaña TGA sin botón propio, con sus cuatro grupos y sus dos cortes |
| **TC-713** | las secciones cerradas al volver, con los dos controles |

### 7.2 · Trampas que esta tanda pagó

* **El acento grave dentro de un comentario en un template**, por vigésima tanda seguida: tres
  veces, en `_probe_pant14c_ab.mjs`, `_probe_pant14c_color.mjs` y `_probe_pant14c_tga.mjs`. Lo caza
  `node --check`, y lo que previene es contar los acentos graves del bloque y exigir el número
  exacto.
* **La palabra que el runner usa de marcador, dentro de un comentario de `MONTAR`**: el montaje
  hace `replace(<marcador>, JSON)` y `String.replace` cambia la **primera** aparición, así que el
  JSON se inyectó en mi comentario y el A/B salió con «no está definida». Es la trampa que TGA-4
  documenta.
* **Dos denominadores vacíos, cada uno leído como «el cambio no funciona»:**
  1. el recuento de violeta con la tolerancia exacta sobre tubos **semitransparentes** (§ 3.2-bis);
  2. la sonda de la pestaña TGA abriendo la sub-pestaña con `showTab` cuando su botón lleva
     **`ccSubTab`**: el panel nunca quedaba activo y **todo** medía cero —el alto de la sección, las
     columnas y los rótulos— en los dos árboles.
* **Un defecto propio del colector de colores**, destapado por el inventario medido (§ 3.6-bis).

### 7.4 · El barrido de mutaciones, y lo que destapó

**46/46 muertas**, en un worktree y nunca sobre el árbol vivo, con el md5 idéntico antes y después.
Cada mutación declara **su** caso: 7 a TC-705, 1 a TC-706, 3 a TC-707, 6 a TC-708, 7 a TC-709, 8 a
TC-710, 5 a TC-711, 5 a TC-712 y 4 a TC-713. **Siete no revierten nada: la aplican de más**, porque
las condiciones que las matan son controles negativos.

⚠️ **EL DEFECTO DEL ARNÉS QUE MÁS CARO SALIÓ, Y VALE PARA CUALQUIER TANDA: escribía el archivo SIN
`flush`, y reportaba sobrevivencias FALSAS.** El servidor del suite leía el `index.html` **sin los
cambios**, así que el caso pasaba en verde sobre una mutación que, aplicada a mano, lo pone rojo
—verificado con la del anillo—. El mismo defecto abortó la guarda de md5 en la 24, con «EL ARCHIVO
VIVO NO VOLVIÓ A SU md5» sobre un archivo que estaba bien. Con `flush` + `fsync` las muertas pasan
de **24 a 33** en el mismo barrido. **Un barrido que escribe sin flush se lee igual que «no hay
cobertura».**

**Diecisiete sobrevivieron al primer barrido limpio, y se repartieron en tres clases:**

| clase | cuántas | qué |
|---|---|---|
| **huecos reales** | 10 | nada miraba el recorte efectivo de la captura, de dónde saca el texto el recolector, el rasterizado por el gesto, el reparto de columnas **dentro** de la regla del selector, ni el grupo vacío. Nacieron **doce** condiciones |
| **mal escritas o mal dirigidas** | 5 | dos mutaban el **motor** —que `cmEscena` no ve—, una tenía el patrón con las comillas mal, otra rompía el parseo, y la del orden del cerrador **lo duplicaba** en vez de **moverlo** |
| **retiradas, declaradas** | 2 | la del campo `hidden` (**P14c-g**) y la del de-solape de rótulos (**P14c-h**) |

### 7.5 · Las seis trampas de medición que esta tanda pagó

1. **`_cm3dCaptura` no está en `window`** —es una variable de módulo que `cm3dInit` asigna— y sin el
   panel abierto es `null`.
2. **Cerrar el panel del esquema no borra lo rasterizado**: `cmEsqPdfData()` devuelve null porque la
   compuerta se cierra, pero `_cmEsqPdf` conserva el dato, así que al reabrir reaparecía **aunque el
   rasterizado estuviera apagado** — el freno que tapa al que se muta.
3. **Los rótulos del 3D cuelgan de `#cm3d-cv`** y no de `#cm3d-cvw`: con el selector acotado al
   segundo, la condición contaba **cero** rótulos y se auto-neutralizaba. Son **cinco** visibles.
4. **Buscar `repeat(3` en el BLOQUE de una media query no sirve**: el bloque acumula todas las
   reglas de ese ancho del documento, y ahí hay otros selectores con ese reparto.
5. **Un ancla por el nombre de una función no sirve cuando el comentario de al lado la nombra**: hay
   que buscar la **llamada**, con sus paréntesis.
6. **La clave de la CIV residual del Fallot es `rciv`**: con las tres que probé primero, el anillo
   del borde del parche **no se emitía** y el control contaba sobre un denominador que no lo incluía.

### 7.6 · Lo que esta tanda NO tocó, y está verificado

| | valor |
|---|---|
| **Semgrep** | **124 WARNING / 0 ERROR**, la línea base, sin un aviso nuevo |
| **huérfanos** | **sin huérfanos nuevos** |
| **bloques de JS inline** | **17 de 19 parsean**, idéntico al árbol anterior — los dos rotos son los artefactos preexistentes del extractor |
| **el diff de la tanda** | **882 líneas agregadas y 140 quitadas**, de las que **792** no son comentario, con **cero** `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contraseñas |
| **campos guardados** | **ninguno nuevo** — el único campo que la tanda usa, `pop_esq_pdf`, ya existía desde POP-C |
| **columnas de Excel** | **441**, con las mismas claves |
| **ids** | **ninguno cambió** — los once campos de la transposición conservan el suyo, verificado id por id |

### 7.7 · Los cuatro rojos que la corrida completa destapó, y los cuatro eran míos

**La primera corrida completa dio once rojos**, y por eso esa cifra no es la línea base: los siete
conocidos —TC-223, TC-376, TC-390 y TC-406, los cuatro de siempre, más TC-358, TC-551 y TC-557, los
tres intermitentes declarados— **más cuatro míos**, y **ninguno lo encontró el censo**:

| caso | por qué cayó | qué se hizo |
|---|---|---|
| **TC-514** | **(F5)** afirmaba que lo abierto a mano **sobrevive al cambio de pestaña** y **(F6)** que `secAutoOpen` abre la sección con datos — las dos cosas que el commit 6 cambia | las dos **INVERTIDAS**, con **(F5a)** y **(F6b)** nuevas. Y corrige el censo de **P14c-b**, que decía que ninguna condición afirmaba eso |
| **TC-685** | **(F0)** y **(F1b)** exigían que la línea de abajo del dibujo **tuviera texto** y dijera que lo cargado está dibujado | **(F0)** pasa a medir que el nodo **exista** y **(F1b)** queda **INVERTIDA**: con todo dibujado la línea queda **vacía**. Gana **(F1c)** |
| **TC-686** | **(A2)** y **(A3)** cortan `cm3dInit` por un **offset de 14.000 caracteres**, y los commits 3 y 4 le agregaron código: la ventana dejó de llegar a las líneas del resize | la ventana se delimita por **balance de llaves**. **Un ancla por offset de caracteres envejece igual que un número de línea** |
| **TC-689** | **(H0)**, misma causa que TC-685 | el denominador mide que el nodo exista, y gana **(H0b)**, que exige la línea **vacía** |

⚠️ **Tres de los cuatro los destapó la corrida y no el censo porque lo buscado no era lo escrito**:
grepeé por «Todas las lesiones cargadas» y por el nombre de `secAutoOpen`, y esos casos lo dicen por
su **efecto** —«la línea se escribió», «la barra SÍ se abre sola»— o lo miden por un **offset**. Es
el modo de falla que `CLAUDE.md` documenta una docena de veces.

### 7.8 · El A/B de superficies: una sola diferencia en 67 escenas

Las dos corridas de `scripts/_probe_pant14c_ab.mjs` —una por árbol, en serie— sobre **67 escenas**:

| | resultado |
|---|---|
| **diferencias de superficie firmada** | **UNA**, en `p14cPopOnSin` |
| qué cambia ahí | el **PDF** pasa de **65 textos y 60 figuras a 58 y 58**: con la casilla del esquema del posoperatorio **encendida** y **sin un solo dato**, la hoja deja de emitirse |
| las otras **66** escenas | **cero** |
| **Excel** | **441** columnas con el **mismo juego de claves** en las 67 — cero escenas con el juego distinto |
| **campos guardados** | el **mismo juego** en las 67 — cero escenas con el juego distinto; 994 y 1010 según la escena, igual en los dos árboles |
| **registro de globos** | **142** en los dos árboles |

⚠️ **Y ese cero es un CONTROL NEGATIVO para los commits 1, 3, 4, 5 y 6, y se declara**: el montaje
del arnés siembra campos y **no abre el módulo del corazón maestro**, **no toca «Incluir en el
PDF»**, **no entra a la pestaña de la transposición** y **no abre ninguna sección de congénitas**,
así que sobre esas zonas no prueba nada. Lo que las prueba son las sondas dedicadas
—`_probe_pant14c_pdf.mjs`, `_probe_pant14c_color.mjs`, `_probe_pant14c_tit.mjs` y
`_probe_pant14c_tga.mjs`—, antes y después, y los nueve casos nuevos.

### 7.9 · Los dieciséis cruces, en los dos motores

`scripts/_probe_pant14c_wk.mjs` —**nombre verificado con `ls` antes de escribirlo**— mide las
claves de cierre de los siete commits en **dos motores × 1440, 1000, 768 y 390 px × dos temas**,
sobre los dos árboles. Las otras dos sondas de la tanda corren **sólo** el Chrome del sistema, así
que sin ésta la mitad de la condición de la orden quedaba sin medir.

⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema con
`channel: 'chrome'`.

**Medido, y los DIECISÉIS cruces dan lo mismo — sin una sola diferencia entre motores ni entre
temas:**

| clave | valor en los dieciséis |
|---|---|
| `CM_PDF_AR` | **1,25** |
| el texto del papel | **4 partes**, y **cero** formas prohibidas —guía, clase, nivel, folio, tabla, conducta, dato faltante— |
| el campo del posoperatorio | **`hidden`**; sin datos el predicado da **falso** y el publicador **no entrega dato** |
| los cuatro colores | `0x7e22ce` · `0xc084fc` · `0x38bdf8` · `0x2f9e44` |
| la leyenda | **once** entradas en **cada** una de las dos copias |
| el switch auricular | **2** tubos, **uno de cada violeta**, con sus **2** rótulos de túnel |
| el anillo de la obstrucción | **acostado** —lleva su normal y no rota en x ni en y— |
| las suturas del Jatene | **2 mallas**, las dos con su normal, y **CERO anillos naranjas**: no se reusa el toro |
| el título | **2** nodos; la frase retirada **ya no está**; las dos aclaraciones **sí** en el ⓘ |
| la pestaña | botón propio **ausente**, común **presente**, **4** grupos, **4** encabezados, **11** campos |
| las columnas | **3 / 3 / 2 / 1** a 1440, 1000, 768 y 390 px |
| la conclusión | **debajo** y fuera de la grilla, con **cero** grupos vacíos ocupando columna |
| el cerrador | existe, y alcanza **sólo** a `congenitas` y `congenitas2` |
| las secciones | **antes=2, al volver=0** |
| desplazamiento horizontal · textos recortados · **errores de página** | **0 · 0 · 0** |

Lo que mide por cruce: las dos constantes del PDF y las **cuatro partes** del texto del papel con
su censo de formas prohibidas; el campo del posoperatorio `hidden`, el predicado sin datos y el
publicador callado; los **cuatro** colores nuevos, las **once** entradas de leyenda en sus **dos**
copias, los dos tubos del switch auricular **uno de cada violeta** con sus dos rótulos, el anillo
**acostado** y las suturas en **malla** con su normal; los **dos** nodos del título, la frase
retirada y las dos aclaraciones en el ⓘ; el botón propio **ausente** y el común presente, los
**cuatro** grupos con sus **once** campos, las columnas, la conclusión **debajo** y **cero** grupos
vacíos; el cerrador con su lista de dos pestañas y las secciones **cerradas al volver**; más el
desplazamiento horizontal, los textos recortados y los errores de página.
