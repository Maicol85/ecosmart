# Ficha de TC-553 — la TANDA CORRECCIONES (2026-10-30)

**64 condiciones.** Cae contra HEAD por **35** de las 59 que tenía al escribirse, ninguna por
excepción. Archivo propio porque `tests-fichas.md` ya estaba en 34,2 KB.

⚠️ **CINCO de esas condiciones nacieron de mutaciones que sobrevivieron**, y están marcadas abajo.

## Los siete bloques

| bloque | commit | qué fija |
|---|---|---|
| **(A)** A0-A10 | 1 | la oración de la orejuela con mayúscula y sujeto, sin veredicto; el trombo dicho **una** vez por sección; la compuerta propia del párrafo; el gate de los lóbulos intacto; el hecho con Meier 2014 en la Evidencia |
| **(B)** B0-B12 | 2 | **una** constante en 75 con operador estricto; los bordes 74/75/76; las **tres** formas de la frase; los **tres** controles negativos del gradiente subestimado; la categoría de probabilidad de HTP sin cambio |
| **(C)** C0-C7 | 3 | tres columnas de **seis**; el orden exacto de cada una; sin fila 7; el orden del marcado = el visual; el VD/VI y su selector en una fila |
| **(D)** D0-D6 | 4 | la lectura de la raíz **sin escribirla**; elegir el síndrome no copia nada; el gesto del médico gana; el mensaje de Turner nombrando lo que falta |
| **(E)** E0-E4 | 5 | Config **apagado** y estudio **sin guardar**; el control negativo de no haber apretado; el interruptor y su color |
| **(F)** F0-F9 | 6 | aurícula izquierda, VPSI como elipse, **sin** el triángulo del VI, dos capas de silueta, el trombo **dentro** de la caja de la orejuela, «Manga de viento» con el valor `veleta` intacto |
| **(G)** G0-G2 | — | un estudio **ajeno** no nombra nada de esta tanda y no lleva veredicto |

## Los seis denominadores

**(A0)** el informe publica la línea de las medidas · **(A9)** el panel de Evidencia está pintado
· **(B0)** hay una sola constante y vale 75 · **(B11)** la tabla de probabilidad está despierta ·
**(C0)** la grilla tiene sus dieciocho campos · **(C6)** los dos controles de VD/VI tienen caja ·
**(D0)** el nodo de la lectura existe · **(D4)** con Turner el bloque del índice se muestra ·
**(E0)** Config apagado, estudio sin guardar y el dibujo existe · **(F0)**, **(F4)** y **(F6)** ·
**(G0)** el estudio ajeno emite informe y EN SUMA.

## Las cinco condiciones que nacieron del barrido de mutaciones

| condición | la mutación que sobrevivía | por qué sobrevivía |
|---|---|---|
| **(B10b)** la FAC sola alcanza | **M10**: `vdDisfPresente` pierde la FAC y el índice de Tei | todas las escenas del gradiente subestimado hacen disfuncionante al VD con **TAPSE y onda S′**, así que los otros dos parámetros tapaban al que se mutaba. Son **cinco** y hay que ejercitarlos de a uno |
| **(B10c)** el índice de Tei solo alcanza | ídem | ídem |
| **(B10d)** control negativo: sin ningún parámetro de función no alcanza | ídem | sin él, (B10b) y (B10c) no distinguirían «alcanza» de «siempre» |
| **(F6b)** denominador: el receso está calculado | **M22**: el trombo vuelve a la punta | — |
| **(F7)** reescrita: el trombo **en su receso** | **M22** y **M23** | ver abajo |

### (F7) tuvo que reescribirse TRES veces, y cada vez por un motivo distinto

1. **Pasaba sobre un denominador vacío.** Sin abrir la pestaña ETE y su sección, *todos* los
   `getBoundingClientRect` daban **0**, y la condición comparaba **ceros contra ceros**: «orejuela
   0,0,0,0 | trombo 0,0,0,0» se lee igual que «el trombo está adentro».
2. **Comparaba dos cosas distintas.** La caja de la orejuela salía de `getBBox` —geometría pura,
   sin el trazo de 2,5 px— y la del trombo de `getBoundingClientRect` —la caja renderizada, con
   su trazo—, así que el trombo «sobresalía» 3 px por aritmética y no por dibujo.
3. **`getBoundingClientRect` IGNORA el `clip-path`.** Con el trombo devuelto a la punta, su caja
   seguía dando los mismos números aunque el recorte se lo comiera. Lo que sí lo mide es
   **`isPointInFill`** sobre las siluetas: dieciséis puntos del borde del trombo, y cuántos caen
   dentro. **En el receso dan 11; en la punta, 4.** El umbral es 9.
4. **Y preguntaba por el DUEÑO en vez de por el DIBUJO.** La versión que usaba `_oaiSpec`
   sobrevivía a M22, porque esa mutación cambia **dónde se dibuja** sin tocar la variable. Hoy lee
   el `transform` del `<path>` emitido.

## Cinco trampas que este caso pagó al escribirse

1. **El estilo de informe es estado de SESIÓN**, y el caso lo fija en cada lectura: un caso
   anterior puede dejarlo en narrativo, donde la frase de la orejuela dice otra cosa. Es lo que
   la tanda AJ9 pagó con TC-547.
2. **Hay que ABRIR la pestaña VD/AD y su acordeón** antes de medir geometría: con la sección
   cerrada los controles informan **0 × 0** y las condiciones caen sobre un denominador vacío.
   Es la trampa de `showTab` que este repositorio documenta desde la tanda E.
3. **El `clipPath` del trombo lleva una copia de cada silueta.** Contar las capas sobre TODOS los
   paths daba **tres** por trazo en vez de dos, y la condición caía sobre una copia que no se
   dibuja. Se cuentan sólo los que no están dentro de un `<defs>`.
4. **Elegir el síndrome de Marfan NO copia la raíz.** El espejo del G-4 cuelga del `oninput` de
   los dos campos, no de un barrido, así que poner el síndrome después de la raíz no dispara
   ninguna copia — y la lectura sigue mostrándose, que es lo correcto. El control negativo de
   verdad es el **gesto** del médico tecleando en el módulo.
5. **Las barras invertidas van DOBLES.** El cuerpo vive en un template literal, que consume una:
   `/translate\(…\)/` escrito con una sola barra llegó al navegador con los paréntesis como
   **grupos de captura** en vez de literales, no matcheó nunca, y la condición dijo «sin trombo»
   sobre un dibujo que sí lo tiene.
6. **El caso devuelve `{ extra: ex }`**, no el array pelado: el arnés rechaza un caso que no
   declare ninguna condición, y con el array suelto el veredicto es «no declara NINGUNA».
