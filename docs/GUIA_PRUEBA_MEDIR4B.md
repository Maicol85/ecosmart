# Guía de prueba — MEDIR-4b (para Safari)

Diez pasos cortos. Abrí `index.html` en **Safari** y entrá con tu sesión.
Lo que esta tanda tocó es **sólo el visor**: nada del informe, del PDF, del PPT ni del Excel
cambió, y ningún campo del informe se escribe solo.

---

**1 · Abrí un cineloop y poné Simpson.**
Pestaña Imágenes → abrí un cineloop de la **apical 4 cámaras** → «📏 Medir» → «Simpson».
A la derecha de la imagen tienen que aparecer **dos pasos**: `1 Diástole → 2 Sístole`, y debajo
el renglón **«Ventana de este par: A4C — se cambia abajo, antes de trazar»**.

**2 · Trazá la diástole y tocá «Listo».**
Mantené apretado desde un lado del anillo mitral hasta el otro. El botón **«Listo»** se prende.
Tocalo: el paso 1 queda con **✓** y el paso 2 pasa a ser el que está en curso (azul).
El renglón de la ventana ahora dice **«— ya no se cambia»**.

**3 · Trazá la sístole y tocá «Listo».**
Debajo de la imagen aparece el resultado **monoplanar**, con la tabla.

**4 · Rehacé una sola fase.**
Tocá el paso **«✓ 1 Diástole»**. Se borra **sólo** la diástole; la sístole sigue ahí y el paso 1
vuelve a ser el que está en curso. Volvé a trazarla y tocá «Listo»: el número vuelve al mismo.

**5 · Abrí la segunda vista con la apical 2 cámaras.**
Tocá **«➕ Vista»** y elegí el cineloop de la **2 cámaras**. Su panel tiene **su propia** barra de
dos pasos, y su renglón dice **«Ventana de este par: A2C»** — se reparte solo.

**6 · Trazá las dos fases en la vista B, con el «Listo» de la B.**
Tiene que confirmar **en la B** y no tocar lo que ya trazaste en la A.

**7 · Mirá el resultado integrado, abajo y al medio.**
**VFD, VFS y FEVI** en números grandes, con la palabra de la clasificación (normal, levemente
reducida…) y, si el estudio tiene peso y talla, el valor en **mL/m²** debajo de cada uno.
La tabla de abajo tiene **tres filas**: A4C, A2C y Biplano.

**8 · Abrí el globo ⓘ que está al lado del título «Simpson biplano».**
Ahí están **todas** las notas de método: que el biplano no es el promedio de las dos ventanas, el
eje largo, la escala de cada imagen, el ápex escorzado. Antes estaban en el panel; **no se borró
ninguna**, se mudaron.

**9 · Probá las dos ventanas iguales.**
En la vista B, tocá el selector **«A4C»** (el de abajo, al lado de «Ventana:»). El biplano
**desaparece** y en su lugar queda una línea: *«Las dos vistas están midiendo la misma ventana,
así que no hay biplano»*. En la tabla quedan **dos** monoplanares, distinguidas por su vista.
Volvé a **A2C** y el biplano vuelve con el mismo número.

**10 · Cerrá una vista.**
«✕ Cerrar vista» en una de las dos. Su trazado se descarta, el biplano desaparece y la que queda
**conserva su monoplanar**.

---

## Qué mirar con desconfianza

- Que el **«Listo»** de una vista confirme en la **otra**.
- Que el renglón de la ventana diga una apical y la fila de la tabla diga otra.
- Que la **FEVI** del biplano cambie sin que hayas vuelto a trazar nada.
- Que al cerrar una vista quede un botón que no responde.
- Que alguna de las notas de método **no esté** en el globo.

Si algo de eso pasa, anotá **qué paso** y **qué decía la pantalla**: con eso se reproduce.

## Lo que queda declarado y no es un defecto

- La vista que sobrevive al cerrar la otra **sigue diciendo «Vista B»** (decisión provisoria,
  `M4a-a`).
- Con las dos vistas abiertas y la ventana **por debajo de 1369 px**, las medidas bajan debajo de
  su imagen y el modal se desplaza (`M4a-b`).
- Una imagen fija elegida en «➕ Vista» **no** permite Simpson; una imagen de un solo cuadro
  abierta por otra puerta sí lo permite, como antes (`M4a-d`).
- El WebKit de Playwright **no es Safari**: por eso este archivo existe. Lo que la máquina midió
  fue en Chrome y en WebKit; **Safari lo probás vos**.
