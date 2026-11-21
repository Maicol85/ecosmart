# Guía de prueba del PROMPT 7 — contra CeiboLink real, con el ecógrafo de verdad

Lo que esta guía prueba es lo único que **no se puede probar acá**: el conector de verdad, los
tiempos a reloj y lo que se ve a ojo. Todo lo demás está cubierto por los siete casos nuevos
(**TC-971 a TC-977**) y por los tres adaptados.

**Antes de empezar:**

- EcoSmart abierto, **Modo Avanzado**, CeiboLink **activado** en ⚙️ Config y **vinculado**.
- El ecógrafo —el VINNO o el `ecofalso`— listo para mandar.
- ⚠️ **Mirá el sello en el pie de la app**: tiene que decir **`v20261121-0308`**. Si dice otro, lo
  que estás probando es otro árbol.
- Tené un reloj a mano. Tres de los diez pasos se miden en segundos.

---

## 1 · El primer cartel, a los **cuatro** segundos y no a los quince (tarea B)

Con EcoSmart a la vista y **sin** tocar nada, mandá **una** imagen desde el ecógrafo y contá.

**Qué tiene que pasar:** el cartel «Están llegando imágenes del ecógrafo» aparece **dentro de los
cuatro segundos** de que el conector la recibió. Antes tardaba de 12 a 15.

⚠️ **Si tarda quince, mirá dos cosas antes de culpar a la app:** que la pestaña del navegador esté
**a la vista** —con otra pestaña adelante el sondeo se apaga a propósito— y que la luz del panel
diga **vinculado**.

## 2 · El cartel abierto ya ofrece algo que hacer (tarea D)

Con el cartel de «Están llegando» en pantalla, mirá los botones. Tienen que ser **CINCO**:

| botón | cómo tiene que verse |
|---|---|
| 📎 Adjuntar al estudio actual | **apagado**, gris y sin brillo |
| 🗂 Adjuntar a un estudio guardado | **apagado** |
| 🖼 Adjuntar a imágenes guardadas | **apagado** |
| 👁 Vista previa | **normal** |
| 🗑 Descartar | **normal** |

**Tocá uno de los tres apagados: no tiene que pasar NADA.** Ése es el punto: antes se veían
apagados y funcionaban igual.

**Tocá «Vista previa»**: tiene que abrir la tira de miniaturas de lo que ya llegó, con su botón
«← Volver a la pregunta». Volvé: el cartel tiene que estar como lo dejaste y el contador tiene que
seguir subiendo en el turno siguiente.

## 3 · El cartel pasa a «Llegaron» a los **veinte** segundos de la última (tarea C)

Mandá tres imágenes seguidas y **dejá de mandar**. Contá desde la última.

**Qué tiene que pasar:** a los **veinte segundos** —no a los dos minutos— el título cambia a
«Llegaron imágenes del ecógrafo», el renglón dice **«Listo: el envío terminó.»**, los cuadraditos
se paran y **los cinco botones se prenden**, con aspecto normal.

⚠️ **Esto es lo que más cambió, y es lo que el médico midió con el VINNO:** antes los botones
seguían apagados **más de tres minutos** aunque el envío hubiera terminado en 30 segundos.

## 4 · Lo que llega DESPUÉS del cierre engorda el cartel (tarea C)

Con el cartel ya en «Llegaron» y **sin cerrarlo**, mandá una imagen más.

**Qué tiene que pasar:** el título pasa a **«Llegaron más imágenes del ecógrafo»** y el cartel
ofrece ahora **cuatro**. Lo que **NO** tiene que pasar: que vuelva a decir «Están llegando», ni que
aparezca un segundo cartel.

## 5 · La burbuja, cerrando un cartel **terminado** (tarea A)

Con el cartel de «Llegaron» en pantalla, cerralo con la **✕**.

**Qué tiene que pasar:** abajo a la derecha aparece la burbuja diciendo **«Llegaron N archivos —
tocá para elegir»**, con el dibujo **quieto** —no viajando— y latiendo despacio.

Esperá un minuto sin tocar nada: **el cartel no puede volver solo**.

**Tocá la burbuja**: vuelve el cartel entero, con sus cinco botones vivos.

**Probá también el clic en el fondo oscuro**, fuera del cartel: tiene que hacer lo mismo que la ✕.

⚠️ **Control, y es importante que lo hagas:** adjuntá el envío a un estudio y, cuando salga el
resumen de qué entró, cerralo con la **✕**. **NO tiene que aparecer ninguna burbuja** — esos
archivos ya los decidiste.

## 6 · Los nombres del dato en el ecógrafo (tarea E)

⚙️ Config → **CeiboLink** → desplegá **«Datos para el ecógrafo»**.

Arriba de los tres datos tiene que decir **«SCP = el equipo que recibe las imágenes (esta
computadora).»**, una sola vez, y debajo de **cada** dato una línea chica:

| dato | debajo tiene que decir |
|---|---|
| Puerto DICOM | En tu ecógrafo puede llamarse: **Puerto SCP · Puerto · Port** |
| Nombre (AET) | En tu ecógrafo puede llamarse: **SCP AET · AE Title · AET** |
| Dirección | En tu ecógrafo puede llamarse: **Dirección SCP · IP del servidor · Server IP** |

⚠️ **No tiene que nombrar ninguna marca de ecógrafo.** Sólo el VINNO está confirmado, así que dice
«puede llamarse» y lista las formas.

**Al lado del ecógrafo:** abrí su menú DICOM y comprobá que los tres campos se encuentran con esos
nombres. **Si alguno se llama distinto, anotalo y decímelo** — se agrega a la lista.

## 7 · «Imágenes sin estudio» con sus miniaturas (tarea F)

Mandá dos o tres imágenes y, en el cartel, elegí **🖼 Adjuntar a imágenes guardadas**.
Después andá a la pestaña **🖼️ Imágenes** y bajá hasta **«🖼 Imágenes sin estudio»**.

**Qué tiene que pasar:** la fila del envío ahora muestra **una miniatura por archivo** —antes era
sólo texto— y ofrece **«📎 Asignar a un estudio»** además de «Borrar».

**Tocá una miniatura**: se abre el visor grande con cuatro botones: **🗑 Borrar esta imagen**,
**📎 Asignar este envío a un estudio**, **🗑 Borrar el envío** y **Cerrar**.

**Tocá «Borrar esta imagen»** y aceptá. Tiene que irse **esa sola**: las demás quedan, y el número
del envío baja en uno. Comprobalo en las **dos** pantallas —ésta y la de Guardados → Imágenes
guardadas—: tienen que decir lo mismo.

⚠️ **Y comprobá que no entró nada a ningún estudio**: el estudio que tengas abierto no puede haber
cambiado ni una imagen.

## 8 · Por qué una fija no se mide (tarea G)

Desde el cartel de «Llegaron», tocá **👁 Vista previa** y después una **imagen fija**.

**Qué tiene que pasar:** el visor grande dice, a la vista, **«Para medir, asignala a un estudio.
Las mediciones viven dentro del estudio.»**, y hay un botón **📏 Medir** apagado. **Tocalo**: tiene
que salir el mismo mensaje. Antes no pasaba nada.

**Control positivo:** volvé y tocá un **cineloop**. Tiene que abrir el visor de siempre **con su
medidor**, como hasta ahora.

## 9 · La pestaña tapada no manda un solo pedido (tareas B y P6-j)

Con CeiboLink vinculado, pasá a **otra pestaña del navegador** y dejala así un minuto.

**Qué tiene que pasar:** al volver, el cartel sale **en el acto** si llegó algo mientras tanto.
Lo que no puede pasar es que el conector registre pedidos mientras la pestaña estaba tapada —si
tenés el registro del conector a mano, miralo—.

## 10 · El cineloop grande, de punta a punta

Mandá un cineloop de verdad —el del VINNO pesaba **7,0 MB** con 102 cuadros— junto con dos fijas.

**Qué tiene que pasar:** el cartel cuenta **«2 imágenes y 1 cineloop»**, la vista previa muestra el
cineloop con su marca 🎬 y su peso, y adjuntarlo al estudio abierto lo deja en la tira con su
aviso de «sin guardar» hasta que guardes el estudio.

---

## Si algo no coincide

Anotá **qué paso**, **qué viste** y **a qué hora**, y si podés sacá una foto de la pantalla. Lo que
más sirve es el **tiempo a reloj** de los pasos 1, 3 y 4: esos tres son los que esta tanda cambió y
los únicos que no se pueden medir con el conector falso.
