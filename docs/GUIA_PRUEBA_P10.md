# Guía de prueba manual — P10 (la escala de velocidad de un Doppler espectral)

Para probar en la **Mac** y en **Windows**. Pasos cortos. **Pacientes inventados**: no uses un
estudio real para esto.

**Qué cambió, en una línea:** EcoSmart leía mal dónde está la línea de **cero velocidad** de un
trazo Doppler, así que toda velocidad salía corrida. Eso está arreglado, y además ahora la app
avisa cuando la escala no se pudo leer bien y deja ponerla a mano con un cuadro propio.

---

## Antes de empezar

1. Abrí `index.html` en Chrome.
2. Entrá a **Imágenes** y abrí cualquier imagen de Doppler espectral (PW o CW) en el visor.
3. Tocá **📏 Medir**.

---

## 1 · Medir un PW con la escala buena (el caso que estaba roto)

1. Elegí un **PW del tracto de salida del VI** (apical 5 cámaras).
2. En la barra del visor, elegí la herramienta **📐 VTI**.
3. Mirá el renglón de arriba del panel: tiene que decir **«Escala de velocidad tomada del
   archivo: … cm/s por píxel»**.
4. Mantené apretado y recorré la envolvente de **UN SOLO LATIDO**, de la base al pico y de vuelta
   a la base. Soltá.
5. **Lo que tiene que salir:** un **VTI de unos 15 a 25 cm**, una **Vmax de 0,7 a 1,3 m/s** y
   **250 a 400 ms**.
6. En la fila, al final, tiene que decir **«· escala del archivo»**.

⚠️ **Si el VTI sale arriba de 100 cm o la Vmax arriba de 3 m/s en un TSVI, algo sigue mal: sacale
una foto a la pantalla y guardá el archivo DICOM.** Ese era exactamente el defecto: con el VINNO
daba **136,7 cm y 5,06 m/s** donde el ecógrafo decía **21,66 cm**.

7. Compará el VTI con el que calculó el ecógrafo en la misma imagen. **Tienen que parecerse.**

---

## 2 · Medir una velocidad suelta

1. Elegí la herramienta **⚡ Velocidad**.
2. Tocá el **pico** de la envolvente.
3. Sale la velocidad en **m/s** con su flecha (↑ se acerca, ↓ se aleja) y el gradiente en
   **mmHg**.
4. Mirá la **línea punteada** que va desde la marca hasta la base: **tiene que terminar en la
   línea de cero del trazo**, la que el ecógrafo dibuja. Si termina en otro lado, avisame.

---

## 3 · Una imagen sin escala

1. Abrí una imagen **que no sea DICOM** —una foto de la pantalla del ecógrafo, o una imagen
   pegada— o un DICOM viejo sin regiones.
2. Elegí **⚡ Velocidad**. La app tiene que entrar **sola** en modo calibrar y el renglón decir
   **«Esta imagen no trae escala de velocidad: marcá dos puntos del eje y escribí su valor.»**
3. Elegí **📐 VTI** y trazá una envolvente. **Tiene que RECHAZARLO** diciendo que falta la escala
   de **tiempo**, y que ésa **no se puede calibrar a mano**: la tiene que traer el archivo.

---

## 4 · La calibración manual de velocidad (lo nuevo)

1. Con la imagen sin escala, elegí **⚡ Velocidad** (o, sobre una con escala, tocá
   **«Calibrar vel.»**).
2. Tocá **un punto cualquiera de la regla de velocidad** de la imagen.
3. **Tiene que salir un cuadro de EcoSmart** —no el cuadrito gris del navegador— que dice
   **«Escala de velocidad»** y pregunta cuánto vale esa marca.
   - El campo arranca **vacío**.
   - El botón **«Usar este valor» arranca apagado** hasta que escribas un número.
   - Al lado del campo hay un **selector de unidad: m/s o cm/s**.
4. Escribí **0** (si marcaste la línea de base) y aceptá.
5. Tocá **otro punto** de la regla, por ejemplo donde dice **1 m/s**, y escribí **1.0** con la
   unidad en **m/s**.
6. Abajo tiene que aparecer **«Escala de velocidad calibrada a mano: … cm/s por píxel, con el
   cero en y=…»** y una **línea rotulada «0»** dibujada sobre la imagen.
7. **Probá la unidad:** volvé a calibrar y poné los mismos dos puntos con **0** y **100 cm/s**
   (seleccionando **cm/s**). **Tiene que dar la misma escala** que 0 y 1,0 m/s.
8. Medí una velocidad: el número tiene que ser coherente con la regla que marcaste.
9. Trazá un VTI: en la fila tiene que decir **«· escala vel. a mano»**.

### Lo que NO tiene que pasar
- **No** tiene que aparecer ningún cuadro gris del navegador.
- Si marcás los dos puntos **casi a la misma altura**, sale un cartel de EcoSmart que dice que
  los separes — y **el primer valor no se vuelve a pedir**.
- Si escribís **el mismo valor** en las dos marcas, sale otro cartel y no calibra.

---

## 5 · El aviso de «escala dudosa»

Esto es difícil de provocar a mano y **sobre los archivos buenos no sale nunca** — es a propósito.
Sale cuando el archivo dice que el cero de velocidad está **fuera del recuadro del trazo**.

Si alguna vez lo ves:
1. Sale un cartel de EcoSmart que dice **«La escala de velocidad de esta imagen no se pudo leer
   bien; el valor puede no ser confiable.»**
2. Tiene dos botones: **«Calibrar a mano»** y **«Entendido»**.
3. La medición **igual queda guardada**, con la marca **«· ⚠️ escala dudosa»** en su fila.
4. El cartel sale **una sola vez por imagen**.

---

## 6 · Antes de cargar al informe

1. Asigná dos envolventes a **TSVI** y **TSVD** y cargá los diámetros.
2. Si alguna de las dos se midió con la escala **a mano** o con una escala **dudosa**, arriba del
   botón **«→ Cargar los VTI en el informe»** tiene que salir un renglón naranja diciéndolo.
3. Eso es lo último que avisa: después el VTI es un número en un campo.

---

## 7 · Lo que hay que saber, y no está hecho

- **La calibración manual NO se guarda con el estudio.** Vive mientras esa imagen está abierta en
  el visor; al cambiar de imagen o cerrar, se pierde. Si reabrís el estudio hay que volver a
  calibrar. Está declarado en `docs/PENDIENTES.md` → **P10-b**, con las tres opciones y lo que
  cuesta cada una. **La decisión es tuya.**
- **El eje del TIEMPO no se puede calibrar a mano.** Lo tiene que traer el archivo. Sin él no sale
  un VTI aunque la velocidad esté calibrada.
- **No hay guarda de duración del trazo.** Si recorrés varios latidos, el VTI suma todos y la app
  no lo dice. Está declarado en **P8-a** y es un corte clínico que decidís vos.

---

## En Windows

Los mismos siete pasos. Lo único que conviene mirar aparte:

1. Que el **cuadro de calibración** se vea entero y que el **selector de unidad** se abra bien.
2. Que el **teclado numérico** escriba el punto o la coma: la app acepta **las dos** (`1.5` y `1,5`).
3. Que **Escape** cierre el cuadro sin cerrar el visor, y que el visor siga con la medición a
   medio hacer.
