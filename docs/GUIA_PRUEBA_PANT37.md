# Guía de prueba — PANT-37, el «What if» de la estenosis aórtica

Diez pasos cortos, en orden. Datos de ejemplo, no de un paciente.

---

**1 · Cargá el caso discordante.**
Paciente: peso 70 kg, talla 170 cm. Doppler: Diám. TSVI **20 mm**, VTI TSVI **20 cm**, VTI
aórtico **78,5 cm**, Vmax aórtica **3,2 m/s**, G. medio **25 mmHg**, FC **65 lpm**, ET **300 ms**.
AI/VI: VDFVI **120 ml**, FEVI **45 %**.
En Válvulas, prendé la pastilla **«Estenosis»** de la aórtica.
→ El AVA por continuidad tiene que quedar en **0,80 cm²**.

**2 · Abrí «Válvulas en 2D»** con el botón del pie de Válvulas.
→ En la columna **Estenosis** aparece la tarjeta «Aórtica», y abajo a la derecha un botón
**«What if» PINTADO DE AZUL**, con su ⓘ al lado.

**3 · Tocá el ⓘ.**
→ Se abre «Cuándo aplica el What if», siete párrafos. Cerralo con un clic afuera.

**4 · Tocá «What if».**
→ Abre un panel **debajo de la tarjeta**, **a la derecha del dibujo** y sin taparlo. La primera
línea dice que la situación es **discordante**. Los deslizadores arrancan en **lo medido**: FEVI
45 % y 65 lpm.
→ **Nada del estudio cambió**: la tarjeta, la tabla de cavidades y los campos siguen igual.

**5 · Arrastralo del encabezado** (con el mouse y, si podés, con el dedo).
→ Se mueve, y tirándolo fuera de la pantalla **vuelve solo** adentro.

**6 · Pasá a «Volumen sistólico» y llevá el deslizador a 108 mL** (el doble de lo medido).
→ Flujo **180 → 360 mL/s**, Gradiente **25 → ~100 mmHg** (×4), Vmax **3,2 → 6,4 m/s** (×2), y el
**AVA no se mueve**. El ventrículo del dibujo late más fuerte y aparece el rótulo
**«Vmax 6,4 m/s»** con el chip «Dibujo según What if».
→ Empujá el deslizador al tope: **nunca pasa de 118 mL**, que es el VDF menos el margen.

**7 · Mové la frecuencia a 110 lpm.**
→ El latido del dibujo se acelera, el **flujo y el gradiente NO cambian** (el flujo es el de la
eyección), y la línea de lectura pasa de «~4,4 L/min» a «**~7,5 L/min a 110 lpm**».

**8 · Tocá «Área: Se abre con el flujo».**
→ Aparece el deslizador **«Apertura»** en 0,40, su nota en letra chica, la fila **«AVA a 250
mL/s»** y una **tercera gráfica**. Ahora el área sube a **1,52 cm²** y el gradiente **apenas** va
a ~28 mmHg — ésa es la firma de la pseudoestenosis.
→ Bajá la apertura a 0,05: la lectura se da vuelta y dice «**como en una estenosis verdadera**».

**9 · Tocá «Volver a lo medido».**
→ Todo vuelve al punto de partida, el área vuelve a **Fija** y la apertura a 0,40, y **el dibujo
vuelve a ser exactamente el real**.

**10 · Cerrá con la ✕ y apretá «Nuevo estudio».**
→ El panel se cierra en los dos casos y el dibujo queda sin simulación.
→ **Mirá el informe y el EN SUMA: no tienen ni una palabra del simulador.**

---

## Lo que conviene mirar de paso

- **Con la aórtica en prótesis o TAVI**: el botón sigue ahí, **no se pinta de azul**, y el panel
  dice «Con prótesis el What if no aplica.».
- **Borrá el gradiente medio y el VDFVI**: el botón deja de ser azul y el panel dice
  «Para simular, cargá: G. medio, Volumen latido (VSFVI o FEVI), VDFVI.», con los controles
  apagados.
- **Borrá el ET y la FC**: aparecen dos campos chicos rotulados **«supuesto»** (300 ms y 70 lpm).
  Lo que escribas ahí **no se guarda** y los campos del estudio siguen vacíos.
- **Con la Vmax en 4,5 y el gradiente en 55** (concordante): el botón **no** es azul, pero el panel
  **simula igual**.
- **En el celular**: el panel pasa a ocupar el ancho completo, debajo del dibujo, y no desborda.
