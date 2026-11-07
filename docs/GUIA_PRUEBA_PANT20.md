# Guía de prueba manual — tanda PANT-20 (2026-11-06)

> El catálogo de prótesis por modelo y tamaño en la **mitral**, la **tricúspide** y la
> **pulmonar**, y las dos tablas de obstrucción en Referencias.
>
> **24 pasos, un dato por línea.** Abrí `index.html` en Chrome con la ventana en **1440 px** salvo
> donde diga otra cosa, y poné **peso 75** y **talla 175** en la pestaña «Paciente» antes de
> empezar: sin eso no hay superficie corporal y la EOA indexada no se calcula.

| # | Dónde | Qué hacer | Qué tiene que verse |
|---|---|---|---|
| 1 | Pestaña **Válvulas** → sección **Válvula mitral** | Dejá «Morfología VM» en **Normal** | **No hay** ningún botón «Modelo y tamaño» |
| 2 | La misma | Poné «Morfología VM» en **Prótesis mecánica** | Aparece el botón **«Modelo y tamaño»** en una **fila propia, debajo** de la fila de Morfología / Tipo de IM / Carpentier |
| 3 | La misma | Mirá la fila de arriba | Los **tres** campos siguen del mismo ancho y la fila no se pasa del botón «Insuficiencia»: la fila nueva **no la tocó** |
| 4 | Tocá **«Modelo y tamaño»** | Se abre la tarjeta | La lista de sugerencias **no** se abre sola, y se ven los dos enlaces de abajo |
| 5 | En «Modelo» escribí **st** | | Aparecen **St. Jude Medical** y **Starr-Edwards** |
| 6 | Escribí **zzz** | | Dice que no hay coincidencias; no propone ningún modelo |
| 7 | Borrá y tocá **«No sé el modelo: ver todos y elegir»** | | Los modelos agrupados por su descriptor, y la lista **no tapa** ese enlace |
| 8 | Elegí **Carbomedics**, tamaño **27**, y tocá **«Elegir»** | | El botón pasa a decir **«Carbomedics · 27 mm ▾»** y aparecen los cuadritos de valores esperados |
| 9 | Mirá la línea gris de abajo | | Dice el descriptor, el **ASC**, el **IMC** y **los cortes de IMC que se aplicaron**, con la hoja y el folio |
| 10 | En «Doppler mitral», poné **G. medio** en **12** | | Aparece **«Gradiente medio medido 12 mmHg · +N DE respecto del esperado»** |
| 11 | Elegí el modelo **Carbomedics**, tamaño **23** | | La línea de abajo dice **«la tabla no publica el área para este modelo»** — no dice que falte el peso ni la talla |
| 12 | Volvé a **Paciente** y borrá **peso** y **talla** | Volvé a Válvulas | Ahora **sí** dice «falta el peso y la talla para indexar» |
| 13 | Repoñé peso 75 y talla 175. En Válvulas poné «Morfología VM» en **Prótesis biológica** | | El modelo mecánico **se borra** y el botón vuelve a «Modelo y tamaño» |
| 14 | Sección **Válvula tricúspide**: poné «Morfología VT» en **Prótesis mecánica** | | El botón aparece **en la misma fila** del select, a su derecha |
| 15 | Elegí **Carbomedics Standard**, tamaño **31** | | **Siete** cuadritos, entre ellos **«EOA indexada esperada 1.04 ± 0.18 cm²/m²»** |
| 16 | Mirá el cuadrito **«EOA indexada predicha»** | | Sale **sólo el número** en cm²/m²: **sin** «moderado», «severo» ni «sin desajuste» |
| 17 | En la tricúspide, poné **«Velocidad pico de E»** en **178** | | Dice **«+2.0 DE respecto del esperado»** — no veinte: la guía da 1,4 m/s y el campo está en cm/s |
| 18 | Sección **Válvula pulmonar**: poné «Morfología pulmonar» en **Prótesis biológica** y elegí **Homograft** | | Publica **«<25 mmHg»**, **«<15 mmHg»** y **«<2.5 m/s»**, tal como los imprime la guía, y **no** pide tamaño |
| 19 | Con el Homograft puesto, poné **«Gradiente medio pulmonar»** en **9** | | Publica el valor medido **sin** diferencia en desviaciones: de un límite no sale una |
| 20 | Poné «Morfología pulmonar» en **Prótesis mecánica** y elegí **Carbomedics**, tamaño **23** | | Publica **«19 (17-20) mmHg»** y **«78 (70-85) ms»**: la mediana con su rango, tal como está impresa |
| 21 | Pestaña **Referencias** → solapa **Válvulas** → **Prótesis** | | Hay **siete** fichas; las dos últimas son **«Prótesis Pulmonar — ASE 2024»** y **«Prótesis Tricúspide — ASE 2024»**, las dos **cerradas** |
| 22 | Abrí las dos | | La pulmonar trae **cuatro** filas con sus dos columnas; la tricúspide, **cinco** con «Bioprotésica» y «Mecánica»; las dos citan su hoja y su folio |
| 23 | Con la ficha de la pulmonar abierta, buscá el tramo **«≥200 ms»** | | **No está**: ése es el tiempo de hemipresión de la **tricúspide**. Cada ficha publica los tramos de SU tabla y no los de la otra |
| 24 | Guardá el estudio, abrilo de nuevo desde Guardados y volvé a Válvulas | | Los **tres** botones vuelven a decir el modelo y el tamaño, y los cuadritos reaparecen con los mismos valores esperados |

## Lo que NO tiene que pasar en ningún paso

- El **informe**, el **EN SUMA**, el **PDF** y el **PPT** **no nombran** ningún modelo, ninguna
  tabla ni ningún folio: esta tanda no toca el papel.
- Ninguna **barra de desplazamiento horizontal** en la página, a ningún ancho.
- Ningún **texto recortado**.

## Dos comprobaciones de cierre

1. **«Nuevo estudio»** con un modelo cargado en las tres válvulas: los **doce** campos quedan
   vacíos y los tres botones vuelven a decir «Modelo y tamaño».
2. **Exportar el Excel del Laboratorio**: tiene **457** columnas, y las doce nuevas traen el
   modelo sólo cuando la morfología es una prótesis.
