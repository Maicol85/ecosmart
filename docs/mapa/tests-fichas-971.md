# Fichas de los casos TC-971 a TC-977 — PROMPT 7 (2026-11-21)

Archivo propio porque `docs/mapa/tests-punteros-tandas.md` está en **36,4 KB**, o sea **por encima**
del techo de ~35 KB que esta casa fija, y `tests-fichas.md` también. Medido con `wc -c` **antes** de
escribir, que es la regla.

Los siete caen contra **`2a1bc79`** con el **mismo** archivo de casos y sólo el `index.html`
distinto, y **ninguno por excepción**.

---

## TC-971 — Tarea A · la burbuja del cartel TERMINADO

**Qué fija.** Que cerrar con la ✕ —o con un clic en el fondo— un cartel cuya tanda **ya cerró** deja
la burbuja quieta y latiendo con «Llegaron N archivos — tocá para elegir», que no se reabre sola en
tres turnos de sondeo, y que el clic la devuelve entera.

**Escenas:** `tandaFin` (tres archivos, tanda ya cerrada) y `tandaFin2` (dos, para el control de la
decisión), las dos con ids propios.

**Sus CUATRO controles negativos**, que son la mitad del caso:
1. `clnkAvisoCerrar()` **sin** el argumento, con un grupo pendiente → **no** hay burbuja.
2. Apretar un **destino** suelta el grupo, así que no se resucita un envío ya decidido.
3. Un aviso **sin grupo** —el de equipo nuevo— tampoco la levanta.
4. La bandera de la pregunta anidada existe y arranca apagada.

**Cae contra la base por OCHO condiciones.**

⚠️ **Su acceso a la burbuja va con guarda** (`const bq = BU(); if (bq) bq.click();`): contra el
árbol anterior ese nodo no existe y un acceso pelado tira un `TypeError` que se lleva el caso
entero, dejándolo sin decir por qué cae. Es la lección de TC-827.

---

## TC-972 — Tarea B · el sondeo ocioso

**Qué fija.** Que `CLNK_SONDEO_MS` sea **4000** y que ése sea el período que el temporizador pone
**de verdad** —no sólo el que la constante dice—; que el de la tanda **no** se haya movido; que
`clnkSondeoMs()` siga siendo el dueño único; y que las **tres** condiciones del sondeo sigan en
`clnkSondeoDebe()`.

**Control negativo:** con el módulo apagado el predicado dice **no** y el temporizador se va, y
vuelve al prenderlo.

**Y dos condiciones sobre el texto fuente**, que es lo que la tarea B manda conservar: el chequeo de
`document.hidden` sigue en el rebote de `clnkRefrescar`, y `clnkPanelALaVista` sigue **sin**
mirarlo.

**Cae contra la base por DOS condiciones.**

---

## TC-973 — Tarea C · la ventana de silencio

**Qué fija.** La constante en 20000; que `clnkSilencioCumplido` **falle hacia no cerrar** —sin
fecha, con basura y recién llegado—; que con la escena `silencio` el **puente** diga abierta y la
**app** diga cerrada, que es la única discrepancia que existe; que el cartel salga en su forma final
sin esperar los dos minutos; que `silencioMas` **engorde** el cartel en vez de volver a «están
llegando»; que el pestillo se suelte cuando el puente cierra; y que `clnkGrupoListo` honre la
**misma** ventana.

**Cinco controles negativos del veredicto:** sin tanda, con la tanda cerrada del puente, recién
llegada, vacía y sin fecha.

**Y dos condiciones de que el plazo del puente NO se tocó:** `CLNK_VENTANA_MS` sigue en dos minutos
y las tres funciones del cartel no lo leen.

**Cae contra la base por su denominador declarado** —esas dos funciones no existen allá—.

---

## TC-974 — Tarea D · los botones

**Qué fija.** Con la tanda abierta: título de «llegando», **cinco** botones, los **tres** de
adjuntar con `disabled` **y** la clase **y** `aria-disabled` **y** opacidad < 0,9, y los otros dos
normales. Que un botón apagado **no emita click**. Al cerrar: título de «Llegaron» y los cinco
vivos, sin rastro del aspecto apagado.

**El defecto del médico, reproducido por su camino exacto:** se apagan los botones y se abre
**otra** pregunta encima sin pasar por `_clnkAvisoApagarBotones(false)` — que es lo que hacen
`clnkBurbujaAbrir` y la rama de ACTUALIZAR—. Los botones nuevos tienen que nacer **limpios**.

**Control negativo:** sin el segundo argumento, `_clnkAvisoApagarBotones` los apaga a los cinco, que
es lo que hacía antes.

**Y la vista previa del cartel abierto, de punta a punta:** abre, el sondeo **no le pisa el cuerpo**,
y «Volver a la pregunta» devuelve el cartel **y** la bandera.

⚠️ **ESPERA 300 ms ANTES DE MEDIR LA OPACIDAD, y no es prudencia.** `.btn` declara
`transition: opacity .15s`, así que un `getComputedStyle` inmediato devuelve el valor de **arranque**
—1— y no el de destino. La clase ya estaba puesta y el `cursor` y el `filter` ya eran los nuevos, y
la opacidad daba 1: el caso salía rojo sobre una app que se porta bien.

**Cae contra la base por su denominador declarado.**

---

## TC-975 — Tarea E · los nombres del dato

**Qué fija.** Que los rótulos actuales **no se tocaron**; que la frase del SCP esté y **una sola
vez**; que haya una línea de alias por dato con las tres formas; y que vaya **debajo** del valor, no
encima —se mide por el orden del DOM dentro de la caja—.

**El control que importa:** busca **once** nombres de marca de ecógrafo en el panel y exige **cero**,
porque sólo el VINNO está confirmado. Y exige que diga «puede llamarse».

**Y que el panel siga sin un solo campo para escribir**, con sus botones Copiar intactos.

⚠️ **Abre el plegable `cfg-clnk-det-conexion` antes de medir**: lo que está en `display:none` no
tiene geometría, y el texto de un `details` cerrado no se lee como lo lee el médico.

**Cae contra la base por SIETE condiciones.**

---

## TC-976 — Tarea F · las miniaturas y el borrado de a una

**Qué fija.** Que la sección de la **pestaña Imágenes** dibuje una miniatura por archivo —tres fijas
y un cineloop—, que sean botones con su piso táctil de 44 px y su imagen, y que la fila ofrezca
asignar y borrar. Que el visor traiga **cuatro** botones y que «Borrar esta imagen» vaya **antes**
que «Borrar el envío».

**Que borre UNA y sólo una:** quedan dos fijas y el cineloop intacto. Que el **cineloop** se borre
por su propio campo. Que cuando no queda nada el **registro se vaya**.

⚠️ **Censa TODOS los controles con `id` de la app antes y después y exige que la cadena sea
idéntica**: lo que esta tarea no puede hacer es escribir en un estudio, y eso se **mide** en vez de
prometerse.

**Dos controles negativos del borrado** —sin id y con un envío que no existe— y **uno de la vista
previa**: con el primer parámetro vacío el lightbox **no** ofrece ninguna de las tres acciones del
envío.

**Cae contra la base por su denominador declarado.**

---

## TC-977 — Tarea G · el mensaje de medir

**Qué fija.** Que `CLNKB_MEDIR_MSG` sea, palabra por palabra, «Para medir, asignala a un estudio».
Que la vista previa de una fija lo diga **a la vista** y traiga el botón 📏 Medir apagado pero
**tocable** —`disabled === false` y `aria-disabled === 'true'`—, y que al tocarlo **diga el motivo**,
que es lo que antes no pasaba. Que no abra ningún medidor ni cierre lo que el médico mira. Que la
fija **de la bandeja** diga lo mismo.

**El control positivo, que es el que prueba que la regla no se movió:** un **cineloop** de la
bandeja abre el visor de siempre **con su botón de medir** y **sin** este mensaje.

**Cae contra la base por su denominador declarado.**

---

## Los tres adaptados

| caso | qué cambió | ¿cae contra la base? |
|---|---|---|
| **TC-961** | tres condiciones de cadencia leen `CLNK_SONDEO_MS` en vez del 15000 escrito a mano; **dos INVERTIDAS** por la tarea D: antes exigía que los cinco botones estuvieran apagados, ahora exige que los dos de abajo **no** lo estén | sí, por las dos invertidas |
| **TC-970** | su condición de cadencia, idem | sí |
| **TC-845** | su `(E) el intervalo`, idem | sí |

⚠️ **TC-970 y TC-845 los destapó la corrida y no mi censo**: afirmaban los 15000 con otros nombres
de variable, que es el modo de falla que este archivo ya documenta una decena de veces.
