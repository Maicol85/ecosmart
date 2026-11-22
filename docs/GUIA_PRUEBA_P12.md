# Guía de prueba manual — tanda P12 (2026-11-22)

Sello **`v20261122-1436`**, md5 **`ae874798`**. Para **Mac** y para **Windows**; donde algo
cambia entre los dos, lo dice.

**Antes de empezar:** abrí la consola del navegador (⌥⌘I en Mac, F12 en Windows) y dejala a la
vista en la pestaña **Console**. Si en algún paso aparece un error en rojo, anotalo: es más útil
que el síntoma.

**Cómo se reconoce un cartel propio de uno nativo**, que es lo que esta tanda vino a cambiar:

| | cartel propio de EcoSmart | ventana nativa del navegador |
|---|---|---|
| dónde sale | **centrado** sobre la pantalla, con el fondo oscurecido | **pegada al borde de arriba** de la pestaña |
| qué dice arriba | el título que escribió la app | el nombre del sitio («ecosmart.ceibomed.com dice…») |
| los botones | con los colores de EcoSmart y el rótulo en castellano | «OK» / «Cancelar» del sistema |
| se cierra con | la ✕, Escape, o un clic en el fondo | sólo sus botones |

---

## Parte 1 · Los carteles propios (TAREA 1)

### Paso 1 — la envolvente con menos de tres puntos

1. Abrí un estudio y entrá a una imagen **Doppler espectral** del ecógrafo (pestaña **Imágenes**,
   clic en la miniatura).
2. Tocá **📏 Medir** y elegí la herramienta **VTI**.
3. Hacé **un clic corto** sobre el espectro, sin arrastrar.

**Qué tiene que pasar:** sale un cartel **propio** que dice **«No se pudo medir la envolvente»** y
debajo «La envolvente necesita al menos tres puntos…».
**Qué NO tiene que pasar:** una ventana con el nombre del sitio arriba.

4. Cerralo con **Escape**. Tiene que cerrarse sin cerrar el visor.
5. Volvé a abrirlo y cerralo con un **clic en el fondo oscuro**. Ídem.

### Paso 2 — pasar a calidad original

1. En la pestaña **Imágenes**, cargá una foto a mano con **➕ Agregar imagen**.
2. En su miniatura, elegí la calidad **Original**.

**Qué tiene que pasar:** cartel **propio** titulado **«¿Usar calidad original?»**, con el peso de
la imagen y el total del estudio, y dos botones: **Cancelar** (a la izquierda, enfocado) y **Usar
calidad original**.
**⚠️ Mirá el color del botón de la derecha: tiene que ser AZUL y no rojo.** Subir la resolución no
destruye nada, y el rojo le enseñaría a desconfiar del rojo.

3. Tocá **Cancelar**. La calidad tiene que volver a la que estaba —no a «media» fija—.

### Paso 3 — corregir un valor a mano en el cajón de medidas

1. Dentro del visor, con **Medir** encendido, abrí el cajón **Doppler** y elegí la **aórtica**.
2. En la tabla, tocá el **número** de cualquier fila (el valor, no un botón).

**Qué tiene que pasar:** cartel **propio** con un campo de texto, el valor actual ya escrito y
seleccionado, la banda debajo («Entre X e Y») y el pie «Dejalo vacío para borrar el valor.»
3. Escribí un número y apretá **Enter**: tiene que guardarse.
4. Volvé a abrirlo, **borrá todo** el campo y tocá **Guardar**: el valor tiene que **borrarse**.
   (Si pide un número para poder guardar, eso es un defecto: el vacío borra.)

### Paso 4 — borrar varias imágenes

1. Pestaña **Guardados** → **Imágenes guardadas**.
2. Entrá en el modo elegir y marcá **dos o tres** imágenes.
3. Tocá **Eliminar**.

**Qué tiene que pasar:** cartel **propio** que dice **la cantidad** y de qué estudio, con el botón
**rojo** «Borrar» a la derecha y **Cancelar** enfocado.
4. Tocá **Cancelar**: no se tiene que borrar nada.

---

## Parte 2 · El cartel de llegada de CeiboLink (TAREA 2)

Para esta parte hace falta **CeiboLink corriendo** y el ecógrafo mandando.

### Paso 5 — las repetidas se descartan solas

1. Mandá **tres** imágenes desde el ecógrafo y, cuando salga el cartel, adjuntalas al estudio
   abierto. Guardá el estudio.
2. Desde el ecógrafo, **volvé a mandar las mismas tres más una nueva** (cuatro en total).

**Qué tiene que pasar:** el cartel dice que llegaron cuatro y, **debajo**, una línea que dice
**«Si elegís "sólo las nuevas", las 3 repetidas se descartan de CeiboLink: no quedan esperando.»**
El primer botón tiene que decir **«✅ Agregar sólo las nuevas (1)»**.

3. Tocá ese botón y elegí un destino para la nueva.
4. **Mirá el panel de CeiboLink en ⚙️ Config.** El contador de imágenes esperando tiene que bajar
   a **cero** una vez que la nueva encontró su destino: las tres repetidas se borraron solas.

### Paso 6 — lo descartado no vuelve al recargar

1. Con el paso 5 terminado, **recargá la página** (⌘R en Mac, F5 en Windows).
2. Esperá un turno del sondeo (unos cuatro segundos) y mirá el panel.

**Qué tiene que pasar:** las tres repetidas **no vuelven**. No sale ningún cartel por ellas.

### Paso 7 — el botón con «(0)»

1. Mandá desde el ecógrafo **sólo imágenes que ya adjuntaste antes** (ninguna nueva).

**Qué tiene que pasar:** el cartel sale y el primer botón dice **«✅ Agregar sólo las nuevas
(0)»**, **pálido y gris**, y **no responde al toque**. Pasá el puntero por encima: el globo tiene
que decir «No hay ninguna nueva: todas las que llegaron ya las tenés.»
**Qué NO tiene que pasar:** un botón que se ve normal, se toca y no hace nada.

2. El segundo botón —**«📥 Agregar todas igual (N)»**— tiene que verse **normal** y funcionar.

### Paso 8 — descartar sigue preguntando

1. Con un cartel abierto, tocá **🗑 Descartar**.

**Qué tiene que pasar:** cartel **propio** que dice la cantidad y «Se borran de CeiboLink y NO SE
PUEDEN RECUPERAR», con el botón **rojo** «Descartar».

---

## Parte 3 · La escala de velocidad (TAREA 3)

### Paso 9 — el VTI sobrevive a recargar la página · EL PASO MÁS IMPORTANTE

1. Abrí un estudio y entrá a una imagen **Doppler espectral del ecógrafo** (tiene que venir de un
   DICOM, no una foto).
2. Tocá **Medir**, elegí **VTI** y trazá una envolvente completa: mantené apretado y recorré el
   contorno del espectro.
3. **Anotá los tres números** que salen en la fila: el **VTI en cm**, la **Vmax en m/s** y el
   **gradiente máximo en mmHg**. Y anotá lo que dice al final de la fila: tiene que decir
   **«· escala del archivo»**.
4. Asegurate de que **⚙️ Config → «Guardar imágenes con los estudios»** esté **encendido**, y
   **guardá el estudio**.
5. **Recargá la página.**
6. Abrí el mismo estudio desde **Guardados** y volvé a entrar a esa imagen.
7. Tocá **Medir**, elegí **VTI** y trazá **la misma envolvente** otra vez.

**Qué tiene que pasar:** los tres números tienen que dar **lo mismo** que en el paso 3 —el trazo
a mano nunca es idéntico, así que tienen que dar *parecido*, dentro de lo que cambia por el pulso—
y la fila tiene que seguir diciendo **«· escala del archivo»**.
**⚠️ ESTO ES LO QUE ESTABA ROTO:** antes de P12, después de recargar la app decía que esta zona no
declaraba escala de velocidad y había que calibrar a mano.

8. **Control de que la prueba sirve:** en el **mismo** paso, elegí la herramienta **Distancia** y
   medí algo. Los **milímetros** tenían que funcionar antes y tienen que seguir funcionando: si
   los mm fallan, el problema es otro.

### Paso 10 — la flecha ↑/↓

1. Con la imagen reabierta del paso 9, elegí la herramienta **Vel.**
2. Hacé un clic **por encima** de la línea de cero del espectro, y otro **por debajo**.

**Qué tiene que pasar:** el de arriba lleva **↑** y el de abajo **↓**.
**⚠️ ESTO TAMBIÉN ESTABA ROTO después de recargar**, y por la misma causa: salían las dos con ↑.

### Paso 11 — la receta de la calibración manual

1. Entrá a una imagen Doppler **que no traiga escala** —o a una foto cargada a mano—.
2. Elegí **Vel.** y hacé un clic sobre la imagen.

**Qué tiene que pasar:** cartel **propio** que dice que esta imagen no declara su escala de
velocidad y, debajo, **«Qué hacer: elegí la herramienta "Vel." en la barra de medición y tocá
"Calibrar vel.". Después, marcá el cero y otro punto del eje de velocidad, y escribí cuánto vale
cada uno eligiendo la unidad (m/s o cm/s) en el mismo cuadro.»**

3. Tocá **Calibrar vel.** El panel guía de la barra tiene que decir la **misma** receta.
4. Marcá **dos puntos** del eje. En el primero sale un cartel que pregunta cuánto vale, con el
   campo **vacío**, un **selector de unidad** al lado (m/s o cm/s) y la pista «1 m/s = 100 cm/s».
   Si marcaste la línea de cero, el cartel te dice que escribas **0**.
5. Escribí los dos valores. El VTI y la velocidad pasan a decir **«· escala vel. a mano»**.

### Paso 12 — la unidad se elige y no se adivina

1. Repetí el paso 11 pero escribí los valores en **cm/s** eligiendo esa unidad.

**Qué tiene que pasar:** `1,5 m/s` y `150 cm/s` tienen que dar **el mismo** resultado. Si da cien
veces distinto, el selector no se está leyendo.

---

## Parte 4 · Lo que NO cambió, y hay que confirmarlo

### Paso 13 — ningún cartel nativo quedó donde ya no debía estar

Recorré estos cuatro gestos y confirmá que **ninguno** abre una ventana con el nombre del sitio
arriba:

1. en el visor, **Limpiar** sobre un cajón de medidas con algo medido;
2. en el visor, **Limpiar** la tabla del Simpson;
3. en la biblioteca, la **✕ roja de abajo** de una miniatura;
4. en la tira de archivos del estudio, la **✕** de un cineloop guardado.

### Paso 14 — los que SIGUEN siendo nativos, a propósito

Estos **todavía** son ventanas nativas y **está bien** que lo sean en esta tanda —el pedido los
dejó fuera—. Confirmá que siguen funcionando:

1. ⚙️ **Config → Médicos → editar** un médico: pide el nombre con una ventana nativa.
2. **Guardados → eliminar** un informe: pregunta con una ventana nativa.
3. ⚙️ **Config → CeiboLink → Desvincular**: ídem.

La lista completa de los 41 que quedan está en `docs/CENSO_DIALOGOS_P12.md`.

### Paso 15 — el informe no cambió

1. Cargá un estudio con datos y generá el **PDF**.
2. Mirá el **informe narrativo**, el **EN SUMA** y el **PDF**.

**Qué tiene que pasar:** **nada** de esta tanda aparece ahí. P12 no tocó ni un corte, ni una
fórmula, ni un umbral, ni un campo del estudio, ni una columna del Excel del Laboratorio.
