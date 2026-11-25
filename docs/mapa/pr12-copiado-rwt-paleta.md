# Mapa · PR12 — el tamaño del texto copiado, el corte de RWT, el rango de NT-proBNP y la paleta del mapa de SGL del visor

**Tanda:** PR12 · 2026-11-25 · sello **`v20261125-0132`** · md5 **`b556f081`**
**Línea base:** `2830208` (cierre de PR9, sello `v20261124-2316`, md5 `a5ce3ab2`).

Seis tareas: cuatro escriben código (1, 2 —sin cambio—, 3 y 5) y dos son de **solo lectura** (4 y 6).

| tarea | qué toca | dónde |
|---|---|---|
| 1 | el HTML que los dos botones de copiar ponen en el portapapeles | `CW_PT`, `CW_FS`, `_cwB`, `_cwP`, `cuadTextoHTML`, `cuadInformeHTML` |
| 2 | el corte de espesor parietal relativo | **nada que cambiar**: `calcGeometriaVI`, `ref-vi`, `GEO-VI-001` y `GEO-VI-002` ya lo tenían |
| 3 | el rango de NT-proBNP como ayuda de una casilla | el `<label>` de `hfaicos_bnp` |
| 4 | AF-2, AF-4 y AF-5 | **solo lectura** — ver el informe de más abajo |
| 5 | la paleta del mapa de SGL del visor | `_strPalColor`, `_strGris`, `_strColorPct`, `_strBullsDibujar` |
| 6 | los segmentos del SGL del visor | **solo lectura** — `docs/INFORME_SGL_VISOR_PR12.md` |

---

## 1 · El tamaño de letra del texto copiado con formato

### Qué se encontró
Los dos armadores de HTML —`cuadTextoHTML` (los datos numéricos) y `cuadInformeHTML` (el informe
con su EN SUMA)— declaraban `font-size:11pt` **sólo en el `<div>` envoltorio**. Cada `<p>`, el
`<ul>`, cada `<li>` y los `<b>` / `<u>` salían **sin tamaño propio**, y Pages y Word le asignan a
todo bloque sin tamaño el de su propio estilo de párrafo: de ahí el 14 que el médico vio.

### Qué quedó
**Un solo dueño del número** y una función para la negrita:

| pieza | qué hace |
|---|---|
| `CW_PT` | `'11pt'` — el único lugar donde el número está escrito |
| `CW_FS` | `'font-size:11pt;'`, el fragmento de estilo |
| `_cwB(t, sub)` | `<b>` con su tamaño, y con `<u>` adentro —también con el suyo— cuando `sub` |
| `_cwP(t, estilo)` | el párrafo, con `CW_FS` antes del estilo que reciba |

Los **siete** bloques del HTML copiado llevan el tamaño en línea: el envoltorio, cada párrafo, los
títulos de sección, `INFORME`, `EN SUMA:`, el `<ul>` y cada `<li>`. **Un solo tamaño**: los títulos
van también en 11 pt, como la orden pide.

⚠️ **LA TIPOGRAFÍA SALE.** El envoltorio declaraba `font-family:Calibri,Arial,sans-serif` y hoy no
declara ninguna: la orden dice que Pages y Word usen la suya y que lo único que el estilo decida
sea el tamaño. **El `color:#000` se conserva** —es lo que evita que el texto se pegue con el color
del tema de la app— y no es tipografía.

⚠️ **EL TEXTO LLANO NO CAMBIA NI UN BYTE**, y es la invariante: es la **otra representación** del
mismo copiado, la red para pegar donde no se acepta formato. `cuadTexto()` y `cuadInformeTexto()`
no se tocaron.

⚠️ **EL TÍTULO DE SECCIÓN SE ESCRIBE DISTINTO EN LAS DOS REPRESENTACIONES, Y ES DE ANTES DE ESTA
TANDA**: el texto llano lo marca con **dos puntos** —«Aorta:»— y el HTML con **negrita** —
`<b>Aorta</b>`—. Lo encontró TC-1064 al comparar renglón por renglón; no se cambió nada, y la
condición acepta el renglón con o sin sus dos puntos finales.

### Lo que no se pudo verificar
**El pegado real en Pages y en Word.** Lo que se mide es el **contenido del portapapeles**: que
cada bloque del HTML declare 11 pt, que no haya otro tamaño y que no se fije tipografía. Cómo lo
interpreta cada programa al pegar lo tiene que probar el médico.

---

## 2 · El corte de espesor parietal relativo: **ya estaba en «≥ 0,42»**

**No se cambió una línea, y es una medición, no una omisión.** Las cuatro superficies ya tenían el
corte inclusivo:

| superficie | qué dice | dónde |
|---|---|---|
| la **lógica** | `if (masaNormal && r < 0.42) 'Normal'` · `if (r < 0.42) 'Hipertrofia excéntrica'` | `calcGeometriaVI` |
| el **cuadro de Referencias** | `<0.42` y **`≥0.42`** en las cuatro filas | `ref-vi` |
| la **ficha** del espesor | «Normal por debajo de 0,42; con **0,42 o más** … está aumentado» | `GEO-VI-001` |
| la **ficha** de la geometría | los cuatro cuadrantes con «**0,42 o más**» | `GEO-VI-002` |
| el **cuadro por sexo** | `≥ 0,42` en las dos columnas | `GEO-VI-001` en la tabla de cortes por sexo |

O sea: **el 0,42 exacto cuenta como aumentado / concéntrico**, que es lo que la decisión pide.
Medido en los cuatro cuadrantes: con masa normal, 0,41 → *Normal* y 0,42 y 0,43 → *Remodelado
concéntrico*; con masa aumentada, 0,41 → *Hipertrofia excéntrica* y 0,42 y 0,43 → *Hipertrofia
concéntrica*.

⚠️ **EL CONTROL NEGATIVO VA EN 0,414 Y NO EN 0,419, Y NO ES UN AJUSTE PARA QUE PASE.**
`calcGeometriaVI` **normaliza** el RWT a los dos decimales que se **imprimen** en el informe, así
que 0,419 redondea a 0,42 y cae —con razón— del lado aumentado. Ese redondeo es el que evita que la
tabla del PDF y el narrativo se contradigan cerca del umbral, y está declarado en el comentario de
esa función desde antes. **TC-1065 lo afirma explícitamente**, así que la condición quedó más
fuerte que el control original.

⚠️ **EL CRITERIO DE HFA-PEFF NO SE TOCÓ, y su fuente tampoco.** Ese criterio escribe «**> 0,42**»
y se lo atribuye a **Pieske 2019, Figura 3, folio 3305**, que es lo que esa figura imprime. La
cláusula 2.2 de la orden —«si algún texto de fuente o ⓘ atribuye a una fuente el símbolo «>», no
le atribuyas «≥»»— **no se dispara**: ningún texto de la geometría atribuye un operador que su
fuente no escriba. La ASE/EACVI 2015 escribe en su Figura 6 «increased RWT **≥ 0.42**», que es
exactamente lo que las dos fichas dicen. Está transcrito en `docs/fuentes/FUENTES.md`.

⚠️ **LA TIPOGRAFÍA DEL CUADRO NO SE UNIFICÓ, y se declara (PR12-b).** `ref-vi` escribe `≥0.42`
—sin espacio y con punto, la convención de **esa** tabla, donde todo va con punto— y la tabla por
sexo escribe `≥ 0,42`. El operador, que es lo que la decisión fija, es el mismo en las dos;
`CLAUDE.md` ya documenta que las dos formas conviven a propósito para que el buscador de
Referencias encuentre las dos.

---

## 3 · El rango de NT-proBNP, 375–600 pg/mL

### Dónde está la casilla, y por qué es ésa
La orden describe «la única casilla de NT-proBNP **sin número**». Censadas las tres que hay:

| control | qué es | tiene número |
|---|---|---|
| `hf_ntprobnp` / `hf_bnp` | **campos numéricos** del HFA-PEFF | sí, el valor del laboratorio |
| `hf_nt_may` / `hf_nt_men` | las **casillas** del criterio humoral del HFA-PEFF, para cuando el médico tiene el laboratorio informado y no el valor | sí: su rótulo trae el rango publicado (125-220 en ritmo sinusal, 365-660 en fibrilación auricular) |
| **`hfaicos_bnp`** | la casilla **«BNP / NT-proBNP basal elevado»** del **HFA-ICOS** (cardio-oncología, columna «Humoral») | **no** |

Así que la única sin número es `hfaicos_bnp`, y ahí va la ayuda.

### Qué quedó
El rótulo **no cambió**. Debajo, dentro de la misma etiqueta, un renglón de 10 px:

> `CRITERIO DE ECOSMART` · NT-proBNP 375–600 pg/mL

- **Rotulado como criterio de la aplicación**, con el chip estándar de la casa, porque **ninguna
  fuente de la biblioteca respalda ese tope**: la que publica un rango publica otro, y la orden
  prohíbe expresamente citar una guía para el 600 o mezclar los dos.
- **No es un campo.** Es un `<span>` **sin `id`**: el censo del estudio y el Excel recorren
  `input[id]` y `select[id]`, así que un control con id entraría a las **457** columnas por existir
  y «Nuevo estudio» le escribiría su valor guardado.
- **No lleva `title`**, por la regla de TC-500.
- **No toca el puntaje**: el peso de esa casilla lo decide `hfaicosFactores` por su `pts`, que no
  se movió. Medido: tildarla mueve el estado y destildarla lo devuelve exacto.
- **No llega al papel**: es ayuda de pantalla; cero apariciones del 375 en el informe y en el
  EN SUMA.

⚠️ **LO QUE QUEDA PARA EL MÉDICO, Y SE DECLARA (PR12-c).** `hfaicos_bnp` es un marcador **basal**
del marco HFA-ICOS —antes del tratamiento oncológico— y el rango 375–600 es, por su forma, una
**ventana**: un valor por encima de 600 también está elevado. La ayuda dice el rango y **no dice
qué significa estar dentro o fuera de él**, a propósito: afirmar eso es contenido clínico y lo
decide el médico. Si el rango tenía que ir en otro lugar, moverlo es una línea.

---

## 5 · La paleta del mapa de SGL del visor

### Qué había
El mapa de 17 segmentos del visor —el que `_strBullsDibujar` pinta por **territorio**— usaba una
**rampa de intensidad** de un solo tono (teal) cuya oscuridad crecía con la **magnitud** del
acortamiento, con su propio gris `#9E9E9E`. Era una decisión declarada de Maicol del **2026-09-20**,
y **TC-201** exigía desde PR7 que esa rampa **no compartiera ningún color** con la paleta del
bull's eye del informe.

### Qué quedó
Los **ocho tramos** de `STRAIN_PAL`, de cinco puntos entre −20 y +20, de violeta a azul, más el
gris de SIN DATO —`STRAIN_PAL[0]`, `#D4D4D0`—, con el tramo decidido por **`strainTramoDe`**.
**Decisión de Maicol del 2026-11-25**, que **revierte** la del 20/09.

| pieza nueva | qué hace |
|---|---|
| `_strPalColor(i)` | el color del tramo `i` de `STRAIN_PAL`, con guarda y respaldo |
| `_strGris()` | `_strPalColor(0)` |
| `_strColorPct(pct)` | `_strPalColor(strainTramoDe(pct))` |

⚠️ **SE LEE EN TIEMPO DE LLAMADA Y CON GUARDA, NO SE COPIA.** Es la receta de `_CT` —el
recoloreado de los patrones de ejemplo— y vale por si el bloque corriera antes de que la paleta
exista. Con una copia, el día que un tramo cambie de color este diagrama mostraría el anterior al
lado de un bull's eye ya repintado. **No se puede probar sustituyendo la paleta**: `STRAIN_PAL` es
un `const` de nivel de script —`window.STRAIN_PAL = otra` crea una propiedad **nueva** que no lo
tapa, la trampa que `_imgEditado` y `_cinePendientes` ya documentan— y además está `Object.freeze`d.
Lo que TC-1067 afirma es la **estructura**: las tres funciones nombran `STRAIN_PAL` y **no traen
ningún color escrito salvo el respaldo**. La mutación 16 copia los ocho a mano y esa condición la
caza; la que compara valor por valor la dejaría pasar.

### La leyenda
Ocho rectángulos de `STRAIN_PAL[1..8]`, las ocho marcas de `STRAIN_MARCAS` —el borde **izquierdo**
de cada tramo, igual que en la pestaña— y el cuadrado de SIN DATO. **La misma referencia** que
`strainLeyendaHTML` pinta en la pestaña SGL, leída del mismo dueño.

⚠️ **LA GEOMETRÍA NO SE MUEVE**: misma `ly`, mismo alto, mismas alturas de rótulo y el mismo
`ly + 30 * esc` de retorno, porque de ese valor cuelgan **las dos líneas del descargo** que
`_strBullsCanvas` dibuja debajo para la captura, y un canvas que se pasa **recorta en silencio**.
La mutación 20 lo prueba.

### Lo que NO cambia, y es lo que importa
- **No gradúa severidad.** Los tramos son el valor medido repartido en escalones de cinco puntos,
  no bandas clínicas. Esta app **borró a propósito** la graduación del SGL, y el único corte que
  aplica —el −16 % del marco HFA-ICOS— está definido para **speckle tracking**, que no es este
  método. La leyenda lo sigue diciendo: «la misma referencia de colores que el bull's eye de la
  pestaña SGL; no gradúa severidad».
- **No publica atribución coronaria**, y el **ápex (17) sigue gris**: el método no lo mide.
- **El número impreso en cada territorio no se toca.**
- **La paleta de la MOTILIDAD (`CONTR_MOTILIDAD`) sigue siendo otra**, y ésa es la única
  separación que esta tanda no toca: los dos diagramas pueden terminar en el mismo PDF y miden
  cosas distintas. TC-1067 lo fija con un control negativo.

### Por qué TC-201 cambió de lado
Su condición exigía que las dos paletas **no compartieran ningún color**, con un argumento bueno
para lo que había entonces: una rampa de intensidad y una paleta de bandas son **dos escalas**, y
dos escalas que comparten un color pueden terminar en el mismo PDF significando cosas distintas.
PR12 cambia el hecho: ya no son dos escalas, es **una** sobre la **misma magnitud**, y eso es lo
que las hace comparables en el mismo papel. Hoy la condición exige lo contrario —que el visor
**saque** su color de esa paleta—, así que el caso falla por los **dos** lados.

⚠️ **Y CUATRO CONDICIONES DE TC-201 PASARON DE MEDIR EL COLOR A MEDIR EL NÚMERO.** Con la rampa de
intensidad, dos `pct` distintos daban dos colores distintos **siempre**, así que comparar píxeles
alcanzaba para afirmar «el anteroseptal toma valor propio» y «14 y 16 promedian». Con ocho tramos
de cinco puntos, dos `pct` distintos pueden caer en el **mismo** tramo y pintar igual, y el caso
salía rojo sobre un diagrama que se portaba bien. Hoy esas cuatro se miden sobre los **valores**
—que es lo que de verdad protegen— y el color queda cubierto por una condición **nueva**: el color
de cada pared es el **tramo** de su valor medido. Y la condición «más acortamiento = más oscuro»
del bloque 4 **se retiró**: con ocho tramos la luminancia ya no es monótona en la magnitud —el
violeta oscuro y el azul oscuro están en los dos extremos—, así que afirmaba la propiedad que esta
decisión retiró.

---

## Cobertura

| caso | qué fija | cae contra `2830208` |
|---|---|---|
| **TC-1064** | los siete bloques en 11 pt, un solo tamaño, sin tipografía, el texto llano intacto, negrita / subrayado / viñetas, y los dos botones copiando lo que arman sus funciones | **sí**, por condiciones |
| **TC-1065** | los cuatro cuadrantes en 0,41 / 0,42 / 0,43, el cuadro, las dos fichas, el cuadro por sexo y el control negativo del HFA-PEFF | **no** — guarda de regresión, declarada en PR12-b |
| **TC-1066** | la ayuda de `hfaicos_bnp`: rango, rótulo, sin guía, sin `title`, sin `id`, sin campo nuevo, puntaje intacto y sin llegar al papel | **sí**, por condiciones |
| **TC-1067** | los doce valores, el gris, la estructura, la leyenda y el control negativo de la motilidad | **sí**, por su denominador |
| **TC-201** (adaptado) | el denominador y el color de los segmentos **invertidos**, el gris derivado del dueño, cuatro condiciones por número y una nueva por tramo | **sí**, por condiciones |

**Mutaciones:** `scripts/_mut_pr12.py`, **21**, al menos dos por grupo y **cinco que no revierten
nada: la aplican de más**, porque las condiciones que las matan son controles negativos.

**Lotes de riesgo:** `scripts/_lotes_pr12.sh` — los casos cuyo **cuerpo** toca el copiado, los
Cuadros, el visor, el SGL, el strain del visor, la geometría del VI, el criterio humoral o el censo
de globos. La selección sale del patrón del propio cuerpo de cada caso y no de una lista a ojo.
