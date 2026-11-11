# Fichas de los casos TC-825 a TC-831 (tanda PANT-37, 2026-11-11)

Archivo propio: `tests-fichas-821.md` está en 4,6 KB y `tests-punteros-tandas.md` en 20,9 KB,
pero la regla de esta casa es que la ficha de una tanda nueva nace en su archivo y no engorda el
anterior. Medido con `wc -c` **antes** de escribir.

Los **siete caen contra `f1412a2`** —el cierre de PANT-36— **por sus condiciones y NINGUNA por
excepción**, verificado en un worktree con el **mismo** archivo de casos y sólo el `index.html`
distinto.

⚠️ **ESO COSTÓ REESCRIBIR TODOS LOS ACCESOS.** Contra el árbol anterior el panel, sus controles y
las cuatro funciones del módulo **no existen**, y un acceso pelado tira `TypeError` **antes** de
medir nada: el caso caería por **excepción** en vez de por sus condiciones. Hoy todo va por un
ayudante con guarda —`CLIC`, `TXT`, `VAL`, `CLS`, `OCU`, `DIS`, `SET`, `QS`, `HIJOS`— y las cinco
funciones del módulo por un centinela que devuelve una **forma vacía** y no `null`: un `null` se
vuelve a desreferenciar dos líneas más abajo y el caso cae por excepción igual. Es la lección que
TC-822 dejó escrita en PANT-36.

⚠️ **Y NO ALCANZÓ CON ESCRIBIRLO: HUBO QUE MEDIRLO AL FINAL, CON EL ARCHIVO DE CASOS FINAL.**
La corrida contra la línea base que tenía guardada era de una versión anterior del archivo, y
**TC-827 todavía caía por excepción**: le quedaban **tres** accesos fuera de los ayudantes —el
deslizador de volumen leído para sacarle su `min` y su `max`, el **padre** del campo supuesto y
la **tarjeta** del globo—. Y **una excepción tapa a la siguiente**: cada arreglo destapaba el
próximo, con el mismo síntoma —cero condiciones, una excepción— las tres veces. Lo que los
cerró fue **barrer el bloque entero de los siete casos por patrón**, y no perseguirlos de a uno.

---

## La escena común

Área de **0,80 cm²** por continuidad —TSVI de 20 mm, VTI de 20 cm y VTI aórtico de 78,5—, Vmax
**3,2 m/s**, gradiente medio **25 mmHg**, VDF **120 mL** y FEVI **45 %**, o sea volumen latido de
**54 mL**, con FC de 65 lpm y tiempo de eyección de 300 ms. **Datos ficticios.**

⚠️ **`ava_cont` ES READONLY** —lo calcula la continuidad—, así que se siembran sus **tres**
insumos y no el área.
⚠️ **LA PASTILLA SE PRENDE DESPUÉS DE SEMBRAR Y DESPUÉS DE ESPERAR.** `limpiarCampos` pasa por el
embudo de restauración y `cargarValvPills` repone las pastillas con su propio retardo: una
pastilla prendida dentro de esa ventana **se apaga sola** y la escena queda sin tarjeta — que se
lee igual que «el botón no se agregó». Costó tres corridas.
⚠️ **Y SIN `showTab('valvulas')` DELANTE EL PANEL 2D NO TIENE CAJA**: todo mide 0×0.

---

## TC-825 — el botón y las cuatro situaciones

**Qué afirma.** Que el botón vive **dentro del `<li>` de la estenosis aórtica**, que su fila es el
**último hijo** y queda a menos de 60 px del borde derecho, que mide **44 px o más** de alto y que
lleva su ⓘ al lado; y las cuatro situaciones con su veredicto: **discordante** (área severa con
Vmax y gradiente por debajo del rango severo) → **azul**; **concordante** → sin azul;
**faltan datos** → la lista exacta `G. medio | Volumen latido (VSFVI o FEVI) | VDFVI`, con el
botón igual de activo; **prótesis** → sin azul.

**Denominador.** (A1) exige que la tarjeta aórtica **exista** y no sea la línea gris «Sin
estenosis consignadas»: sin eso, contar botones da cero y parece que nada se agregó.

**Control negativo.** (A12) y (A13): con la estenosis **mitral** y la insuficiencia **aórtica**
también prendidas, **cero** botones en la columna de insuficiencias y **cero** en las otras
tarjetas de estenosis — y (A12) confirma antes que esas tarjetas existen.

---

## TC-826 — el globo, palabra por palabra

**Qué afirma.** Siete párrafos con el texto **exacto** de la orden, comparados carácter por
carácter; el título «Cuándo aplica el What if» en un `h4` con **`id="vinfo-tit"`**, que es lo que
la tarjeta nombra en su `aria-labelledby`; que **ningún párrafo declara su propio tamaño** —todos
en el de la tarjeta, 11 px—; **cero** elementos inyectados; la tarjeta entera dentro de la
pantalla; y que no nombra ninguna guía, clase ni folio.

**Denominador.** (B0) exige que el botón del globo **tenga geometría**: dentro de un cajón cerrado
mide 0×0, `_vInfoColocar` devuelve `null` y la cuenta sale sobre una tarjeta que no se abrió.

---

## TC-827 — el panel, su lugar y sus límites

**Qué afirma.** Que nace **debajo** de la tarjeta (a menos de 20 px, medido **sin** el acote) y
que **no tapa el dibujo ni un píxel**; la primera línea de **cada** situación con su texto exacto;
los valores iniciales **iguales a lo medido**; el modo por omisión **FEVI** porque la aplicación
dice que está reducida; el **tope** del volumen sistólico en VDF − 2; el pie exacto; los **siete**
controles **apagados** cuando faltan datos, sin tabla de rayas ni gráfica vacía; y los dos
**supuestos**, que aparecen sólo si el estudio no trae el dato, mueven el flujo al editarlos y
**no escriben el campo del estudio**, que sigue vacío — y que si el estudio trae el dato, el campo
supuesto desaparece y manda el del estudio.

⚠️ **(C4) ESTÁ PARTIDA EN DOS RAMAS Y SE DECLARA.** A 768 px o menos el panel es **estático** y va
en el flujo: ahí lo que desplaza es la página y no hay nada que acotar. La ventana del suite no se
puede redimensionar, así que la condición mide lo que el navegador resolvió: flotante → entra
entero en la pantalla; estático → no desborda a lo ancho.

---

## TC-828 — la ley del cuadrado y la tabla

**Qué afirma.** Que al duplicar el volumen sistólico el flujo se duplica **exacto**, el gradiente
se **cuadruplica** exacto y la Vmax se **duplica** exacta, con el área, el área indexada y el DVI
sin moverse; la tabla con sus **seis filas** en su orden y sus números; que cada fila lleva su
«antes» y su «después» **en colores distintos**; y la línea de lectura con el corte **leído de
`EA_BANDAS.gmedSevMin`**, no escrito a mano.

**Lo que separa esta tanda de una que confunda flujo con gasto cardíaco.** (D10) y (D11): mover la
frecuencia a 110 lpm **no mueve el flujo ni el gradiente** —el flujo es el de la eyección— pero
**sí** mueve la línea de lectura, que es la única que pasa a L/min.

**Denominador.** (D8) exige que el corte viva en `EA_BANDAS` y valga 40 antes de afirmar que la
frase lo nombra.

---

## TC-829 — el dibujo y sus tres restituciones

**Qué afirma.** Que con el panel abierto y **nada movido** el dibujo es **idéntico** al real; que
con la simulación **cambia** y publica la Vmax como rótulo; y que **cerrar con la ✕**, **«Volver a
lo medido»** y **«Nuevo estudio»** lo devuelven, los tres.

⚠️ **EL DIBUJO SE COMPARA SIEMPRE EN LA MISMA FASE** (`v2dFase(0.25)`): con el latido corriendo,
dos lecturas seguidas difieren aunque nada haya cambiado, y el caso daría rojo contra sí mismo.

**Control.** (E5): con la simulación al máximo, las tarjetas, la tabla de cavidades, los **ocho**
campos y los **siete** valores de `eaGradoCalculado()` —grado, los tres criterios y los tres
números— **idénticos**.

---

## TC-830 — el área que se abre, y la fórmula probada sola

**Qué afirma.** La ley lineal **como función pura**, con el par publicado de la guía europea de
eco de estrés: área **0,79 → 1,22 cm²** con flujo **183 → 370 mL/s** implica una pendiente de
**0,23** cm² por cada 100 mL/s y un área proyectada a 250 mL/s de **0,94 cm²**. (F3) comprueba que
la misma función **reproduce el par de origen** y (F4) sus **dos topes** (0,15 y 2,50).

**Y en el panel.** Que por omisión el área es **fija**, sin deslizador, sin nota y sin tercera
gráfica; que «Se abre» los trae con el deslizador en **0,40** y la nota exacta; que las **tres**
gráficas ganan su punteada de referencia (1/1/1 contra 0/0/0); que con el flujo duplicado el área
sube a 1,52 y el gradiente **apenas** va a 28 —la firma de la pseudoestenosis—; las **dos** formas
de la línea de lectura con el corte leído de `AVA_SEVERA_MAX`; y que volver a «Fija» devuelve las
fórmulas de B4 **sobre la misma escena** (×4 y ×2) y apaga la fila de 250, la gráfica, el
deslizador y la nota. (F15): «Volver a lo medido» devuelve además el modo Fija y la apertura.

---

## TC-831 — nada llega al papel ni al estudio

**Qué afirma.** Que los **cinco** controles del panel existen y **ninguno** entra en el censo de
campos del estudio; que los cinco dan `true` en las **dos** listas de exclusión; que ningún id del
panel termina en `-aviso` ni en `-badge`; que el Excel sigue en **457** columnas y ninguna se
llama como un control del panel; y que **con el panel abierto y simulando al máximo**, con el área
que se abre encendida, el informe y el EN SUMA son **idénticos** y no contienen ninguna de las
seis palabras del simulador.

**Denominador.** (G0) exige que el censo encuentre más de 900 campos y (G7) que el informe se haya
generado y nombre la estenosis aórtica: sin eso, «no aparece ninguna palabra» sería cierto sobre
un informe vacío.
