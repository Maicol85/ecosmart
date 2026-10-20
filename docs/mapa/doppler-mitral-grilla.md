
# Mapa — la GRILLA del bloque «Doppler mitral — función diastólica VI»

**Los dieciséis campos en cuatro columnas · el orden del Tab · la posición explícita · el selector
del S/D pulmonar.**

Armado el 2026-10-13 sobre el commit de cierre de esa tanda. **No guarda números de línea a
propósito**: la línea cambia en cada edición, el nombre de la clase y del `id` no.

Los otros mapas de esta zona: `docs/mapa/diastolica.md` (el dueño de cada guía, las dos
superficies, la BSE y la FA), `docs/mapa/diastolica-complementarios.md` (el S/D y su tabla de
lectura, el LARS, los suplementarios), `docs/mapa/diastolica-ase2016.md` y
`docs/mapa/diastolica-diagrama.md`.

---

## Las cuatro columnas

El contenedor es `div.grid-4.dm-grid`, dentro de `#dop-mitral`. Dieciséis `.fg`, cuatro por
columna, en el orden que pidió el médico el 13/10/2026:

| | columna 1 | columna 2 | columna 3 | columna 4 |
|---|---|---|---|---|
| fila 1 | Onda E `onda_e` (1) | THP mitral `thp` (5) | Dur. onda A mitral `venp_dur_a` (9) | LARS `lars_dop` (13) |
| fila 2 | Onda A `onda_a` (2) | TDE `tde` (6) | Dur. onda Ar pulm. `venp_dur_ar` (10) | Strain de contracción AI `ai_strain_ct_dop` (14) |
| fila 3 | e′ septal `e_sep` (3) | TRIV `triv` (7) | Veloc. Ar pulm. `venp_vel_ar` (11) | VTI mitral de entrada `itv_mitral` (15) |
| fila 4 | e′ lateral `e_lat` (4) | Onda L `onda_l` (8) | S/D pulmonar `venp_sd` (12) | AVm por THP `avm_thp` (16) |

⚠️ **LAS COLUMNAS 2 Y 3 SE INTERCAMBIARON EL 2026-10-20 (tanda Y3f2), Y CADA CAMPO CONSERVÓ SU
FILA.** Antes la 2 era la vena pulmonar y la 3 los tiempos del llenado mitral; hoy los **tiempos**
—que son la continuación natural de las velocidades de la columna 1— van segundos y la **vena
pulmonar** tercera. El Tab sigue el orden nuevo por el **orden del marcado**, sin un solo
`tabindex` (ver abajo), y en celular, donde la grilla colapsa a una columna, el apilado sale en
**ese mismo orden** por construcción: no hay una segunda lista que mantener sincronizada.

El número entre paréntesis es el **orden del Tab**, que es el de las columnas: la 1 entera de
arriba hacia abajo, después la 2, la 3 y la 4.

## Dos mecanismos, y ninguno es un `tabindex`

1. **El orden del MARCADO es el del Tab.** Los dieciséis `.fg` están en el HTML en ese orden por
   columnas, así que el navegador los recorre en ese orden sin ninguna ayuda. **No hay ni un
   `tabindex` en la grilla** —ni positivo ni negativo—, y TC-461 lo exige: con un `tabindex`
   positivo el Tab deja de seguir el orden del documento y pasa a depender de un número que nadie
   mantiene sincronizado con el marcado.
2. **La posición es EXPLICITA.** Cada `.fg` lleva **dos clases**: `dm-cN` (columna) y `dm-rM`
   (fila). Ocho reglas de CSS y no dieciséis:

```css
@media (min-width: 769px) {
  .dm-grid > .dm-c1 { grid-column: 1; }   /* … c2, c3, c4 */
  .dm-grid > .dm-r1 { grid-row: 1; }      /* … r2, r3, r4 */
}
```

⚠️ **POR QUE EXPLICITA Y NO DE FLUJO.** Un `grid-auto-flow: column` sobre cuatro filas daría el
mismo dibujo con cero reglas, pero el flujo **reacomoda**: esconder un campo hace subir a los que
tiene debajo. Medido en HEAD antes de esta tanda: esconder el S/D movía **CUATRO** campos de lugar;
con la posición explícita no se mueve **ninguno** de los otros quince y la grilla sigue en 4×4. La
casilla de un campo que este algoritmo o este ritmo no usa tiene que quedar **vacía**, por la misma
razón por la que el diagrama de la BSE no dibuja la columna de un paso que el paciente no recorrió:
un hueco dice «no se preguntó» y un reacomodo dice «esto es otra grilla».

⚠️ **AL 2026-10-13 NINGUNO DE LOS DIECISEIS SE OCULTA POR ALGORITMO NI POR RITMO**, y está medido:
las seis combinaciones (ASE 2025 / BSE 2024 / ASE/EACVI 2016 × ritmo sinusal / fibrilación
auricular) dan los dieciséis con geometría y el mismo orden de Tab. La posición explícita está para
que el día que uno se oculte, su casilla quede vacía.

## Los puntos de corte

| Ancho | Columnas | Quién lo decide |
|---|---|---|
| ≥ 769 px | **4** (4×4) | las ocho reglas de `.dm-grid`, dentro de `@media (min-width: 769px)` |
| ≤ 768 px | **1** (16×1) | `@media (max-width: 768px) { .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; } }`, que YA existía |

⚠️ **EL CORTE NO ES NUEVO Y NO HAY ETAPA DE DOS COLUMNAS.** `min-width: 769px` es el complemento
exacto del `max-width: 768px` que ya colapsaba `.grid-4`, así que no se agregó un breakpoint ni un
segundo número que haya que mantener sincronizado con `scripts/check_mobile.js`. Apilado en una
columna el orden visual es el del marcado, que ya es el del Tab: **no hace falta ninguna regla de
posición para que coincidan**. Si algún día se agrega una etapa de dos columnas, el orden visual
sigue saliendo gratis mientras las posiciones explícitas queden confinadas a la grilla ancha.

⚠️ **Y LA FILA EXPLICITA TIENE QUE QUEDAR AFUERA DEL CELULAR.** Sin el `@media`, a una columna los
cuatro campos de `dm-r1` caerían en la misma celda.

## Medido

| Qué | Dónde | Resultado |
|---|---|---|
| Tab con **teclas reales**, foco real campo por campo, 6 combinaciones | `scripts/_probe_dopmitral.mjs --solo tab` | los 16 en orden de columnas, idéntico en las 6; 0 campos sin geometría |
| Posiciones con `getBoundingClientRect` a 1200, 900, 390 y 360 px, en los **dos temas** | `--solo pos` | 4×4 arriba de 768 px y 16×1 abajo; 0 superposiciones; 0 desbordes; rótulo a 11 px; orden visual = orden del Tab en las 8 |
| La casilla de un campo oculto | `--solo hueco` | esconder el S/D no mueve a ninguno de los otros 15 (denominador 16), y al restaurarlo el mapa vuelve idéntico |
| Las SIETE sincronías con teclas reales, escribiendo y **borrando** | `--solo sinc` | 0 diferencias; el AVm es de solo lectura y la sonda se niega a mandarle una tecla |
| Informe (3 estilos), EN SUMA (3), Excel 435, PPT, Laboratorio, hash de campos | `--solo superficies` | 0 diferencias en 8 escenas |
| Veredictos del cuadro y de la ventana, 4 lecturas × 4 valores del S/D | `--solo veredictos` | 0 diferencias en 16 escenas |
| Cobertura | **TC-461** | 28 condiciones, 3 denominadores, 4 controles negativos; 11 en rojo contra HEAD en un worktree aparte |

## Trampas

- ⚠️ **EL ARNES DE LA SUITE MIDE EN 756 px**, así que la grilla de cuatro columnas **no está
  renderizada** cuando corre TC-461: por debajo de 769 px es de una sola columna. El caso fija la
  **regla** que produce las cuatro columnas (las ocho declaraciones, leídas del fuente, más la
  casilla de cada campo) y mide el comportamiento a **una** columna; los cuatro anchos los mide la
  sonda, que sí tiene el canal CDP para emular el viewport.
- ⚠️ **UN CASO NO PUEDE MANDAR UN Tab DE VERDAD.** Su cuerpo corre dentro de la página y un
  `KeyboardEvent` construido a mano no mueve el foco. TC-461 fija el orden del **documento** —que
  es lo que el Tab recorre sin `tabindex` positivos— y el foco **real** de cada campo, uno por uno,
  con `el.focus()` y `document.activeElement`. Las teclas Tab reales las manda la sonda.
- ⚠️ **EL CAMPO ESPEJO DEL VTI MITRAL ESTA DETRAS DE DOS PUERTAS.** `vtim` vive en Válvulas, dentro
  del cajón «Datos» **y** de la sección plegable de la mitral: la primera corrida de la sonda
  informó «NO SE PUDO» y midió la escena con los dos lados vacíos, o sea un «idéntico» sobre un
  tecleo que nunca ocurrió. Se abre con `showTab('valvulas')` + `toggleEteSeccion('valv-mitral')` +
  `valvDatosTog('caja-insuf-mitral')`, y se comprueba que el campo tiene geometría antes de tipear.
- ⚠️ **CUATRO CELDAS LLEVAN UN DIV DE MARCA «(revisar)» QUE RESERVA 17 px AUNQUE ESTE VACIO** (THP,
  Onda L, LARS y contracción de la AI). Antes del reordenamiento caían en DOS filas y ahora caen en
  las CUATRO, así que el bloque quedó **32 px más alto** a 1200 px (286 contra 254). Las dieciséis
  casillas están ocupadas —no hay celda vacía— y las filas son contiguas con el `gap: 12px` de la
  grilla. No se tocó la marca: `docs/PENDIENTES.md` → G1.
- ⚠️ **UN ROTULO QUE EL MEDICO NOMBRA DISTINTO NO SE RENOMBRA SOLO.** La orden de esta tanda decía
  «VTI mitral anterógrado» y el rótulo dice «VTI mitral de entrada — Doppler pulsado (cm)»; dice
  «Duración de la onda A mitral» y el rótulo dice «Dur. onda A mitral (ms)»; dice «THP mitral» y el
  rótulo dice «THP mitral (ms) — EM». Los tres quedaron **como estaban**: un rótulo es contenido y
  se reporta, no se cambia.

## El selector del S/D pulmonar

Cuatro `<option>`, ninguna oculta y ninguna deshabilitada: el vacío y los tres cortes. La tabla de
lectura, los cinco consumidores y el porqué del tercer estado están en
`docs/mapa/diastolica-complementarios.md` → «El S/D venoso pulmonar».

⚠️ **POR QUE SE FUERON LAS DOS DE LEGADO (2026-10-13).** Decisión del médico —no hay ningún estudio
guardado con el S/D cargado— y porque **Safari las mostraba**: esconder una `<option>` con `hidden`
termina siendo un `display:none` (así lo aplica Chrome, y así se midió), y un desplegable **nativo**
no está obligado a respetar el layout de sus propias opciones. En la captura del médico aparecían
las dos «(estudio anterior)» con el campo vacío. **El chequeo de acá es estructural**: Safari no se
puede probar desde este entorno, así que lo que se verifica es que las dos opciones no existen y que
ninguna de las cuatro que quedan está oculta ni deshabilitada —con el `display` COMPUTADO, no con la
propiedad—. Que en Safari ya no aparezcan lo mira el médico.
