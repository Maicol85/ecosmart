# Guía de prueba — tanda PANT-31 (2026-11-10)

Para Maicol. Veintidós pasos. Cada uno dice **qué tocar** y **qué tiene que verse**; lo que está
entre paréntesis es lo que la sonda midió, para que una diferencia se note.

Antes de empezar: abrir `ecosmart/index.html` en Chrome, entrar, y en **⚙️ Config** tener cargados
el **centro** (su nombre) y el **médico principal** con su matrícula — el encabezado y la firma de
los documentos salen de ahí. Cargar un paciente con **nombre**, **cédula** y **sexo**.

---

## Parte A — la hoja de los documentos

**1 · El botón, en el rincón derecho.** Pestaña **📄 Informe**. El botón **«📄 Documentos ▾»**
tiene que estar **pegado al borde derecho** de su fila (la de «🔄 Regenerar Informe»), alineado por
la derecha con el botón **«📋 Evidencia»** de la fila de arriba. Los dos bordes derechos coinciden
al píxel (1405 px a 1440 de ventana).
⚠️ **No quedan a la misma ALTURA, y no pueden**: son dos filas distintas, 575 px de `y` las separan.
Si lo que querías era la misma altura, hay que mover el botón de fila y eso la orden lo prohibía.

**2 · En celular no tapa nada.** Angostar la ventana a ~390 px. La fila se parte en tres renglones
y el botón baja, **pegado a la derecha de su renglón**, sin montarse sobre ninguno de los otros
cuatro.

**3 · La hoja se ve COMPLETA.** Abrir **Documentos → Consentimiento: ETE con sedación**. El texto
tiene que estar **todo sobre el papel blanco**, de arriba a abajo. Antes se cortaba: el papel medía
783 px y el texto llegaba a 2.285, así que **1.502 px de texto salían del papel y quedaban sobre el
fondo oscuro**. Eso era el defecto.

**4 · Y se ve como va a salir impresa.** La hoja es una **A4 de verdad** (210 × 297 mm) con los
mismos márgenes del PDF, y la letra es la del papel: 10,2 pt en el ETE y en los otros dos
consentimientos, 10,5 en la constancia. Probar en 1440, 1280, 1000, 768 y 390 px de ventana:
**nunca** aparece una barra de desplazamiento horizontal y nunca se corta una línea.
⚠️ **A 390 px la hoja entra completa pero la letra queda chica** (6,3 px): la hoja se escala al
ancho disponible. No hay forma de que una línea entera de A4 sea legible y completa a la vez en un
celular — para leerla, el zoom del propio navegador funciona encima. Declarado en **P31-c**.

**5 · Editar con el teclado.** Hacer clic sobre un párrafo de la hoja y escribir. Tiene que entrar
el texto, y **Borrar** tiene que sacarlo. Probar también sobre una **viñeta** y sobre una de las
**casillas de dos columnas** del ETE.
⚠️ **Esto YA funcionaba antes de esta tanda**, medido con clic y teclado reales en los cinco anchos.
Si no te funcionaba, lo más probable es que estuvieras tocando la parte del texto que caía fuera del
papel blanco (paso 3), o la **imagen** guardada en «Imágenes», que es un PNG y no se edita.

**6 · Lo que NO se edita, y queda así.** El nombre de la institución, la línea de ciudad y fecha, la
de paciente, el bloque de firma, la tabla de firmas, el número de cada sección y los «☐ Sí ☐ No».
Es el 5-16 % del texto. Si querés poder corregir alguno, decilo: es una decisión tuya (**P31-a**).

**7 · Pegar.** Copiar un texto **con formato** de otro lado (negrita, color, una lista) y pegarlo en
un párrafo de la hoja. Tiene que entrar **sólo el texto**, sin negrita, sin color y sin viñetas, con
la raya larga convertida en guión y sin los cuadraditos ☐. Antes entraba con todo el formato del
origen.

**8 · Cerrar tocando afuera.** Con la hoja abierta y **sin** haber corregido nada, tocar el fondo
oscuro: cierra directo. Tocar **dentro** de la hoja: no cierra.

**9 · Y con correcciones, pregunta.** Corregir un párrafo a mano y tocar el fondo: aparece
**«¿Cerrar sin guardar los cambios?»** con **«Seguir editando»** y **«Cerrar»**. El foco arranca en
«Seguir editando». Probar las dos: «Seguir editando» deja la hoja como estaba, «Cerrar» la cierra.
**Escape sobre la pregunta** significa seguir editando.

**10 · La cruz y Escape cierran DIRECTO**, aunque haya correcciones. Es a propósito: son gestos
deliberados sobre un control, y el clic en el fondo es el que se hace sin querer. Si querés la
pregunta en los tres caminos, decilo (**P31-e**).

**11 · Guardar o imprimir apaga la pregunta.** Corregir, apretar **🖨️ Imprimir** (o **🖼️ Guardar en
Imágenes**), y después tocar el fondo: cierra sin preguntar, porque ya no hay nada que perder.

## Parte A — la constancia y el encabezado

**12 · La constancia, en tres oraciones.** Abrir **Documentos → Constancia**. «Se extiende la
presente para ser presentada donde corresponda.» y «Sin más, saluda atentamente.» tienen que estar
**cada una en su renglón**, con un espacio entre las dos. Antes iban corridas, a mitad de renglón.
Sigue siendo **una hoja** y la firma sigue igual de separada.

**13 · El logo, a la izquierda.** Cargar un logo en **Config → Logo del centro** y abrir cualquier
documento. El logo tiene que estar en el **rincón izquierdo** y el **nombre de la institución
centrado** en el ancho de la hoja, a la altura del logo.
⚠️ **Antes estaba al revés**: el nombre a la izquierda y el círculo con las iniciales a la derecha.
La orden decía «donde hoy sale el círculo (rincón izquierdo)», y el círculo estaba a la derecha; se
tomó el paréntesis. Si lo querías a la derecha, es un cambio de una línea (**P31-a**).

**14 · Un logo ancho y uno cuadrado, sin deformar.** Probar con un logo bien **ancho** (tipo
banner) y con uno **cuadrado**. En los dos casos tiene que conservar su proporción, sin estirarse.
Mirarlo en **pantalla**, en el **PDF** (🖨️ Imprimir) y en la **imagen guardada** (🖼️ Guardar en
Imágenes → Guardados → Imágenes guardadas).

**15 · Sin logo, el círculo.** Borrar el logo de Config: en su lugar aparece el **círculo con las
dos iniciales** del nombre del centro, en el mismo rincón izquierdo y del mismo alto.

## Parte A — los tres consentimientos

**16 · Las hojas.** Imprimir los cuatro y contar en el PDF: **constancia 1 hoja**; **cardioversión,
ETE y burbujas 3 cada uno** — sus **dos** hojas más la **hoja común**.

**17 · Dónde corta cada uno.** En el **ETE** y en el **test de burbujas** la hoja 2 arranca en
**«Antes del estudio»**; en la **cardioversión**, en **«¿Hay otras alternativas?»** (que no tiene
«Antes del estudio»). Los tres se leen con la **misma letra**: 10,2 pt. Antes la cardioversión y el
test de burbujas iban a 8,8 pt y entraban apretados en una hoja.

**18 · La declaración, con aire.** En la hoja 2: cada viñeta separada de la siguiente, y las dos
líneas de **«☐ Sí ☐ No»** —la del consentimiento para investigación y la de «capacitado para
recibir la información»— con espacio arriba, para poder marcarlas cómodo.
⚠️ **Y las dos tienen casillas DE VERDAD en el papel.** La segunda no las tenía: salían **dos huecos
en blanco** donde van los cuadraditos, porque la fuente del PDF no tiene ese carácter. Ahora se
dibujan.

**19 · La declaración y las firmas, juntas.** Nunca se separan en hojas distintas. Y la tabla de
firmas tiene que estar **despegada** del texto (6,8 mm) con la fila **«Firma» bien alta** (16 mm),
para firmar a mano.

**20 · Las hojas comunes, sin título.** La última hoja de cada consentimiento ya **no** dice «HOJAS
COMUNES A LOS CONSENTIMIENTOS». Quedan sus dos apartados con sus subtítulos («Niño o paciente
imposibilitado…» y «Derecho a no otorgar consentimiento…») y sigue entrando en **una** hoja.

## Parte B — la casilla de PPT de las prótesis

**21 · La casilla.** **🔬 Laboratorio → Mediciones → 🔧 Prótesis valvulares**. En la cabecera de la
sección, a la derecha, tiene que estar la casilla **«PPT»**, igual que en «Valvulopatías» y en las
demás: mismo tamaño, mismo lugar, y **sin marcar** de fábrica. Marcarla queda recordado al volver.

**22 · El mazo, con y sin.** Generar **📊 Presentación estadística** con la casilla **sin marcar**:
el mazo tiene que salir **igual que antes**, sin ninguna diapositiva de prótesis. Marcarla y generar
otra vez: aparece una diapositiva **«Prótesis valvulares»** justo después de Valvulopatías, con los
estudios con prótesis o reparación, los que tienen prótesis, los de plástica o TEER, el «con alguna
alteración», **dos gráficos** —posición · tipo y trastornos— y la tabla de los **modelos más
usados**.
⚠️ **El gráfico de posición · tipo NO sale apilado como en la pantalla**, y es una limitación
declarada: este mazo no sabe dibujar barras apiladas en ninguna de sus catorce hojas. Las
combinaciones salen como categorías («Aórtica · Mecánica», «Mitral · Plastia (rep.)») con el color
de su tipo. Ningún número se pierde. Está en **P31-b**.

---

## Lo que esta tanda NO tocó, y conviene saber

- **Las correcciones a mano de la hoja siguen sin guardarse** al recargar la página (**P30-a**). La
  pregunta del paso 9 avisa antes de cerrar, pero una recarga no pasa por ahí.
- **El defecto del cambio de pestaña** (`showTab` y el `window.event` global) queda como está, por
  orden expresa (**P30-d**).
- **El informe, su PDF, el PPT de un estudio y el Excel del Laboratorio están idénticos**,
  verificado con el A/B de superficies.
