# Guía de prueba manual — tanda PR9 (2026-11-25)

Dieciocho pasos. Lo que cada uno tiene que mostrar está medido; si no sale así, es un defecto.

---

## La tabla «Cálculos de strain» (TAREA 1)

1. **Abrí la pestaña de strain.** Debajo del bull's eye, la tabla de cálculos ocupa **una franja
   fina**: título, encabezado y tres filas en unos 85 px. Antes medía 350.

2. **Mirá una celda.** Un solo renglón: el nombre corto —«17 seg.», «Basal», «DA», «A. sparing»—,
   una raya donde todavía no hay valor, y los iconos al final de la misma línea. **No tiene que
   haber ningún texto de «Falta: …» dentro de la celda.**

3. **Pasá el mouse por encima del icono de calculadora apagado.** El cartel del navegador dice
   «Calcular — Falta: Anterior basal (1), Anteroseptal basal (2), Inferoseptal basal (3) y 14 más».
   Ese es ahora el único lugar donde vive la lista.

4. **Tocá un icono de calculadora apagado.** Tiene que aparecer el mismo texto como aviso corto.
   (Si no pasara nada, el botón volvió a llevar `disabled` y su cartel dejó de verse.)

5. **Mirá los iconos de cerca.** Calculadora, flecha hacia arriba y el círculo de información: los
   tres **finos, de un solo color, del tamaño de la letra**, sin recuadro ni fondo. **Ningún
   emoji.** Igual se tocan cómodo con el dedo: el área sensible es de 44 px aunque el dibujo mida 14.

6. **Tocá el ⓘ que está al lado del título.** Abre una tarjeta que dice que la tabla es de
   consulta y que cada cálculo necesita todos sus segmentos. Ese texto estaba antes en el cuerpo de
   la caja.

7. **Cargá los diecisiete segmentos.** Los iconos de calculadora se prenden y la caja **no crece**.

---

## El PDF «Tipo Word» (TAREA 2)

8. **Configuración → estilo de PDF → «Tipo Word».** Con un ETT normal —pocos datos—, exportá el
   PDF: tiene que salir en **una sola hoja A4**.

9. **Miralo de cerca.** Los datos numéricos, el texto del informe y el EN SUMA tienen que estar
   **todos en el mismo tamaño de letra**. Los títulos de sección, en negrita y del mismo tamaño.
   La ficha del paciente, la firma y el pie, más chicos pero iguales entre sí.

10. **Mirá el ventrículo izquierdo.** Entre «FEVI…» y «Masa idx…», y entre «Geometría…» y lo que
    sigue, la separación tiene que ser **la misma** que entre cualquier otro par de renglones de
    datos. Antes ahí se abría un hueco.

11. **Ahora un estudio largo** —ETE con varias válvulas y el score de Wilkins integrado al
    informe—. Tiene que pasar a una segunda hoja **sin dejar un título solo al pie** de la primera
    y con el **mismo tamaño de letra** en las dos.

12. **La hoja del score sale en color**, con su franja azul y su recuadro gris, y con su propia
    letra. **Es así a propósito en esta tanda**: la orden pide reportarlo y no rediseñarlo. Está
    anotado en `docs/PENDIENTES.md` → **PR9-b**.

---

## El recuadro del score de Wilkins (TAREA 3)

13. **En la hoja del score**, el recuadro gris de la salvedad y el título «Desglose por criterio»
    que viene abajo. El título tiene que empezar **por debajo** del borde del recuadro, con aire.
    Antes lo pisaba.

14. **Y «Puntaje total»** tiene que quedar separado de la franja azul de arriba, no pegado.

15. **Repetilo con los otros estilos** —Clásico, Moderno—: el arreglo alcanza a los nueve.

---

## El ingreso del SGL (TAREA 4)

16. **Prendé «Ingresar datos numéricos» y escribí −17 en un segmento.** Confirmá. Volvé a tocar
    **el mismo segmento**: la casilla se abre con «-17» adentro. **Tocá la casilla para poner el
    cursor al final y escribí 18.** El segundo dígito **no tiene que entrar**: queda «-17» y
    aparece un aviso. Así es como se había formado el −1718.
    Probá también **pegar** un número largo: tampoco entra.

17. **Cargá los diecisiete con estos valores** (basales 1 a 6: +5, −5, −12, −12, −12, −16; medios
    7 a 12: −12, −12, −14, −10, −9, −9; apicales 13 a 16: −16, −13, −17, −17; ápex: −18) y
    calculá las diez celdas. Tienen que dar:
    **17 seg. −11,7 · 16 seg. −11,3 · Basal −8,7 · Medio −11,0 · Apical −15,8 · DA −10,1 ·
    CD −13,0 · CX −12,6 · A. sparing 0,80.**
    ⚠️ **El +5 hay que escribirlo con su signo**: un valor sin signo se guarda **negativo**, que es
    la convención de la aplicación.
    El **Apical −15,8** es el que cambia: antes salía −15,7.

18. **El cartel de FEVI/SGL.** Con la FEVI cargada en la app (por ejemplo 50) y el campo «SGL
    global» vacío, el cartel del icono apagado tiene que decir
    **«Falta: SGL global. FEVI tomada de la app: 50 %.»** — y no mandarte a buscar una FEVI que ya
    está puesta. Cargá el SGL global a mano y calculá. Después **cambiá la FEVI en la app**: el
    resultado que ya estaba calculado **tiene que borrarse**.

---

## Si abrís un estudio guardado con el valor viejo

El segmento que tenía el −1718 se abre **en gris, como «Sin dato»**, con un aviso que lo dice.
Hay que volver a cargarlo. Los demás segmentos vuelven exactamente como estaban. El número
imposible **sigue en disco** hasta que guardes ese estudio otra vez: es la regla de esta casa de
no reescribir lo guardado (→ **PR9-d**).
