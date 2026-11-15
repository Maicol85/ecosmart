# Fichas de los casos TC-892 a TC-895 — MEDIR-4a

Archivo propio porque `docs/mapa/tests-fichas.md` está a menos de 1 KB de su techo. El mapa de la
tanda es `docs/mapa/medir4a-vistas-cierre.md`.

**Los cuatro caen contra `e7a1f3e`** —el cierre del bloque 0 de MEDIR-4, cuyo `index.html` es
idéntico al de MEDIR-3— con el **mismo archivo de casos** y sólo el `index.html` distinto, **por
condiciones y NINGUNO por excepción**.

---

## TC-892 — la plantilla única de barra

**Qué fija.** Que las dos vistas salgan de **una** plantilla con los **mismos** botones en el
**mismo** orden; que los dos encabezados queden **sin** botones; que «✕ Cerrar vista» esté en las
dos barras, con el mismo rótulo y en el mismo índice; que «➕ Vista» y «Cerrar» **no** vivan en
ninguna barra, existan **una** vez cada uno y sigan cableados; y que el modo mínimo siga
escondiéndolos y sacándolos del Tab.

**Cómo monta la segunda vista.** Por el camino **real** (`vistaBAbrir`), sustituyendo **sólo**
`_vElegirLoop`: es el único camino que escribe `_vistaB` —un `let` de nivel de script— y depende de
`_imgUuidActual` y de `CeiboCine`, que en un caso no existen. Todo el resto corre: montar, cablear,
activar la medición, el botón de sincronizar y el biplano. Se repone en el `finally`.

**Sus dos denominadores.**
1. **El visor abre en modo mínimo**, medido **antes** de encender nada: medido después, `cine-min`
   ya no está y el modo mínimo no se ejercita.
2. ⚠️ **A 756 px el visor muestra UNA vista a la vez.** La ventana del arnés es más angosta que
   1024, así que la regla `#cine-paneles > div { display:none }` con su
   `:first-child { display:flex }` —el conmutador de celular, que existe desde antes— esconde el
   otro panel. El panel escondido **no tiene geometría** y sus botones informan **cero**: no es un
   botón chico, es uno que no se está dibujando. El alto se mide **sólo en la barra que se ve**, y
   los 44 px de las **dos** barras a la vez los mide `scripts/_probe_medir4a.mjs` a 1500, 1440,
   1280 y 1180. **Lo que sí se puede medir acá, y es lo que el punto 2 pide, es el orden y la
   cuenta de los botones**, que no dependen de que estén a la vista.

**Cae contra la base por 9 condiciones.**

---

## TC-893 — el cierre por vista, con el gesto real

**Qué fija.** Que cada vista cierre **sólo** la suya; que cerrando la A con la B abierta el visor
**siga abierto** con la B como única vista, que ésta pase a ser la activa **con su prefijo** y que
el layout vuelva a una sola vista; que la **tabla no se vaya con el panel destruido** y conserve
las **dos** medidas con su marca de origen; que la vista que se abre después tome el **prefijo
libre** sin duplicar un id; y que la **única** que queda cierre el **visor**.

**Los valores son conocidos**: TAPSE **18 mm** medido en la A y VD basal **52 mm** en la B, puestos
por las mismas funciones que usa el visor.

⚠️ **EL GRUPO DEL CAJÓN SE ASEGURA, NO SE ALTERNA.** `d2Modo` es un **toggle**: llamarlo dos veces
con el mismo grupo lo **apaga** y la tabla sale vacía, que se lee igual que «la tabla se perdió».
Es la trampa que este repositorio ya documenta y que la primera versión de la sonda pagó.

⚠️ **CADA CLIC VA CON GUARDA.** Contra la línea base el botón de la vista A **no existe**, y un
`.click()` sobre `null` tira un `TypeError` que se lleva el caso entero: la condición «sin
excepciones» sale roja y las de abajo no llegan a evaluarse, así que el caso dejaría de decir
**cuál** es la diferencia. Es lo que TC-827 deshizo en PANT-37 y lo que TC-890 volvió a pagar en
MEDIR-3.

**Su primera condición es un control negativo**: con **una** vista la fila va **sin** marca de
origen, y la marca aparece recién con dos. Eso prueba que la marca no está puesta siempre.

**Cae contra la base por 10 condiciones.**

---

## TC-894 — el resultado abajo, los cajones en la vista activa y las reglas del corte

**Qué fija.** Que `cine-biplano` y `cine-simp-uni` **no** vivan en `.cine-col-der`, vayan
**después** de `#cine-paneles`, lleven margen automático y el **mismo** ancho máximo; que
mostrando el resultado **el panel no se mueva un píxel**; que los dos cajones vivan en la ranura de
la vista activa; y las **reglas** del corte.

⚠️ **EL REPARTO ENTRE EL CASO Y LA SONDA ESTÁ DECIDIDO Y DECLARADO.** La ventana del arnés mide
756 px, así que la media query de 1100 no aplica y las **cuatro columnas no se pueden medir acá**.
Lo que el caso fija son las **reglas** leídas de `document.styleSheets` —el corte de 1369, los 340
px y el apilado— y lo que mide los **píxeles** en los cuatro anchos reales es
`scripts/_probe_medir4a.mjs`, en los dos motores. Es el mismo reparto que TC-890 dejó escrito en
MEDIR-3 para el ancho del modal.

El centrado también se parte igual: acá se fija el **mecanismo** (margen automático y ancho
máximo), porque la ventana del arnés es **más angosta** que el ancho máximo del bloque y ahí el
desbalance es cero por otra razón; el centrado en píxeles lo mide la sonda.

**Su denominador de (B)** es que el resultado **se vea**: medido con él oculto, los anchos no
cambian por nada y la condición pasaría sobre nada.

**Cae contra la base por 9 condiciones.**

---

## TC-895 — «+ Vista» con imágenes fijas y el Simpson bloqueado

**Qué fija.** Que el selector liste cineloops **y** fijas; que el `'doc'` **no** entre; que la fija
lleve su marca «imagen fija» y **sólo** ella; que **ningún** rótulo se repita; que el mismo archivo
listado dos veces salga **una** vez; que dos distintos con igual código se **distingan** por su
ordinal y su peso; que el subtítulo nombre las fijas y avise del Simpson **antes** de elegir; que
eligiendo la fija la vista quede **marcada** sin contagiar a la otra; que el Simpson **caiga al
defecto** con un mensaje de **una** línea y el botón apagado diciéndolo, mientras Distancia y Área
siguen disponibles; y que abriendo un cineloop después la marca se **suelte** y el biplano siga
posible.

**El fixture tiene las cuatro situaciones**: dos cineloops normales, **dos** registros que son el
mismo archivo (misma terna nombre/cuadros/bytes), **dos** con igual nombre y distinto peso, una
fija y un `'doc'`. **Ocho entran y seis tarjetas salen.**

**Su control negativo es (D)**: en la vista A, que es un cineloop, el Simpson **sí** entra, sin
mensaje y con su botón no apagado. Sin eso, un bloqueo global pasaría las condiciones de (C).

⚠️ **SE SUSTITUYE EL ALMACÉN Y SE REPONE EN EL `finally`.** `CeiboCine` y `CeiboImg` los usan otros
casos del lote, así que dejarlos sustituidos sería sembrar un defecto en los casos de abajo — el
modo de falla que este archivo documenta una decena de veces. También se repone
`_cineDesdeRegistro`, el ajuste `cfg-guardar-imagenes` y el uuid del estudio (con
`imgRestaurar('')`, que es la única forma de soltarlo desde un caso).

⚠️ **EL ORDEN DE `imgVaciar` Y `imgRestaurar` COSTÓ UNA CORRIDA.** `imgVaciar` pone
`_imgUuidActual` en `null`, así que llamarlo **después** de sembrar el uuid lo borraba y
`_vElegirLoop` salía por su primera guarda. El síntoma no se parecía a la causa: el caso informaba
el uuid bien puesto —lo leía antes— y después «el selector no abrió».

⚠️ **EL PREDICADO VA CON GUARDA**: contra la línea base `_medSimpsonBloqueadoFija` no existe y un
acceso pelado tira `ReferenceError`.

**Cae contra la base por 16 condiciones.**
