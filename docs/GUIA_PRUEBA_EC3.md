# Guía de prueba a mano — ECO-CONECTOR-3 (2026-11-12)

Para probar con **CeiboLink de verdad** y el ecógrafo. Catorce pasos. Cada uno dice **qué hacer** y
**qué tendría que pasar**; si pasa otra cosa, anotá qué viste.

Antes de empezar: en ⚙️ **Config → CeiboLink** el interruptor encendido y vinculado, y en ⚙️
**Config** la opción **«Guardar imágenes con los estudios»** ENCENDIDA (salvo donde el paso diga lo
contrario).

---

**1 · El aviso cuenta por tipo.** Mandá desde el ecógrafo **dos imágenes fijas y un clip** del mismo
paciente, uno detrás del otro.
→ Tiene que aparecer **un solo** cartel que diga «Llegaron **2 imágenes y 1 cineloop** del equipo
«tu apodo» a las HH:MM». **Ningún dato del paciente.** Cuatro botones apilados.

**2 · El cartel se actualiza.** Con el cartel abierto, mandá **una imagen más** del mismo equipo,
antes de que pasen dos minutos.
→ El **mismo** cartel tiene que pasar a decir «3 imágenes y 1 cineloop» y el título, «Llegaron más
imágenes del ecógrafo». **No** tiene que aparecer un segundo cartel.

**3 · No se abre encima de nada.** Abrí un cineloop en el visor (pestaña 🖼️ Imágenes → Importar
DICOM, o tocá uno de la tira) y, con el visor abierto, mandá imágenes nuevas.
→ **No** tiene que aparecer ningún cartel sobre el visor. Cerrá el visor: el cartel tiene que
aparecer en los siguientes quince segundos.

**4 · Al estudio abierto.** Con un estudio abierto, elegí **«📎 Adjuntar al estudio actual»**.
→ Las fijas tienen que aparecer en las casillas de 🖼️ Imágenes. El cineloop **no ocupa casilla**:
tiene que abrirse el visor y, al cerrarlo, tiene que seguir visible en la tira «archivos del
estudio» marcado **«sin guardar»** con su peso en MB. Tocalo: tiene que volver a abrirse.

**5 · Se guarda solo.** Poné nombre y documento y guardá el estudio.
→ Tiene que decir «cineloop(s) guardado(s) con el estudio» y la tira tiene que pasar a mostrarlo
**sin** la marca «sin guardar». **No** hace falta apretar ningún botón de guardar en el visor.

**6 · Nada queda esperando.** Volvé a ⚙️ Config → CeiboLink y apretá «Actualizar».
→ El número de imágenes esperando tiene que haber bajado: lo que se guardó, CeiboLink lo borró.

**7 · A un estudio guardado.** Mandá imágenes nuevas y elegí **«🗂 Adjuntar a un estudio
guardado»**.
→ Tiene que abrirse una ventana con **los mismos meses y el mismo orden** que Guardados y un
buscador. Escribí parte de un nombre o de un documento: la lista tiene que filtrarse. Elegí un
estudio: tiene que preguntarte **nombrando ese estudio** y cuántas imágenes y cineloops le agrega.

**8 · Fue al elegido y a ningún otro.** Abrí el estudio que elegiste desde Guardados.
→ Las imágenes nuevas tienen que estar **al final** y sus datos de paciente **sin cambiar**. Abrí
otro estudio: **no** tiene que tener nada nuevo. Si el estudio elegido tenía algún dibujo de la app
guardado, tiene que seguir ahí.

**9 · El mismo estudio abierto.** Mandá una imagen más y elegí «🗂 Adjuntar a un estudio guardado»;
elegí **el estudio que tenés abierto**.
→ Tiene que avisar «ese es el estudio que tenés abierto: se adjunta acá» y la imagen tiene que caer
en una casilla, no en disco.

**10 · A «Imágenes sin estudio».** Mandá un **clip** y elegí **«🖼 Adjuntar a imágenes
guardadas»**.
→ El aviso de cierre tiene que decir **dónde encontrarlas**. Andá a **Guardados → Imágenes
guardadas**: arriba tiene que aparecer un bloque **«🗂 Sin estudio»** con el equipo, la fecha, «1
cineloop» y su **peso**.

**11 · El cineloop entero.** Desde ese bloque, apretá **«📎 Asignar a un estudio»** y elegí un
estudio guardado. Abrilo y tocá el cineloop en la tira.
→ Tiene que reproducirse **completo**, con todos sus cuadros — no un solo cuadro. Y el envío tiene
que haber **desaparecido** del bloque «Sin estudio».

**12 · El pendrive también pregunta.** En **Guardados**, abrí el menú de importar y elegí «📥
Importar imágenes y videos». Elegí dos o tres archivos del pendrive.
→ Tiene que preguntarte a dónde van, con el cuarto botón diciendo **«Cancelar»** (no «Descartar») y
el texto avisando que los archivos siguen en el pendrive. Apretá Cancelar: **no** tiene que entrar
nada.
→ Ahora, desde la pestaña **🖼️ Imágenes** del estudio abierto, apretá «📥 Importar imágenes y
videos» y elegí archivos. **No** tiene que preguntar nada: van derecho a las casillas.

**13 · DICOM sin comprimir.** Si tu ecógrafo manda sin comprimir (o podés configurarlo así), mandá
una imagen fija y un clip.
→ Tienen que entrar **igual** que los comprimidos. Si tu equipo manda en RLE o JPEG 2000, el aviso
de rechazo tiene que **nombrar el formato** y decir que la imagen **sigue esperando** en CeiboLink —
y al apretar «Actualizar» en Config, el número **no** tiene que haber bajado.

**14 · Nada se pierde al cerrar.** Mandá imágenes, adjuntalas al estudio abierto y apretá **«Nuevo
estudio»** sin guardar.
→ Tiene que preguntarte si querés guardar. Elegí «Continuar sin guardar»: en ⚙️ Config → CeiboLink,
las imágenes tienen que **seguir esperando**, y el aviso tiene que volver a ofrecerlas.
→ Y con imágenes del ecógrafo y **sin** nombre o **sin** documento, el botón «Guardar y continuar»
tiene que estar **apagado**, con el texto explicando que las imágenes no se pierden.

---

## Si algo sale mal, qué anotar

- Qué paso era y qué viste en lugar de lo que dice la guía.
- Si apareció un cartel, su **texto completo**.
- En ⚙️ Config → CeiboLink: la versión del conector y los tres números.
- Si una imagen **desapareció**: mirá primero en **Guardados → Imágenes guardadas → Sin estudio**, y
  después si CeiboLink todavía la tiene esperando.
