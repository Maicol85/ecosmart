# Punteros de los casos de PANT-29 (2026-11-10)

Sacado de `docs/mapa/tests-punteros-tandas.md`, que cruzó los 35 KB al recibirlo. Medido antes
de escribir, que es la regla de la casa: ese archivo estaba en 32,6 KB y el bloque lo llevaba a
35,5.


**TC-778 a TC-783 REESCRITOS y TC-784 a TC-786 nuevos.** Los seis de PANT-28 afirmaban las tres
fichas grandes que esta tanda quitó, así que se reescribieron sobre lo que las reemplaza y
**conservan su número**, con el motivo en cada encabezado. La suite pasa de **798 a 801**.

| caso | qué fija |
|---|---|
| TC-778 | los dos resúmenes de miocardiopatías, su molde, su techo, su **visibilidad** y las dos fichas grandes ausentes de los cuatro lugares |
| TC-779 | la ficha de coronarias ampliada, lo que conserva, y el globo `otr-rac` en 478 por el clon y 494 en pantalla |
| TC-780 | las 24 cifras contra sus filas de control, con control negativo de una cifra sin fila |
| TC-781 | el relleno de `7px 9px`, la regla de `220/150/1fr` y los tres bloques de la fila en orden |
| TC-782 | las cinco formas del bloque de arterias, el texto de hallazgos intacto y que no llega al papel |
| TC-783 | «Coronarias» por el **hash del canvas**, las siete letras, el panel de tres filas, los 44 px y el reinicio |
| TC-784 | la dominancia con sus tres dueños, las seis vistas y los dos gestos que sueltan la vista |
| TC-785 | las arterias pegadas en cuatro fases, el tramo gris por nivel y los puntos en su territorio |
| TC-786 | nada se guarda, el Excel en 457 y el papel idéntico con «Coronarias» prendido |

**Adaptados, con el motivo escrito:** TC-502, TC-509, TC-761, TC-763, TC-563 y TC-490. Los tres
últimos quedaron **invertidos**, y en los tres es el día que su propia excepción anunciaba.

### Tres trampas que esta tanda pagó en los casos

1. ⚠️ **El acento grave dentro de MIS PROPIOS comentarios**, por decimoséptima tanda seguida: el
   cuerpo de un caso es un template literal y los backticks de los nombres de id cerraban la
   cadena. El script de parcheo ahora **aborta** si el reemplazo trae uno.
2. ⚠️ **El canvas guarda el último fotograma que alcanzó a dibujar el bucle, y el oyente de la
   fase NO repinta.** Comparar dos lecturas sin repintar comparaba cuadros de dos momentos, y
   TC-783 acusaba una diferencia que no existía. Hoy **cada lectura repinta primero**.
3. ⚠️ **`textContent` no ve un `display:none`.** Un resumen oculto daba todas las condiciones de
   texto en verde y el médico no leía nada: lo destapó la **mutación 01** del barrido, que le pone
   `display:none` al título. Nacieron (C7) de TC-778 y (B1b) de TC-779.

### Y una cosa que el caso encontró en la app

**TC-783 (A3) destapó un defecto real**: el trazo de las arterias dejaba `lineJoin` en `round` y
el contexto del canvas es el **mismo** entre cuadros, así que el repaso de contorno de los 1.440
cuadros de la malla quedaba cambiado **para siempre** —con «Coronarias» apagado el dibujo ya no
volvía al píxel exacto—. Una comparación de estructura no lo habría visto: no mueve un solo
polígono.

Las fichas de los nueve casos están en **`docs/mapa/pant29-coronarias-3d.md`** § 5.
