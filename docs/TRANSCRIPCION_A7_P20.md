# Transcripción de la Tabla A7 — ASE 2024, hoja 61, folio 62

> **Prótesis PULMONARES.** «Table A7 Normal Doppler echocardiographic values for prosthetic
> pulmonary valves», Zoghbi y col., *J Am Soc Echocardiogr* 2024;37:2-63.
>
> Leída **EN IMAGEN a 300 ppp** en tres franjas y cruzada con la capa de texto por coordenadas.
> El folio está comprobado en el **encabezado impreso** de la hoja: «**62** · Zoghbi et al ·
> Journal of the American Society of Echocardiography · January 2024».
>
> **Esta transcripción es la fuente de verdad del caso de integridad.** Lo impreso va literal:
> los decimales, los paréntesis y los símbolos son los de la hoja.

## Columnas, tal como las imprime la tabla

`Valve` · `Size, mm` · `Peak gradient, mm Hg` · `Mean gradient, mm Hg` · `Peak velocity, m/sec` ·
`AT, msec` · `EOA, cm2`

## Notas al pie, literales

- «*AT*, Acceleration time of the prosthetic valve.»
- «Data are expressed as mean ± SD or as median (IQR).»

## Recuento

| | |
|---|---|
| modelos | **12** |
| filas de tamaño | **26** |
| celdas con dato | **82** |
| celdas vacías (la tabla no imprime nada) | 48 |

## Las celdas

Una celda en blanco es una celda que **la tabla no imprime**. El superíndice pegado al nombre
(`233`, `234`, `235`, `11`) es la **referencia bibliográfica** y no es parte del nombre.

| Valve | Size, mm | Peak gradient | Mean gradient | Peak velocity | AT, msec | EOA, cm² |
|---|---|---|---|---|---|---|
| Homograft²³³ | | `<25` | `<15` | `<2.5` | | |
| **Valved conduits²³³** *(subtítulo de sección)* | | | | | | |
| — Contegra | `12-22` | | | | | |
| — Shelhigh | `10-24` | | `<15` | `<2.2` | | |
| — Medtronic | `19-29` | | | | | |
| Bioprosthetic valves²³³ | | | `<15` | `<2.2` | | |
| Percutaneous pulmonary valves (Melody)²³⁴ | `16 (≤20)` | | | `<2.4` | | |
| | `18 (≤22)` | | | `<2.4` | | |
| Percutaneous pulmonary valves (SAPIEN)¹¹ | `20` | | `16 ± 5` | | | `1.22 ± 0.2` |
| | `23` | | `11 (8-17)` | | | `1.47 (1.1-2)` |
| | `26` | | `9.5 (4.9-14.5)` | | | `1.77 (1.3-2.4)` |
| | `29` | | `10.4 (5.9-15.5)` | | | `2 (1.5-2.6)` |
| Percutaneous pulmonary valve native outflow (Alterra Stent with SAPIEN) | `No data` | | | | | |
| Percutaneous pulmonary valve native outflow (Harmony) | `No data` | | | | | |
| Mechanical valves (St. Jude)²³⁵ | `21` | `20 (19-21)` | `12 (11-13)` | `2.2` | `98 (85-110)` | `1.73` |
| | `23` | `20 (7-35)` | `11 (4-20)` | `2 (1.2-2.9)` | `87 (52-118)` | `2.5 (1-3.8)` |
| | `25` | `18 ± 7.5` | `11 ± 6` | `2` | `83 ± 11` | `2.9 ± 1` |
| | `27` | `15 (6-30)` | `6 (3-18)` | `1.8 (1.2-2.7)` | `90 (72-116)` | `4.2 (3-4.8)` |
| | `31` | `14` | `7` | `1.6` | `93` | `5.73` |
| Mechanical valves (Carbomedics)²³⁵ | `23` | `19 (17-20)` | `12` | `2 (1.8-2.2)` | `78 (70-85)` | `1.7 (1.3-2.1)` |
| | `25` | `20 (11-30)` | `11 (5-33)` | `2 (1.6-2.7)` | `89 (64-108)` | `3.3 (1.5-4.4)` |
| | `27` | `19 (10-28)` | `10 (6-14)` | `1.9 (1.4-2.4)` | `78 (75-80)` | `4.1 (4-4.1)` |
| | `29` | `14` | `7` | `1.7` | `76` | `2.6` |
| Mechanical valve On-X²³⁵ | `23` | `20 (7-36)` | `12 (4-22)` | `2.2 (1.1-2.7)` | `112 (106-118)` | `2.4 (1.9-2.9)` |
| | `25` | `17 (7-24)` | `10 (3-13)` | `1.8 (1.3-2.4)` | `100 (55-118)` | `1.5 (0.9-2.2)` |
| | `27` | `23` | `13` | `2.2` | `113` | `1.9` |
| | `29` | `20 (18-22)` | `12 ± 1` | `2.1 (1.9-2.3)` | `103 (95-110)` | `2.02 (1.8-2.2)` |

## Las CUATRO formas de celda que conviven en esta tabla

Es el hallazgo del commit 1 y lo que obliga a extender la forma de la celda. → **P20-a**.

| forma | ejemplo impreso | cómo se carga |
|---|---|---|
| media ± DE | `16 ± 5` | `[16, 5]` |
| **mediana con rango intercuartílico** | `11 (8-17)` | `[11, null, '11 (8-17)']` |
| valor único | `2.2` | `[2.2, null]` |
| **límite superior** | `<15` | `[null, null, '<15']` |

El **tercer elemento** es el **texto impreso** y se carga **sólo** cuando lo impreso no es
«valor» ni «valor ± desvío». La pantalla publica ese texto tal cual, así que **nada de lo impreso
se pierde**; y como un límite no tiene valor central, de él **no** sale ni una diferencia en
desviaciones estándar ni una EOA indexada predicha.

## Separación del nombre y del descriptor

Mecánica y verificada en imagen, sin interpretar nada:

- lo que va **entre paréntesis** es el nombre del modelo y lo de afuera es el descriptor de
  sección: `Mechanical valves (St. Jude)` → nombre `St. Jude`, descriptor `Mechanical valves`;
- `Mechanical valve On-X` no lleva paréntesis y el nombre va **después** del descriptor;
- `Contegra`, `Shelhigh` y `Medtronic` están **SANGRADOS** bajo el subtítulo `Valved conduits`,
  que es su descriptor;
- `Homograft` y `Bioprosthetic valves` son su propio nombre y no llevan descriptor.

## El tipo de cada modelo

El tipo se asigna **sólo** cuando el descriptor nombra el mecanismo o el tejido, que es la regla
que PANT-19 fijó para la A4. **No se adivina ninguno.**

| descriptor | tipo | por qué |
|---|---|---|
| `Mechanical valves` / `Mechanical valve` | **`mec`** | nombra el mecanismo |
| *(ninguno, en «Bioprosthetic valves»)* | **`bio`** | el nombre nombra el tejido |
| `Valved conduits` | **sin dato** | describe el conducto, no el material |
| `Percutaneous pulmonary valves` | **sin dato** | describe la vía de implante, no el material |
| `Percutaneous pulmonary valve native outflow` | **sin dato** | ídem |
| *(ninguno, en «Homograft»)* | **sin dato** | describe el injerto; es la misma decisión que PANT-19 tomó con `Homograft valves` en la A4 |

Un modelo **sin tipo se ofrece bajo cualquier morfología de prótesis**, que es el lado seguro y
no esconde ningún modelo.

## Rarezas, cargadas como están impresas

1. **`No data`** es lo que la celda de la columna `Size` imprime para los dos modelos de
   «native outflow». Significa que **la tabla no publica datos para ellos** —no que su tamaño se
   llame así—, así que su única fila va con el **tamaño vacío** y sus seis celdas en `null`:
   cargarlo como si fuera un tamaño sería malinterpretar lo impreso. Lo mismo vale para
   `Homograft` y `Bioprosthetic valves`, que **no llevan tamaño impreso** y sí llevan valores.
2. **El tamaño no siempre es un número**: hay tres rangos (`12-22`, `10-24`, `19-29`) y dos con
   paréntesis y el símbolo `≤` (`16 (≤20)`, `18 (≤22)`). **Todos se guardan como texto.**
3. **`2 (1.2-2.9)` y `2 (1.5-2.6)`** imprimen el valor central **sin decimal**, y así se carga.
4. **`2.9 ± 1`, `11 ± 6` y `12 ± 1`** imprimen el desvío **sin decimal**, y así se carga.
