# Fichas de los casos de la tanda EQ — TC-985 a TC-991

> Mapa de la tanda: `docs/mapa/eq-equipos-panel-borrado.md`. Los siete caen **0/7** contra
> `77196c5` (el cierre de la PARTE 1 de P8, md5 `8aaa289b`) con el **mismo** archivo de casos y
> sólo el `index.html` distinto.

| caso | denominador | qué afirma | cómo cae contra la base |
|---|---|---|---|
| **TC-985** | se vinculó con el conector falso; el puente manda **tres** equipos y la lista dibuja **dos** renglones | A1: los siete rótulos de `clnkEqConexion`, el chip «2 direcciones», las dos direcciones a la vista con su tipo, la de esta computadora **no** dibujada, el contador por equipos, un solo apodo por grupo, cero marcado inyectado, que **agrupar no autoriza nada**, separar/unir con su persistencia, y el **control negativo** de una sola dirección | denominador: no existen `clnkEqAgrupar` / `clnkEqConexion` |
| **TC-986** | ídem | A2: la pregunta con las dos direcciones y sus **tres** respuestas; el «No» separa y **deja en cuarentena**; el «Sí» autoriza por la **ruta del puente**; **control negativo**: un nombre desconocido sigue siendo «equipo nuevo»; y el apodo **no** agrupa ni separa | denominador: no existe el agrupador |
| **TC-987** | hay **dos** imágenes esperando y **un** equipo por decidir | A4: con el pendiente **ya avisado**, el sondeo abre el cartel de imágenes y lo deja armado con sus dos ids; cuando la pregunta del equipo **sí** se abre, el turno termina ahí; **control**: sin ningún pendiente el cartel sale igual con el número quieto —la hipótesis del médico desmentida—; y «Ver lo que espera» sigue funcionando | **por sus condiciones reales**: `abierto=false`, `grupo=false`, `avisadas=0` |
| **TC-988** | el primer cartel dice las **dos** que llegaron, sin hablar de total | A5: el segundo cuenta **una**, dice el total, dice que lo adjuntado no se vuelve a agregar, sigue ofreciendo el **envío entero**; el forzado dice el **total**; y la cuenta **por tipo** es la de las nuevas, con su control negativo | denominador: no existe `_clnkNuevas` |
| **TC-989** | el campo del apodo existe y **recibió el foco de verdad** (⚠️ con la sección cerrada, `focus()` no hace nada) | B1: **cero** mutaciones por turno quieto; el control **positivo** de que la lectura del médico sí repinta; cuatro turnos con el foco adentro dejan el **mismo nodo**, el texto, el foco y el plegable; un cambio real repinta conservando borrador y abierto; con el foco adentro **posterga**; y los campos de Ajustes no se pisan, con su control positivo | denominador: no existe `_clnkEscribiendo` |
| **TC-990** | la bandeja dibujó sus **cuatro** archivos con su barra | C1: Todas/Ninguna, la marca que se ve y se anuncia, **una** confirmación que dice cuántas y que es irreversible, **cero** diálogos nativos, los **índices que no se corren** (queda `MARCA1`), el cineloop intacto, el desfase que no borra nada, y apagar el modo que devuelve el toque que abre | denominador: no existen `clnkbBorrarVarias` / `clnkbElegirModo` / `borrConfirmar` |
| **TC-991** | hay **cuatro** estudios en la lista y el botón existe | C2: el modal dice «el filtro deja ver», dice que se van imágenes/cineloops/videos, sus casillas **sin id**, el contador, la confirmación con estudios **y pacientes**, lo irreversible y el respaldo, borra **sólo** lo elegido, dos pacientes se cuentan como dos, **cancelar no borra nada**, cero nativos y el censo idéntico | denominador: no existe `igBorrarVariosAbrir` |

**Adaptado: TC-850 (D).** Su condición decía «su sección no tiene **un solo campo**», que era el
atajo para decir que nada de la bandeja entra al censo del estudio. La sección ganó **un** control
—la casilla «Elegir archivos»— así que hoy mide lo que de verdad lo decide: **cero controles con
`id`**, más una condición **nueva (D2)** de que el único control es el del modo elegir. Queda **más
fuerte**: un campo con id la pone en rojo, y uno sin id que no sea ése también.

---

### TC-990 · lo que se le agregó el 2026-11-21 al cerrar EQ-i

Este caso **colgó la pasada completa una hora y media en el lote 18 de 19** pasando **1/1 corrido
aislado** y **7/7** con sus seis vecinos. Hacía `await` sobre la promesa de `borrConfirmar` después
de apretar el botón de *«el primer `[role=dialog]` visible»*, y con un cartel que dejó abierto otro
caso del lote ese botón no existía: esa promesa **sólo** la resuelve un clic, un Escape o un clic
en el fondo.

Hoy tiene tres piezas más, y **ninguna afloja una condición**:
- busca su cartel por **`[data-borr-conf]`**, la marca que `borrConfirmar` pone en su overlay;
- **acota la espera a nueve segundos** con `Promise.race` y, si vence, suelta la promesa con un
  `keydown` de Escape — la condición «borra las DOS elegidas» sale **roja** con el motivo
  «SIN RESPUESTA» en vez de congelar la suite;
- gana un **denominador** que declara que la pantalla arrancó sin ningún cartel ajeno abierto y
  **lo nombra** (por su `id` o su `aria-label`) si hay uno, así el síntoma apunta a su causa.

**Verificado por mutación**, en un worktree y nunca sobre el árbol vivo —md5 `114b27dc` idéntico
antes y después—: con `borrConfirmar` mutado para que el cartel **no se agregue nunca al
documento**, el caso cierra **en 15 s** con `0/1` y dos renglones legibles (`dialogos=0` y
`SIN RESPUESTA`) en vez de no terminar nunca.
