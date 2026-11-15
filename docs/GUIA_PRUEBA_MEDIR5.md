# Guía de prueba — MEDIR-5 (para Safari, en el Mac)

Diez pasos. Abrí `index.html` en Safari, entrá a un estudio y andá a **Imágenes**.

---

### 1 · La ✕ roja vuelve a quitar la imagen

En **Imágenes**, tocá **📏 Medir** para encender el modo medición. Ahora tocá la **✕ roja** de una
imagen.

**Tiene que quitarla.** Antes abría el visor en vez de quitarla. Tocar la **imagen** sigue abriendo
el visor; tocar la **✕** no.

Leé el cartel azul de arriba: ya no dice que las mediciones «son sólo para ver en pantalla». Ahora
dice que no escriben ningún campo del informe y cómo hacer que queden.

---

### 2 · Un solo «Capturar», y la barra de botones

Abrí un cineloop y tocá **Medir**. Mirá la fila de botones de arriba: hay **seis**, no siete.

- **«📸 Capturar + medición» ya no está.** Quedó **«📸 Capturar»**, que captura lo que ves: si no
  hay nada dibujado sale el cuadro limpio, y si dibujaste algo sale **con las mediciones**.
- **«💾 Guardar»** ahora dice **«💾 Guardar el cineloop en el estudio»** y es más ancho. Hace
  exactamente lo mismo que antes; sólo cambió el nombre.

---

### 3 · La barra de herramientas, sin «Modo»

Mirá la columna de la derecha. Ya **no hay que tocar «2D» o «Doppler / M» primero**: las dos filas
de herramientas se ven a la vez.

- **2D**: Distancia · Área · Simpson
- **Doppler / M**: Velocidad · VTI · Tiempo · FC
- **Estructura**: cambia sola según la herramienta que elijas.

Tocá **Tiempo** y después **FC**: la fila de estructuras **no cambia**, siguen las cuatro válvulas.

---

### 4 · La tabla: el número se toca

Elegí **Distancia** y la estructura **VD**. Mirá la tabla.

- El orden es **TAPSE, VD basal, VD medio, VD longitudinal, Diam TSVD**.
- **No hay lápiz ✏️.** Para escribir un valor a mano, **tocá el número** (o el guion). Se toca
  cómodo aunque se vea chico.
- Cada fila con valor trae **«Medir»** y una **✕** que borra **sólo ese dato**.
- Escribí un valor donde había un guion: **el ancho de la tabla no se mueve**.

---

### 5 · La guía de calibración

Abrí una imagen **sin escala** —un JPG, una captura de pantalla, o un DICOM que no la traiga— y
tocá **«Medir»** en cualquier fila.

Sale un cartel que explica **dónde marcar los dos puntos** y un botón **«Calibrar ahora»**.
Con **Velocidad** o **VTI** la guía habla del eje de velocidad; con **Tiempo** o **FC** avisa que
ese eje **no se puede calibrar a mano** y por eso **no ofrece el botón**.

---

### 6 · Las cuatro válvulas, con sus campos nuevos

Elegí una herramienta Doppler y recorré las cuatro estructuras:

- **Mitral** — aparecieron **TRIV, TDE, Vmax aliasing, Radio PISA y Vena contracta**.
- **Aórtica** — aparecieron **«Diám jet IAo en TSVI»** y **Vena contracta**.
- **Tricúspide** — aparecieron **Onda S' tricuspídeo, TRIV (TDI), VTI diastólico tricuspídeo,
  Gradiente medio ET, THP tricuspídeo** y **Diam VCI**.
- **Pulmonar** — el orden empieza por **TAP**.

Son los mismos nombres que ves en el formulario. **No escriben nada en el informe**: viven sólo en
la tabla del visor.

---

### 7 · La PmAD de la tricúspide

Con la **Tricúspide** abierta, arriba de la tabla hay dos selectores: **PVC estimada** y
**Colapso VCI** (`> 50 %` / `< 50 %`).

Escribí un **Diam VCI** y elegí un colapso: aparece la fila **PmAD (VCI)** con el valor que la app
calcula —la misma matriz que usa el informe—. Tocá la opción elegida otra vez y se apaga.

---

### 8 · Los calculados, debajo de la imagen, y la FC

Mirá **debajo de las dos imágenes**: hay un bloque **Calculados**, en cursiva, con la fórmula de
cada uno al lado.

- Con la **aórtica**: AVA por continuidad, AVA indexada, DVI, Vol. sistólico, Vol. sistólico
  indexado y **Gasto cardíaco**.
- Con la **mitral**: E/A, E/e′, AVM por THP y AVM por continuidad.

Abajo del todo está la **Frecuencia cardíaca**, que sale del informe y es **de sólo lectura**: no
se puede editar desde acá. Si la cargás en el informe, el **gasto cardíaco** aparece solo.

---

### 9 · El Simpson: el parcial, la imagen quieta y «Limpiar»

Elegí **Simpson** y trazá **sólo la diástole**.

- Aparece la fila **«A4C · parcial»** con el **VFD**, en cursiva, y un pie que dice que falta la
  sístole y que un parcial **no se integra al informe ni va al PDF**.
- **La imagen y la fila de botones no se mueven** cuando aparece el resultado. Antes subían y
  tapaban los botones.
- La **barra del video** sigue a la vista.

Trazá la sístole, abrí una **segunda vista** y hacé el biplano. Tocá **«🗑️ Limpiar»**: se borran
**las dos** vistas. Antes quedaba viva la de la otra ventana.

---

### 10 · Dos vistas, cada tabla en su columna · y «Guardar en biblioteca»

Con **dos vistas** abiertas, poné una en **Doppler/Mitral** y la otra en **Distancia/VD**.

Cada tabla tiene que aparecer **en la columna de su propia imagen**. Antes las dos se dibujaban
sobre la vista activa, así que la columna de una mostraba la tabla de la otra.

En **las dos tablas** —la 2D y la Doppler— al lado de **«🗑️ Limpiar»** hay ahora
**«💾 Guardar en biblioteca»**: genera una imagen de la tabla con su estructura y la hora, y la
manda a la biblioteca de imágenes. Desde ahí decidís con el **📄** si entra al PDF. **No guarda
datos ni escribe en los campos de la app.**

Y si tenés un monitor de **1920 o 2560 px**, el visor ahora usa el ancho extra: la imagen se ve
más grande y la tabla de medidas **no se estira**.

---

## Si algo no sale como dice acá

Anotá **qué paso**, **qué viste** y **el ancho de la ventana**. Lo que esta tanda **no** hizo
—pasar estos campos al informe— es **MEDIR-4c**, y está declarado en `docs/PENDIENTES.md`.
