# Guía de prueba manual — MEDIR-4a

Sello **`v20261115-0250`**, md5 **`359755ea`**. Doce pasos. Hace falta un estudio **guardado** con
al menos **dos cineloops** y **una imagen fija** guardados, porque «+ Vista» lista por estudio.

> El **bloque D** (el flujo de dos pasos del Simpson biplano) **no se hizo** en esta tanda: los
> pasos de abajo no lo prueban. Ver `docs/PENDIENTES.md` → **M4a-f**.

---

### 1 · Una sola vista: imagen a la izquierda, medidas a la derecha

Abrí un cineloop y apretá **📏 Medir**. La imagen queda a la izquierda y el panel de medidas a la
derecha, en **380 px**. **Lo que tiene que pasar:** no hay desplazamiento horizontal y la ventana
no se mueve.

### 2 · El resultado va en una franja DEBAJO, centrado

Con la herramienta **Simpson** y un trazado hecho, la tabla del Simpson aparece **debajo** de la
imagen y del panel, **centrada**, y **no dentro** de la columna de medidas. **Lo que tiene que
pasar:** el panel de medidas **no se angosta** ni se tapa al aparecer la franja.

### 3 · «➕ Vista» y «Cerrar» están arriba, en el encabezado del modal

Mirá la fila de arriba del visor: al lado de **⛶** y de **✕** están ahora **«➕ Vista»** y
**«Cerrar»**. **Lo que tiene que pasar:** ya **no** están en la barra de botones de la imagen.

### 4 · Modo mínimo: los dos siguen escondidos

Cerrá el visor y volvé a abrir un cineloop **sin** apretar «Medir». **Lo que tiene que pasar:**
«➕ Vista» y «Cerrar» **no se ven**, y tampoco se alcanzan con el tabulador. «📏 Medir» y
«📸 Capturar» sí.

### 5 · Las dos barras, iguales y a la misma altura

Con la ventana en **1440 px o más**, apretá **«➕ Vista»** y elegí un cineloop. **Lo que tiene que
pasar:** las dos barras tienen los **mismos siete botones en el mismo orden**, están a la **misma
altura** de la pantalla, las dos imágenes **arrancan a la misma altura** y los dos controles de
reproducción quedan alineados. Ningún encabezado tiene botones.

### 6 · Las cuatro columnas, y la imagen por encima de 300 px

Con 1440 px o más: **imagen A | medidas A | imagen B | medidas B**, en una sola fila. **Lo que
tiene que pasar:** cada columna de medidas mide **340 px** y cada imagen **300 px o más** (335 a
1440, 365 a 1500).

Angostá la ventana por debajo de **1369 px**. **Lo que tiene que pasar:** las medidas **bajan
debajo de su imagen**. Ahí el visor se desplaza hacia abajo, que está declarado (**M4a-b**).

### 7 · La tabla de medidas sigue a la vista que estás midiendo

Con las dos vistas abiertas, medí un **TAPSE** en la vista A. La tabla aparece en la columna de la
**A**. Ahora medí un **VD basal** en la **B**. **Lo que tiene que pasar:** la tabla se **muda** a
la columna de la B, y cada fila dice de qué vista salió: **«TAPSE · A»** y **«VD basal · B»**. Con
una sola medida, la fila va **sin** marca.

> La tabla es **una sola** a propósito: la ecuación de continuidad necesita insumos de planos
> distintos, que con dos vistas son dos pantallas. Ver **M4a-c**.

### 8 · Cerrar la vista A deja la B abierta

Con las dos vistas y las dos medidas puestas, apretá **«✕ Cerrar vista»** en la barra de la
**izquierda**. **Lo que tiene que pasar:** el visor **sigue abierto**, queda **una** vista, la
tabla **sigue ahí** con las **dos** medidas y sus marcas, y el botón «🔗 Sincronizar» desaparece.
La vista que queda sigue diciendo **«Vista B»** — declarado en **M4a-a**.

### 9 · Abrir otra vista después, y cerrar la última

Con la B sola, apretá **«➕ Vista»** y elegí otro cineloop. **Lo que tiene que pasar:** se montan
dos paneles y todo responde —ningún botón queda muerto—. Ahora cerrá las dos, de a una: la
**última** que quede, al apretar su «✕ Cerrar vista», **cierra el visor**.

### 10 · La ✕ de arriba cierra todo, y lo medido se conserva

Con dos vistas abiertas apretá la **✕** del encabezado. **Lo que tiene que pasar:** se cierra todo.
Volvé a abrir un cineloop y abrí el cajón 2D: **las medidas siguen ahí**.

### 11 · «+ Vista» ofrece también las imágenes fijas

Apretá **«➕ Vista»**. **Lo que tiene que pasar:** el selector lista los cineloops **y** las
imágenes fijas guardadas del estudio. Las fijas llevan una marca **«imagen fija»** sobre la
miniatura y su pie dice «imagen fija · <nombre>». **Ningún rótulo se repite:** si dos entradas son
el mismo archivo se ve **una**; si son dos distintos con el mismo código, dicen **«(1 de 2)»** y
**«(2 de 2)»** con su **peso**. Las tablas de resultados guardadas **no** aparecen.

### 12 · En una imagen fija no se puede trazar Simpson

Elegí una **imagen fija**. **Lo que tiene que pasar:** en esa vista el botón **«Simpson»** se ve
**apagado**, y su globo dice por qué. Si lo apretás, la herramienta cae en **Distancia** y sale un
mensaje de **una** línea: «Simpson necesita un cineloop con diástole y sístole: en una imagen fija
no se puede trazar». **Distancia, Área y las de Doppler siguen funcionando** en esa misma vista.

En la **otra** vista, que es un cineloop, el Simpson **sí** entra, sin ningún mensaje. Cerrá la
vista fija, abrí un cineloop en su lugar y comprobá que el Simpson vuelve a estar disponible.

---

## Lo que esta tanda NO cambió, y conviene comprobar que sigue igual

- **El informe.** No se escribe un solo campo: el botón «¿Integrás la FEVI biplano al informe?» y
  lo que escribe quedaron como estaban.
- **La casilla de Anahí por fila SALIÓ** de la tabla de medidas, que vuelve a tener **tres**
  columnas. Siguen el botón **«Para Anahí»** en Imágenes guardadas y en el menú de Exportar de
  Estudios guardados, y el bloque de **Configuración**, los tres bloqueados exactamente como
  estaban. **Nada se envía y nada se guarda.**
- **La imagen no se recortó, no se le hizo zoom y no se amplía** si es más chica que su caja.
- **«Guardar en biblioteca»** del panel del Simpson no se tocó.
