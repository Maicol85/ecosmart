<!-- Ficha del caso TC-556. Archivo propio: `tests-fichas.md` está en 34,2 KB. -->

# TC-556 — la tanda D2 (cardio-oncología)

**Qué fija**, en cinco bloques, cada uno con su denominador y sus controles negativos:

| Bloque | Qué fija |
|---|---|
| **A** | la calculadora **sin fármaco**: el mensaje, ninguna banda, ninguna derivación, las casillas disponibles, y que nada de eso llega al papel |
| **B** | las **seis columnas** de la Tabla 4, con un caso medido por fármaco y la casilla de antecedente coronario tomando el mayor de sus tres filas |
| **C** | las tablas **A y C** de HFA-ICOS coincidiendo celda por celda con `coT4Pesos()`, y la B sin tocar |
| **D** | el **monitoreo** de inmunoterapia y anti-VEGF en sus tres copias, y el globo con sus dos folios |
| **E / F** | un estudio **sin** cardio-oncología no se mueve, y el Excel sigue en **440** columnas |

**Cae contra HEAD por 26 condiciones y NINGUNA por excepción.** Las que pasan en los dos árboles
son los denominadores (A0, B0, C0, D0, D2, D6a, E0) y los controles negativos (A2, A5, B8, B9,
C4, D6, E1, E2, F1).

## Las dos condiciones que nacieron del barrido de mutaciones

- **(A1d)** le pregunta al **dueño**, no sólo a los pintores: `hfaicosEstado().derivacion` y
  `.seguimiento` vacíos sin fármaco. Sin ella, apagar la derivación en el dueño es **redundante**
  con las salidas tempranas de los dos pintores y la mutación 05 **sobrevive**. El contrato del
  dueño es que no publique una conducta por categoría cuando no hay categoría, y cualquier
  consumidor futuro lo lee de ahí.
- **(D6a)** es el denominador que le faltaba a (D6): el módulo **se integra** antes de medir. Sin
  integrarlo, nada de cardio-oncología baja al informe y «el calendario no está» se cumple sobre
  un informe que no tiene el módulo — un control que no puede fallar. Lo destapó la mutación 15.

## Trampas de método que este caso paga por adelantado

- **No se llama a `calcHFAICOS` ni a `calcCardioOnco` a mano.** Las casillas se tildan y se
  despacha `hfaicosToggle`, que es el gesto real. Llamar al calculador fabrica el disparador que
  la app no tiene y tapa el defecto: lo pagó TC-519 y lo volvió a pagar la tanda D con su 1f.
- **El estilo de informe es estado de sesión** y el caso lo fija antes de cada lectura (TC-547).
- **Abrir la pestaña no le da caja a la tarjeta.** «Referencia rápida» es un acordeón cerrado y
  adentro todo informa 0×0; se abre por su botón real.
- **La tarjeta de un globo es `position:fixed`**, así que su `offsetParent` es **null** aunque
  esté abierta: se pregunta por `display`. Esta trampa costó cuatro mediciones en esta tanda.
- ⚠️ **El acento grave dentro de MI comentario rompe el template, y `check_backticks.py` no lo
  caza.** Pasó **dos veces** escribiendo este caso, las dos con un identificador entre acentos
  graves dentro de un comentario del cuerpo. Lo que sirve es **`node --check`**.
- ⚠️ **El caso tiene que ir ANTES del runner.** `CASOS` se consume en el bloque que arranca
  Chrome, que no está al final del archivo: un `caso(...)` agregado después del `let servidor,
  chrome;` se registra cuando ya nadie lo lee, y la suite imprime **0/0 sin regresiones**.
- ⚠️ **El cuerpo devuelve `{ extra: ex }`, no `ex`.** Con `ex` a secas el arnés dice «el caso no
  declara NINGUNA condición».

## Las quince mutaciones

`scripts/_mut_d2.py`, **15/15 muertas** tras cerrar las dos de arriba, en worktree y nunca sobre
el árbol vivo, con guarda de md5 antes y después. **Tres no revierten nada: la aplican de más**
—la 03 deja que el mensaje de pantalla se cuele a lo que lee el papel, la 15 mete el calendario
de monitoreo en el informe firmado y la 12 hace que la matriz deje de salir del dueño—, porque
las condiciones que las matan son **controles negativos**. **La 06 y la 07 son el mismo error por
dos puertas** —un peso único para las seis columnas, y sólo la celda de anti-VEGF— y van
separadas porque cada una sobrevive si la otra la tapa.
