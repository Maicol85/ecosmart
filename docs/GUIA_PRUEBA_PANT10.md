# Guía de prueba manual — tanda PANT-10 (2026-11-04)

Veintidós pasos, un dato por línea. Abrí `index.html` en Chrome. Donde no se diga otra cosa, la
ventana va en **1440 px** de ancho.

---

**1.** Pestaña **C. Congénitas** → sub-pestaña **CC complejas** → sección **Anomalía de Ebstein**.
Tocá el globo ⓘ del grupo **«Índice de Celermajer»**.
→ Tiene que decir **«50 neonatos»** y **«el índice calculado en 28»**, y **NO** la palabra
«sobreestima» ni «κ=0,39». Su bloque «Fuente» cita **«hoja 2, folio 1042»**.

**2.** En ese mismo globo, leé el bloque «A tener en cuenta».
→ Conserva los cuatro cortes —**I <0,5 · II 0,50-0,99 · III 1,00-1,49 · IV ≥1,5**— y el
**«5 pacientes de 5»** del grado IV.

**3.** Cerrá el globo con **Escape**, volvé a abrirlo y cerralo **tocando fuera**.
→ Las tres vías tienen que funcionar, y el cuerpo del cartel se ve en **11 px**.

**4.** Tocá el globo ⓘ del **párrafo inicial de Ebstein** (el de la barra de encabezado).
→ Dice **«1 cada 1000 nacidos vivos»** y **«0,8 cm/m²»**, y **NO** «menos del 1 % de las
cardiopatías congénitas».

**5.** Tocá el globo ⓘ de **«Saturación de O₂ en reposo (%)»** de Ebstein.
→ Dice que la saturación baja es condición del **cierre AISLADO** de la comunicación, y **NO**
que la cianosis sea un desencadenante de cirugía de la ESC 2020.

**6.** Sección **Síndrome de Eisenmenger**. Mirá la **franja roja** de arriba, a todo el ancho.
→ Tiene que seguir diciendo, palabra por palabra: **«Contraindicaciones absolutas — embarazo
(mortalidad materna >50 %) · corrección quirúrgica cardíaca del defecto · ejercicio extenuante.»**
Esa franja **no se tocó**: el número lo decide el médico.

**7.** Tocá el globo ⓘ de **«Saturación O₂ en reposo (%)»** de Eisenmenger.
→ Dice **«30 a 50 %»** y cita el **folio e209**; **NO** dice «>50 %» ni «prácticamente imposible».

**8.** Tocá el globo ⓘ de **«Síncope»**.
→ Dice que **ninguna de las dos guías lo nombra** en sus capítulos de Eisenmenger. Ya no dice
«marcador de mal pronóstico».

**9.** Tocá el globo ⓘ de **«Hemoptisis»**.
→ Dice que **suele autolimitarse** y que puede poner en riesgo la vida, y **NO** «episodio masivo
y fatal».

**10.** Sección **Ventana aortopulmonar**, globo ⓘ del título.
→ Queda **sólo la definición anatómica**, y el bloque «A tener en cuenta» explica que ninguna de
las dos guías trata esta lesión. **NO** dice «ESC 2020: cierre indicado siempre».

**11.** Sección **Defecto del septo auriculoventricular**, globo ⓘ de **«Tamaño del componente
ventricular (mm)»**.
→ Dice que **no es exclusivo del tipo completo** y describe el transicional con su comunicación
interventricular restrictiva.

**12.** Globo ⓘ de **«Síndrome de Down»** en esa misma sección.
→ Dice **«Más del 75 % de los defectos… completos»**, **sin** la palabra «del adulto».

**13.** Sección **Conexión venosa pulmonar anómala parcial**, globo ⓘ del título.
→ El bloque «A tener en cuenta» dice que la Tabla 4 de la ESC 2020 **contradice** la afirmación
anterior, y cita el **folio 575**.

**14.** Globo ⓘ de **«Qp/Qs estimado por eco»** en esa sección.
→ Atribuye la resonancia a la **ACC/AHA 2025** con su **folio e158**, y dice que la frase «el eco
subestima el shunt» se retiró.

**15.** Sección **Circulación de Fontan**, globo ⓘ de **«Saturación O₂ (%)»**.
→ Dice **«entre 90 y 95 %»** y que la declaración **no publica un valor para el paciente sin
fenestración**. Su «Fuente» aclara que Rychik es una **declaración científica**, no una guía.

---

**16.** Cargá el DSAV: **Tipo** «Completo», **Qp/Qs** `2.1`, **Resistencia vascular pulmonar**
`4.5`. Abrí el panel de **Evidencia** (botón «Evidencia» de la barra inferior).
→ Tiene que aparecer la sección **«Defecto del septo auriculoventricular»**, con su franja de
datos arriba y **13 preguntas** de tres estados **Sí | No | ?**.

**17.** En esa sección, mirá el bloque **«Las diferencias entre las dos guías, sin resolver»**.
→ Lista los **40 mm contra 45 mm**, el **«por debajo de 60 %» contra «60 % o menos»**, y la
diferencia **dentro** de la propia ACC/AHA entre su tabla y su texto de apoyo.

**18.** Contestá **«Sí»** a cualquier pregunta.
→ Al pie aparece **«Recomendaciones que aplican con lo contestado (1)»** con esa condición y su
guía. El contador de «Respuestas» de arriba pasa a **1 en Sí**.

**19.** Con el panel abierto, achicá la ventana a **768 px**.
→ Las preguntas pasan de **dos columnas a una**, sin barra horizontal y sin texto recortado. Los
botones **Sí | No | ?** siguen siendo tocables.

**20.** Volvé a **1440 px**, cerrá el panel y tocá **«Nuevo estudio»**. Volvé a abrir la Evidencia.
→ La sección del DSAV **ya no aparece**, y lo contestado se perdió: las respuestas **no viajan
con el estudio**, que es como está diseñado.

**21.** Cargá Ebstein con las cinco áreas (AD `30`, VD atrializado `14`, VD funcional `10`,
AI `18`, VI `20`), marcá **«Integrar al informe»** y generá el informe.
→ ⚠️ **El informe todavía publica «κ=0,39», «SOBREESTIMAR» y «ESC 2020»**, porque esa frase vive
en otro emisor y esta tanda **no la tocó**: está medida y reportada en `docs/PENDIENTES.md` →
**P10-a**. Es lo primero que el médico tiene que decidir.

**22.** Cargá Eisenmenger (**Lesión de base** «CIV», **Saturación en reposo** `84`) y abrí la
Evidencia.
→ Aparece **«Síndrome de Eisenmenger»** con **14 preguntas**. Su bloque de la ESC/ERS 2022 cita
el **folio 66** y publica el **bosentán en Clase I · Nivel B**. Y la Evidencia **no repite** la
franja roja de la pantalla.

**23.** Cargá Fontan (**Tipo** «Aurícula-pulmonar», **Saturación** `88`, **Clase NYHA** III) y abrí
la Evidencia.
→ La sección **«Circulación de Fontan»** aparece, pero **plegada**: se ve sólo su título. Tocá el
título y se abre con sus **14 preguntas**. No es un defecto de esta tanda: la regla que abre una
sección sola —un aviso, una fila que alcanza un criterio o una recomendación alcanzada— es
**preexistente** y con esa carga no se cumple. Medido: el cuerpo plegado tiene **3.077 px** de
contenido y está a un clic.

**24.** Cargá Eisenmenger (**Lesión de base** «CIV», **Saturación en reposo** `84`, **Síncope**
«Sí», **Hemoptisis** «Sí»), marcá **«Integrar al informe»** y generá el informe.
→ ⚠️ **El informe y el EN SUMA todavía publican «mortalidad materna >50 %», «marcador de mal
pronóstico» y «riesgo de episodio masivo y fatal»**, y el informe además **«(ESC 2020)»**. Son
las mismas frases que el commit 1 retiró de los globos: tienen una segunda copia en otro emisor y
esta tanda **no la tocó**. Medido e idéntico a HEAD, con las **dos redacciones propuestas** para
la franja, en `docs/PENDIENTES.md` → **P10-a**.
