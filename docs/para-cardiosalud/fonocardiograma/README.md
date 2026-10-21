# Fonocardiograma — módulo retirado de EcoSmart, listo para CardioSalud

Retirado de `ecosmart/index.html` el **2026-10-21** (trabajo B, commit E4). El código **no se
borró**: está completo en `fonocardiograma.html`, tal como estaba en la app.

## Qué es

Una tira de fonocardiograma **esquemática y animada** por válvula y por grado de severidad. Es
**académico**: dibuja el soplo que corresponde a una lesión elegida en un desplegable, para
enseñar a reconocerlo. No mide nada del paciente.

## Qué NO hace — medido antes de retirarlo

- **No guarda ningún campo del estudio.** Sus doce ids llevan guión **medio** (`fcg-badge`,
  `fcg-canvas`, `fcg-valve-select`…), así que el recolector de `guardarInforme` —que exige que
  el id pase `_noEsDelEstudio`— los deja afuera. Verificado con el recolector real: el juego de
  ids del estudio es idéntico con y sin el módulo.
- **No tiene ninguna columna de Excel**: el libro sigue en 440 columnas.
- **No escribe en el informe, en el EN SUMA, en el PDF, en el PPT ni en el Laboratorio.**
- **No usa `localStorage` ni IndexedDB.**

⚠️ **Una salvedad histórica:** hasta el 2026-09-09 `fcg-valve-select` **sí** se colaba entre los
campos guardados (era el único de los 493 que viajaba sin ser del paciente). Por eso el prefijo
`fcg-` **se conserva** en los dos regex de exclusión de EcoSmart: un estudio guardado antes de
esa fecha trae ese valor, y al reabrirlo las rutas de restauración lo recorren.

## Qué contiene el archivo

`fonocardiograma.html` es el bloque autocontenido que estaba en `index.html`, en este orden:

1. El comentario de sección y `<div id="tab-fono" class="tab-section">`.
2. Un `<style>` con **todas** sus reglas prefijadas por `#tab-fono` (no pisa nada de afuera).
3. El marcado: la columna izquierda con el selector de válvula (una grilla de botones en
   escritorio y un `<select>` en móvil), las tres pestañas de severidad y, a la derecha, el
   lienzo de la tira con su encabezado.
4. Un `<script>` con el dibujo y la animación.

## De qué depende

- **Nada externo.** Sin librerías, sin CDN, sin fuentes de red: es `<canvas>` 2D y CSS.
- De EcoSmart usaba **sólo** las variables de color del tema (`--text`, `--text2`, `--border`,
  `--bg2`, `--bg3`) y la clase `.tab-section`, que es la que esconde una pestaña inactiva.
- Exportaba una sola función al resto de la app: `window.fcgOnShow`, que el botón llamaba al
  abrir la pestaña para redibujar la tira. En CardioSalud hay que llamarla igual cuando la
  pantalla se muestre, o el lienzo queda en blanco hasta el primer gesto: un `<canvas>` sin
  geometría —dentro de algo con `display:none`— no se puede dibujar.

## Cómo se integra en CardioSalud

1. Pegar el bloque entero donde vaya la pantalla, con su `<style>` y su `<script>`.
2. Darle una puerta (un botón, una pestaña) que muestre `#tab-fono` y, **después de mostrarlo**,
   llame a `window.fcgOnShow()`.
3. Comprobar que esas cinco variables de color existan en el tema de CardioSalud; si alguna
   falta, el valor cae al heredado y el dibujo se ve apagado. **Medirlo en los dos temas.**
4. El id `tab-fono` y el prefijo `fcg-` se pueden renombrar sin tocar nada más: ninguna otra
   parte de la app los nombra.
