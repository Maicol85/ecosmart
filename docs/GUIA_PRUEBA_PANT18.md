# Guía de prueba manual — tanda PANT-18 (la prótesis aórtica, parte 1 de 5)

Un dato por línea. El nombre de cada pestaña, sección y botón es el que la pantalla muestra.
Ventana a **1440 px de ancho** salvo donde se indique otra cosa.

---

**1.** Abrí la app y recargá. Al pie tiene que decir el sello **`v20261106-1452`**.

**2.** Pestaña **👤 Paciente**: Peso **70**, Talla **170**.

**3.** Pestaña **🔲 Válvulas**. Abrí la sección **Válvula Aórtica** (el encabezado con el
triángulo). Tocá la pastilla **Estenosis**.

**4.** En **Morfología VA** elegí **Prótesis mecánica**. Tiene que aparecer la fila con **AT (ms)**
y, **a su derecha y en la misma fila**, un campo nuevo **ET (ms) — tiempo de eyección, sólo
prótesis**.

**5.** Cargá: **Vmax 5**, **Ø TSVI 21**, **VTI TSVI 10**, **VTI Ao 45**, **AT 101**, **ET 300**.

**6.** En el cuadro de resultados, **debajo** de la línea del AT, tiene que verse una línea nueva
**AT/ET** con **`0.34 — posible estenosis (0,32–0,37)`** en amarillo.

**7.** La línea del **AT** tiene que decir **`101 ms — sugiere estenosis significativa (> 100 ms)`**
en rojo.

**8.** Debajo de las dos, la nota chica **NO** puede decir «único punto de corte» ni «no es
sospechosa». Tiene que terminar en **«… para describir el contorno del chorro (ASE 2024, hoja 18,
folio 19).»**

**9.** La tarjeta **⚖️ Severidad EA protésica (ASE 2024)** tiene que decir **«Sugiere estenosis
protésica significativa»** en rojo, con **tres líneas** debajo y un plegable **▶ ⓘ Ver detalle**
**cerrado**.

**10.** Abrí **ⓘ Ver detalle**: ahí tiene que estar el texto largo completo, incluida la frase del
área efectiva que empieza «El área efectiva no se evalúa…».

**11.** El botón **Severidad** de la estenosis aórtica tiene que verse **en rojo** y decir
**«Severidad ▼»**, sin el círculo amarillo.

**12.** Abrí el menú ▼ de ese botón: las opciones tienen que ser las de siempre y **no** tiene que
haber ningún grado elegido.

**13.** Generá el informe. En el cuerpo tiene que estar **«Válvula aórtica con prótesis mecánica,
con criterios que sugieren estenosis protésica significativa (…)»** y **NO** puede estar la línea
**«Desajuste protésico-paciente aórtico severo (…)»**.

**14.** En el **EN SUMA** tiene que estar **«Prótesis aórtica: criterios que sugieren estenosis
protésica significativa.»** y **NO** «PPM aórtico severo.».

**15.** En la pantalla, la fila **PPM — AEO indexada** tiene que seguir diciendo
**`0.42 cm²/m² (severo)`**: el número no se fue, lo que se fue es la oración del papel.

**16.** Cambiá **Vmax** a **3.5**, **G. medio** a **25** y **VTI TSVI** a **12**. La tarjeta pasa a
**«Posible estenosis protésica»** y el botón **Severidad** a naranja.

**17.** Generá el informe otra vez: ahora **SÍ** tiene que estar **«Desajuste protésico-paciente
aórtico severo (…)»**, y el EN SUMA **«PPM aórtico severo.»**.

**18.** Volvé a **Vmax 5** y **VTI TSVI 10**, y cambiá **Morfología VA** a **TAVI**. La tarjeta
**NO** puede decir «TAVI — sin graduar»: tiene que decir **«Sugiere estenosis protésica
significativa»**, igual que la mecánica.

**19.** Debajo, uno de los avisos tiene que decir **«Para TAVI la tabla expresa el gradiente medio,
el DVI y el área efectiva como cambio respecto de un estudio previo…»**.

**20.** Generá el informe: la TAVI tiene que emitir **la misma frase de severidad** que la
mecánica, y el EN SUMA **«Prótesis aórtica: criterios que sugieren estenosis protésica
significativa.»**.

**21.** Cambiá **Morfología VA** a **Trivalva normal**. La fila del **AT**, la del **AT/ET** y la
tarjeta protésica tienen que **desaparecer**, y el botón **Severidad** tiene que volver a decir
**«Severa ▼»**.

**22.** Pestaña **📚 Referencias** → subpestaña **🫀 Válvulas** → tarjeta **🔧 Válvulas
Protésicas** → ficha **🔵 Prótesis Aórtica**. Al final tiene que estar el bloque **«AT y AT/ET
(ASE 2024, Tabla 5, hoja 18 · folio 19)»** con los tres tramos de cada uno.

**23.** En esa misma ficha, las filas viejas de la tabla (**G. medio**, **Vmax**, **AVA**, **DVI**)
y las líneas de **Regurgitación paravalvular** y **PPM** tienen que seguir ahí.

**24.** Achicá la ventana a **390 px**. En Referencias, la ficha no puede tener barra de
desplazamiento horizontal **de la página**.

**25.** Volvé a **1440 px**. Pestaña **〰️ Doppler**: el campo **T. eyectivo (ms)** tiene que decir
**300** — es el mismo dato que el **ET** de Válvulas.

**26.** Cambialo a **280** ahí y volvé a **🔲 Válvulas**: el campo **ET** tiene que decir **280**, y
la línea **AT/ET** tiene que haberse recalculado.

**27.** Tocá **Nuevo estudio** y confirmá. Los dos campos tienen que quedar **vacíos** y la línea
del **AT/ET** en **—**.

**28.** Exportá el Excel: tiene que tener **441 columnas**, las mismas de siempre. **No** hay una
columna nueva de tiempo de eyección.
