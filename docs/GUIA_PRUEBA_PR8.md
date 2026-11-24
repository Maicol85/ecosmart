# Guía de prueba manual — tanda PR8 (2026-11-24)

Para el médico, en Chrome, con `index.html` abierto. Veinte pasos. Lo que cada paso tiene que
mostrar está en **negrita**.

---

## Los cuadros (TAREA 1)

1. Cargá un estudio con datos de aorta, AI, VI, VD, Doppler mitral y aórtico, y una insuficiencia
   mitral con su vena contracta. Andá a **Informe** y tocá el botón de los cuatro cuadraditos.
   → **Se abre «Cuadros del informe» con los doce cuadros y, abajo, tres botones chicos: 🔢, 📋
   y 🫀.**

2. Pasá el mouse por el **🫀** sin tocarlo.
   → **Dice «Incluir el resumen de válvulas: un cuadro por válvula con sus alteraciones,
   velocidades y gradientes…».**

3. Tocá el **🫀**.
   → **El botón queda marcado y, debajo de los doce, aparece el título «RESUMEN DE VÁLVULAS» con
   tres cuadros nuevos — en el momento, sin generar el PDF.**

4. Mirá esos tres cuadros nuevos.
   → **No tienen la ✕ de quitar y no se pueden arrastrar: no son uno de los doce.**

5. Tocá **«Restablecer»**.
   → **El 🫀 se apaga y los tres cuadros del resumen desaparecen.**

6. Mantené apretado **en el medio** de un cuadro —no en el ⠿— y arrastralo **en diagonal** sobre
   otro, sin soltar.
   → **El cuadro que agarraste se aclara y el de abajo del puntero se marca con un contorno de
   color.**

7. Soltá.
   → **Los dos cuadros se intercambiaron de lugar. El que moviste se ve normal, sin quedar
   apagado.**

8. Volvé a arrastrar **el mismo** cuadro sobre el otro.
   → **Se intercambian otra vez y el orden vuelve a como estaba. Se puede repetir todas las
   veces.**

9. Hacé un **clic** simple sobre un cuadro, sin moverlo.
   → **No pasa nada: el orden no cambia.**

10. Tocá la **✕** de un cuadro.
    → **Lo saca del informe y lo manda a «Quitados del informe» con su nombre. No arrastra.**

11. Fijate en dos cuadros de **ancho distinto** (los de la última fila, cuando sobra uno) e
    intercambialos.
    → **Cada uno toma el ancho de su lugar nuevo: el ancho es de la POSICIÓN, no del cuadro.**

## El copiado (TAREA 2)

12. Tocá el **🔢** y pegá en Word.
    → **Los títulos de sección en negrita, DOPPLER en negrita y subrayado, una línea en blanco
    entre secciones, y cada renglón empezando en mayúscula.**

13. Mirá el bloque del **ventrículo izquierdo**.
    → **Va en tres grupos separados por una línea en blanco: (SIV … FEVI), (masa indexada y
    geometría) y (VDFVI indexado, volumen sistólico y VLI).**

14. Mirá la **válvula mitral** y la **PAP media**.
    → **«THP: … - TDE: … - TRIV: … - área: … (THP)» en un solo renglón, y la PAP media con su
    «mmHg». No aparece ningún renglón que diga «no corresponde» ni «no válido», y el THP no se
    repite en dos renglones.**

15. Tocá el **📋** y pegá en Word.
    → **«INFORME» y «EN SUMA:» en negrita y subrayados, y cada punto del EN SUMA con su viñeta.**

16. Pegá lo mismo en un campo de texto simple (el buscador del navegador, por ejemplo).
    → **Sale el texto sin formato, completo y sin errores.**

## El PDF Tipo Word (TAREA 2.4)

17. En **⚙️ Configuración → estilo del PDF**, elegí **«Tipo Word»** y generá el PDF.
    → **Arriba la ficha del paciente en pocos renglones, sin cuadros. Después los datos numéricos
    con el mismo contenido y el mismo orden que el 🔢. Después el informe y el EN SUMA, con cada
    punto con su viñeta. Todo en negro sobre blanco, sin un solo recuadro; el logo sólo si lo
    tenés cargado.**

18. Volvé a **«Clásico»** y generá el PDF.
    → **Sale exactamente como siempre, con sus cuadros y sus colores.**

## El SGL y la tabla (TAREAS 3 y 4)

19. Andá a **SGL**, abrí la sección y mirá el bull's eye.
    → **Los 17 segmentos arrancan en violeta, sin números y sin guiones.** Tocá un segmento ocho
    veces: **va cambiando de tramo hasta el azul y después queda gris («Sin dato»); el toque
    siguiente lo devuelve al violeta.** Tocá **«Limpiar»**: **todos vuelven al violeta.**

20. Tocá **«✏️ Ingresar datos numéricos»**.
    → **Aparece un guion en los segmentos sin número.** Tocá un segmento y escribí **8**:
    **queda en −8.** Tocá otro y escribí **+8**: **queda en «+8», del otro lado de la escala.**
    Tocá uno con número, borrá el número con Backspace y apretá Enter: **vuelve al violeta y sin
    número.** Apagá el botón y tocá un segmento **que tenga número**: **no cambia de color y sale
    un aviso que dice que hay que activar «Ingresar datos numéricos».**

21. Debajo del bull's eye, mirá la caja **«🧮 Cálculos de strain»**.
    → **Una tabla chica de cuatro columnas —Globales, Por nivel, Por territorio, Fórmulas— y tres
    filas. Los botones de la calculadora están apagados y cada celda dice qué segmento le falta.**

22. Cargá un número en los 17 segmentos y mirá la tabla otra vez.
    → **Los botones se prenden y desaparecen los avisos de «Falta:».** Tocá la calculadora de
    «Promedio 17 seg»: **sale el promedio con un decimal y coma.** Tocá la de «Apical sparing
    relativo»: **sale con dos decimales.**

23. Cambiá el número de un segmento que ese cálculo usó.
    → **El resultado de esa celda se borra; los de las otras celdas que no lo usan se quedan.**

24. Con el campo **«SGL global»** ya cargado, tocá la **flecha hacia arriba** de «Promedio 17 seg».
    → **Pregunta antes de reemplazar, diciendo el valor que hay y el que va a quedar. Si cancelás,
    el campo no cambia.**

25. Por último, generá el PDF y mirá el informe.
    → **Nada de la tabla de cálculos aparece ahí: es sólo de consulta.**

26. En ese mismo PDF, mirá el **EN SUMA**.
    - El rótulo **«EN SUMA:»** tiene que estar en **negrita y subrayado**, y cada ítem debajo con
      su **punto** adelante y en **letra normal**, igual que en el texto que copia el botón del
      informe. Si los ítems salen en negrita cursiva, volvió el defecto del segundo sello.
    - Cambiá el estilo a **«Clásico»** y generá otro PDF: ahí el EN SUMA sigue saliendo como
      siempre —negrita cursiva y sin puntos—, que es lo que esta tanda **no** tocó.
