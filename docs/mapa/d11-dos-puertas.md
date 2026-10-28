# D-11 · Un dato, dos puertas, gana la última edición

> Mapa de la corrección **D-11** (2026-10-28), sobre el HEAD del D-10. Sale a archivo propio
> porque `d-cardioonco-amiloidosis.md` estaba en **25,4 KB** y una sección más lo acerca al techo
> de 35 KB que este repo ya cruzó cuatro veces. Ahí quedó un puntero de cinco líneas.

## El modelo, en una frase

**Un dato vive en el campo del estudio, se edita por dos puertas, y gana la última edición.**
Es decisión de Maicol y **revierte** la regla del D-10 según la cual el gesto del módulo no podía
pisar un valor cargado a mano en el estudio.

| | Quién gana | Cuándo |
|---|---|---|
| el médico teclea o borra en un campo **del módulo** | el módulo | en el `oninput`, tecla por tecla |
| el médico teclea o borra en un campo **del estudio** | el estudio | en la pasada del barrido, 220 ms |
| cualquier flujo **automático** | nadie: no escribe | nunca (esto es del D-9 y no se movió) |

## Los cinco hallazgos, medidos antes de tocar nada

| # | ¿Se reproduce? | Causa medida |
|---|---|---|
| **H1** tipear en el módulo no llega al estudio | **sí, en los ocho datos** | la regla de «no pisar» |
| **H2** no se puede borrar: vuelve el valor | **sí, en los ocho** | al vaciar, el reflejo repoblaba |
| **H3** lo mismo con cada dato compartido | **sí** | la misma regla |
| **H4** el botón violeta conserva el valor viejo | **sí** | la etiqueta la pintaba sólo el clic |
| **H5** ¿qué regla lo impide? | — | `if (va === null \|\| nuestro)` |

**H1 y H2 son la misma regla.** `_amiloEspejoHaciaAppCuerpo` escribía sólo si el campo del estudio
estaba vacío **o** si tenía lo último que ese módulo había puesto ahí (`dataset.amiloEsc`, del
D-10). Con el estudio ya cargado, nada de lo tecleado en el calculador llegaba: medido en los ocho
datos, el «1» y el «15» quedaban sólo en el módulo.

Y el borrado era peor que no llegar. Al vaciar el campo del módulo, la escritura salía temprano
—`if (vm === null) return`— y además **borraba la marca de desacuerdo**, con lo que el reflejo
quedaba libre para repoblar el campo con el valor del estudio en la pasada siguiente. El médico lo
describió exactamente: «se borra sólo la primera cifra».

**H4 es independiente y de la pantalla.** La etiqueta del botón la escribía `amCalcToggle`, que
corre **sólo cuando el médico toca el botón**. Borrados los tres espesores en AI/VI, el espesor
relativo se vaciaba, el criterio se destildaba, el cartel de HVI se iba y el score bajaba —todo
correcto— y el botón seguía anunciando `0.58` en violeta, como si el dato estuviera.

## Qué cambió

- **La escritura toma el `id` del campo editado y toca SÓLO ése.** No es cosmético: `siv` y `ppvi`
  tienen **dos** campos de módulo cada uno —el del encabezado y el del espesor relativo—, así que
  recorrer el registro entero escribiendo todo lo que tuviera valor deshacía el gesto en el acto.
- **Se fueron `amiloEsc` y `amiloPropio`**, las dos marcas del D-10, con las reglas que las leían:
  con «gana la última edición» no hay permiso que guardar ni desacuerdo que conservar. En la lista
  cerrada de marcas de «Nuevo estudio» quedó **`data-espejo`**, que es la que sigue viva.
- **`amCalcLabelSync(k)`** deja la etiqueta valiendo lo que dice el dato, conservando si el
  acordeón está abierto, y la llaman los dos únicos lugares por donde pasa cada recálculo:
  `amAplicarCalc` y `amCalcSinDato` — **antes de sus salidas tempranas**, porque la etiqueta
  muestra el valor medido y no la marca.
- **Un campo a medio escribir no se propaga ni se vacía, de los dos lados.** Un «−» solo todavía
  no es un número: escribirlo como vacío borraría el dato del paciente mientras el médico pone el
  signo, y vaciarlo desde el reflejo le come el guión. Medido: tecleando «−12» con una pausa
  después del guión, el barrido se lo llevaba 220 ms más tarde.

## Lo que no cambió, y está medido

- **Nada automático escribe al estudio.** El barrido de espejos, el marcado del score, los
  recálculos, el cambio de pestaña y la carga de un estudio guardado: los cinco medidos con el
  campo del módulo cargado y el del estudio vacío, y el estudio **sigue vacío**.
- **El criterio destildado a mano se respeta**, también cuando el dato cambia por el módulo.
- **El `e′` promedio sigue sin camino de vuelta**: su fuente son `e′` septal y lateral, y un
  promedio no se reparte en dos mediciones sin inventarlas. Teclear ahí no llega al estudio, y es
  el único de los ocho que se comporta así. → `PENDIENTES.md` **D-l** y **D-o**.
- **Los tres campos del encabezado del módulo siguen yendo en un solo sentido.** `ett-septo` y
  `ett-pp` los lee `_amHayDatos` como «el médico está evaluando amiloidosis acá», así que
  autollenarlos desde el estudio pondría esa frase en el informe de cualquier estudio con el septo
  cargado: eso es cambiar el papel firmado y quedó **parado y reportado** → **D-p**.

## El botón «↓ Traer del formulario» — punto 3, sólo reportado

Ver `PENDIENTES.md` → **D-q**. Medido: con el reflejo en vivo, apretarlo no cambia **ningún**
valor, **ningún** puntaje y **ninguna** etiqueta.
