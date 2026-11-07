# Guía de prueba manual — tanda PANT-22 (2026-11-07)

Dieciocho pasos, **un dato por línea**. Abrí `index.html` en Chrome, ventana a **1440 px** de ancho
salvo donde diga otra cosa. Empezá siempre con **«Nuevo estudio» → «Continuar sin guardar»**.

---

## A. El caso del médico: sin sector incluido, no hay sección (pasos 1 a 6)

**1.** Pestaña **▶️ VD / AD** → en «TAPSE (mm)» escribí **14**.

**2.** Pestaña **〰️ Doppler** → en «E/e′ promedio» escribí **16**.

**3.** **NO toques ningún botón «📎 Integrar al informe».** Esto es la escena del reporte.

**4.** Tocá **📋 Evidencia** (arriba a la derecha).
→ **TIENE QUE NO APARECER** ninguna de estas tres: «Constricción pericárdica — diagnóstico»,
«Perfil hemodinámico — presiones y resistencias estimadas por eco» y «Amiloidosis cardíaca —
algoritmo diagnóstico». **Antes de esta tanda aparecían las tres.**

**5.** En ese mismo panel, mirá el mensaje.
→ Tiene que decir **«Sin criterios de intervención detectados con los datos actuales»**, que es el
que la app ya mostraba. No hay ninguna frase nueva.

**6.** Cerrá el panel y volvé a **🫀 Hemodinámica**.
→ Los campos del perfil hemodinámico **tienen que seguir calculando**: el índice cardíaco y el
gasto siguen ahí. **El dato sigue sincronizado; lo que no existe es su sección de Evidencia.**

---

## B. El control positivo: con el sector incluido, su sección vuelve (pasos 7 a 10)

**7.** En **🫀 Hemodinámica**, bajá hasta el bloque «Constricción vs restricción» y tocá su
**📎 Integrar al informe**.

**8.** Tocá **📋 Evidencia**.
→ **TIENE QUE APARECER** «Constricción pericárdica — diagnóstico», **igual que antes de la tanda**.

**9.** En ese mismo panel, confirmá que sigue siendo **la única**: «Perfil hemodinámico» y
«Amiloidosis cardíaca» **no** tienen que estar. Incluir un sector no trae los otros doce.

**10.** Cerrá el panel, volvé a **🫀 Hemodinámica**, tocá **📎 Integrar al informe** de la
constricción otra vez —eso la **retira**— y reabrí **📋 Evidencia**.
→ La sección **tiene que desaparecer** de nuevo.

---

## C. Los textos: cada fuente en su propia oración (pasos 11 a 15)

**11.** Con la constricción todavía **retirada**, en **🫀 Hemodinámica** tocá el
**📎 Integrar al informe** del bloque «Perfil hemodinámico» y abrí **📋 Evidencia**.

**12.** En la sección «Perfil hemodinámico», leé la nota del bloque del Forrester.
→ Tiene que decir **«Esta aplicación marca hipoperfusión con un índice cardíaco de 2,2 o menos y
congestión cuando la presión capilar supera los 18 mmHg.»** y **nada** sobre que un número «cae de
un lado distinto» ni sobre que «del otro lado coincide».

**13.** En esa misma sección, tocá el **ⓘ** de la fila del índice cardíaco.
→ La tarjeta tiene que traer **cada fuente en su propia oración**, con **los folios 30, 2 y 162**
todavía presentes. Ningún «sale de la columna» ni «no publica».

**14.** Tocá el **ⓘ** de la fila de la resistencia vascular sistémica.
→ Tiene que arrancar por lo que la app hace —publicar el número sin banda— y seguir con **las dos
bandas**: **1.170 ± 270** con su **Tabla 11.2, folio 260**, y **1.100 con intervalo de 700 a
1.600** con su **Tabla 19-3, folio 375**. Ningún «los dos libros de referencia no coinciden».

**15.** Pestaña **📚 Referencias** → subpestaña **Congénitas** → ficha del **foramen oval**.
→ Cada guía tiene que estar por lo que **ella** escribe, con su folio, y **las 10 microburbujas de
Pristipino y las 20 del RESPECT siguen**. Ningún «las dos guías no coinciden».

---

## D. El papel y los anchos (pasos 16 a 18)

**16.** Con el perfil hemodinámico **integrado**, tocá **Generar informe** y confirmá la tarjeta de
revisión de severidades.
→ El informe y el EN SUMA **no** tienen que traer ni una clase, ni una tabla, ni un folio, ni el
nombre de una sección del panel. **El papel es idéntico al de antes de la tanda.**

**17.** Ventana a **1000 px**, después a **768** y después a **390**, con **📋 Evidencia** abierto.
→ En los cuatro anchos: **sin barra de desplazamiento horizontal** en el cuerpo de la página y
**sin texto cortado** en el panel.

**18.** Cambiá a **tema claro** y repetí los pasos 4, 12 y 14.
→ Lo mismo que en tema oscuro: ningún texto distinto y ninguna forma prohibida.
