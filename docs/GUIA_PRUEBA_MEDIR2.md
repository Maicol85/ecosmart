# Guía de prueba manual — MEDIR-2 (2026-11-13)

Doce pasos. Hace falta **una imagen o un cineloop cualquiera** (el visor abre con lo que haya en
Imágenes guardadas, o importando del pendrive). **Nada de esto escribe en el informe**, salvo
donde el paso lo dice.

---

**1 · La tabla, en cinco columnas.** Abrí una imagen, tocá **📏 Medir**, elegí **2D → Distancia →
VI**. La tabla del cajón tiene que mostrar **Medida | Valor | Unid. | Medir y Borrar | Anahí**, con
el valor y la unidad en celdas separadas (antes iban pegados).

**2 · Una fila calculada se ve distinta.** Cargá el **SIVd** y el **SIVs** con el ✏️ (por ejemplo
10 y 14). Aparece **«Engrosamiento SIV»**: va en **cursiva**, **sin botones**, y su celda de
acciones dice **«calculada»**.

**3 · «Borrar» vacía una sola fila.** Con los dos cargados, tocá **Borrar** en la fila del SIVd.
Esa fila queda en «—» y **el SIVs no se mueve**. La fila sin valor **no ofrece «Borrar»**.

**4 · La misma tabla en el Doppler.** Elegí **Doppler / M → Velocidad → Pulmonar**. El encabezado
tiene que ser **idéntico** al del cajón 2D, y «Grad Máx pulmonar» tiene que verse como
*calculada*.

**5 · Los nombres del Doppler pulmonar.** En esa misma tabla:
- hay **una sola** fila **«Vmax pulmonar»** (ya no están «VP» ni «Vmax EP»);
- la insuficiencia va en **dos** filas: **«Vmax proto-diast. IP»** y **«Vmax telediastólica IP»**,
  las dos en m/s y las dos con su botón **Medir**;
- las dos se llaman **igual** que los campos del formulario (pestaña de la válvula pulmonar).

**6 · El Área, por aurícula.** Volvé a **2D** y elegí **Área**. La tercera fila del selector pasa
a ofrecer **AI** y **AD** (y ya no las cinco estructuras de Distancia). Elegí **AI**, mantené
apretado y recorré el borde de la aurícula izquierda; al soltar, el contorno se rotula **«Área de
AI: … cm²»**. Elegí **AD** y hacé lo mismo. Debajo de la guía tienen que aparecer **las dos
líneas** con sus cm², más el aviso de que las dos se miden en A4C y que **no se escribe ningún
campo**.

**7 · Y no escribe nada.** Después del paso 6, andá al **Informe**: ningún campo tiene que haber
cambiado. El área de la AI **no** se cargó en `ai_area` ni en ningún otro lugar.

**8 · Simpson, en mL y mL/m².** Cargá **peso** y **talla** en el Informe. Volvé al visor, elegí
**Simpson** y trazá diástole y sístole. La tabla tiene que mostrar **VFD mL · VFD mL/m² · VFS mL ·
VFS mL/m² · VEyec mL · VEyec mL/m² · FEVI %**, y al pie decir **de dónde sale la superficie** con
su valor en m². La **FEVI no se indexa**.

**9 · Y sin peso o sin talla lo dice.** Borrá la **talla**. La tabla vuelve a las columnas de **mL
solas** y al pie dice **«Sólo en mL: falta el peso o la talla»**. No inventa una superficie.

**10 · La casilla de la comunidad.** En cualquiera de las dos tablas, la última columna dice
**«Anahí»** y cada fila tiene una casilla **con candado**. **Tocala**: la primera vez de la sesión
sale el cartel **«Comunidad de desarrollo de IA de CeiboMed»**, con su explicación y un solo botón
**«Entendido»**. Cerralo y volvé a tocarla: ahora sale el **aviso corto** «Bloqueado hasta que te
unas a la comunidad». **Nada quedó aceptado ni guardado.**

**11 · Los dos botones «Para Anahí».** En **Guardados → Imágenes guardadas**, prendé **«Elegir
imágenes»**: en la columna de la izquierda, **pegado** a «📤 Exportar las elegidas», está
**«🔒 Para Anahí»**. Tocalo: contesta (no se queda mudo). Y en **Guardados → Estudios guardados**,
abrí el menú **«📤 Exportar»**: ahí también está, con su candado.

**12 · El bloque de Configuración.** En **Configuración**, encima de CeiboLink, está **«🤝
Comunidad de desarrollo de IA de CeiboMed»**, que dice que **todavía no está activa**. **No tiene
ningún botón** ni ningún campo: no hay nada que aceptar.

---

## Lo que NO cambió, y conviene comprobar de paso

- **El botón «Volumen»** sigue visible y **apagado**, con su leyenda «próximamente».
- **Las tres rutas al informe** siguen funcionando igual: los **VTI** de los dos tractos
  («Cargar VTI»), los **diámetros** del TSVI y del TSVD («usar la última distancia») y la **FEVI
  por discos** de Simpson.
- **Las bandas de plausibilidad** no se movieron: un valor imposible escrito con el ✏️ se sigue
  rechazando igual, en los mismos campos que antes.
- **El selector de estructura viejo**, el que vivía dentro de cada cajón, sigue escondido (lo dejó
  MEDIR-1).
