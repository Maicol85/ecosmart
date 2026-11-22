# Guía de prueba — P9 (el modelo de imágenes, guardar/reabrir, duplicados y pantalla)

Para probar en la **Mac** y en **Windows**. Pasos cortos; cada uno dice qué tiene que pasar.
**Paciente inventado**: usá «PRUEBA P9» y documento `99999999`. No uses un paciente real.

Sello de este árbol: **`v20261121-2158`** · md5 `d6a7d8dd`.

---

## Antes de empezar

1. Abrí `index.html` en Chrome.
2. ⚙️ **Config** → «🖼️ Imágenes del estudio» → prendé **«Guardar imágenes con los estudios»**.
3. Si vas a probar el ecógrafo, prendé **CeiboLink** y vinculá el navegador.

---

## A · Las dos secciones (Tarea 1)

1. Pestaña **🖼️ Imágenes**. Arriba tiene que decir **«📄 Imágenes que van al PDF»** y abajo
   **«🗂 Biblioteca de imágenes del estudio»**.
2. Con el estudio recién abierto, la de arriba está **vacía** y dice que arrastres una de abajo o
   toques «＋ AL PDF». *Si está vacía, está bien: es el estado normal.*
3. Mandá tres imágenes desde el ecógrafo (o **📥 Importar imágenes y videos**).
   → Las tres aparecen **abajo** y **ninguna arriba**.
   → El renglón dice **«3 imágenes fijas y 0 cines en la biblioteca · 0 en el PDF»**.
4. Tocá **＋ AL PDF** en una. → Aparece **arriba**, y la pastilla pasa a **✓ EN EL PDF**.
5. Andá al **Informe** → la fila de miniaturas tiene **esa misma una**. *Son la misma lista.*
6. Volvé a Imágenes y **arrastrá** otra de abajo a la grilla de arriba. → Entra.
7. Tocá la **✕ roja de ARRIBA**. → Sale del PDF y **sigue abajo**. **No pregunta nada.**
8. Tocá la **✕ roja de ABAJO**. → Sale un **cartel de EcoSmart** (no del navegador) que dice
   **«¿Eliminar 1 imagen de la biblioteca?»**. Tocá **Cancelar** → no pasa nada. Tocá otra vez y
   **Eliminar** → desaparece de las dos.
9. **Pegá** una imagen con **Ctrl+V** (Cmd+V en la Mac) o usá **＋ Agregar imagen**.
   → Entra **arriba y abajo**: lo que ponés a mano va al PDF.
10. Importá un **video MP4**. → Va **sólo abajo**, con su marca. Si lo arrastrás arriba, te dice
    que los videos no salen en el PDF.
11. **Doble click** (o toque largo en tablet) sobre una imagen → queda con el cartelito
    **AMPLIADA**, arriba y abajo. **Un click solo** abre el visor.

## B · Guardar, reabrir y exportar — **esto es lo grave** (Tarea 2)

12. Con **cuatro** imágenes en la biblioteca, mandá **dos** al PDF.
13. Cargá nombre y documento y **Guardar**.
14. **Nuevo estudio** → **Guardados** → abrí el mismo estudio otra vez.
    → Siguen las **cuatro** abajo y **sólo dos** arriba. *Esto es lo que antes se daba vuelta.*
15. Desde **Guardados**, en ese estudio, tocá **Exportar PDF** **sin** apretar «Regenerar Informe».
    → El PDF sale con **DOS** imágenes. *Antes salía con las cuatro.*
16. Volvé al estudio y guardá otra vez. Cerrá y reabrí.
    → Siguen cuatro y dos. *La marca ya no se pierde al exportar.*

## C · Los cineloops y los duplicados (Tareas 2 y 3)

17. Importá un **cineloop** (pendrive, carpeta `GEMS_IMG`, o DICOM multicuadro) y guardá el estudio.
    → El renglón dice **«… y 1 cine en la biblioteca»**.
18. **Nuevo estudio** → reabrí → el cineloop **sigue ahí**, en la tira de abajo.
19. Mandá **el mismo cineloop otra vez** desde el ecógrafo y guardá.
    → **No se duplica**, y un aviso dice «ya estaban guardados en este estudio».
20. **Reenviá desde el ecógrafo dos imágenes que YA habías adjuntado.**
    → El cartel dice **«Llegaron 2: ninguna nueva — ya las tenías…»** y el botón
    **«Agregar sólo las nuevas»** está **apagado**, diciendo por qué.
21. Reenviá **dos viejas y una nueva**. → El cartel dice **«1 nueva y 2 que ya tenías…»** y ofrece
    **tres** botones: «Agregar sólo las nuevas (1)», «Agregar todas igual (3)» y «Descartar».
    Tocá el primero → la pregunta de destino aparece **con una sola imagen**.
22. **Recargá la página** y reenviá lo mismo. → Las sigue reconociendo como repetidas.
    *Antes de P9, recargar borraba esa memoria.*
23. Mientras el ecógrafo manda, el cartel dice «Están llegando». Cuando termina pasa a decir
    **«Listo: el envío terminó»**. Cerralo con la **✕** → queda la **burbuja** abajo a la derecha.
    Tocala → vuelve el cartel entero.

## D · Pantalla (Tarea 4)

24. **Guardados → Imágenes guardadas.** Abrí un mes. Prendé **«Elegir imágenes»** y tocá
    **«☑ Todas»**.
    → **No se trabó ni se cayó la página**, y **los cineloops también muestran su tilde**.
    → El contador dice las fijas y los cines por separado, y el cartel de eliminar también.
25. ⚙️ **Config → CeiboLink → Equipos.** Escribí un apodo y tocá **Guardar apodo**.
    → La lista se pone al día **sola**, sin apretar «Actualizar». Lo mismo con **Separar**,
    **Unir** y **Olvidar**.
26. Mientras escribís el apodo, esperá unos segundos **sin tocar nada**.
    → Lo que escribiste **no se borra** y el campo no pierde el foco.
27. En la lista de equipos, mirá el renglón de cada dirección.
    → La del cable dice **«cable directo»**, la del router **«red del router»** y la que no se
    puede deducir **«tipo no determinado»** (antes quedaba en blanco).
    ⚠️ **Ojo con «cable directo»:** la app sabe por qué interfaz entró, no si el cable va derecho
    al ecógrafo o a un switch con un router detrás.

## E · Lo que NO cambió, y conviene mirar igual

28. El **informe narrativo**, el **EN SUMA** y el **Excel del Laboratorio**: ningún corte, ninguna
    fórmula y ninguna columna se tocaron. El Excel sigue en **457** columnas.
29. La **barra de espacio** de Imágenes guardadas sigue como estaba: el punto 4.5 es **auditoría y
    propuesta**, y está en `docs/AUDITORIA_MEMORIA_P9.md`. No se implementó ninguna compresión.

---

## Si algo sale mal

Anotá **qué paso**, **qué viste** y **qué esperabas**, y si podés el número del paso. Si la página
se traba, mirá la consola de Chrome (⌥⌘I en la Mac, F12 en Windows) y copiá el primer error en rojo.
