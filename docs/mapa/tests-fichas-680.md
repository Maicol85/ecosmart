# Fichas de los casos TC-680 a TC-685 (tanda PANT-12)

> Archivo propio: `tests-fichas.md` está en **34,2 KB**, a menos de 1 KB del techo, y la regla de
> la casa dice medir ANTES de escribir.

Los seis **caen contra HEAD por 108 condiciones y NINGUNA por excepción**, verificado en un
worktree sobre `9c5ab8f` con el mismo archivo de casos, alternando sólo `index.html`.

---

## TC-680 — el error de tiempo del motor 3D

Fija las **tres guardas** del reloj en los **dos** motores —el del corazón maestro y el de la
transposición— y que el parámetro de la curva no se evalúe fuera de rango.

- **(A1)** es el denominador: el bloque del motor se pudo acotar por sus marcas.
- **(A2)-(A5)** las tres guardas: el tiempo acotado por abajo en cero, el **doble módulo**, el
  parámetro acotado antes de evaluar la curva, y el reloj puesto en hora justo antes del bucle.
- **(B1)** es el control de la medición: la curva evalúa los tres parámetros en rango. Sin él,
  todo lo de arriba podría estar midiendo sobre una curva que no existe.
- **(C1)-(C3)** son el **control negativo**: el motor de la transposición tiene las mismas
  guardas, así que romper uno solo no pasa desapercibido.

⚠️ **El caso no «arregla» nada: documenta que el árbol ya está bien.** El detalle de por qué está
en `docs/INVENTARIO_CORAZON_MAESTRO.md` § 6.

---

## TC-681 — la casilla de la cava superior izquierda persistente

- **(A1)-(A4)** el campo: guión BAJO (es del estudio), **sin** caja de detalle, en el registro
  **justo después** del seno coronario, y con `suma: null`.
- **(B1)-(B2)** el emisor, con un estudio como fuente —que es el camino del PDF y del PPT— y su
  control negativo.
- **(C1)-(C3)** el papel: el **control negativo** primero (apagada, cero apariciones en los tres
  estilos), después la frase **una** vez en los tres, y el EN SUMA **idéntico**.
- **(D1)-(D2)** «Nuevo estudio» la apaga y el barrido de restauración la repone, con la **misma
  regla** del barrido real.
- **(E1)-(E3)** el Excel: 441 columnas y ninguna es la casilla.

⚠️ **El accesor de la casilla lleva guarda**: contra HEAD el elemento no existe, y un acceso
directo mata el caso con un `TypeError` que no dice qué invariante se rompió.

---

## TC-682 — el motor modular

- **(A1c)** y **(A2b)** nacieron de una mutación que sobrevivió: el caso **no abría el panel**,
  así que «el recuadro de la transposición no está prestado» no podía fallar —con el panel
  cerrado está en su sitio pase lo que pase—.
- **(B1)-(B3)** las **tres** listas paralelas, una condición cada una, y **(B4)** el control
  negativo: la casilla del commit 3, que SÍ es del estudio, no está en ninguna.
- **(C1)-(C5)** el modelo: las cuatro anatomías y las nueve lesiones cambian la escena, y
  Eisenmenger **invierte el color** de la corriente y dilata la arteria pulmonar.
- **(D1)-(D5)** las reglas de compatibilidad y **(D6)** su control negativo.
- **(E1)** lo didáctico no escribe un campo, con **(E0)** como denominador.

⚠️ **Los accesores del escenario llevan guarda** (`FL`, `AR`): contra HEAD `cmEscena` no existe y
`esc()` devuelve `null`.

---

## TC-683 — los dos modos, la tabla lateral y el globo

- **(A3b)** se mide **antes del primer clic del caso**, y nació de una mutación que sobrevivió:
  el oyente que cierra el globo con un clic afuera lo deja cerrado en cuanto el caso toca
  cualquier cosa, así que un panel nacido **abierto** se ve cerrado un instante después.
- **(A4)-(A5)** el denominador que faltaba: el panel tiene que **abrirse** o los controles no
  están cableados y todos los contadores dan cero.
- **(A6)-(A9)** el estado inicial: el modo «Según el estudio», los controles y la tabla ocultos.
- **(B1)-(B9)** «Explorar»: 5 + 10 + 6 botones y las 21 filas de la tabla, todas con su línea.
- **(C1)-(C3)** tocar una fila la aplica y la incompatible queda apagada con su motivo;
  **(C4)** es el control negativo sobre el corazón normal.
- **(D1)-(D3)** lo elegido en «Explorar» **no sobrevive** al cambio de modo.
- **(E5)-(E7)** las tres vías de cierre del globo, con **(E7a)** como denominador de la de
  Escape: sin él, «Escape lo cerró» pasa en verde sobre un panel que ya estaba cerrado.

---

## TC-684 — los textos verificados contra las guías

- **(A1)-(A3)** las **dos frases que no pueden entrar a la app**: «A verificar por Code» —que la
  demo trae en cuatro de sus seis combinaciones— y «Los textos son de ejemplo».
- **(B)** diecinueve textos, cada uno con las palabras que su fuente usa.
  ⚠️ **El ancla de la supravalvular aórtica es la frase ENTERA**: «ostium coronarios» aparece
  **dos** veces en ese texto, así que cambiar la primera dejaba la condición pasando en verde.
  Lo destapó una mutación que sobrevivió.
- **(C1)-(C3)** lo que se sacó por no tener respaldo.
- **(D1)-(D3)** las combinaciones: cuatro con hoja y folio, dos rotuladas de ejemplo.
- **(E1)-(E2)** la tabla lateral tampoco afirma lo que no tiene fuente.

---

## TC-685 — «Según el estudio»

- **(A1)-(A2)** el estudio vacío.
- **(B)** once escenas, una por módulo, con el **gesto real** sobre su pestaña.
- **(C1)-(C2)** la CIA de seno venoso asociada sale del **dato** y no del espejo, con su control
  negativo. ⚠️ `cvpa_cia_ro` publica «Sin CIA consignada» cuando NO hay ninguna.
- **(D1)-(D3)** la dirección del cortocircuito, con **(D3)** como control negativo:
  «bidireccional» **no** se fuerza.
- **(E1)-(E4)** lo que no tiene variante se **declara**, no se inventa.
- **(F1)-(F2)** la transposición tiene su propia frase y **no** cae en «no dibujadas».
- **(G1)** sólo lee, con **(G2)** como denominador: había más de 500 campos que mover.
- **(H1)-(H2)** el repintador está en los **dos** registros del embudo.
