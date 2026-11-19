# Guía de prueba a mano — prompt 5 (2026-11-19)

Doce pasos. Nada de esto toca un cálculo: lo que se mira son textos, el orden de las capas y dos
líneas de navegación.

---

## Punto 1 · La calibración a mano

**1.** Abrí una imagen **fija JPG o PNG** del ecógrafo (o un DICOM sin región de ultrasonido) en
el visor y tocá **📏 Medir**. El panel guía tiene que decir *«Antes de medir, calibrá la escala…
escribí cuántos **milímetros** mide (1 cm = 10 mm)»* — y **no** «centímetros».

**2.** Con la herramienta **Distancia**, tocá **Medir** sin haber calibrado. El cartel de la guía
dice *«escribí cuántos **MILÍMETROS** hay entre los dos (1 cm = 10 mm)»* y ofrece **Calibrar
ahora**.

**3.** Marcá dos puntos sobre la regla de profundidad. Se abre un cuadro **propio** (ya no el
cuadro gris del navegador):
- el campo está **vacío** — no hay ningún 10 puesto;
- al lado dice **mm**;
- debajo dice **1 cm = 10 mm**;
- **«Fijar la escala» está apagado**.

**4.** Escribí `abc`, después `0`, después `-5`: el botón **sigue apagado** en los tres. Escribí
`10`: se **prende**.

**5.** Aceptá. El panel guía tiene que decir, en una línea y adelante de todo:
**«Escala fijada: la línea marcada = 10 mm»**, y detrás el factor por píxel. Y tiene que seguir
diciéndolo cuando vuelvas a medir.

**6.** Tocá **Recalibrar →**, marcá **la misma línea** y escribí `100`. La confirmación ahora dice
**«= 100 mm»** y las distancias que midas salen **unas diez veces más grandes** que con la
calibración anterior. *(No sale exactamente diez veces: la marca se hace con el dedo o el ratón y
los dos trazos no miden lo mismo al píxel. Ver `P5-c`.)*

**7.** Tocá **Recalibrar →**, marcá una línea y apretá **Cancelar**: no queda ninguna escala y el
panel sigue pidiendo calibrar. **Escape** hace lo mismo y **no cierra el visor**.

**8.** Con la herramienta **Velocidad** sobre un Doppler espectral sin escala, el cartel dice
ahora que los dos valores van **en m/s**. *(Ahí siguen siendo dos cuadros del navegador: ver
`P5-d`.)*

---

## Punto 2 · La vista previa de CeiboLink

**9.** Con CeiboLink prendido y vinculado, y con imágenes esperando: **Configuración → CeiboLink →
🔍 Vista previa**. Tocá una miniatura.
- Antes: se abría el visor **debajo** del cartel y la caja del cartel tapaba el centro de la
  imagen.
- Ahora: el cartel **se esconde** y se ve el visor entero.

**10.** Cerrá el visor. El cartel **vuelve**, con su título, su texto, su tira de miniaturas y sus
**cinco** botones — y **«← Volver a la pregunta»** sigue funcionando. Probalo también con una
imagen **fija**, que abre el otro visor.

---

## Punto 3 · Los dos textos de la tarjeta

**11.** **Configuración → CeiboLink → Datos para el ecógrafo**: la dirección que el conector marca
dice ahora **«CeiboLink sugiere ésta.»** y no «Es la que conviene dar.».

**12.** Tocá **Desvincular EcoSmart**. Aparece el mensaje «EcoSmart se desvinculó…». Ahora:
- tocá **🔄 Actualizar** → el mensaje **se va**;
- salí de Configuración y volvé → **no está**.

Y el control: al **vincular** o **desvincular**, el mensaje del resultado **sí** se ve (esas dos
acciones releen el estado al final y eso no se lo lleva).

---

## Punto 4 · «Ir al estudio»

**13.** **Guardados → Imágenes guardadas**, tocá una imagen de un estudio y después **«Ir al
estudio»**. Tiene que abrirse **la ficha del estudio** de esa imagen, con el nombre del paciente
arriba. Antes se cerraba la imagen y te dejaba en la galería.

**14.** **«📏 Medir» no se tocó**: sigue avisando que hay que abrir el estudio para medir.
