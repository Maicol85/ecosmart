# P13 · TAREA 5 — sólo informe (nada de esto se aplicó)

Formato: **qué se encontró → qué afecta → cómo se corregiría**, con mi recomendación.

---

## 5a · La regla real de «➕ Vista»

**Qué se encontró.** Tu premisa es la que hay que corregir, y la regla no es la que creías. El
dueño es `_vElegirLoop`, y hace exactamente tres cosas:

1. pide **`_imgUuidActual`** —el uuid del estudio que la app tiene abierto— y si no hay, avisa
   «Guardá el estudio antes de abrir una segunda vista»;
2. lista **`CeiboCine.listar(uuid)`**, o sea lo que está **guardado en el disco bajo ESE estudio**:
   cineloops y, desde MEDIR-4a, también las imágenes fijas, descartando los documentos;
3. **no mira de dónde salió el cineloop que está en la primera vista.**

**La regla, en una línea:** «➕ Vista» ofrece **los archivos del estudio que la app tiene abierto y
guardado**, sea lo que sea lo que estés mirando en la primera vista.

**Por eso te dejó elegir con un cineloop de Vista previa:** ese cineloop no estaba guardado, pero
el estudio sí lo estaba y tenía archivos en disco. No hay ninguna contradicción: lo que el botón
exige es el **estudio**, no la imagen.

**Recomendación.** Dejarlo como está y cambiar el **texto** del aviso, que es lo que confunde: hoy
dice «los cineloops se listan por estudio» y debería decir «esta lista son los archivos guardados
de este estudio». Es una línea. Lo que costaría permitirlo sin estudio guardado está en **P11-f**:
una segunda fuente —los loops en memoria—, una miniatura sin `poster` y un camino de apertura
propio, 60 a 80 líneas más su caso.

---

## 5b · Simpson por discos: las rayitas que se salen del borde

**Qué se encontró, y es un diagnóstico y no una idea.** Las dos cosas que proponés parten de una
premisa falsa cada una:

- **«tomar automáticamente el punto más lejano» ya es lo que hace.** `_simpEje` recorre el contorno
  y se queda con el punto **más lejano** del punto medio del anillo mitral. Ese ES el ápex, y es el
  criterio estándar. No hay nada que cambiar ahí.
- **el eje no está torcido: lo que está mal es el DIBUJO.** `_simpDiametros` devuelve, por cada
  disco, la **longitud de la cuerda** (`hi - lo`) y **no dónde está**. Después `_medPintar` dibuja
  un segmento de esa longitud **centrado en el eje**. En un ventrículo asimétrico —que es el caso
  normal— la cuerda no está centrada en el eje, así que el segmento **se pasa de un borde y no
  llega al otro**. Es literalmente lo que ves.

**Qué afecta.** **Sólo el dibujo.** El volumen es correcto: la regla de Simpson usa la **longitud**
de la cuerda, que es lo que la función calcula bien. O sea que las rayitas mienten sobre un número
que está bien — que es la peor combinación posible, porque te invita a desconfiar de un valor
correcto o a corregir un eje que no está mal.

**Cómo se corregiría.** `_simpDiametros` devuelve hoy un número por disco; pasaría a devolver los
**dos cruces** (`lo` y `hi`) y `_medPintar` dibujaría de uno al otro. **Cero cálculos tocados**: el
volumen sigue usando `hi - lo`. Son unas quince líneas y un caso.

**Recomendación.** **Hacer eso, y nada más.** No mover el eje a mano: el ápex ya sale del criterio
estándar y un eje arrastrable cambia `L` **y cada uno de los veinte diámetros**, o sea que **cambia
el volumen y la FEVI** — eso es una decisión clínica y no la tomo yo.

**Lo de «ver diástole / ver sístole»:** el selector de fase **ya existe** y, desde el 1m de esta
tanda, el contorno confirmado de la fase que mirás **se ve**. Lo que falta es que el atajo
**salte al cuadro donde se trazó**: cada trazado tendría que guardar su número de cuadro y el
selector hacer un `cineIr`. Es barato y lo recomiendo.

---

## 5c · El strain con el visor de dos vistas

**Qué se encontró.** Hay un desajuste **estructural** y lo puedo nombrar, pero no sé cuál de las
dos cosas es la que te molestó, así que te lo pregunto al final.

- El SGL por territorios necesita **TRES** ventanas —A4C, A2C y A3C— y el visor tiene **DOS**
  vistas. La tercera obliga a cambiar de cineloop dentro de una vista, que es otro gesto.
- El **panel guía** del strain es **por vista** —vive al lado del canvas que estás trazando, por
  decisión del 2026-09-22— mientras el **resultado** es uno solo para las tres ventanas. Con dos
  vistas abiertas eso son dos paneles de guía y un resultado, y los dos paneles dicen cosas
  distintas a la vez.

**Qué afecta.** Sólo la pantalla: el cálculo cruza las tres ventanas por su propio registro.

**Cómo se corregiría.** Dos caminos y no son equivalentes: (1) un **panel único** de strain, como
el que Simpson ya tiene desde MEDIR-4 (`cine-simp-uni`), dejando en cada vista sólo la instrucción
del trazado; (2) un **selector de ventana** de tres posiciones que diga cuál falta, como el de
Simpson. El (1) es el que sigue el patrón que ya existe.

**Recomendación.** El (1), y **decime qué fue lo que viste mal** antes de que lo haga: «no queda
bien» puede ser el panel duplicado, el resultado lejos, o que la tercera ventana no se entienda, y
cada uno se arregla distinto.

---

## 5d · La unidad de velocidad automática

**Qué se encontró.** El cuadro de calibración **ya tiene las dos unidades** desde P10 (2.5): un
campo y un selector **m/s / cm/s**, con m/s por omisión. Lo que no hace es **preseleccionar** la
que corresponde.

**Lo que NO se puede derivar del archivo:** el DICOM declara la unidad del eje —y para una región
Doppler es **siempre cm/s**— así que la unidad del archivo no distingue un tisular de un flujo. O
sea que «según el tipo de imagen» no sale de la cabecera.

**Lo que SÍ se puede derivar, y es un hecho de la app:** la **estructura que estás midiendo**. Los
campos del informe ya traen su unidad: `e_sep` y `e_lat` son **cm/s** y `vmax_ao`, `vmax_it` y
`vp_vmax` son **m/s**. Con el destino armado, la unidad correcta está decidida sin inferir nada.

**Cómo se corregiría.** `_medCalPedirVel` preselecciona el selector según la unidad del campo
destino, cuando hay destino armado, y deja m/s cuando no hay. Las dos opciones quedan visibles.
Unas diez líneas.

**Recomendación.** Eso: **mostrar las dos con la que corresponde ya marcada**, que es tu segunda
opción y la que no inventa nada. Elegir por la magnitud del número —«si es menor que 25 es
tisular»— sería una inferencia clínica y la rechazo.

---

## 5e · La biblioteca: el contador de lugares y los encabezados

**Qué se encontró.** Los botones **2 / 4 / 6 / 8 / 10** los emite `imgRenderCountBtns` y lo que
hacen es fijar **cuántas casillas existe** (`imgSlots.length`). De ese largo cuelgan la fila de
miniaturas del Informe, la grilla del PDF y el renglón de la cuenta.

**Qué afecta.** Nada clínico. El riesgo es que **bajar** el número descarta casillas llenas, y hoy
eso lo gobierna ese control.

**Cómo se corregiría.** Un **«＋»** que agregue una casilla (`imgEnsureLen` con uno más) y, para
sacar, la ✕ de cada casilla —que ya existe y ya pregunta—. Los textos de los encabezados se
recortan en `imgRender` y en la cabecera de la tira: el de la tira son hoy **cinco oraciones**.

**Recomendación.** Hacerlo, y en este orden: primero el «＋» y la ✕ como única forma de sacar,
después el recorte de los textos. Es una función y su caso. **Bajo riesgo.**

---

## 5f · Las 41 ventanas nativas que quedan

Están censadas una por una, con su línea y su función, en **`docs/CENSO_DIALOGOS_P12.md`**.
Agrupadas, y en el orden en que yo las convertiría:

| # | Grupo | Cuántas | Seguras de convertir | Por qué ese orden |
|---|---|---|---|---|
| 1 | **Panel de equipos de CeiboLink** | 3 | **Sí, las tres** | Son las más fáciles de toda la lista: `clnkAccionEquipo` ya es `async`, y las tres son **destructivas**, así que `preguntaProp` con su rojo les calza exacto. Y son las que más se usan. |
| 2 | **Informes guardados y backup** | 9 | **Sí, las siete `confirm`** | Todas son «¿eliminar esto?» o «este PPT va a pesar N MB»: una pregunta de sí/no, que es justo el molde que ya existe. Dos de ellas borran TODO. |
| 3 | **Otros** (ETE, frases propias, amiloidosis, Excel) | 12 | **Sí, las nueve `confirm`** | Mismo molde. Las tres `alert` son avisos sin decisión y van con `avisoProp`. |
| 4 | **PDF** | 4 | **Sí, pero con cuidado** | Tres son «la biblioteca PDF está cargando» y una es «hay bloques editados a mano». El riesgo no es el cartel: es que **tres casos del suite** sustituyen `alert` para leer ese mensaje. |
| 5 | **Documentos del Informe** | 4 | **Sí** | Los cuatro son `alert` de error (almacenamiento lleno, nombre vacío, tamaño). |
| 6 | **Configuración — médicos, centros, logo y firma** | 12 | **Las últimas, y con una decisión** | Los cuatro `prompt` piden **texto libre** (nombre del centro, nombre, matrícula, especialidad) y `pedirProp` ya existe para eso desde P12 — pero son **datos del encabezado del informe firmado**, así que cualquier cambio ahí se ve en todo papel que salga. Van al final. |

**Recomendación.** Los grupos 1 y 2 en una tanda —son doce carteles y ningún texto clínico—, el 3
y el 5 en otra, y el 4 y el 6 al final, cada uno con su caso. **No las convertiría todas de una
vez**: cada `alert` que desaparece puede dejar colgado un caso que lo sustituía, y eso ya colgó la
batería dos veces (P8 y P12).

---

## 5g · Los dos textos

**«cm/s por píxel».** Aparece en dos lugares, los dos del panel guía: `_medEstado` —cuando la
escala la trae el archivo— y `_medCalVelFrase` —cuando la calibraste a mano, donde hoy dice
«Escala de velocidad fijada: … cm/s por píxel, con el cero en y=400»—.

- **Qué está mal:** «cm/s por píxel» es el **factor interno**, no algo que el médico pueda
  comprobar. Y «el cero en y=400» es una **fila de la imagen**, que no se ve en ninguna parte.
- **Cómo lo diría:** lo primero que se lee tiene que ser lo que **se puede verificar**: «Escala
  fijada: la marca de arriba = 100 cm/s y la de abajo = 0». El factor y la fila del cero quedan
  **detrás**, en letra chica, que es lo que permite auditar la medición — el mismo reparto que la
  calibración de distancia ya usa desde P5.

**El tamaño de la imagen ampliada en el PDF.** Hoy el texto dice «como AMPLIADA ocupa la franja
entera» y la pastilla de la grilla dice sólo **«AMPLIADA»**.

- **Qué está mal:** «la franja entera» no dice **cuánto** más grande, y «ampliada» suena a zoom
  sobre la imagen —que no es: la imagen es la misma, lo que cambia es el espacio que ocupa en la
  hoja—.
- **Cómo lo diría:** «**Ocupa el ancho entero de la hoja** (las demás van de dos en dos)», y la
  pastilla «**ANCHO ENTERO**».

**Recomendación.** Los dos cambios, en la misma tanda que el 5e. Son textos de pantalla: cero
riesgo clínico y cero efecto en el papel firmado.

---

## 5h · P9-a a P9-g, P10-c y P11-a a P11-g

| id | Qué es | Estado hoy | Mi recomendación |
|---|---|---|---|
| **P9-a** | Los cineloops que «desaparecen al guardar y reabrir» | **No se reprodujo.** TC-996 mide que el cineloop queda bajo el uuid, que el uuid no cambia al sobreescribir y que la tira lo redibuja sola. Lo que SÍ se encontró y se cerró es el camino silencioso: lo que falla al guardar vuelve a la cola y se avisa. | **Cerrarlo.** Si te vuelve a pasar, lo que hay que mirar es el aviso nuevo, no el cineloop. |
| **P9-b** | La burbuja que no aparece la primera vez | **No se reprodujo.** TC-1001 recorre el camino exacto y la burbuja aparece. El caso quedó como guarda. | **Cerrarlo.** |
| **P9-c** | «cable directo» revierte el reparo de EQ-b | **Hecho, por tu decisión.** La app sabe por qué interfaz entró, no si el cable va derecho al ecógrafo o a un switch con un router detrás. | **Dejarlo**, sabiendo que esa etiqueta puede mentir con un switch en el medio. |
| **P9-d** | El registro de lo ya adjuntado tiene tope (4.000) y es por navegador | **Abierto, y falla del lado seguro:** lo peor que pasa es que una imagen de hace meses se ofrezca como nueva. | **Dejarlo.** Subir el tope o compartirlo entre dispositivos exige un almacén nuevo. |
| **P9-e** | Lo que quedó sin hacer de P9 | **Informativo.** El 4.5 era auditoría por orden expresa. | **Cerrarlo.** |
| **P9-f** | Rutas que siguen abriendo un diálogo nativo | **Absorbido por el censo de P12** (`docs/CENSO_DIALOGOS_P12.md`) y por el 5f de arriba. | **Cerrarlo y seguir el orden del 5f.** |
| **P9-g** | El renglón de espacio mezcla el porcentaje del origen con los MB de las fijas | **Abierto.** «5 % · 1,7 MB usado» con 516 MB de contenido: los cineloops son el 99,7 % del espacio y **no entran en el número que se lee**. | **Arreglarlo pronto.** Es el número con el que decidís si borrás estudios, y hoy no dice lo que parece. Es la propuesta 4.2 de la auditoría. |
| **P10-c** | No hay guarda de duración del trazo del VTI | **Abierto, y es el único de esta lista que puede dar un número clínico equivocado:** si recorrés la envolvente de varios latidos, el VTI los suma y la banda (0,5–150 cm) admite **seis**. El único discriminador son los **ms** de la fila. | **Decidilo vos, y pronto.** Es un **corte clínico nuevo** —cuántos ms de ancho máximo acepta un latido— y por eso no lo puse yo. |
| **P11-a** | La imagen se amplía: revierte M3-c | **Hecho, por tu orden.** El precio es que una imagen más chica que la caja se ve interpolada. | **Dejarlo.** |
| **P11-b** | Dos casos adaptados por el truncado del clic sintético | **Cerrado.** Es del arnés, no del producto. | **Cerrarlo.** |
| **P11-c** | En tamaño Normal el modal sigue desplazándose mientras se mide | **Abierto, y esta tanda lo midió otra vez: 117 px a 1920.** Bajar la reserva lo arregla al precio de **achicar la imagen 100 px**. | **Decidilo vos.** Mi recomendación: dejarlo, porque desplazar es menos malo que una imagen más chica — y en pantalla completa ya es **cero**. |
| **P11-d** | Los rincones de la imagen son área de botón mientras se mide | **Abierto y declarado.** Son cuatro cuadrados de 44 px en las esquinas, donde la ecografía casi nunca lleva anatomía. | **Dejarlo.** Sacarlos afuera los desprende de la imagen, que es lo que no querías. |
| **P11-e** | El interruptor de la columna vive sobre la imagen | **Resuelto en esta tanda por el 1h:** ahora además se ve en tamaño Normal mientras la columna esté escondida, y salir de pantalla completa la devuelve. | **Cerrarlo.** |
| **P11-f** | «+ Vista» pide el estudio guardado | **Abierto**, y es el 5a de arriba. | **Dejarlo y arreglar el texto del aviso.** |
| **P11-g** | El «modo mínimo» ya estaba hecho | **Cerrado.** Y no choca con lo que P13 puso sobre la imagen: eso es navegación y tamaño, no medición. | **Cerrarlo.** |
