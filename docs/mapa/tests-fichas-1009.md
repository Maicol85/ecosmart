# Fichas de los casos TC-1009 a TC-1016 — tanda P11 (2026-11-22)

Archivo propio porque `docs/mapa/tests-punteros-tandas.md` está en **36,4 KB** y
`docs/mapa/tests-fichas.md` en **34,2 KB**: los dos por encima del techo de ~35 KB que
`CLAUDE.md` fija. El enlace vive en la tabla de `CLAUDE.md`, que es donde se busca.

**Los ocho caen 0/8 contra `1d7caeb`** —el cierre de P10— con el MISMO archivo de casos y sólo el
`index.html` distinto, **por sus condiciones y NINGUNO por excepción**. Eso último costó tres
guardas: contra la línea base `cine-pan`, los racimos y el accesor `_medPorCuadro` no existen, y
un acceso pelado tira un `TypeError` o un `ReferenceError` que se lleva el caso por excepción en
vez de por sus condiciones — lo que esta casa prohíbe desde TC-827.

---

## TC-1009 — la imagen LLENA su caja, en los dos caminos

Qué fija: que el **envoltorio** sea la caja de encaje y el canvas la llene, con recorte y sin él,
sin dejar negro adentro y **sin tocar un píxel de la medición**.

- **Denominador:** la caja que le toca es **más grande** que la imagen de origen. El fixture es
  de **200×150 a propósito**: en la ventana del arnés el alto disponible ronda los 300 px, así que
  una imagen de 600 px de ancho se **achica** y el encaje no se puede ver; una de 200 tiene que
  **crecer**, que es lo que la tanda vino a conseguir.
- Sin recorte: el ancho pintado pasa de 200 a más de 205 y la proporción se conserva (200/150).
- Cero negro adentro del recorte: `|rec.w − cv.w| ≤ 1`.
- **El canvas sigue en píxeles de imagen** (`200x150`), que es la invariante del módulo.
- `--cine-imgh` existe y resuelve.
- Con recorte puesto (`{w:200,h:150,cw:160,ch:120,x0:20,y0:15}`): también crece, con la
  proporción del recorte, y el canvas **desborda** su ventana —eso *es* el recorte—.
- Al sacar el recorte, el envoltorio vuelve a calzar con el canvas.

## TC-1010 — el interruptor esconde la columna y SE SIGUE MIDIENDO

- En tamaño **Normal** el interruptor **no se ofrece** (el 1.2 lo pide para pantalla completa).
- En pantalla completa sí, y **esconde** la columna (`display: none`).
- **La mitad que importa:** la medición sigue encendida, con la herramienta elegida, sin perder lo
  medido, y el canvas de trazos sigue vivo **y con su oyente**.
- `aria-pressed` dice el estado y el segundo toque la devuelve.
- **Guarda:** todo lo que se aprieta pasa por un ayudante que no revienta si el botón no existe.

## TC-1011 — la barra a la columna, Capturar sobre la imagen, y UNA columna con dos vistas

- **Denominador:** en Normal la barra está en su casa y «Capturar» en la barra.
- En pantalla completa: la barra en `cine-barra-slot` y «Capturar» en `cine-imgbl`, con la barra
  **todavía dentro de su panel** (lo que TC-322 y otros miden).
- Las dos vistas se montan **como lo hace TC-257** —`_vNueva` + `_vMontarPanel` + `_vCablear`—,
  sin disco y sin selector, y se llama a `_vAccionesSync`, que es lo que el camino real hace al
  final.
- Con dos vistas en pantalla completa queda **una sola** columna; un `pointerdown` sobre el panel
  de la B le pasa el foco, la columna y el botón de tamaño; **cero ids duplicados**.
- Volver a Normal devuelve la barra a su casa y «Capturar» **a su posición en la barra** (mismo
  orden de ids que antes), y se ven las **dos** columnas.

## TC-1012 — los racimos, y las flechas mueven el CUADRO

- Los tres racimos existen y viven **dentro del recorte**.
- **44 × 44 px** de área táctil, **sólo los que se ven**: el interruptor de la columna mide 0×0 en
  Normal a propósito, y exigirle 44 sería exigirle que se vea. Con su propio denominador (al menos
  tres botones a la vista).
- Sin texto: un solo glifo, y con su `title`.
- El de tamaño es **`cine-maxi` mudado** y hay **uno solo**: dos botones para la misma acción
  dejarían dos `aria-pressed` que pueden discrepar.
- Arriba a la derecha y abajo a la derecha **de verdad**, comparando contra la caja del recorte.
- **Dos cineloops en el fixture**, que es lo que permite distinguir «mueve el cuadro» de «mueve el
  cineloop»: la flecha mueve el cuadro, **no** el cineloop, y **acota** en los dos extremos.

## TC-1013 — cambiar de tamaño no pierde nada, y Esc sale del tamaño

- La medida se da con el **gesto real**: dos clics sobre el canvas, en píxeles de **imagen**.
- **Denominador:** el **marco** cambió de tamaño. ⚠️ No puede ser «la imagen cambió de tamaño», y
  está medido: la ventana del arnés mide 756×469, así que el alto disponible pasa de 309 a 312 y
  la imagen se queda en 371 px en los dos tamaños. Es la lección de **TC-244**: un denominador que
  deja de morder no se afloja, se cambia por uno que mida lo mismo en cualquier ventana. Los
  píxeles los mide `scripts/_probe_p11a.mjs`.
- El **milímetro guardado es idéntico**, no se pierde ninguna medida, la medición sigue encendida
  con su herramienta y el overlay sigue **calzado** (`0,0 0x0`).
- El **primer** Esc sale de pantalla completa, **no** cierra el visor y no pierde lo medido; el
  **segundo** sí cierra.

## TC-1014 — las flechas pasan de cuadro SIEMPRE

Los seis escenarios, con `KeyboardEvent` sintético —que alcanza porque el arreglo es un oyente de
JS y ya no depende del comportamiento nativo del deslizador—:

- **recién abierto**, con el foco en el `BODY` (su propio denominador): la flecha pasa de cuadro;
- **después de medir** (dos clics en el canvas, que es lo que le saca el foco al deslizador);
- **después de reproducir**;
- **para atrás**;
- con el **campo de la etiqueta** enfocado (denominador: el foco está ahí) **no** mueve el cuadro;
- con una **tecla modificada** tampoco;
- **control negativo:** con el visor **cerrado** la flecha no hace nada.

⚠️ **Lo que este caso NO puede medir** y queda en `scripts/_probe_p11b.mjs` con teclado real: que
con el **deslizador enfocado** el cuadro avance **uno** y no dos. Un `KeyboardEvent` sintético no
dispara el comportamiento nativo de un `input type=range`, así que acá no habría nada que
duplicar.

## TC-1015 — lo medido queda atado a su cuadro

- **Denominador:** había una medida en el cuadro 0.
- En otro cuadro no se ve, y la del 0 queda guardada con su clave **`0:0`**.
- Al volver al 0 **reaparece**; al volver al 3 reaparece la de **ese** cuadro; **las dos no se
  mezclan**.
- La **línea de calibración** sobrevive al cambio de cuadro y **no entra** al almacén.
- Las **dos áreas del VD** sobreviven y **tampoco** entran.
- Cambiar de imagen **suelta** el almacén.
- **Guarda de `typeof`:** contra la línea base el accesor no existe.

## TC-1016 — el Simpson no dibuja el contorno de la diástole

- **Denominador:** hay sesión de Simpson.
- **Control positivo primero:** un trazado **pendiente** sí se dibuja (> 500 px de tinta). Sin él,
  un cero se lee igual que un canvas vacío y la condición pasaría sin haber medido nada.
- En la escena exacta —diástole confirmada, fase en sístole, `ocultar` en falso— **no se dibuja
  nada** (0 px), ni al soltar el pendiente.
- **Lo confirmado sigue guardado** y la fase no se movió.
- La bandera `ocultar` **sigue existiendo**, que es lo que TC-191 mide.

⚠️ **Los diagnósticos se toman ANTES de cerrar el visor.** `medApagar` pone `_simp` en `null` y
`cineCerrar` suelta `_cineDatos`, y la lista de condiciones se evalúa **después** del cierre:
leerlos ahí tira un `TypeError` que se lleva el caso por excepción. Lo pagaron TC-1012 y TC-1016
en su primera corrida.
