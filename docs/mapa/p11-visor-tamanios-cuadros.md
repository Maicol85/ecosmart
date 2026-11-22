# Mapa — P11: los dos tamaños del visor, el teclado y las medidas por cuadro

Tanda **P11** (2026-11-22). Sello `v20261122-1044`, md5 `0de4570e`. Línea base `1d7caeb`
(el cierre de P10). Tres commits de código: `4668089` (tarea 1), `91b3268` (2.1 y 2.2) y
`5e8d3da` (2.3).

Este mapa es por **nombre de función y de constante**, no por línea: la línea cambia en cada
edición y el nombre no.

---

## 1 · El alto disponible de la imagen — `--cine-imgh`

**Es el número que decide el tamaño de la imagen, y hasta esta tanda vivía escrito en CUATRO
lugares con TRES valores distintos:**

| dónde vivía | valor | a quién gobernaba |
|---|---|---|
| estilo en línea del canvas (`_vPanelHTML`) | `66vh` | por debajo de 1100 px |
| `_cineRecorteAplicar`, rama **sin** recorte | `56vh` | el reset del envoltorio |
| `_cineRecorteAplicar`, rama **con** recorte | `56vh` (dos veces) | el cineloop ya medido |
| `@media (min-width:1100px)` sobre el canvas | `calc(var(--cine-h) - 190px)` | escritorio |

Con tres valores, **cuánto medía la imagen dependía de si el recorte había llegado**. Hoy manda
`--cine-imgh` y la leen los dos caminos.

```
#cine-ov          { --cine-h: 94vh;  --cine-imgh: 66vh; }        /* angosto: lo de siempre */
#cine-ov.cine-max { --cine-h: 100vh; }
@media (min-width: 1100px) {
  #cine-ov          { --cine-imgh: calc(var(--cine-h) - 190px); }
  #cine-ov.cine-max { --cine-imgh: calc(var(--cine-h) - 157px); }
}
```

**De dónde salen los dos números.** Los **190** son el cromo que rodea a la imagen dentro del
modal en tamaño Normal (encabezado del modal 44 + 8, encabezado de la vista ~19 + 5, la barra
44 + 2, el reproductor 44 + 5, la línea de ayuda ~14 y los 16 + 16 de relleno del modal); es el
mismo número que MEDIR-3 derivó. Los **157** son lo que queda en pantalla completa, donde la
imagen se queda sola con su reproductor: ahí la barra y el «Capturar» se mudan a la columna
(punto 1.4), el encabezado de la vista se esconde con una vista, la línea de ayuda se esconde y
el bloque de calculados se muda a la columna (`_vSlotSync`). Verificado midiendo `modalScrollY`:
**0 en los tres tamaños**, contra 114 px de la línea base a 1440×900.

⚠️ **Por qué el número de Normal NO se corrigió a los 293 px que de verdad mide el cromo con la
medición prendida:** porque bajarlo arregla el desplazamiento al precio de **achicar la imagen
100 px** en la pantalla del médico, que es lo contrario del punto 1.1. Se conserva el trato que
esta casa ya tenía (el modal es `overflow:auto`). Declarado en **P11-c**.

## 2 · El envoltorio es la caja de encaje — `_cineRecorteAplicar`

**El dueño único de la geometría de la imagen.** Desde esta tanda sus **dos** ramas hacen lo
mismo: el **envoltorio** (`cine-recorte`) es la caja —`width:100%` acotado por `--cine-imgh` y
por la proporción, con `aspect-ratio`— y el **canvas la llena**.

⚠️ **Por qué el tope no puede vivir en el canvas:** un canvas es un elemento **reemplazado**, así
que un tope sólo puede **achicarlo** —su tamaño de partida es el del mapa de bits— y con la caja
más grande que la imagen el navegador la deja como está. Medido en la línea base: a 1920×1080 y a
2560×1440 la imagen salía en sus **1016×708** con **422** y **962** px de negro al costado, el
40 % del ancho de la pantalla y el 49 % del alto.

**Lo que NO se toca, y es la invariante del módulo:** el canvas sigue midiendo `cols × filas` en
**píxeles de imagen** (no se escribe `cv.width` ni `cv.height`), `_medPunto` divide por
`cv.width / r.width` y `_medPintar` calza el overlay contra la caja medida del canvas. **Una
escala uniforme, hacia arriba o hacia abajo, es transparente para las dos.**

**Lo medido** (Chrome, los tres tamaños con su alto real):

| | antes | después |
|---|---|---|
| Normal 1440×900 | 941×656 | 941×656 (ahí ya llenaba) |
| Normal 1920×1080 | 1016×708 · negro 422 | **1184×825** · negro 254 |
| Normal 2560×1440 | 1016×708 (40 %×49 %) | **1670×1164** (65 %×81 %) |
| Completa 1440×900 | 1016×708 · scroll 114 | **1018×709** · scroll **0** |
| Completa 1920×1080 | 1016×708 (53 %×66 %) | **1325×923** (69 %×86 %) |
| Completa 2560×1440 | 1016×708 (40 %×49 %) | **1841×1283** (72 %×89 %) |

⚠️ **El encaje sólo se aplica con un cineloop abierto.** En el estado vacío el canvas trae los
300×150 de fábrica y una caja al ancho del lienzo con esa proporción sería una franja negra de
2:1.

## 3 · Qué se mueve en pantalla completa — `_vMaxSync`

**Un solo dueño de las cuatro mudanzas, y ninguna reemite un nodo:** todo lo que viaja es el
MISMO elemento, con su id, sus oyentes y lo que el médico tenga tipeado adentro.

1. el **botón de tamaño** (`cine-maxi`) va al racimo de arriba a la derecha de la imagen de la
   vista con foco, en los **dos** tamaños (punto 1.5);
2. en pantalla completa la **barra** de cada vista va a la ranura de **su** columna
   (`cine-barra-slot`) y **«Capturar»** al racimo de abajo a la izquierda de **su** imagen
   (`cine-imgbl`) — punto 1.4;
3. en pantalla completa y con dos vistas, la columna de la vista **sin** foco se esconde con la
   clase `cine-col-off` (punto 1.3);
4. el glifo y el título del interruptor de la columna se derivan de la clase, que es el único
   estado.

⚠️ **Cada mudanza pregunta si el nodo ya está en destino:** mover un nodo que contiene al
elemento **enfocado** le quita el foco, y esta función corre en cada cambio de tamaño y de foco.

**La casa de la barra** es `cine-barra-casa`, un envoltorio nuevo en el panel. La barra es **un
nodo que viaja** y no dos barras, una por modo: con dos barras, el día que se agregue un botón a
una se olvida en la otra — el modo de falla que la barra de la vista B ya pagó.

**«Capturar» vuelve a su lugar y no al final:** se inserta **antes de `cine-cerrar-v`**, que es
su vecino de siempre, porque el orden de la barra lo miden tres casos del suite.

## 4 · La vista con foco — `_vFoco` y `_vFocoVista()`

El punto 1.3 pide que en pantalla completa con dos vistas haya **una** columna, la de la vista
activa. **«Activa» no se podía saber:** `_V` es transitorio —`_vCon` repone la anterior en su
`finally`— así que fuera de un gesto vale siempre `_vistaA`.

`_vFoco` es la vista con la que el médico interactuó por última vez, y lo escribe un
**`pointerdown` sobre su panel** (registrado en `_vCablear`), que es el gesto real: `pointerdown`
y no `click`, porque un clic que arranca un trazado no llega nunca a `click`. Falla **abierto**:
sin foco anotado —o con la vista cerrada— es la A, que es lo de hoy.

⚠️ **Y el botón de tamaño se RESCATA antes de destruir un panel.** `vistaCerrarUna` quita el panel
de la vista que se cierra, y desde el punto 1.5 `cine-maxi` **vive dentro** de ese panel: se lo
llevaba puesto y el visor quedaba **sin forma de cambiar de tamaño**. Lo destaparon los casos de
esta misma tanda. Hoy `_vMaxSync` corre **antes** del `removeChild`, con `_vistaB` ya en `null`.

## 5 · Los botoncitos pegados a la imagen — `ibtn`, `cine-imgtr` / `cine-imgbr` / `cine-imgbl`

Tres racimos **dentro de `cine-recorte`**, que es la caja de la imagen:

| racimo | qué lleva |
|---|---|
| `cine-imgtr` (arriba a la derecha) | ranura de `cine-maxi` + `cine-pan` (sólo en pantalla completa) |
| `cine-imgbr` (abajo a la derecha) | `cine-fprev` ‹ y `cine-fnext` › — **cuadro** anterior y siguiente |
| `cine-imgbl` (abajo a la izquierda) | ranura de `cine-cap` en pantalla completa |

⚠️ **Van dentro del recorte y no del lienzo**, y es lo único que los deja «pegados a la imagen»:
el lienzo es la **columna** y es más ancho que la imagen —medido: 990 contra 941 a 1440 px, y
1978 contra 1016 a 2560—, así que un racimo anclado al lienzo queda flotando en el negro.

⚠️ **El precio, declarado (P11-d):** el recorte lleva `overflow:hidden`, así que los racimos caen
**dentro** de la imagen, y mientras se mide esos cuadrados de 44 px son área de botón y no de
medición. Son las esquinas.

**Se ven de 26 px y se tocan en 44**, la receta de PANT-2: el área la da el botón y lo que se
pinta es el `span`. El fondo es **negro semitransparente y no `var(--bg3)`**: estos botones se
pintan encima de la ecografía, que no cambia de color con el tema de la app.

## 6 · El interruptor de la columna — `cinePanelToggle`

Clase `cine-sinpanel` en el overlay. **No toca `medOn` ni ninguna herramienta**, que es la mitad
del pedido: «al esconderla se puede seguir midiendo». Lo único que cambia es el `display` de la
columna.

⚠️ **El botón vive SOBRE la imagen y no dentro de la columna**, y es la única forma de que la
columna se pueda **volver** a mostrar: un botón metido adentro de lo que se esconde se esconde con
ello. El punto 1.4 enumera lo que queda sobre la imagen y éste no está en la lista; se declara en
**P11-e**.

## 7 · `_vReencajar` — las tres puertas que cambian la caja

El dueño único del repintado. Lo llaman los tres gestos que cambian la caja de la imagen: el
tamaño (`cineMaxToggle`), el interruptor de la columna y el foco de vista. `_cineRecorteAplicar`
va **pelada** —recibe su vista por parámetro— y `_medPintar` **envuelta** en `_vCon`, que es la
distinción que `cineMaxToggle` ya traía escrita.

## 8 · Esc sale del tamaño — el oyente en CAPTURA y `_cineCapaEncima`

Medido en la línea base: con el visor maximizado **Escape lo CERRABA** —el oyente genérico del
bloque de accesibilidad busca el diálogo modal visible y le aprieta el botón cuyo texto empareje
`/cerrar|✕/`, y `#cine-ov` lleva `role=dialog` y `aria-modal` porque ese mismo bloque se los
pone— y encima dejaba la clase `cine-max` puesta, así que el visor siguiente abría maximizado.

⚠️ **Va en CAPTURA y no en burbuja:** el oyente genérico es de **burbuja** y está registrado en el
arranque de la app, o sea ANTES que éste, así que en burbuja correría primero.

⚠️ **Y por eso hay que cederle el paso a lo que esté encima.** `_cineCapaEncima()` pregunta por la
**capa**: cualquier cosa fija y visible por encima de 400 **que cubra la pantalla**. Falla
**cerrado**: con una excepción no se toca Escape.

⚠️ **El culpable que encontró medir fue `#toast`**, que vive en la capa 999, es `position:fixed`,
está siempre en el documento y conserva su caja medible aunque no muestre nada. Con el toast
contando como «capa encima», Escape **nunca** salía de pantalla completa: el arreglo no hacía
nada. Por eso la guarda exige que **cubra la pantalla** (los cinco cuadros propios del visor son
`position:fixed;inset:0`).

**En tamaño Normal no cambia nada:** ahí Escape sigue cerrando el visor.

## 9 · Las flechas del teclado — el oyente del documento

⚠️ **La causa estaba medida y era que NO HABÍA NINGÚN OYENTE.** Este archivo no tenía un solo
`keydown` para el visor: las flechas «funcionaban» porque el deslizador es un
`<input type="range">` y el navegador se las atiende **cuando está enfocado**. Por eso se perdían
después de medir —el clic en el canvas le saca el foco— y después de tocar Reproducir, y por eso
volvían al tocar la barra. Medido con teclado de verdad: **recién abierto el visor el foco está en
el `BODY` y la flecha no movía el cuadro**, ni antes de medir, ni después, ni después de
reproducir; sólo con el deslizador enfocado pasaba del cuadro 2 al 3.

**Es un oyente del DOCUMENTO y no del overlay**, porque el foco puede estar en el `body` —ahí está
al abrir— y un oyente colgado del overlay no recibe nada. Eso es «de raíz»: no se le devuelve el
foco al deslizador a escondidas, que era el otro arreglo posible y deja la tecla atada a que nadie
más tome el foco.

**Cede en cuatro casos**, los que evitan robarle la tecla a otro:

- con una capa que tape la pantalla no se toca (`_cineCapaEncima`);
- si alguien ya la atendió (`defaultPrevented`), tampoco: es el caso del **deslizador**, que la
  atiende nativo, y sin esto el cuadro avanzaría **dos** veces por tecla;
- con el foco en un campo de texto, un `textarea`, un desplegable o un `contenteditable` no se
  toca: ahí la flecha mueve el cursor o la opción, y el visor tiene el campo de la etiqueta;
- con una tecla modificada tampoco, que son atajos del navegador.

**`cineCuadro(paso)`** mueve el **cuadro** dentro del cineloop abierto —no es `cineLoop`, que pasa
al cineloop siguiente de la importación— y **acota** en vez de dar la vuelta: el médico busca la
telediástole y la telesístole, y saltar del último al primero le hace perder el que estaba mirando.
Se pausa antes, por el mismo motivo que `medToggle`.

## 10 · Las medidas por cuadro — `medPorCuadro`, `_medCuadroCambio`

Hasta esta tanda cambiar de cuadro las **borraba** y no volvían. Medido: una regla puesta en el
cuadro 1 desaparecía al pasar al 3 y seguía en cero al regresar.

`medPorCuadro` es un objeto **por vista** con la clave `<índice del loop>:<cuadro>`. Tres
funciones y **un** dueño:

| función | qué hace |
|---|---|
| `_medClaveCuadro(V)` | la clave del cuadro en que está |
| `_medCuadroGuardar(V, clave)` | guarda las cinco colecciones de ese cuadro |
| `_medCuadroRestaurar(V, clave)` | las **concatena** sobre lo que `medReset` conservó |
| `_medCuadroCambio()` | el único que las llama, desde el observador de `#cine-num` |

⚠️ **`medReset` NO se toca,** y es deliberado: la llaman **diecinueve** casos del suite para armar
sus escenas y además sigue siendo el reseteo correcto de «se cambió de cuadro». Lo que cambia es
que ahora, antes de resetear, se **guarda**, y después se **repone** lo de este cuadro. Reusarla
es además lo que hace que las sesiones de Simpson, strain, LARS y VD sigan avisando igual: esa
lógica vive en un solo lugar.

**Lo que NO entra al almacén, y por qué:**

- la **línea de calibración** — es de la imagen, no del cuadro, y guardarla por cuadro la haría
  aparecer y desaparecer con las flechas;
- las **dos áreas del VD** — sobreviven al cambio de cuadro desde MEDIR-5 (A8), porque el FAC se
  mide en telediástole y telesístole y el método **exige** moverse entre cuadros.

Las dos las conserva `medReset`, así que alcanza con no duplicarlas: se guarda y se repone lo que
ella tira. **Un cuadro sin nada medido no deja entrada**, así que el almacén de un cineloop de 160
cuadros pesa lo que el médico de verdad midió.

**Se suelta** en `medCambioDeImagen` (otra imagen, otras claves), en `medApagar` y en
`medCerrarVisor`.

⚠️ **El nombre de la función NO puede ser `_medCuadroClave`:** ése es el nombre del **accesor** de
la vista en el MAPA de `_vNueva`, y una declaración de función con el mismo nombre se pelea con
`Object.defineProperty` por la misma propiedad de `window`. La función es `_medClaveCuadro`.

**Lo medido:** medida en el cuadro 0 (100,23 mm) → al 3 queda vacío con la clave `0:0` guardada →
otra medida en el 3 (200,08) → al volver al 0 reaparece **sólo** la de 100,23 → al volver al 3
reaparece **sólo** la de 200,08 → cambiar de imagen suelta el almacén y deja cero líneas.

## 11 · El contorno de ayuda del Simpson — `_medPintar`

Acá vivía el contorno que el médico pidió sacar, y era esta línea:

```
const ultimo = _simp.pares[_simp.vista][_simp.fase === 'd' ? 's' : 'd'];
const tr = _simp.pendiente || (_simp.ocultar ? null : ultimo);
```

o sea el contorno confirmado de la fase **contraria** a la que toca. Al confirmar la diástole,
`_simpAceptar` da vuelta la fase a sístole y pone `ocultar` en falso: el contorno de la diástole
quedaba pintado en verde mientras el médico empezaba la sístole. **«Pasa siempre.»**

Hoy se dibuja **sólo `_simp.pendiente`**, o sea lo que se está trazando.

**Medido por PÍXELES y con su control positivo** (`scripts/_probe_p11c.mjs`): en la escena exacta
—diástole confirmada, fase en sístole, `ocultar` en falso— la línea base pinta **4235 px** de
tinta y este árbol pinta **cero**; con un trazado pendiente los dos pintan 4235, que es el
denominador que prueba que la sonda ve un contorno cuando hay uno.

**No cambia ningún cálculo ni ningún resultado:** los confirmados siguen en `_simp.pares` y los
sigue leyendo `_simpCalcular`.

⚠️ **`ocultar` se sigue escribiendo y queda declarado:** ya no decide nada en este dibujo —era su
único lector en `index.html`— pero tres condiciones de **TC-191** la miden, y es la bandera que
distingue «el cambio de cuadro escondió lo confirmado» de «lo borró».

---

## Cobertura

**TC-1009** a **TC-1016**, uno por punto. Fichas en `docs/mapa/tests-fichas-1009.md`. Los ocho
caen **0/8 contra `1d7caeb`** con el mismo archivo de casos, **por sus condiciones y ninguno por
excepción**.

**Adaptados:** **TC-250** y **TC-257**, con su motivo donde vive cada condición.

## Sondas

| sonda | qué mide |
|---|---|
| `scripts/_probe_p11_0.mjs` + `_cuerpo.js` | la **línea base** del bloque 0, con el alto real de cada pantalla |
| `scripts/_probe_p11a.mjs` + `_cuerpo.js` | la tarea 1 en dos motores, tres tamaños y dos temas |
| `scripts/_probe_p11b.mjs` | las flechas con teclado **real** y las medidas por cuadro |
| `scripts/_probe_p11c.mjs` | el contorno del Simpson, por píxeles |
